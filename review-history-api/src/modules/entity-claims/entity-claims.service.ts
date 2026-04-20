import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { ReviewClaimDto } from './dto/review-claim.dto';
import { ClaimVerificationMethod } from '@prisma/client';
import { PaginatedResponse } from '../../common/dto/pagination.dto';
import { sanitizeInput } from '../../common/utils/helpers';

@Injectable()
export class EntityClaimsService {
  private readonly logger = new Logger(EntityClaimsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createClaim(entityId: string, dto: CreateClaimDto, userId: string) {
    const entity = await this.prisma.entity.findFirst({
      where: { id: entityId, deletedAt: null },
    });
    if (!entity) throw new NotFoundException('Entity not found');

    // Check for existing pending/approved claim
    const existing = await this.prisma.entityClaim.findFirst({
      where: { entityId, requesterUserId: userId, status: { in: ['pending', 'approved'] } },
    });
    if (existing) {
      throw new ConflictException('You already have an active claim for this entity');
    }

    const claim = await this.prisma.entityClaim.create({
      data: {
        entityId,
        requesterUserId: userId,
        claimType: 'owner',
        verificationMethod: dto.verificationMethod as ClaimVerificationMethod,
        submittedDocumentsJson: dto.evidenceUrl ? { url: sanitizeInput(dto.evidenceUrl) } : undefined,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: userId,
        actorType: 'user',
        action: 'entity_claim.created',
        objectType: 'entity_claim',
        objectId: claim.id,
        metadataJson: { entityId },
      },
    });

    return { claimId: claim.id, status: 'pending' };
  }

  async reviewClaim(claimId: string, dto: ReviewClaimDto, adminUserId: string) {
    const claim = await this.prisma.entityClaim.findFirst({
      where: { id: claimId, status: 'pending' },
    });
    if (!claim) throw new NotFoundException('Pending claim not found');

    const updatedClaim = await this.prisma.entityClaim.update({
      where: { id: claimId },
      data: {
        status: dto.action,
        approvedBy: adminUserId,
        approvedAt: new Date(),
        adminNotes: dto.reason ? sanitizeInput(dto.reason) : null,
      },
    });

    // If approved, upgrade user role to claimed_owner
    if (dto.action === 'approved') {
      await this.prisma.user.update({
        where: { id: claim.requesterUserId },
        data: { role: 'claimed_owner' },
      });
      // Mark entity as claimed
      await this.prisma.entity.update({
        where: { id: claim.entityId },
        data: { claimedUserId: claim.requesterUserId, isClaimed: true },
      });
    }

    await this.prisma.auditLog.create({
      data: {
        actorUserId: adminUserId,
        actorType: 'admin',
        action: `entity_claim.${dto.action}`,
        objectType: 'entity_claim',
        objectId: claimId,
        metadataJson: { reason: dto.reason ? sanitizeInput(dto.reason) : null },
      },
    });

    return { claimId, status: updatedClaim.status };
  }

  async listPendingClaims(page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;
    const [claims, total] = await Promise.all([
      this.prisma.entityClaim.findMany({
        where: { status: 'pending' },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'asc' },
        include: {
          entity: { select: { id: true, displayName: true } },
          requester: { select: { id: true, displayName: true, phoneE164: true } },
        },
      }),
      this.prisma.entityClaim.count({ where: { status: 'pending' } }),
    ]);

    const items = claims.map((claim) => ({
      ...claim,
      entityName: claim.entity?.displayName ?? null,
    }));

    return new PaginatedResponse(items, total, page, pageSize);
  }

  async getUserClaims(userId: string) {
    return this.prisma.entityClaim.findMany({
      where: { requesterUserId: userId },
      include: { entity: { select: { id: true, displayName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
