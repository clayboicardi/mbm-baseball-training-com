# Design Elevation — Batch 1 (Foundation) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the reversible design-system foundation (display font + fluid type scale, warm paper surface, folk-art ornament primitives, reduced-motion-safe scroll-reveal, duotone photo treatment) and apply it lightly to the homepage — visibly elevating the site without changing content, routes, or structured data.

**Architecture:** Pure presentation layer. New design tokens live in `src/styles/global.css` (`@theme` + utilities); new reusable Astro components live in `src/components/ui/`; one tiny inline vanilla script in `BaseLayout.astro` drives scroll-reveal. Existing section components are restyled in place — same DOM semantics, same anchors, same JSON-LD. Everything is build-time (zero runtime deps beyond the ~10-line inline reveal script).

**Tech Stack:** Astro 6 (static), Tailwind v4 + daisyUI v5 (`mbm` theme), `@fontsource/big-shoulders-display`, `astro:assets` Image, `node --test` over built HTML.

---

## Spec reference

Implements **Batch 1** of `docs/superpowers/specs/2026-06-16-mbm-design-elevation-design.md`. Batches 2 (Hero + showpieces) and 3 (section polish) are separate plans.

## Locked constraints (must hold at every commit)

- Verify chain green: `npm run check:content` → `npx astro check` (0 errors/0 warnings) → `npm run build` → `npm run schema-check` → `npm test`.
- All **50 existing tests** stay green; structured data / routes / anchors unchanged.
- **Palette locked**: no new brand colors. The one sanctioned addition is `--color-paper`, a *warm-neutral surface* (not a brand color), defined only in `global.css` (which `check-content.mjs` exempts from the hex scan). Components use the generated `bg-paper` utility — **never raw hex**.
- **Marigold** (`--color-marigold`) is used for **ornament accents only**, per the brand lock.
- Near-zero-JS preserved (one tiny `is:inline` reveal script); Lighthouse ~100; mobile-first; `prefers-reduced-motion` honored.

## File structure

| File | Create/Modify | Responsibility |
|---|---|---|
| `package.json` | Modify | Add `@fontsource/big-shoulders-display` dependency |
| `src/styles/global.css` | Modify | Display-font import, `@theme` tokens (font/scale/paper/marigold), `.font-display` + fluid utilities, `.reveal` (reduced-motion + JS-gated), `.duotone` |
| `src/layouts/BaseLayout.astro` | Modify | Preload display font; add the `is:inline` scroll-reveal script |
| `src/components/ui/Ornament.astro` | Create | Decorative inline-SVG motifs: `stitch` divider, `diamond` tick |
| `src/components/ui/SectionHeading.astro` | Create | Eyebrow + display title + stitch rule |
| `src/components/ui/Reveal.astro` | Create | `[data-reveal]` scroll-reveal wrapper (renders visible without JS) |
| `src/components/ui/DuotoneImage.astro` | Create | Wraps `astro:assets` Image with navy/marigold duotone + framing |
| `src/components/Services.astro` | Modify | Use `SectionHeading`; add a stitch `Ornament`; warm-paper surface |
| `src/components/About.astro` | Modify | Coach photo via `DuotoneImage` |
| `src/pages/index.astro` | Modify | Wrap two below-the-fold sections in `Reveal` |
| `tests/design-foundation.test.mjs` | Create | Built-HTML + source regression guards for all of the above |

---

## Task 1: Add and verify the display-font dependency

**Files:**
- Modify: `package.json` (dependencies)

- [ ] **Step 1: Install the font package**

Run:
```bash
npm install @fontsource/big-shoulders-display@^5.2.5
```

- [ ] **Step 2: Verify the exact subset + woff2 file paths the later tasks import**

Run:
```bash
ls node_modules/@fontsource/big-shoulders-display/latin-700.css \
   node_modules/@fontsource/big-shoulders-display/files/big-shoulders-display-latin-700-normal.woff2
```
Expected: both paths print (no "No such file"). If the woff2 filename differs, note the actual name — Tasks 2 and 3 must use whatever `ls` shows here.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "build: add @fontsource/big-shoulders-display (design display font)"
```

---

## Task 2: Foundation design tokens in global.css

**Files:**
- Modify: `src/styles/global.css`
- Test: `tests/design-foundation.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `tests/design-foundation.test.mjs`:
```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(root, "src", "styles", "global.css"), "utf8");

test("global.css declares the display font, fluid scale, and surface tokens", () => {
  assert.match(css, /@import "@fontsource\/big-shoulders-display\/latin-700\.css"/);
  assert.match(css, /--font-display:/);
  assert.match(css, /--step-display:\s*clamp\(/);
  assert.match(css, /--step-h1:\s*clamp\(/);
  assert.match(css, /--color-paper:/);
  assert.match(css, /--color-marigold:/);
});

test("scroll-reveal is gated so JS-off / reduced-motion never hides content", () => {
  assert.match(css, /prefers-reduced-motion: no-preference/);
  // hidden state must require BOTH .js-reveal (JS present) and the motion query
  assert.match(css, /\.js-reveal \.reveal\b[\s\S]*?opacity:\s*0/);
});

test("duotone treatment is CSS-only (no extra requests)", () => {
  assert.match(css, /\.duotone::after/);
  assert.match(css, /mix-blend-mode:\s*multiply/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/design-foundation.test.mjs`
Expected: FAIL — the tokens/rules don't exist in `global.css` yet.

- [ ] **Step 3: Add the font import**

In `src/styles/global.css`, directly after the existing `@import "@fontsource/inter/latin-700.css";` line, add:
```css
@import "@fontsource/big-shoulders-display/latin-600.css";
@import "@fontsource/big-shoulders-display/latin-700.css";
@import "@fontsource/big-shoulders-display/latin-800.css";
```

- [ ] **Step 4: Extend the `@theme` block with foundation tokens**

Replace the existing `@theme { ... }` block with:
```css
@theme {
  /* AA-accessible dark red for small text on / over the brand red. Single source
     of truth for what used to be inline text-[#D72B31] (see check-content.mjs
     Decision 2). Use via the generated `text-brand-red-dark` utility. */
  --color-brand-red-dark: #D72B31;

  /* Design-elevation foundation (spec 2026-06-16). Palette stays locked: paper is
     a warm-neutral SURFACE (not a brand color); marigold is ornament-accent only. */
  --color-paper: #FBF7EF;
  --color-marigold: #EBB257;
  --font-display: "Big Shoulders Display", "Oswald", system-ui, sans-serif;
  --step-display: clamp(2.75rem, 6vw + 1rem, 5.5rem);
  --step-h1: clamp(2rem, 3vw + 1rem, 3.5rem);
  --step-h2: clamp(1.5rem, 1.5vw + 1rem, 2.25rem);
}
```

- [ ] **Step 5: Add the utility + behavior rules**

At the END of `src/styles/global.css`, append:
```css
/* --- Design-elevation foundation utilities (spec 2026-06-16) --- */
.font-display { font-family: var(--font-display); font-weight: 700; letter-spacing: 0.01em; }
.fluid-display { font-size: var(--step-display); line-height: 0.92; }
.fluid-h1 { font-size: var(--step-h1); line-height: 1; }
.fluid-h2 { font-size: var(--step-h2); line-height: 1.1; }

/* Scroll-reveal — opt-in via [data-reveal]. Content is ALWAYS visible unless JS is
   present (.js-reveal, added by the reveal script) AND motion is allowed, so
   JS-off and reduced-motion users never get hidden content. */
@media (prefers-reduced-motion: no-preference) {
  .js-reveal .reveal {
    opacity: 0;
    transform: translateY(1.25rem);
    transition: opacity 0.6s ease, transform 0.6s ease;
    transition-delay: var(--reveal-delay, 0ms);
  }
  .js-reveal .reveal.is-visible { opacity: 1; transform: none; }
}

/* Duotone photo treatment (navy + marigold), CSS-only, build-time safe. */
.duotone { position: relative; overflow: hidden; }
.duotone > img { display: block; width: 100%; height: 100%; object-fit: cover; filter: grayscale(1) contrast(1.05); }
.duotone::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  mix-blend-mode: multiply;
  background: linear-gradient(180deg,
    color-mix(in srgb, var(--color-primary) 80%, transparent),
    color-mix(in srgb, var(--color-marigold) 40%, transparent));
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `node --test tests/design-foundation.test.mjs`
Expected: PASS (3 tests).

- [ ] **Step 7: Confirm the build and existing gates still pass**

Run: `npm run check:content && npx astro check && npm run build`
Expected: content check passes; `astro check` 0 errors; build completes.

- [ ] **Step 8: Commit**

```bash
git add src/styles/global.css tests/design-foundation.test.mjs
git commit -m "feat(design): foundation tokens — display font, fluid scale, paper, reveal, duotone"
```

---

## Task 3: Preload the display font + add the scroll-reveal script

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Test: `tests/design-foundation.test.mjs`

- [ ] **Step 1: Add the failing tests**

Append to `tests/design-foundation.test.mjs`:
```js
const home = join(root, "dist", "index.html");
const html = () => {
  if (!existsSync(home)) throw new Error("dist/index.html missing — run `npm run build`");
  return readFileSync(home, "utf8");
};

test("built homepage preloads the display font", () => {
  assert.match(html(), /rel="preload"[^>]*big-shoulders-display[^>]*as="font"/);
});

test("inline reveal script honors reduced-motion and targets [data-reveal]", () => {
  const h = html();
  assert.match(h, /matchMedia\(["']\(prefers-reduced-motion: no-preference\)["']\)/);
  assert.match(h, /js-reveal/);
  assert.match(h, /\[data-reveal\]/);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run build && node --test tests/design-foundation.test.mjs`
Expected: the two new tests FAIL (no preload / no inline script yet).

- [ ] **Step 3: Import + preload the display font woff2**

In `src/layouts/BaseLayout.astro` frontmatter, after the `inter400` import (line ~6), add (use the exact filename verified in Task 1 Step 2):
```ts
import bigShoulders700 from "@fontsource/big-shoulders-display/files/big-shoulders-display-latin-700-normal.woff2?url";
```

In `<head>`, directly after the `inter400` preload `<link>` (line ~37), add:
```astro
<link rel="preload" href={bigShoulders700} as="font" type="font/woff2" crossorigin="anonymous" />
```

- [ ] **Step 4: Add the inline scroll-reveal script**

In `src/layouts/BaseLayout.astro`, replace the line `    <slot />` (inside `<body>`) with:
```astro
    <slot />
    <script is:inline>
      if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
        document.documentElement.classList.add("js-reveal");
        const obs = new IntersectionObserver((entries, o) => {
          for (const e of entries) {
            if (e.isIntersecting) { e.target.classList.add("is-visible"); o.unobserve(e.target); }
          }
        }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
        document.querySelectorAll("[data-reveal]").forEach((el) => obs.observe(el));
      }
    </script>
```
(`is:inline` keeps the script in the HTML verbatim — no bundle, no extra request — and only adds `js-reveal` when motion is allowed, so reduced-motion / JS-off users always see content.)

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm run build && node --test tests/design-foundation.test.mjs`
Expected: PASS (all design-foundation tests).

- [ ] **Step 6: Confirm gates**

Run: `npx astro check`
Expected: 0 errors.

- [ ] **Step 7: Commit**

```bash
git add src/layouts/BaseLayout.astro tests/design-foundation.test.mjs
git commit -m "feat(design): preload display font + inline reduced-motion-safe reveal script"
```

---

## Task 4: Ornament component (folk-art motifs)

**Files:**
- Create: `src/components/ui/Ornament.astro`

- [ ] **Step 1: Create the component**

Create `src/components/ui/Ornament.astro`:
```astro
---
// Decorative folk-art motifs (baseball-stitch divider, diamond tick). Inline SVG,
// no extra requests, always decorative (aria-hidden). Color via the marigold
// ornament accent. variant "watermark" (emblem) is intentionally deferred to
// Batch 2 (hero), where the raster emblem is used.
interface Props {
  variant: "stitch" | "diamond";
  class?: string;
}
const { variant, class: className } = Astro.props;
---
{variant === "stitch" && (
  <svg
    class:list={["block w-full h-3 text-marigold", className]}
    viewBox="0 0 1200 12"
    preserveAspectRatio="none"
    aria-hidden="true"
    focusable="false"
    role="presentation"
  >
    <line x1="4" y1="6" x2="1196" y2="6" stroke="currentColor" stroke-width="3"
      stroke-dasharray="14 10" stroke-linecap="round" />
  </svg>
)}
{variant === "diamond" && (
  <svg
    class:list={["block text-marigold", className]}
    width="18" height="18" viewBox="0 0 18 18"
    aria-hidden="true" focusable="false" role="presentation"
  >
    <rect x="9" y="0.5" width="11.95" height="11.95" transform="rotate(45 9 0.5)"
      fill="none" stroke="currentColor" stroke-width="2" />
  </svg>
)}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx astro check`
Expected: 0 errors. (No test yet — the component is exercised and asserted when applied in Task 7.)

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Ornament.astro
git commit -m "feat(design): Ornament component (stitch divider, diamond tick)"
```

---

## Task 5: SectionHeading component

**Files:**
- Create: `src/components/ui/SectionHeading.astro`

- [ ] **Step 1: Create the component**

Create `src/components/ui/SectionHeading.astro`:
```astro
---
import Ornament from "./Ornament.astro";
interface Props {
  eyebrow?: string;
  title: string;
  align?: "center" | "left";
  class?: string;
}
const { eyebrow, title, align = "center", class: className } = Astro.props;
const isCenter = align === "center";
---
<div class:list={[isCenter ? "text-center" : "text-left", className]}>
  {eyebrow && (
    <p class="font-heading text-sm uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
  )}
  <h2 class="font-display fluid-h1 uppercase text-primary mt-1">{title}</h2>
  <div class:list={["mt-3 w-24", isCenter && "mx-auto"]}>
    <Ornament variant="stitch" />
  </div>
</div>
```

- [ ] **Step 2: Verify it compiles**

Run: `npx astro check`
Expected: 0 errors. (Asserted when applied in Task 7.)

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/SectionHeading.astro
git commit -m "feat(design): SectionHeading component (eyebrow + display title + stitch rule)"
```

---

## Task 6: Reveal + DuotoneImage components

**Files:**
- Create: `src/components/ui/Reveal.astro`
- Create: `src/components/ui/DuotoneImage.astro`

- [ ] **Step 1: Create the Reveal wrapper**

Create `src/components/ui/Reveal.astro`:
```astro
---
// Scroll-reveal wrapper. Marks a [data-reveal] element that the inline script in
// BaseLayout fades/rises into view. Renders fully visible when JS is off or the
// user prefers reduced motion (see global.css gating).
interface Props {
  as?: string;
  delay?: number; // ms
  class?: string;
}
const { as: Tag = "div", delay = 0, class: className } = Astro.props;
const style = delay ? `--reveal-delay:${delay}ms` : undefined;
---
<Tag class:list={["reveal", className]} data-reveal {...(style ? { style } : {})}>
  <slot />
</Tag>
```

- [ ] **Step 2: Create the DuotoneImage wrapper**

Create `src/components/ui/DuotoneImage.astro`:
```astro
---
import { Image } from "astro:assets";
import type { ImageMetadata } from "astro";
// Wraps an optimized Astro image in the navy/marigold duotone treatment
// (see .duotone in global.css). Build-time only — no runtime cost.
interface Props {
  src: ImageMetadata;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  densities?: number[];
  sizes?: string;
  loading?: "lazy" | "eager";
  class?: string;
}
const { src, alt, width, height, quality, densities, sizes, loading = "lazy", class: className } = Astro.props;
---
<div class:list={["duotone", className]}>
  <Image src={src} alt={alt} width={width} height={height} quality={quality} densities={densities} sizes={sizes} loading={loading} />
</div>
```

- [ ] **Step 3: Verify both compile**

Run: `npx astro check`
Expected: 0 errors. (Asserted when applied in Task 7.)

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Reveal.astro src/components/ui/DuotoneImage.astro
git commit -m "feat(design): Reveal + DuotoneImage components"
```

---

## Task 7: Apply the foundation lightly to the homepage

**Files:**
- Modify: `src/components/Services.astro`
- Modify: `src/components/About.astro`
- Modify: `src/pages/index.astro`
- Test: `tests/design-foundation.test.mjs`

- [ ] **Step 1: Add the failing application tests**

Append to `tests/design-foundation.test.mjs`:
```js
test("Services uses SectionHeading (display title) + a stitch divider on paper", () => {
  const h = html();
  assert.match(h, /What I Coach/);
  assert.match(h, /font-display/);              // display face applied to a heading
  assert.match(h, /bg-paper/);                  // warm paper surface in use
  assert.match(h, /<svg[^>]*aria-hidden="true"[^>]*>[\s\S]*?stroke-dasharray/); // stitch
});

test("About coach photo uses the duotone treatment with explicit dimensions", () => {
  // the .duotone wrapper holds an <img> carrying width & height (no CLS)
  assert.match(html(), /class="[^"]*\bduotone\b[^"]*"[\s\S]*?<img[^>]*\bwidth="\d+"[^>]*\bheight="\d+"/);
});

test("two homepage sections are wrapped for scroll-reveal", () => {
  const count = (html().match(/data-reveal/g) || []).length;
  assert.ok(count >= 2, `expected >= 2 data-reveal sections, found ${count}`);
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm run build && node --test tests/design-foundation.test.mjs`
Expected: the three new tests FAIL.

- [ ] **Step 3: Restyle the Services heading + surface**

Replace the full contents of `src/components/Services.astro` with:
```astro
---
import ServiceCard from "./ServiceCard.astro";
import SectionHeading from "./ui/SectionHeading.astro";
import services from "../data/services.json";
---
<section id="services" class="py-20 px-4 bg-paper">
  <div class="max-w-6xl mx-auto">
    <SectionHeading eyebrow="Private Coaching" title="What I Coach" />
    <p class="text-center mt-4 text-base-content/70">Hitting lessons, fielding, throwing mechanics, and baseball IQ for players ages 8–18 across Long Beach & Orange County.</p>
    <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s) => <ServiceCard title={s.title} blurb={s.blurb} icon={s.icon} href={`/coaching/${s.slug}/`} />)}
    </div>
    <div class="text-center mt-10">
      <a href="/coaching/" class="btn btn-outline btn-primary">Explore what Coach Myles teaches</a>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Swap the About photo to DuotoneImage**

In `src/components/About.astro`:

Replace the frontmatter import line `import { Image } from "astro:assets";` with:
```ts
import DuotoneImage from "./ui/DuotoneImage.astro";
```

Replace the `<Image .../>` element (line ~8) with:
```astro
    <DuotoneImage src={coachPortrait} alt={`Coach ${site.business.coach} with two young players`} width={520} densities={[2]} quality={70} class="rounded-box shadow-xl w-full" />
```

- [ ] **Step 5: Wrap two below-the-fold sections in Reveal**

In `src/pages/index.astro`, add the import after the existing component imports (after the `Faq` import, line ~14):
```ts
import Reveal from "../components/ui/Reveal.astro";
```

Then in the `<main>` body, replace:
```astro
    <Services />
```
with:
```astro
    <Reveal><Services /></Reveal>
```
and replace:
```astro
    <Packages />
```
with:
```astro
    <Reveal><Packages /></Reveal>
```
(Hero and About stay un-wrapped — they're at/near the top of the page.)

- [ ] **Step 6: Run the application tests to verify they pass**

Run: `npm run build && node --test tests/design-foundation.test.mjs`
Expected: PASS (all design-foundation tests).

- [ ] **Step 7: Commit**

```bash
git add src/components/Services.astro src/components/About.astro src/pages/index.astro tests/design-foundation.test.mjs
git commit -m "feat(design): apply foundation to homepage (paper Services + SectionHeading, duotone About, reveal)"
```

---

## Task 8: Full verification + performance check

**Files:** none (verification only)

- [ ] **Step 1: Run the complete verify chain**

Run:
```bash
npm run check:content && npx astro check && npm run schema-check && npm test
```
Expected: content check passes; `astro check` **0 errors**; `schema-check` passes (**29 page(s)**); `node --test` **all green** (50 prior + the new `design-foundation` tests).

- [ ] **Step 2: Confirm no off-brand hex slipped into components**

Run: `npm run check:content`
Expected: "Content check passed." (Confirms the new components use tokens/utilities, not raw hex — `--color-paper`/`--color-marigold` live only in the exempt `global.css`.)

- [ ] **Step 3: Local Lighthouse / preview sanity check**

Run: `npm run preview` and open the printed URL. Spot-check the homepage on mobile + desktop:
- Display font renders on the "What I Coach" heading; no flash-of-invisible-text or layout shift.
- Services section shows the warm paper background + stitch divider under the heading.
- About photo shows the navy/marigold duotone.
- Scrolling reveals Services/Packages (and, with OS "reduce motion" on, they appear immediately).

If the lighthouse MCP is available, run `get_performance_score`, `get_accessibility_score`, and `get_core_web_vitals` against the preview URL and confirm no regression vs. the live site (target ~100; watch LCP/CLS for the new font). If LCP regresses from the display font, fall back to `font-display: optional` or drop the 800 weight.

- [ ] **Step 4: Stop the preview**

Stop the preview server when done.

---

## Done criteria

- All `design-foundation` tests pass; the full verify chain is green; Lighthouse shows no regression.
- The homepage visibly carries the new system (display heading, paper surface, stitch ornament, duotone photo, scroll-reveal) with zero content/route/schema changes.
- Ready to open the Batch 1 PR (same flow: push branch → bot review → triage → **merge only on Clay's explicit OK**, since merge = live deploy).

## Notes for the implementer

- **Do not** touch `packages.json`, routes, content collections, or `schema-check` expectations — this batch changes presentation only.
- The display-font **final choice** (Big Shoulders Display vs Anton vs Zilla Slab) is settled later on the live preview with Myles; it's a one-line swap of `--font-display` + the three `@import`s + the preload import.
- Keep marigold strictly to ornament; keep blue/white dominant.
- If any new color is needed beyond `--color-paper`, STOP and ask — the palette is locked.
