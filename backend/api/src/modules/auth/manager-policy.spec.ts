import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../../database/prisma.service.js';
import { UserRole } from '../../generated/prisma/client.js';
import { assertManagerMayChangeOwnPassword, resolveUserByLogin } from './manager-policy.js';

describe('assertManagerMayChangeOwnPassword', () => {
  it('blocks scoped managers', () => {
    expect(() => assertManagerMayChangeOwnPassword(UserRole.REAL_ESTATE_MANAGER)).toThrow(ForbiddenException);
    expect(() => assertManagerMayChangeOwnPassword(UserRole.GOLD_MANAGER)).toThrow(ForbiddenException);
  });

  it('allows super admin', () => {
    expect(() => assertManagerMayChangeOwnPassword(UserRole.SUPER_ADMIN)).not.toThrow();
  });
});

describe('resolveUserByLogin', () => {
  it('resolves loginId before email fallback', async () => {
    const user = { id: '1', email: 'realestate_admin@jkbalaji.in', loginId: 'realestateadmin' };
    const prisma = {
      user: {
        findUnique: vi.fn(),
        findFirst: vi.fn().mockResolvedValue(user),
      },
    };
    const found = await resolveUserByLogin(prisma as unknown as PrismaService, 'realestateadmin');
    expect(found).toBe(user);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { loginId: 'realestateadmin' } });
  });

  it('uses email lookup when identifier contains @', async () => {
    const user = { id: '2', email: 'admin@jkbalaji.in' };
    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue(user),
        findFirst: vi.fn(),
      },
    };
    const found = await resolveUserByLogin(prisma as unknown as PrismaService, 'admin@jkbalaji.in');
    expect(found).toBe(user);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'admin@jkbalaji.in' } });
  });
});
