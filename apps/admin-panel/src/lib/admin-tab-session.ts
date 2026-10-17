const TAB_ID_KEY = 'jk_tab_id';
const TAB_TOKEN_KEY = 'jk_tab_token';

export function getOrCreateTabId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem(TAB_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(TAB_ID_KEY, id);
  }
  return id;
}

export function getTabId(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(TAB_ID_KEY);
}

export function getTabToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(TAB_TOKEN_KEY);
}

export function setTabToken(token: string) {
  if (typeof window === 'undefined') return;
  getOrCreateTabId();
  sessionStorage.setItem(TAB_TOKEN_KEY, token);
}

export function clearTabToken() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(TAB_TOKEN_KEY);
}

export function clearTabSession() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(TAB_ID_KEY);
  sessionStorage.removeItem(TAB_TOKEN_KEY);
}

export function hasTabSession(): boolean {
  return Boolean(getTabId() && getTabToken());
}

export function tabAuthHeaders(): Record<string, string> {
  const tabId = getTabId();
  const tabToken = getTabToken();
  if (!tabId || !tabToken) return {};
  return {
    'X-Tab-Id': tabId,
    'X-Tab-Token': tabToken,
  };
}
