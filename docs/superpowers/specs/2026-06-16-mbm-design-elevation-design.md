# MBM Baseball Training — Design Elevation ("Heritage Athletic") Design Spec

**Date:** 2026-06-16
**Status:** Draft for review (Clay + Myles)
**Author:** Clay + CC
**Extends:** `docs/superpowers/specs/2026-06-01-mbm-website-design.md` (this is the
presentation-layer realization of that spec's stated "anti-generic principle:
hand-craft the signature layouts so it reads as MBM, not a stock template").

---

## Goal

Elevate the live site's *aesthetics and UX to an elite level* and shed the generic
component-library feel — **without** changing content, routes, structured data, or
the conversion structure already shipped. The site currently reads as a clean but
stock daisyUI build; the brand underneath is genuinely distinctive (a Día de
Muertos sugar-skull baseball mark with a marigold folk-art accent). The work is to
make the **surface finally express the identity that already exists**.

## Context

- Audience: parents of players ages 8–18 (mostly mobile) + the players.
- The site is live and has three shipped batches: SEO/structured-data overhaul
  (PR #7), `/coaching` pages (#8), `/packages` pages (#9). This spec is a
  **presentation-layer reskin** on top of that — it must preserve all of it.
- Brand source of truth: `docs/branding/brand-locked.md`. The mark is a capped
  calavera ("11" on the brow) in a blue baseball-diamond frame with crossed bats;
  restrained Día de Muertos folk-art register; marigold gold is the festive accent.

## Locked decisions (from the 2026-06-16 brainstorm)

1. **Direction: "Heritage Athletic."** A blend of heritage/vintage-baseball warmth
   and modern athletic energy, with Día de Muertos folk-art as a **tasteful
   accent** (athletic-first leads; folk-art appears at key moments, never costume).
2. **Scope: signature hero + custom showpieces**, on top of a reversible
   design-system polish pass underneath. (Not a from-scratch rebuild.)
3. **Palette stays LOCKED** (`#005A9C` blue + `#FFFFFF` white dominant; `#EF3E42`
   red + `#EBB257` marigold sparing). Distinctiveness comes from **type, texture,
   ornament, motion, photography treatment, and custom layout — not new colors.**
4. **Folk-art register = tasteful accent**, handled with cultural respect
   (celebratory/family/remembrance framing; marigold + papel-picado; the calavera
   used with reverence). **Never** Halloween/spooky/skulls-everywhere.
5. **Non-negotiable constraints carry over:** Astro near-zero-JS, Lighthouse ~100
   (perf/a11y/best-practices/SEO), mobile-first, accessible, `prefers-reduced-
   motion` honored. `packages.json` pricing/tiers untouched. FAQ visible but out of
   JSON-LD. One `@graph` per page; global identity via stable `@id`s.

## Benchmark (what separates elite sports/coaching sites from generic ones)

Reference set (multi-provider research, 2026-06-16): Driveline Baseball, Tread
Athletics, Cressey Sports Performance, P3 Applied Sports Science, On Running, Nike
Training, ESPN "Ignite" 2025 rebrand, LA28 "LA in Bloom" identity. Cultural sources
for Día de Muertos handling: Smithsonian, UNESCO (intangible cultural heritage),
National Museum of Mexican Art.

Distilled principles driving this spec:

1. **A signature type move** — a characterful *display* face for big moments, on a
   fluid scale (ESPN Ignite, LA28). Generic = one font, one weight.
2. **Treated photography** — full-bleed duotone/scrim/grain makes even limited/soft
   source photos look intentional (Nike, On, Driveline). Directly fixes our
   weakest asset (the current low-res game-day photos).
3. **One cultural motif as a system, not decoration** — LA28's florals are the
   model: a single motif family (marigold + papel-picado + baseball-stitch/diamond)
   used as dividers and accents.
4. **Restrained, purposeful motion** — scroll-reveal + hover choreography, reduced-
   motion-safe, no framework (P3, On).
5. **Composition that breaks the centered-stack grid** — asymmetry, overlap,
   oversized numerals/labels, intentional rhythm.
6. **Cultural motif done with respect, not costume** — marigold + papel-picado
   accents and the emblem used reverently; celebratory/family framing.

---

## Design system

### A. Typography (the signature move)

- **Add one display face** for hero headlines, oversized numerals, and major
  section titles. **Recommended: Big Shoulders Display** (condensed industrial-
  athletic; free; self-hosted via `@fontsource` latin subset; echoes the varsity-
  slab wordmark; less overused than Anton/Bebas). **Alternates to A/B on the live
  preview:** Anton (max poster impact) or Zilla Slab (more heritage/editorial).
  Final pick is a one-token swap — decide on the live preview with Myles.
- **Keep Oswald** for eyebrows/subheads/labels; **keep Inter** for body.
- **Fluid type scale** via `clamp()` — large, confident on desktop; controlled on
  mobile. Define scale tokens (e.g. `--step-display`, `--step-h1`…`--step-body`).
- Performance: self-host, latin subset only, `font-display: swap`, preload the
  display face used above the fold; reserve space to avoid CLS.

### B. Color & surface (within the locked palette)

- Introduce a **warm "paper" surface token** — a warm off-white *within the existing
  `base-200` family* (warm-neutral, never pure white/black) — as an alternating
  section background for heritage warmth. No new brand colors; this is a surface
  neutral, consistent with the locked "warm-neutral" rule.
- Navy/white remain dominant; **red** stays for primary CTAs only; **marigold**
  graduates to the **ornament/accent** role (dividers, rules, numeral underlines) —
  still sparing, per the lock.
- All new pairings re-verified for **AA contrast** (the `check-content.mjs` palette
  discipline + an explicit contrast pass).

### C. Texture & ornament (the motif system — the anti-generic core)

- A small, reusable set of **inline-SVG motif primitives**:
  - **Papel-picado / baseball-stitch section divider** (horizontal rule between
    sections).
  - **Diamond corner-tick / frame** accent for cards and showpieces.
  - **Calavera emblem watermark** — the brand mark, low-opacity, behind key
    sections (used reverently, not repeated as wallpaper).
- Faint **paper-grain** texture (CSS gradient or a tiny tiling SVG) on paper
  sections. All ornament is inline SVG/CSS — **no raster, no extra requests,
  Lighthouse-safe**, and `aria-hidden` / decorative.

### D. Motion & interaction (reduced-motion-safe, no framework)

- **Scroll-reveal** (fade/rise) via a tiny hand-rolled IntersectionObserver
  (~15 lines, no library) — preserves near-zero-JS.
- **Hover choreography** on cards/buttons (lift, accent reveal) via CSS.
- **Subtle hero parallax** (CSS-driven where possible).
- **All motion gated behind `@media (prefers-reduced-motion: no-preference)`**;
  reduced-motion users get instant, static states. No motion blocks content or
  interaction; nothing depends on JS to be usable.

### E. Photography treatment

- A consistent **duotone (navy + marigold) + scrim + framing** treatment so the
  soft/limited source photos read as intentional and on-brand.
- Done at **build time** (Astro `<Image>` / CSS blend), **no runtime cost**, with
  proper `width`/`height` to avoid CLS and responsive `srcset`.
- Graceful: the treatment must still look right if/when higher-res photos arrive
  (it's a CSS/asset layer, not baked into the source files).

### F. Components & architecture (how it's built, kept isolated)

- **Tokens in `src/styles/global.css`**: extend the `@theme` block with the display
  font var, fluid-scale steps, paper surface, and motif/accent vars. daisyUI theme
  tokens unchanged (palette stays locked).
- **New reusable presentation components** (`src/components/ui/` or similar), each
  one clear purpose, testable in isolation:
  - `Ornament.astro` / motif SVGs (divider, diamond tick, watermark).
  - `Reveal.astro` (scroll-reveal wrapper; renders static when reduced-motion).
  - `DuotoneImage.astro` (wraps Astro Image with the treatment).
  - `SectionHeading.astro` (eyebrow + display title + stitch rule).
- **Existing section components are restyled, not restructured** — same data, same
  DOM semantics, same schema/anchors. No content or route changes.
- A tiny shared motion script (single inline module, deferred) — the only JS added;
  must not regress the zero-JS-baseline philosophy materially.

### G. Signature showpieces (the "wow" moments)

1. **Hero** — emblem watermark, oversized display headline (`clamp`), stitch
   divider, duotone coach photo, trust strip styled as folk-art "tickets/pennants."
   Primary CTA (red) + secondary (outline). Replaces the current scrim-photo hero.
2. **The Arsenal / What I Coach showcase** — reimagine the flat icon cards into a
   distinctive, diamond/stitch-framed, numbered, hover-reveal showcase. (These link
   to `/coaching` and `/pitching` — our strongest content; it should look it.)
3. **Packages comparison** — a premium comparison where the **Elite tier reads as a
   clear marigold-accented hero card**, not five equal boxes; ties to `/packages`.

---

## Rollout (gated batches, same PR + bot-review + squash-merge flow)

Each batch is independently shippable, reversible, and passes the full verify chain
before merge. Live deploy only on Clay's explicit OK.

- **Batch 1 — Foundation** (reversible design-system layer): display font + fluid
  scale tokens, warm-paper surface, ornament primitives (`Ornament`/motifs), motion
  utilities (`Reveal` + reduced-motion), `DuotoneImage`, `SectionHeading`. Apply
  lightly site-wide (dividers, headings, surfaces) so the uplift is visible without
  restructuring anything.
- **Batch 2 — Hero + 3 showpieces**: the custom Hero, Arsenal/What-I-Coach
  showcase, and Packages comparison.
- **Batch 3 — Section-by-section polish**: About, Booking, Proof, FAQ, Contact,
  and the subpage templates (`/coaching`, `/pitching`, `/baseball-lessons`,
  `/packages`) brought fully into the system.

## Non-negotiable gates (unchanged from shipped work)

- **Verify chain before every commit:** `npm run check:content` → `npx astro check`
  (0 errors/0 warnings) → `npm run build` → `npm run schema-check` → `npm test`.
- **All 50 existing tests stay green**; structured data, routes, anchors, and the
  `schema-check` invariants are preserved (this is a reskin, not a re-architecture).
- **Palette + pricing locked**; FAQ out of JSON-LD; one `@graph` per page.
- **Lighthouse ~100** maintained — every batch checked for perf/a11y/BP/SEO
  regressions (font CLS, motion a11y, contrast, no new render-blocking requests).
- New colors? **None** beyond a warm-neutral paper surface within the locked family.

## Risks / validations

- **Web-font perf/CLS** — self-host + subset + preload + reserved space; measure LCP
  and CLS after Batch 1. Fallback to system stack if the display face regresses LCP.
- **Motion a11y** — every animation reduced-motion-safe; no essential info conveyed
  by motion alone.
- **Duotone on real photos** — validate the treatment reads well on the actual
  (soft, game-day) source images, not just ideal stock.
- **Cultural sensitivity** — keep the Día de Muertos register celebratory and
  reverent; Myles signs off on tone. Marigold/papel-picado as accent; no skulls as
  wallpaper. (Smithsonian/UNESCO/NMMA framing.)
- **Contrast** — re-verify AA on every new pairing (paper surface, marigold on
  navy/paper, display type sizes).

## Out of scope

- Content/copy changes, new routes, schema/data-model changes, new sections.
- Pricing/tier changes (`packages.json` locked).
- New brand colors or logo changes (brand is locked).
- Online payments, blog/CMS, player portal (still fast-follow / out of scope).
- Brand-asset generation (separate workstream).

## Open items

- ✅ **Display-font pick — RESOLVED 2026-06-17: Big Shoulders Display.** Myles A/B'd
  it vs Anton & Zilla Slab on a live preview and chose Big Shoulders with no close
  second. It was already the live default, so no swap was needed.
- **Photo sourcing** — higher-res 1-on-1 training shots + a headshot would let the
  duotone treatment shine; launch-able with the current set.
- **Myles tone sign-off** on the folk-art register once Batch 1/2 is on a preview.

## Next step

On approval of this spec, transition to the **writing-plans** skill to produce the
Batch 1 implementation plan (foundation layer), then build → verify → PR → review →
merge on Clay's OK.
