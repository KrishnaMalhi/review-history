import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  GoneException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { sanitizeInput } from '../../common/utils/helpers';
import * as crypto from 'crypto';

@Injectable()
export class ReviewInvitesService {
  private static readonly MAX_ACTIVE_INVITES_PER_ENTITY = 20;
  private readonly siteUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.siteUrl = this.config.get<string>('SITE_URL', 'https://reviewhistory.pk');
  }

  async create(entityId: string, dto: CreateInviteDto, userId: string) {
    // Verify entity exists
    const entity = await this.prisma.entity.findFirst({
      where: { id: entityId, deletedAt: null },
    });
    if (!entity) throw new NotFoundException('Entity not found');

    // Verify ownership
    const claim = await this.prisma.entityClaim.findFirst({
      where: { entityId, requesterUserId: userId, status: 'approved' },
    });
    if (!claim) throw new ForbiddenException('You must be the claimed owner of this entity');

    // Check active invite limit
    const activeCount = await this.prisma.reviewInvite.count({
      where: { entityId, status: 'active' },
    });
    if (activeCount >= ReviewInvitesService.MAX_ACTIVE_INVITES_PER_ENTITY) {
      throw new BadRequestException(`Maximum ${ReviewInvitesService.MAX_ACTIVE_INVITES_PER_ENTITY} active invites per entity`);
    }

    // Generate cryptographically secure token
    const token = crypto.randomBytes(32).toString('hex');

    const expiresInDays = dto.expiresInDays || 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const invite = await this.prisma.reviewInvite.create({
      data: {
        entityId,
        createdByUserId: userId,
        token,
        label: dto.label ? sanitizeInput(dto.label) : null,
        maxUses: dto.maxUses || null,
        expiresAt,
      },
    });

    // Log analytics event
    await this.prisma.analyticsEvent.create({
      data: {
        eventType: 'review_request_sent',
        entityId,
        userId,
        inviteId: invite.id,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId: userId,
        actorType: 'user',
        action: 'review_invite.created',
        objectType: 'review_invite',
        objectId: invite.id,
        metadataJson: { entityId, label: dto.label },
      },
    });

    return {
      id: invite.id,
      token: invite.token,
      shareUrl: `${this.siteUrl}/r/${invite.token}`,
      label: invite.label,
      maxUses: invite.maxUses,
      expiresAt: invite.expiresAt,
      createdAt: invite.createdAt,
    };
  }

  async listByEntity(entityId: string, userId: string) {
    // Verify ownership
    const claim = await this.prisma.entityClaim.findFirst({
      where: { entityId, requesterUserId: userId, status: 'approved' },
    });
    if (!claim) throw new ForbiddenException('You must be the claimed owner of this entity');

    const invites = await this.prisma.reviewInvite.findMany({
      where: { entityId },
      orderBy: { createdAt: 'desc' },
    });

    return invites.map((inv) => ({
      id: inv.id,
      token: inv.token,
      shareUrl: `${this.siteUrl}/r/${inv.token}`,
      label: inv.label,
      status: inv.status,
      maxUses: inv.maxUses,
      useCount: inv.useCount,
      openCount: inv.openCount,
      conversionRate: inv.openCount > 0 ? Math.round((inv.useCount / inv.openCount) * 1000) / 10 : 0,
      expiresAt: inv.expiresAt,
      createdAt: inv.createdAt,
    }));
  }

  async revoke(inviteId: string, userId: string) {
    const invite = await this.prisma.reviewInvite.findFirst({
      where: { id: inviteId, status: 'active' },
    });
    if (!invite) throw new NotFoundException('Active invite not found');

    // Verify ownership
    const claim = await this.prisma.entityClaim.findFirst({
      where: { entityId: invite.entityId, requesterUserId: userId, status: 'approved' },
    });
    if (!claim) throw new ForbiddenException('You must be the claimed owner');

    await this.prisma.reviewInvite.update({
      where: { id: inviteId },
      data: { status: 'revoked' },
    });

    return { message: 'Invite revoked' };
  }

  async resolveToken(token: string) {
    const invite = await this.prisma.reviewInvite.findUnique({
      where: { token },
      include: {
        entity: {
          select: {
            id: true,
            displayName: true,
            categoryId: true,
            category: { select: { key: true, nameEn: true } },
          },
        },
      },
    });

    if (!invite) throw new NotFoundException('Invalid review link');

    // Check status
    if (invite.status !== 'active') {
      throw new GoneException('This review link has been revoked');
    }

    // Check expiry
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      await this.prisma.reviewInvite.update({
        where: { id: invite.id },
        data: { status: 'expired' },
      });
      throw new GoneException('This review link has expired');
    }

    // Check max uses
    if (invite.maxUses && invite.useCount >= invite.maxUses) {
      await this.prisma.reviewInvite.update({
        where: { id: invite.id },
        data: { status: 'expired' },
      });
      throw new GoneException('This review link has reached its maximum uses');
    }

    // Increment open count
    await this.prisma.reviewInvite.update({
      where: { id: invite.id },
      data: { openCount: { increment: 1 } },
    });

    // Log analytics
    await this.prisma.analyticsEvent.create({
      data: {
        eventType: 'review_request_opened',
        entityId: invite.entityId,
        inviteId: invite.id,
      },
    });

    return {
      entityId: invite.entity.id,
      entityName: invite.entity.displayName,
      categoryKey: invite.entity.category.key,
      categoryName: invite.entity.category.nameEn,
      inviteLabel: invite.label,
    };
  }

  async recordConversion(inviteToken: string) {
    const invite = await this.prisma.reviewInvite.findUnique({
      where: { token: inviteToken },
    });
    if (!invite || invite.status !== 'active') return;

    await this.prisma.reviewInvite.update({
      where: { id: invite.id },
      data: { useCount: { increment: 1 } },
    });

    await this.prisma.analyticsEvent.create({
      data: {
        eventType: 'review_request_converted',
        entityId: invite.entityId,
        inviteId: invite.id,
      },
    });
  }
}
