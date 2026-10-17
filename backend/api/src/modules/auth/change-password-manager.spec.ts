import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { UserRole } from '../../generated/prisma/client.js';
import { AuthService } from './auth.service.js';

describe('AuthService.changePassword for managers', () => {
  it('rejects password change for REAL_ESTATE_MANAGER', async () => {
    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'u1',
          role: UserRole.REAL_ESTATE_MANAGER,
          isActive: true,
          passwordHash: 'hash',
          passwordHashAlt: null,
        }),
      },
    };
    const svc = new AuthService(prisma as never, {} as never, {} as never);
    await expect(svc.changePassword('u1', 'old', 'NewPassword1', undefined)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
