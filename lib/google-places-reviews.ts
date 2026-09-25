import type { GoogleReview, ReviewsFeed } from './google-reviews-core';

type Json = Record<string, unknown>;
const object = (value: unknown): Json => value && typeof value === 'object' && !Array.isArray(value) ? value as Json : {};
const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';
const number = (value: unknown, max: number) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max ? value : null;
function httpsUrl(value: unknown): string | null {
 try { const url = new URL(text(value)); return url.protocol === 'https:' ? url.href : null; } catch { return null; }
}

export function parsePlaceReviews(value: unknown): ReviewsFeed {
 const place = object(value);
 const reviews: GoogleReview[] = Array.isArray(place.reviews) ? place.reviews.slice(0, 5).map((raw, index) => {
  const review = object(raw);
  const author = object(review.authorAttribution);
  const published = text(review.publishTime);
  const original = object(review.originalText);
  const translated = object(review.text);
  return {
   id: text(review.name) || `place-review-${index}`,
   author: text(author.displayName) || 'Google reviewer',
   photo: httpsUrl(author.photoUri),
   authorUrl: httpsUrl(author.uri),
   mapsUrl: httpsUrl(review.googleMapsUri),
   text: text(translated.text) || text(original.text),
   date: published && Number.isFinite(Date.parse(published)) ? published : '',
   relativeTime: text(review.relativePublishTimeDescription),
   rating: number(review.rating, 5),
   updated: false,
  };
 }) : [];
 return {
  reviews,
  averageRating: number(place.rating, 5),
  totalReviewCount: number(place.userRatingCount, Number.MAX_SAFE_INTEGER),
  googleMapsUri: httpsUrl(place.googleMapsUri),
 };
}
