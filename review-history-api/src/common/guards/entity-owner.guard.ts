import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class EntityOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const entityId = request.params?.entityId as string | undefined;
    const user = request.user as { sub?: string; role?: string } | undefined;

    if (!entityId) {
      throw new ForbiddenException('Entity id is required');
    }

    if (!user?.sub) {
      throw new ForbiddenException('Authentication required');
    }

    if (user.role === 'admin') {
      return true;
    }

    const entity = await this.prisma.entity.findUnique({
      where: { id: entityId },
      select: { id: true, claimedUserId: true, deletedAt: true },
    });

    if (!entity || entity.deletedAt) {
      throw new NotFoundException('Entity not found');
    }

    if (entity.claimedUserId !== user.sub) {
      throw new ForbiddenException('Only the claimed owner can perform this action');
    }

    return true;
  }
}
