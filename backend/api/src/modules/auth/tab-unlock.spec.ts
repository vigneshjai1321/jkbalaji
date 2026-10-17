import { describe, expect, it } from 'vitest';
import { parseTabId, tabPayloadMatches, TAB_UNLOCK_TYPE } from './tab-unlock.js';

describe('parseTabId', () => {
  it('accepts a reasonable tab id', () => {
    expect(parseTabId('a1b2c3d4-e5f6-7890')).toBe('a1b2c3d4-e5f6-7890');
  });

  it('rejects empty or invalid ids', () => {
    expect(parseTabId('')).toBeNull();
    expect(parseTabId('short')).toBeNull();
    expect(parseTabId('bad id with spaces')).toBeNull();
  });
});

describe('tabPayloadMatches', () => {
  const access = { sub: 'user-1', sid: 'sess-1' };

  it('matches a valid tab token payload', () => {
    expect(
      tabPayloadMatches(access, 'tab-abc-12345', {
        sub: 'user-1',
        sid: 'sess-1',
        tid: 'tab-abc-12345',
        typ: TAB_UNLOCK_TYPE,
      }),
    ).toBe(true);
  });

  it('rejects wrong tab id or session', () => {
    expect(
      tabPayloadMatches(access, 'tab-abc-12345', {
        sub: 'user-1',
        sid: 'sess-2',
        tid: 'tab-abc-12345',
        typ: TAB_UNLOCK_TYPE,
      }),
    ).toBe(false);
    expect(
      tabPayloadMatches(access, 'other-tab-id', {
        sub: 'user-1',
        sid: 'sess-1',
        tid: 'tab-abc-12345',
        typ: TAB_UNLOCK_TYPE,
      }),
    ).toBe(false);
  });
});
