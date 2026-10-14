import { describe, expect, it } from 'vitest';
import { PlotValidationError, parsePlotWrite } from './plot-validation.js';

describe('parsePlotWrite', () => {
  it('requires plot number and project on create', () => {
    expect(() => parsePlotWrite({}, false)).toThrow(PlotValidationError);
    expect(() => parsePlotWrite({ plotNumber: 'A-1' }, false)).toThrow(/project/i);
  });

  it('parses full create payload', () => {
    const out = parsePlotWrite(
      {
        plotNumber: ' 12 ',
        projectId: 'proj1',
        status: 'AVAILABLE',
        areaSqft: 1200,
        lengthFt: 40,
        widthFt: 30,
        priceInr: 500000,
        description: 'Corner',
      },
      false,
    );
    expect(out.plotNumber).toBe('12');
    expect(out.projectId).toBe('proj1');
    expect(out.areaSqft).toBe(1200);
  });
});
