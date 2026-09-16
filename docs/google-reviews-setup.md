# Google Business Profile reviews

The existing reviews section now reads `/api/reviews`. Only this server endpoint contacts Google. No credentials or Google error payloads are returned to the browser. The old manually selected reviews are no longer presented as live reviews.

## Required environment variables

Add the following to `.env.local` in the project root (next to package.json). For Vercel, add the same names under Project → Settings → Environment Variables for the intended environments, then redeploy. Restart the local development server after adding/changing values. Never use NEXT_PUBLIC_ prefixes or commit `.env.local`.

```dotenv
GOOGLE_BUSINESS_ACCOUNT_ID=your_numeric_account_id
GOOGLE_BUSINESS_LOCATION_ID=your_numeric_location_id
GOOGLE_CLIENT_ID=your_oauth_client_id
GOOGLE_CLIENT_SECRET=your_oauth_client_secret
GOOGLE_REFRESH_TOKEN=your_offline_refresh_token
```

- Account ID is the numeric part of `accounts/…` from the Business Profile Account Management API. It is not the Google Maps CID or Place ID.
- Location ID is the numeric part of the verified location's `locations/…` resource name. It is not the Maps CID or Place ID.
- Client ID and secret belong to a Google Cloud OAuth 2.0 client in a project approved/enabled for Business Profile API access.
- Refresh token must be issued by that same client to an owner/manager who can access this verified location, with offline access and scope `https://www.googleapis.com/auth/business.manage`. No manually maintained access token or API key is required; the server exchanges the refresh token for a fresh access token as needed.

The account manager must complete OAuth consent. Configure the client/consent screen and enable the Business Profile APIs first. If using OAuth Playground to obtain a token, configure it to use your own OAuth client credentials and its registered redirect URI. Use a production consent configuration for ongoing access; testing-mode tokens may expire. Revoked/expired refresh tokens must be replaced.

Official setup: https://developers.google.com/my-business/content/basic-setup
Official OAuth: https://developers.google.com/my-business/content/implement-oauth

## Fetching and cache

Calls `GET https://mybusiness.googleapis.com/v4/accounts/{account}/locations/{location}/reviews` with `pageSize=50` and `orderBy=updateTime desc`. It follows `nextPageToken` until 15 unique valid FIVE-rated reviews are collected or pagination ends, sorts by update time, and returns at most 15. Textless five-star ratings remain eligible. Edited reviews display an Updated date. Reviewer photos have initial-letter fallbacks.

The complete result is cached server-side for 600 seconds using the project's existing Next.js caching model. Revalidation is request-driven and stale-while-revalidate, not a background schedule; an open browser also checks every ten minutes. A failed refresh retains previously loaded data. Without a usable result, the section offers a retry and Google link; an empty successful result has its own empty state. No placeholder reviews or fabricated quotations are used.

## Validation

Run `node --experimental-strip-types --test tests/google-reviews.test.mjs` and `npm.cmd run build`.
After credentials are configured, `/api/reviews` must return 200 with only public review fields and aggregate rating/count. Verify newest review dates against Google, and resize the section on desktop/mobile. Without credentials, it intentionally returns a generic 503 and the UI shows the graceful error state. Live authorization has not been verified yet.
