import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateEmployerProfileDto } from './dto/create-employer-profile.dto';
import { UpdateEmployerProfileDto } from './dto/update-employer-profile.dto';
import { sanitizeInput } from '../../common/utils/helpers';
import { PaginatedResponse } from '../../common/dto/pagination.dto';
import { NotificationsService } from '../notifications/notifications.service';

const EMPLOYER_CATEGORY_KEYS = ['employer', 'workplace', 'workspace', 'company'];

@Injectable()
export class EmployerProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(entityId: string, dto: CreateEmployerProfileDto, userId: string) {
    const entity = await this.prisma.entity.findFirst({
      where: { id: entityId, deletedAt: null },
    });
    if (!entity) throw new NotFoundException('Entity not found');

    // Verify ownership
    await this.verifyOwnership(entityId, userId);

    // Check if profile already exists
    const existing = await this.prisma.employerProfile.findUnique({
      where: { entityId },
    });
    if (existing) throw new ConflictException('Employer profile already exists for this entity');

    const profile = await this.prisma.employerProfile.create({
      data: {
        entityId,
        description: dto.description ? sanitizeInput(dto.description) : null,
        logoUrl: dto.logoUrl || null,
        coverImageUrl: dto.coverImageUrl || null,
        websiteUrl: dto.websiteUrl || null,
        industry: dto.industry ? sanitizeInput(dto.industry) : null,
        employerSize: dto.employerSize || null,
        foundedYear: dto.foundedYear || null,
        benefitsJson: dto.benefits || Prisma.JsonNull,
        socialLinksJson: dto.socialLinks || Prisma.JsonNull,
      },
    });

    await this.createAuditLog(userId, 'employer_profile.created', 'employer_profile', profile.id, { entityId });

    return this.mapProfile(profile);
  }

  async update(entityId: string, dto: UpdateEmployerProfileDto, userId: string) {
    await this.verifyOwnership(entityId, userId);

    const profile = await this.prisma.employerProfile.findUnique({
      where: { entityId },
    });
    if (!profile) throw new NotFoundException('Employer profile not found');

    const updated = await this.prisma.employerProfile.update({
      where: { entityId },
      data: {
        ...(dto.description !== undefined && { description: sanitizeInput(dto.description) }),
        ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
        ...(dto.coverImageUrl !== undefined && { coverImageUrl: dto.coverImageUrl }),
        ...(dto.websiteUrl !== undefined && { websiteUrl: dto.websiteUrl }),
        ...(dto.industry !== undefined && { industry: dto.industry ? sanitizeInput(dto.industry) : null }),
        ...(dto.employerSize !== undefined && { employerSize: dto.employerSize }),
        ...(dto.foundedYear !== undefined && { foundedYear: dto.foundedYear }),
        ...(dto.benefits !== undefined && { benefitsJson: dto.benefits }),
        ...(dto.socialLinks !== undefined && { socialLinksJson: dto.socialLinks }),
      },
    });

    await this.createAuditLog(userId, 'employer_profile.updated', 'employer_profile', updated.id, { entityId });

    return this.mapProfile(updated);
  }

  async findByEntity(entityId: string) {
    const profile = await this.prisma.employerProfile.findUnique({
      where: { entityId },
    });
    if (!profile) return null;
    return this.mapProfile(profile);
  }

  async verifyEmployer(entityId: string, method: string, adminUserId: string) {
    const entity = await this.prisma.entity.findUnique({
      where: { id: entityId },
      select: { claimedUserId: true },
    });

    const profile = await this.prisma.employerProfile.findUnique({
      where: { entityId },
    });
    if (!profile) throw new NotFoundException('Employer profile not found');

    const updated = await this.prisma.employerProfile.update({
      where: { entityId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
        verifiedMethod: method,
      },
    });

    // Award verified_employer badge
    await this.prisma.badge.upsert({
      where: {
        badgeType_targetType_targetId: {
          badgeType: 'verified_employer',
          targetType: 'entity',
          targetId: entityId,
        },
      },
      update: { awardedAt: new Date() },
      create: {
        badgeType: 'verified_employer',
        targetType: 'entity',
        targetId: entityId,
      },
    });

    await this.createAuditLog(adminUserId, 'employer_profile.verified', 'employer_profile', updated.id, {
      entityId,
      method,
    });

    if (entity?.claimedUserId) {
      await this.notifications.send({
        userId: entity.claimedUserId,
        type: 'employer_verified',
        payload: {
          entityId,
          message: 'Your employer profile is now verified.',
        },
      });
    }

    return this.mapProfile(updated);
  }

  async listAll(page: number = 1, pageSize: number = 20) {
    // Backfill: ensure claimed employer-like entities have an employer profile row.
    // This keeps admin "Entity Profiles > Employers" in sync with claim approvals.
    const claimedEmployerEntitiesWithoutProfile = await this.prisma.entity.findMany({
      where: {
        deletedAt: null,
        isClaimed: true,
        category: { key: { in: EMPLOYER_CATEGORY_KEYS } },
        employerProfile: { is: null },
      },
      select: { id: true },
      take: 500,
    });

    if (claimedEmployerEntitiesWithoutProfile.length > 0) {
      await this.prisma.employerProfile.createMany({
        data: claimedEmployerEntitiesWithoutProfile.map((entity) => ({ entityId: entity.id })),
        skipDuplicates: true,
      });
    }

    const skip = (page - 1) * pageSize;
    const [profiles, total] = await Promise.all([
      this.prisma.employerProfile.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { entity: { select: { id: true, displayName: true } } },
      }),
      this.prisma.employerProfile.count(),
    ]);
    const items = profiles.map((p) => ({ ...this.mapProfile(p), entityName: (p as any).entity?.displayName ?? null }));
    return new PaginatedResponse(items, total, page, pageSize);
  }

  private async verifyOwnership(entityId: string, userId: string) {
    const claim = await this.prisma.entityClaim.findFirst({
      where: { entityId, requesterUserId: userId, status: 'approved' },
    });
    if (!claim) throw new ForbiddenException('You must be the claimed owner of this entity');
  }

  private calculateCompletion(profile: any): number {
    let score = 0;
    if (profile.description) score += 15;
    if (profile.logoUrl) score += 15;
    if (profile.coverImageUrl) score += 15;
    if (profile.websiteUrl) score += 15;
    if (profile.industry) score += 10;
    if (profile.employerSize) score += 10;
    if (profile.foundedYear) score += 10;
    if (Array.isArray(profile.benefitsJson) && profile.benefitsJson.length > 0) score += 10;

    const hasSocialLinks =
      !!profile.socialLinksJson
      && typeof profile.socialLinksJson === 'object'
      && Object.values(profile.socialLinksJson).some(Boolean);
    if (hasSocialLinks) score += 5;

    return Math.min(100, score);
  }

  private mapProfile(profile: any) {
    return {
      id: profile.id,
      entityId: profile.entityId,
      description: profile.description,
      logoUrl: profile.logoUrl,
      coverImageUrl: profile.coverImageUrl,
      websiteUrl: profile.websiteUrl,
      industry: profile.industry,
      employerSize: profile.employerSize,
      foundedYear: profile.foundedYear,
      benefits: profile.benefitsJson || [],
      socialLinks: profile.socialLinksJson || {},
      isVerified: profile.isVerified,
      verifiedAt: profile.verifiedAt,
      profileCompletionPercent: this.calculateCompletion(profile),
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  private async createAuditLog(
    actorUserId: string,
    action: string,
    objectType: string,
    objectId: string,
    metadata: Record<string, any>,
  ) {
    await this.prisma.auditLog.create({
      data: { actorUserId, actorType: 'user', action, objectType, objectId, metadataJson: metadata },
    });
  }
}
