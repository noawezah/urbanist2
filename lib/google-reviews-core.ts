export type GoogleReview = { id: string; author: string; photo: string | null; text: string; date: string; updated: boolean };
export type ReviewsFeed = { reviews: GoogleReview[]; averageRating: number | null; totalReviewCount: number | null };
type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue => value && typeof value === 'object' ? value as RecordValue : {};
const validDate = (value: unknown): value is string => typeof value === 'string' && Number.isFinite(Date.parse(value));
function photoUrl(value: unknown): string | null {
 if (typeof value !== 'string') return null;
 try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; } catch { return null; }
}

export async function collectGoogleReviews(fetchPage: (token?: string) => Promise<unknown>): Promise<ReviewsFeed> {
 const reviews = new Map<string, GoogleReview>();
 const tokens = new Set<string>();
 let token: string | undefined;
 let averageRating: number | null = null;
 let totalReviewCount: number | null = null;
 do {
  const page = record(await fetchPage(token));
  if (page.reviews !== undefined && !Array.isArray(page.reviews)) throw new Error('Invalid review response');
  if (!token) {
   averageRating = typeof page.averageRating === 'number' ? page.averageRating : null;
   totalReviewCount = typeof page.totalReviewCount === 'number' ? page.totalReviewCount : null;
  }
  for (const value of (page.reviews ?? []) as unknown[]) {
   const item = record(value);
   if (item.starRating !== 'FIVE' || typeof item.reviewId !== 'string') continue;
   const date = validDate(item.updateTime) ? item.updateTime : item.createTime;
   if (!validDate(date)) continue;
   const reviewer = record(item.reviewer);
   const review: GoogleReview = {
    id: item.reviewId,
    author: reviewer.isAnonymous === true ? 'Anonymous reviewer' : typeof reviewer.displayName === 'string' && reviewer.displayName.trim() ? reviewer.displayName : 'Google reviewer',
    photo: reviewer.isAnonymous === true ? null : photoUrl(reviewer.profilePhotoUrl),
    text: typeof item.comment === 'string' ? item.comment.trim() : '',
    date, updated: validDate(item.createTime) && Date.parse(date) > Date.parse(item.createTime),
   };
   const previous = reviews.get(review.id);
   if (!previous || Date.parse(review.date) > Date.parse(previous.date)) reviews.set(review.id, review);
  }
  token = typeof page.nextPageToken === 'string' && page.nextPageToken ? page.nextPageToken : undefined;
  if (token && reviews.size < 15) {
   if (tokens.has(token)) throw new Error('Repeated review page');
   tokens.add(token);
  }
 } while (reviews.size < 15 && token);
 return { reviews: [...reviews.values()].sort((a,b) => Date.parse(b.date)-Date.parse(a.date)).slice(0,15), averageRating, totalReviewCount };
}
