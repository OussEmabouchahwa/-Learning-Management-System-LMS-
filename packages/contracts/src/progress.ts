import { z } from 'zod';

export const LessonProgressUpdateSchema = z
  .object({
    completed: z.boolean(),
  })
  .strict();

export type LessonProgressUpdate = z.infer<typeof LessonProgressUpdateSchema>;

export const ResumeTargetSchema = z.object({
  courseId: z.string(),
  courseSlug: z.string(),
  courseTitle: z.string(),
  instructorName: z.string(),
  moduleId: z.string(),
  moduleTitle: z.string(),
  modulePosition: z.number().int(),
  lessonId: z.string(),
  lessonTitle: z.string(),
  lessonPosition: z.number().int(),
  lessonDurationMin: z.number().int(),
  completedLessonsCount: z.number().int(),
  totalLessonsCount: z.number().int(),
  nextMilestoneText: z.string().optional(),
});

export type ResumeTarget = z.infer<typeof ResumeTargetSchema>;

export const DashboardStatsSchema = z.object({
  averageGradePct: z.number(),
  submittedAssignmentsCount: z.number().int(),
  totalAssignmentsCount: z.number().int(),
  awaitingFeedbackCount: z.number().int(),
  oldestFeedbackDays: z.number().int().optional(),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

export const DueSoonItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['ASSIGNMENT', 'QUIZ']),
  courseTitle: z.string(),
  dueAt: z.string(),
  badgeText: z.string(), // e.g. "In 2 days", "Wed", "Fri"
  badgeVariant: z.enum(['soon', 'default', 'urgent', 'submitted']),
  durationMinutes: z.number().optional(),
});

export type DueSoonItem = z.infer<typeof DueSoonItemSchema>;

export const DashboardCourseItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  nextLessonTitle: z.string().nullable(),
  progressPct: z.number().int(),
  statusBadge: z.string().optional(), // e.g. "Passed"
  totalLessons: z.number().int(),
  completedLessons: z.number().int(),
});

export type DashboardCourseItem = z.infer<typeof DashboardCourseItemSchema>;

export const StudentDashboardSchema = z.object({
  dateFormatted: z.string(),
  resume: ResumeTargetSchema.nullable(),
  stats: DashboardStatsSchema,
  dueSoon: z.array(DueSoonItemSchema),
  courses: z.array(DashboardCourseItemSchema),
});

export type StudentDashboard = z.infer<typeof StudentDashboardSchema>;
