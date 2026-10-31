import { z } from 'zod';
import { CourseLevel, CourseStatus } from './enums';
import { PaginationQuerySchema } from './common';

export const CreateCourseInputSchema = z
  .object({
    title: z.string().trim().min(3).max(150),
    description: z.string().trim().min(10).max(2000),
    level: z.nativeEnum(CourseLevel),
  })
  .strict();

export type CreateCourseInput = z.infer<typeof CreateCourseInputSchema>;

export const UpdateCourseInputSchema = z
  .object({
    title: z.string().trim().min(3).max(150).optional(),
    description: z.string().trim().min(10).max(2000).optional(),
    level: z.nativeEnum(CourseLevel).optional(),
    slug: z.string().trim().min(3).max(150).optional(),
  })
  .strict();

export type UpdateCourseInput = z.infer<typeof UpdateCourseInputSchema>;

export const CoursesListQuerySchema = PaginationQuerySchema.extend({
  search: z.string().optional(),
  level: z.nativeEnum(CourseLevel).optional(),
  status: z.nativeEnum(CourseStatus).optional(),
});

export type CoursesListQuery = z.infer<typeof CoursesListQuerySchema>;

export const CourseSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  level: z.nativeEnum(CourseLevel),
  status: z.nativeEnum(CourseStatus),
  instructorId: z.string(),
  instructorName: z.string().optional(),
  totalLessons: z.number().int().default(0),
  totalDurationMin: z.number().int().default(0),
  enrolledStudentsCount: z.number().int().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CourseSummary = z.infer<typeof CourseSummarySchema>;

export const CourseModuleSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  position: z.number().int(),
  lessons: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      slug: z.string(),
      position: z.number().int(),
      durationMin: z.number().int(),
      required: z.boolean(),
      completed: z.boolean().optional(),
    }),
  ),
});

export type CourseModuleSummary = z.infer<typeof CourseModuleSummarySchema>;

export const CourseDetailSchema = CourseSummarySchema.extend({
  modules: z.array(CourseModuleSummarySchema),
  quizzes: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      timeLimitSec: z.number().int(),
      maxAttempts: z.number().int(),
      passPct: z.number().int(),
    }),
  ),
  assignments: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      dueAt: z.string(),
      maxPoints: z.number().int(),
    }),
  ),
  isEnrolled: z.boolean().optional(),
  progressPct: z.number().int().optional(),
});

export type CourseDetail = z.infer<typeof CourseDetailSchema>;
