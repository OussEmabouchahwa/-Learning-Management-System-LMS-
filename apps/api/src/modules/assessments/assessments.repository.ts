import { Injectable } from '@nestjs/common';
import {
  Prisma,
  QuestionType,
  QuizAttemptStatus,
  ScoringPolicy,
  SubmissionStatus,
  SubmissionType,
} from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class AssessmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createQuiz(courseId: string, data: {
    title: string;
    description?: string;
    timeLimitSec: number;
    maxAttempts: number;
    passPct: number;
    scoringPolicy: ScoringPolicy;
    required: boolean;
    position?: number;
  }) {
    return this.prisma.quiz.create({
      data: {
        courseId,
        title: data.title,
        description: data.description,
        timeLimitSec: data.timeLimitSec,
        maxAttempts: data.maxAttempts,
        passPct: data.passPct,
        scoringPolicy: data.scoringPolicy,
        required: data.required,
        position: data.position ?? 0,
      },
    });
  }

  async findQuizById(id: string) {
    return this.prisma.quiz.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, instructorId: true, status: true } },
        questions: {
          orderBy: { position: 'asc' },
          include: {
            options: { orderBy: { position: 'asc' } },
          },
        },
      },
    });
  }

  async updateQuiz(id: string, data: Prisma.QuizUpdateInput) {
    return this.prisma.quiz.update({
      where: { id },
      data,
    });
  }

  async createQuestion(quizId: string, data: {
    prompt: string;
    type: QuestionType;
    points: number;
    explanation?: string;
    position?: number;
    options: { text: string; isCorrect: boolean; position?: number }[];
  }) {
    const pos =
      data.position ??
      (await this.prisma.question.count({ where: { quizId } })) + 1;

    return this.prisma.question.create({
      data: {
        quizId,
        prompt: data.prompt,
        type: data.type,
        points: new Prisma.Decimal(data.points),
        explanation: data.explanation,
        position: pos,
        options: {
          create: data.options.map((opt, idx) => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
            position: opt.position ?? idx + 1,
          })),
        },
      },
      include: {
        options: true,
      },
    });
  }

  async countUserAttempts(userId: string, quizId: string) {
    return this.prisma.quizAttempt.count({
      where: { userId, quizId },
    });
  }

  async findActiveAttempt(userId: string, quizId: string) {
    return this.prisma.quizAttempt.findFirst({
      where: {
        userId,
        quizId,
        status: QuizAttemptStatus.IN_PROGRESS,
      },
      include: {
        answers: true,
      },
    });
  }

  async createAttempt(data: {
    quizId: string;
    userId: string;
    deadline: Date;
    shuffleSeed: number;
  }) {
    return this.prisma.quizAttempt.create({
      data: {
        quizId: data.quizId,
        userId: data.userId,
        deadline: data.deadline,
        shuffleSeed: data.shuffleSeed,
        status: QuizAttemptStatus.IN_PROGRESS,
      },
      include: {
        answers: true,
      },
    });
  }

  async findAttemptById(id: string) {
    return this.prisma.quizAttempt.findUnique({
      where: { id },
      include: {
        quiz: {
          include: {
            course: { select: { id: true, instructorId: true } },
            questions: {
              orderBy: { position: 'asc' },
              include: {
                options: { orderBy: { position: 'asc' } },
              },
            },
          },
        },
        answers: true,
      },
    });
  }

  async saveAttemptAnswers(attemptId: string, answers: Record<string, string[]>) {
    return this.prisma.$transaction(async (tx) => {
      for (const [questionId, selectedOptionIds] of Object.entries(answers)) {
        await tx.attemptAnswer.upsert({
          where: {
            attemptId_questionId: {
              attemptId,
              questionId,
            },
          },
          update: {
            selectedOptionIds,
          },
          create: {
            attemptId,
            questionId,
            selectedOptionIds,
          },
        });
      }
    });
  }

  async finalizeAttempt(
    attemptId: string,
    data: {
      status: QuizAttemptStatus;
      score: number;
      passed: boolean;
      submittedAt: Date;
      answersWithResults: {
        questionId: string;
        isCorrect: boolean;
        earnedPoints: number;
      }[];
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      for (const ans of data.answersWithResults) {
        await tx.attemptAnswer.updateMany({
          where: { attemptId, questionId: ans.questionId },
          data: {
            isCorrect: ans.isCorrect,
            earnedPoints: new Prisma.Decimal(ans.earnedPoints),
          },
        });
      }

      return tx.quizAttempt.update({
        where: { id: attemptId },
        data: {
          status: data.status,
          score: new Prisma.Decimal(data.score),
          passed: data.passed,
          submittedAt: data.submittedAt,
        },
      });
    });
  }

  async createAssignment(courseId: string, data: {
    title: string;
    description: string;
    dueAt: Date;
    maxPoints: number;
    allowLate: boolean;
    latePenaltyPct: number;
    submissionType: SubmissionType;
    required: boolean;
    position?: number;
  }) {
    return this.prisma.assignment.create({
      data: {
        courseId,
        title: data.title,
        description: data.description,
        dueAt: data.dueAt,
        maxPoints: data.maxPoints,
        allowLate: data.allowLate,
        latePenaltyPct: data.latePenaltyPct,
        submissionType: data.submissionType,
        required: data.required,
        position: data.position ?? 0,
      },
    });
  }

  async findAssignmentById(id: string) {
    return this.prisma.assignment.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, instructorId: true } },
      },
    });
  }

  async updateAssignment(id: string, data: Prisma.AssignmentUpdateInput) {
    return this.prisma.assignment.update({
      where: { id },
      data,
    });
  }

  async findSubmission(assignmentId: string, userId: string) {
    return this.prisma.submission.findUnique({
      where: { assignmentId_userId: { assignmentId, userId } },
      include: {
        versions: { orderBy: { versionNumber: 'desc' } },
        user: { select: { id: true, name: true, email: true } },
        assignment: {
          select: {
            id: true,
            title: true,
            maxPoints: true,
            dueAt: true,
            latePenaltyPct: true,
            allowLate: true,
            course: { select: { id: true, instructorId: true } },
          },
        },
      },
    });
  }

  async findSubmissionById(id: string) {
    return this.prisma.submission.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        assignment: {
          select: {
            id: true,
            title: true,
            maxPoints: true,
            dueAt: true,
            latePenaltyPct: true,
            allowLate: true,
            course: { select: { id: true, instructorId: true } },
          },
        },
        versions: { orderBy: { versionNumber: 'desc' } },
      },
    });
  }

  async upsertSubmission(data: {
    assignmentId: string;
    userId: string;
    status: SubmissionStatus;
    content?: string;
    fileKey?: string;
    fileName?: string;
    fileSizeBytes?: number;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.submission.findUnique({
        where: {
          assignmentId_userId: {
            assignmentId: data.assignmentId,
            userId: data.userId,
          },
        },
        include: { versions: true },
      });

      const nextVersion = (existing?.versions.length ?? 0) + 1;

      const submission = await tx.submission.upsert({
        where: {
          assignmentId_userId: {
            assignmentId: data.assignmentId,
            userId: data.userId,
          },
        },
        update: {
          status: data.status,
          content: data.content,
          fileKey: data.fileKey,
          fileName: data.fileName,
          fileSizeBytes: data.fileSizeBytes,
          submittedAt: new Date(),
        },
        create: {
          assignmentId: data.assignmentId,
          userId: data.userId,
          status: data.status,
          content: data.content,
          fileKey: data.fileKey,
          fileName: data.fileName,
          fileSizeBytes: data.fileSizeBytes,
        },
      });

      await tx.submissionVersion.create({
        data: {
          submissionId: submission.id,
          versionNumber: nextVersion,
          content: data.content,
          fileKey: data.fileKey,
          fileName: data.fileName,
          fileSizeBytes: data.fileSizeBytes,
        },
      });

      return submission;
    });
  }

  async findAssignmentSubmissions(assignmentId: string) {
    return this.prisma.submission.findMany({
      where: { assignmentId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { submittedAt: 'asc' }, // oldest first per frontend-ui skill
    });
  }
}
