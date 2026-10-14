import { JK_NAGAR_PHASE_1_PLOT_ROWS } from './jk-nagar-phase-1-plots.js';

export type PlotImportRow = { plotNumber: string; areaSqft: number; sourceNote?: string };

export type PlotImportDuplicate = {
  plotNumber: string;
  keptAreaSqft: number;
  skippedAreaSqft: number;
  reason: string;
};

export type PlotImportConflict = {
  plotNumber: string;
  importAreaSqft: number;
  existingAreaSqft: number | null;
  reason: string;
};

export type PlotImportResult = {
  imported: Array<{ plotNumber: string; areaSqft: number; plotId: string; action: 'created' | 'skipped' }>;
  duplicates: PlotImportDuplicate[];
  conflicts: PlotImportConflict[];
};

function areasMatch(a: number, b: number) {
  return Math.abs(a - b) < 0.005;
}

export function planPlotImport(
  rows: PlotImportRow[],
  existing: Array<{ id: string; plotNumber: string; areaSqft: number | null }>,
): PlotImportResult {
  const imported: PlotImportResult['imported'] = [];
  const duplicates: PlotImportDuplicate[] = [];
  const conflicts: PlotImportConflict[] = [];
  const duplicateWarned = new Set<string>();
  const conflictWarned = new Set<string>();
  const seenInBatch = new Map<string, { area: number; plotNumber: string }>();

  const byNumber = new Map(existing.map((p) => [p.plotNumber.toUpperCase(), p]));

  for (const row of rows) {
    const key = row.plotNumber.trim();
    const upper = key.toUpperCase();
    const area = row.areaSqft;

    if (seenInBatch.has(upper)) {
      const kept = seenInBatch.get(upper)!;
      if (!duplicateWarned.has(upper)) {
        duplicateWarned.add(upper);
        duplicates.push({
          plotNumber: kept.plotNumber,
          keptAreaSqft: kept.area,
          skippedAreaSqft: area,
          reason: `Duplicate plot number in import list — kept ${kept.area} sq ft, skipped ${area} sq ft.`,
        });
      }
      continue;
    }

    const ex = byNumber.get(upper);
    if (ex) {
      const exArea = ex.areaSqft != null ? Number(ex.areaSqft) : null;
      if (exArea != null && areasMatch(exArea, area)) {
        imported.push({ plotNumber: key, areaSqft: area, plotId: ex.id, action: 'skipped' });
        seenInBatch.set(upper, { area: exArea, plotNumber: key });
        continue;
      }
      if (!conflictWarned.has(upper)) {
        conflictWarned.add(upper);
        conflicts.push({
          plotNumber: key,
          importAreaSqft: area,
          existingAreaSqft: exArea,
          reason:
            exArea != null
              ? `Plot already in database with ${exArea} sq ft — import row ${area} sq ft was not applied.`
              : 'Plot already in database without area — import row was not applied.',
        });
      }
      continue;
    }

    seenInBatch.set(upper, { area, plotNumber: key });
    imported.push({ plotNumber: key, areaSqft: area, plotId: '', action: 'created' });
  }

  return { imported, duplicates, conflicts };
}

export function jkNagarPhase1ImportRows(): PlotImportRow[] {
  return JK_NAGAR_PHASE_1_PLOT_ROWS;
}
