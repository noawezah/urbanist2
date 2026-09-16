import 'server-only';
import { unstable_cache } from 'next/cache';
import { collectGoogleReviews } from './google-reviews-core';

export async function getGoogleReviews() {
 const account = process.env.GOOGLE_BUSINESS_ACCOUNT_ID;
 const location = process.env.GOOGLE_BUSINESS_LOCATION_ID;
 const clientId = process.env.GOOGLE_CLIENT_ID;
 const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
 const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
 if (!account || !location || !clientId || !clientSecret || !refreshToken) throw new Error('Reviews not configured');
 if (!/^\d+$/.test(account) || !/^\d+$/.test(location)) throw new Error('Invalid business identifiers');
 // Cache the complete paginated result, not individual access-token-dependent requests.
 // This project does not enable Cache Components; keep its current caching model.
 return unstable_cache(async () => {
  const response = await fetch('https://oauth2.googleapis.com/token', {
   method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(10000),
   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
   body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: 'refresh_token' }),
  });
  if (!response.ok) throw new Error('Google authorization unavailable');
  const credentials: unknown = await response.json();
  if (!credentials || typeof credentials !== 'object' || !('access_token' in credentials) || typeof credentials.access_token !== 'string') throw new Error('Invalid Google authorization');
  const accessToken = credentials.access_token;
  return collectGoogleReviews(async pageToken => {
   const url = new URL(`https://mybusiness.googleapis.com/v4/accounts/${account}/locations/${location}/reviews`);
   url.searchParams.set('pageSize','50');
   url.searchParams.set('orderBy','updateTime desc');
   if (pageToken) url.searchParams.set('pageToken',pageToken);
   const page = await fetch(url, { cache:'no-store', headers:{ Authorization:`Bearer ${accessToken}` }, signal:AbortSignal.timeout(10000) });
   if (!page.ok) throw new Error('Google reviews unavailable');
   return page.json() as Promise<unknown>;
  });
 }, ['google-business-reviews-v1', account, location], { revalidate:600 })();
}
