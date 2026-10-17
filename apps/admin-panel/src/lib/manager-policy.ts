const SCOPED_MANAGER = new Set(['REAL_ESTATE_MANAGER', 'GOLD_MANAGER']);

export function canChangeOwnPassword(role?: string | null): boolean {
  return role ? !SCOPED_MANAGER.has(role) : false;
}

export function displayLogin(user: { loginId?: string | null; email?: string | null } | null | undefined): string {
  if (!user) return '';
  return user.loginId?.trim() || user.email || '';
}
