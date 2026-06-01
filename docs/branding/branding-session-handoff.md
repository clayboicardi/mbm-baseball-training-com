# MBM Baseball Training — Branding Asset Workstream Handoff

> **How to use:** open a fresh Claude Code session with working directory
> `C:\Users\chawo\Projects\mbm-baseball-training-com` and paste this whole file.
> The one fenced block (AI Studio system instruction) is what you paste into AI
> Studio's "System instructions" field later — after the intake step.

---

You're a fresh CC session owning the BRANDING/LOGO workstream for MBM Baseball
Training. A second CC session is building the website in parallel and will
consume the assets you produce. Your job: guide Clay through generating the MBM
logo + brand kit, then process and hand back deploy-ready assets.

Working directory: `C:\Users\chawo\Projects\mbm-baseball-training-com`

## PLATFORM (changed since last time — read this)

Generation happens in Google AI Studio (aistudio.google.com), model
**"Gemini 3 Pro Image" (Nano Banana Pro)** — NOT the consumer Gemini chat app.
AI Studio gives system instructions + temperature / Top-P / thinking / aspect-
ratio / resolution / grounding control. This means: encode the brand constraints
ONCE as system instructions (below), then each prompt only describes the
composition. The old "repeat every NO-painterly constraint in every prompt" style
is retired.

## Step 0 — READ BEFORE DOING ANYTHING (don't skip)

1. `~/agent/IMAGE-GEN-WORKFLOW.md` — Path E workflow. NOTE: the platform/settings
   axis is superseded by AI Studio (above); the PRINCIPLES still hold (pass
   sequence, watermark discipline, flat-vector isolation, reference-set lesson).
2. `~/agent/research/clayworks-brand-intake-2026-05-19.md` — intake-doc template
   + the "anchoring error" reference-set lesson (read that section carefully).
3. `~/agent/research/clayworks-surface-prompts-2026-05-19.md` — prompt style; now
   migrate its repeated-constraint blocks INTO system instructions.
4. `~/agent/research/handoff-remove-gemini-watermarks-2026-05-19.md` — watermark
   removal. BUT first verify AI Studio output even has the visible ✦ (it was
   often consumer-app-only). Invisible SynthID is always there and is fine.
5. `mem_search` engram, project `mbm-baseball-training-com` → project profile +
   locked decisions. Also `mem_search "branding/aistudio-image-workflow"`
   (personal scope) for the AI Studio settings cheatsheet, and `brand-design`
   lessons.
6. Reusable scripts (adapt for `mbm-` naming): `~/agent/scripts/strip-gemini-
   watermarks.py`, `clayworks-asset-pipeline.py`, `verify-watermark-strip.py`.

## Project context

- **Business:** MBM Baseball Training — Long Beach, CA. Owner/coach **Myles
  Berniard-Mendez** (MBM = his initials). Private 1-on-1 instruction, ages 8–18.
- **Audience:** kids (8–18) + their parents. Feel: energetic, confident,
  trustworthy; "stand out to kids and parents."
- **Tagline:** "Train with purpose. Play with confidence. Compete with passion."
- **Palette (LOCKED — INPUT to the logo, not derived from it):**
  Primary Dodger Blue `#005A9C`, White `#FFFFFF`, Accent Red `#EF3E42`.
- **Logo concept (Myles's words):** "two baseball bats in an X form with a
  baseball on top and the number 11 inside the baseball. Add graphics, flares,
  colors to make it appealing and stand out to kids and parents." The **11** is
  his number — fixed element.

## ⚠️ Two ways this differs from Clayworks

1. **SPORTS EMBLEM, not a minimalist mark.** Allow clean, controlled depth suited
   to a sports badge — but keep it 3-brand-color reproducible, vectorizable, and
   reducible to a simple icon.
2. **Design a SYSTEM:** (a) primary emblem (full detail), (b) simplified icon that
   reads at 16–32px (likely ball+11 or tight monogram), (c) wordmark, (d) lockups
   (horizontal, stacked, emblem-alone, wordmark-alone).

## ⚠️ Reference-set lesson (most important)

Do NOT fabricate "brands/logos Myles likes" from training data — that was the
documented Clayworks anchoring error. **ASK Myles (via Clay) for 2–3 real logos
or sports brands he actually likes BEFORE drafting prompts.** (You may use AI
Studio image-search grounding to gather real references in the intake phase only.)

## STARTER system instruction for AI Studio

Refine this after the intake, then give it to Clay to paste into the AI Studio
**"System instructions"** field:

```
You generate brand logo/identity assets for "MBM Baseball Training," a youth
private baseball-training business (coach Myles Berniard-Mendez, Long Beach CA;
audience = players ages 8–18 and their parents).

HARD CONSTRAINTS (always):
- Brand palette ONLY: Dodger Blue #005A9C, White #FFFFFF, Red accent #EF3E42.
  Exact hues; no off-brand colors unless explicitly asked.
- Style: clean modern sports-emblem / vector badge with controlled depth, crisp
  edges. NOT painterly, watercolor, photoreal, or 3D-rendered; no gradients,
  glow, or drop-shadow unless I explicitly request a specific effect.
- Every emblem must be reproducible in the 3 brand colors and reduce cleanly to a
  simple icon legible at 16–32px. Keep detail hierarchical, not noisy.
- The number "11" is a fixed, required element when present.
- Do NOT copy, trace, or closely derive from any real or trademarked team/MLB
  logo. Original work only.
- No spelling errors. No stray watermarks, signatures, or captions inside the
  artwork (only cell labels when I ask for a grid).
- Use the background color I specify per prompt.

OUTPUT DISCIPLINE:
- For a grid: evenly-spaced labeled cells, identical treatment except the one
  variable I name.
- When I upload locked reference assets, reproduce them EXACTLY (form,
  proportion, color); change only what I specify.
```

## AI Studio settings per pass (starting points — tune live)

| Pass | Temp | Thinking | Aspect | Resolution | Grounding |
|------|------|----------|--------|-----------|-----------|
| Reference gathering | n/a | n/a | n/a | n/a | Image search ON |
| 1 — Emblem concepts (divergent) | 0.9–1.2 | High | 1:1 | max (2K+) | OFF |
| 2 — Wordmark | 0.7–1.0 | Med | ~3:1 | max | OFF |
| 3 — Emblem refine + favicon icon | 0.3–0.5 | High | 1:1 | max | OFF |
| 4 — Lockups | 0.3–0.5 | Med | per lockup | max | OFF |
| 5 — Surface applications | 0.3–0.5 | Med | per surface | max | OFF |

## Deliverables (the website needs these)

- Favicon set (`.ico` + 16/32/48, apple-touch, android-chrome 192/512) from the icon
- Nav logo (horizontal lockup), hero emblem, OG image (1200×630)
- Myles's Instagram profile pic (square, from the emblem)
- An **MBM brand-intake doc** (mirror Clayworks) + a short **"brand locked"
  summary** (final hexes, type choice, emblem/icon file paths) so the website
  session can theme to it.

## Sequence

0. Read docs + project memory → collect Myles's REAL references → draft the MBM
   brand-intake doc + the refined AI Studio system instruction → get Clay's OK.
   **Do NOT generate until intake + system instruction are agreed.**
1–5. Run the passes above; Clay generates in AI Studio, downloads keepers to
   `~/agent/inbox/images/` as `mbm-<purpose>-<variant>.png` (no spaces). You
   ingest, strip ✦ if present, vectorize/crop, run the adapted asset pipeline, and
   drop deploy-ready files into the repo (default `assets-incoming/brand/`;
   favicons → `public/`).

## First move

Read the sources + project memory, then report back to Clay: (1) confirm you've
got the workflow, (2) ask Myles for real reference logos + 3–4 visual-direction
questions, (3) draft the brand-intake doc and the refined AI Studio system
instruction. Then go pass-by-pass.
