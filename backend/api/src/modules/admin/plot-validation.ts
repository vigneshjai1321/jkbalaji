import { PlotStatus } from '../../generated/prisma/client.js';
import { computeBasePlotPrice } from './plot-calculations.js';

export class PlotValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlotValidationError';
  }
}

const STATUSES: PlotStatus[] = ['AVAILABLE', 'RESERVED', 'SOLD', 'BLOCKED'];

export type PlotWriteInput = {
  plotNumber: string;
  surveyNumber: string | null;
  projectId: string | null;
  areaSqft: number | null;
  lengthFt: number | null;
  widthFt: number | null;
  description: string | null;
  facing: string | null;
  status: PlotStatus;
  priceInr: number | null;
  pricePerSqftInr: number | null;
  customerId: string | null;
  brokerId: string | null;
  archived?: boolean;
};

function optionalText(value: unknown, max: number): string | null {
  if (value == null || value === '') return null;
  if (typeof value !== 'string') throw new PlotValidationError('Invalid text field');
  const t = value.trim();
  return t.length > max ? t.slice(0, max) : t || null;
}

function optionalNumber(value: unknown, label: string): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) throw new PlotValidationError(`${label} must be a non-negative number`);
  return n;
}

export function parsePlotWrite(body: Record<string, unknown>, partial: boolean): Partial<PlotWriteInput> {
  const out: Partial<PlotWriteInput> = {};

  if (!partial || body.plotNumber !== undefined) {
    const plotNumber = typeof body.plotNumber === 'string' ? body.plotNumber.trim() : '';
    if (plotNumber.length < 1 || plotNumber.length > 40) {
      throw new PlotValidationError('Plot number is required (max 40 characters)');
    }
    out.plotNumber = plotNumber;
  }

  if (!partial || body.projectId !== undefined) {
    out.projectId = typeof body.projectId === 'string' && body.projectId ? body.projectId : null;
    if (!partial && !out.projectId) throw new PlotValidationError('Choose a project for this plot');
  }

  if (!partial || body.status !== undefined) {
    const status = typeof body.status === 'string' ? body.status : 'AVAILABLE';
    if (!STATUSES.includes(status as PlotStatus)) throw new PlotValidationError('Invalid plot status');
    out.status = status as PlotStatus;
  }

  if (!partial || body.surveyNumber !== undefined) out.surveyNumber = optionalText(body.surveyNumber, 80);
  if (!partial || body.description !== undefined) out.description = optionalText(body.description, 2000);
  if (!partial || body.facing !== undefined) out.facing = optionalText(body.facing, 40);
  if (!partial || body.areaSqft !== undefined) out.areaSqft = optionalNumber(body.areaSqft, 'Area');
  if (!partial || body.lengthFt !== undefined) out.lengthFt = optionalNumber(body.lengthFt, 'Length');
  if (!partial || body.widthFt !== undefined) out.widthFt = optionalNumber(body.widthFt, 'Width');
  if (!partial || body.priceInr !== undefined) out.priceInr = optionalNumber(body.priceInr, 'Price');
  if (!partial || body.pricePerSqftInr !== undefined) out.pricePerSqftInr = optionalNumber(body.pricePerSqftInr, 'Price per sq ft');

  if (!partial || body.customerId !== undefined) {
    out.customerId = typeof body.customerId === 'string' && body.customerId ? body.customerId : null;
  }
  if (!partial || body.brokerId !== undefined) {
    out.brokerId = typeof body.brokerId === 'string' && body.brokerId ? body.brokerId : null;
  }

  if (body.archived !== undefined) {
    if (typeof body.archived !== 'boolean') throw new PlotValidationError('Archived must be true or false');
    out.archived = body.archived;
  }

  return out;
}

/** When rate and area are known, derive stored base price for listings. */
export function syncPlotBasePrice(
  areaSqft: number | null | undefined,
  pricePerSqftInr: number | null | undefined,
  explicitPriceInr: number | null | undefined,
): number | null {
  if (pricePerSqftInr != null && areaSqft != null && areaSqft > 0) {
    return computeBasePlotPrice(areaSqft, pricePerSqftInr);
  }
  return explicitPriceInr ?? null;
}

export function isPhase3ComingSoon(project: { slug: string; phase?: string } | null | undefined) {
  if (!project) return false;
  return project.slug === 'jk-nagar-phase-3' || project.phase === 'YET_TO_BE_ANNOUNCED';
}
