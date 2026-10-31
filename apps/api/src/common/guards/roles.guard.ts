import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@dars/contracts';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AppError } from '../errors/app.error';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw AppError.forbidden('Forbidden: User role not identified');
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw AppError.forbidden(
        `Forbidden: Role '${user.role}' lacks permission for this action`,
      );
    }

    return true;
  }
}
