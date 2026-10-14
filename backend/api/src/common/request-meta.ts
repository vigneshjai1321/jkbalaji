import type { Request } from 'express';

export function clientIp(req: Request): string | undefined {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string') return xf.split(',')[0]?.trim();
  if (Array.isArray(xf)) return xf[0];
  return req.ip;
}

export function parseUserAgent(ua?: string): { browser?: string; device?: string } {
  if (!ua) return {};
  const lower = ua.toLowerCase();
  let browser = 'Unknown';
  if (lower.includes('edg/')) browser = 'Edge';
  else if (lower.includes('chrome/')) browser = 'Chrome';
  else if (lower.includes('firefox/')) browser = 'Firefox';
  else if (lower.includes('safari/') && !lower.includes('chrome')) browser = 'Safari';

  let device = 'Desktop';
  if (lower.includes('mobile')) device = 'Mobile';
  else if (lower.includes('tablet') || lower.includes('ipad')) device = 'Tablet';

  return { browser, device };
}
