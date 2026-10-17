export const PROJECT_PHASES = [
  'ONGOING',
  'COMPLETED',
  'UPCOMING',
  'ALMOST_COMPLETED',
  'YET_TO_BE_ANNOUNCED',
] as const;

export type ProjectPhaseValue = (typeof PROJECT_PHASES)[number];

export const PROJECT_PHASE_LABEL: Record<ProjectPhaseValue, string> = {
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  UPCOMING: 'Upcoming',
  ALMOST_COMPLETED: 'Almost Completed',
  YET_TO_BE_ANNOUNCED: 'Yet to Be Announced',
};

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const PROJECT_LIFECYCLES = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'] as const;
export type ProjectLifecycleValue = (typeof PROJECT_LIFECYCLES)[number];

export type ProjectWriteInput = {
  name: string;
  slug: string;
  location: string | null;
  description: string | null;
  phase: ProjectPhaseValue;
  phaseLabel: string | null;
  coverImage: string | null;
  published: boolean;
  lifecycle?: ProjectLifecycleValue;
  notes?: string | null;
  commissionKind?: 'PERCENTAGE' | 'FIXED' | null;
  commissionRate?: number | null;
};

export class ProjectValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProjectValidationError';
  }
}

function optionalText(value: unknown, label: string, max: number): string | null {
  if (value == null || value === '') return null;
  if (typeof value !== 'string') throw new ProjectValidationError(`${label} must be text`);
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > max) throw new ProjectValidationError(`${label} must be ${max} characters or fewer`);
  return trimmed;
}

function coverImage(value: unknown): string | null {
  const text = optionalText(value, 'Cover image', 500);
  if (!text) return null;
  const ok = text.startsWith('/') || /^https:\/\/\S+$/i.test(text);
  if (!ok) throw new ProjectValidationError('Cover image must be an https URL or a site path');
  return text;
}

export function parseProjectWrite(body: Record<string, unknown>, partial: boolean): Partial<ProjectWriteInput> {
  const out: Partial<ProjectWriteInput> = {};

  if (!partial || body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length < 2) {
      throw new ProjectValidationError('Project name is required');
    }
    if (body.name.trim().length > 160) throw new ProjectValidationError('Project name must be 160 characters or fewer');
    out.name = body.name.trim();
  }

  if (!partial || body.slug !== undefined) {
    const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : '';
    if (!SLUG.test(slug) || slug.length > 80) {
      throw new ProjectValidationError('Slug must use lowercase letters, numbers, and hyphens');
    }
    out.slug = slug;
  }

  if (!partial || body.phase !== undefined) {
    const phase = typeof body.phase === 'string' ? body.phase : 'ONGOING';
    if (!PROJECT_PHASES.includes(phase as ProjectPhaseValue)) {
      throw new ProjectValidationError('Choose a valid project status');
    }
    out.phase = phase as ProjectPhaseValue;
  }

  if (!partial || body.location !== undefined) out.location = optionalText(body.location, 'Location', 200);
  if (!partial || body.description !== undefined) out.description = optionalText(body.description, 'Description', 4000);
  if (body.lifecycle !== undefined) {
    if (typeof body.lifecycle !== 'string' || !PROJECT_LIFECYCLES.includes(body.lifecycle as ProjectLifecycleValue)) {
      throw new ProjectValidationError('Choose a valid project lifecycle');
    }
    out.lifecycle = body.lifecycle as ProjectLifecycleValue;
  }
  if (!partial || body.notes !== undefined) out.notes = optionalText(body.notes, 'Notes', 4000);
  if (!partial || body.phaseLabel !== undefined) out.phaseLabel = optionalText(body.phaseLabel, 'Phase', 40);
  if (!partial || body.coverImage !== undefined) out.coverImage = coverImage(body.coverImage);

  if (body.published === undefined) {
    out.published = partial ? undefined : false;
  } else if (typeof body.published !== 'boolean') {
    throw new ProjectValidationError('Publication must be true or false');
  } else {
    out.published = body.published;
  }

  if (body.commissionKind !== undefined || body.commissionRate !== undefined) {
    if (body.commissionKind == null || body.commissionKind === '') {
      out.commissionKind = null;
      out.commissionRate = null;
    } else if (body.commissionKind === 'PERCENTAGE' || body.commissionKind === 'FIXED') {
      out.commissionKind = body.commissionKind;
      const rate = Number(body.commissionRate);
      if (!Number.isFinite(rate) || rate < 0) throw new ProjectValidationError('Commission rate must be zero or more');
      out.commissionRate = Math.round(rate * 100) / 100;
    } else {
      throw new ProjectValidationError('Commission kind must be PERCENTAGE or FIXED');
    }
  }

  return out;
}

export const JK_NAGAR_PROJECTS: ProjectWriteInput[] = [
  {
    name: 'JK Nagar — Phase 1',
    slug: 'jk-nagar-phase-1',
    phase: 'ALMOST_COMPLETED',
    phaseLabel: 'Phase 1',
    location: null,
    coverImage: null,
    published: true,
    description:
      'Our first JK Nagar layout with DTCP-aligned planning, clear documentation support, and guided site visits. Enquire for remaining plot availability.',
  },
  {
    name: 'JK Nagar — Phase 2',
    slug: 'jk-nagar-phase-2',
    phase: 'ONGOING',
    phaseLabel: 'Phase 2',
    location: null,
    coverImage: null,
    published: true,
    description:
      'Phase 2 development is in progress with ongoing infrastructure and layout work. Contact our team for current plot enquiry and visit scheduling.',
  },
  {
    name: 'JK Nagar — Phase 3',
    slug: 'jk-nagar-phase-3',
    phase: 'YET_TO_BE_ANNOUNCED',
    phaseLabel: 'Phase 3',
    location: null,
    coverImage: null,
    published: true,
    description:
      'The next JK Nagar phase will be announced officially. Register your interest and we will notify you when details are published. Bookings are not open yet.',
  },
];

export const LEAD_TYPE_PROJECT_SLUG: Record<string, string> = {
  JK_NAGAR_PHASE_1: 'jk-nagar-phase-1',
  JK_NAGAR_PHASE_2: 'jk-nagar-phase-2',
  JK_NAGAR_PHASE_3: 'jk-nagar-phase-3',
};
