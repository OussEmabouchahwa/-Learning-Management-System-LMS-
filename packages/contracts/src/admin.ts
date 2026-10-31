import { z } from 'zod';
import { PaginationQuerySchema } from './common';

export const AdminOverviewSchema = z.object({
  totalUsers: z.number().int(),
  totalStudents: z.number().int(),
  totalInstructors: z.number().int(),
  totalCourses: z.number().int(),
  publishedCourses: z.number().int(),
  totalSubmissions: z.number().int(),
  totalAttempts: z.number().int(),
});

export type AdminOverview = z.infer<typeof AdminOverviewSchema>;

export const AuditLogItemSchema = z.object({
  id: z.string(),
  actorId: z.string(),
  actorEmail: z.string().optional(),
  actorName: z.string().optional(),
  action: z.string(),
  targetType: z.string(),
  targetId: z.string(),
  metadata: z.record(z.unknown()).nullable().optional(),
  requestId: z.string(),
  createdAt: z.string(),
});

export type AuditLogItem = z.infer<typeof AuditLogItemSchema>;

export const AuditLogQuerySchema = PaginationQuerySchema.extend({
  actorId: z.string().optional(),
  action: z.string().optional(),
  targetType: z.string().optional(),
});

export type AuditLogQuery = z.infer<typeof AuditLogQuerySchema>;
