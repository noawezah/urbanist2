# The Urbanist

Design-stage Next.js website foundation. English first, Romanian later.

- `/`: interactive design system, editable typography, copyable color tokens, grid toggle, component examples and reduced-motion demo.
- `/preview`: homepage composition covering sound, culture and visiting.

## Development
Run `npm install`, then `npm run dev`. Build with `npm run build`. Check TypeScript with `npm run typecheck`.

## Content and deployment
The official menu, confirmed event lineup and closing hours have not been supplied. The homepage labels those dependencies and avoids fabricated listings or prices. Image assets are generated concepts, not actual venue photos.

Sanity foundations: `lib/sanity.ts`, `sanity/schemaTypes.ts`, `.env.example`. The read-only client remains null until configured. Connect an owner-controlled Sanity project and register the schema definitions in a Studio before wiring public content. No Sanity account or Studio has been provisioned.

For Vercel, import this repository using the Next.js preset, retain the `npm run build` command and configure the public Sanity project/dataset variables after the CMS is ready. No deployment has been made. Review content before production publication.

Brand guidelines: `public/design-system.md`. Image-generation prompts and provenance: `public/image-prompts.md`.
