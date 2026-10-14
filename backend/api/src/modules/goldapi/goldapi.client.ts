import type { GoldApiMetal, GoldApiPriceResponse } from './goldapi.types.js';

const DEFAULT_TIMEOUT_MS = 15_000;
const BASE = 'https://www.goldapi.io/api/price';

export class GoldApiClientError extends Error {
  constructor(
    message: string,
    readonly statusCode?: number,
    readonly metal?: GoldApiMetal,
  ) {
    super(message);
    this.name = 'GoldApiClientError';
  }
}

export async function fetchMetalInrPrice(
  metal: GoldApiMetal,
  accessToken: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<GoldApiPriceResponse> {
  const url = `${BASE}/${metal}/INR`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-access-token': accessToken,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new GoldApiClientError(
        `GoldAPI ${metal}/INR failed (${res.status})${body ? `: ${body.slice(0, 120)}` : ''}`,
        res.status,
        metal,
      );
    }
    return (await res.json()) as GoldApiPriceResponse;
  } catch (e) {
    if (e instanceof GoldApiClientError) throw e;
    if (e instanceof Error && e.name === 'AbortError') {
      throw new GoldApiClientError(`GoldAPI ${metal}/INR timed out after ${timeoutMs}ms`, undefined, metal);
    }
    throw new GoldApiClientError(
      e instanceof Error ? e.message : 'GoldAPI request failed',
      undefined,
      metal,
    );
  } finally {
    clearTimeout(timer);
  }
}
