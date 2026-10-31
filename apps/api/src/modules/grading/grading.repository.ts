import { Injectable } from '@nestjs/common';
import { Prisma, SubmissionStatus } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class GradingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findSubmissionForGrading(id: string) {
    return this.prisma.submission.findUnique({
      where: { id },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            maxPoints: true,
            dueAt: true,
            allowLate: true,
            latePenaltyPct: true,
            course: {
              select: {
                id: true,
                instructorId: true,
              },
            },
          },
        },
      },
    });
  }

  async updateGrade(
    id: string,
    data: {
      rawPoints: number;
      points: number;
      feedback?: string;
      gradedById: string;
    },
  ) {
    return this.prisma.submission.update({
      where: { id },
      data: {
        status: SubmissionStatus.GRADED,
        rawPoints: new Prisma.Decimal(data.rawPoints),
        points: new Prisma.Decimal(data.points),
        feedback: data.feedback,
        gradedById: data.gradedById,
        gradedAt: new Date(),
      },
      include: {
        assignment: { select: { courseId: true, title: true } },
      },
    });
  }

  async findCourseGradebookData(courseId: string) {
    const [assignments, quizzes, enrollments] = await Promise.all([
      this.prisma.assignment.findMany({
        where: { courseId },
        select: { id: true, title: true, maxPoints: true },
        orderBy: { position: 'asc' },
      }),
      this.prisma.quiz.findMany({
        where: { courseId },
        select: {
          id: true,
          title: true,
          questions: { select: { points: true } },
        },
        orderBy: { position: 'asc' },
      }),
      this.prisma.enrollment.findMany({
        where: { courseId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              submissions: {
                where: { assignment: { courseId } },
                select: {
                  assignmentId: true,
                  points: true,
                  status: true,
                  submittedAt: true,
                },
              },
              quizAttempts: {
                where: { quiz: { courseId } },
                select: {
                  quizId: true,
                  score: true,
                  status: true,
                  submittedAt: true,
                },
                orderBy: { score: 'desc' },
              },
            },
          },
        },
      }),
    ]);

    return { assignments, quizzes, enrollments };
  }

  async findStudentCourseGrades(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            assignments: {
              select: {
                id: true,
                title: true,
                maxPoints: true,
                submissions: {
                  where: { userId },
                  select: { points: true, status: true, feedback: true },
                },
              },
            },
            quizzes: {
              select: {
                id: true,
                title: true,
                attempts: {
                  where: { userId },
                  select: { score: true, status: true },
                  orderBy: { score: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });
  }
}
