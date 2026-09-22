import 'server-only';

type Media = { permalink?: string; timestamp?: string; media_product_type?: string };

export function newestInstagramPost(media: Media[]): string | null {
 const posts = media.filter(item => {
  if (!item.permalink || !item.timestamp || item.media_product_type === 'STORY') return false;
  if (!Number.isFinite(Date.parse(item.timestamp))) return false;
  try {
   const url = new URL(item.permalink);
   return url.protocol === 'https:' && ['www.instagram.com', 'instagram.com'].includes(url.hostname)
    && /^\/(p|reel)\/[A-Za-z0-9_-]+\/?$/.test(url.pathname);
  } catch { return false; }
 });
 posts.sort((a, b) => Date.parse(b.timestamp!) - Date.parse(a.timestamp!));
 return posts[0]?.permalink ?? null;
}

export async function fetchLatestInstagramPost(): Promise<string | null> {
 const token = process.env.INSTAGRAM_ACCESS_TOKEN;
 const accountId = process.env.INSTAGRAM_ACCOUNT_ID;
 if (!token || !accountId || !/^\d+$/.test(accountId)) return null;
 const url = new URL(`https://graph.instagram.com/${accountId}/media`);
 url.searchParams.set('fields', 'permalink,timestamp,media_product_type');
 url.searchParams.set('limit', '50');
 const response = await fetch(url, {
  headers: { Authorization: `Bearer ${token}` },
  next: { revalidate: 60 },
  signal: AbortSignal.timeout(8000),
 });
 if (!response.ok) throw new Error('Instagram feed unavailable');
 const body = await response.json();
 if (!Array.isArray(body.data)) throw new Error('Invalid Instagram feed');
 return newestInstagramPost(body.data);
}
