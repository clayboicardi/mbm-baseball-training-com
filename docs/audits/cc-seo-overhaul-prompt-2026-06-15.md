# MBM Site — SEO / Structured-Data / Local-Pages Overhaul Prompt

> **How to use:** open a FRESH Claude Code session with working dir
> `~/Projects/mbm-baseball-training-com`
> (this laptop: `C:\Users\clayboicardi\Projects\mbm-baseball-training-com`;
> Cortex/desktop: `C:\Users\chawo\Projects\mbm-baseball-training-com`) and paste this
> whole file. Fresh context is intended.
>
> **Source-pattern repo:** clayboicardi.com lives on the same machine at
> `~/Projects/clayboicardi-com` (main branch). It just finished ~1 week of intensive
> SEO / structured-data / internal-linking / performance work. **Read its actual
> implementation files** (paths below) and port the *patterns*, right-sized for a small
> local-business site — do not blindly copy its 48-page studio scale.

---

## Mission

Bring MBM Baseball Training (Astro 6 static site on Cloudflare Workers,
`https://mbm-baseball-training.com`) up to **parity with clayboicardi.com's recent
SEO/structured-data/performance/quality work**, finish the **pending items from MBM's own
earlier audit**, and build out **local-SEO landing pages** — MBM's single biggest growth
lever as a local Long Beach business.

This is **gap-closing, not a from-scratch build.** MBM already shares the stack and has
already implemented much of an earlier audit (see "Already done — DO NOT redo").

### Scope (locked with Clay, 2026-06-15)
- ✅ **Technical parity** — port clayboicardi's June infra (typed `@graph` structured-data
  system + `schema-check` gate, performance inlining, focused test suite).
- ✅ **Finish pending old-audit items** (hero LCP, security headers, homepage meta, etc.).
- ✅ **Local-SEO landing pages** — city/service-area pages using clayboicardi's
  vertical-page *pattern* applied to local search intent.
- ✅ **Pitch content engine** — Myles has supplied direction (relayed by Clay at the gate);
  build the `/pitching` hub + publish the reframed pitch articles.
- ✅ **Geo + opening hours** — Myles has supplied these (relayed by Clay at the gate); add to
  LocalBusiness schema.
- ⛔ **DEFERRED (not this overhaul):** testimonials + `Review`/`AggregateRating` schema
  (no parent consent yet), the "5-Pitch Arsenal" lead-magnet PDF (downstream of traffic),
  **all pricing / `packages.json` changes** (TABLED — Myles is deliberating the deeper pricing
  question), and all off-site work (GBP, citations, backlinks — Clay/Myles-owned).

---

## Read first (full detail + exact file:line)
**MBM's own planning docs (this repo):**
- `docs/audits/codex-seo-audit.md` — SEO audit (canonical host, schema, LCP, local-keyword fixes)
- `docs/audits/codex-codebase-audit.md` — engineering audit
- `docs/audits/cc-implementation-prompt.md` — the *earlier* prompt (partly executed already)
- `docs/content/myles-content-roadmap.md` — Spec 1/2/3 + **the pitch-content LOCK** (read the
  "CONTENT LOCK UPDATE 2026-06-05" section carefully)
- `docs/content/myles-questions.md` — the 5 pitches + cues + quotes draft
- `docs/research/market-research-longbeach-2026-06-01.md` — competitor set, pricing decisions,
  **target cities/areas, Heartwell Park home base, discovery channels**
- `docs/branding/brand-locked.md` — LOCKED palette + voice
- Run `mem_search` engram project `mbm-baseball-training-com` for stack/brand/deploy facts.

**clayboicardi.com reference implementations (`~/Projects/clayboicardi-com`, main):**
- Structured data: `src/data/schema.ts`, `src/data/schema-global.ts`,
  `src/components/StructuredData.astro`, `scripts/schema-check.mjs` (+ `*.test.mjs` for it)
- SEO meta: `src/layouts/BaseLayout.astro`
- Worker / canonical redirects: `worker/index.js`
- Sitemap per-URL lastmod: `scripts/sitemap-lastmod.mjs`, `scripts/last-modified.mjs`
- Internal linking / hub-and-spoke: `src/components/Footer.astro`,
  `src/components/studio/IndustriesRow.astro`,
  `src/pages/studio/industries/index.astro`,
  `src/pages/studio/industries/[industry].astro`, `src/lib/related-industries.mjs`
- Page/content pattern: `src/content.config.ts`, `src/data/studio-industries/*.json`
- Perf: `astro.config.mjs` (`build: { inlineStylesheets: 'always' }`)
- Tests / gates: `scripts/check-voice.mjs`, `package.json` scripts
- Project rules + structured-data invariants doc: `clayboicardi-com/CLAUDE.md`

---

## Stack / facts (MBM)
Astro **6.4.2** static · Tailwind **v4** (`@tailwindcss/vite`, Vite pinned `^7` via overrides) ·
daisyUI **v5** ("mbm" theme in `src/styles/global.css`) · astro-icon/lucide ·
`@astrojs/sitemap` (currently a **global** git-derived `lastmod`) · `@fontsource` Oswald/Inter.
Deploy: Cloudflare Workers static assets (`wrangler.jsonc`); `git push main` auto-builds via CF;
local `npm run build && npx wrangler deploy` also works. Canonical host = **apex**
`https://mbm-baseball-training.com` (`astro.config.mjs` `site`).

## Already done — DO NOT redo (verify, then move on)
- `worker.js` / worker does **www→apex 301**; canonical host enforced.
- `BaseLayout` already has `title`/`description`/`image`/`noindex`/`noBusinessSchema` props +
  canonical + full OG/Twitter.
- **LocalBusiness + SportsActivityLocation JSON-LD already enriched**: `@id`, E.164 phone,
  13-city `areaServed`, `founder` Person (Myles), `hasOfferCatalog` from `packages.json`,
  `priceRange`. (Missing only `geo` + `openingHoursSpecification` — added in Phase 2.)
- **404** is `noindex` + has an H1; legal pages have unique descriptions (`LegalLayout`).
- Images already use `astro:assets` with responsive widths/quality.
- `scripts/check-content.mjs` referential-integrity gate exists and runs on `npm run check:content`.
- Sitemap emits absolute URLs with a git-based lastmod; `robots.txt` points to it.

## Locked constraints (non-negotiable)
1. 🔒 **Brand palette LOCKED** (`docs/branding/brand-locked.md`): blue `#005A9C` + white
   dominant, red `#EF3E42` sparing, marigold `#EBB257` folk-art only, navy `#0B1F33` dark field.
   **Do NOT change the locked palette globally without flagging Clay.**
2. 🔒 **Pitch-article publish gate:** the 5 drafts in `src/content/pitches/*.md` were written
   prescriptively from cues that Myles said were **individualized to one pitcher**, not universal.
   They stay `draft:true` UNTIL published via the **Myles-approved reframe** (Clay relays the
   direction at the Phase-5 STOP gate). Do not publish them as-is.
3. 🔒 **No fabricated social proof:** NO `Review` / `AggregateRating` schema and no testimonial
   content until real, consented reviews exist. (Matches clayboicardi's `schema-check`
   forbidden-node rule.) This is deferred entirely.
4. ✅ **Honesty gate:** every on-page claim must survive a prospect checking it. No invented
   credentials, locations, stats, or results.
5. **STOP before any `git push main`** — it deploys live. Push only on Clay's explicit approval.

## Decisions (locked with Clay, 2026-06-15)
- **Quality gates:** add `schema-check` **and** a focused test suite (Node built-in
  `node --test`, like clayboicardi — no heavy new dep). This **overturns** the earlier
  "no test framework" decision in `cc-implementation-prompt.md` §B.
- **Execution:** phased, **STOP gates** for Clay/Myles input + before every push, **one PR per
  phase**, worktree-isolated.
- **Myles inputs available now** (Clay relays the values at each STOP gate, or pre-fills the
  "Clay-supplied inputs" block below): **geo/training locations, opening hours,
  pitch-article direction.** Testimonials are NOT available (deferred).

---

## Clay-supplied inputs (fill in to skip the matching STOP gate; otherwise the session will ask)
```
GEO / TRAINING LOCATIONS:
  - Home base: Heartwell Park, Long Beach (per market research) — confirm exact address / lat-lng
  - Lat/Lng: __________
  - Service-area / additional fields: __________

OPENING HOURS / AVAILABILITY (for openingHoursSpecification):
  - __________

PITCH-ARTICLE DIRECTION (how to reframe the 5 drafts to publish honestly):
  - __________

TARGET CITIES for local landing pages (default from market research below; edit):
  - Long Beach (home), Lakewood, Signal Hill, Los Alamitos, Seal Beach, Cerritos,
    + Orange County / Irvine — confirm the list + whether to do city × service combos
  - __________

PRICING: TABLED — out of scope this overhaul. Do NOT touch packages.json pricing/tiers/add-ons.
  (Myles is deliberating the deeper pricing question separately — see Deferred section.)
```

---

## Phases

### Phase 0 — Setup, delta audit, test harness
1. Create a **worktree** for this work (use the native worktree tool if available).
2. `npm install`; confirm a green baseline: `npm run check:content` → `npx astro check`
   (expect 0/0/0) → `npm run build`.
3. Read the docs in "Read first" + the clayboicardi reference files. `mem_search` engram.
4. Stand up a `node --test` harness: add `"test": "node --test"` to `package.json` and one
   trivial passing test, so every later phase is TDD-able.
5. Produce a short written **delta**: for each item in "Already done", confirm it's actually
   present; for each Phase 1–5 item, note current state. Surface anything that contradicts this
   prompt.
6. **STOP** — present the delta + the phase plan; get Clay's go-ahead (and any pre-filled inputs).

### Phase 1 — SEO / accessibility / performance finish (PR)
Well-specified in `docs/audits/codex-seo-audit.md` + `cc-implementation-prompt.md` §A. Implement
only what the Phase-0 delta shows is still missing. Likely:
- **Hero LCP:** replace the CSS-background hero with an absolutely-positioned eager
  `<Image>`/`<picture>` (responsive `widths`, `sizes="100vw"`, `loading="eager"`,
  `fetchpriority="high"`) behind the overlay; meaningful `alt`.
- **Homepage meta description** → local + CTA, e.g. *"Private youth baseball lessons in Long
  Beach with Coach Myles — hitting, fielding, throwing, and baseball IQ for ages 8–18. Claim a
  free first lesson."* Consider title → *"Private Baseball Lessons Long Beach | MBM Baseball
  Training"*.
- **Natural local-keyword weaving** into existing headings/copy (no stuffing): "private baseball
  coach Long Beach", "hitting lessons Long Beach".
- **`public/_headers`:** `/_astro/*` → `Cache-Control: public, max-age=31536000, immutable`;
  global security headers (HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`,
  a CSP allowing `frame-src https://tally.so https://cal.com`, `frame-ancestors 'none'`,
  `img-src 'self' data: https:`, `'unsafe-inline'` for the hero inline style + JSON-LD).
  (The Last-Modified header is already injected at build — keep that intact.)
- **CSS inlining:** add `build: { inlineStylesheets: 'always' }` to `astro.config.mjs`
  (clayboicardi pattern — de-render-blocks the shared CSS chunk on a brochure site). Verify CSP
  already allows `'unsafe-inline'` for styles.
- **Fonts:** switch `@fontsource/*` imports to **latin-only** subset files to shrink the
  render-blocking CSS.
- **A11y quick wins:** skip-link + `<main id="main">`; `aria-hidden` on decorative icons/✓;
  larger mobile-nav tap targets + close-on-click; Proof section `id="gallery"`; unique gallery
  `alt` (or `alt=""` for decorative).
- Tests: assert security headers exist, homepage `<title>`/description, canonical, one-OG-image.
- **Verify** (every phase): `npm run check:content` → `npx astro check` (0/0/0) → `npm run build`
  → `npm test` → visual `npm run preview` (desktop + mobile). **STOP** before push.

### Phase 2 — Structured-data `@graph` system + schema-check gate + geo/hours (PR)
Port clayboicardi's typed `@graph`-per-route system, **right-sized** for MBM (small site —
LocalBusiness is the central entity, not a separate Organization).
- Create `src/data/schema.ts` (per-route node builders: `webPageNode`, `serviceNode`,
  `breadcrumbNode`, `articleNode` for pitch posts, `offerCatalogNode`) and
  `src/data/schema-global.ts` (the global identity graph: **LocalBusiness/SportsActivityLocation**
  as the anchor entity + `WebSite` + `Person` Myles). Builders return bare nodes (no nested
  `@context`).
- Create `src/components/StructuredData.astro` that merges global + per-route nodes into **one**
  `@graph` with a single top-level `@context`. Replace BaseLayout's inline JSON-LD with it.
  **Preserve every field the current LocalBusiness already has** (@id, E.164, areaServed,
  founder, hasOfferCatalog, priceRange).
- **Add `geo` + `openingHoursSpecification`** from Myles' data (STOP for values if not pre-filled).
- Port `scripts/schema-check.mjs` with MBM routes: one graph/page, unique `@id`s, intra/cross-page
  ref resolution, and the **forbidden list** (FAQPage, Review, AggregateRating, ProfessionalService).
  Wire `"preschema-check": "npm run build"` + `"schema-check": "node scripts/schema-check.mjs"`.
- Per-route expectations: home carries LocalBusiness/WebSite/Person + WebPage; legal/404 carry
  only the global identity (or minimal) — match clayboicardi's legal/404 rule.
- Keep the existing on-page FAQ **visible but OUT of JSON-LD** (FAQ rich result discontinued).
- TDD: write `schema-check.test.mjs` first; build the system to pass it. Validate representative
  routes in Google Rich Results Test. **STOP** before push.

### Phase 3 — Local-SEO landing pages (PR or PR-per-batch)
The growth lever. Apply clayboicardi's content-collection + dynamic-route + hub-and-spoke pattern
to **local intent**, grounded in `market-research-longbeach-2026-06-01.md`.
- Decide structure with Clay (STOP): city pages (`/baseball-lessons/long-beach`, …), service
  pages (`/hitting-lessons`, `/fielding`, …), or city×service. Default target set in the
  Clay-supplied inputs block.
- Build via a content collection (`src/content.config.ts`) + dynamic route, mirroring
  clayboicardi's `[industry].astro`. Each page: unique H1/title/description, genuinely
  location/service-specific copy (NO thin doorway pages — honesty gate), `serviceNode` +
  `webPageNode` + `breadcrumbNode` JSON-LD, and internal links.
- **Internal linking topology:** add a sitewide footer hub linking the new pages
  (clayboicardi `Footer.astro` pattern); add related-links between sibling pages
  (`related-industries.mjs` pattern); ensure nothing is orphaned. Sitemap auto-includes them.
- Each page must pass `schema-check` + `check-content`. Tests for route generation + schema.
  **STOP** before push.

### Phase 4 — Pitch content engine (PR)
Only after Clay relays Myles' **reframe direction** (STOP gate). Then:
- Build `/pitching/index.astro` hub + keep `/pitching/[slug].astro` renderer; add nav/footer link.
- Rewrite the 5 posts per Myles' approved framing (honest, generalizable OR explicitly
  case-study), set `draft:false`.
- Add `Article`/`BlogPosting` JSON-LD per post via the Phase-2 `articleNode` builder; breadcrumbs;
  internal links to/from the hub and homepage pitching section.
- Validate schema; tests for the pitch routes. **STOP** before push.

### Optional / low-priority (only if time + Clay wants)
- Per-URL transitive `lastmod` (clayboicardi `sitemap-lastmod.mjs`) — marginal on a small site;
  the current global lastmod is honest. Skip unless page count grows.
- A light `voice-check`/brand-lint adapted from clayboicardi `check-voice.mjs`.

---

## Deferred — documented so nothing is lost (NOT in this overhaul)
- **Testimonials + Review/AggregateRating schema** — gated on Myles collecting written, consented
  family reviews (esp. minors' first name + age). Plumbing can wait until data exists.
- **"5-Pitch Arsenal" lead-magnet PDF + capture form** — downstream of pitch traffic.
- **Off-site (Clay/Myles-owned):** Google Business Profile (top local-pack lever), citations
  (Bing Places, Apple Business Connect, Yelp, Nextdoor, youth-sports directories), local backlinks
  (LB leagues/schools/sponsors), collecting Google reviews.
- **Pricing / `packages.json` — TABLED.** Do NOT change any pricing, tiers, or add-ons this
  overhaul. Myles is deliberating the deeper pricing question (60-min rate, the $36 TeachMe.To vs
  site-rate reconciliation, the video add-on, a 10-session mid-tier, Elite payment plan — all laid
  out in `market-research-longbeach-2026-06-01.md`). Leave `packages.json` untouched; schema
  `hasOfferCatalog` keeps reading whatever is currently there. Use the market-research doc for
  **city/area targeting only**, not for pricing edits.

## Working rules
- One PR per phase; conventional commit messages; commit per logical group within a phase.
- Don't touch the locked brand palette globally without flagging Clay.
- Do **not** modify `packages.json` pricing/tiers/add-ons — pricing is tabled this overhaul (see Deferred).
- After each phase: full verify chain (`check:content` → `astro check` 0/0/0 → `build` → `test` →
  visual preview → Rich Results for schema phases). **Never push to `main` without Clay's OK.**
- When a phase is done, summarize what shipped + what's left + the next STOP gate.
- End: cross-machine sync reminder (commit, then `~/.claude/scripts/sync-projects.ps1`).
