/** Marketing copy for JK Nagar — not stored in PostgreSQL. Public status is always "Ongoing" on the website. */
export type JkNagarPhaseId = 'phase-1' | 'phase-2' | 'phase-3';

export type JkNagarFacility = {
  label: string;
};

export type JkNagarPhase = {
  id: JkNagarPhaseId;
  name: string;
  /** Public website badge (admin DB phase enum may differ). */
  publicStatusLabel: 'Ongoing';
  summary: string;
  locationLabel: string;
  /** Verified Google Maps place URL — null when not yet confirmed for that phase. */
  mapsPlaceUrl: string | null;
  facilities: JkNagarFacility[];
  imageIndex: number;
  slug: `jk-nagar-${JkNagarPhaseId}`;
};

export const JK_NAGAR_PHASES: JkNagarPhase[] = [
  {
    id: 'phase-1',
    slug: 'jk-nagar-phase-1',
    name: 'JK Nagar — Phase 1',
    publicStatusLabel: 'Ongoing',
    summary:
      'Our first JK Nagar layout with planning aligned to applicable regulations, documentation support, and guided site visits. Enquire for current plot availability and pricing.',
    locationLabel: 'JK Nagar Phase 1, Cheyyar area, Tiruvannamalai District, Tamil Nadu',
    /** From verified Google Maps embed (JK Nagar Phase -1). */
    mapsPlaceUrl:
      'https://www.google.com/maps/place/JK+Nagar+Phase+-1/@12.672703,79.546374,17z/data=!3m1!4b1!4m6!3m5!1s0x3a52d7338ed9cac1:0x857033cbd1ea95d!8m2!3d12.672703!4d79.546374',
    facilities: [{ label: 'Guided site visits' }, { label: 'Documentation support' }],
    imageIndex: 0,
  },
  {
    id: 'phase-2',
    slug: 'jk-nagar-phase-2',
    name: 'JK Nagar — Phase 2',
    publicStatusLabel: 'Ongoing',
    summary:
      'Phase 2 development continues with layout and infrastructure work in progress. Contact our team for current plot enquiry, facilities, and visit scheduling.',
    locationLabel: 'JK Nagar Phase 2, Cheyyar area, Tiruvannamalai District, Tamil Nadu',
    mapsPlaceUrl: null,
    facilities: [{ label: 'Guided site visits' }],
    imageIndex: 1,
  },
  {
    id: 'phase-3',
    slug: 'jk-nagar-phase-3',
    name: 'JK Nagar — Phase 3',
    publicStatusLabel: 'Ongoing',
    summary:
      'JK Nagar Phase 3 is underway. Submit your enquiry and our team will help you understand current plot availability, applicable pricing, facilities, and site visit arrangements.',
    locationLabel: 'JK Nagar Phase 3, Cheyyar area, Tiruvannamalai District, Tamil Nadu',
    mapsPlaceUrl: null,
    facilities: [{ label: 'Enquiry & updates from our team' }],
    imageIndex: 2,
  },
];

export function leadTypeForPhase(id: JkNagarPhaseId) {
  return `JK_NAGAR_${id.replace(/-/g, '_').toUpperCase()}`;
}
