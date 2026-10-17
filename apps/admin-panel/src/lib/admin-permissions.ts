const COMMISSION_READ = new Set([
  'SUPER_ADMIN',
  'ADMIN',
  'REAL_ESTATE_MANAGER',
  'SALES_MANAGER',
  'ACCOUNTANT',
]);
const COMMISSION_WRITE = new Set(['SUPER_ADMIN', 'ADMIN', 'REAL_ESTATE_MANAGER', 'ACCOUNTANT']);
const COMMISSION_SETTINGS = new Set(['SUPER_ADMIN', 'ADMIN', 'REAL_ESTATE_MANAGER']);

export function canReadCommission(role?: string | null) {
  return role ? COMMISSION_READ.has(role) : false;
}

export function canWriteCommission(role?: string | null) {
  return role ? COMMISSION_WRITE.has(role) : false;
}

export function canEditCommissionSettings(role?: string | null) {
  return role ? COMMISSION_SETTINGS.has(role) : false;
}
