# Google reviews via Places API (New)

The existing reviews section uses Place Details (New) for `ChIJ2buKhxX_sUAR--plcKMQrQo`.

Set `GOOGLE_PLACES_API_KEY` in `.env.local` for development and in the Vercel project's server environment variables for production, then restart or redeploy. Enable Places API (New) for the key's Google Cloud project. Never prefix this variable with `NEXT_PUBLIC_` or put the key in client code.

`/api/reviews` requests `displayName,rating,userRatingCount,reviews,googleMapsUri` from Places on the server. The result is cached for ten minutes. Places returns up to five reviews, normally ordered by relevance; the UI labels that ordering. Rating, review count and reviews are shown when available. Missing credentials or upstream errors produce the section's retry state, without exposing the key.

After deployment, check `/api/reviews` for a successful response and inspect the website. The route may return HTTP 503 until the key is configured and permitted to call Places API (New).
