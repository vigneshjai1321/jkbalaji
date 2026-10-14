/** Public-facing labels — JK Nagar slugs always show Ongoing without mutating admin/API phase enums. */
const JK_NAGAR_SLUGS = new Set(['jk-nagar-phase-1', 'jk-nagar-phase-2', 'jk-nagar-phase-3']);

const API_PHASE_LABEL: Record<string, string> = {
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  UPCOMING: 'Upcoming',
  ALMOST_COMPLETED: 'Almost Completed',
  YET_TO_BE_ANNOUNCED: 'Yet to Be Announced',
};

export function publicProjectStatusLabel(project: { slug: string; phase: string }): string {
  if (JK_NAGAR_SLUGS.has(project.slug)) return 'Ongoing';
  return API_PHASE_LABEL[project.phase] ?? project.phase;
}

export function isJkNagarSlug(slug: string): boolean {
  return JK_NAGAR_SLUGS.has(slug) || slug.startsWith('jk-nagar-');
}

export const JK_NAGAR_PUBLIC_STATUS = 'Ongoing' as const;

export const DEFAULT_PROJECT_LOCATION = 'Cheyyar, Tiruvannamalai District, Tamil Nadu';
