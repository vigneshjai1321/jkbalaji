/** Marketing copy for JK Nagar — not stored in PostgreSQL. */
export type JkNagarPhaseId = 'phase-1' | 'phase-2' | 'phase-3';

export type JkNagarPhase = {
  id: JkNagarPhaseId;
  name: string;
  statusLabel: string;
  summary: string;
  plotsAvailable: boolean;
  imageIndex: number;
};

export const JK_NAGAR_PHASES: JkNagarPhase[] = [
  {
    id: 'phase-1',
    name: 'JK Nagar — Phase 1',
    statusLabel: 'Almost Completed',
    summary:
      'Our first JK Nagar layout with DTCP-aligned planning, clear documentation support, and guided site visits. Enquire for remaining plot availability.',
    plotsAvailable: true,
    imageIndex: 0,
  },
  {
    id: 'phase-2',
    name: 'JK Nagar — Phase 2',
    statusLabel: 'Ongoing',
    summary:
      'Phase 2 development is in progress with ongoing infrastructure and layout work. Contact our team for current plot enquiry and visit scheduling.',
    plotsAvailable: true,
    imageIndex: 1,
  },
  {
    id: 'phase-3',
    name: 'JK Nagar — Phase 3',
    statusLabel: 'Yet to Be Announced',
    summary:
      'The next JK Nagar phase will be announced officially. Register your interest and we will notify you when details are published — bookings are not open yet.',
    plotsAvailable: false,
    imageIndex: 2,
  },
];

export function leadTypeForPhase(id: JkNagarPhaseId) {
  return `JK_NAGAR_${id.replace(/-/g, '_').toUpperCase()}`;
}
