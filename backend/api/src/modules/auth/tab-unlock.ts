export const TAB_UNLOCK_TYPE = 'tab-unlock' as const;

export type TabTokenPayload = {
  sub: string;
  sid?: string;
  tid: string;
  typ: string;
};

export function parseTabId(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (trimmed.length < 8 || trimmed.length > 64) return null;
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) return null;
  return trimmed;
}

export function tabPayloadMatches(
  access: { sub: string; sid?: string },
  tabId: string,
  payload: TabTokenPayload,
): boolean {
  if (payload.typ !== TAB_UNLOCK_TYPE) return false;
  if (payload.sub !== access.sub) return false;
  if (payload.tid !== tabId) return false;
  if (access.sid && payload.sid && payload.sid !== access.sid) return false;
  return true;
}
