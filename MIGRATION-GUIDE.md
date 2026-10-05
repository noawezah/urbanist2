# The Urbanist — moving to another computer

The ZIP contains the complete editable Next.js project, its Git history, images, licensed Brandon Grotesque font files, menu data, documentation, scripts, tests, and three source PDFs in `reference-files/`. It excludes generated dependencies/builds (`node_modules`, `.next`) and local credentials. The old `README.md` contains some historical project notes; this guide describes the current transfer.

1. **Copy and extract** `Urbanist-migration-2026-09-27.zip` on the new computer. Open a terminal inside the extracted `urbanist2` folder.
2. **Install Node.js 24 and Git** if needed, then run `npm ci`. This restores dependencies from the included lockfile.
3. **Set up local credentials only if you need live integrations locally.** Copy `.env.example` to `.env.local` (`Copy-Item .env.example .env.local` in PowerShell, or `cp .env.example .env.local` on macOS/Linux). Fill `GOOGLE_PLACES_API_KEY` for live Google reviews and `INSTAGRAM_ACCOUNT_ID` plus `INSTAGRAM_ACCESS_TOKEN` for automatic Instagram updates. Obtain values from their owner or your existing Vercel project. Never put secrets in Git. The site still runs without them, using its existing fallback states. Sanity variables are optional and the CMS is not connected.
4. **Run the site** with `npm run dev`, then open `http://127.0.0.1:3000/`. Check the homepage and `/menu`.
5. **Verify the transfer** with `npm run typecheck` and `npm run build`.
6. **Continue deployment.** Sign in to the same GitHub and Vercel accounts on the new computer. The included `.git` directory retains history and the existing GitHub remote (`https://github.com/noawezah/urbanist2.git`). Vercel environment variables belong to the Vercel project and are not stored in this ZIP. Use the existing Vercel project when deploying; check its environment settings before publishing.

Useful files: `app/page.tsx` (homepage), `app/menu/page.tsx` and `components/menu-browser.tsx` (menu UI), `data/menu.json` (177 menu entries), `public/images/` (site artwork), `app/fonts/` (licensed fonts), `lib/google-reviews.ts` and `lib/instagram.ts` (server integrations), and `docs/` (project notes). The current menu source is `reference-files/58906129_1.pdf`; the official logo source is `reference-files/URBANIST LOGO 2026.pdf`. The earlier menu PDF is also included for reference.

The font files are included for use by the license holder on the new device. Keep the archive private and retain your separate font purchase/license record.
