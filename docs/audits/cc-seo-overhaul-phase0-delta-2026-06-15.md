# Phase 0 Delta — SEO/SD/Local-Pages Overhaul

> Produced 2026-06-15 at the Phase-0 STOP gate. Grounds the overhaul in the repo's
> *actual* state (first-hand reads), not the prompt's assumptions. Baseline verified
> green: `check:content` pass · `astro check` 0 err / 0 warn / 10 hints · `build` OK (4 pages).

## Headline
**Most of Phase 1 is already implemented.** The earlier audit was executed more completely
than the prompt assumed. The real remaining work concentrates in **Phase 2 (typed `@graph`
system + `schema-check` gate + tests)** and **Phase 3 (local landing pages)**.

## Clay's decisions at the gate (2026-06-15)
1. **Sequencing** → Phase 1 remnant + Phase 2 in one branch/PR; then Phase 3; then Phase 4.
2. **Geo/hours** → **keep omitted** (areaServed only) — honest service-area position.
3. **Phase 3** → Long Beach + the most monetizable Orange County cities (CC picks the high-value shortlist; ground each page in real local detail).
4. **Phase 4** → complete in full now using current context; Myles reviews the live site and we iterate.
- Execution: one worktree (`worktree-seo-overhaul`), phase-tagged commits, **STOP before any push to main** (deploys live).

---

## "Already done" claims — VERIFIED present
| Claim | Status | Evidence |
|---|---|---|
| Worker www→apex 301 | ✅ present | `worker.js:16-18` (CANONICAL_ORIGIN, `run_worker_first`) |
| BaseLayout SEO props + canonical + OG/Twitter | ✅ present | `BaseLayout.astro:8-23,91,102-114` |
| LocalBusiness/SportsActivityLocation enriched (@id, E.164, areaServed, founder, hasOfferCatalog, priceRange) | ✅ present | `BaseLayout.astro:34-82` — areaServed is **15 cities** |
| 404 noindex + H1; legal unique descriptions | ✅ (LegalLayout) | props exist |
| Images via `astro:assets` responsive | ✅ present | `Hero.astro`, `Nav.astro`, `Proof.astro` |
| `check-content.mjs` referential gate | ✅ present + passing | `scripts/check-content.mjs` |
| Sitemap absolute URLs + git lastmod; robots → sitemap | ✅ present | `astro.config.mjs:15-32,71`, `robots.txt:3` |

## Phase 1 items — MOSTLY ALREADY DONE
| Phase-1 item | Status | Evidence |
|---|---|---|
| Hero LCP = eager `<Image>` behind overlay, alt, fetchpriority high | ✅ done | `Hero.astro:8-18` (refine: `widths={[400,600]}` small for desktop; `quality={55}`) |
| Homepage meta description (local + CTA) | ✅ done | `index.astro:17`; title default already local (`BaseLayout.astro:16`) |
| `public/_headers`: `/_astro` immutable + security headers + CSP + no-transform | ✅ done | `public/_headers:5-29` |
| Fonts latin-only subset | ✅ done | `global.css:2-7`; `BaseLayout.astro:5-6,89-90` (refine: 6 weights — trim unused) |
| A11y skip-link + `<main id="main">` | ✅ done | `BaseLayout.astro:117-121`, `index.astro:20` |
| A11y mobile-nav tap targets + close-on-click + aria-label | ✅ done | `Nav.astro:10,14,32-39` |
| Proof `id="gallery"` + unique/decorative alt | ✅ done | `Proof.astro:11-22,26` |
| **CSS inlining** `build:{inlineStylesheets:'always'}` | ❌ **PENDING** | not in `astro.config.mjs` |
| **Test harness + header/title/canonical/OG tests** | ❌ **PENDING** | no `test` script, no `*.test.mjs` |
| `aria-hidden` on decorative icons/✓ | ⚠️ partial | hamburger SVG + any ✓ checkmarks unaudited |
| og:image:width/height/type | ⚠️ optional | absent |

**Net Phase 1 remaining ≈ CSS inlining + test harness/tests + a couple a11y micro-fixes.**

## Phase 2 — GENUINELY PENDING (the real work)
- Typed `@graph` system (`schema.ts` + `schema-global.ts` + `StructuredData.astro`): **not present** (BaseLayout emits one inline LocalBusiness object).
- `schema-check.mjs` + test + npm wiring: **not present.**
- `geo` + `openingHoursSpecification`: **intentionally omitted, keeping omitted per Clay** (service-area business; `BaseLayout.astro:28-31`).

## Phase 3 — local landing pages: NONE EXIST
- Long Beach + top monetizable OC cities (per Clay). New content collection + dynamic route (port of `[industry].astro`) + hub-and-spoke internal linking. Honesty gate: real per-city content, no thin doorways.

## Phase 4 — pitch engine: INFRA STAGED, complete in full
- Collection + `[slug].astro` present; 0 live routes (all draft). Build `/pitching/index.astro` hub + `Article` schema; reframe 5 posts honestly (cues were individualized → frame as coach's-philosophy/illustrative, not universal prescription), set `draft:false`. Myles reviews live.

## Confirmed
- Test framework `node --test` + `schema-check` (overturns old "no test framework").
- Pricing / `packages.json` TABLED — untouched.
- Testimonials / Review / AggregateRating deferred; `schema-check` forbids those nodes.
