import 'server-only';
import { unstable_cache } from 'next/cache';
import { parsePlaceReviews } from './google-places-reviews';

export async function getGoogleReviews() {
 const apiKey = process.env.GOOGLE_PLACES_API_KEY;
 if (!apiKey) throw new Error('Google Places reviews not configured');
 const placeId = 'ChIJ2buKhxX_sUAR--plcKMQrQo';
 return unstable_cache(async () => {
  const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
   cache: 'no-store', signal: AbortSignal.timeout(10000),
   headers: { 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': 'displayName,rating,userRatingCount,reviews,googleMapsUri' },
  });
  if (!response.ok) throw new Error('Google Places reviews unavailable');
  return parsePlaceReviews(await response.json());
 }, ['google-places-reviews-v1', placeId], { revalidate:600 })();
}
