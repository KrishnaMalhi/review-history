import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { sanitizeInput } from '../../common/utils/helpers';
import { CampaignStatus } from '@prisma/client';

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    title: string;
    description?: string;
    categoryKey?: string;
    startDate: Date;
    endDate: Date;
    targetGoal?: number;
  }) {
    if (data.endDate <= data.startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    return this.prisma.campaign.create({
      data: {
        title: sanitizeInput(data.title),
        description: data.description ? sanitizeInput(data.description) : null,
        categoryKey: data.categoryKey || null,
        targetGoal: data.targetGoal || 0,
        startsAt: data.startDate,
        endsAt: data.endDate,
        status: 'draft',
      },
    });
  }

  async list(status?: CampaignStatus, page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;
    const where = status ? { status } : {};

    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        orderBy: { startsAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          _count: { select: { participants: true } },
        },
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return { items: campaigns, total, page, pageSize };
  }

  async getById(campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        _count: { select: { participants: true } },
      },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async activate(campaignId: string) {
    return this.prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'active' },
    });
  }

  async complete(campaignId: string) {
    return this.prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'ended' },
    });
  }

  async join(campaignId: string, userId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.status !== 'active') {
      throw new BadRequestException('Campaign is not active');
    }
    if (new Date() > campaign.endsAt) {
      throw new BadRequestException('Campaign has ended');
    }

    const existing = await this.prisma.campaignParticipant.findFirst({
      where: { campaignId, userId },
    });
    if (existing) throw new BadRequestException('Already joined this campaign');

    return this.prisma.campaignParticipant.create({
      data: { campaignId, userId },
    });
  }

  async recordProgress(campaignId: string, userId: string, incr: number = 1) {
    const participant = await this.prisma.campaignParticipant.findFirst({
      where: { campaignId, userId },
    });
    if (!participant) return null;

    return this.prisma.campaignParticipant.update({
      where: { id: participant.id },
      data: { progress: { increment: incr } },
    });
  }

  async getLeaderboard(campaignId: string, limit: number = 20) {
    return this.prisma.campaignParticipant.findMany({
      where: { campaignId },
      orderBy: { progress: 'desc' },
      take: limit,
      include: {
        user: { select: { id: true, displayName: true, trustLevel: true } },
      },
    });
  }
}
