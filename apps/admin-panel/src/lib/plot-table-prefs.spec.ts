import { describe, expect, it } from 'vitest';
import { DEFAULT_PLOT_COLUMN_ORDER, resetPlotTablePrefs, savePlotTablePrefs } from './plot-table-prefs';

describe('plot-table-prefs', () => {
  it('keeps actions, plot number, and area first after messy order', () => {
    const saved = savePlotTablePrefs({
      order: [
        'project',
        'plotNumber',
        'actions',
        ...DEFAULT_PLOT_COLUMN_ORDER.filter((c) => !['project', 'plotNumber', 'actions'].includes(c)),
      ],
      visible: resetPlotTablePrefs().visible,
    });
    expect(saved.order[0]).toBe('actions');
    expect(saved.order[1]).toBe('plotNumber');
    expect(saved.order[2]).toBe('areaSqft');
  });

  it('always keeps actions and plot number visible', () => {
    const next = savePlotTablePrefs({
      order: [...DEFAULT_PLOT_COLUMN_ORDER],
      visible: { ...resetPlotTablePrefs().visible, actions: false, plotNumber: false },
    });
    expect(next.visible.actions).toBe(true);
    expect(next.visible.plotNumber).toBe(true);
  });
});
