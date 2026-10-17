/** Apply a leads search box value. Pagination resets only when the query actually changes. */
export function applyLeadSearch(currentQuery: string, input: string): { query: string; resetPage: boolean } {
  const query = input.trim();
  return { query, resetPage: query !== currentQuery };
}
