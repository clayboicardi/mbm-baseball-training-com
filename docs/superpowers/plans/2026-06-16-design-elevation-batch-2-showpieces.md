# Design Elevation — Batch 2 (Signature Hero + Showpieces) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the three "wow" showpieces of the Heritage Athletic redesign — a signature hero, an elevated card showcase (What I Coach + The Arsenal), and a premium Packages comparison — on top of the live Batch 1 foundation, without changing content, routes, structured data, or pricing.

**Architecture:** Pure presentation. Reuse the Batch 1 design system (`.font-display`, `.fluid-display/lg/md`, `bg-paper`, `text-marigold`, `.duotone`, `Reveal`, `Ornament`, `SectionHeading`, `DuotoneImage`). Restyle existing section components (`Hero`, `Pitching`, `Packages`, `ServiceCard`, `PackageCard`) in place — same data, same DOM semantics, same anchors and schema.

**Tech Stack:** Astro 6 (static), Tailwind v4 + daisyUI v5 (`mbm` theme), `astro:assets`, `node --test` over built HTML.

---

## Spec reference

Implements **Batch 2** (§G showpieces) of `docs/superpowers/specs/2026-06-16-mbm-design-elevation-design.md`. Batch 3 (section-by-section polish of the remaining sections + subpage templates) is a later plan.

## How this batch is executed (important)

Batch 1 was mechanical; **Batch 2 is visual**. Each task ships a **concrete first version** (specified below) that is **correct, accessible, and gated** — then we **preview and refine the aesthetics interactively with Clay (and Myles)** before merge. Tests assert *structure, accessibility, schema, and perf-safety* — never pixel aesthetics. Treat the markup in each task as a strong starting point, not a frozen spec; visual tuning happens in the preview-refine checkpoint.

This is also where the **display-font A/B** happens (Big Shoulders Display vs Anton vs Zilla Slab) — a one-token swap in `global.css`, decided on the live preview.

## Locked constraints (hold at every commit)

- Verify chain green: `npm run check:content` → `npx astro check` (0 errors) → `npm run build` → `npm run schema-check` → `npm test`.
- All existing tests stay green; **structured data / routes / anchors unchanged** (schema-check still 29 pages).
- **Palette locked** — no new brand colors. Marigold = ornament/accent only (the hero eyebrow, ticket borders, the Elite accent are sanctioned folk-art-accent uses). No raw hex in components.
- Near-zero-JS; Lighthouse ~100 (watch hero LCP/CLS with the display font); mobile-first; `prefers-reduced-motion` honored (reuse `Reveal`).
- **`packages.json` pricing/tiers untouched** (read-only).

## File structure

| File | Create/Modify | Responsibility |
|---|---|---|
| `src/components/Hero.astro` | Modify (full rewrite) | Signature hero: emblem watermark, oversized display headline, stitch rule, treated photo, folk-art trust "tickets" |
| `src/components/ServiceCard.astro` | Modify | Elevated showcase card: numbered, diamond tick, hover-reveal CTA |
| `src/components/Services.astro` | Modify | Pass index to ServiceCard |
| `src/components/Pitching.astro` | Modify | `SectionHeading`; Arsenal cards get the showcase treatment (numbered, diamond, hover-reveal) |
| `src/components/PackageCard.astro` | Modify | Featured (Elite) tier → marigold-accented "hero" card; refined non-featured styling |
| `src/components/Packages.astro` | Modify | `SectionHeading`; spotlight layout for the Elite tier |
| `tests/design-showpieces.test.mjs` | Create | Structure / a11y / schema-safety regression guards for all three showpieces |

> Note: `ServiceCard`/`PackageCard` are shared by subpages indirectly only via the homepage sections here — these edits are presentation-only and do not change the city/coaching/packages route templates.

---

## Task 1: Signature hero

**Files:** Modify `src/components/Hero.astro`; create+append `tests/design-showpieces.test.mjs`.

- [ ] **Step 1: Write the failing tests**

Create `tests/design-showpieces.test.mjs`:
```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const home = join(root, "dist", "index.html");
const html = () => {
  if (!existsSync(home)) throw new Error("dist/index.html missing — run `npm run build`");
  return readFileSync(home, "utf8");
};

test("hero uses the display headline + a decorative emblem watermark", () => {
  const h = html();
  // the H1 carries the display face + fluid display size
  assert.match(h, /<h1[^>]*\bfont-display\b[^>]*\bfluid-display\b|<h1[^>]*\bfluid-display\b[^>]*\bfont-display\b/);
  // the watermark emblem is decorative (empty alt or aria-hidden), not announced
  assert.match(h, /aria-hidden="true"[^>]*>\s*<\/[^>]+>|alt=""/);
});

test("hero keeps the LCP image eager + high priority", () => {
  assert.match(html(), /fetchpriority="high"/);
});

test("hero exposes all trust items", () => {
  const h = html();
  for (const t of ["20+ years in the game", "Ages 8–18", "Long Beach & Orange County"]) {
    assert.ok(h.includes(t), `hero missing trust item: ${t}`);
  }
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm run build && node --test tests/design-showpieces.test.mjs`
Expected: hero tests FAIL (no display H1 / watermark yet).

- [ ] **Step 3: Rewrite the hero**

Replace the FULL contents of `src/components/Hero.astro` with:
```astro
---
import { Image } from "astro:assets";
import site from "../data/site.json";
import Ornament from "./ui/Ornament.astro";
import heroImg from "../assets/photos/coach-huddle.jpg";
import emblem from "../assets/brand/mbm-emblem.png";
---
<section id="top" class="relative overflow-hidden bg-neutral text-white">
  <Image
    src={heroImg}
    alt="Coach Myles Berniard-Mendez leading a youth baseball training session in Long Beach"
    widths={[400, 600, 900]}
    sizes="100vw"
    format="webp"
    loading="eager"
    fetchpriority="high"
    quality={55}
    class="absolute inset-0 h-full w-full object-cover opacity-30"
  />
  <div class="absolute inset-0 bg-gradient-to-b from-neutral/70 via-neutral/85 to-neutral"></div>
  <Image
    src={emblem}
    alt=""
    width={520}
    height={520}
    densities={[2]}
    quality={70}
    class="pointer-events-none absolute -right-16 -top-10 w-[60vw] max-w-xl opacity-[0.06]"
  />

  <div class="relative z-10 mx-auto flex min-h-[88vh] max-w-5xl flex-col justify-center px-4 py-20 text-center">
    <p class="font-heading text-sm uppercase tracking-[0.25em] text-marigold">Long Beach &amp; Orange County · Ages 8–18</p>
    <h1 class="font-display fluid-display uppercase mt-3">{site.hero.headline}</h1>
    <div class="mx-auto mt-4 w-40"><Ornament variant="stitch" /></div>
    <p class="mx-auto mt-6 max-w-2xl text-lg text-white/85">{site.hero.subhead}</p>
    <p class="mt-4 font-heading text-xl uppercase tracking-wide text-white">{site.hero.tagline}</p>
    <div class="mt-8 flex flex-wrap justify-center gap-3">
      <a href={site.hero.primaryCta.href} class="btn btn-accent btn-lg">{site.hero.primaryCta.label}</a>
      <a href={site.hero.secondaryCta.href} class="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-primary">{site.hero.secondaryCta.label}</a>
    </div>
    <ul class="mt-10 flex flex-wrap justify-center gap-3">
      {site.hero.trust.map((t) => (
        <li class="inline-flex items-center gap-2 rounded-full border border-marigold/40 bg-white/5 px-4 py-1.5 text-sm text-white/90">
          <Ornament variant="diamond" class="w-3 h-3" />{t}
        </li>
      ))}
    </ul>
  </div>
</section>
```

- [ ] **Step 4: Run the hero tests + verify chain**

Run: `npm run build && node --test tests/design-showpieces.test.mjs`
Expected: hero tests PASS.
Run: `npx astro check` — 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero.astro tests/design-showpieces.test.mjs
git commit -m "feat(design): signature hero — display headline, emblem watermark, stitch, folk-art trust strip"
```

- [ ] **Step 6: PREVIEW-REFINE checkpoint**

Run `npm run preview`; open on mobile + desktop. Report to Clay with the URL. Refine interactively: headline size/leading, watermark placement/opacity, photo opacity vs legibility (AA on white-on-neutral text), CTA hierarchy, trust-ticket styling. This is also the moment to A/B the display font. Commit any refinements as `style(design): hero refinements` before moving on.

---

## Task 2: Card showcase (What I Coach + The Arsenal)

Elevate the two icon-card grids into a distinctive, numbered, diamond-ticked, hover-reveal showcase.

**Files:** Modify `src/components/ServiceCard.astro`, `src/components/Services.astro`, `src/components/Pitching.astro`; append to `tests/design-showpieces.test.mjs`.

- [ ] **Step 1: Append failing tests**

Append to `tests/design-showpieces.test.mjs`:
```js
test("What I Coach cards are numbered with a decorative diamond tick", () => {
  const h = html();
  // a 2-digit zero-padded index label appears (01..05) and a decorative diamond svg
  assert.match(h, /\b0[1-9]\b/);
  assert.match(h, /<svg[^>]*aria-hidden="true"[\s\S]*?<polygon/); // diamond Ornament
});

test("Pitching section uses a SectionHeading display title", () => {
  const h = html();
  assert.match(h, /How Coach Myles Builds a Pitcher/);
  // the display-face heading class is present in the pitching area
  assert.match(h, /font-display/);
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm run build && node --test tests/design-showpieces.test.mjs`
Expected: the two new tests FAIL.

- [ ] **Step 3: Elevate `ServiceCard.astro`**

Replace the FULL contents of `src/components/ServiceCard.astro` with:
```astro
---
import { Icon } from "astro-icon/components";
import Ornament from "./ui/Ornament.astro";
interface Props { title: string; blurb: string; icon: string; href?: string; index?: number; }
const { title, blurb, icon, href, index } = Astro.props;
const Tag = href ? "a" : "div";
const num = typeof index === "number" ? String(index + 1).padStart(2, "0") : undefined;
---
<Tag
  {...(href ? { href } : {})}
  class:list={[
    "group relative block overflow-hidden rounded-box border border-base-300 bg-base-100 p-6 transition-all",
    href && "hover:-translate-y-1 hover:border-marigold/60 hover:shadow-lg",
  ]}
>
  <span aria-hidden="true" class="absolute right-4 top-4 text-marigold"><Ornament variant="diamond" class="w-3.5 h-3.5" /></span>
  {num && <span aria-hidden="true" class="font-display text-base-content/15 text-3xl leading-none">{num}</span>}
  <Icon name={icon} class="mt-2 h-9 w-9 text-accent" aria-hidden="true" />
  <h3 class="mt-3 font-heading text-xl font-bold text-primary uppercase">{title}</h3>
  <p class="mt-2 text-sm text-base-content/70">{blurb}</p>
  {href && <span class="mt-3 inline-block text-sm font-semibold text-primary opacity-80 transition-opacity group-hover:opacity-100">Learn more →</span>}
</Tag>
```

- [ ] **Step 4: Pass the index from `Services.astro`**

In `src/components/Services.astro`, change the map line:
```astro
      {services.map((s) => <ServiceCard title={s.title} blurb={s.blurb} icon={s.icon} href={`/coaching/${s.slug}/`} />)}
```
to:
```astro
      {services.map((s, i) => <ServiceCard title={s.title} blurb={s.blurb} icon={s.icon} href={`/coaching/${s.slug}/`} index={i} />)}
```

- [ ] **Step 5: Elevate the Arsenal + add SectionHeading in `Pitching.astro`**

In `src/components/Pitching.astro`:

(a) Add the imports after the existing imports:
```ts
import SectionHeading from "./ui/SectionHeading.astro";
import Ornament from "./ui/Ornament.astro";
```

(b) Replace the bare section `<h2>` (the "How Coach Myles Builds a Pitcher" line) with a `SectionHeading`:
```astro
    <SectionHeading eyebrow="Pitching Development" title="How Coach Myles Builds a Pitcher" />
```

(c) Replace the Arsenal card block (the `{arsenal.map(...)}` grid) with the elevated, numbered showcase:
```astro
      {arsenal.map((p, i) => (
        <a
          href={`/pitching/${p.slug}/`}
          class="group relative block overflow-hidden rounded-box border border-base-300 bg-base-100 p-6 transition-all hover:-translate-y-1 hover:border-marigold/60 hover:shadow-lg"
        >
          <span aria-hidden="true" class="absolute right-4 top-4 text-marigold"><Ornament variant="diamond" class="w-3.5 h-3.5" /></span>
          <span aria-hidden="true" class="font-display text-base-content/15 text-3xl leading-none">{String(i + 1).padStart(2, "0")}</span>
          <Icon name={p.icon} class="mt-2 h-9 w-9 text-accent" aria-hidden="true" />
          <h4 class="mt-3 font-heading text-xl font-bold text-primary uppercase">{p.name}</h4>
          <p class="mt-1 text-sm font-semibold uppercase tracking-wide text-brand-red-dark">“{p.cue}”</p>
          <p class="mt-2 text-sm text-base-content/70">{p.blurb}</p>
          <span class="mt-3 inline-block text-sm font-semibold text-primary opacity-80 transition-opacity group-hover:opacity-100">Read the guide →</span>
        </a>
      ))}
```

- [ ] **Step 6: Run the tests + verify chain**

Run: `npm run build && node --test tests/design-showpieces.test.mjs`
Expected: PASS.
Run: `npm run check:content && npx astro check` — content passes; 0 errors. (Confirms no off-brand hex, no broken anchors.)

- [ ] **Step 7: Commit**

```bash
git add src/components/ServiceCard.astro src/components/Services.astro src/components/Pitching.astro tests/design-showpieces.test.mjs
git commit -m "feat(design): card showcase — numbered, diamond-ticked, hover-reveal (What I Coach + Arsenal)"
```

- [ ] **Step 8: PREVIEW-REFINE checkpoint**

Preview; refine card framing, number opacity/placement, hover motion, diamond size. Confirm AA contrast on card text. Commit refinements before moving on.

---

## Task 3: Premium Packages comparison

Make the Elite tier read as a clear, marigold-accented hero card instead of one of five equal boxes; refine the rest.

**Files:** Modify `src/components/PackageCard.astro`, `src/components/Packages.astro`; append to `tests/design-showpieces.test.mjs`.

- [ ] **Step 1: Append failing tests**

Append to `tests/design-showpieces.test.mjs`:
```js
test("Packages section uses a SectionHeading display title", () => {
  assert.match(html(), /Training Packages/);
});

test("the Elite (featured) tier is visually spotlighted with the marigold accent", () => {
  const h = html();
  // featured card carries a marigold accent border/ring utility
  assert.match(h, /(border|ring)-marigold/);
});

test("no pricing drifted — all 5 tier prices still render", () => {
  const h = html();
  for (const label of ["Free", "$55", "$75", "$585", "$1,500"]) {
    assert.ok(h.includes(label), `missing package price ${label}`);
  }
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm run build && node --test tests/design-showpieces.test.mjs`
Expected: the Packages tests FAIL (no marigold accent yet).

- [ ] **Step 3: Restyle the featured tier in `PackageCard.astro`**

Replace the outer wrapper `<div>` opening tag (currently `<div class={\`card border-2 bg-base-100 h-full ${featured ? "border-accent shadow-xl" : "border-base-300"}\`}>`) with:
```astro
<div class:list={[
  "card border-2 bg-base-100 h-full transition-all",
  featured ? "border-marigold shadow-xl ring-1 ring-marigold/30 lg:scale-[1.03]" : "border-base-300 hover:border-base-content/20",
]}>
```
And replace the "Best Value" badge line (`<span class="badge border-0 bg-brand-red-dark text-white self-start">Best Value</span>`) with a folk-art pennant:
```astro
    {featured && (
      <span class="badge gap-1 border-0 bg-brand-red-dark text-white self-start">
        <Ornament variant="diamond" class="w-2.5 h-2.5" />Best Value
      </span>
    )}
```
And add the Ornament import to the frontmatter:
```ts
import Ornament from "./ui/Ornament.astro";
```

- [ ] **Step 4: SectionHeading + spotlight layout in `Packages.astro`**

In `src/components/Packages.astro`:

(a) Add the import after the existing imports:
```ts
import SectionHeading from "./ui/SectionHeading.astro";
```

(b) Replace the bare `<h2>` + the `<p>` subhead lines:
```astro
    <h2 class="text-3xl font-heading font-bold text-primary uppercase text-center">Training Packages</h2>
    <p class="text-center mt-2 text-base-content/70">Start with a free lesson. Train at your pace.</p>
```
with:
```astro
    <SectionHeading eyebrow="Pricing" title="Training Packages" />
    <p class="text-center mt-4 text-base-content/70">Start with a free lesson. Train at your pace.</p>
```

- [ ] **Step 5: Run the tests + verify chain**

Run: `npm run build && node --test tests/design-showpieces.test.mjs`
Expected: PASS (incl. the price-drift guard).
Run: `npm run check:content && npx astro check && npm run schema-check` — content passes; 0 errors; schema-check 29 pages.

- [ ] **Step 6: Commit**

```bash
git add src/components/PackageCard.astro src/components/Packages.astro tests/design-showpieces.test.mjs
git commit -m "feat(design): premium packages comparison — marigold-accented Elite spotlight + SectionHeading"
```

- [ ] **Step 7: PREVIEW-REFINE checkpoint**

Preview; refine the Elite spotlight (scale/ring/elevation), grid balance across breakpoints (the `2xl:grid-cols-5` row), and the pennant. Confirm the marigold accent stays "sparing" per the brand lock and AA holds. Commit refinements.

---

## Task 4: Full verification + performance + a11y

**Files:** none (verification only).

- [ ] **Step 1: Full verify chain**

Run: `npm run check:content && npx astro check && npm run schema-check && npm test`
Expected: content passes; `astro check` 0 errors; schema-check **29 pages**; `node --test` ALL pass (Batch 1 + design-showpieces).

- [ ] **Step 2: Lighthouse pass (regression guard)**

On the preview (or after deploy), run the lighthouse MCP `get_performance_score`, `get_accessibility_score`, `get_core_web_vitals`, `get_seo_analysis` and confirm no regression vs. the live site. **Watch hero LCP/CLS** (the display headline is likely LCP — confirm the preload + `font-display: swap` keep it fast; if LCP regresses, reduce the display weight set or drop the watermark image's priority). Confirm **a11y stays 100** (white-on-neutral hero text AA, card text AA, marigold accents are decorative only).

- [ ] **Step 3: Stop the preview.**

---

## Done criteria

- All three showpieces shipped + refined on preview with Clay/Myles; the homepage reads as a distinctive Heritage Athletic site (display hero, framed numbered showcases, spotlighted Elite tier).
- Full verify chain green; Lighthouse shows no regression (perf/a11y ~100).
- Zero content/route/schema/pricing changes; palette + marigold discipline intact.
- Ready for the Batch 2 PR (push → bot review → triage → **merge only on Clay's explicit OK**, = live deploy).

## Notes for the implementer

- Reuse Batch 1 primitives; do NOT introduce new colors. Marigold stays sparing (hero eyebrow/tickets, diamond ticks, the single Elite accent).
- Keep the hero image `loading="eager" fetchpriority="high"` — it's the LCP element; don't lazy-load it.
- Do NOT touch `packages.json`, routes, content collections, or `schema-check` expectations.
- The markup here is a strong first version — expect to tune it on the preview. If a change would alter content text, routes, or schema, STOP and ask.
