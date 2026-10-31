import { Injectable } from '@nestjs/common';
import { EnrollmentStatus } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class EnrollmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findEnrollment(userId: string, courseId: string) {
    return this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            instructorId: true,
          },
        },
      },
    });
  }

  async findStudentEnrollments(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId, status: EnrollmentStatus.ACTIVE },
      include: {
        course: {
          include: {
            instructor: { select: { id: true, name: true } },
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findCourseStudents(courseId: string) {
    return this.prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createEnrollment(userId: string, courseId: string) {
    return this.prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: EnrollmentStatus.ACTIVE,
        progressPct: 0,
      },
      include: {
        course: true,
      },
    });
  }

  async deleteEnrollment(userId: string, courseId: string) {
    return this.prisma.enrollment.delete({
      where: { userId_courseId: { userId, courseId } },
    });
  }
}
