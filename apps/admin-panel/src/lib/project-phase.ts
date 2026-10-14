export const PROJECT_PHASES = [
  'ALMOST_COMPLETED',
  'ONGOING',
  'YET_TO_BE_ANNOUNCED',
  'UPCOMING',
  'COMPLETED',
] as const;

export type ProjectPhaseValue = (typeof PROJECT_PHASES)[number];

export const PROJECT_PHASE_LABEL: Record<string, string> = {
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  UPCOMING: 'Upcoming',
  ALMOST_COMPLETED: 'Almost Completed',
  YET_TO_BE_ANNOUNCED: 'Yet to Be Announced',
};

export function projectPhaseLabel(phase: string) {
  return PROJECT_PHASE_LABEL[phase] ?? phase;
}
