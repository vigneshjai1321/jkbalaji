import { describe, expect, it } from 'vitest';
import { defaultColumnLayout, moveColumn, normalizeColumnLayout, storageKeyForTable } from './table-prefs';

const defaults = {
  order: ['actions', 'name', 'phone', 'notes'],
  visible: { actions: true, name: true, phone: true, notes: false },
  widths: { actions: 100, name: 180, phone: 130, notes: 220 },
  pinnedOrder: ['actions'],
  requiredVisible: ['actions'],
  minWidth: 80,
  maxWidth: 300,
};

describe('normalizeColumnLayout', () => {
  it('drops unknown columns and appends missing ones', () => {
    const layout = normalizeColumnLayout(
      { order: ['notes', 'retired', 'actions'], visible: { notes: true }, widths: { notes: 10, phone: 9999 } },
      defaults,
    );
    expect(layout.order).toEqual(['actions', 'notes', 'name', 'phone']);
    expect(layout.visible.actions).toBe(true);
    expect(layout.visible.notes).toBe(true);
    expect(layout.widths.notes).toBe(80);
    expect(layout.widths.phone).toBe(300);
  });

  it('keeps a required column visible', () => {
    const layout = normalizeColumnLayout({ order: defaults.order, visible: { actions: false, name: false } }, defaults);
    expect(layout.visible.actions).toBe(true);
    expect(layout.visible.name).toBe(false);
  });

  it('resets to defaults', () => {
    const layout = defaultColumnLayout(defaults);
    expect(layout.visible.notes).toBe(false);
    expect(layout.order[0]).toBe('actions');
  });

  it('ignores invalid saved preferences', () => {
    const layout = normalizeColumnLayout('not-a-layout', defaults);
    expect(layout.order).toEqual(defaults.order);
    expect(layout.visible.notes).toBe(false);
    expect(layout.visible.actions).toBe(true);
  });

  it('keeps each table preference key separate', () => {
    expect(storageKeyForTable('plots')).not.toBe(storageKeyForTable('leads'));
    expect(storageKeyForTable('plots')).toBe('jkbalaji.table.plots.v1');
  });
});

describe('moveColumn', () => {
  it('reorders optional columns and refuses pinned ones', () => {
    expect(moveColumn(['actions', 'name', 'phone'], 'phone', 'name', ['actions'])).toEqual(['actions', 'phone', 'name']);
    expect(moveColumn(['actions', 'name', 'phone'], 'actions', 'phone', ['actions'])).toEqual(['actions', 'name', 'phone']);
  });
});
