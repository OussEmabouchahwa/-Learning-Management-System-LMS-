import { z } from 'zod';
import { Role, UserStatus } from './enums';
import { PaginationQuerySchema } from './common';

export const UpdateProfileInputSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
  })
  .strict();

export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;

export const UpdateUserRoleInputSchema = z
  .object({
    role: z.nativeEnum(Role),
  })
  .strict();

export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleInputSchema>;

export const UpdateUserStatusInputSchema = z
  .object({
    status: z.nativeEnum(UserStatus),
  })
  .strict();

export type UpdateUserStatusInput = z.infer<typeof UpdateUserStatusInputSchema>;

export const UserListItemSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.nativeEnum(Role),
  status: z.nativeEnum(UserStatus),
  createdAt: z.string(),
});

export type UserListItem = z.infer<typeof UserListItemSchema>;

export const UsersListQuerySchema = PaginationQuerySchema.extend({
  search: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(UserStatus).optional(),
});

export type UsersListQuery = z.infer<typeof UsersListQuerySchema>;
