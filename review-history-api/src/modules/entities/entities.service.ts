import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateEntityDto } from './dto/create-entity.dto';
import { UpdateEntityDto } from './dto/update-entity.dto';
import { normalizeName, normalizePhone, generateFingerprint, sanitizeInput } from '../../common/utils/helpers';
import { Prisma } from '@prisma/client';
import { ReviewStreaksService } from '../review-streaks/review-streaks.service';

@Injectable()
export class EntitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reviewStreaks: ReviewStreaksService,
  ) {}

  async create(dto: CreateEntityDto, userId: string) {
    // Validate category
    const category = await this.prisma.category.findFirst({
      where: { key: dto.categoryKey, isActive: true },
    });
    if (!category) throw new BadRequestException('Invalid category');

    // Validate city
    const city = await this.prisma.city.findUnique({ where: { id: dto.cityId } });
    if (!city) throw new BadRequestException('Invalid city');

    // Validate locality if provided
    if (dto.localityId) {
      const locality = await this.prisma.locality.findFirst({
        where: { id: dto.localityId, cityId: dto.cityId },
      });
      if (!locality) throw new BadRequestException('Invalid locality for this city');
    }

    const normalizedName = normalizeName(dto.displayName);
    const sanitizedName = sanitizeInput(dto.displayName);
    const normalizedPhoneValue = dto.phone ? normalizePhone(dto.phone) : null;

    // Generate fingerprint
    const fingerprint = generateFingerprint([
      normalizedName,
      category.key,
      city.nameEn,
      dto.localityId || '',
      normalizedPhoneValue || '',
    ]);

    // Check for duplicates
    const duplicateCandidates = await this.findDuplicateCandidates(
      normalizedName,
      category.id,
      dto.cityId,
      normalizedPhoneValue,
    );

    // Create entity
    const entity = await this.prisma.entity.create({
      data: {
        categoryId: category.id,
        displayName: sanitizedName,
        normalizedName,
        phoneE164: normalizedPhoneValue,
        addressLine: dto.addressLine ? sanitizeInput(dto.addressLine) : null,
        landmark: dto.landmark ? sanitizeInput(dto.landmark) : null,
        cityId: dto.cityId,
        localityId: dto.localityId || null,
        entityFingerprint: fingerprint,
        createdByUserId: userId,
      },
      include: {
        category: { select: { key: true, nameEn: true } },
        city: { select: { nameEn: true } },
        locality: { select: { nameEn: true } },
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        actorUserId: userId,
        actorType: 'user',
        action: 'entity.created',
        objectType: 'entity',
        objectId: entity.id,
        metadataJson: { categoryKey: dto.categoryKey, displayName: sanitizedName },
      },
    });

    await this.reviewStreaks.recordActivity(userId, 'add_listing');

    return {
      entityId: entity.id,
      entity: this.mapEntityResponse(entity),
      duplicateCandidates: duplicateCandidates.map((d) => ({
        id: d.id,
        displayName: d.displayName,
        category: d.category.nameEn,
        city: d.city.nameEn,
        locality: d.locality?.nameEn,
        trustScore: d.trustScore,
        reviewCount: d.reviewCount,
      })),
    };
  }

  async findById(id: string) {
    const entity = await this.prisma.entity.findFirst({
      where: { id, deletedAt: null, status: { notIn: ['merged', 'archived'] } },
      include: {
        category: { select: { id: true, key: true, nameEn: true, nameUr: true } },
        city: { select: { id: true, nameEn: true, nameUr: true } },
        locality: { select: { id: true, nameEn: true, nameUr: true } },
        aliases: { select: { aliasText: true, aliasType: true } },
      },
    });

    if (!entity) throw new NotFoundException('Entity not found');
    return this.mapEntityDetailResponse(entity);
  }

  async update(id: string, dto: UpdateEntityDto, userId: string, userRole: string) {
    const entity = await this.prisma.entity.findFirst({
      where: { id, deletedAt: null },
    });

    if (!entity) throw new NotFoundException('Entity not found');

    // Only claimed owner or admin can update
    const isAdmin = ['admin', 'super_admin'].includes(userRole);
    const isClaimedOwner = entity.isClaimed && entity.claimedUserId === userId;
    if (!isAdmin && !isClaimedOwner) {
      throw new BadRequestException('Only claimed owners or admins can edit entity profiles');
    }

    const updateData: Prisma.EntityUpdateInput = {};
    if (dto.addressLine !== undefined) updateData.addressLine = sanitizeInput(dto.addressLine);
    if (dto.landmark !== undefined) updateData.landmark = sanitizeInput(dto.landmark);
    if (dto.phone !== undefined) updateData.phoneE164 = normalizePhone(dto.phone);

    const updated = await this.prisma.entity.update({
      where: { id },
      data: updateData,
      include: {
        category: { select: { key: true, nameEn: true } },
        city: { select: { nameEn: true } },
        locality: { select: { nameEn: true } },
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: userId,
        actorType: 'user',
        action: 'entity.updated',
        objectType: 'entity',
        objectId: id,
        metadataJson: { changes: JSON.parse(JSON.stringify(dto)) },
      },
    });

    return this.mapEntityResponse(updated);
  }

  private async findDuplicateCandidates(
    normalizedName: string,
    categoryId: string,
    cityId: string,
    phone: string | null,
  ) {
    // Find entities with similar name in same city+category
    const candidates = await this.prisma.entity.findMany({
      where: {
        deletedAt: null,
        status: { notIn: ['merged', 'archived', 'suspended'] },
        categoryId,
        cityId,
        OR: [
          { normalizedName: { contains: normalizedName.substring(0, Math.min(normalizedName.length, 10)) } },
          ...(phone ? [{ phoneE164: phone }] : []),
        ],
      },
      take: 5,
      include: {
        category: { select: { nameEn: true } },
        city: { select: { nameEn: true } },
        locality: { select: { nameEn: true } },
      },
    });

    return candidates;
  }

  private mapEntityResponse(entity: any) {
    return {
      id: entity.id,
      displayName: entity.displayName,
      category: entity.category?.nameEn || entity.category?.key,
      categoryKey: entity.category?.key,
      city: entity.city?.nameEn,
      locality: entity.locality?.nameEn || null,
      phone: entity.phoneE164,
      addressLine: entity.addressLine,
      landmark: entity.landmark,
      trustScore: entity.trustScore,
      averageRating: Number(entity.averageRating),
      reviewCount: entity.reviewCount,
      isClaimed: entity.isClaimed,
      status: entity.status,
    };
  }

  private mapEntityDetailResponse(entity: any) {
    return {
      ...this.mapEntityResponse(entity),
      categoryId: entity.category?.id,
      categoryNameUr: entity.category?.nameUr,
      cityId: entity.city?.id,
      cityNameUr: entity.city?.nameUr,
      localityId: entity.locality?.id,
      localityNameUr: entity.locality?.nameUr,
      suspiciousReviewCount: entity.suspiciousReviewCount,
      hiddenReviewCount: entity.hiddenReviewCount,
      lastReviewedAt: entity.lastReviewedAt,
      aliases: entity.aliases || [],
      createdAt: entity.createdAt,
    };
  }
}
