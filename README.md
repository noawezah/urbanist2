# The Urbanist

Next.js website for The Urbanist. English first, Romanian later.

- `/`: public homepage with sound, culture, visiting information and a full-height steel-texture menu call to action.
- `/menu`: 178 entries in 26 data-driven categories, grouped into Food, Coffee & soft drinks, and Bar. Sticky category tabs, keyboard navigation, search, desktop item dialogs and mobile bottom sheets.
- `/preview`: redirect to the homepage. The style guide and mascot imagery have been removed from the website.

## Development
Run `npm install`, then `npm run dev`. Build with `npm run build`. Check TypeScript with `npm run typecheck`.

## Content and deployment
Menu content is transcribed from `58572048_1 (1).pdf` into `data/menu.json`. `scripts/import-menu.py` reproduces the import with pdfplumber. Original source rows are retained for auditing but excluded from client props. All 177 priced source rows were matched; Red Bull Long has no listed price and directs guests to staff. The Becks bottle size is ambiguous in the source and is not guessed. Allergens reflect the source rather than inferred completeness. Full closing hours and a confirmed event feed remain pending. Photography and steel texture are generated concepts, not actual venue photos.

Sanity foundations: `lib/sanity.ts`, `sanity/schemaTypes.ts`, `.env.example`. The read-only client remains null until configured. Connect an owner-controlled Sanity project and register the schema definitions in a Studio before wiring public content. No Sanity account or Studio has been provisioned.

For Vercel, import this repository using the Next.js preset, retain the `npm run build` command and configure the public Sanity project/dataset variables after the CMS is ready. No deployment has been made. Review content before production publication.

Image-generation provenance: `docs/image-prompts.md`. Superseded logo and mascot concepts are archived outside the public directory in `docs/archived-concepts/`.
