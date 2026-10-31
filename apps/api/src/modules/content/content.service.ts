import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CourseStatus,
  CreateLessonInput,
  CreateModuleInput,
  LessonDetail,
  LessonType,
  ReorderItemsInput,
  Role,
  UpdateLessonInput,
  UpdateModuleInput,
} from '@dars/contracts';
import { ContentRepository } from './content.repository';
import { CoursesRepository } from '../courses/courses.repository';
import { EnrollmentsRepository } from '../enrollments/enrollments.repository';
import { AppError } from '../../common/errors/app.error';
import { canReadLesson } from './content.policy';
import { PolicyUser } from '../courses/course.policy';

@Injectable()
export class ContentService {
  constructor(
    private readonly repo: ContentRepository,
    private readonly coursesRepo: CoursesRepository,
    private readonly enrollmentsRepo: EnrollmentsRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createModule(courseId: string, input: CreateModuleInput, user: PolicyUser) {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) throw AppError.notFound('Course not found');
    this.assertInstructorOrAdmin(user, course.instructorId);

    return this.repo.createModule(courseId, input.title, input.position);
  }

  async updateModule(moduleId: string, input: UpdateModuleInput, user: PolicyUser) {
    const mod = await this.repo.findModuleById(moduleId);
    if (!mod) throw AppError.notFound('Module not found');
    this.assertInstructorOrAdmin(user, mod.course.instructorId);

    return this.repo.updateModule(moduleId, {
      title: input.title,
      position: input.position,
    });
  }

  async deleteModule(moduleId: string, user: PolicyUser) {
    const mod = await this.repo.findModuleById(moduleId);
    if (!mod) throw AppError.notFound('Module not found');
    this.assertInstructorOrAdmin(user, mod.course.instructorId);

    return this.repo.deleteModule(moduleId);
  }

  async reorderModules(courseId: string, input: ReorderItemsInput, user: PolicyUser) {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) throw AppError.notFound('Course not found');
    this.assertInstructorOrAdmin(user, course.instructorId);

    return this.repo.reorderModules(input.items);
  }

  async createLesson(moduleId: string, input: CreateLessonInput, user: PolicyUser) {
    const mod = await this.repo.findModuleById(moduleId);
    if (!mod) throw AppError.notFound('Module not found');
    this.assertInstructorOrAdmin(user, mod.course.instructorId);

    const slug = this.generateSlug(input.title);

    return this.repo.createLesson(moduleId, {
      title: input.title,
      slug,
      type: input.type as LessonType,
      content: input.content,
      videoUrl: input.videoUrl,
      durationMin: input.durationMin,
      required: input.required,
      position: input.position,
    });
  }

  async getLesson(lessonId: string, user: PolicyUser): Promise<LessonDetail> {
    const lesson = await this.repo.findLessonById(lessonId);
    if (!lesson) throw AppError.notFound('Lesson not found');

    const course = lesson.module.course;
    let enrollment = null;
    if (user.role === Role.STUDENT) {
      enrollment = await this.enrollmentsRepo.findEnrollment(user.id, course.id);
    }

    if (
      !canReadLesson(
        user,
        {
          id: course.id,
          instructorId: course.instructorId,
          status: course.status as CourseStatus,
        },
        enrollment,
      )
    ) {
      throw AppError.forbidden('You do not have access to view this lesson');
    }

    const progress = await this.repo.findLessonProgress(user.id, lessonId);

    // Compute previous and next lesson ids
    const siblingLessons = lesson.module.lessons;
    const currentIdx = siblingLessons.findIndex((l) => l.id === lesson.id);
    const prevLessonId = currentIdx > 0 ? siblingLessons[currentIdx - 1]?.id ?? null : null;
    const nextLessonId =
      currentIdx >= 0 && currentIdx < siblingLessons.length - 1
        ? siblingLessons[currentIdx + 1]?.id ?? null
        : null;

    return {
      id: lesson.id,
      moduleId: lesson.moduleId,
      courseId: course.id,
      title: lesson.title,
      slug: lesson.slug,
      type: lesson.type as LessonType,
      content: lesson.content,
      videoUrl: lesson.videoUrl,
      position: lesson.position,
      durationMin: lesson.durationMin,
      required: lesson.required,
      completed: !!progress,
      prevLessonId,
      nextLessonId,
      courseTitle: course.title,
      moduleTitle: lesson.module.title,
    };
  }

  async updateLesson(lessonId: string, input: UpdateLessonInput, user: PolicyUser) {
    const lesson = await this.repo.findLessonById(lessonId);
    if (!lesson) throw AppError.notFound('Lesson not found');
    this.assertInstructorOrAdmin(user, lesson.module.course.instructorId);

    return this.repo.updateLesson(lessonId, {
      title: input.title,
      type: input.type as LessonType | undefined,
      content: input.content,
      videoUrl: input.videoUrl,
      durationMin: input.durationMin,
      required: input.required,
      position: input.position,
    });
  }

  async deleteLesson(lessonId: string, user: PolicyUser) {
    const lesson = await this.repo.findLessonById(lessonId);
    if (!lesson) throw AppError.notFound('Lesson not found');
    this.assertInstructorOrAdmin(user, lesson.module.course.instructorId);

    return this.repo.deleteLesson(lessonId);
  }

  async reorderLessons(moduleId: string, input: ReorderItemsInput, user: PolicyUser) {
    const mod = await this.repo.findModuleById(moduleId);
    if (!mod) throw AppError.notFound('Module not found');
    this.assertInstructorOrAdmin(user, mod.course.instructorId);

    return this.repo.reorderLessons(input.items);
  }

  async updateLessonProgress(lessonId: string, completed: boolean, user: PolicyUser) {
    const lesson = await this.repo.findLessonById(lessonId);
    if (!lesson) throw AppError.notFound('Lesson not found');

    const courseId = lesson.module.course.id;
    const isEnrolled = await this.enrollmentsRepo.findEnrollment(user.id, courseId);
    if (!isEnrolled || isEnrolled.status !== 'ACTIVE') {
      throw AppError.badRequest('You must be enrolled to track lesson progress');
    }

    await this.repo.markLessonProgress(user.id, lessonId, completed);

    if (completed) {
      this.eventEmitter.emit('lesson.completed', {
        userId: user.id,
        courseId,
        lessonId,
      });
    }

    return { completed };
  }

  private assertInstructorOrAdmin(user: PolicyUser, instructorId: string): void {
    if (user.role === Role.ADMIN) return;
    if (user.role === Role.INSTRUCTOR && user.id === instructorId) return;
    throw AppError.forbidden('You do not have permission to modify this course content');
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
