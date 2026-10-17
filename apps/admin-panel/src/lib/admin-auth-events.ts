/** Fired when an admin API call returns 401 so React auth state matches cleared storage. */
export const ADMIN_UNAUTHORIZED_EVENT = 'jk-admin-unauthorized';

/** Fired when JWT is valid but this browser tab has not been password-verified. */
export const ADMIN_TAB_UNLOCK_REQUIRED_EVENT = 'jk-admin-tab-unlock-required';

export function emitAdminUnauthorized() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(ADMIN_UNAUTHORIZED_EVENT));
  }
}

export function emitAdminTabUnlockRequired() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(ADMIN_TAB_UNLOCK_REQUIRED_EVENT));
  }
}
