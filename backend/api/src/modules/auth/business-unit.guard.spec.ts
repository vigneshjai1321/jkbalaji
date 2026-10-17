import { describe, expect, it } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { BusinessUnitGuard } from './business-unit.guard.js';

describe('BusinessUnitGuard', () => {
  function guardFor(unit?: 'REAL_ESTATE' | 'JEWELLERY') {
    const reflector = {
      getAllAndOverride: () => unit,
    } as unknown as Reflector;
    return new BusinessUnitGuard(reflector);
  }

  function ctx(role: string) {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user: { role } }),
      }),
    } as never;
  }

  it('allows super admin on real estate routes', () => {
    expect(guardFor('REAL_ESTATE').canActivate(ctx('SUPER_ADMIN'))).toBe(true);
  });

  it('blocks gold manager on real estate routes', () => {
    expect(() => guardFor('REAL_ESTATE').canActivate(ctx('GOLD_MANAGER'))).toThrow(ForbiddenException);
  });

  it('blocks real estate manager on jewellery routes', () => {
    expect(() => guardFor('JEWELLERY').canActivate(ctx('REAL_ESTATE_MANAGER'))).toThrow(ForbiddenException);
  });
});
