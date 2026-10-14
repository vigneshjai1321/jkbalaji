import type { PrismaService } from '../../database/prisma.service.js';

/** Invoice issuer details (shown on tax invoice). Configure in admin — never hardcode a third-party entity. */
export type SellerProfile = {
  tradeName: string;
  legalName: string;
  address: string;
  gstin: string;
  phone: string;
  /** Email printed on the invoice (issuer). */
  email: string;
  stateCode: string;
  paymentTermsDefault: string;
  bankDetails: string;
  logoUrl: string;
  invoicePrefix: string;
  defaultApplyGst: boolean;
  authorizedTaxRates: number[];
  invoiceFooter: string;
  /** Billing module / ERP contact (JK Balaji support). Not printed as the seller on invoices. */
  billingContactEmail: string;
};

const SETTING_KEY = 'billing_seller_profile';

const BILLING_CONTACT_DEFAULT = 'tmlcheyyar@gmail.com';

const DEFAULT_ADDRESS =
  'No 49/3, Gandhi Road, Cheyyar, Tiruvannamalai - 604407, Tamil Nadu';

const ENV_FALLBACK: SellerProfile = {
  tradeName: process.env.BILLING_TRADE_NAME?.trim() || 'SRI BALAJI THANGAMALIGAI',
  legalName: process.env.BILLING_LEGAL_NAME?.trim() || 'SRI BALAJI THANGAMALIGAI',
  address: process.env.BILLING_ADDRESS?.trim() || DEFAULT_ADDRESS,
  gstin: process.env.COMPANY_GSTIN?.trim() || '33AAHCJ1786C1ZQ',
  phone: process.env.COMPANY_PHONE?.trim() || '+91 99435 41435',
  email: process.env.BILLING_EMAIL?.trim() || BILLING_CONTACT_DEFAULT,
  stateCode: process.env.BILLING_STATE_CODE?.trim() ?? '33',
  paymentTermsDefault: process.env.BILLING_PAYMENT_TERMS?.trim() ?? 'Payment due within 7 days of invoice date.',
  bankDetails: process.env.BILLING_BANK_DETAILS?.trim() ?? '',
  logoUrl: process.env.BILLING_LOGO_URL?.trim() ?? '',
  invoicePrefix: process.env.BILLING_INVOICE_PREFIX?.trim() || 'SBT-INV',
  defaultApplyGst: process.env.BILLING_DEFAULT_GST !== 'false',
  authorizedTaxRates: parseTaxRates(process.env.BILLING_TAX_RATES),
  invoiceFooter: process.env.BILLING_INVOICE_FOOTER?.trim() ?? '',
  billingContactEmail: process.env.BILLING_CONTACT_EMAIL?.trim() || BILLING_CONTACT_DEFAULT,
};

function parseTaxRates(raw?: string): number[] {
  if (!raw?.trim()) return [0, 3, 5, 12, 18];
  const nums = raw.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n));
  return nums.length ? nums : [0, 3, 5, 12, 18];
}

const LEGACY_BLOCKED = /jamavisa/i;

function sanitizeProfile(parsed: Partial<SellerProfile>): Partial<SellerProfile> {
  const out = { ...parsed };
  for (const key of ['tradeName', 'legalName', 'address', 'email', 'bankDetails', 'invoiceFooter'] as const) {
    const v = out[key];
    if (typeof v === 'string' && LEGACY_BLOCKED.test(v)) out[key] = '';
  }
  if (out.email && LEGACY_BLOCKED.test(out.email)) out.email = '';
  return out;
}

function mergeProfile(parsed: Partial<SellerProfile>): SellerProfile {
  const clean = sanitizeProfile(parsed);
  return {
    tradeName: clean.tradeName?.trim() ?? ENV_FALLBACK.tradeName,
    legalName: clean.legalName?.trim() ?? ENV_FALLBACK.legalName,
    address: clean.address?.trim() ?? ENV_FALLBACK.address,
    gstin: clean.gstin?.trim() ?? ENV_FALLBACK.gstin,
    phone: clean.phone?.trim() ?? ENV_FALLBACK.phone,
    email: clean.email?.trim() ?? ENV_FALLBACK.email,
    stateCode: clean.stateCode?.trim() || ENV_FALLBACK.stateCode,
    paymentTermsDefault: clean.paymentTermsDefault?.trim() || ENV_FALLBACK.paymentTermsDefault,
    bankDetails: clean.bankDetails?.trim() ?? ENV_FALLBACK.bankDetails,
    logoUrl: clean.logoUrl?.trim() ?? ENV_FALLBACK.logoUrl,
    invoicePrefix: clean.invoicePrefix?.trim() || ENV_FALLBACK.invoicePrefix,
    defaultApplyGst: clean.defaultApplyGst ?? ENV_FALLBACK.defaultApplyGst,
    authorizedTaxRates: clean.authorizedTaxRates?.length ? clean.authorizedTaxRates : ENV_FALLBACK.authorizedTaxRates,
    invoiceFooter: clean.invoiceFooter?.trim() ?? ENV_FALLBACK.invoiceFooter,
    billingContactEmail: clean.billingContactEmail?.trim() || ENV_FALLBACK.billingContactEmail,
  };
}

export async function loadSellerProfile(prisma: PrismaService): Promise<SellerProfile> {
  const row = await prisma.appSetting.findUnique({ where: { key: SETTING_KEY } });
  if (!row?.value) return { ...ENV_FALLBACK };
  try {
    const parsed = JSON.parse(row.value) as Partial<SellerProfile>;
    return mergeProfile(parsed);
  } catch {
    return { ...ENV_FALLBACK };
  }
}

export async function saveSellerProfile(prisma: PrismaService, profile: SellerProfile) {
  const normalized = mergeProfile(profile);
  const value = JSON.stringify(normalized);
  return prisma.appSetting.upsert({
    where: { key: SETTING_KEY },
    create: { key: SETTING_KEY, value },
    update: { value },
  });
}
