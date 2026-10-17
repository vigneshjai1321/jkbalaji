import { describe, expect, it, vi } from 'vitest';
import { KjplAlertsService } from './kjpl-alerts.service.js';
import { mjdtaDisplayHealth, validateKjplParsed } from './kjpl-status.js';

describe('validateKjplParsed', () => {
  it('accepts plausible MJDTA values', () => {
    expect(
      validateKjplParsed({
        goldWithoutGstInr: 7200,
        silverWithoutGstInr: 85,
        goldWithGstInr: null,
        silverWithGstInr: null,
        sourceUpdatedAtText: null,
      }),
    ).toBe(true);
  });

  it('rejects implausible values', () => {
    expect(
      validateKjplParsed({
        goldWithoutGstInr: 50,
        silverWithoutGstInr: 85,
        goldWithGstInr: null,
        silverWithGstInr: null,
        sourceUpdatedAtText: null,
      }),
    ).toBe(false);
  });
});

describe('mjdtaDisplayHealth', () => {
  const now = Date.parse('2026-10-17T04:00:00.000Z');
  const staleAfter = 20 * 60 * 1000;

  it('keeps a failed refresh from looking live', () => {
    expect(mjdtaDisplayHealth('2026-10-17T03:40:00.000Z', '2026-10-17T03:50:00.000Z', 'timeout', now, staleAfter, false)).toBe(
      'stale',
    );
  });

  it('is fresh for a recent successful headline', () => {
    expect(mjdtaDisplayHealth('2026-10-17T03:50:00.000Z', '2026-10-17T03:49:00.000Z', null, now, staleAfter, false)).toBe(
      'fresh',
    );
  });

  it('is unavailable when no headline has been stored', () => {
    expect(mjdtaDisplayHealth(null, null, 'timeout', now, staleAfter, false)).toBe('unavailable');
  });
});

describe('KjplAlertsService', () => {
  it('filters jewellery alerts from real-estate managers', () => {
    const prisma = {
      appSetting: { findUnique: vi.fn(), upsert: vi.fn() },
      notification: { create: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    };
    const svc = new KjplAlertsService(prisma as never);
    const rows = [
      { body: 'Lead enquiry', title: 'x' },
      { body: '[JEWELLERY_KJPL]\nfail', title: 'y' },
    ];
    expect(svc.filterNotificationsForRole('REAL_ESTATE_MANAGER', rows)).toHaveLength(1);
    expect(svc.filterNotificationsForRole('GOLD_MANAGER', rows)).toHaveLength(2);
  });

  it('does not create duplicate failure notifications', async () => {
    const prisma = {
      appSetting: {
        findUnique: vi.fn().mockResolvedValue({
          value: JSON.stringify({
            lastAttemptAt: null,
            lastSuccessAt: null,
            lastErrorCategory: null,
            lastErrorMessage: null,
            nextScheduledAt: null,
            activeFailureNotificationId: 'n1',
          }),
        }),
        upsert: vi.fn(),
      },
      notification: {
        create: vi.fn(),
        update: vi.fn().mockResolvedValue({}),
        updateMany: vi.fn(),
      },
    };
    const svc = new KjplAlertsService(prisma as never);
    await svc.recordFailure('FETCH', 'timeout', null);
    expect(prisma.notification.create).not.toHaveBeenCalled();
    expect(prisma.notification.update).toHaveBeenCalled();
  });
});
