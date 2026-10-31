import { Injectable } from '@nestjs/common';
import { EnrollmentStatus, SubmissionStatus } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class ProgressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async calculateCourseProgress(userId: string, courseId: string) {
    const [requiredLessons, completedLessons, requiredQuizzes, passedQuizzes, requiredAssignments, submittedAssignments] =
      await Promise.all([
        this.prisma.lesson.count({
          where: { module: { courseId }, required: true },
        }),
        this.prisma.lessonProgress.count({
          where: { userId, lesson: { module: { courseId }, required: true } },
        }),
        this.prisma.quiz.count({
          where: { courseId, required: true },
        }),
        this.prisma.quizAttempt.count({
          where: { userId, quiz: { courseId, required: true }, passed: true },
        }),
        this.prisma.assignment.count({
          where: { courseId, required: true },
        }),
        this.prisma.submission.count({
          where: {
            userId,
            assignment: { courseId, required: true },
            status: { in: [SubmissionStatus.SUBMITTED, SubmissionStatus.LATE, SubmissionStatus.GRADED] },
          },
        }),
      ]);

    const totalRequired = requiredLessons + requiredQuizzes + requiredAssignments;
    const completedRequired = completedLessons + passedQuizzes + submittedAssignments;

    const progressPct =
      totalRequired > 0 ? Math.min(100, Math.round((completedRequired / totalRequired) * 100)) : 0;

    return {
      progressPct,
      isFullyCompleted: progressPct === 100,
    };
  }

  async updateEnrollmentProgress(
    userId: string,
    courseId: string,
    progressPct: number,
    isCompleted: boolean,
  ) {
    return this.prisma.enrollment.update({
      where: { userId_courseId: { userId, courseId } },
      data: {
        progressPct,
        ...(isCompleted
          ? {
              status: EnrollmentStatus.COMPLETED,
              completedAt: new Date(),
            }
          : {}),
      },
    });
  }

  async getDashboardAggregates(userId: string) {
    const [enrollments, submissions, upcomingAssignments, upcomingQuizzes] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: { userId, status: EnrollmentStatus.ACTIVE },
        orderBy: { updatedAt: 'desc' },
        include: {
          course: {
            include: {
              instructor: { select: { name: true } },
              modules: {
                orderBy: { position: 'asc' },
                include: {
                  lessons: {
                    orderBy: { position: 'asc' },
                    include: {
                      progress: { where: { userId } },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.submission.findMany({
        where: { userId },
        include: { assignment: true },
        orderBy: { submittedAt: 'desc' },
      }),
      this.prisma.assignment.findMany({
        where: {
          course: { enrollments: { some: { userId, status: EnrollmentStatus.ACTIVE } } },
          dueAt: { gte: new Date() },
        },
        include: { course: true },
        orderBy: { dueAt: 'asc' },
        take: 5,
      }),
      this.prisma.quiz.findMany({
        where: {
          course: { enrollments: { some: { userId, status: EnrollmentStatus.ACTIVE } } },
        },
        include: { course: true },
        take: 5,
      }),
    ]);

    return {
      enrollments,
      submissions,
      upcomingAssignments,
      upcomingQuizzes,
    };
  }
}
