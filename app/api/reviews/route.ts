import { getGoogleReviews } from '@/lib/google-reviews';
export async function GET() {
 try { return Response.json(await getGoogleReviews(), {headers:{'Cache-Control':'no-store'}}); }
 catch { return Response.json({error:'Reviews are temporarily unavailable.'}, {status:503,headers:{'Cache-Control':'no-store'}}); }
}
