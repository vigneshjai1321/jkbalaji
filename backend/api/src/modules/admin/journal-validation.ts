export class JournalValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JournalValidationError';
  }
}

export type JournalLineInput = { accountId: string; debitInr?: number; creditInr?: number };

export function parseJournalWrite(body: Record<string, unknown>) {
  const linesRaw = body.lines;
  if (!Array.isArray(linesRaw) || linesRaw.length < 2) {
    throw new JournalValidationError('Add at least two lines (debit and credit).');
  }

  const lines: JournalLineInput[] = [];
  let debitTotal = 0;
  let creditTotal = 0;

  for (const row of linesRaw) {
    if (!row || typeof row !== 'object') throw new JournalValidationError('Invalid journal line');
    const accountId = typeof (row as JournalLineInput).accountId === 'string' ? (row as JournalLineInput).accountId : '';
    if (!accountId) throw new JournalValidationError('Each line needs an account');

    const debit = Number((row as JournalLineInput).debitInr ?? 0);
    const credit = Number((row as JournalLineInput).creditInr ?? 0);
    if (!Number.isFinite(debit) || !Number.isFinite(credit) || debit < 0 || credit < 0) {
      throw new JournalValidationError('Amounts must be non-negative numbers');
    }
    if (debit > 0 && credit > 0) throw new JournalValidationError('Use either debit or credit on each line, not both');
    if (debit === 0 && credit === 0) throw new JournalValidationError('Enter a debit or credit amount on each line');

    debitTotal += debit;
    creditTotal += credit;
    lines.push({ accountId, debitInr: debit, creditInr: credit });
  }

  if (Math.abs(debitTotal - creditTotal) > 0.009) {
    throw new JournalValidationError(
      `Debits (₹${debitTotal.toLocaleString('en-IN')}) must equal credits (₹${creditTotal.toLocaleString('en-IN')}).`,
    );
  }

  const narration =
    typeof body.narration === 'string' && body.narration.trim() ? body.narration.trim().slice(0, 500) : null;
  const entryDate =
    typeof body.entryDate === 'string' && body.entryDate ? new Date(body.entryDate) : new Date();

  return { lines, narration, entryDate };
}
