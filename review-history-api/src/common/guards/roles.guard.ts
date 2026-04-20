import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    // Role hierarchy: super_admin > admin > moderator > claimed_owner > user > guest
    const roleHierarchy: Record<string, number> = {
      guest: 0,
      user: 1,
      claimed_owner: 2,
      moderator: 3,
      admin: 4,
      super_admin: 5,
    };

    const userLevel = roleHierarchy[user.role] ?? 0;

    return requiredRoles.some((role) => {
      const requiredLevel = roleHierarchy[role] ?? 0;
      return userLevel >= requiredLevel;
    });
  }
}
