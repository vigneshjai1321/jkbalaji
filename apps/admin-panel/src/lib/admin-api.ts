import { emitAdminUnauthorized } from './admin-auth-events';

export class AdminAuthError extends Error {
  constructor() {
    super('Unauthorized');
    this.name = 'AdminAuthError';
  }
}

const PUBLIC_API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

export function adminApiBase(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    // Same-origin /api/v1 on admin host (nginx proxies to Nest) — avoids cross-site token/CORS issues.
    if (host.startsWith('admin.')) {
      if (PUBLIC_API?.includes(host)) return PUBLIC_API;
      return `${window.location.origin}/api/v1`;
    }
    return `${window.location.origin}/api/v1`;
  }
  return process.env.SERVER_API_URL ?? 'http://127.0.0.1:4000/api/v1';
}

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string | null;
  phone?: string | null;
  lastLoginAt?: string | null;
};

export type DashboardOverview = {
  revenueTotal: number;
  revenueToday: number;
  revenueMonth: number;
  revenueYear: number;
  expensesMonth: number;
  expensesTotal: number;
  profitMonth: number;
  profitYear: number;
  outstandingPayments: number;
  plots: number;
  inventoryValue: number;
  inventorySkus: number;
  goldSalesMonth: number;
  properties: number;
  projects: number;
  products: number;
  leads: number;
  leadsNew: number;
  customers: number;
  invoices: number;
  users: number;
  activeUsers: number;
  pendingFollowups: number;
  goldRate: { rate22k: number; rate24k: number; effectiveDate: string } | null;
  leadsByStatus: Record<string, number>;
  propertiesByStatus: Record<string, number>;
  revenueByMonth: { month: string; total: number }[];
  recentActivity: {
    id: string;
    type: 'lead' | 'invoice';
    title: string;
    subtitle: string;
    at: string;
  }[];
  activityLogs: {
    id: string;
    action: string;
    entity: string;
    summary: string;
    user: string;
    at: string;
  }[];
  notifications: {
    id: string;
    title: string;
    body: string;
    readAt: string | null;
    at: string;
  }[];
  recentLeads: {
    id: string;
    name: string;
    phone?: string;
    status: string;
    site: string;
    createdAt: string;
  }[];
  recentLoginLogs: {
    id: string;
    email: string;
    name: string;
    ipAddress: string | null;
    browser: string | null;
    device: string | null;
    at: string;
  }[];
  businessUnits?: {
    overall: {
      revenueTotal: number;
      revenueMonth: number;
      revenueToday: number;
      leads: number;
      customers: number;
      invoices: number;
      activeUsers: number;
    };
    realEstate: {
      properties: number;
      projects: number;
      leads: number;
      leadsNew: number;
      available?: number;
      reserved?: number;
      sold?: number;
      activeProjects?: number;
      completedProjects?: number;
      recordedLandSqft?: number;
      availableLandSqft?: number;
      soldLandSqft?: number;
      recordedBuiltUpSqft?: number;
      propertiesMissingLandArea?: number;
      commissionExpected?: number;
      commissionPaid?: number;
      commissionOutstanding?: number;
    };
    jewellery: {
      products: number;
      leads: number;
      schemes: number;
      goldRate22k: number | null;
      stockSkus?: number;
      stockValue?: number | null;
    };
  };
};

export async function adminLogin(
  email: string,
  password: string,
): Promise<{ accessToken: string; user: AdminUser }> {
  const res = await fetch(`${adminApiBase()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const msg = res.status === 401 ? 'Invalid email or password' : 'Login failed';
    throw new Error(msg);
  }
  return res.json() as Promise<{ accessToken: string; user: AdminUser }>;
}

function resolveAdminApiPath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized.startsWith('/auth')) return normalized;
  if (normalized.startsWith('/admin/')) return normalized;
  return `/admin${normalized}`;
}

export async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jk_token') : null;
  const res = await fetch(`${adminApiBase()}${resolveAdminApiPath(path)}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jk_token');
      localStorage.removeItem('jk_user');
      emitAdminUnauthorized();
    }
    throw new AdminAuthError();
  }
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (typeof body.message === 'string') detail = body.message;
      else if (Array.isArray(body.message)) detail = body.message.join(', ');
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
