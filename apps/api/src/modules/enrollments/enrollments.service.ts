import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CourseStatus } from '@dars/contracts';
import { EnrollmentsRepository } from './enrollments.repository';
import { CoursesRepository } from '../courses/courses.repository';
import { AppError } from '../../common/errors/app.error';

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly repo: EnrollmentsRepository,
    private readonly coursesRepo: CoursesRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async enroll(userId: string, courseId: string) {
    const course = await this.coursesRepo.findById(courseId);
    if (!course || course.status !== CourseStatus.PUBLISHED) {
      throw AppError.badRequest('Cannot enroll in a course that is not published');
    }

    const existing = await this.repo.findEnrollment(userId, courseId);
    if (existing) {
      throw AppError.conflict('You are already enrolled in this course');
    }

    const enrollment = await this.repo.createEnrollment(userId, courseId);

    this.eventEmitter.emit('enrollment.created', {
      userId,
      courseId,
      enrollmentId: enrollment.id,
    });

    return enrollment;
  }

  async unenroll(userId: string, courseId: string) {
    const existing = await this.repo.findEnrollment(userId, courseId);
    if (!existing) {
      throw AppError.notFound('Enrollment not found');
    }

    await this.repo.deleteEnrollment(userId, courseId);

    this.eventEmitter.emit('enrollment.dropped', {
      userId,
      courseId,
    });
  }

  async getMyEnrollments(userId: string) {
    return this.repo.findStudentEnrollments(userId);
  }

  async getCourseStudents(courseId: string, instructorId: string, isAdmin = false) {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) {
      throw AppError.notFound('Course not found');
    }
    if (!isAdmin && course.instructorId !== instructorId) {
      throw AppError.forbidden('Cannot view students of a course you do not own');
    }

    const enrollments = await this.repo.findCourseStudents(courseId);
    return enrollments.map((e) => ({
      id: e.id,
      studentId: e.user.id,
      name: e.user.name,
      email: e.user.email,
      progressPct: e.progressPct,
      status: e.status,
      enrolledAt: e.createdAt.toISOString(),
      completedAt: e.completedAt ? e.completedAt.toISOString() : null,
    }));
  }

  async isEnrolled(userId: string, courseId: string): Promise<boolean> {
    const e = await this.repo.findEnrollment(userId, courseId);
    return !!e && e.status === 'ACTIVE';
  }
}
