import { describe, expect, it } from 'vitest';
import { istDateString, msUntilNextIstTime } from './goldapi-ist.js';

describe('istDateString', () => {
  it('returns YYYY-MM-DD', () => {
    expect(istDateString(new Date('2026-10-11T18:30:00.000Z'))).toBe('2026-10-12');
  });
});

describe('msUntilNextIstTime', () => {
  it('is positive and under 24h', () => {
    const ms = msUntilNextIstTime(9, 0);
    expect(ms).toBeGreaterThan(0);
    expect(ms).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
  });
});
