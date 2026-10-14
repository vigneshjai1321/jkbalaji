import { describe, expect, it } from 'vitest';
import { parseProjectWrite, ProjectValidationError } from './project-validation.js';

describe('parseProjectWrite', () => {
  it('accepts a minimal new project and keeps optional fields empty', () => {
    const parsed = parseProjectWrite(
      { name: 'JK Nagar — Phase 1', slug: 'jk-nagar-phase-1', phase: 'ALMOST_COMPLETED' },
      false,
    );
    expect(parsed.name).toBe('JK Nagar — Phase 1');
    expect(parsed.slug).toBe('jk-nagar-phase-1');
    expect(parsed.phase).toBe('ALMOST_COMPLETED');
    expect(parsed.published).toBe(false);
    expect(parsed.location).toBeNull();
  });

  it('rejects an invalid slug and a non-boolean publication flag', () => {
    expect(() => parseProjectWrite({ name: 'AB', slug: 'Bad Slug', phase: 'ONGOING' }, false)).toThrow(ProjectValidationError);
    expect(() =>
      parseProjectWrite({ name: 'Lake View', slug: 'lake-view', phase: 'ONGOING', published: 'yes' }, false),
    ).toThrow(/Publication/);
  });

  it('allows a partial update of publication only', () => {
    const parsed = parseProjectWrite({ published: true }, true);
    expect(parsed.published).toBe(true);
    expect(parsed.name).toBeUndefined();
  });
});
