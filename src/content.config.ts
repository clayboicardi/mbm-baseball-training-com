import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Spec 1 — Pitch-Design Content Engine (docs/content/myles-content-roadmap.md).
// One markdown article per pitch, served at /pitching/<slug>. Content Layer
// collection (Astro 6). src/pages/pitching/[slug].astro filters drafts out.
const pitches = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pitches" }),
  schema: z.object({
    title: z.string(), // SEO <title> + H1
    pitch: z.string(), // display name, e.g. "Knuckle Curve"
    cue: z.string(), // Myles's one-liner
    description: z.string(), // meta description
    targetKeyword: z.string(), // primary long-tail query this post targets
    order: z.number().default(99),
    draft: z.boolean().default(true),
    updated: z.coerce.date().optional(),
  }),
});

// Phase 3 — Local-SEO landing pages. One JSON file per city, served at
// /baseball-lessons/<slug>. Honesty gate: every page carries genuinely
// location-specific, verifiable copy (lead + 2+ body paragraphs + 2+ FAQ are
// required, so no thin doorway page can ship). `fields` / `scene` hold only
// facts that survive a parent checking them.
const locations = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/data/locations" }),
  schema: z.object({
    city: z.string(), // display name, e.g. "Huntington Beach"
    region: z.enum(["Los Angeles County", "Orange County"]),
    title: z.string(), // SEO <title>
    description: z.string(), // meta description
    h1: z.string(),
    lead: z.string(), // intro paragraph under the H1
    body: z.array(z.string()).min(2), // genuinely local paragraphs
    fields: z.array(z.object({ name: z.string(), note: z.string().optional() })).default([]),
    scene: z.string().optional(), // local youth-baseball landscape (verifiable)
    travel: z.string().optional(), // distance / logistics line
    faq: z.array(z.object({ q: z.string(), a: z.string() })).min(2),
    order: z.number().default(99),
    updated: z.coerce.date().optional(),
  }),
});

// "What I Coach" skill pages. One JSON file per coaching area, served at
// /coaching/<slug>. Same honesty gate as locations: every page carries real,
// useful instruction (lead + 2+ body paragraphs + 3+ focus areas + 2+ FAQ are
// required), so no thin "service" stub can ship.
const coaching = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/data/coaching" }),
  schema: z.object({
    skill: z.string(), // display name, e.g. "Throwing Mechanics"
    icon: z.string(), // lucide icon (mirrors services.json)
    serviceType: z.string(), // schema.org Service.serviceType
    title: z.string(), // SEO <title>
    description: z.string(), // meta description
    h1: z.string(),
    lead: z.string(), // intro paragraph under the H1
    body: z.array(z.string()).min(2), // genuinely useful instruction
    focus: z.array(z.object({ name: z.string(), note: z.string().optional() })).min(3), // what we work on
    faq: z.array(z.object({ q: z.string(), a: z.string() })).min(2),
    order: z.number().default(99),
  }),
});

export const collections = { pitches, locations, coaching };
