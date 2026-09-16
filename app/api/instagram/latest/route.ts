import { fetchLatestInstagramPost } from '@/lib/instagram';

export async function GET() {
 try {
  const postUrl = await fetchLatestInstagramPost();
  return Response.json({ postUrl }, {
   status: postUrl ? 200 : 503,
   headers: { 'Cache-Control': 'no-store' },
  });
 } catch {
  // Never expose tokens or upstream error payloads to visitors.
  return Response.json({ postUrl: null }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
 }
}
