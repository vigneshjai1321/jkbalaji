import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CommissionKind } from '../../generated/prisma/client.js';
import { CommissionRateService, DEFAULT_COMMISSION_RATE_PERCENT } from './commission-rate.service.js';

describe('CommissionRateService', () => {
  const prisma = {
    appSetting: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    project: { findUnique: vi.fn() },
    broker: { findUnique: vi.fn() },
    commissionSettingsAudit: { create: vi.fn() },
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn(prisma)),
  };

  let service: CommissionRateService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CommissionRateService(prisma as never);
  });

  it('initializes global default to 2% when missing', async () => {
    prisma.appSetting.findMany.mockResolvedValue([]);
    prisma.appSetting.create.mockResolvedValue({});
    await service.ensureGlobalDefaults();
    expect(prisma.appSetting.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ value: String(DEFAULT_COMMISSION_RATE_PERCENT) }) }),
    );
  });

  it('preserves existing global rate', async () => {
    prisma.appSetting.findMany.mockResolvedValue([
      { key: 'commission.default.kind', value: CommissionKind.PERCENTAGE, updatedAt: new Date() },
      { key: 'commission.default.rate', value: '3.5', updatedAt: new Date() },
    ]);
    const global = await service.getGlobalDefault();
    expect(global.rate).toBe(3.5);
    expect(prisma.appSetting.create).not.toHaveBeenCalled();
  });

  it('prefers project rate over broker and global', async () => {
    prisma.project.findUnique.mockResolvedValue({
      commissionKind: CommissionKind.PERCENTAGE,
      commissionRate: 4,
    });
    const resolved = await service.resolveEffectiveRate({ projectId: 'p1', brokerId: 'b1' });
    expect(resolved.source).toBe('PROJECT');
    expect(resolved.rate).toBe(4);
    expect(prisma.broker.findUnique).not.toHaveBeenCalled();
  });

  it('uses broker rate when project override absent', async () => {
    prisma.project.findUnique.mockResolvedValue({ commissionKind: null, commissionRate: null });
    prisma.broker.findUnique.mockResolvedValue({
      commissionKind: CommissionKind.PERCENTAGE,
      commissionRate: 2.5,
    });
    const resolved = await service.resolveEffectiveRate({ projectId: 'p1', brokerId: 'b1' });
    expect(resolved.source).toBe('BROKER');
    expect(resolved.rate).toBe(2.5);
  });

  it('rejects excessive percentage', () => {
    expect(() => service.validateRate(CommissionKind.PERCENTAGE, 99)).toThrow();
  });
});
