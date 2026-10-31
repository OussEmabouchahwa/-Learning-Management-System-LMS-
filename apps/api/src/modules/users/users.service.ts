import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import {
  ChangePasswordInput,
  Role,
  UpdateProfileInput,
  UserStatus,
  UsersListQuery,
} from '@dars/contracts';
import { UsersRepository } from './users.repository';
import { AuditService } from '../audit/audit.service';
import { AppError } from '../../common/errors/app.error';

@Injectable()
export class UsersService {
  constructor(
    private readonly repo: UsersRepository,
    private readonly audit: AuditService,
  ) {}

  async updateProfile(userId: string, input: UpdateProfileInput) {
    return this.repo.updateName(userId, input.name);
  }

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await this.repo.findById(userId);
    if (!user) throw AppError.notFound('User not found');

    const isValid = await argon2.verify(user.passwordHash, input.currentPassword);
    if (!isValid) {
      throw AppError.badRequest('Current password is incorrect');
    }

    const passwordHash = await argon2.hash(input.newPassword);
    await this.repo.updatePassword(userId, passwordHash);
    return { message: 'Password changed successfully' };
  }

  async listUsers(query: UsersListQuery) {
    const { total, items } = await this.repo.findMany({
      page: query.page,
      limit: query.limit,
      search: query.search,
      role: query.role as Role | undefined,
      status: query.status as UserStatus | undefined,
    });

    return {
      items: items.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role as Role,
        status: u.status as UserStatus,
        createdAt: u.createdAt.toISOString(),
      })),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  async updateRole(
    targetUserId: string,
    role: Role,
    actorId: string,
    requestId: string,
  ) {
    const updated = await this.repo.updateRole(targetUserId, role);

    await this.audit.log({
      actorId,
      action: 'user.role_change',
      targetType: 'user',
      targetId: targetUserId,
      metadata: { newRole: role },
      requestId,
    });

    return updated;
  }

  async updateStatus(
    targetUserId: string,
    status: UserStatus,
    actorId: string,
    requestId: string,
  ) {
    const updated = await this.repo.updateStatus(targetUserId, status);

    await this.audit.log({
      actorId,
      action: 'user.status_change',
      targetType: 'user',
      targetId: targetUserId,
      metadata: { newStatus: status },
      requestId,
    });

    return updated;
  }
}
