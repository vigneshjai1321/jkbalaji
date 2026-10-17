import type { PlotImportReview } from '../../generated/prisma/client.js';

export type GroupedPlotImportReview = {
  plotNumber: string;
  areasSqft: number[];
  reasons: string[];
  reviewIds: string[];
  latestAt: string;
};

/** Group unresolved reviews by plot number; merge duplicate warnings for the same conflict. */
export function groupPlotImportReviews(rows: PlotImportReview[]): GroupedPlotImportReview[] {
  const map = new Map<
    string,
    { plotNumber: string; areas: Set<number>; reasons: Set<string>; ids: string[]; latest: Date }
  >();

  for (const r of rows) {
    const plotNumber = r.suppliedPlotNumber.trim();
    const key = plotNumber.toUpperCase();
    const area = Number(r.areaSqft);
    const entry = map.get(key) ?? {
      plotNumber,
      areas: new Set<number>(),
      reasons: new Set<string>(),
      ids: [],
      latest: r.createdAt,
    };
    if (Number.isFinite(area)) entry.areas.add(Math.round(area * 100) / 100);
    entry.reasons.add(r.reason.trim());
    entry.ids.push(r.id);
    if (r.createdAt > entry.latest) entry.latest = r.createdAt;
    map.set(key, entry);
  }

  return [...map.values()]
    .map((g) => ({
      plotNumber: g.plotNumber,
      areasSqft: [...g.areas].sort((a, b) => a - b),
      reasons: [...g.reasons],
      reviewIds: g.ids,
      latestAt: g.latest.toISOString(),
    }))
    .sort((a, b) => a.plotNumber.localeCompare(b.plotNumber, undefined, { numeric: true }));
}
