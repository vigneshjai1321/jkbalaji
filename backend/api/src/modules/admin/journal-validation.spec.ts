import { describe, expect, it } from 'vitest';
import { JournalValidationError, parseJournalWrite } from './journal-validation.js';

describe('parseJournalWrite', () => {
  it('requires balanced lines', () => {
    expect(() =>
      parseJournalWrite({
        lines: [
          { accountId: 'a1', debitInr: 100, creditInr: 0 },
          { accountId: 'a2', debitInr: 0, creditInr: 50 },
        ],
      }),
    ).toThrow(JournalValidationError);
  });

  it('accepts balanced entry', () => {
    const out = parseJournalWrite({
      narration: 'Test',
      lines: [
        { accountId: 'a1', debitInr: 100, creditInr: 0 },
        { accountId: 'a2', debitInr: 0, creditInr: 100 },
      ],
    });
    expect(out.lines).toHaveLength(2);
  });
});
