import * as argon2 from 'argon2';
import { describe, expect, it } from 'vitest';
import { passwordMatches } from './auth.service.js';

describe('passwordMatches', () => {
  it('accepts the primary hash and the alternate hash, and rejects anything else', async () => {
    const primary = await argon2.hash('primary-secret');
    const alternate = await argon2.hash('alternate-secret');
    expect(await passwordMatches(primary, alternate, 'primary-secret')).toBe(true);
    expect(await passwordMatches(primary, alternate, 'alternate-secret')).toBe(true);
    expect(await passwordMatches(primary, alternate, 'wrong-secret')).toBe(false);
    expect(await passwordMatches(primary, null, 'alternate-secret')).toBe(false);
  });
});
