import { loadColumnLayout, resetColumnLayout, saveColumnLayout, type ColumnLayoutDefaults } from './table-prefs';

export const PLOT_TABLE_PREFS_KEY = 'jkbalaji.plots.columns.v1';

export type PlotColumnId =
  | 'actions'
  | 'plotNumber'
  | 'areaSqft'
  | 'project'
  | 'status'
  | 'broker'
  | 'pricePerSqft'
  | 'basePrice'
  | 'hold'
  | 'surveyNumber'
  | 'facing'
  | 'dimensions'
  | 'customer'
  | 'description';

export const PINNED_PLOT_COLUMNS: PlotColumnId[] = ['actions', 'plotNumber', 'areaSqft'];

export const DEFAULT_PLOT_COLUMN_ORDER: PlotColumnId[] = [
  'actions',
  'plotNumber',
  'areaSqft',
  'project',
  'status',
  'broker',
  'pricePerSqft',
  'basePrice',
  'hold',
  'surveyNumber',
  'facing',
  'dimensions',
  'customer',
  'description',
];

export const DEFAULT_PLOT_COLUMN_VISIBLE: Record<PlotColumnId, boolean> = {
  actions: true,
  plotNumber: true,
  areaSqft: true,
  project: true,
  status: true,
  broker: true,
  pricePerSqft: true,
  basePrice: true,
  hold: true,
  surveyNumber: false,
  facing: false,
  dimensions: false,
  customer: true,
  description: false,
};

export type PlotTablePrefs = {
  order: PlotColumnId[];
  visible: Record<PlotColumnId, boolean>;
};

const PLOT_LAYOUT_DEFAULTS: ColumnLayoutDefaults = {
  order: DEFAULT_PLOT_COLUMN_ORDER,
  visible: DEFAULT_PLOT_COLUMN_VISIBLE,
  pinnedOrder: PINNED_PLOT_COLUMNS,
  requiredVisible: ['actions', 'plotNumber'],
};

function asPlotPrefs(layout: { order: string[]; visible: Record<string, boolean> }): PlotTablePrefs {
  return {
    order: layout.order as PlotColumnId[],
    visible: layout.visible as Record<PlotColumnId, boolean>,
  };
}

export function loadPlotTablePrefs(): PlotTablePrefs {
  return asPlotPrefs(loadColumnLayout(PLOT_TABLE_PREFS_KEY, PLOT_LAYOUT_DEFAULTS));
}

export function savePlotTablePrefs(prefs: PlotTablePrefs): PlotTablePrefs {
  return asPlotPrefs(saveColumnLayout(PLOT_TABLE_PREFS_KEY, { ...prefs, widths: {} }, PLOT_LAYOUT_DEFAULTS));
}

export function resetPlotTablePrefs(): PlotTablePrefs {
  return asPlotPrefs(resetColumnLayout(PLOT_TABLE_PREFS_KEY, PLOT_LAYOUT_DEFAULTS));
}

export const PLOT_COLUMN_LABELS: Record<PlotColumnId, string> = {
  actions: 'Actions',
  plotNumber: 'Plot #',
  areaSqft: 'Area (sq ft)',
  project: 'Project',
  status: 'Status',
  broker: 'Broker',
  pricePerSqft: '₹ / sq ft',
  basePrice: 'Base plot price',
  hold: 'Hold / customer',
  surveyNumber: 'Survey #',
  facing: 'Facing',
  dimensions: 'Dimensions',
  customer: 'Customer',
  description: 'Description',
};
