import { createClient } from '@sanity/client';
// A public, read-only client. Write credentials must never enter browser code.
export const sanityClient = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.NEXT_PUBLIC_SANITY_DATASET
 ? createClient({ projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, dataset: process.env.NEXT_PUBLIC_SANITY_DATASET, apiVersion: '2026-09-01', useCdn: true })
 : null;
