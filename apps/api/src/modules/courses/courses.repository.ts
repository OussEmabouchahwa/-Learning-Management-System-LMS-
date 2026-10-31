import { Injectable } from '@nestjs/common';
import { CourseLevel, CourseStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class CoursesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(params: {
    page: number;
    limit: number;
    search?: string;
    level?: CourseLevel;
    status?: CourseStatus;
  }) {
    const where: Prisma.CourseWhereInput = {};
    if (params.status) {
      where.status = params.status;
    }
    if (params.level) {
      where.level = params.level;
    }
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.course.count({ where }),
      this.prisma.course.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          instructor: { select: { id: true, name: true } },
          modules: {
            include: {
              lessons: { select: { id: true, durationMin: true } },
            },
          },
          _count: {
            select: { enrollments: true },
          },
        },
      }),
    ]);

    return { total, items };
  }

  async findById(id: string) {
    return this.prisma.course.findUnique({
      where: { id },
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        modules: {
          orderBy: { position: 'asc' },
          include: {
            lessons: { orderBy: { position: 'asc' } },
          },
        },
        quizzes: {
          orderBy: { position: 'asc' },
          select: {
            id: true,
            title: true,
            timeLimitSec: true,
            maxAttempts: true,
            passPct: true,
            scoringPolicy: true,
            required: true,
            questions: { select: { id: true } },
          },
        },
        assignments: {
          orderBy: { position: 'asc' },
          select: {
            id: true,
            title: true,
            dueAt: true,
            maxPoints: true,
            allowLate: true,
            latePenaltyPct: true,
            required: true,
          },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.course.findUnique({
      where: { slug },
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        modules: {
          orderBy: { position: 'asc' },
          include: {
            lessons: { orderBy: { position: 'asc' } },
          },
        },
        quizzes: {
          orderBy: { position: 'asc' },
          select: {
            id: true,
            title: true,
            timeLimitSec: true,
            maxAttempts: true,
            passPct: true,
          },
        },
        assignments: {
          orderBy: { position: 'asc' },
          select: {
            id: true,
            title: true,
            dueAt: true,
            maxPoints: true,
          },
        },
      },
    });
  }

  async create(data: {
    title: string;
    slug: string;
    description: string;
    level: CourseLevel;
    instructorId: string;
  }) {
    return this.prisma.course.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        level: data.level,
        status: CourseStatus.DRAFT,
        instructorId: data.instructorId,
      },
      include: {
        instructor: { select: { id: true, name: true } },
      },
    });
  }

  async update(id: string, data: Prisma.CourseUpdateInput) {
    return this.prisma.course.update({
      where: { id },
      data,
      include: {
        instructor: { select: { id: true, name: true } },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.course.delete({
      where: { id },
    });
  }
}
