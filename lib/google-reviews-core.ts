export type GoogleReview = { id: string; author: string; photo: string | null; text: string; date: string; updated: boolean; rating: number | null; relativeTime: string; mapsUrl: string | null; authorUrl: string | null };
export type ReviewsFeed = { reviews: GoogleReview[]; averageRating: number | null; totalReviewCount: number | null; googleMapsUri: string | null };
