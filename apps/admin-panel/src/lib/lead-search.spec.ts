import { describe, expect, it } from 'vitest';
import { applyLeadSearch } from './lead-search';

describe('applyLeadSearch', () => {
  it('trims the input and resets pagination when the query changes', () => {
    expect(applyLeadSearch('', '  ravi  ')).toEqual({ query: 'ravi', resetPage: true });
  });

  it('does not reset pagination when the trimmed query is unchanged', () => {
    expect(applyLeadSearch('ravi', ' ravi ')).toEqual({ query: 'ravi', resetPage: false });
  });
});
