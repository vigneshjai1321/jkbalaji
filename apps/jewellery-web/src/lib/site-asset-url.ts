const NESTED_PUBLIC = /^\/assets\/images\/(?:properties|banners|products)\/(.+)$/i;

export function resolvePublicAssetUrl(src: string): string {
  const trimmed = src.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const nested = NESTED_PUBLIC.exec(trimmed);
  if (nested) return `/assets/images/${nested[1]}`;
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

/** Illustrative showcase fallback — not live inventory. */
export const JEWELLERY_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=80';

export function fallbackForJewelleryAsset(_src?: string): string {
  return JEWELLERY_IMAGE_FALLBACK;
}
