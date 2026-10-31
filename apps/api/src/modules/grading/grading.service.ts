import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Gradebook,
  GradeSubmissionInput,
  StudentCourseGrade,
} from '@dars/contracts';
import { GradingRepository } from './grading.repository';
import { AuditService } from '../audit/audit.service';
import { AppError } from '../../common/errors/app.error';
import { PolicyUser } from '../courses/course.policy';
import { canGradeSubmission } from '../assessments/assessment.policy';

@Injectable()
export class GradingService {
  constructor(
    private readonly repo: GradingRepository,
    private readonly audit: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async gradeSubmission(
    submissionId: string,
    input: GradeSubmissionInput,
    user: PolicyUser,
    requestId: string,
  ) {
    const sub = await this.repo.findSubmissionForGrading(submissionId);
    if (!sub) throw AppError.notFound('Submission not found');

    const course = {
      id: sub.assignment.course.id,
      instructorId: sub.assignment.course.instructorId,
      status: 'PUBLISHED' as const,
    };

    if (!canGradeSubmission(user, course)) {
      throw AppError.forbidden('You do not have permission to grade this submission');
    }

    if (input.points > sub.assignment.maxPoints) {
      throw AppError.badRequest(
        `Grade cannot exceed max points (${sub.assignment.maxPoints})`,
      );
    }

    // Late penalty calculation
    const isLate = sub.status === 'LATE';
    let finalPoints = input.points;
    if (isLate && sub.assignment.latePenaltyPct > 0) {
      const deduction = (sub.assignment.maxPoints * sub.assignment.latePenaltyPct) / 100;
      finalPoints = Math.max(0, input.points - deduction);
    }

    const updated = await this.repo.updateGrade(submissionId, {
      rawPoints: input.points,
      points: finalPoints,
      feedback: input.feedback,
      gradedById: user.id,
    });

    await this.audit.log({
      actorId: user.id,
      action: 'submission.grade',
      targetType: 'submission',
      targetId: submissionId,
      metadata: {
        rawPoints: input.points,
        points: finalPoints,
        isLate,
        assignmentId: sub.assignment.id,
      },
      requestId,
    });

    this.eventEmitter.emit('submission.graded', {
      submissionId,
      assignmentId: sub.assignment.id,
      userId: sub.userId,
      courseId: sub.assignment.course.id,
      rawPoints: input.points,
      points: finalPoints,
    });

    return {
      id: updated.id,
      rawPoints: Number(updated.rawPoints),
      points: Number(updated.points),
      feedback: updated.feedback,
      status: updated.status,
      gradedAt: updated.gradedAt ? updated.gradedAt.toISOString() : null,
    };
  }

  async getGradebook(courseId: string, _user: PolicyUser): Promise<Gradebook> {
    const data = await this.repo.findCourseGradebookData(courseId);

    // Build items list
    const items = [
      ...data.assignments.map((a) => ({
        id: a.id,
        title: a.title,
        type: 'ASSIGNMENT' as const,
        maxPoints: a.maxPoints,
      })),
      ...data.quizzes.map((q) => {
        const totalQPoints = q.questions.reduce((sum, item) => sum + Number(item.points), 0) || 100;
        return {
          id: q.id,
          title: q.title,
          type: 'QUIZ' as const,
          maxPoints: totalQPoints,
        };
      }),
    ];

    // Build students rows
    const students = data.enrollments.map((e) => {
      const grades: Record<string, { score: number | null; status: string; submittedAt?: string | null }> = {};
      let totalEarnedPct = 0;
      let gradedItemsCount = 0;

      for (const a of data.assignments) {
        const sub = e.user.submissions.find((s) => s.assignmentId === a.id);
        const score = sub && sub.points !== null ? Number(sub.points) : null;
        grades[a.id] = {
          score,
          status: sub ? sub.status : 'NOT_SUBMITTED',
          submittedAt: sub ? sub.submittedAt.toISOString() : null,
        };
        if (score !== null) {
          totalEarnedPct += (score / a.maxPoints) * 100;
          gradedItemsCount++;
        }
      }

      for (const q of data.quizzes) {
        const attempt = e.user.quizAttempts.find((att) => att.quizId === q.id);
        const score = attempt && attempt.score !== null ? Number(attempt.score) : null;
        grades[q.id] = {
          score,
          status: attempt ? attempt.status : 'NOT_SUBMITTED',
          submittedAt: attempt && attempt.submittedAt ? attempt.submittedAt.toISOString() : null,
        };
        if (score !== null) {
          totalEarnedPct += score;
          gradedItemsCount++;
        }
      }

      const finalAveragePct = gradedItemsCount > 0 ? totalEarnedPct / gradedItemsCount : 0;

      return {
        studentId: e.user.id,
        studentName: e.user.name,
        studentEmail: e.user.email,
        grades,
        finalAveragePct: Math.round(finalAveragePct * 10) / 10,
      };
    });

    return {
      courseId,
      courseTitle: '',
      items,
      students,
    };
  }

  async getStudentGrades(userId: string): Promise<StudentCourseGrade[]> {
    const enrollments = await this.repo.findStudentCourseGrades(userId);

    return enrollments.map((e) => {
      const items = [
        ...e.course.assignments.map((a) => {
          const sub = a.submissions[0];
          return {
            id: a.id,
            title: a.title,
            type: 'ASSIGNMENT' as const,
            score: sub && sub.points !== null ? Number(sub.points) : null,
            maxPoints: a.maxPoints,
            status: sub ? sub.status : 'NOT_SUBMITTED',
            feedback: sub?.feedback ?? null,
          };
        }),
        ...e.course.quizzes.map((q) => {
          const attempt = q.attempts[0];
          return {
            id: q.id,
            title: q.title,
            type: 'QUIZ' as const,
            score: attempt && attempt.score !== null ? Number(attempt.score) : null,
            maxPoints: 100,
            status: attempt ? attempt.status : 'NOT_SUBMITTED',
            feedback: null,
          };
        }),
      ];

      const scoredItems = items.filter((i) => i.score !== null);
      const avgScore =
        scoredItems.length > 0
          ? scoredItems.reduce((acc, i) => acc + (i.score! / i.maxPoints) * 100, 0) /
            scoredItems.length
          : 0;

      return {
        courseId: e.course.id,
        courseTitle: e.course.title,
        averageScorePct: Math.round(avgScore * 10) / 10,
        items,
      };
    });
  }
}
