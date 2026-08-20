# Coaching Umbrella (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate the homepage "Services" + "Pitching" sections and the `/coaching/` + `/pitching/` content into one "How Coach Myles Builds an Athlete" umbrella, adding 4 new pillar pages — keeping every existing URL.

**Architecture:** Rebrand the existing `/coaching/` hub as the umbrella; a single ordered `pillars.json` drives both the homepage umbrella section and the hub grid; 4 new pillars are added to the existing `coaching` content collection (rendered by the existing `[slug].astro`); the Pitching pillar links out to `/pitching/`, whose hub gains the relocated intro + Method. Zero redirects.

**Tech Stack:** Astro 6 (content collections), Tailwind 4 + daisyUI 5, astro-icon (lucide), `node:test` against built `dist/`.

## Global Constraints

- **Zero redirects / keep every URL.** `/coaching/*` and `/pitching/*` stay exactly where they are. Display renames never change slugs.
- **Single source of truth for the pillar grid:** `src/data/pillars.json` drives both the homepage umbrella section and the `/coaching/` hub. `services.json` is retired.
- **Honesty gate (schema-enforced at build):** each new pillar page needs `lead` + ≥2 `body` + ≥3 `focus` + ≥2 `faq`.
- **New-pillar copy is draft pending Myles's sign-off** before publish — but ships complete, never a placeholder.
- **Nothing lost in the merge:** the pitching `intro` + Arsenal + "The Method" are preserved on the `/pitching/` hub before the homepage Pitching section is removed.
- **No `_headers` or `schema-check.mjs` change:** `/coaching/*` is already covered by both (no-transform + `Service`/`WebPage`/`BreadcrumbList` expectation). New pages inherit it.
- **Brand:** existing daisyUI/theme classes only — no raw hex (`check:content` fails on off-brand hex).
- **Gates before every commit:** `npm run check:content`, `npm run schema-check`, and `npm test` all green.
- **Git:** branch `feat/coaching-umbrella` off `main`; commit per task; **do NOT push or open a PR until Clay approves** (STOP-before-push). This is **Phase 1** — deep per-pillar sub-pages are a later, separate plan.

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `src/data/coaching/infield.json` | Infield pillar page content | Create |
| `src/data/coaching/outfield.json` | Outfield pillar page content | Create |
| `src/data/coaching/catching.json` | Catching pillar page content | Create |
| `src/data/coaching/baserunning.json` | Baserunning & Speed pillar page content | Create |
| `src/pages/pitching/index.astro` | Add relocated intro + The Method | Modify |
| `src/data/pillars.json` | Ordered 8-pillar grid source of truth | Create |
| `src/pages/coaching/index.astro` | Rebrand hub → umbrella; grid from pillars.json | Modify |
| `src/components/Coaching.astro` | Homepage umbrella section | Create |
| `src/pages/index.astro` | Swap Services+Pitching → Coaching umbrella | Modify |
| `src/data/site.json` | Nav: Services+Pitching → one "Coaching" | Modify |
| `src/pages/baseball-lessons/[city].astro` | Repoint `/#services` → `/coaching/` | Modify |
| `src/components/Services.astro` | Replaced by Coaching.astro | Delete |
| `src/components/Pitching.astro` | Content relocated to /pitching/ | Delete |
| `src/data/services.json` | Retired (pillars.json supersedes) | Delete |
| `scripts/check-content.mjs` | Drop `services.json` from its JSON-parse list | Modify |
| `tests/coaching-umbrella.test.mjs` | All new umbrella assertions | Create |
| `tests/coaching.test.mjs` | Drop services/arsenal-homepage deps | Modify |

The renderer `src/pages/coaching/[slug].astro` needs **no change** — it renders the 4 new collection entries automatically, and its "More of what Coach Myles teaches" section keeps `/coaching/fielding` and `/coaching/player-development` cross-linked (not orphaned).

## Setup (before Task 1)

- [ ] **Create the feature branch** (do not work on `main`):

```bash
git switch -c feat/coaching-umbrella
```

---

### Task 1: Four new pillar pages (Infield, Outfield, Catching, Baserunning)

**Files:**
- Create: `src/data/coaching/{infield,outfield,catching,baserunning}.json`
- Create: `tests/coaching-umbrella.test.mjs`

**Interfaces:**
- Produces: 4 new `coaching` collection entries at slugs `infield`, `outfield`, `catching`, `baserunning`, rendered at `/coaching/<slug>/` by the existing `[slug].astro`. Task 3's `pillars.json` links to these URLs.

- [ ] **Step 1: Write the failing test**

Create `tests/coaching-umbrella.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

// `pretest` (astro build) populates dist/ first.
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

const NEW_PILLARS = ["infield", "outfield", "catching", "baserunning"];

const LD_RE = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
function graphTypes(html) {
  const blocks = [...html.matchAll(LD_RE)].map((m) => m[1]);
  assert.equal(blocks.length, 1, "expected exactly one JSON-LD block");
  const set = new Set();
  for (const node of JSON.parse(blocks[0])["@graph"]) {
    const t = node["@type"];
    (Array.isArray(t) ? t : [t]).forEach((x) => set.add(x));
  }
  return set;
}

test("each new coaching pillar builds with Service + WebPage + BreadcrumbList", () => {
  for (const slug of NEW_PILLARS) {
    const file = join(dist, "coaching", slug, "index.html");
    assert.ok(existsSync(file), `missing /coaching/${slug}/`);
    const types = graphTypes(readFileSync(file, "utf8"));
    for (const t of ["Service", "WebPage", "BreadcrumbList", "LocalBusiness", "WebSite", "Person"]) {
      assert.ok(types.has(t), `/coaching/${slug}/ missing @type ${t}`);
    }
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run build && node --test tests/coaching-umbrella.test.mjs`
Expected: FAIL — `missing /coaching/infield/`.

- [ ] **Step 3: Create the four pillar content files**

`src/data/coaching/infield.json`:

```json
{
  "skill": "Infield",
  "icon": "lucide:grab",
  "serviceType": "Youth infield defense coaching",
  "title": "Infield Defense Coaching in Long Beach & OC | MBM",
  "description": "Private infield coaching with Coach Myles — footwork, glovework, and the throw across the diamond. Ground-ball fundamentals for players ages 8–18 in Long Beach & Orange County.",
  "h1": "Infield",
  "lead": "The infield is where games are decided on routine plays. Coach Myles builds clean footwork, soft hands, and an accurate throw across the diamond, so a player can be counted on to make the play every time it matters.",
  "body": [
    "Good infield play starts before the ball is hit. Coach Myles teaches the pre-pitch read, the first-step quickness, and the footwork that puts a fielder in position to field the ball cleanly and throw on balance. Soft, confident hands and the right glove angles turn hard chances into outs.",
    "From there it's about the throw and the situation. Accuracy across the diamond, the footwork on the double-play turn, and knowing where to go with the ball before it's hit — Coach Myles works the physical skill and the decision-making together, because an infielder has to do both in the same breath."
  ],
  "focus": [
    { "name": "Footwork & first step", "note": "Pre-pitch read and quick, balanced feet that get a fielder to the ball." },
    { "name": "Soft hands & glovework", "note": "Fielding the ball cleanly with the right glove angles, set or on the move." },
    { "name": "The throw across", "note": "An accurate, on-balance throw to first under game speed." },
    { "name": "Double plays & situations", "note": "Turning two, and knowing where the ball goes before it's hit." }
  ],
  "faq": [
    { "q": "What positions does infield coaching cover?", "a": "First, second, short, and third — the footwork, glovework, and throws each demands. Coach Myles tailors the work to where a player plays and where they want to play." },
    { "q": "My player has trouble with ground balls — can that be fixed?", "a": "Yes. Clean ground-ball fielding comes down to footwork, hand position, and reps — Coach Myles breaks it down and rebuilds the habit so routine plays become automatic." }
  ],
  "order": 6
}
```

`src/data/coaching/outfield.json`:

```json
{
  "skill": "Outfield",
  "icon": "lucide:wind",
  "serviceType": "Youth outfield defense coaching",
  "title": "Outfield Defense Coaching in Long Beach & OC | MBM",
  "description": "Private outfield coaching with Coach Myles — reads, routes, catching fly balls, and the long throw. Outfield fundamentals for players ages 8–18 in Long Beach & Orange County.",
  "h1": "Outfield",
  "lead": "An outfielder covers the most ground on the field, and the best ones make it look easy. Coach Myles coaches the jump, the route, and the throw — turning fly balls and gappers into routine outs and runners held to one base.",
  "body": [
    "It starts with the read and the first step. Coach Myles teaches outfielders to track the ball off the bat, take an efficient route, and catch on the move so they're in position to throw. Good footwork and a confident drop step turn would-be extra-base hits into outs.",
    "Then comes the arm. The crow-hop, the throw to the right base, and hitting the cutoff man are what separate an outfielder who catches the ball from one who controls the game. Coach Myles works the catch and the throw as one continuous, game-speed skill."
  ],
  "focus": [
    { "name": "Reads & jumps", "note": "Tracking the ball off the bat and getting a quick, correct first step." },
    { "name": "Routes & footwork", "note": "Efficient routes and catching on the move, in position to throw." },
    { "name": "The long throw", "note": "Crow-hop mechanics and an accurate throw with carry." },
    { "name": "Hitting the cutoff", "note": "Throwing to the right base and keeping runners from taking the extra base." }
  ],
  "faq": [
    { "q": "My player gets bad jumps on fly balls — is that coachable?", "a": "Very. Reads and jumps come from tracking the ball off the bat and trusting the first step — Coach Myles drills it until the read becomes instinct." },
    { "q": "Does outfield work include throwing?", "a": "Absolutely. The catch and the throw are coached together — the crow-hop, the long throw with carry, and hitting the cutoff man are core to the position." }
  ],
  "order": 7
}
```

`src/data/coaching/catching.json`:

```json
{
  "skill": "Catching",
  "icon": "lucide:shield-check",
  "serviceType": "Youth catching coaching",
  "title": "Catcher Coaching in Long Beach & OC | MBM",
  "description": "Private catching coaching with Coach Myles — receiving, framing, blocking, and throwing out runners. Catcher fundamentals for players ages 8–18 in Long Beach & Orange County.",
  "h1": "Catching",
  "lead": "The catcher touches every pitch and runs the field from behind the plate. Coach Myles develops the complete catcher — soft receiving, blocking, a quick release to second, and the leadership that anchors a defense.",
  "body": [
    "Receiving comes first. Coach Myles teaches a quiet, confident setup, soft hands that present strikes, and the footwork to receive and block without getting beaten. A catcher who controls the baseball gives their pitcher a strike zone and their team an edge.",
    "Then it's the throw and the game behind it. A fast, clean transfer and an accurate throw to second keep runners honest, while blocking, plate presence, and managing the game are the leadership skills that make a catcher the quarterback of the field. Coach Myles develops the body and the mind of the position together."
  ],
  "focus": [
    { "name": "Receiving & framing", "note": "A quiet setup and soft hands that present strikes and steal the edges." },
    { "name": "Blocking", "note": "Footwork and body position to keep the ball in front and runners in place." },
    { "name": "Throwing out runners", "note": "A quick transfer and an accurate, on-line throw to second." },
    { "name": "Leadership behind the plate", "note": "Managing the game, the pitcher, and the defense from the best seat on the field." }
  ],
  "faq": [
    { "q": "Is catching too demanding for younger players?", "a": "Coach Myles scales it to the age and the athlete — younger catchers build the fundamentals of receiving and blocking safely, and add the throw and game-management as they're ready." },
    { "q": "Can you help a catcher's pop time and throw to second?", "a": "Yes. A faster, cleaner transfer and footwork are the biggest levers, and Coach Myles drills them directly to make the throw to second quicker and more accurate." }
  ],
  "order": 8
}
```

`src/data/coaching/baserunning.json`:

```json
{
  "skill": "Baserunning & Speed",
  "icon": "lucide:footprints",
  "serviceType": "Youth baserunning and speed coaching",
  "title": "Baserunning & Speed Coaching in Long Beach & OC | MBM",
  "description": "Private baserunning coaching with Coach Myles — leads, reads, stealing, and smart, aggressive running. Baserunning and speed for players ages 8–18 in Long Beach & Orange County.",
  "h1": "Baserunning & Speed",
  "lead": "Baserunning is the tool that wins games when the bats go quiet. Coach Myles turns speed into runs — teaching the leads, reads, and instincts that let a player take the extra base and pressure every defense.",
  "body": [
    "Speed matters, but smart speed matters more. Coach Myles coaches the primary and secondary lead, reading the pitcher and the ball off the bat, and the jump that turns a single into a double. Good baserunners force the defense to be perfect — and most aren't.",
    "From there it's technique and decision-making: efficient turns through the bag, the right slide, when to steal, and when to hold. Coach Myles pairs straight-line speed work with the baseball IQ to use it, so a player runs the bases with both aggression and judgment."
  ],
  "focus": [
    { "name": "Leads & jumps", "note": "Primary and secondary leads, reading the pitcher, and a quick first step." },
    { "name": "Reads & instincts", "note": "Reading the ball off the bat to take the extra base with confidence." },
    { "name": "Stealing bases", "note": "The jump, the technique, and the judgment of when to go." },
    { "name": "Turns, slides & speed", "note": "Efficient turns through the bag, the right slide, and straight-line speed to use it all." }
  ],
  "faq": [
    { "q": "Can baserunning really be coached, or is it just speed?", "a": "It's mostly coachable. The best baserunners aren't always the fastest — they get great jumps, read the game, and take the extra base. Coach Myles builds those instincts alongside straight-line speed." },
    { "q": "Does this help a slower player?", "a": "Yes. Smart leads, good reads, and clean technique make any player a better baserunner regardless of raw speed — and the speed work helps on top of that." }
  ],
  "order": 9
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run build && node --test tests/coaching-umbrella.test.mjs`
Expected: PASS (1 test).

- [ ] **Step 5: Run the gates**

Run: `npm run check:content` → `Content check passed.`
Run: `npm run schema-check` → `schema-check passed (N page(s)).` (N up by 4)
Run: `npm test` → full suite green (existing + the new test).

- [ ] **Step 6: Commit**

```bash
git add src/data/coaching/ tests/coaching-umbrella.test.mjs docs/content/coaching-umbrella-spec.md docs/superpowers/plans/2026-06-25-coaching-umbrella.md
git commit -m "feat(coaching): add Infield, Outfield, Catching, Baserunning pillar pages"
```

---

### Task 2: Relocate the pitching intro + The Method onto `/pitching/`

**Files:**
- Modify: `src/pages/pitching/index.astro`
- Modify: `tests/coaching-umbrella.test.mjs`

**Interfaces:**
- Consumes: `src/data/pitching.json` (`intro`, `method[]`) — already imported nowhere in the hub yet.
- Produces: the `/pitching/` hub now carries the philosophy intro + "The Method", so removing the homepage Pitching section (Task 4) loses nothing.

- [ ] **Step 1: Write the failing test**

Append to `tests/coaching-umbrella.test.mjs`:

```js
test("/pitching/ hub carries the pitching philosophy intro and The Method", () => {
  const html = readFileSync(join(dist, "pitching", "index.html"), "utf8");
  assert.match(html, /pitching starts in the mind/, "missing relocated intro");
  assert.match(html, /The Method/, "missing The Method heading");
  assert.match(html, /Mental game first/, "missing a Method item");
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run build && node --test tests/coaching-umbrella.test.mjs`
Expected: FAIL — `missing relocated intro` (the hub doesn't carry it yet).

- [ ] **Step 3: Add the intro + Method to the pitching hub**

In `src/pages/pitching/index.astro`, add `pitching` data to the frontmatter import block (after the existing `import { abs, ... }` line):

```ts
import pitchingData from "../../data/pitching.json";
const { intro, method } = pitchingData as { intro: string; method: { title: string; blurb: string }[] };
```

Then, inside `<main id="main">`, insert an intro block immediately after the hero `</section>` (before the `<section class="bg-paper ...">` that lists the guides):

```astro
    <section class="py-16 px-4 bg-base-100">
      <div class="max-w-3xl mx-auto">
        <p class="text-lg text-base-content/80">{intro}</p>
      </div>
    </section>
```

And add a "The Method" block immediately before the closing `</main>` (after the guides `</section>`):

```astro
    <section class="py-16 px-4 bg-base-100">
      <div class="max-w-5xl mx-auto">
        <h2 class="text-xl font-heading font-bold uppercase tracking-wide text-base-content/80 text-center">The Method</h2>
        <div class="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {method.map((m) => (
            <div>
              <h3 class="font-heading font-bold text-primary">{m.title}</h3>
              <p class="mt-1 text-sm text-base-content/70">{m.blurb}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run build && node --test tests/coaching-umbrella.test.mjs`
Expected: PASS (2 tests).

- [ ] **Step 5: Gates + commit**

Run: `npm run check:content` → pass. `npm run schema-check` → pass. `npm test` → green.

```bash
git add src/pages/pitching/index.astro tests/coaching-umbrella.test.mjs
git commit -m "feat(pitching): relocate philosophy intro + The Method onto the /pitching/ hub"
```

---

### Task 3: `pillars.json` + rebrand the `/coaching/` hub as the umbrella

**Files:**
- Create: `src/data/pillars.json`
- Modify: `src/pages/coaching/index.astro`
- Modify: `tests/coaching-umbrella.test.mjs`

**Interfaces:**
- Produces: `src/data/pillars.json` — an ordered array of `{ name, blurb, icon, href }`, the single source of truth consumed by both this hub and the homepage section (Task 4).

- [ ] **Step 1: Write the failing test**

Append to `tests/coaching-umbrella.test.mjs`:

```js
const pillars = JSON.parse(readFileSync(join(root, "src", "data", "pillars.json"), "utf8"));

test("/coaching/ hub is the 'How Coach Myles Builds an Athlete' umbrella linking every pillar", () => {
  const html = readFileSync(join(dist, "coaching", "index.html"), "utf8");
  assert.match(html, /How Coach Myles Builds an Athlete/);
  assert.ok(graphTypes(html).has("CollectionPage"));
  for (const p of pillars) {
    assert.ok(html.includes(`href="${p.href}"`), `hub missing link to ${p.href}`);
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run build && node --test tests/coaching-umbrella.test.mjs`
Expected: FAIL — `pillars.json` doesn't exist yet (the import throws / file missing).

- [ ] **Step 3: Create `src/data/pillars.json`**

```json
[
  { "name": "Hitting", "blurb": "Swing mechanics, timing, and approach that carry into real at-bats.", "icon": "lucide:zap", "href": "/coaching/hitting/" },
  { "name": "Pitching", "blurb": "Mental-game-first development and a full arsenal, built to the pitcher.", "icon": "lucide:flame", "href": "/pitching/" },
  { "name": "Infield", "blurb": "Footwork, glovework, and the throw across the diamond.", "icon": "lucide:grab", "href": "/coaching/infield/" },
  { "name": "Outfield", "blurb": "Reads, routes, catching on the move, and the long throw.", "icon": "lucide:wind", "href": "/coaching/outfield/" },
  { "name": "Catching", "blurb": "Receiving, blocking, throwing out runners, and leading the defense.", "icon": "lucide:shield-check", "href": "/coaching/catching/" },
  { "name": "Throwing & Arm", "blurb": "Arm care, accuracy, and velocity through clean mechanics.", "icon": "lucide:move-up-right", "href": "/coaching/throwing-mechanics/" },
  { "name": "Baserunning & Speed", "blurb": "Leads, reads, stealing, and smart, aggressive running.", "icon": "lucide:footprints", "href": "/coaching/baserunning/" },
  { "name": "Mental Game & Baseball IQ", "blurb": "Composure, situational awareness, and decisions that win games.", "icon": "lucide:brain", "href": "/coaching/baseball-iq/" }
]
```

- [ ] **Step 4: Rebrand the hub**

Replace the entire contents of `src/pages/coaching/index.astro` with:

```astro
---
import BaseLayout from "../../layouts/BaseLayout.astro";
import Nav from "../../components/Nav.astro";
import Footer from "../../components/Footer.astro";
import Breadcrumb from "../../components/ui/Breadcrumb.astro";
import Ornament from "../../components/ui/Ornament.astro";
import Reveal from "../../components/ui/Reveal.astro";
import ServiceCard from "../../components/ServiceCard.astro";
import pillars from "../../data/pillars.json";
import { abs, collectionPageNode, breadcrumbNode, webPageIdFor, breadcrumbIdFor } from "../../data/schema";

const url = abs("/coaching/");
const title = "How Coach Myles Builds an Athlete — Baseball Coaching | MBM";
const description =
  "Hitting, pitching, infield, outfield, catching, throwing, baserunning, and the mental game — how Coach Myles develops the complete player, ages 8–18, across Long Beach & Orange County.";

const pageSchema = [
  collectionPageNode({
    url,
    name: "How Coach Myles Builds an Athlete",
    description,
    hasPart: pillars.map((p) => webPageIdFor(abs(p.href))),
    breadcrumb: breadcrumbIdFor(url),
  }),
  breadcrumbNode(url, [
    { name: "Home", item: abs("/") },
    { name: "Coaching", item: url },
  ]),
];
---
<BaseLayout title={title} description={description} pageSchema={pageSchema}>
  <Nav />
  <main id="main">
    <section class="bg-neutral text-neutral-content py-16 px-4">
      <div class="max-w-4xl mx-auto">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Coaching" }]} tone="dark" />
        <p class="mt-4 font-heading text-sm uppercase tracking-[0.25em] text-marigold">Private Coaching</p>
        <h1 class="font-display fluid-lg uppercase text-white mt-2">How Coach Myles Builds an Athlete</h1>
        <div class="mt-4 w-28"><Ornament variant="stitch" /></div>
        <p class="mt-4 text-lg text-neutral-content/85 max-w-2xl">Skills matter, but who a player becomes matters more. Coach Myles develops the whole athlete — every tool of the game, built on a foundation of confidence and the mental side. <a href="/coaching/player-development/" class="underline decoration-marigold/60 hover:text-white">See the development approach →</a></p>
      </div>
    </section>

    <section class="bg-paper py-16 px-4">
      <div class="max-w-6xl mx-auto">
        <Reveal>
          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p, i) => <ServiceCard title={p.name} blurb={p.blurb} icon={p.icon} href={p.href} index={i} />)}
          </div>
        </Reveal>
        <div class="text-center mt-10">
          <a href="/#book" class="btn btn-accent btn-lg">Claim Your Free First Lesson</a>
        </div>
      </div>
    </section>
  </main>
  <Footer />
</BaseLayout>
```

> Note: `/coaching/fielding` and `/coaching/player-development` keep their pages and URLs. They drop out of the headline pillar grid; `player-development` is linked from the hub intro above, and both stay cross-linked from every `/coaching/<slug>/` page's existing "More of what Coach Myles teaches" section.

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm run build && node --test tests/coaching-umbrella.test.mjs`
Expected: PASS (3 tests).

- [ ] **Step 6: Gates + commit**

Run: `npm run check:content` → pass. `npm run schema-check` → `schema-check passed` (the hub's `hasPart` now references the 8 pillar pages incl. `/pitching/#webpage`, all of which are built and define that `@id`). `npm test` → green.

```bash
git add src/data/pillars.json src/pages/coaching/index.astro tests/coaching-umbrella.test.mjs
git commit -m "feat(coaching): rebrand /coaching/ hub as the 'How Coach Myles Builds an Athlete' umbrella"
```

---

### Task 4: Homepage merge, nav, reference fix, and cleanup

**Files:**
- Create: `src/components/Coaching.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/data/site.json`
- Modify: `src/pages/baseball-lessons/[city].astro`
- Delete: `src/components/Services.astro`, `src/components/Pitching.astro`, `src/data/services.json`
- Modify: `scripts/check-content.mjs`, `tests/coaching-umbrella.test.mjs`, `tests/coaching.test.mjs`

**Interfaces:**
- Consumes: `src/data/pillars.json` (Task 3).

- [ ] **Step 1: Write the failing test**

Append to `tests/coaching-umbrella.test.mjs`:

```js
test("homepage shows the umbrella grid and no longer has Services/Pitching sections", () => {
  const html = readFileSync(join(dist, "index.html"), "utf8");
  assert.match(html, /How Coach Myles Builds an Athlete/, "homepage missing umbrella heading");
  for (const p of pillars) {
    assert.ok(html.includes(`href="${p.href}"`), `homepage missing pillar link ${p.href}`);
  }
  assert.doesNotMatch(html, /id="services"/, "old Services section still present");
  assert.doesNotMatch(html, /id="pitching"/, "old Pitching section still present");
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run build && node --test tests/coaching-umbrella.test.mjs`
Expected: FAIL — homepage still has `id="services"` / `id="pitching"` and no umbrella heading.

- [ ] **Step 3: Create the homepage umbrella section**

Create `src/components/Coaching.astro`:

```astro
---
import ServiceCard from "./ServiceCard.astro";
import SectionHeading from "./ui/SectionHeading.astro";
import pillars from "../data/pillars.json";
---
<section id="coaching" class="py-20 px-4 bg-paper">
  <div class="max-w-6xl mx-auto">
    <SectionHeading eyebrow="Private Coaching" title="How Coach Myles Builds an Athlete" />
    <p class="text-center mt-4 text-base-content/70 max-w-2xl mx-auto">From the swing to the mound to the bases — Coach Myles develops the complete player, one tool at a time, for ages 8–18 across Long Beach &amp; Orange County.</p>
    <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {pillars.map((p, i) => <ServiceCard title={p.name} blurb={p.blurb} icon={p.icon} href={p.href} index={i} />)}
    </div>
    <div class="text-center mt-10">
      <a href="/coaching/" class="btn btn-outline btn-primary">How Coach Myles builds an athlete</a>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Swap the homepage sections**

In `src/pages/index.astro`: remove the two imports

```astro
import Services from "../components/Services.astro";
import Pitching from "../components/Pitching.astro";
```

and add

```astro
import Coaching from "../components/Coaching.astro";
```

Then in the body, replace these two lines

```astro
    <Reveal><Services /></Reveal>
    <Reveal><Programs /></Reveal>
    <Pitching />
```

with

```astro
    <Reveal><Coaching /></Reveal>
    <Reveal><Programs /></Reveal>
```

(The Pitching homepage section is gone — its content now lives on `/pitching/`.)

- [ ] **Step 5: Update the nav**

In `src/data/site.json`, replace the two nav entries

```json
    { "label": "Services", "href": "/#services" },
    { "label": "Programs", "href": "/programs/" },
    { "label": "Pitching", "href": "/#pitching" },
```

with

```json
    { "label": "Coaching", "href": "/coaching/" },
    { "label": "Programs", "href": "/programs/" },
```

- [ ] **Step 6: Repoint the stray `/#services` link**

In `src/pages/baseball-lessons/[city].astro` (line ~112), change

```astro
          <a href="/#services" class="btn btn-lg btn-outline text-white border-white hover:bg-white hover:text-primary mt-6">See all services</a>
```

to

```astro
          <a href="/coaching/" class="btn btn-lg btn-outline text-white border-white hover:bg-white hover:text-primary mt-6">See all coaching</a>
```

- [ ] **Step 7: Drop `services.json` from the content check, then delete the retired files**

`check-content.mjs` JSON-parses a hardcoded list that includes `services.json`; deleting the file without this edit makes `check:content` fail. In `scripts/check-content.mjs` (line ~34), change:

```js
for (const f of ["site.json", "services.json", "packages.json", "testimonials.json"]) {
```

to:

```js
for (const f of ["site.json", "packages.json", "testimonials.json"]) {
```

Then delete the retired files:

```bash
git rm src/components/Services.astro src/components/Pitching.astro src/data/services.json
```

- [ ] **Step 8: Update `tests/coaching.test.mjs`**

The merge removes the "What I Coach" cards and the Arsenal from the homepage, and retires `services.json`. Replace the entire contents of `tests/coaching.test.mjs` with:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

// `pretest` (astro build) populates dist/ first.
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

const pitching = JSON.parse(readFileSync(join(root, "src", "data", "pitching.json"), "utf8"));
const pillars = JSON.parse(readFileSync(join(root, "src", "data", "pillars.json"), "utf8"));
// The pillars whose pages live under /coaching/ (Pitching links out to /pitching/).
const coachingPillars = pillars.filter((p) => p.href.startsWith("/coaching/"));

const LD_RE = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
function graphTypes(html) {
  const blocks = [...html.matchAll(LD_RE)].map((m) => m[1]);
  assert.equal(blocks.length, 1, "expected exactly one JSON-LD block");
  const set = new Set();
  for (const node of JSON.parse(blocks[0])["@graph"]) {
    const t = node["@type"];
    (Array.isArray(t) ? t : [t]).forEach((x) => set.add(x));
  }
  return set;
}

test("every coaching pillar slug resolves to a built page", () => {
  for (const p of coachingPillars) {
    const slug = p.href.replace(/^\/coaching\//, "").replace(/\/$/, "");
    assert.ok(existsSync(join(dist, "coaching", slug, "index.html")), `missing ${p.href}`);
  }
});

test("every Arsenal card slug resolves to a built pitch page", () => {
  for (const p of pitching.arsenal) {
    assert.ok(existsSync(join(dist, "pitching", p.slug, "index.html")), `missing /pitching/${p.slug}/`);
  }
});

test("each coaching pillar page carries Service + WebPage + BreadcrumbList", () => {
  for (const p of coachingPillars) {
    const slug = p.href.replace(/^\/coaching\//, "").replace(/\/$/, "");
    const types = graphTypes(readFileSync(join(dist, "coaching", slug, "index.html"), "utf8"));
    for (const t of ["Service", "WebPage", "BreadcrumbList", "LocalBusiness", "WebSite", "Person"]) {
      assert.ok(types.has(t), `/coaching/${slug}/ missing @type ${t}`);
    }
  }
});

test("coaching pages have an accessible breadcrumb with aria-current", () => {
  const html = readFileSync(join(dist, "coaching", "hitting", "index.html"), "utf8");
  assert.match(html, /<nav aria-label="Breadcrumb"/);
  assert.match(html, /aria-current="page"/);
});

test("footer nav landmarks each have a unique aria-label", () => {
  const html = readFileSync(join(dist, "index.html"), "utf8");
  const footer = html.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? "";
  const navs = [...footer.matchAll(/<nav\b([^>]*)>/g)].map((m) => m[1]);
  assert.ok(navs.length >= 4, `expected 4+ footer navs, found ${navs.length}`);
  const labels = navs.map((attrs) => attrs.match(/aria-label="([^"]+)"/)?.[1]);
  assert.ok(labels.every(Boolean), "every footer nav must have an aria-label");
  assert.equal(new Set(labels).size, labels.length, "footer nav aria-labels must be unique");
});

test("coaching hub is a CollectionPage", () => {
  const file = join(dist, "coaching", "index.html");
  assert.ok(existsSync(file), "missing /coaching/ hub");
  assert.ok(graphTypes(readFileSync(file, "utf8")).has("CollectionPage"));
});
```

- [ ] **Step 9: Run the tests to verify they pass**

Run: `npm run build && node --test tests/coaching-umbrella.test.mjs tests/coaching.test.mjs`
Expected: PASS — umbrella suite (4 tests) + coaching suite all green.

- [ ] **Step 10: Run the full gate suite**

Run: `npm run check:content` → `Content check passed.` (the `/#services` nav anchor is gone; `/coaching/` is a path, not an anchor, so the anchor check is satisfied.)
Run: `npm run schema-check` → `schema-check passed`.
Run: `npm test` → full suite green.

- [ ] **Step 11: Commit**

```bash
git add src/components/Coaching.astro src/pages/index.astro src/data/site.json src/pages/baseball-lessons/ scripts/check-content.mjs tests/coaching-umbrella.test.mjs tests/coaching.test.mjs
git commit -m "feat(coaching): merge homepage Services + Pitching into one umbrella; retire services.json"
```

> The `git rm` from Step 7 already stages the three deletions; this `git add` stages the rest. (`baseball-lessons/` is added as a directory to dodge the `[city].astro` bracket-glob.)

---

## Final verification (after all tasks)

- [ ] Clean run of the whole gate suite:

```bash
npm run check:content && npm run schema-check && npm test
```

Expected: `Content check passed.`, `schema-check passed (N page(s)).`, full `node --test` suite green.

- [ ] **Manual spot-check** (`npm run preview`, or the deploy preview): homepage shows ONE "How Coach Myles Builds an Athlete" grid (8 pillars) + the Programs band-picker; nav reads About · **Coaching** · Programs · Packages · Book · FAQ · Contact; `/coaching/` is the umbrella; `/pitching/` shows the intro + Arsenal + Method; `/coaching/{infield,outfield,catching,baserunning}/` all load; `/coaching/fielding/` and `/coaching/player-development/` still load (no orphans).

- [ ] **Stop. Do not push or open a PR.** Report to Clay. On approval: PR to `main` (Cloudflare auto-deploys) + IndexNow-ping (the 4 new `/coaching/*` URLs). Copy is draft pending Myles's sign-off.

## Out of scope (deferred)

- **Phase 2:** each pillar's Arsenal-style deep sub-pages, from Myles's actual teaching, one pillar at a time (separate spec/plan).
- **Page-title renames** for Throwing Mechanics → "Throwing & Arm" and Baseball IQ → "Mental Game & Baseball IQ": the rename is applied to the **grid label** (`pillars.json`) only; the underlying pages keep their current H1/title to avoid touching live indexed titles. Aligning the page H1s is an easy Myles-driven follow-up if wanted.

## Self-review notes

- **Spec coverage:** §3 pillar set → Task 1 (4 new) + Task 3 (`pillars.json` covers all 8); §4 IA / single source → Task 3; §5 four structural changes → hub (Task 3), homepage merge (Task 4), nav (Task 4), 4 new pages (Task 1); §6 content preservation → Task 2 (intro+Method) + the `/#services` repoint (Task 4 Step 6); §7 honesty gate → Task 1 content; §8 SEO/no-redirects/no-gate-change → constraints + Task 4; §9 testing incl. the broken existing tests → Task 4 Step 8. No uncovered requirement.
- **Placeholder scan:** none — all content/code/tests are complete.
- **Hidden consumer check (grep-verified):** the only consumers of the deleted files are `index.astro` (Services/Pitching imports — Task 4), `Services.astro`/`Pitching.astro` themselves, and `check-content.mjs:34` which JSON-parses `services.json` (fixed in Task 4 Step 7). `Footer.astro` does NOT read `services.json`; `pitching.json` survives for the `/pitching/` hub (Task 2). One stale comment remains at `content.config.ts:53` ("mirrors services.json") — cosmetic, left as-is.
- **Type/name consistency:** `pillars.json` field names (`name`/`blurb`/`icon`/`href`) are used identically in the hub (Task 3), the homepage section (Task 4), and both test files; new pillar slugs (`infield`/`outfield`/`catching`/`baserunning`) match between the data files, `pillars.json` hrefs, and the tests.
