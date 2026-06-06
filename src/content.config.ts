import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Spec 1 — Pitch-Design Content Engine (docs/content/myles-content-roadmap.md).
// One markdown article per pitch, served at /pitching/<slug>. Content Layer
// collection (Astro 6). Posts ship draft:true until Myles confirms the cue, and
// src/pages/pitching/[slug].astro filters drafts out — so an unconfirmed pitch
// never builds a live route.
const pitches = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pitches" }),
  schema: z.object({
    title: z.string(), // SEO <title> + H1
    pitch: z.string(), // display name, e.g. "Knuckle Curve"
    cue: z.string(), // Myles's one-liner (pending his confirm)
    description: z.string(), // meta description
    targetKeyword: z.string(), // primary long-tail query this post targets
    order: z.number().default(99),
    draft: z.boolean().default(true),
    updated: z.coerce.date().optional(),
  }),
});

export const collections = { pitches };
