import { z } from 'zod';
import { LessonType } from './enums';

export const CreateModuleInputSchema = z
  .object({
    title: z.string().trim().min(2).max(150),
    position: z.number().int().min(0).optional(),
  })
  .strict();

export type CreateModuleInput = z.infer<typeof CreateModuleInputSchema>;

export const UpdateModuleInputSchema = z
  .object({
    title: z.string().trim().min(2).max(150).optional(),
    position: z.number().int().min(0).optional(),
  })
  .strict();

export type UpdateModuleInput = z.infer<typeof UpdateModuleInputSchema>;

export const ReorderItemSchema = z.object({
  id: z.string(),
  position: z.number().int().min(0),
});

export const ReorderItemsInputSchema = z
  .object({
    items: z.array(ReorderItemSchema),
  })
  .strict();

export type ReorderItemsInput = z.infer<typeof ReorderItemsInputSchema>;

export const CreateLessonInputSchema = z
  .object({
    title: z.string().trim().min(2).max(150),
    type: z.nativeEnum(LessonType).default(LessonType.TEXT),
    content: z.string().default(''),
    videoUrl: z.string().url().nullable().optional(),
    durationMin: z.number().int().min(1).default(10),
    required: z.boolean().default(true),
    position: z.number().int().min(0).optional(),
  })
  .strict();

export type CreateLessonInput = z.infer<typeof CreateLessonInputSchema>;

export const UpdateLessonInputSchema = z
  .object({
    title: z.string().trim().min(2).max(150).optional(),
    type: z.nativeEnum(LessonType).optional(),
    content: z.string().optional(),
    videoUrl: z.string().url().nullable().optional(),
    durationMin: z.number().int().min(1).optional(),
    required: z.boolean().optional(),
    position: z.number().int().min(0).optional(),
  })
  .strict();

export type UpdateLessonInput = z.infer<typeof UpdateLessonInputSchema>;

export const LessonDetailSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  courseId: z.string(),
  title: z.string(),
  slug: z.string(),
  type: z.nativeEnum(LessonType),
  content: z.string(),
  videoUrl: z.string().nullable().optional(),
  position: z.number().int(),
  durationMin: z.number().int(),
  required: z.boolean(),
  completed: z.boolean(),
  prevLessonId: z.string().nullable().optional(),
  nextLessonId: z.string().nullable().optional(),
  courseTitle: z.string().optional(),
  moduleTitle: z.string().optional(),
});

export type LessonDetail = z.infer<typeof LessonDetailSchema>;
