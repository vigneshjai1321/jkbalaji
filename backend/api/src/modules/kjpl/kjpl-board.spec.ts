import { describe, expect, it } from 'vitest';
import { boardDisplayHealth, extractKjplSocketToken, parseKjplBoardMessage } from './kjpl-board.js';

const SAMPLE = [
  'R',
  '3|47|-|15081.00',
  '2|GOLD|147965|148000|148833|147520',
  '2|SILVER|211418|211450|213990|210700',
  '2|GOLD 1KG 99.99|999|1000|1001|998',
  '1|G|4165.18|4165.58|4198.94|4146.70',
  '1|S|56.98|57.00|57.98|56.86',
].join('\n');

describe('parseKjplBoardMessage', () => {
  it('keeps only the GOLD and SILVER board rows and maps buy, sell, high, low', () => {
    const parsed = parseKjplBoardMessage(SAMPLE);
    expect(parsed.GOLD).toEqual({ description: 'GOLD', buying: 147965, selling: 148000, high: 148833, low: 147520 });
    expect(parsed.SILVER).toEqual({
      description: 'SILVER',
      buying: 211418,
      selling: 211450,
      high: 213990,
      low: 210700,
    });
    expect(Object.keys(parsed)).toEqual(['GOLD', 'SILVER']);
  });

  it('ignores heartbeat, spot quotes, and product rows', () => {
    expect(parseKjplBoardMessage('R\n1|G|1|2|3|4\n2|GOLD 100 GMS 999 Chennai|1|2|3|4')).toEqual({});
  });
});

describe('extractKjplSocketToken', () => {
  it('reads the public page token', () => {
    expect(extractKjplSocketToken('var SOCKET_TOKEN = "a".repeat is not; SOCKET_TOKEN = "ab";')).toBeNull();
    const token = 'a'.repeat(64);
    expect(extractKjplSocketToken(`var SOCKET_TOKEN = "${token}";`)).toBe(token);
  });
});

describe('boardDisplayHealth', () => {
  const quote = { description: 'GOLD' as const, buying: 1, selling: 2, high: 3, low: 1 };
  const silver = { ...quote, description: 'SILVER' as const };
  const now = Date.parse('2026-10-17T04:00:00.000Z');

  it('does not call a failed refresh live', () => {
    expect(
      boardDisplayHealth(
        {
          gold: quote,
          silver,
          fetchedAt: '2026-10-17T03:50:00.000Z',
          lastAttemptAt: '2026-10-17T03:55:00.000Z',
          lastError: 'socket failed',
        },
        now,
        20 * 60 * 1000,
        false,
      ),
    ).toBe('stale');
  });

  it('is fresh only for a recent successful snapshot', () => {
    expect(
      boardDisplayHealth(
        {
          gold: quote,
          silver,
          fetchedAt: '2026-10-17T03:50:00.000Z',
          lastAttemptAt: '2026-10-17T03:50:00.000Z',
          lastError: null,
        },
        now,
        20 * 60 * 1000,
        false,
      ),
    ).toBe('fresh');
  });

  it('is unavailable when no valid snapshot exists', () => {
    expect(boardDisplayHealth(null, now, 20 * 60 * 1000, false)).toBe('unavailable');
  });
});
