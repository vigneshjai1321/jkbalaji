import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UserRole } from '../../generated/prisma/client.js';
import { BUSINESS_UNIT_KEY } from './business-unit.decorator.js';

const REAL_ESTATE_ONLY = new Set<UserRole>(['REAL_ESTATE_MANAGER', 'SALES_MANAGER']);
const JEWELLERY_ONLY = new Set<UserRole>(['GOLD_MANAGER']);

@Injectable()
export class BusinessUnitGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const unit = this.reflector.getAllAndOverride<'REAL_ESTATE' | 'JEWELLERY'>(BUSINESS_UNIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!unit) return true;

    const { user } = context.switchToHttp().getRequest<{ user?: { role: UserRole } }>();
    if (!user?.role) return false;
    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return true;

    if (unit === 'REAL_ESTATE' && JEWELLERY_ONLY.has(user.role)) {
      throw new ForbiddenException('This area is restricted to real estate administration');
    }
    if (unit === 'JEWELLERY' && REAL_ESTATE_ONLY.has(user.role)) {
      throw new ForbiddenException('This area is restricted to jewellery administration');
    }
    return true;
  }
}
