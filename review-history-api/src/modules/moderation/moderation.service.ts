import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { ResolveCaseDto } from './dto/resolve-case.dto';
import { Prisma, ModerationActionType, ModerationCaseStatus } from '@prisma/client';
import { PaginatedResponse } from '../../common/dto/pagination.dto';
import { sanitizeInput } from '../../common/utils/helpers';

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listCases(page: number = 1, pageSize: number = 20, status?: string) {
    const skip = (page - 1) * pageSize;
    const where: Prisma.ModerationCaseWhereInput = {};
    if (status) where.status = status as ModerationCaseStatus;

    const [cases, total] = await Promise.all([
      this.prisma.moderationCase.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { openedAt: 'desc' },
      }),
      this.prisma.moderationCase.count({ where }),
    ]);

    return new PaginatedResponse(cases, total, page, pageSize);
  }

  async getCase(caseId: string) {
    const modCase = await this.prisma.moderationCase.findUnique({
      where: { id: caseId },
      include: { actions: true },
    });
    if (!modCase) throw new NotFoundException('Case not found');

    let review: any = null;
    if (modCase.objectType === 'review') {
      review = await this.prisma.review.findUnique({
        where: { id: modCase.objectId },
        include: {
          author: { select: { id: true, displayName: true, phoneE164: true, email: true, role: true, status: true } },
          entity: {
            select: {
              id: true,
              displayName: true,
              category: { select: { key: true, nameEn: true } },
              city: { select: { nameEn: true } },
            },
          },
          tagLinks: { include: { tag: { select: { key: true, labelEn: true, isPositive: true } } } },
          replies: {
            orderBy: { createdAt: 'asc' },
            include: { author: { select: { id: true, displayName: true } } },
          },
          reports: { orderBy: { createdAt: 'desc' }, take: 20 },
          votes: true,
        },
      });
    }

    return {
      ...modCase,
      review,
    };
  }

  async resolveCase(caseId: string, dto: ResolveCaseDto, adminUserId: string) {
    const modCase = await this.prisma.moderationCase.findFirst({
      where: { id: caseId, status: { notIn: ['resolved', 'closed'] } },
    });
    if (!modCase) throw new NotFoundException('Active case not found');

    // Create action
    const sanitizedNotes = dto.notes ? sanitizeInput(dto.notes) : null;
    await this.prisma.moderationAction.create({
      data: {
        caseId,
        performedBy: adminUserId,
        actionType: dto.actionType as ModerationActionType,
        notes: sanitizedNotes,
      },
    });

    // Update case status
    const newStatus: ModerationCaseStatus = dto.actionType === 'close_case' ? 'closed' : 'resolved';
    await this.prisma.moderationCase.update({
      where: { id: caseId },
      data: {
        status: newStatus,
        closedAt: new Date(),
      },
    });

    // Apply outcome to the object
    if (modCase.objectType === 'review') {
      if (dto.actionType === 'remove_review') {
        await this.prisma.review.update({
          where: { id: modCase.objectId },
          data: { status: 'removed', deletedAt: new Date() },
        });
      } else if (dto.actionType === 'keep') {
        await this.prisma.review.update({
          where: { id: modCase.objectId },
          data: { status: 'published', moderationState: 'clean', riskState: 'clean', underVerification: false, publishedAt: new Date() },
        });
      } else if (dto.actionType === 'hide_review') {
        await this.prisma.review.update({
          where: { id: modCase.objectId },
          data: { status: 'hidden', moderationState: 'hidden_pending_review' },
        });
      }
    }

    await this.prisma.auditLog.create({
      data: {
        actorUserId: adminUserId,
        actorType: 'admin',
        action: `moderation.${dto.actionType}`,
        objectType: modCase.objectType,
        objectId: modCase.objectId,
        metadataJson: { caseId, notes: sanitizedNotes },
      },
    });

    return { caseId, status: newStatus, actionType: dto.actionType };
  }
}
