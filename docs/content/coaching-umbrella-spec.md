# "How Coach Myles Builds an Athlete" — Coaching Umbrella (Phase 1) — Design Spec

**Status:** Design approved by Clay 2026-06-25. Awaiting spec review → implementation plan.
**Scope:** **Phase 1 only** — the umbrella structure. Deep per-pillar content is Phase 2+ (see §10).
**Relationship:** Reframes the existing `/coaching/` + `/pitching/` skill content under one umbrella. Sibling to the just-shipped age `/programs/` workstream (a *different* axis — age vs. skill).

---

## 1. Goal

Replace the homepage's two separate skill sections ("Services" → `/coaching/`, and "Pitching" → the Arsenal) with **one umbrella**: *"How Coach Myles Builds an Athlete."* Pitching stops being a top-level category and becomes one pillar among several. Each pillar will (in Phase 2) get Arsenal-style deep content; Phase 1 stands up the umbrella + every pillar hub, **keeping every existing URL** so no SEO equity is lost.

## 2. Locked decisions (Clay, 2026-06-25)

1. **Sequencing:** structure first, content phased. Phase 1 = umbrella + pillar hubs, shipping with current content; deep sub-pages come later, per pillar, as Myles supplies teaching.
2. **Information architecture:** **rebrand `/coaching/` into the umbrella** (Approach A). Keep all `/coaching/*` and `/pitching/*` URLs; new pillars become new `/coaching/` pages; the Pitching pillar links out to `/pitching/`. **Zero redirects.**
3. **Nav label:** **"Coaching"** (→ `/coaching/`), replacing the current "Services" and "Pitching" nav entries.

## 3. The pillar set

The umbrella presents one grid of pillars. Proposed set + mapping (every existing URL preserved):

| # | Pillar (display) | Page | Status |
|---|---|---|---|
| 1 | Hitting | `/coaching/hitting` | exists ✓ |
| 2 | Pitching | → `/pitching/` (the Arsenal) | exists ✓ — card links out |
| 3 | Infield | `/coaching/infield` | 🆕 new |
| 4 | Outfield | `/coaching/outfield` | 🆕 new |
| 5 | Catching | `/coaching/catching` | 🆕 new |
| 6 | Throwing & Arm | `/coaching/throwing-mechanics` | exists ✓ — display rename only |
| 7 | Baserunning & Speed | `/coaching/baserunning` | 🆕 new |
| 8 | Mental Game & Baseball IQ | `/coaching/baseball-iq` | exists ✓ — display rename only |

**Display renames are presentation-only** — the underlying slugs/URLs (`throwing-mechanics`, `baseball-iq`) do **not** change.

**Two existing pages kept alive (no orphaned/de-indexed URLs):**
- `/coaching/fielding` — repurposed as a "Fielding fundamentals" overview, **linked from the Infield and Outfield pages**. Stays indexed; steps out of the headline grid (Infield/Outfield supersede it there).
- `/coaching/player-development` — its "develop the whole athlete" content becomes the **umbrella hub's philosophy intro** (the literal "how he builds an athlete" narrative). The page stays live, linked as the development approach.

> The pillar list and names are a baseball recommendation. Myles confirms/adjusts; his tweaks are treated as edits to this spec, not a re-design.

## 4. Information architecture

- **Umbrella hub:** `/coaching/` (URL unchanged). H1 + nav label decouple from the path — the page is titled *"How Coach Myles Builds an Athlete"* while the URL stays `/coaching/`.
- **Pillar pages:** 7 live under `/coaching/<slug>/` (the existing collection); **Pitching** is the one pillar whose deep-dive is the separate `/pitching/` section (the card links there).
- **Single source of truth for the grid:** one ordered pillar definition drives **both** the homepage umbrella section and the `/coaching/` hub. Each pillar entry resolves to its destination URL (a `/coaching/<slug>` page, or `/pitching/` for Pitching). This removes today's dual-source split between `services.json` (homepage cards) and the `coaching` collection (the pages). Implementation mechanism is a plan decision; the **requirement** is one ordered list, no drift.
- **No redirects.** Nothing moves; URLs are preserved.

## 5. The four structural changes

1. **Umbrella hub** — rebrand `/coaching/index.astro`: title *"How Coach Myles Builds an Athlete"*, a philosophy intro (sourced from the player-development content), and the 8-pillar grid.
2. **Homepage merge** — remove the separate **Services** (`#services`) and **Pitching** (`#pitching`) sections; add **one** umbrella section (an 8-pillar grid in the established card style, e.g. the `/programs/` band-picker pattern) titled *"How Coach Myles Builds an Athlete"*, with a CTA to `/coaching/`. The **Programs** (age) band-picker stays as its own separate section.
3. **Nav** — replace the "Services" and "Pitching" entries in `site.json` with a single **"Coaching"** → `/coaching/`. Net nav shrinks by one item.
4. **Four new pillar pages** — `/coaching/{infield,outfield,catching,baserunning}` on the existing `coaching` collection + schema (lead + 2+ body + 3+ focus + 2+ FAQ honesty gate). Content drafted honestly from general coaching + Myles's approach, then **his sign-off** (same gate as the programs pages and the pitch posts).

## 6. Content preservation (nothing lost in the merge)

The homepage `Pitching` section currently carries three things that must survive:
- **The pitching intro** ("How Coach Myles Builds a Pitcher" + the mental-game-first philosophy, from `pitching.json.intro`),
- **The Arsenal** (the 5 pitch cards), and
- **The Method** (the 4-step method blocks).

These **relocate to the `/pitching/` hub** (the Pitching pillar's deep-dive) so removing the homepage section loses nothing. The implementation plan must verify the `/pitching/` hub presents the intro + Arsenal + Method (moving them from `Pitching.astro` if the hub doesn't already carry them).

**Reference audit:** the plan must grep for and update any `/#services` and `/#pitching` anchor references (nav, hero CTAs, in-page links) before those homepage anchors are removed, so no link breaks. `check-content.mjs` validates `site.json` nav anchors, but in-page hrefs elsewhere are not auto-checked.

## 7. New-pillar content sourcing & gates

- Phase 1's 4 new pillar pages need **honest intro content** — a short, real description of what Coach Myles works on at each (Infield, Outfield, Catching, Baserunning) — at the depth of the *existing* `/coaching/` pages, not full deep content.
- **From Myles:** a few honest sentences per new pillar; CC drafts from his known approach, Myles signs off before publish.
- **Gates (non-negotiable):** Myles sign-off before publish; no fabricated specifics; the new pages must clear the schema honesty gate.

## 8. SEO & safety

- **Zero redirects** — every existing URL is preserved.
- `public/_headers` already covers `/coaching/*` with `no-transform`; the 4 new pages inherit it. No `_headers` change.
- `schema-check.mjs` already expects `Service + WebPage + BreadcrumbList` for `/coaching/<slug>/` and `CollectionPage + BreadcrumbList` for `/coaching/` — the new pages and the rebranded hub satisfy this with **no gate change**.
- Astro sitemap auto-includes the 4 new routes; IndexNow-ping them on deploy (4 new URLs).

## 9. Testing

- **New pillar pages:** extend the built-output tests (mirror `programs.test.mjs` / `coaching.test.mjs`): each new `/coaching/<slug>/` builds, carries `Service + WebPage + BreadcrumbList`, and has an accessible breadcrumb.
- **Umbrella grid:** update the homepage-link assertion so it asserts **every pillar** resolves (the homepage links each pillar to its page, including the new ones and the Pitching → `/pitching/` link). Replaces the current `services.json`-driven check.
- **Existing tests that the merge breaks (must be updated, not just added to):** `coaching.test.mjs` currently asserts the homepage links each `services.json` card *and* each Arsenal card. After the merge, neither the "What I Coach" cards nor the Arsenal live on the homepage — both assertions move to reflect the new umbrella grid (pillars) on the homepage and the Arsenal on the `/pitching/` hub.
- **No regressions:** `check:content`, `schema-check`, and the full `npm test` suite stay green.

## 10. Phase 1 vs Phase 2

- **Phase 1 (this spec):** umbrella hub rebrand + homepage merge + nav + 4 new pillar pages + content relocation + tests. Ships with current content; SEO-safe.
- **Phase 2+ (separate spec/plan, per pillar):** each pillar's Arsenal-style **deep sub-pages**, built from Myles's actual teaching, one pillar at a time. The Arsenal (`/pitching/`) is the template — and a reminder that deep content is Myles-gated (its per-pitch pages are still `draft: true`).

## 11. Effort

Medium. The hub + homepage + nav are edits to existing components following established patterns; the 4 new pillar pages are clones of the proven coaching page shape. The main gated item is Myles's intro content + sign-off for the 4 new pillars.

## 12. Success metrics

- One consolidated umbrella live; the separate Services + Pitching homepage sections gone; nav reduced to a single "Coaching" entry.
- 8 pillars discoverable from homepage + `/coaching/` hub; all existing URLs still 200 (no orphans); 4 new `/coaching/*` pages indexed.
- Pitching intro + Arsenal + Method intact on `/pitching/`.
