import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CourseDetail,
  CourseLevel,
  CourseStatus,
  CourseSummary,
  CoursesListQuery,
  CreateCourseInput,
  PaginationMeta,
  Role,
  UpdateCourseInput,
} from '@dars/contracts';
import { CoursesRepository } from './courses.repository';
import { AuditService } from '../audit/audit.service';
import { AppError } from '../../common/errors/app.error';
import {
  canArchiveCourse,
  canDeleteCourse,
  canEditCourse,
  canPublishCourse,
  PolicyCourse,
  PolicyUser,
} from './course.policy';

@Injectable()
export class CoursesService {
  constructor(
    private readonly repo: CoursesRepository,
    private readonly audit: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async listCourses(
    query: CoursesListQuery,
    user?: PolicyUser,
  ): Promise<{ items: CourseSummary[]; meta: PaginationMeta }> {
    // If not instructor/admin, force published status
    const status =
      user && (user.role === Role.INSTRUCTOR || user.role === Role.ADMIN)
        ? (query.status as CourseStatus | undefined)
        : CourseStatus.PUBLISHED;

    const { total, items } = await this.repo.findMany({
      page: query.page,
      limit: query.limit,
      search: query.search,
      level: query.level as CourseLevel | undefined,
      status: status as CourseStatus | undefined,
    });

    const summaries: CourseSummary[] = items.map((c) => {
      let totalLessons = 0;
      let totalDurationMin = 0;
      for (const m of c.modules) {
        totalLessons += m.lessons.length;
        for (const l of m.lessons) {
          totalDurationMin += l.durationMin;
        }
      }

      return {
        id: c.id,
        slug: c.slug,
        title: c.title,
        description: c.description,
        level: c.level as CourseLevel,
        status: c.status as CourseStatus,
        instructorId: c.instructorId,
        instructorName: c.instructor.name,
        totalLessons,
        totalDurationMin,
        enrolledStudentsCount: c._count.enrollments,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      };
    });

    return {
      items: summaries,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  async getCourseBySlug(slug: string, _user?: PolicyUser): Promise<CourseDetail> {
    const course = await this.repo.findBySlug(slug);
    if (!course) {
      throw AppError.notFound('Course not found');
    }

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      level: course.level as CourseLevel,
      status: course.status as CourseStatus,
      instructorId: course.instructorId,
      instructorName: course.instructor.name,
      totalLessons: course.modules.reduce((acc, m) => acc + m.lessons.length, 0),
      totalDurationMin: course.modules.reduce(
        (acc, m) => acc + m.lessons.reduce((lAcc, l) => lAcc + l.durationMin, 0),
        0,
      ),
      enrolledStudentsCount: 0,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
      modules: course.modules.map((m) => ({
        id: m.id,
        title: m.title,
        position: m.position,
        lessons: m.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          slug: l.slug,
          position: l.position,
          durationMin: l.durationMin,
          required: l.required,
        })),
      })),
      quizzes: course.quizzes.map((q) => ({
        id: q.id,
        title: q.title,
        timeLimitSec: q.timeLimitSec,
        maxAttempts: q.maxAttempts,
        passPct: q.passPct,
      })),
      assignments: course.assignments.map((a) => ({
        id: a.id,
        title: a.title,
        dueAt: a.dueAt.toISOString(),
        maxPoints: a.maxPoints,
      })),
    };
  }

  async createCourse(input: CreateCourseInput, user: PolicyUser): Promise<CourseSummary> {
    const slug = this.generateSlug(input.title);
    const existing = await this.repo.findBySlug(slug);
    if (existing) {
      throw AppError.conflict('A course with a similar title already exists');
    }

    const created = await this.repo.create({
      title: input.title,
      slug,
      description: input.description,
      level: input.level as CourseLevel,
      instructorId: user.id,
    });

    return {
      id: created.id,
      slug: created.slug,
      title: created.title,
      description: created.description,
      level: created.level as CourseLevel,
      status: created.status as CourseStatus,
      instructorId: created.instructorId,
      instructorName: created.instructor.name,
      totalLessons: 0,
      totalDurationMin: 0,
      enrolledStudentsCount: 0,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }

  async updateCourse(
    id: string,
    input: UpdateCourseInput,
    user: PolicyUser,
  ): Promise<CourseSummary> {
    const course = await this.findCourseOrThrow(id);
    this.assertCanEdit(user, course);

    const updated = await this.repo.update(id, {
      title: input.title,
      description: input.description,
      level: input.level as CourseLevel | undefined,
      slug: input.slug,
    });

    return {
      id: updated.id,
      slug: updated.slug,
      title: updated.title,
      description: updated.description,
      level: updated.level as CourseLevel,
      status: updated.status as CourseStatus,
      instructorId: updated.instructorId,
      instructorName: updated.instructor.name,
      totalLessons: 0,
      totalDurationMin: 0,
      enrolledStudentsCount: 0,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async publishCourse(id: string, user: PolicyUser, requestId: string): Promise<CourseSummary> {
    const course = await this.findCourseOrThrow(id);
    if (!canPublishCourse(user, course)) {
      throw AppError.forbidden('You do not have permission to publish this course');
    }

    // Publish Checklist validation
    if (course.modules.length === 0) {
      throw AppError.badRequest('Publish checklist: Course must have at least one module');
    }
    for (const mod of course.modules) {
      if (mod.lessons.length === 0) {
        throw AppError.badRequest(
          `Publish checklist: Module "${mod.title}" has no lessons`,
        );
      }
    }
    for (const quiz of course.quizzes) {
      if (quiz.questions.length === 0) {
        throw AppError.badRequest(
          `Publish checklist: Quiz "${quiz.title}" has no questions`,
        );
      }
    }

    const updated = await this.repo.update(id, {
      status: CourseStatus.PUBLISHED,
    });

    await this.audit.log({
      actorId: user.id,
      action: 'course.publish',
      targetType: 'course',
      targetId: id,
      requestId,
    });

    this.eventEmitter.emit('course.published', { courseId: id, instructorId: course.instructorId });

    return {
      id: updated.id,
      slug: updated.slug,
      title: updated.title,
      description: updated.description,
      level: updated.level as CourseLevel,
      status: updated.status as CourseStatus,
      instructorId: updated.instructorId,
      instructorName: updated.instructor.name,
      totalLessons: 0,
      totalDurationMin: 0,
      enrolledStudentsCount: 0,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async archiveCourse(id: string, user: PolicyUser, requestId: string): Promise<CourseSummary> {
    const course = await this.findCourseOrThrow(id);
    if (!canArchiveCourse(user, course)) {
      throw AppError.forbidden('You do not have permission to archive this course');
    }

    const updated = await this.repo.update(id, {
      status: CourseStatus.ARCHIVED,
    });

    await this.audit.log({
      actorId: user.id,
      action: 'course.archive',
      targetType: 'course',
      targetId: id,
      requestId,
    });

    this.eventEmitter.emit('course.archived', { courseId: id });

    return {
      id: updated.id,
      slug: updated.slug,
      title: updated.title,
      description: updated.description,
      level: updated.level as CourseLevel,
      status: updated.status as CourseStatus,
      instructorId: updated.instructorId,
      instructorName: updated.instructor.name,
      totalLessons: 0,
      totalDurationMin: 0,
      enrolledStudentsCount: 0,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async deleteCourse(id: string, user: PolicyUser, requestId: string): Promise<void> {
    const course = await this.findCourseOrThrow(id);
    if (!canDeleteCourse(user, course)) {
      throw AppError.badRequest('Only draft courses can be deleted by their instructor');
    }

    await this.repo.delete(id);

    await this.audit.log({
      actorId: user.id,
      action: 'course.delete',
      targetType: 'course',
      targetId: id,
      requestId,
    });
  }

  private async findCourseOrThrow(id: string) {
    const course = await this.repo.findById(id);
    if (!course) {
      throw AppError.notFound('Course not found');
    }
    return {
      ...course,
      status: course.status as CourseStatus,
    };
  }

  private assertCanEdit(user: PolicyUser, course: PolicyCourse): void {
    if (!canEditCourse(user, course)) {
      throw AppError.forbidden('You do not have permission to modify this course');
    }
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
