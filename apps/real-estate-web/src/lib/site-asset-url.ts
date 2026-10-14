/** Flatten legacy nested public paths so Next serves them reliably (`/assets/images/<file>` only on production). */
const NESTED_PUBLIC = /^\/assets\/images\/(?:properties|banners|products)\/(.+)$/i;

export function resolvePublicAssetUrl(src: string): string {
  const trimmed = src.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const nested = NESTED_PUBLIC.exec(trimmed);
  if (nested) return `/assets/images/${nested[1]}`;
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

/** Last-resort verified Unsplash URLs (illustrative only — not plot inventory). */
export const REAL_ESTATE_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80';

export function fallbackForRealEstateAsset(_src?: string): string {
  return REAL_ESTATE_IMAGE_FALLBACK;
}
