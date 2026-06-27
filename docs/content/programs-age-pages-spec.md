# Programs by Age — Design Spec

**Status:** Design approved by Clay 2026-06-25. Awaiting spec review → implementation plan.
**Extends:** `docs/content/myles-content-roadmap.md` (this is a new, separate workstream).
**Axis:** Age/developmental stage — *distinct* from `/coaching/` (which slices by skill).

---

## 1. Goal

Add four age-band "program" pages that tell a parent exactly what Coach Myles develops
and what he is preparing their player *for* at each stage — from keeping the game fun at
8 to recruit/pro readiness at 18. The throughline is the mental game, dialed up each stage,
which reinforces the "mental game first" philosophy already live on the homepage.

Source of the per-stage framework is **Myles directly** (his own words, captured 2026-06-25),
NOT extrapolated from session footage. This satisfies the content-honesty gate that forced
the pitching posts to stay in draft (those cues turned out individualized to one pitcher).

## 2. The four bands

| Order | Age | Page name | Slug | URL |
|---|---|---|---|---|
| 1 | 8–10 | Foundations | `foundations` | `/programs/foundations/` |
| 2 | 11–13 | Pre-High-School Prep | `pre-high-school` | `/programs/pre-high-school/` |
| 3 | 14–15 | High School Prep | `high-school-prep` | `/programs/high-school-prep/` |
| 4 | 16–18 | College & Pro Prep | `college-prep` | `/programs/college-prep/` |

Myles's framework (his stated intent per band — the spine of each page's copy):

- **8–10 — Foundations.** Mechanics perfection, confidence in current skills + developing new
  ones, keep the game **fun** while teaching fundamentals.
- **11–13 — Pre-High-School Prep.** Take away bad habits; fix the issues that block the jump to
  high school. Fundamentals **and** mental game (mental game introduced here).
- **14–15 — High School Prep.** At-bats, the mental stress of good/bad days, aggressive on
  offense **and** defense, getting through the struggles of baseball in general.
- **16–18 — College & Pro Prep.** **Mainly mental** + drilling fine-tuned mechanics. Goal:
  get players college- and pro-ready.

Narrative arc across the set: **fun → fix → compete → elevate**, mental game climbing each stage.

## 3. Information architecture

- New Astro content collection **`programs`** (mirrors the proven `coaching` collection):
  one JSON file per band in `src/data/programs/`.
- Hub page `src/pages/programs/index.astro` — lists the four bands as cards, sorted by age
  (clone of `/coaching/` index).
- Detail renderer `src/pages/programs/[slug].astro` — clone of `/coaching/[slug].astro`.
- Astro sitemap auto-includes the new routes.

**Navigation & discovery**
- Add **"Programs"** to `site.json` `nav`, slotted after "Services".
- Homepage **"Find your player's stage"** band-picker block → links into the four pages
  (age is a primary parent self-select; earns the real estate).
- Cross-linking: each band page links to relevant `/coaching/` skill pages + `/packages/`
  tiers + the booking CTA; the matching skill/package pages link back to the band.
- Each band page links to the **next band up** via the "what's next" block (turns four pages
  into one visible ladder).

## 4. Content collection schema

Mirror the `coaching` schema with the same honesty gate, plus stage-specific fields.
`src/content.config.ts` — new `programs` collection:

```ts
const programs = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/data/programs" }),
  schema: z.object({
    band: z.string(),            // display range, e.g. "Ages 8–10"
    ageMin: z.number(),          // for sort + schema audience
    ageMax: z.number(),
    icon: z.string(),            // lucide icon
    serviceType: z.string(),     // schema.org Service.serviceType
    title: z.string(),           // SEO <title>
    description: z.string(),     // meta description
    h1: z.string(),
    goal: z.string(),            // one-line stage promise (hero subhead)
    lead: z.string(),            // intro paragraph under the H1
    body: z.array(z.string()).min(2),                              // stage explanation
    focus: z.array(z.object({ name: z.string(), note: z.string().optional() })).min(3),
    mentalGame: z.string(),      // the stage-specific mental-game block
    preparingFor: z.string(),    // the "what's next" bridge copy
    nextSlug: z.string().optional(), // slug of the next band up (cross-link)
    faq: z.array(z.object({ q: z.string(), a: z.string() })).min(2),
    order: z.number().default(99),
  }),
});
```

Honesty gate (enforced by the schema + the existing `check-content.mjs` pattern):
lead + 2+ body paragraphs + 3+ focus items + 2+ FAQ. No thin page can ship.

## 5. Page template anatomy

Every band page renders the same blocks (so they read as a set):

1. **Hero** — H1 + `goal` one-liner. Per-slug treated hero photo (see §7) with light navy
   scrim, falling back to solid navy (same pattern as `coaching/[slug]`).
2. **The stage, in Myles's framing** — `body[]` paragraphs.
3. **What we work on here** — `focus[]` grid.
4. **The mental game at this stage** — dedicated `mentalGame` block on every page, dialed to
   the age (introduced @ 11–13 → stress of good/bad days @ 14–15 → primary @ 16–18).
5. **What's next** — `preparingFor` copy + a button to the next band (`nextSlug`).
6. **FAQ** — `faq[]` accordion.
7. **CTA** — "Claim Your Free First Lesson" + "View Packages".

## 6. Schema.org (per the existing `data/schema.ts` helpers)

- Detail page: `Service` (with `audience` carrying `suggestedMinAge`/`suggestedMaxAge` from
  `ageMin`/`ageMax` — an age-targeting signal) + `WebPage` (about the Service) +
  `BreadcrumbList`. Global LocalBusiness/WebSite/Person stay in `StructuredData`.
- Hub page: `CollectionPage` + `BreadcrumbList`, `hasPart` → the four band WebPages.

## 7. Image plan (realistic — see §8)

- **Default:** solid-navy hero (the existing fallback), so no page is blocked on photography.
- **Foundations (8–10) and/or the `/coaching/` Hitting page** *may* use stills pulled from
  the 2026-06-25 training clips (youth swing sequence + coach bat-path demo) — **gated on the
  MLB-branding decision** (Ohtani/Dodgers gear is visible in the footage). Until cleared,
  fallback hero stands.
- Older bands (14–15, 16–18) have no matching footage; fallback hero until a future shoot.
- See the capture brief in §8 for getting hero-quality, on-brand stills + coach-voice clips.

## 8. Content sourcing, gates & the 2026-06-25 footage

**Framework (spine):** Myles's four paragraphs (§2) are enough to draft all four pages
honestly now. Nothing is blocked.

**Optional booster (forward to Myles, not blocking):** per band — (1) 2–3 concrete drills he
runs at this age; (2) what a player *leaving* this stage looks like (the bridge line);
(3) the #1 thing parents at this age get wrong/worry about (seeds a real FAQ).

**Gates (non-negotiable):**
- Myles reviews + signs off on the four drafts before publish (same gate as the pitch posts).
- Minor consent for any named quote/photo of a player.
- Do NOT generalize one player's individualized session into universal advice.

**What the 2026-06-25 videos actually provide (verified against Gemini + ChatGPT breakdowns):**
- 3 short clips: ~4s + ~9s youth tee swings + a ~25s coach slow-motion bat-path demo. Hitting,
  youth (~8–11). **No usable spoken coaching** — audio is a "three, two, one… good" countdown
  and camera directions; the rest is slow-motion distortion.
- Therefore the videos feed **stills (young-player pages) + social content only — NOT quotes,
  voice, or methodology copy.**
- Cross-check disagreements (do not assert): handedness (Gemini: left + "Ohtani 17"; ChatGPT:
  right) and MLB-branding visibility. Resolve by eye before any still is used.

**Capture brief for the next shoot (to get the coaching voice the pages want):**
- One 60–90s **mic'd talking-head per band** ("what I focus on with 8–10s and why") → real
  coach-to-camera clip + a verbatim pull-quote per page.
- One **mic'd live rep at normal speed** (slow-mo destroys the audio; keep slow-mo as a
  separate visual-only take).
- A few reps in **neutral / MBM gear** for clean, on-brand hero stills.
- Capture **horizontal (site hero) + vertical (Reels)** framing.

## 9. Effort & sequence

1. Infra (~1–2h): `programs` collection + hub + `[slug]` template + nav entry + homepage
   band-picker. Essentially a clone of `/coaching/`.
2. Draft the four pages from Myles's framework → Myles reviews → ship.
3. Slot real stills into Foundations/Hitting whenever the branding call is made (off the
   critical path).

## 10. Success metrics

- 4 indexed `/programs/*` pages + hub, all passing the content honesty gate.
- Impressions/clicks on age- and goal-intent queries ("college prep baseball training",
  "high school baseball prep coach", "youth baseball lessons 8 year old", etc.).
- Assisted bookings (band page → free first lesson).

## 11. Resolved decisions (Clay, 2026-06-25)

1. **11–13 slug name** — `pre-high-school`. ✅
2. **Nav placement** — add "Programs" to `site.json` `nav`, immediately **after "Services"**. ✅
3. **MLB-branding / stills** — **ship fallback navy heroes now**; add real photos later (a
   reshoot in neutral/MBM gear is the preferred future source, per §8). The 2026-06-25 stills
   are NOT used in the initial build. ✅
