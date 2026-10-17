import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AuthService, TAB_UNLOCK_REQUIRED } from './auth.service.js';
import { TAB_UNLOCK_TYPE } from './tab-unlock.js';

describe('AuthService.requireTabUnlock', () => {
  const jwt = {
    verify: vi.fn(),
    signAsync: vi.fn(),
  };

  const svc = new AuthService({} as never, jwt as never, {} as never);

  it('requires tab headers', () => {
    expect(() => svc.requireTabUnlock({ sub: 'user-1', sid: 'sess-1' }, {})).toThrow(ForbiddenException);
    try {
      svc.requireTabUnlock({ sub: 'user-1' }, {});
    } catch (e) {
      const body = (e as ForbiddenException).getResponse() as { code?: string };
      expect(body.code).toBe(TAB_UNLOCK_REQUIRED);
    }
  });

  it('rejects invalid tab token', () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('bad token');
    });
    expect(() =>
      svc.requireTabUnlock(
        { sub: 'user-1', sid: 'sess-1' },
        { 'x-tab-id': 'tab-id-12345678', 'x-tab-token': 'bad' },
      ),
    ).toThrow(ForbiddenException);
  });

  it('accepts matching tab token payload', () => {
    jwt.verify.mockReturnValue({
      sub: 'user-1',
      sid: 'sess-1',
      tid: 'tab-id-12345678',
      typ: TAB_UNLOCK_TYPE,
    });
    expect(() =>
      svc.requireTabUnlock(
        { sub: 'user-1', sid: 'sess-1' },
        { 'x-tab-id': 'tab-id-12345678', 'x-tab-token': 'signed' },
      ),
    ).not.toThrow();
  });
});
