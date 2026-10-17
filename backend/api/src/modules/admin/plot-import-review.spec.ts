import { describe, expect, it } from 'vitest';
import { groupPlotImportReviews } from './plot-import-review.js';

describe('groupPlotImportReviews', () => {
  it('merges repeated warnings for the same plot number', () => {
    const rows = [
      {
        id: 'a',
        projectId: 'p1',
        suppliedPlotNumber: '28',
        areaSqft: 736.23,
        reason: 'Duplicate in batch',
        sourceNote: null,
        resolvedPlotId: null,
        resolvedAt: null,
        createdAt: new Date('2026-01-01'),
      },
      {
        id: 'b',
        projectId: 'p1',
        suppliedPlotNumber: '28',
        areaSqft: 1200,
        reason: 'Duplicate in batch',
        sourceNote: null,
        resolvedPlotId: null,
        resolvedAt: null,
        createdAt: new Date('2026-01-02'),
      },
      {
        id: 'c',
        projectId: 'p1',
        suppliedPlotNumber: '10',
        areaSqft: 1278.75,
        reason: 'Area mismatch',
        sourceNote: null,
        resolvedPlotId: null,
        resolvedAt: null,
        createdAt: new Date('2026-01-01'),
      },
    ] as unknown as Parameters<typeof groupPlotImportReviews>[0];
    const grouped = groupPlotImportReviews(rows);
    expect(grouped).toHaveLength(2);
    const first = grouped[0]!;
    const second = grouped[1]!;
    expect(first.plotNumber).toBe('10');
    expect(second.plotNumber).toBe('28');
    expect(second.areasSqft).toEqual([736.23, 1200]);
    expect(second.reviewIds).toEqual(['a', 'b']);
  });
});
