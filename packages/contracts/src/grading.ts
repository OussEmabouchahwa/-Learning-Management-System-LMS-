import { z } from 'zod';

export const GradeSubmissionInputSchema = z
  .object({
    points: z.number().min(0),
    feedback: z.string().trim().max(5000).optional(),
  })
  .strict();

export type GradeSubmissionInput = z.infer<typeof GradeSubmissionInputSchema>;

export const GradebookItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['QUIZ', 'ASSIGNMENT']),
  maxPoints: z.number(),
});

export type GradebookItem = z.infer<typeof GradebookItemSchema>;

export const StudentGradebookEntrySchema = z.object({
  studentId: z.string(),
  studentName: z.string(),
  studentEmail: z.string(),
  grades: z.record(
    z.object({
      score: z.number().nullable(),
      status: z.string(),
      submittedAt: z.string().nullable().optional(),
    }),
  ),
  finalAveragePct: z.number(),
});

export type StudentGradebookEntry = z.infer<typeof StudentGradebookEntrySchema>;

export const GradebookSchema = z.object({
  courseId: z.string(),
  courseTitle: z.string(),
  items: z.array(GradebookItemSchema),
  students: z.array(StudentGradebookEntrySchema),
});

export type Gradebook = z.infer<typeof GradebookSchema>;

export const StudentCourseGradeSchema = z.object({
  courseId: z.string(),
  courseTitle: z.string(),
  averageScorePct: z.number(),
  items: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      type: z.enum(['QUIZ', 'ASSIGNMENT']),
      score: z.number().nullable(),
      maxPoints: z.number(),
      status: z.string(),
      feedback: z.string().nullable().optional(),
    }),
  ),
});

export type StudentCourseGrade = z.infer<typeof StudentCourseGradeSchema>;
