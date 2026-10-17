import { UserRole } from '../../generated/prisma/client.js';

/** View commissions, brokers, reports, dashboard summaries. */
export const COMMISSION_READ_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.REAL_ESTATE_MANAGER,
  UserRole.SALES_MANAGER,
  UserRole.ACCOUNTANT,
] as const;

/** Create/edit brokers, manual commissions, record payments, exports. */
export const COMMISSION_WRITE_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.REAL_ESTATE_MANAGER,
  UserRole.ACCOUNTANT,
] as const;

/** Change global/project/broker default rates. */
export const COMMISSION_SETTINGS_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.REAL_ESTATE_MANAGER] as const;

/** Plot quotations and reserve/sold (existing real-estate ops). */
export const PLOT_SALES_ROLES = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.REAL_ESTATE_MANAGER, UserRole.SALES_MANAGER] as const;
