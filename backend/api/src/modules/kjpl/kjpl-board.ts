import { fetchKjplHomeHtml, KjplFetchError } from './kjpl.client.js';

export type KjplBoardMetal = 'GOLD' | 'SILVER';

export type KjplBoardQuote = {
  description: KjplBoardMetal;
  buying: number;
  selling: number;
  high: number;
  low: number;
};

export type KjplBoardSnapshot = {
  gold: KjplBoardQuote;
  silver: KjplBoardQuote;
  fetchedAt: string;
};

export type KjplBoardCache = {
  gold: KjplBoardQuote | null;
  silver: KjplBoardQuote | null;
  fetchedAt: string | null;
  lastAttemptAt: string | null;
  lastError: string | null;
};

const DEFAULT_WS_URL = 'ws://www.kjpl.in/ws';

export function extractKjplSocketToken(html: string): string | null {
  const match = html.match(/SOCKET_TOKEN\s*=\s*"([a-f0-9]{32,128})"/);
  return match?.[1] ?? null;
}

function quoteFromFields(fields: string[]): KjplBoardQuote | null {
  if (fields[0]?.trim() !== '2') return null;
  const name = fields[1]?.trim().toUpperCase();
  if (name !== 'GOLD' && name !== 'SILVER') return null;
  const buying = Number(fields[2]);
  const selling = Number(fields[3]);
  const high = Number(fields[4]);
  const low = Number(fields[5]);
  const values = [buying, selling, high, low];
  if (values.some((n) => !Number.isFinite(n) || n <= 0 || n >= 1_000_000_000)) return null;
  return { description: name, buying, selling, high, low };
}

/** Parse one websocket payload. Only exact GOLD and SILVER board rows are kept. */
export function parseKjplBoardMessage(raw: string): Partial<Record<KjplBoardMetal, KjplBoardQuote>> {
  const found: Partial<Record<KjplBoardMetal, KjplBoardQuote>> = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === 'R' || trimmed === 'ping' || trimmed === 'pong') continue;
    const fields = trimmed.includes('|') ? trimmed.split('|') : trimmed.split('\t');
    const quote = quoteFromFields(fields);
    if (!quote) continue;
    found[quote.description] = quote;
  }
  return found;
}

export function boardDisplayHealth(
  cache: KjplBoardCache | null,
  nowMs: number,
  staleAfterMs: number,
  updating: boolean,
): 'fresh' | 'stale' | 'unavailable' | 'updating' {
  if (updating) return 'updating';
  if (!cache?.gold || !cache.silver || !cache.fetchedAt) return 'unavailable';
  const fetchedMs = new Date(cache.fetchedAt).getTime();
  const attemptMs = cache.lastAttemptAt ? new Date(cache.lastAttemptAt).getTime() : 0;
  const failedAfterSuccess = Boolean(cache.lastError) && attemptMs > fetchedMs;
  if (failedAfterSuccess || !Number.isFinite(fetchedMs) || nowMs - fetchedMs > staleAfterMs) return 'stale';
  return 'fresh';
}

type RateSocket = {
  addEventListener(type: 'message', fn: (ev: { data: unknown }) => void): void;
  addEventListener(type: 'error', fn: () => void): void;
  close(): void;
};

function openRateSocket(url: string, token: string): RateSocket {
  const WS = (globalThis as { WebSocket?: new (url: string, protocols?: string[]) => RateSocket }).WebSocket;
  if (!WS) throw new KjplFetchError('WebSocket is not available in this runtime');
  return new WS(url, [token]);
}

export async function fetchKjplBoardSnapshot(options?: {
  html?: string;
  timeoutMs?: number;
  wsUrl?: string;
}): Promise<KjplBoardSnapshot> {
  const html = options?.html ?? (await fetchKjplHomeHtml());
  const token = extractKjplSocketToken(html);
  if (!token) throw new KjplFetchError('KJPL market board token was not found');
  const timeoutMs = options?.timeoutMs ?? Number(process.env.KJPL_BOARD_TIMEOUT_MS ?? 8_000);
  const wsUrl = options?.wsUrl ?? process.env.KJPL_BOARD_WS_URL?.trim() ?? DEFAULT_WS_URL;
  const quotes: Partial<Record<KjplBoardMetal, KjplBoardQuote>> = {};

  await new Promise<void>((resolve, reject) => {
    let settled = false;
    let ws: RateSocket;
    try {
      ws = openRateSocket(wsUrl, token);
    } catch (e) {
      reject(e instanceof Error ? e : new KjplFetchError('KJPL market board socket failed'));
      return;
    }
    const finish = (err?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        ws.close();
      } catch {
        /* socket already closed */
      }
      if (err) reject(err);
      else resolve();
    };
    const timer = setTimeout(() => {
      if (quotes.GOLD && quotes.SILVER) finish();
      else finish(new KjplFetchError('Timed out waiting for GOLD and SILVER board rates'));
    }, timeoutMs);
    ws.addEventListener('message', (ev) => {
      if (typeof ev.data !== 'string') return;
      const parsed = parseKjplBoardMessage(ev.data);
      if (parsed.GOLD) quotes.GOLD = parsed.GOLD;
      if (parsed.SILVER) quotes.SILVER = parsed.SILVER;
      if (quotes.GOLD && quotes.SILVER) finish();
    });
    ws.addEventListener('error', () => finish(new KjplFetchError('KJPL market board socket failed')));
  });

  return {
    gold: quotes.GOLD!,
    silver: quotes.SILVER!,
    fetchedAt: new Date().toISOString(),
  };
}
