# Automatic latest Instagram post

Status: implemented, awaiting authorization from the account manager. The existing curated post remains visible until connected. No automatic connection is active yet.

The manager of @theurbanistbucharest needs to authorize a Meta developer app using **Instagram API with Instagram Login**, with the read permission `instagram_business_basic`. Use a professional Business or Creator account. Obtain its Instagram account ID and a long-lived Instagram user access token.

Set `INSTAGRAM_ACCOUNT_ID` and `INSTAGRAM_ACCESS_TOKEN` in `.env.local` for development and in the hosting provider's server environment for production, then restart/redeploy. Do not paste the token into chat, commit it, or prefix it with `NEXT_PUBLIC_`.

The server reads the 50 most recent media entries and chooses the valid post or reel with the newest publication timestamp. Profile pin order does not affect selection. Stories are excluded. Visitors check on load, every minute while the page is visible, and on returning to the tab. Server responses from Instagram are cached for 60 seconds, so this is periodic updating, not instantaneous publishing notification.

The current embed is retained on temporary failures, missing credentials, or expired authorization. A new visit falls back to the curated post if the service is unavailable. The selected post URL updates both the embed and its adjacent button.

The account manager must maintain valid authorization and renew/replace the long-lived token before expiry; automatic token rotation is not configured. Meta authorization is required to validate live account access. After connecting, check `/api/instagram/latest` returns HTTP 200 and the newest permalink, then check a newer post replaces the embed.

Official reference: https://www.postman.com/meta/instagram/folder/6raa77c/instagram-api-with-instagram-login
