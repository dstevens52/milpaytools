const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const HOST = 'www.milpaytools.com';

export async function submitToIndexNow(urls: string[]): Promise<{ ok: boolean; status?: number; error?: string }> {
  const key = process.env.INDEXNOW_KEY;
  if (!key) return { ok: false, error: 'INDEXNOW_KEY not set' };
  if (urls.length === 0) return { ok: false, error: 'No URLs provided' };

  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key, urlList: urls }),
  });

  if (res.ok || res.status === 202) return { ok: true, status: res.status };
  return { ok: false, status: res.status, error: await res.text().catch(() => res.statusText) };
}
