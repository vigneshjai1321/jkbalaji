const DEFAULT_URL = 'https://kjpl.in/';
const USER_AGENT = 'JKBalaji-MarketRatesBot/1.0 (+https://cheyyarbalaji.com; business reference rates)';

export class KjplFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KjplFetchError';
  }
}

export async function fetchKjplHomeHtml(options?: { url?: string; timeoutMs?: number }): Promise<string> {
  const url = options?.url ?? process.env.KJPL_RATES_URL?.trim() ?? DEFAULT_URL;
  const timeoutMs = options?.timeoutMs ?? Number(process.env.KJPL_FETCH_TIMEOUT_MS ?? 15_000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        'User-Agent': USER_AGENT,
      },
    });
    if (!res.ok) {
      throw new KjplFetchError(`HTTP ${res.status} from ${url}`);
    }
    const ct = res.headers.get('content-type') ?? '';
    if (!ct.includes('text/html') && !ct.includes('text/plain')) {
      throw new KjplFetchError(`Unexpected content-type: ${ct.slice(0, 80)}`);
    }
    const body = await res.text();
    if (body.length < 500 || /<html/i.test(body) === false) {
      throw new KjplFetchError('Response does not look like kjpl.in HTML');
    }
    return body;
  } catch (e) {
    if (e instanceof KjplFetchError) throw e;
    if (e instanceof Error && e.name === 'AbortError') {
      throw new KjplFetchError(`Timed out after ${timeoutMs}ms`);
    }
    throw new KjplFetchError(e instanceof Error ? e.message : 'Fetch failed');
  } finally {
    clearTimeout(timer);
  }
}
