import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    actorId: string;
    action: string;
    targetType: string;
    targetId: string;
    metadata?: Prisma.InputJsonValue;
    requestId: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        actorId: data.actorId,
        action: data.action,
        targetType: data.targetType,
        targetId: data.targetId,
        metadata: data.metadata,
        requestId: data.requestId,
      },
    });
  }

  async findMany(params: {
    page: number;
    limit: number;
    actorId?: string;
    action?: string;
    targetType?: string;
  }) {
    const where: Prisma.AuditLogWhereInput = {};
    if (params.actorId) where.actorId = params.actorId;
    if (params.action) where.action = params.action;
    if (params.targetType) where.targetType = params.targetType;

    const [total, items] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      }),
    ]);

    return {
      total,
      items: items.map((i) => ({
        id: i.id,
        actorId: i.actorId,
        actorEmail: i.actor.email,
        actorName: i.actor.name,
        action: i.action,
        targetType: i.targetType,
        targetId: i.targetId,
        metadata: i.metadata as Record<string, unknown> | null,
        requestId: i.requestId,
        createdAt: i.createdAt.toISOString(),
      })),
    };
  }
}
