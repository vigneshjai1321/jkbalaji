import { describe, expect, it } from 'vitest';
import {
  canPlaceManualHold,
  canReleaseManualHold,
  latestManualHoldFromEvents,
  parseHoldDetail,
  serializeHoldDetail,
} from './plot-hold.js';

describe('plot-hold', () => {
  it('allows hold only on available plots', () => {
    expect(canPlaceManualHold('AVAILABLE')).toBe(true);
    expect(canPlaceManualHold('RESERVED')).toBe(false);
    expect(canPlaceManualHold('SOLD')).toBe(false);
    expect(canPlaceManualHold('BLOCKED')).toBe(false);
  });

  it('allows release only for reserved plots without quotation reservation', () => {
    expect(canReleaseManualHold('RESERVED', false)).toBe(true);
    expect(canReleaseManualHold('RESERVED', true)).toBe(false);
    expect(canReleaseManualHold('AVAILABLE', false)).toBe(false);
  });

  it('round-trips hold detail JSON', () => {
    const raw = serializeHoldDetail({
      type: 'MANUAL_HOLD',
      customerId: 'c1',
      notes: 'Enquiry',
      holdUntil: '2026-12-01',
    });
    expect(parseHoldDetail(raw)?.customerId).toBe('c1');
    expect(parseHoldDetail(raw)?.notes).toBe('Enquiry');
  });

  it('reads latest hold from events', () => {
    const meta = latestManualHoldFromEvents([
      { action: 'HOLD', detail: serializeHoldDetail({ type: 'MANUAL_HOLD', customerId: 'x' }), createdAt: new Date('2026-01-02') },
      { action: 'HOLD_RELEASED', detail: null, createdAt: new Date('2026-01-03') },
    ]);
    expect(meta.meta).toBeNull();
    expect(meta.released).toBe(true);
  });
});
