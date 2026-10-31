import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CreateAssignmentInput,
  CreateQuizInput,
  CreateQuizQuestion,
  QuestionType,
  QuizAttemptDetail,
  QuizAttemptStatus,
  Role,
  ScoringPolicy,
  SubmissionDetail,
  SubmissionStatus,
  SubmissionType,
  SubmitAssignmentInput,
  UpdateAssignmentInput,
  UpdateQuizInput,
} from '@dars/contracts';
import { AssessmentsRepository } from './assessments.repository';
import { EnrollmentsRepository } from '../enrollments/enrollments.repository';
import { CoursesRepository } from '../courses/courses.repository';
import { AppError } from '../../common/errors/app.error';
import { PolicyUser } from '../courses/course.policy';
import { canReadSubmission } from './assessment.policy';

@Injectable()
export class AssessmentsService {
  constructor(
    private readonly repo: AssessmentsRepository,
    private readonly enrollmentsRepo: EnrollmentsRepository,
    private readonly coursesRepo: CoursesRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createQuiz(courseId: string, input: CreateQuizInput, user: PolicyUser) {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) throw AppError.notFound('Course not found');
    this.assertInstructorOrAdmin(user, course.instructorId);

    return this.repo.createQuiz(courseId, {
      title: input.title,
      description: input.description,
      timeLimitSec: input.timeLimitSec,
      maxAttempts: input.maxAttempts,
      passPct: input.passPct,
      scoringPolicy: input.scoringPolicy as ScoringPolicy,
      required: input.required,
      position: input.position,
    });
  }

  async updateQuiz(quizId: string, input: UpdateQuizInput, user: PolicyUser) {
    const quiz = await this.repo.findQuizById(quizId);
    if (!quiz) throw AppError.notFound('Quiz not found');
    this.assertInstructorOrAdmin(user, quiz.course.instructorId);

    return this.repo.updateQuiz(quizId, {
      title: input.title,
      description: input.description,
      timeLimitSec: input.timeLimitSec,
      maxAttempts: input.maxAttempts,
      passPct: input.passPct,
      scoringPolicy: input.scoringPolicy as ScoringPolicy | undefined,
      required: input.required,
      position: input.position,
    });
  }

  async createQuestion(quizId: string, input: CreateQuizQuestion, user: PolicyUser) {
    const quiz = await this.repo.findQuizById(quizId);
    if (!quiz) throw AppError.notFound('Quiz not found');
    this.assertInstructorOrAdmin(user, quiz.course.instructorId);

    return this.repo.createQuestion(quizId, {
      prompt: input.prompt,
      type: input.type as QuestionType,
      points: input.points,
      explanation: input.explanation,
      position: input.position,
      options: input.options,
    });
  }

  async startAttempt(quizId: string, user: PolicyUser): Promise<QuizAttemptDetail> {
    const quiz = await this.repo.findQuizById(quizId);
    if (!quiz) throw AppError.notFound('Quiz not found');

    const enrollment = await this.enrollmentsRepo.findEnrollment(user.id, quiz.courseId);
    if (!enrollment || enrollment.status !== 'ACTIVE') {
      throw AppError.forbidden('You must be enrolled to take this quiz');
    }

    // Return existing in-progress attempt if available
    const active = await this.repo.findActiveAttempt(user.id, quizId);
    if (active) {
      return this.formatAttemptDetail(active.id, user);
    }

    const attemptsCount = await this.repo.countUserAttempts(user.id, quizId);
    if (attemptsCount >= quiz.maxAttempts) {
      throw AppError.badRequest(
        `Attempt limit reached. You have completed ${attemptsCount} of ${quiz.maxAttempts} attempts.`,
      );
    }

    // Server-authoritative deadline: startedAt + timeLimit + 5s grace
    const startedAt = new Date();
    const deadline = new Date(startedAt.getTime() + quiz.timeLimitSec * 1000 + 5000);
    const shuffleSeed = Math.floor(Math.random() * 10000) + 1;

    const created = await this.repo.createAttempt({
      quizId,
      userId: user.id,
      deadline,
      shuffleSeed,
    });

    return this.formatAttemptDetail(created.id, user);
  }

  async saveAnswers(
    attemptId: string,
    answers: Record<string, string[]>,
    user: PolicyUser,
  ): Promise<{ savedAt: string }> {
    const attempt = await this.repo.findAttemptById(attemptId);
    if (!attempt || attempt.userId !== user.id) {
      throw AppError.notFound('Quiz attempt not found');
    }

    if (attempt.status !== QuizAttemptStatus.IN_PROGRESS) {
      throw AppError.badRequest('Attempt is not in progress');
    }

    if (new Date() > attempt.deadline) {
      throw AppError.badRequest('Quiz attempt time expired');
    }

    await this.repo.saveAttemptAnswers(attemptId, answers);
    return { savedAt: new Date().toISOString() };
  }

  async submitAttempt(attemptId: string, user: PolicyUser): Promise<QuizAttemptDetail> {
    const attempt = await this.repo.findAttemptById(attemptId);
    if (!attempt || attempt.userId !== user.id) {
      throw AppError.notFound('Quiz attempt not found');
    }

    // Idempotent: if already submitted, return current results
    if (attempt.status === QuizAttemptStatus.SUBMITTED || attempt.status === QuizAttemptStatus.EXPIRED) {
      return this.formatAttemptDetail(attemptId, user);
    }

    const isExpired = new Date() > attempt.deadline;
    const status = isExpired ? QuizAttemptStatus.EXPIRED : QuizAttemptStatus.SUBMITTED;

    // Auto-grade
    let totalPoints = 0;
    let earnedPoints = 0;
    const answersWithResults = [];

    const answersMap = new Map(attempt.answers.map((a) => [a.questionId, a.selectedOptionIds]));

    for (const q of attempt.quiz.questions) {
      const qPoints = Number(q.points);
      totalPoints += qPoints;

      const userSelected = answersMap.get(q.id) || [];
      const correctOptionIds = q.options.filter((o) => o.isCorrect).map((o) => o.id);

      const isMatch =
        correctOptionIds.length === userSelected.length &&
        correctOptionIds.every((id) => userSelected.includes(id));

      const qEarned = isMatch ? qPoints : 0;
      earnedPoints += qEarned;

      answersWithResults.push({
        questionId: q.id,
        isCorrect: isMatch,
        earnedPoints: qEarned,
      });
    }

    const scorePct = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = scorePct >= attempt.quiz.passPct;

    await this.repo.finalizeAttempt(attemptId, {
      status,
      score: scorePct,
      passed,
      submittedAt: new Date(),
      answersWithResults,
    });

    this.eventEmitter.emit('quiz.graded', {
      quizId: attempt.quizId,
      attemptId,
      userId: attempt.userId,
      courseId: attempt.quiz.courseId,
      score: scorePct,
      passed,
    });

    return this.formatAttemptDetail(attemptId, user);
  }

  async getAttempt(attemptId: string, user: PolicyUser): Promise<QuizAttemptDetail> {
    const attempt = await this.repo.findAttemptById(attemptId);
    if (!attempt) throw AppError.notFound('Quiz attempt not found');

    const isInstructor =
      (user.role === Role.INSTRUCTOR && attempt.quiz.course.instructorId === user.id) ||
      user.role === Role.ADMIN;

    if (!isInstructor && attempt.userId !== user.id) {
      // Return 404 for resources caller must not know exist (Security test 1)
      throw AppError.notFound('Quiz attempt not found');
    }

    return this.formatAttemptDetail(attemptId, user);
  }

  private async formatAttemptDetail(attemptId: string, user: PolicyUser): Promise<QuizAttemptDetail> {
    const attempt = await this.repo.findAttemptById(attemptId);
    if (!attempt) throw AppError.notFound('Quiz attempt not found');

    const isInProgress = attempt.status === QuizAttemptStatus.IN_PROGRESS;
    const isOwner = attempt.userId === user.id;

    // Security Rule 8 & Test 7: NEVER send isCorrect or explanations while attempt is in progress!
    const hideAnswers = isInProgress && isOwner;

    const savedAnswers: Record<string, string[]> = {};
    for (const ans of attempt.answers) {
      savedAnswers[ans.questionId] = ans.selectedOptionIds;
    }

    const questions = attempt.quiz.questions.map((q) => {
      // Seeded shuffle options
      const shuffledOptions = [...q.options].sort((a, b) => {
        const hashA = (a.id.charCodeAt(0) + attempt.shuffleSeed) % 17;
        const hashB = (b.id.charCodeAt(0) + attempt.shuffleSeed) % 17;
        return hashA - hashB;
      });

      return {
        id: q.id,
        prompt: q.prompt,
        type: q.type as QuestionType,
        points: Number(q.points),
        position: q.position,
        explanation: hideAnswers ? undefined : q.explanation ?? undefined,
        options: shuffledOptions.map((o) => ({
          id: o.id,
          text: o.text,
          position: o.position,
          isCorrect: hideAnswers ? undefined : o.isCorrect,
        })),
      };
    });

    return {
      id: attempt.id,
      quizId: attempt.quizId,
      quizTitle: attempt.quiz.title,
      timeLimitSec: attempt.quiz.timeLimitSec,
      status: attempt.status as QuizAttemptStatus,
      startedAt: attempt.startedAt.toISOString(),
      deadline: attempt.deadline.toISOString(),
      submittedAt: attempt.submittedAt ? attempt.submittedAt.toISOString() : null,
      score: attempt.score ? Number(attempt.score) : null,
      passed: attempt.passed,
      questions,
      savedAnswers,
    };
  }

  async createAssignment(courseId: string, input: CreateAssignmentInput, user: PolicyUser) {
    const course = await this.coursesRepo.findById(courseId);
    if (!course) throw AppError.notFound('Course not found');
    this.assertInstructorOrAdmin(user, course.instructorId);

    return this.repo.createAssignment(courseId, {
      title: input.title,
      description: input.description,
      dueAt: new Date(input.dueAt),
      maxPoints: input.maxPoints,
      allowLate: input.allowLate,
      latePenaltyPct: input.latePenaltyPct,
      submissionType: input.submissionType as SubmissionType,
      required: input.required,
      position: input.position,
    });
  }

  async updateAssignment(assignmentId: string, input: UpdateAssignmentInput, user: PolicyUser) {
    const assignment = await this.repo.findAssignmentById(assignmentId);
    if (!assignment) throw AppError.notFound('Assignment not found');
    this.assertInstructorOrAdmin(user, assignment.course.instructorId);

    return this.repo.updateAssignment(assignmentId, {
      title: input.title,
      description: input.description,
      dueAt: input.dueAt ? new Date(input.dueAt) : undefined,
      maxPoints: input.maxPoints,
      allowLate: input.allowLate,
      latePenaltyPct: input.latePenaltyPct,
      submissionType: input.submissionType as SubmissionType | undefined,
      required: input.required,
      position: input.position,
    });
  }

  async submitAssignment(
    assignmentId: string,
    input: SubmitAssignmentInput,
    user: PolicyUser,
  ): Promise<SubmissionDetail> {
    const assignment = await this.repo.findAssignmentById(assignmentId);
    if (!assignment) throw AppError.notFound('Assignment not found');

    const enrollment = await this.enrollmentsRepo.findEnrollment(user.id, assignment.courseId);
    if (!enrollment || enrollment.status !== 'ACTIVE') {
      throw AppError.forbidden('You must be enrolled to submit this assignment');
    }

    const isLate = new Date() > assignment.dueAt;
    if (isLate && !assignment.allowLate) {
      throw AppError.badRequest('Late submissions are not accepted for this assignment');
    }

    const status = isLate ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED;

    const sub = await this.repo.upsertSubmission({
      assignmentId,
      userId: user.id,
      status,
      content: input.content,
      fileKey: input.fileKey,
      fileName: input.fileName,
      fileSizeBytes: input.fileSizeBytes,
    });

    this.eventEmitter.emit('submission.submitted', {
      submissionId: sub.id,
      assignmentId,
      userId: user.id,
      courseId: assignment.courseId,
      isLate,
    });

    return {
      id: sub.id,
      assignmentId: sub.assignmentId,
      assignmentTitle: assignment.title,
      userId: sub.userId,
      studentName: user.id,
      status: sub.status as SubmissionStatus,
      content: sub.content,
      fileKey: sub.fileKey,
      fileName: sub.fileName,
      fileSizeBytes: sub.fileSizeBytes,
      submittedAt: sub.submittedAt.toISOString(),
      rawPoints: sub.rawPoints ? Number(sub.rawPoints) : null,
      points: sub.points ? Number(sub.points) : null,
      feedback: sub.feedback,
      gradedAt: sub.gradedAt ? sub.gradedAt.toISOString() : null,
    };
  }

  async getSubmission(submissionId: string, user: PolicyUser): Promise<SubmissionDetail> {
    const sub = await this.repo.findSubmissionById(submissionId);
    if (!sub) throw AppError.notFound('Submission not found');

    const course = {
      id: sub.assignment.course.id,
      instructorId: sub.assignment.course.instructorId,
      status: 'PUBLISHED' as const,
    };

    if (!canReadSubmission(user, { userId: sub.userId }, course)) {
      // 404 for IDOR
      throw AppError.notFound('Submission not found');
    }

    return {
      id: sub.id,
      assignmentId: sub.assignmentId,
      assignmentTitle: sub.assignment.title,
      userId: sub.userId,
      studentName: sub.user.name,
      status: sub.status as SubmissionStatus,
      content: sub.content,
      fileKey: sub.fileKey,
      fileName: sub.fileName,
      fileSizeBytes: sub.fileSizeBytes,
      submittedAt: sub.submittedAt.toISOString(),
      rawPoints: sub.rawPoints ? Number(sub.rawPoints) : null,
      points: sub.points ? Number(sub.points) : null,
      feedback: sub.feedback,
      gradedAt: sub.gradedAt ? sub.gradedAt.toISOString() : null,
    };
  }

  async listAssignmentSubmissions(assignmentId: string, user: PolicyUser) {
    const assignment = await this.repo.findAssignmentById(assignmentId);
    if (!assignment) throw AppError.notFound('Assignment not found');
    this.assertInstructorOrAdmin(user, assignment.course.instructorId);

    const items = await this.repo.findAssignmentSubmissions(assignmentId);
    return items.map((s) => ({
      id: s.id,
      studentId: s.user.id,
      studentName: s.user.name,
      studentEmail: s.user.email,
      status: s.status as SubmissionStatus,
      submittedAt: s.submittedAt.toISOString(),
      points: s.points ? Number(s.points) : null,
      feedback: s.feedback,
    }));
  }

  private assertInstructorOrAdmin(user: PolicyUser, instructorId: string): void {
    if (user.role === Role.ADMIN) return;
    if (user.role === Role.INSTRUCTOR && user.id === instructorId) return;
    throw AppError.forbidden('You do not have permission to modify this course assessment');
  }
}
