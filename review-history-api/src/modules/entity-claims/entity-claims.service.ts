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
import { NotificationsService } from '../notifications/notifications.service';
import {
  MEDICAL_CATEGORY_KEYS,
  PRODUCT_CATEGORY_KEYS,
  SCHOOL_CATEGORY_KEYS,
  WORKPLACE_CATEGORY_KEYS,
} from '../../common/constants/category-keys';

@Injectable()
export class EntityClaimsService {
  private readonly logger = new Logger(EntityClaimsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async createClaim(entityId: string, dto: CreateClaimDto, userId: string) {
    const entity = await this.prisma.entity.findFirst({
      where: { id: entityId, deletedAt: null },
    });
    if (!entity) throw new NotFoundException('Entity not found');

    if (entity.isClaimed && entity.claimedUserId && entity.claimedUserId !== userId) {
      throw new ConflictException('This entity is already claimed by another owner');
    }

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

    if (dto.action === 'approved') {
      const [entity, otherApprovedClaim] = await Promise.all([
        this.prisma.entity.findUnique({
          where: { id: claim.entityId },
          select: { id: true, isClaimed: true, claimedUserId: true },
        }),
        this.prisma.entityClaim.findFirst({
          where: {
            entityId: claim.entityId,
            status: 'approved',
            requesterUserId: { not: claim.requesterUserId },
          },
          select: { id: true },
        }),
      ]);

      if (!entity) throw new NotFoundException('Entity not found');

      if ((entity.isClaimed && entity.claimedUserId && entity.claimedUserId !== claim.requesterUserId) || otherApprovedClaim) {
        throw new ConflictException('This entity already has an approved owner claim');
      }
    }

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

      // Provision category-specific profile shell so admin "Entity Profiles" shows the entity immediately.
      await this.ensureCategoryProfileExists(claim.entityId);
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

    await this.notifications.send({
      userId: claim.requesterUserId,
      type: dto.action === 'approved' ? 'claim_approved' : 'claim_rejected',
      payload: {
        claimId,
        entityId: claim.entityId,
        reason: dto.reason || null,
        message: dto.action === 'approved' ? 'Your entity claim has been approved.' : 'Your entity claim has been rejected.',
      },
    });

    return { claimId, status: updatedClaim.status };
  }

  private async ensureCategoryProfileExists(entityId: string) {
    const entity = await this.prisma.entity.findUnique({
      where: { id: entityId },
      select: { id: true, category: { select: { key: true } } },
    });
    if (!entity) return;

    const categoryKey = entity.category?.key;
    if (!categoryKey) return;

    if (WORKPLACE_CATEGORY_KEYS.includes(categoryKey as any)) {
      await this.prisma.employerProfile.upsert({
        where: { entityId },
        update: {},
        create: { entityId },
      });
      return;
    }

    if (SCHOOL_CATEGORY_KEYS.includes(categoryKey as any)) {
      await this.prisma.schoolProfile.upsert({
        where: { entityId },
        update: {},
        create: { entityId },
      });
      return;
    }

    if (MEDICAL_CATEGORY_KEYS.includes(categoryKey as any)) {
      await this.prisma.medicalProfile.upsert({
        where: { entityId },
        update: {},
        create: { entityId },
      });
      return;
    }

    if (PRODUCT_CATEGORY_KEYS.includes(categoryKey as any)) {
      await this.prisma.productProfile.upsert({
        where: { entityId },
        update: {},
        create: { entityId },
      });
    }
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

  async getClaimDetail(claimId: string) {
    const claim = await this.prisma.entityClaim.findUnique({
      where: { id: claimId },
      include: {
        entity: { select: { id: true, displayName: true, category: { select: { key: true, nameEn: true } } } },
        requester: { select: { id: true, displayName: true, phoneE164: true, role: true, createdAt: true } },
      },
    });
    if (!claim) throw new NotFoundException('Claim not found');
    return {
      ...claim,
      entityName: claim.entity?.displayName ?? null,
    };
  }
}
