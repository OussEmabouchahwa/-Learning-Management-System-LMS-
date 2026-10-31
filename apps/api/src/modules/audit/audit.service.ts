import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditRepository } from './audit.repository';

@Injectable()
export class AuditService {
  constructor(private readonly auditRepo: AuditRepository) {}

  async log(entry: {
    actorId: string;
    action: string;
    targetType: string;
    targetId: string;
    metadata?: Prisma.InputJsonValue;
    requestId: string;
  }) {
    return this.auditRepo.create(entry);
  }

  async listLogs(params: {
    page: number;
    limit: number;
    actorId?: string;
    action?: string;
    targetType?: string;
  }) {
    return this.auditRepo.findMany(params);
  }
}
