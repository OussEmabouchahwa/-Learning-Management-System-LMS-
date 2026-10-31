import { Injectable } from '@nestjs/common';
import { AdminOverview } from '@dars/contracts';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(): Promise<AdminOverview> {
    const [
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      publishedCourses,
      totalSubmissions,
      totalAttempts,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'STUDENT' } }),
      this.prisma.user.count({ where: { role: 'INSTRUCTOR' } }),
      this.prisma.course.count(),
      this.prisma.course.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.submission.count(),
      this.prisma.quizAttempt.count(),
    ]);

    return {
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      publishedCourses,
      totalSubmissions,
      totalAttempts,
    };
  }
}
