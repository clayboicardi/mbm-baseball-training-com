# MBM Baseball Training — Market Research Workstream Handoff

> **How to use:** open a fresh Claude Code session with working directory
> `C:\Users\chawo\Projects\mbm-baseball-training-com` and paste this whole file.

You own the MARKET RESEARCH workstream for MBM Baseball Training. Goal: research
the Long Beach–area youth private baseball-training market and return concrete,
**cited** recommendations to validate/refine MBM's training packages, pricing,
and positioning. Your output feeds `src/data/packages.json` in the website build
(a parallel CC session is building the site).

## Step 0 — read first

1. `mem_search` engram, project `mbm-baseball-training-com` → project profile +
   locked decisions (business details, current draft packages).
2. `docs/superpowers/specs/2026-06-01-mbm-website-design.md` → the Packages
   section + the open pricing flags.

## Method (important)

- Run this as a **multi-provider research pass: `/multi:research`** — per Clay's
  decision matrix, market / current-facts research warrants fan-out for depth +
  cross-check. Fallback: a thorough solo web pass (WebSearch / firecrawl / brave).
- **REQUIRE CITATIONS.** Every competitor + price needs a source URL and an
  as-of date. Local prices vary and change — do NOT fabricate names or numbers;
  flag anything unverifiable as "unverified."
- **Separate independent-coach pricing from academy/facility pricing** — they
  differ a lot, and MBM is an independent coach.

## Project context

- Business: MBM Baseball Training — private 1-on-1 instruction, ages 8–18,
  Long Beach CA. Coach Myles Berniard-Mendez (former semi-pro, 20+ yrs).
- Current DRAFT packages (validate/refine — restructuring is on the table):
  - **Free First Lesson** — 30 min (skill eval + training-plan preview + Q&A)
  - **30-Minute Session** — $45 (+$100 video analysis)
  - **60-Minute Session** — $65 (+$100 video analysis)
  - **Elite Package** — $1,500 / full season = 30×60-min, priority scheduling,
    video analysis included, custom program, game film review
- Open questions to answer with data:
  1. Is **+$100 for video analysis** on a $45/$65 session in line with the
     market, or mispriced? What do local coaches charge for video/film analysis?
  2. Is the **Elite package** (~$50/session effective vs $65 one-off) priced
     right for a season commitment? What do local season/package deals look like?
  3. Are the base **30/60-min rates ($45/$65)** competitive for an independent
     coach in this area?

## Research questions

1. **Competitors:** independent private baseball instructors + training
   academies/facilities serving Long Beach + adjacent (Lakewood, Signal Hill,
   Seal Beach, Cerritos, Cypress, Los Alamitos, Bellflower, Huntington Beach edge).
2. **Pricing:** 30-min, 60-min private lessons; packages/bundles; evaluations;
   cage rental; group vs 1-on-1. Capture ranges + medians.
3. **Structure norms:** per-session vs package vs membership; is a free first
   lesson/eval common; deposit / cancellation norms.
4. **Video/film analysis:** who offers it, how it's priced or bundled.
5. **Positioning/differentiation:** what competitors emphasize (credentials,
   college commits/results, facilities, specializations, age focus). Where are
   the gaps MBM can own?
6. **Parent decision factors:** what drives choice (reviews/reputation,
   scheduling convenience, location, safety/credentials, results) — pull from
   reviews where available.
7. **Discovery channels:** how local coaches get clients (Google/GBP, Instagram,
   leagues, word of mouth). Note competitors' GBP/IG presence.

## Deliverable

Write findings to: `docs/research/market-research-longbeach-2026-06-01.md`

- **Exec summary** (5–8 bullets): headline pricing benchmarks + the verdict on
  the 3 open questions.
- **Competitor table:** name | type (indie / academy) | services | prices |
  location | source URL | as-of date.
- **Pricing benchmark ranges:** 30-min, 60-min, packages, video analysis.
- **Positioning gaps + differentiation** recommendations for MBM.
- **Parent decision factors.**
- **CONCRETE recommendation:** a proposed revised package/pricing structure for
  MBM (with rationale), formatted so it can drop into `src/data/packages.json`.
  Call out exactly what to change vs the current draft (especially the +$100
  video line).
- **Confidence/limitations note** (what's verified vs estimated).

## Handback

Tell Clay the findings doc path + a 3-line summary. The website session folds the
recommended structure into `packages.json`.
