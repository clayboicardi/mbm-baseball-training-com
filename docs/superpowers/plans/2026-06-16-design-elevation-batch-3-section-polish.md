# Design Elevation — Batch 3 (Section-by-Section Polish) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring every remaining surface — the rest of the homepage sections AND all subpage templates — fully into the Heritage Athletic design system, so the *entire* site (not just the homepage showpieces) reads as one cohesive, distinctive brand. Pure presentation: no content, routes, structured data, anchors, or pricing change.

**Architecture:** Reuse the existing design system (`.font-display`, `.fluid-display/lg/md`, `bg-paper`, `text/border/ring-marigold`, `Ornament`, `SectionHeading`, `Reveal`, `DuotoneImage`). Restyle existing sections/templates in place — same data, same DOM semantics, same schema/anchors/h1s. Extract ONE small shared component (`Breadcrumb`) to kill 8× duplication. Establish a coherent **alternating surface rhythm** (`bg-base-100` ↔ `bg-paper`) site-wide.

**Tech Stack:** Astro 6 (static), Tailwind v4 + daisyUI v5 (`mbm` theme), `astro:assets`, `node --test` over built HTML.

---

## Spec reference

Implements **Batch 3** (§ Rollout) of `docs/superpowers/specs/2026-06-16-mbm-design-elevation-design.md`: "Section-by-section polish — About, Booking, Proof, FAQ, Contact, and the subpage templates (`/coaching`, `/pitching`, `/baseball-lessons`, `/packages`) brought fully into the system." Batches 1 (foundation) and 2 (hero + 3 showpieces) are live.

## How this batch is executed (important)

Like Batch 2, **this is visual**. Each task ships a **concrete, correct, accessible, gated** first version, then we **preview-refine interactively with Clay** before merge. Tests assert *structure, accessibility, schema, and perf-safety* — never pixel aesthetics. The markup here is a strong starting point, not a frozen spec.

Because Batch 3 touches ~16 surfaces, it is organized around a **shared treatment recipe** (below) applied consistently, plus per-surface specifics. Build in the task order; run the verify chain green at each commit; one consolidated preview-refine pass at the end before the PR.

## Locked constraints (hold at every commit)

- Verify chain green: `npm run check:content` → `npx astro check` (0 errors) → `npm run build` → `npm run schema-check` (**29 pages**) → `npm test`.
- **Structured data / routes / anchors / h1 semantics unchanged.** Subpage hero `<h1>` stays an `<h1>` (SEO) — it gets the display *treatment*, NOT a `SectionHeading` (which emits `<h2>`). In-page `<h2>`s convert to `SectionHeading`.
- **Palette locked** — no new brand colors. Marigold = ornament/accent only (eyebrows, stitch rules, diamond ticks, hover borders). No raw hex in components.
- `packages.json` pricing/tiers untouched (read-only). FAQ stays visible but OUT of JSON-LD (no `FAQPage`).
- Near-zero-JS; Lighthouse ~100; mobile-first; `prefers-reduced-motion` honored (reuse `Reveal`). Watch AA contrast on every new pairing (esp. white-on-neutral hero text, marigold-on-paper, paper surfaces).

---

## Shared treatment recipe (apply consistently)

**R1 — Surface rhythm (alternate `bg-base-100` ↔ `bg-paper`):**
Replace ad-hoc `bg-base-200/50` with `bg-paper` (warm). Heroes stay `bg-neutral` (dark); the Contact band stays `bg-primary`; Footer stays `bg-neutral`. Target homepage order:
`Hero(neutral) → About(base-100) → Services(paper✓) → Pitching(base-100✓) → Quotes(paper) → Packages(base-100✓) → Booking(paper) → Proof(base-100) → FAQ(paper) → Contact(primary) → Footer(neutral)`.
Subpage content sections alternate `base-100`/`paper` after the `bg-neutral` hero.

**R2 — Light-surface section headings → `SectionHeading`:**
Any bare in-page `<h2 class="text-3xl font-heading font-bold text-primary uppercase ...">Title</h2>` on a light surface becomes:
```astro
<SectionHeading eyebrow="<short kicker>" title="<Title>" />
```
(Where the original was centered, `SectionHeading` defaults to center; where it was left-aligned, pass `align="left"`.) Import: `import SectionHeading from "<rel>/components/ui/SectionHeading.astro";`

**R3 — Dark-hero heading treatment (subpage heroes + Contact band):**
The hero `<h1>` (or the Contact `<h2>`) stays its own tag but gets the display treatment on the dark surface:
```astro
<p class="font-heading text-sm uppercase tracking-[0.25em] text-marigold">{eyebrow}</p>
<h1 class="font-display fluid-lg uppercase text-white mt-2">{title}</h1>
<div class="mt-4 w-28"><Ornament variant="stitch" /></div>
```
(`fluid-lg` for subpage heroes; the homepage Hero already uses `fluid-display`. Keep existing breadcrumb + lead + CTAs.)

**R4 — Elevated cards (framed, hover-reveal, diamond tick):**
Hub/list cards adopt the Batch 2 showcase frame:
```astro
class="group relative block overflow-hidden rounded-box border border-base-300 bg-base-100 p-6 transition-all hover:-translate-y-1 hover:border-marigold/60 hover:shadow-lg"
```
with a decorative diamond tick top-right (`<span aria-hidden="true" class="absolute right-4 top-4 text-marigold"><Ornament variant="diamond" class="w-3.5 h-3.5" /></span>`) and the existing icon/title/lead/→ hint. Add `index` numbering (`01..0N`) only where it reads well (skill/pitch lists), matching the homepage showcase.

**R5 — Reveal wrapping:**
Wrap each major card grid / section body in `<Reveal>…</Reveal>` (triple-safe; no-op under reduced-motion / JS-off). Import: `import Reveal from "<rel>/components/ui/Reveal.astro";`

**R6 — Reduced surfaces for sub-sections:** Inside detail templates, the inner blocks (`What we work on`, `Who it's for`, FAQ, related) follow R1 alternation with `SectionHeading` titles and `Reveal` bodies; FAQ accordions keep `<details class="collapse collapse-arrow">` but sit on the alternated surface.

---

## File structure

| File | Create/Modify | Responsibility |
|---|---|---|
| `src/components/ui/Breadcrumb.astro` | **Create** | Shared accessible breadcrumb (replaces 8× inline copies); same DOM output |
| `src/components/About.astro` | Modify | SectionHeading; responsive `widths`/`sizes` on the DuotoneImage (perf) |
| `src/components/Quotes.astro` | Modify | SectionHeading; `bg-paper`; card framing |
| `src/components/Booking.astro` | Modify | SectionHeading; `bg-paper` |
| `src/components/Proof.astro` | Modify | SectionHeading; surface; (gallery stays natural Image) |
| `src/components/Faq.astro` | Modify | SectionHeading; `bg-paper` (stays out of JSON-LD) |
| `src/components/Contact.astro` | Modify | Dark-band display heading + marigold eyebrow + stitch (R3) |
| `src/components/Footer.astro` | Modify | Stitch divider at top; light type polish (no structural change) |
| `src/components/Nav.astro` | Modify | Minimal: consistency only (no behavior change) |
| `src/pages/coaching/index.astro` | Modify | Breadcrumb + R3 hero + R1 + R4 cards + Reveal |
| `src/pages/pitching/index.astro` | Modify | same hub recipe |
| `src/pages/packages/index.astro` | Modify | same hub recipe (cards keep pricing) |
| `src/pages/baseball-lessons/index.astro` | Modify | same hub recipe |
| `src/pages/coaching/[slug].astro` | Modify | Breadcrumb + R3 hero + SectionHeading on the 3 h2s + R1 + Reveal |
| `src/pages/packages/[slug].astro` | Modify | same detail recipe (pricing untouched) |
| `src/pages/baseball-lessons/[city].astro` | Modify | same detail recipe (conditional sections) |
| `src/pages/pitching/[slug].astro` | Modify | prose-only: eyebrow + display h1 treatment + stitch + Reveal (no full hero) |
| `tests/design-batch3.test.mjs` | **Create** | Structure/a11y/schema-safety guards across home + a hub + a detail page |

> Hubs (`coaching/pitching/packages/baseball-lessons` index) share one recipe; detail pages (`coaching/[slug]`, `packages/[slug]`, `baseball-lessons/[city]`) share another; `pitching/[slug]` is the prose-only exception.

---

## Task 1: Shared `Breadcrumb` component

**Files:** Create `src/components/ui/Breadcrumb.astro`.

The 8 subpage templates each hand-roll `<nav aria-label="Breadcrumb">…</nav>`. Extract one component (identical DOM) so the polish is consistent and DRY.

- [ ] **Step 1: Create the component**

```astro
---
// Accessible breadcrumb trail. Items are ordered; the LAST item is the current
// page (rendered as text with aria-current, not a link). Same DOM/semantics as
// the inline copies it replaces.
interface Crumb { label: string; href?: string; }
interface Props { items: Crumb[]; class?: string; }
const { items, class: className } = Astro.props;
---
<nav aria-label="Breadcrumb" class:list={["text-sm", className]}>
  <ol class="flex flex-wrap items-center gap-1 text-base-content/60">
    {items.map((c, i) => (
      <li class="flex items-center gap-1">
        {c.href && i < items.length - 1 ? (
          <a href={c.href} class="link link-hover">{c.label}</a>
        ) : (
          <span aria-current="page" class="text-base-content/80">{c.label}</span>
        )}
        {i < items.length - 1 && <span aria-hidden="true" class="px-1">/</span>}
      </li>
    ))}
  </ol>
</nav>
```

- [ ] **Step 2: Verify it compiles**

Run: `npx astro check` — 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Breadcrumb.astro
git commit -m "feat(design): shared accessible Breadcrumb component"
```

> NOTE: wiring `Breadcrumb` into the templates happens in Tasks 4–6 (when each template is touched). On a **dark** hero surface, pass a tone class so the muted greys read on navy — e.g. `class="text-white/60"` and override link colors as needed; confirm AA in preview.

---

## Task 2: Homepage section headings + surface rhythm (About, Quotes, Booking, Proof, FAQ)

**Files:** Modify `About.astro`, `Quotes.astro`, `Booking.astro`, `Proof.astro`, `Faq.astro`. Create `tests/design-batch3.test.mjs` (first homepage assertions).

Apply **R2** (bare `<h2>` → `SectionHeading`) and **R1** (surface rhythm) to each. Suggested eyebrows (tune in preview):

| Section | File | Current bare `<h2>` | → SectionHeading | Surface change |
|---|---|---|---|---|
| About | `About.astro` | "Meet Coach Myles" | eyebrow `"About the Coach"`, title `"Meet Coach Myles"`, `align="left"` | stays `bg-base-100` |
| Quotes | `Quotes.astro` | "In His Own Words" | eyebrow `"Coaching Philosophy"`, title `"In His Own Words"` | `bg-base-200/50` → `bg-paper` |
| Booking | `Booking.astro` | "Book a Session" | eyebrow `"Get on the Schedule"`, title `"Book a Session"` | `bg-base-200/50` → `bg-paper` |
| Proof | `Proof.astro` | "On the Field" | eyebrow `"From the Dugout"`, title `"On the Field"` | stays `bg-base-100` |
| FAQ | `Faq.astro` | "Frequently Asked Questions" | eyebrow `"Before You Start"`, title `"Frequently Asked Questions"` | `bg-base-100` → `bg-paper` |

- [ ] **Step 1: Write failing tests** — create `tests/design-batch3.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => {
  const f = join(root, "dist", p);
  if (!existsSync(f)) throw new Error(`${p} missing — run \`npm run build\``);
  return readFileSync(f, "utf8");
};
const home = () => read("index.html");

// SectionHeading renders an eyebrow with the brand-red-dark eyebrow class + a stitch <svg>.
test("homepage remaining sections use SectionHeading eyebrows", () => {
  const h = home();
  for (const eyebrow of ["Coaching Philosophy", "Get on the Schedule", "Before You Start"]) {
    assert.ok(h.includes(eyebrow), `missing eyebrow: ${eyebrow}`);
  }
});

test("warm paper surface rhythm is applied (no leftover bg-base-200/50 on home)", () => {
  assert.ok(!home().includes("bg-base-200/50"), "bg-base-200/50 should be replaced by bg-paper");
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm run build && node --test tests/design-batch3.test.mjs` — FAIL (eyebrows absent; `bg-base-200/50` still present).

- [ ] **Step 3: Apply R2 + R1 to each of the 5 components** per the table. Example (Quotes.astro): add `import SectionHeading from "./ui/SectionHeading.astro";`, change the section to `bg-paper`, replace the `<h2>`+`<p>` with `<SectionHeading eyebrow="Coaching Philosophy" title="In His Own Words" />` + keep the subhead `<p class="text-center mt-4 ...">`. Optionally frame the figure cards with `border border-base-300` for consistency. Repeat for the other four.

- [ ] **Step 4: Run tests + verify chain**

Run: `npm run build && node --test tests/design-batch3.test.mjs` — PASS.
Run: `npm run check:content && npx astro check` — content passes; 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/About.astro src/components/Quotes.astro src/components/Booking.astro src/components/Proof.astro src/components/Faq.astro tests/design-batch3.test.mjs
git commit -m "feat(design): homepage section headings + warm-paper surface rhythm (About/Quotes/Booking/Proof/FAQ)"
```

---

## Task 3: About image perf fix + Contact band + Footer/Nav polish

**Files:** Modify `About.astro` (image), `Contact.astro`, `Footer.astro`, `Nav.astro`. Append to `tests/design-batch3.test.mjs`.

- [ ] **Step 1: About image — responsive widths/sizes (perf, ~72 KB).** In `About.astro`, the `DuotoneImage` currently uses `width={520} densities={[2]}` (a fixed 1040px asset shipped to every viewport). `DuotoneImage` forwards `widths`/`sizes` to the underlying `<Image>`. Change to responsive:
```astro
<DuotoneImage src={coachPortrait} alt={`Coach ${site.business.coach} with two young players`} widths={[360, 520, 760]} sizes="(min-width: 768px) 40vw, 90vw" quality={70} class="rounded-box shadow-xl w-full" />
```
(Confirm the source is ≥760px wide; if not, cap the top width at the source width. `coach-with-players.jpg` was noted ~1040px wide — 760 is safe.)

- [ ] **Step 2: Contact band (R3 on a dark surface).** In `Contact.astro` (on `bg-primary text-primary-content`), add a marigold eyebrow + stitch and give the `<h2>` the display face:
```astro
<p class="font-heading text-sm uppercase tracking-[0.25em] text-marigold">Free First Lesson</p>
<h2 class="font-display fluid-lg uppercase mt-2">Ready to Get Started?</h2>
<div class="mx-auto mt-4 w-28"><Ornament variant="stitch" /></div>
```
(Import `Ornament`. Keep the existing CTA buttons + service-area line. `Ornament` stitch is `text-marigold` — good contrast on navy.)

- [ ] **Step 3: Footer + Nav light polish.** Footer: add a stitch divider above the `<aside>` content (`<div class="mx-auto mb-8 w-32"><Ornament variant="stitch" /></div>`) and import `Ornament`; no structural/link changes. Nav: no behavior change — optional `font-heading` on the menu labels only if it reads better in preview (leave functional).

- [ ] **Step 4: Append tests:**

```js
test("about image ships a responsive srcset (not a single fixed asset)", () => {
  const h = home();
  // the duotone about image should expose multiple candidate widths
  assert.match(h, /coach-with-players[^"]*\.webp\s+\d+w/);
});

test("contact band uses the display face + marigold eyebrow", () => {
  const h = home();
  assert.ok(h.includes("Free First Lesson"));
  assert.match(h, /<h2[^>]*font-display[^>]*>\s*Ready to Get Started\?/);
});
```

- [ ] **Step 5: Run tests + verify chain**

Run: `npm run build && node --test tests/design-batch3.test.mjs` — PASS.
Run: `npm run check:content && npx astro check` — 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/About.astro src/components/Contact.astro src/components/Footer.astro src/components/Nav.astro tests/design-batch3.test.mjs
git commit -m "feat(design): responsive About image + display Contact band + footer stitch"
```

---

## Task 4: Subpage hubs (coaching / pitching / packages / baseball-lessons index)

**Files:** Modify the 4 `index.astro` hub templates. Append hub assertions to `tests/design-batch3.test.mjs`.

All four share the same structure (bg-neutral hero with breadcrumb + bare h1 + desc; then a card grid). Apply, per hub:
1. **Breadcrumb** (Task 1 component) on the dark hero — `<Breadcrumb items={[{label:"Home",href:"/"},{label:"<Hub>"}]} class="text-white/60" />` (replace the inline `<nav>`).
2. **R3 hero treatment**: marigold eyebrow + keep the `<h1>` but give it `font-display fluid-lg uppercase text-white` + a stitch rule under it. (Eyebrows: coaching `"Private Coaching"`, pitching `"Pitching Development"`, packages `"Pricing"`, baseball-lessons `"Service Areas"`.)
3. **R1**: the card-grid section becomes `bg-paper` (warm) under the dark hero.
4. **R4 elevated cards** + **R5 Reveal** around the grid. Reuse the homepage card frame; keep each card's existing content (icon/name/lead for coaching; pitch name/cue for pitching; price/duration for packages — pricing untouched; city/region for areas). Add `01..0N` numbering on coaching + pitching lists; skip numbering on packages/areas if it reads cluttered (decide in preview).

- [ ] **Step 1: Append failing tests:**

```js
test("coaching hub h1 uses the display face", () => {
  const h = read("coaching/index.html");
  assert.match(h, /<h1[^>]*font-display[^>]*>/);
});
test("hub card grids are wrapped for scroll-reveal", () => {
  // Reveal adds data-reveal somewhere on the hub page
  assert.match(read("pitching/index.html"), /data-reveal/);
});
```

- [ ] **Step 2: Run to verify they fail** — `npm run build && node --test tests/design-batch3.test.mjs`.

- [ ] **Step 3: Apply the hub recipe** to all four `index.astro` files (read each, apply Breadcrumb + R3 + R1 + R4 + R5). Keep all hrefs, data, and the trailing `/#book` CTA.

- [ ] **Step 4: Run tests + full content/schema verify**

Run: `npm run build && node --test tests/design-batch3.test.mjs` — PASS.
Run: `npm run check:content && npx astro check && npm run schema-check` — content passes; 0 errors; **29 pages**.

- [ ] **Step 5: Commit**

```bash
git add src/pages/coaching/index.astro src/pages/pitching/index.astro src/pages/packages/index.astro src/pages/baseball-lessons/index.astro tests/design-batch3.test.mjs
git commit -m "feat(design): subpage hubs into the system — Breadcrumb, display hero, paper surface, elevated cards"
```

---

## Task 5: Detail templates (coaching/[slug], packages/[slug], baseball-lessons/[city])

**Files:** Modify the 3 detail templates. Append detail assertions to `tests/design-batch3.test.mjs`.

These share: bg-neutral hero (breadcrumb + icon? + bare h1 + lead + dual CTA) → prose → alternating `bg-base-200`/`bg-base-100` inner sections (`What we work on` / `What's included` / `Who it's for` / `Baseball in {city}`), a FAQ accordion, and a related-items pill nav. Apply:
1. **Breadcrumb** on the dark hero (`text-white/60`).
2. **R3 hero**: marigold eyebrow + `font-display fluid-lg uppercase text-white` h1 + stitch. (Eyebrow = the section family, e.g. coaching skill → `"Private Coaching"`; package → `"Training Package"`; city → `"Baseball Lessons"`.)
3. **R2** on every in-page `<h2>` → `SectionHeading` (light surfaces). Keep `align` matching the original (these are mostly left-aligned within `max-w` prose — pass `align="left"`).
4. **R1** surface rhythm across the inner sections; **R5 Reveal** around each inner block.
5. FAQ accordion stays `<details class="collapse collapse-arrow">`, now under an alternated surface + a `SectionHeading`. **No `FAQPage` JSON-LD** (unchanged).
6. Related-items pill nav: keep, optionally frame as small cards (decide in preview). **packages/[slug] pricing/features/add-ons untouched.**

- [ ] **Step 1: Append failing tests:**

```js
test("coaching detail h1 uses display face + in-page headings use SectionHeading eyebrows", () => {
  // pick a known coaching slug page; hitting is stable
  const h = read("coaching/hitting/index.html");
  assert.match(h, /<h1[^>]*font-display[^>]*>/);
  // a SectionHeading eyebrow (brand-red-dark uppercase tracked) appears
  assert.match(h, /tracking-\[0\.2em\][^>]*text-brand-red-dark|text-brand-red-dark[^>]*tracking-\[0\.2em\]/);
});
test("package detail still renders its price (no pricing drift)", () => {
  // elite-season detail shows $1,500
  assert.ok(read("packages/elite-season/index.html").includes("$1,500"));
});
```

> Confirm the sample slugs exist before asserting (`coaching/hitting`, `packages/elite-season`); if a slug differs, use an actual built path. List built pages with `ls dist/coaching` etc.

- [ ] **Step 2: Run to verify they fail.**

- [ ] **Step 3: Apply the detail recipe** to the 3 templates (read each; apply Breadcrumb + R3 + R2 + R1 + R5). Preserve all schema nodes (`Service`/`WebPage`/`BreadcrumbList`), CTAs, prose `<article>`, and conditional sections in `[city]`.

- [ ] **Step 4: Run tests + FULL verify chain**

Run: `npm run check:content && npx astro check && npm run build && npm run schema-check && npm test` — content passes; 0 errors; **29 pages**; all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/pages/coaching/[slug].astro src/pages/packages/[slug].astro src/pages/baseball-lessons/[city].astro tests/design-batch3.test.mjs
git commit -m "feat(design): detail templates into the system — display hero, SectionHeading, surface rhythm, reveal"
```

---

## Task 6: pitching/[slug] (prose-only exception)

**Files:** Modify `src/pages/pitching/[slug].astro`.

This template has no dark hero — it's a breadcrumb + `<article class="prose">` (markdown `<Content />`) + CTA + back link. Lighter touch:
1. **Breadcrumb** via the shared component (light surface — default greys).
2. Above the prose, add the **eyebrow + display title treatment** for the page `<h1>` if the h1 is currently inside the prose: lift a display **eyebrow** (`Pitching Development`) + a stitch rule above the article, OR if the h1 is prose-rendered, wrap the intro with a small header block using `font-display fluid-md` on a light surface. Keep the prose body for the article content.
3. Wrap the article in `<Reveal>`.
4. Keep the `btn-accent` CTA + back link.

- [ ] **Step 1: Apply** the lighter recipe (read the file first; the h1 may come from frontmatter or markdown — preserve a single `<h1>`).

- [ ] **Step 2: Verify chain**

Run: `npm run check:content && npx astro check && npm run build && npm run schema-check && npm test` — all green; **29 pages**.

- [ ] **Step 3: Commit**

```bash
git add src/pages/pitching/[slug].astro
git commit -m "feat(design): pitching guide pages — eyebrow + display header + reveal"
```

---

## Task 7: Full verification + preview-refine + Lighthouse

**Files:** none (verification only).

- [ ] **Step 1: Full verify chain** — `npm run check:content && npx astro check && npm run schema-check && npm test`. Expected: content passes; 0 errors; **29 pages**; ALL tests pass (Batch 1/2 + batch3).

- [ ] **Step 2: Preview-refine with Clay.** `npm run dev`; walk the homepage AND a sample of each subpage family (one hub + one coaching detail + one package detail + one city + one pitch guide) on mobile + desktop. Refine: surface-rhythm balance, eyebrow copy, hero contrast (AA on white-on-neutral), card framing/numbering, the marigold staying *sparing*, FAQ/Reveal behavior. Commit refinements as `style(design): batch 3 refinements`.

- [ ] **Step 3: Lighthouse / a11y guard.** After preview (and again after deploy), confirm **no regression** on home + one subpage: perf ~100/mobile ~94 (unchanged compression ceiling), **a11y 100**, BP 100, SEO 100. Watch: new paper surfaces (AA), white-on-neutral hero text (AA), display-font CLS on subpage heroes (font is already preloaded). PSI MCP is rate-limited / no local Chrome → use pagespeed.web.dev.

- [ ] **Step 4: Stop the preview.**

---

## Done criteria

- Every homepage section AND every subpage template reads as Heritage Athletic: display headings, eyebrows + stitch rules, coherent `base-100`↔`paper` rhythm, elevated cards, scroll-reveal, marigold accents — consistent end to end.
- Shared `Breadcrumb` replaces the 8× inline copies (same DOM).
- About image ships a responsive srcset (perf win).
- Full verify chain green; **29 pages**; Lighthouse no regression (a11y/BP/SEO 100).
- **Zero** content/route/schema/anchor/h1/pricing changes; palette + marigold discipline intact; FAQ still out of JSON-LD.
- Ready for the Batch 3 PR (push → bot review → triage → **merge only on Clay's explicit OK**).

## Notes for the implementer

- Reuse Batch 1/2 primitives; introduce NO new colors. Marigold stays sparing (eyebrows, stitch rules, diamond ticks, hover borders).
- Subpage hero `<h1>` stays an `<h1>` — display *treatment*, never `SectionHeading` (h2). In-page `<h2>`s → `SectionHeading`.
- Do NOT touch `packages.json`, routes, content collections, schema nodes, or `schema-check` expectations (no new routes → no `expectedExtra()` changes; this is a reskin).
- If any change would alter content text, a route, an anchor, an h1, or schema, STOP and ask.
- Breadcrumb on dark heroes needs a light tone class (`text-white/60`) — verify AA in preview.
