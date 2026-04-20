import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async listLogs(
    page: number = 1,
    pageSize: number = 50,
    filters?: { action?: string; objectType?: string; actorUserId?: string },
  ) {
    const skip = (page - 1) * pageSize;
    const where: Prisma.AuditLogWhereInput = {};
    if (filters?.action) where.action = { contains: filters.action };
    if (filters?.objectType) where.objectType = filters.objectType;
    if (filters?.actorUserId) where.actorUserId = filters.actorUserId;

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return new PaginatedResponse(items, total, page, pageSize);
  }

  async logAction(
    actorUserId: string,
    actorType: string,
    action: string,
    objectType: string,
    objectId: string,
    metadata?: Record<string, any>,
    ipHash?: string,
  ) {
    return this.prisma.auditLog.create({
      data: {
        actorUserId,
        actorType: actorType as any,
        action,
        objectType,
        objectId,
        metadataJson: metadata,
        ipHash,
      },
    });
  }
}
