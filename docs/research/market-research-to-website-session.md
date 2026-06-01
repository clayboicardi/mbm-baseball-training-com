# → Website Build Session: market-research results are in

> **How to use:** paste this whole file into the CC session building the MBM site
> (working dir `C:\Users\chawo\Projects\mbm-baseball-training-com`).

The market-research workstream is **done**. Its output is what you needed for the
**Packages** section (#5 in the design spec) and the `priceRange` in the JSON-LD
schema. Read the findings, then build `src/data/packages.json` from the
ready-made block below.

## Read first

1. `docs/research/market-research-longbeach-2026-06-01.md` — full findings. Jump to
   **"CONCRETE recommendation"** (the change table + the `packages.json`-ready JSON)
   and **"Verdicts on the three open pricing questions."** Skim the rest for the
   `priceRange`/positioning copy.
2. The design spec you're already working from:
   `docs/superpowers/specs/2026-06-01-mbm-website-design.md` → §"Site structure" row 5
   (Packages) and the `packages.json` data-model bullet.

## Bottom line — what changed vs. the draft packages

The draft had 4 tiers (Free / 30-min $45 +$100 video / 60-min $65 +$100 video /
Elite $1,500). Research says:

- **Kill the +$100 video add-on.** It's ~2× the market ($40–50 add-on; ~$199 standalone)
  and costs more than the lesson itself. → **$40 "Swing/Mechanics Video Breakdown" add-on**,
  and include a quick slow-mo clip in the 60-min. *(This is the design spec's flagged
  open item — now resolved.)*
- **30-min $45 stays** (competitive). **60-min → $75** recommended (it was underpriced
  at only $20 over the 30-min; facilities run $90–135) — but see flagged decision below.
- **Add a 10-session package (~$585)** as a mid-tier on-ramp (10-packs are the local norm).
- **Elite $1,500/season stays** (undercuts the local premium academy, d'Arnaud, at $1,999/yr) —
  **add a payment-plan / monthly option** to lower the lump-sum barrier.
- **Keep the free first lesson** (market-standard conversion hook).

## Build it — drop-in `packages.json`

Use the JSON `tiers` block from the findings doc's **"Drop-in JSON"** section verbatim
to create `src/data/packages.json` (schema matches the design spec:
`name, price, duration, features[], addOns[], featured, cta`, plus an `addOnsCatalog`
and `currency`). It's structured so the flagged decisions below are **one-line edits** —
do not block on them. Featured tier = `elite-season`. CTA targets: standard tiers →
`#book` (Cal.com), Elite → `#elite-inquiry` (Tally).

For the `BaseLayout.astro` JSON-LD `priceRange`, use **`"$45–$1,500"`** (or `"$$"`).

## 4 decisions gated on Myles — wire them visibly, don't silently guess

These are commented/flagged inside the JSON. Build with the recommended defaults but
keep them obvious so Clay/Myles can flip them in one edit:

1. **60-min price: $75 (recommended) vs hold $65 (value play).** JSON defaults to $75 with a `priceFlag`.
2. **$36 ↔ $45 reconcile** — Myles is *publicly listed at $36/lesson on TeachMe.To* but the
   site says $45. Don't let the live site contradict his TeachMe.To listing. (Pricing decision, not a build blocker — note it for Clay.)
3. **Elite payment terms** — lump sum vs. monthly (e.g. 3×$525, ~$275/mo). Copy includes "or ask about monthly."
4. **Video tech honesty** — is it coach's-eye slow-mo or sensor/data-backed (Blast/Rapsodo)?
   If no sensor tech, the add-on copy must say "slow-motion video + coach feedback," **not**
   "analytics," to stay credible vs. tech-equipped academies. $40 assumes coach's-eye.

## Confidence note (so you don't hardcode soft numbers as firm)

- **Independent-coach rates = high confidence** (pulled live from TeachMe.To/CoachUp/Athletes Untapped).
- **Facility 60-min / season prices = medium** — most are gated behind "call for pricing," so the
  doc's facility figures lean on CA comparables + per-session math. Don't present any competitor's
  price as a quote on the site.
- Don't surface competitor names/prices on the public site — this research is for *our* pricing
  decisions, not site copy.

## Handback

When packages.json is wired, the only pricing items left are Myles's 4 confirmations above —
surface them to Clay rather than guessing. Positioning lane to echo in hero/about copy:
**experienced + truly 1-on-1 + whole-player/mental game, without academy prices.**
