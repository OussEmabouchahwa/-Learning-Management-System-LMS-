import { z } from 'zod';
import {
  QuestionType,
  QuizAttemptStatus,
  ScoringPolicy,
  SubmissionStatus,
  SubmissionType,
} from './enums';

export const CreateQuizOptionSchema = z
  .object({
    text: z.string().trim().min(1).max(300),
    isCorrect: z.boolean(),
    position: z.number().int().min(0).optional(),
  })
  .strict();

export type CreateQuizOption = z.infer<typeof CreateQuizOptionSchema>;

export const CreateQuizQuestionSchema = z
  .object({
    prompt: z.string().trim().min(2).max(1000),
    type: z.nativeEnum(QuestionType),
    points: z.number().min(0.5).max(100).default(1),
    explanation: z.string().max(1000).optional(),
    position: z.number().int().min(0).optional(),
    options: z.array(CreateQuizOptionSchema).min(2),
  })
  .strict();

export type CreateQuizQuestion = z.infer<typeof CreateQuizQuestionSchema>;

export const CreateQuizInputSchema = z
  .object({
    title: z.string().trim().min(3).max(150),
    description: z.string().trim().max(1000).optional(),
    timeLimitSec: z.number().int().min(30).max(14400).default(1200), // e.g. 20 mins
    maxAttempts: z.number().int().min(1).max(10).default(3),
    passPct: z.number().int().min(0).max(100).default(70),
    scoringPolicy: z.nativeEnum(ScoringPolicy).default(ScoringPolicy.BEST),
    required: z.boolean().default(true),
    position: z.number().int().min(0).optional(),
  })
  .strict();

export type CreateQuizInput = z.infer<typeof CreateQuizInputSchema>;

export const UpdateQuizInputSchema = CreateQuizInputSchema.partial();
export type UpdateQuizInput = z.infer<typeof UpdateQuizInputSchema>;

export const QuizClientOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  position: z.number().int(),
  isCorrect: z.boolean().optional(), // only visible after submit!
});

export type QuizClientOption = z.infer<typeof QuizClientOptionSchema>;

export const QuizClientQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  type: z.nativeEnum(QuestionType),
  points: z.number(),
  position: z.number().int(),
  options: z.array(QuizClientOptionSchema),
  explanation: z.string().optional(), // only visible after submit!
});

export type QuizClientQuestion = z.infer<typeof QuizClientQuestionSchema>;

export const QuizAttemptDetailSchema = z.object({
  id: z.string(),
  quizId: z.string(),
  quizTitle: z.string(),
  timeLimitSec: z.number().int(),
  status: z.nativeEnum(QuizAttemptStatus),
  startedAt: z.string(),
  deadline: z.string(),
  submittedAt: z.string().nullable().optional(),
  score: z.number().nullable().optional(),
  passed: z.boolean().nullable().optional(),
  questions: z.array(QuizClientQuestionSchema),
  savedAnswers: z.record(z.array(z.string())),
});

export type QuizAttemptDetail = z.infer<typeof QuizAttemptDetailSchema>;

export const SaveAttemptAnswersInputSchema = z
  .object({
    answers: z.record(z.array(z.string())),
  })
  .strict();

export type SaveAttemptAnswersInput = z.infer<typeof SaveAttemptAnswersInputSchema>;

export const CreateAssignmentInputSchema = z
  .object({
    title: z.string().trim().min(3).max(150),
    description: z.string().trim().min(10).max(5000),
    dueAt: z.string().datetime(),
    maxPoints: z.number().int().min(1).max(1000).default(100),
    allowLate: z.boolean().default(true),
    latePenaltyPct: z.number().int().min(0).max(100).default(10),
    submissionType: z.nativeEnum(SubmissionType).default(SubmissionType.BOTH),
    required: z.boolean().default(true),
    position: z.number().int().min(0).optional(),
  })
  .strict();

export type CreateAssignmentInput = z.infer<typeof CreateAssignmentInputSchema>;

export const UpdateAssignmentInputSchema = CreateAssignmentInputSchema.partial();
export type UpdateAssignmentInput = z.infer<typeof UpdateAssignmentInputSchema>;

export const SubmitAssignmentInputSchema = z
  .object({
    content: z.string().max(10000).optional(),
    fileKey: z.string().optional(),
    fileName: z.string().optional(),
    fileSizeBytes: z.number().int().optional(),
  })
  .strict();

export type SubmitAssignmentInput = z.infer<typeof SubmitAssignmentInputSchema>;

export const SubmissionDetailSchema = z.object({
  id: z.string(),
  assignmentId: z.string(),
  assignmentTitle: z.string(),
  userId: z.string(),
  studentName: z.string(),
  status: z.nativeEnum(SubmissionStatus),
  content: z.string().nullable().optional(),
  fileKey: z.string().nullable().optional(),
  fileName: z.string().nullable().optional(),
  fileSizeBytes: z.number().nullable().optional(),
  submittedAt: z.string(),
  rawPoints: z.number().nullable().optional(),
  points: z.number().nullable().optional(),
  feedback: z.string().nullable().optional(),
  gradedAt: z.string().nullable().optional(),
});

export type SubmissionDetail = z.infer<typeof SubmissionDetailSchema>;
