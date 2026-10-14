function apiBase(): string {
  const pub = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (typeof window !== 'undefined') {
    if (pub) return pub;
    return `${window.location.origin}/api/v1`;
  }
  return process.env.SERVER_API_URL ?? pub ?? 'http://127.0.0.1:4000/api/v1';
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`API ${path} failed`);
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${path} failed`);
  return res.json() as Promise<T>;
}
