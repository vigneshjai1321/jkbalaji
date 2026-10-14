/** Fired when an admin API call returns 401 so React auth state matches cleared storage. */
export const ADMIN_UNAUTHORIZED_EVENT = 'jk-admin-unauthorized';

export function emitAdminUnauthorized() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(ADMIN_UNAUTHORIZED_EVENT));
  }
}
