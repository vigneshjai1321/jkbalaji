import { BadRequestException, Injectable } from '@nestjs/common';
import { CommissionKind, CommissionRateSource, CommissionSettingsScope, Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../database/prisma.service.js';

export const COMMISSION_DEFAULT_KIND_KEY = 'commission.default.kind';
export const COMMISSION_DEFAULT_RATE_KEY = 'commission.default.rate';
export const DEFAULT_COMMISSION_RATE_PERCENT = 2;
export const MAX_COMMISSION_RATE_PERCENT = 25;
export const MAX_COMMISSION_FIXED_INR = 50_000_000;

export type ResolvedCommissionRate = {
  kind: CommissionKind;
  rate: number;
  source: CommissionRateSource;
};

@Injectable()
export class CommissionRateService {
  constructor(private readonly prisma: PrismaService) {}

  validateRate(kind: CommissionKind, rate: number) {
    if (!Number.isFinite(rate) || rate < 0) {
      throw new BadRequestException('Commission rate must be zero or more');
    }
    const rounded = Math.round(rate * 100) / 100;
    if (kind === CommissionKind.PERCENTAGE) {
      if (rounded > MAX_COMMISSION_RATE_PERCENT) {
        throw new BadRequestException(`Percentage rate cannot exceed ${MAX_COMMISSION_RATE_PERCENT}%`);
      }
    } else if (rounded > MAX_COMMISSION_FIXED_INR) {
      throw new BadRequestException('Fixed commission exceeds the allowed limit');
    }
    return rounded;
  }

  async ensureGlobalDefaults() {
    const existing = await this.prisma.appSetting.findMany({
      where: { key: { in: [COMMISSION_DEFAULT_KIND_KEY, COMMISSION_DEFAULT_RATE_KEY] } },
    });
    const keys = new Set(existing.map((r) => r.key));
    if (!keys.has(COMMISSION_DEFAULT_KIND_KEY)) {
      await this.prisma.appSetting.create({
        data: { key: COMMISSION_DEFAULT_KIND_KEY, value: CommissionKind.PERCENTAGE },
      });
    }
    if (!keys.has(COMMISSION_DEFAULT_RATE_KEY)) {
      await this.prisma.appSetting.create({
        data: { key: COMMISSION_DEFAULT_RATE_KEY, value: String(DEFAULT_COMMISSION_RATE_PERCENT) },
      });
    }
  }

  async getGlobalDefault(): Promise<{ kind: CommissionKind; rate: number; updatedAt: Date | null }> {
    await this.ensureGlobalDefaults();
    const rows = await this.prisma.appSetting.findMany({
      where: { key: { in: [COMMISSION_DEFAULT_KIND_KEY, COMMISSION_DEFAULT_RATE_KEY] } },
    });
    const kindRow = rows.find((r) => r.key === COMMISSION_DEFAULT_KIND_KEY);
    const rateRow = rows.find((r) => r.key === COMMISSION_DEFAULT_RATE_KEY);
    const kind =
      kindRow?.value === CommissionKind.FIXED ? CommissionKind.FIXED : CommissionKind.PERCENTAGE;
    const rate = this.validateRate(kind, Number(rateRow?.value ?? DEFAULT_COMMISSION_RATE_PERCENT));
    const updatedAt = rateRow?.updatedAt ?? kindRow?.updatedAt ?? null;
    return { kind, rate, updatedAt };
  }

  async resolveEffectiveRate(input: {
    brokerId?: string | null;
    projectId?: string | null;
  }): Promise<ResolvedCommissionRate> {
    if (input.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: input.projectId },
        select: { commissionKind: true, commissionRate: true },
      });
      if (project?.commissionKind != null && project.commissionRate != null) {
        const kind = project.commissionKind;
        const rate = this.validateRate(kind, Number(project.commissionRate));
        return { kind, rate, source: CommissionRateSource.PROJECT };
      }
    }
    if (input.brokerId) {
      const broker = await this.prisma.broker.findUnique({
        where: { id: input.brokerId },
        select: { commissionKind: true, commissionRate: true },
      });
      if (broker?.commissionKind != null && broker.commissionRate != null) {
        const kind = broker.commissionKind;
        const rate = this.validateRate(kind, Number(broker.commissionRate));
        return { kind, rate, source: CommissionRateSource.BROKER };
      }
    }
    const global = await this.getGlobalDefault();
    return { kind: global.kind, rate: global.rate, source: CommissionRateSource.GLOBAL };
  }

  async updateGlobalDefault(
    input: { kind: CommissionKind; rate: number },
    changedById?: string,
  ) {
    const rate = this.validateRate(input.kind, input.rate);
    await this.ensureGlobalDefaults();
    const prev = await this.getGlobalDefault();
    await this.prisma.$transaction(async (tx) => {
      await tx.appSetting.update({
        where: { key: COMMISSION_DEFAULT_KIND_KEY },
        data: { value: input.kind },
      });
      await tx.appSetting.update({
        where: { key: COMMISSION_DEFAULT_RATE_KEY },
        data: { value: String(rate) },
      });
      await tx.commissionSettingsAudit.create({
        data: {
          scope: CommissionSettingsScope.GLOBAL,
          kind: input.kind,
          rate,
          previousKind: prev.kind,
          previousRate: prev.rate,
          changedById: changedById ?? null,
        },
      });
    });
    return this.getGlobalDefault();
  }

  async auditBrokerRateChange(
    brokerId: string,
    next: { kind: CommissionKind | null; rate: number | null },
    prev: { kind: CommissionKind | null; rate: number | null },
    changedById?: string,
  ) {
    if (next.kind == null || next.rate == null) return;
    await this.prisma.commissionSettingsAudit.create({
      data: {
        scope: CommissionSettingsScope.BROKER,
        entityId: brokerId,
        kind: next.kind,
        rate: this.validateRate(next.kind, next.rate),
        previousKind: prev.kind ?? undefined,
        previousRate: prev.rate != null ? this.validateRate(prev.kind ?? next.kind, prev.rate) : undefined,
        changedById: changedById ?? null,
      },
    });
  }

  async auditProjectRateChange(
    projectId: string,
    next: { kind: CommissionKind | null; rate: number | null },
    prev: { kind: CommissionKind | null; rate: number | null },
    changedById?: string,
  ) {
    if (next.kind == null || next.rate == null) return;
    await this.prisma.commissionSettingsAudit.create({
      data: {
        scope: CommissionSettingsScope.PROJECT,
        entityId: projectId,
        kind: next.kind,
        rate: this.validateRate(next.kind, next.rate),
        previousKind: prev.kind ?? undefined,
        previousRate: prev.rate != null ? this.validateRate(prev.kind ?? next.kind, prev.rate) : undefined,
        changedById: changedById ?? null,
      },
    });
  }

  parseSort(sort?: string): { field: string; direction: 'asc' | 'desc' } {
    const allowed = new Set([
      'createdAt',
      'updatedAt',
      'expectedInr',
      'paidInr',
      'status',
      'name',
    ]);
    if (!sort?.trim()) return { field: 'createdAt', direction: 'desc' };
    const [fieldRaw, dir] = sort.split(':');
    const field = fieldRaw ?? 'createdAt';
    const f = allowed.has(field) ? field : 'createdAt';
    const direction = dir === 'asc' ? 'asc' : 'desc';
    return { field: f, direction };
  }

  commissionOrderBy(field: string, direction: 'asc' | 'desc'): Prisma.CommissionOrderByWithRelationInput {
    if (field === 'name') {
      return { broker: { name: direction } };
    }
    return { [field]: direction } as Prisma.CommissionOrderByWithRelationInput;
  }
}
