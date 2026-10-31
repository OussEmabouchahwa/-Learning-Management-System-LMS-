import { Injectable } from '@nestjs/common';
import { LessonType, Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class ContentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createModule(courseId: string, title: string, position?: number) {
    const pos =
      position ??
      (await this.prisma.module.count({ where: { courseId } })) + 1;

    return this.prisma.module.create({
      data: {
        courseId,
        title,
        position: pos,
      },
    });
  }

  async findModuleById(id: string) {
    return this.prisma.module.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, instructorId: true } },
        lessons: { orderBy: { position: 'asc' } },
      },
    });
  }

  async updateModule(id: string, data: Prisma.ModuleUpdateInput) {
    return this.prisma.module.update({
      where: { id },
      data,
    });
  }

  async deleteModule(id: string) {
    return this.prisma.module.delete({
      where: { id },
    });
  }

  async reorderModules(items: { id: string; position: number }[]) {
    return this.prisma.$transaction(
      items.map((item) =>
        this.prisma.module.update({
          where: { id: item.id },
          data: { position: item.position },
        }),
      ),
    );
  }

  async createLesson(moduleId: string, data: {
    title: string;
    slug: string;
    type: LessonType;
    content: string;
    videoUrl?: string | null;
    durationMin: number;
    required: boolean;
    position?: number;
  }) {
    const pos =
      data.position ??
      (await this.prisma.lesson.count({ where: { moduleId } })) + 1;

    return this.prisma.lesson.create({
      data: {
        moduleId,
        title: data.title,
        slug: data.slug,
        type: data.type,
        content: data.content,
        videoUrl: data.videoUrl,
        durationMin: data.durationMin,
        required: data.required,
        position: pos,
      },
    });
  }

  async findLessonById(id: string) {
    return this.prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                status: true,
                instructorId: true,
              },
            },
            lessons: {
              orderBy: { position: 'asc' },
              select: { id: true, position: true },
            },
          },
        },
      },
    });
  }

  async updateLesson(id: string, data: Prisma.LessonUpdateInput) {
    return this.prisma.lesson.update({
      where: { id },
      data,
    });
  }

  async deleteLesson(id: string) {
    return this.prisma.lesson.delete({
      where: { id },
    });
  }

  async reorderLessons(items: { id: string; position: number }[]) {
    return this.prisma.$transaction(
      items.map((item) =>
        this.prisma.lesson.update({
          where: { id: item.id },
          data: { position: item.position },
        }),
      ),
    );
  }

  async findLessonProgress(userId: string, lessonId: string) {
    return this.prisma.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });
  }

  async markLessonProgress(userId: string, lessonId: string, completed: boolean) {
    if (completed) {
      return this.prisma.lessonProgress.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        update: { completedAt: new Date() },
        create: { userId, lessonId },
      });
    } else {
      return this.prisma.lessonProgress.deleteMany({
        where: { userId, lessonId },
      });
    }
  }
}
