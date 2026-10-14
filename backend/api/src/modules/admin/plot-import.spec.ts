import { describe, expect, it } from 'vitest';
import { jkNagarPhase1ImportRows, planPlotImport } from './plot-import.js';

describe('planPlotImport — JK Nagar Phase 1 list', () => {
  it('creates 45 plots, skips batch duplicates 10 and 28 once each', () => {
    const plan = planPlotImport(jkNagarPhase1ImportRows(), []);
    const created = plan.imported.filter((i) => i.action === 'created');
    expect(created).toHaveLength(45);
    expect(created.some((c) => c.plotNumber === '10' && c.areaSqft === 1278.75)).toBe(true);
    expect(created.some((c) => c.plotNumber === '28' && c.areaSqft === 736.23)).toBe(true);
    expect(created.some((c) => c.plotNumber === '5C' && c.areaSqft === 816)).toBe(true);

    expect(plan.duplicates).toHaveLength(2);
    expect(plan.duplicates.map((d) => d.plotNumber).sort()).toEqual(['10', '28']);
    const d10 = plan.duplicates.find((d) => d.plotNumber === '10')!;
    expect(d10.keptAreaSqft).toBe(1278.75);
    expect(d10.skippedAreaSqft).toBe(811.66);
    const d28 = plan.duplicates.find((d) => d.plotNumber === '28')!;
    expect(d28.keptAreaSqft).toBe(736.23);
    expect(d28.skippedAreaSqft).toBe(1200);
    expect(plan.conflicts).toHaveLength(0);
  });

  it('does not overwrite existing plot; reports conflict once', () => {
    const plan = planPlotImport(
      [{ plotNumber: '10', areaSqft: 811.66 }],
      [{ id: 'p1', plotNumber: '10', areaSqft: 1278.75 }],
    );
    expect(plan.imported).toHaveLength(0);
    expect(plan.conflicts).toHaveLength(1);
    expect(plan.conflicts[0]?.existingAreaSqft).toBe(1278.75);
    expect(plan.duplicates).toHaveLength(0);
  });

  it('skips re-import when database area matches', () => {
    const plan = planPlotImport(
      [{ plotNumber: '1A', areaSqft: 907.69 }],
      [{ id: 'x', plotNumber: '1A', areaSqft: 907.69 }],
    );
    expect(plan.imported).toEqual([{ plotNumber: '1A', areaSqft: 907.69, plotId: 'x', action: 'skipped' }]);
    expect(plan.conflicts).toHaveLength(0);
    expect(plan.duplicates).toHaveLength(0);
  });

  it('DB match then batch duplicate: kept area from database skip', () => {
    const rows = jkNagarPhase1ImportRows();
    const plan = planPlotImport(rows, [{ id: 'e10', plotNumber: '10', areaSqft: 1278.75 }]);
    const created = plan.imported.filter((i) => i.action === 'created');
    expect(created.some((c) => c.plotNumber === '10')).toBe(false);
    expect(plan.imported.find((i) => i.plotNumber === '10')?.action).toBe('skipped');
    expect(plan.duplicates.some((d) => d.plotNumber === '10' && d.skippedAreaSqft === 811.66)).toBe(true);
    expect(plan.duplicates.filter((d) => d.plotNumber === '10')).toHaveLength(1);
    expect(created.length).toBe(44);
  });
});
