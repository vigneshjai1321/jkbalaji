/** Path helpers — always use /* on jkbalaji.in (middleware rewrites apex). */
export function propertyDetailPath(slug: string) {
  return `/properties/${slug}`;
}

export function realEstateBase() {
  return '/';
}

export function jewelleryBase() {
  return '/jewellery';
}
