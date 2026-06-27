# Programs by Age — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four age-band "program" pages (8–10, 11–13, 14–15, 16–18) plus a hub, sourced from Coach Myles's own per-stage framework, mirroring the existing `/coaching/` content-collection machine.

**Architecture:** A new Astro content collection (`programs`) loads one JSON file per band from `src/data/programs/`. A `[slug].astro` renderer + an `index.astro` hub generate the routes; the Zod schema's `.min()` constraints are the build-time honesty gate. Discovery is a "Programs" nav entry + a homepage band-picker component. Each detail page emits Service + WebPage + BreadcrumbList JSON-LD (Service carries a `PeopleAudience` age range); the hub emits CollectionPage.

**Tech Stack:** Astro 6 (content collections, `glob` loader, `astro:assets`), Tailwind 4 + daisyUI 5, `astro-icon` (lucide), `node:test` against built `dist/`.

## Global Constraints

- **Node** `>=22.12.0`; **Astro** `^6.4.6` (content-layer collections via `glob` loader).
- **Locked slugs:** `foundations`, `pre-high-school`, `high-school-prep`, `college-prep`.
- **Nav:** add `{ "label": "Programs", "href": "/programs/" }` to `site.json` `nav`, immediately **after** "Services".
- **Honesty gate (schema-enforced at `astro build`):** each band needs `lead` + ≥2 `body` paragraphs + ≥3 `focus` items + ≥2 `faq`. No thin page can ship.
- **Structured data:** every detail page MUST carry `Service` + `WebPage` + `BreadcrumbList` (plus the global `LocalBusiness`/`WebSite`/`Person`); the hub MUST carry `CollectionPage` + `BreadcrumbList`. NEVER emit `FAQPage`, `Review`, `AggregateRating`, or `ProfessionalService` — `schema-check.mjs` forbids them. New routes MUST be registered in `expectedExtra()`.
- **Brand:** use only existing daisyUI/theme utility classes (`marigold`, `accent`, `primary`, `neutral`, `paper`, `base-*`, `white`). NO raw hex literals — `check:content` fails the build on off-brand hex.
- **Voice:** parent-facing, third-person "Coach Myles", honest, no over-claiming. The page copy below is **draft pending Myles's sign-off before publish** (the same gate the pitch posts use) — but it must ship complete, never as a placeholder.
- **Images:** solid-navy fallback hero only; NO photos in v1 (resolved decision: ship fallbacks now, add real photos later).
- **Gates before every commit:** `npm run check:content`, `npm run schema-check`, and `npm test` must all pass.
- **Git:** work on branch `feat/programs-age-pages`; commit per task; **do NOT push or open a PR until Clay approves** (STOP-before-push convention).

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `src/content.config.ts` | Register the `programs` collection + schema (honesty gate) | Modify |
| `src/data/programs/foundations.json` | 8–10 band content | Create |
| `src/data/programs/pre-high-school.json` | 11–13 band content | Create |
| `src/data/programs/high-school-prep.json` | 14–15 band content | Create |
| `src/data/programs/college-prep.json` | 16–18 band content | Create |
| `src/pages/programs/[slug].astro` | Per-band detail renderer | Create |
| `src/pages/programs/index.astro` | Programs hub | Create |
| `scripts/schema-check.mjs` | Register `/programs/` routes in the structured-data gate | Modify |
| `src/components/Programs.astro` | Homepage "Find your player's stage" band-picker | Create |
| `src/data/site.json` | Add "Programs" nav entry | Modify |
| `src/pages/index.astro` | Insert `<Programs />` after `<Services />` | Modify |
| `src/data/schema.ts` | Add optional `audience` passthrough to `serviceNode` | Modify |
| `tests/programs.test.mjs` | Build-output assertions for the whole section | Create |

The Astro `@astrojs/sitemap` integration auto-includes the new routes; no sitemap edit needed.

## Setup (before Task 1)

- [ ] **Create the feature branch** (do not work on `main`):

```bash
git switch -c feat/programs-age-pages
```

---

### Task 1: Programs section (collection + data + renderer + hub + schema-check)

**Files:**
- Create: `tests/programs.test.mjs`
- Modify: `src/content.config.ts:87` (the `collections` export) + add the `programs` collection
- Create: `src/data/programs/{foundations,pre-high-school,high-school-prep,college-prep}.json`
- Create: `src/pages/programs/[slug].astro`
- Create: `src/pages/programs/index.astro`
- Modify: `scripts/schema-check.mjs:50` (register `/programs/` in `expectedExtra()`)

**Interfaces:**
- Produces: a `programs` collection whose entries expose `data.{name,band,ageMin,ageMax,icon,serviceType,title,description,goal,lead,body[],focus[{name,note?}],mentalGame,preparingFor,nextSlug?,faq[{q,a}],order}` and `id` (= filename slug). Tasks 2 and 3 consume `getCollection("programs")` and `data.ageMin`/`data.ageMax`.

- [ ] **Step 1: Write the failing test**

Create `tests/programs.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

// `pretest` (astro build) populates dist/ first. These assert the built
// programs section mirrors the coaching section's guarantees.
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

// The four age-band slugs (see docs/content/programs-age-pages-spec.md).
const SLUGS = ["foundations", "pre-high-school", "high-school-prep", "college-prep"];

const LD_RE = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
function graph(html) {
  const blocks = [...html.matchAll(LD_RE)].map((m) => m[1]);
  assert.equal(blocks.length, 1, "expected exactly one JSON-LD block");
  return JSON.parse(blocks[0])["@graph"];
}
function graphTypes(html) {
  const set = new Set();
  for (const node of graph(html)) {
    const t = node["@type"];
    (Array.isArray(t) ? t : [t]).forEach((x) => set.add(x));
  }
  return set;
}

test("every program band builds to /programs/<slug>/", () => {
  for (const slug of SLUGS) {
    assert.ok(existsSync(join(dist, "programs", slug, "index.html")), `missing /programs/${slug}/`);
  }
});

test("each program page carries Service + WebPage + BreadcrumbList", () => {
  for (const slug of SLUGS) {
    const types = graphTypes(readFileSync(join(dist, "programs", slug, "index.html"), "utf8"));
    for (const t of ["Service", "WebPage", "BreadcrumbList", "LocalBusiness", "WebSite", "Person"]) {
      assert.ok(types.has(t), `/programs/${slug}/ missing @type ${t}`);
    }
  }
});

test("programs hub is a CollectionPage", () => {
  const file = join(dist, "programs", "index.html");
  assert.ok(existsSync(file), "missing /programs/ hub");
  assert.ok(graphTypes(readFileSync(file, "utf8")).has("CollectionPage"));
});

test("program pages have an accessible breadcrumb with aria-current", () => {
  const html = readFileSync(join(dist, "programs", "foundations", "index.html"), "utf8");
  assert.match(html, /<nav aria-label="Breadcrumb"/);
  assert.match(html, /aria-current="page"/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run build && node --test tests/programs.test.mjs`
Expected: FAIL — `missing /programs/foundations/` (the routes don't exist yet).

- [ ] **Step 3: Register the `programs` collection**

In `src/content.config.ts`, add this collection definition just above the `export const collections` line:

```ts
// Programs by age — docs/content/programs-age-pages-spec.md. One JSON file per
// age band, served at /programs/<slug>. Same honesty gate as `coaching`:
// lead + 2+ body + 3+ focus + 2+ FAQ, so no thin stage page can ship.
const programs = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/data/programs" }),
  schema: z.object({
    name: z.string(),            // short page name, e.g. "Foundations"
    band: z.string(),            // age display, e.g. "Ages 8–10"
    ageMin: z.number(),
    ageMax: z.number(),
    icon: z.string(),            // lucide icon
    serviceType: z.string(),     // schema.org Service.serviceType
    title: z.string(),           // SEO <title>
    description: z.string(),     // meta description
    goal: z.string(),            // hero subhead one-liner
    lead: z.string(),            // intro paragraph
    body: z.array(z.string()).min(2),
    focus: z.array(z.object({ name: z.string(), note: z.string().optional() })).min(3),
    mentalGame: z.string(),      // the stage-specific mental-game block
    preparingFor: z.string(),    // "what's next" bridge copy
    nextSlug: z.string().optional(), // slug of the next band up
    faq: z.array(z.object({ q: z.string(), a: z.string() })).min(2),
    order: z.number().default(99),
  }),
});
```

Then change the export line:

```ts
export const collections = { pitches, locations, coaching, packagePages, programs };
```

- [ ] **Step 4: Create the four band data files**

`src/data/programs/foundations.json`:

```json
{
  "name": "Foundations",
  "band": "Ages 8–10",
  "ageMin": 8,
  "ageMax": 10,
  "icon": "lucide:sprout",
  "serviceType": "Youth baseball fundamentals coaching (ages 8–10)",
  "title": "Youth Baseball Training Ages 8–10 (Foundations) | MBM Long Beach & OC",
  "description": "Private baseball training for ages 8–10 in Long Beach & Orange County. Coach Myles builds clean mechanics, real confidence, and a love for the game — fundamentals first, fun always.",
  "goal": "Clean mechanics, real confidence, and a love for the game that lasts.",
  "lead": "The early years set the tone for everything that follows. Coach Myles builds a rock-solid foundation — sound mechanics, growing confidence, and genuine fun — so young players fall in love with the game while they learn to play it the right way.",
  "body": [
    "At this age, how a player feels about baseball matters as much as how they swing. Coach Myles keeps sessions positive and high-energy, teaching the fundamentals of hitting, throwing, and fielding through reps that feel like play, not work. Good habits built now are the ones that hold up for years.",
    "Every young athlete is in a different place, so the coaching meets them where they are — sharpening the skills they already have and carefully adding new ones at a pace that builds confidence instead of frustration. The goal isn't a perfect nine-year-old; it's a player who trusts themselves and wants to come back tomorrow."
  ],
  "focus": [
    { "name": "Sound mechanics from day one", "note": "Hitting, throwing, and fielding taught the right way, before bad habits form." },
    { "name": "Confidence through small wins", "note": "Reps scaled so a player succeeds, then stretches — belief built on real ability." },
    { "name": "Fundamentals made fun", "note": "High-energy sessions that keep young players loving the game while they learn." },
    { "name": "Athletic basics", "note": "Balance, coordination, and body control that carry across every part of the game." }
  ],
  "mentalGame": "There's no pressure to manufacture at this age — just a focus on effort, attitude, and bouncing back from a missed ball with a smile. Coach Myles models the mindset that makes the later stages possible: mistakes are how you learn, and the next rep is always the one that counts.",
  "preparingFor": "As players approach 11, the work shifts from building habits to refining them — ironing out the quirks that would hold them back at the next level. That's the Pre-High-School stage.",
  "nextSlug": "pre-high-school",
  "faq": [
    { "q": "Is 8 too young for private baseball lessons?", "a": "Not at all. The early years are when clean mechanics and confidence are easiest to build — Coach Myles keeps it fun and age-appropriate, so young players grow without pressure." },
    { "q": "Will my child be pushed too hard?", "a": "No. Sessions at this age are positive and energy-first. The aim is a player who loves the game and trusts their ability, not a burned-out nine-year-old." }
  ],
  "order": 1
}
```

`src/data/programs/pre-high-school.json`:

```json
{
  "name": "Pre-High-School Prep",
  "band": "Ages 11–13",
  "ageMin": 11,
  "ageMax": 13,
  "icon": "lucide:wrench",
  "serviceType": "Youth baseball development coaching (ages 11–13)",
  "title": "Baseball Training Ages 11–13 (Pre-High-School Prep) | MBM Long Beach & OC",
  "description": "Private baseball training for ages 11–13 in Long Beach & Orange County. Coach Myles breaks bad habits, sharpens fundamentals, and introduces the mental game to get players ready for high school.",
  "goal": "Break the habits holding them back — and get ready for high school ball.",
  "lead": "The years before high school are where good players either level up or get stuck. Coach Myles finds the habits and gaps that will hold a player back at the next level and fixes them now — while sharpening fundamentals and introducing the mental side of the game.",
  "body": [
    "By 11 or 12, most players have picked up a few habits that worked in Little League but won't survive faster pitching and tougher competition. This stage is about honest diagnosis and patient correction — cleaning up the swing, the throw, or the footwork that would otherwise cap a player's ceiling in high school.",
    "It's also where the mental game enters the picture. Coach Myles starts building the habits of preparation, focus, and composure that the older stages lean on heavily — so that when the pressure of high school baseball arrives, the foundation is already there."
  ],
  "focus": [
    { "name": "Breaking bad habits", "note": "Honest diagnosis and patient correction of the mechanics that cap a player's ceiling." },
    { "name": "Sharper fundamentals", "note": "Hitting, fielding, and throwing refined for faster, more competitive play." },
    { "name": "Intro to the mental game", "note": "Preparation, focus, and composure — the habits the high-school years demand." },
    { "name": "Bridging to the next level", "note": "Targeted work on exactly what it takes to make the jump to high school ball." }
  ],
  "mentalGame": "This is where the mental game begins in earnest. Coach Myles teaches players to prepare with intention, stay composed when a rep goes wrong, and take ownership of their development — the groundwork for everything the high-school and college stages will ask of them.",
  "preparingFor": "At 14, the game gets real — tryouts, at-bats that count, and the daily grind of high-school baseball. That's the High School Prep stage.",
  "nextSlug": "high-school-prep",
  "faq": [
    { "q": "My child has some bad habits — is it too late to fix them?", "a": "No, and now is the ideal time. Correcting mechanics before high school is far easier than unlearning them later against faster pitching. Coach Myles diagnoses honestly and fixes patiently." },
    { "q": "Should an 11–13 year old really work on the mental game?", "a": "Yes — in age-appropriate doses. Building preparation, focus, and composure now means they aren't learning those skills for the first time under the pressure of high-school ball." }
  ],
  "order": 2
}
```

`src/data/programs/high-school-prep.json`:

```json
{
  "name": "High School Prep",
  "band": "Ages 14–15",
  "ageMin": 14,
  "ageMax": 15,
  "icon": "lucide:flame",
  "serviceType": "High school baseball preparation coaching (ages 14–15)",
  "title": "High School Baseball Prep Training Ages 14–15 | MBM Long Beach & OC",
  "description": "Private high-school baseball prep for ages 14–15 in Long Beach & Orange County. Coach Myles sharpens at-bats, builds mental toughness, and develops players aggressive on offense and defense.",
  "goal": "Compete and earn your spot — sharp at the plate, aggressive in the field, tough between the ears.",
  "lead": "High school baseball is a different game — faster, more competitive, and far more demanding mentally. Coach Myles prepares players for it directly: quality at-bats, an aggressive approach on both sides of the ball, and the mental toughness to handle the inevitable ups and downs of a long season.",
  "body": [
    "At this stage the work gets specific to performing under real competition. Coach Myles sharpens at-bats — approach, pitch selection, and the ability to make adjustments — and builds an aggressive, confident mindset on offense and defense. The aim is a player who competes for a spot and contributes once they have it.",
    "Just as important is learning to handle baseball's grind. Good days and bad days come fast in high school ball, and the players who last are the ones who can grind through a slump, shake off an error, and show up the next day ready to work. That resilience is coached here as deliberately as any swing."
  ],
  "focus": [
    { "name": "Quality at-bats", "note": "Approach, pitch selection, and in-game adjustments against real competition." },
    { "name": "Aggressive on both sides", "note": "A confident, attacking mindset on offense and defense alike." },
    { "name": "Mental toughness", "note": "Handling the stress of good and bad days across a long high-school season." },
    { "name": "Grinding through struggle", "note": "Bouncing back from slumps and errors — the resilience high-school ball demands." }
  ],
  "mentalGame": "The mental game moves to center stage here. Coach Myles coaches players through the emotional swings of competitive baseball — the slump, the error, the bad call — so they learn to compete with a clear head and a short memory. This is the toughness that separates the players who make the jump from those who don't.",
  "preparingFor": "For players with college aspirations, 16–18 is where it gets serious — mostly mental, finely tuned, and aimed squarely at the next level. That's the College & Pro Prep stage.",
  "nextSlug": "college-prep",
  "faq": [
    { "q": "Does this help my player make the high-school team?", "a": "That's the goal. Coach Myles prepares players for exactly what tryouts and high-school competition demand — sharper at-bats, an aggressive two-way game, and the mental toughness to perform when it counts." },
    { "q": "My player struggles after a bad game — can that be coached?", "a": "Absolutely. Handling the highs and lows of a season is a core part of this stage. Coach Myles builds the resilience to grind through slumps and bounce back, which is often what separates players at this level." }
  ],
  "order": 3
}
```

`src/data/programs/college-prep.json` (note: no `nextSlug` — this is the top band):

```json
{
  "name": "College & Pro Prep",
  "band": "Ages 16–18",
  "ageMin": 16,
  "ageMax": 18,
  "icon": "lucide:graduation-cap",
  "serviceType": "College baseball preparation coaching (ages 16–18)",
  "title": "College Baseball Prep Training Ages 16–18 | MBM Long Beach & OC",
  "description": "Private college baseball prep for ages 16–18 in Long Beach & Orange County. Coach Myles develops the mental game and fine-tuned mechanics to get players college- and pro-ready.",
  "goal": "Get college- and pro-ready — mostly mental, finely tuned, no wasted reps.",
  "lead": "These are the years that decide where a player's game can take them. Coach Myles trains 16–18 year-olds for the next level — a college-caliber mental game paired with fine-tuned mechanics — with one aim: getting them as college- and pro-ready as their work will allow.",
  "body": [
    "By this age the big mechanical pieces are in place, so the work turns to fine-tuning — the small, specific adjustments that separate a high-school contributor from a college recruit. Every rep has a purpose, and the standard is the level these players are chasing, not the one they're at.",
    "Above all, this stage is mental. College and pro baseball are won between the ears — preparation, routine, composure under real pressure, and the confidence to compete with anyone. Coach Myles, a former semi-pro, coaches that mindset directly, drawing on what the next level actually demands."
  ],
  "focus": [
    { "name": "A college-caliber mental game", "note": "Preparation, routine, and composure under real pressure — where the next level is won." },
    { "name": "Fine-tuned mechanics", "note": "The small, specific adjustments that separate a contributor from a recruit." },
    { "name": "Purposeful reps", "note": "Every rep aimed at the standard these players are chasing — no wasted work." },
    { "name": "Competing at the next level", "note": "The confidence and approach to compete with anyone, drawn from a former semi-pro's experience." }
  ],
  "mentalGame": "At this level the mental game is the game. Coach Myles trains the routines, focus, and composure that hold up under recruiting pressure and college-caliber competition — the difference-maker once everyone can field and hit. It's the throughline of every MBM stage, and here it takes the lead.",
  "preparingFor": "From here it's about the next level itself — college rosters and pro looks. Coach Myles trains players to a standard built to give them their best possible shot at it.",
  "faq": [
    { "q": "Can Coach Myles help with college recruiting readiness?", "a": "Yes. The 16–18 stage is built around getting players college- and pro-ready — a college-caliber mental game plus fine-tuned mechanics, trained to the standard the next level demands." },
    { "q": "How much of this is mental versus mechanical?", "a": "Mostly mental. The mechanical foundation is fine-tuned rather than rebuilt at this age; the bigger gains come from preparation, routine, and composure under pressure — what actually separates players at the college and pro level." }
  ],
  "order": 4
}
```

- [ ] **Step 5: Create the detail renderer**

Create `src/pages/programs/[slug].astro`:

```astro
---
import { getCollection } from "astro:content";
import { Icon } from "astro-icon/components";
import BaseLayout from "../../layouts/BaseLayout.astro";
import Nav from "../../components/Nav.astro";
import Footer from "../../components/Footer.astro";
import { abs, serviceNode, webPageNode, breadcrumbNode, serviceIdFor, breadcrumbIdFor } from "../../data/schema";
import Breadcrumb from "../../components/ui/Breadcrumb.astro";
import Ornament from "../../components/ui/Ornament.astro";
import Reveal from "../../components/ui/Reveal.astro";
import SectionHeading from "../../components/ui/SectionHeading.astro";

export async function getStaticPaths() {
  const all = (await getCollection("programs")).sort((a, b) => a.data.order - b.data.order);
  return all.map((entry) => ({ params: { slug: entry.id }, props: { entry, all } }));
}

const { entry, all } = Astro.props;
const d = entry.data;
const url = abs(`/programs/${entry.id}/`);
const next = d.nextSlug ? all.find((e) => e.id === d.nextSlug) : undefined;

// Per-route nodes: Service (the offering) + WebPage (about the Service) +
// BreadcrumbList. Global LocalBusiness/WebSite/Person come from StructuredData.
const pageSchema = [
  serviceNode({
    url,
    name: `${d.name} — Baseball Training`,
    serviceType: d.serviceType,
    description: d.description,
  }),
  webPageNode({
    url,
    name: d.title,
    description: d.description,
    about: serviceIdFor(url),
    breadcrumb: breadcrumbIdFor(url),
  }),
  breadcrumbNode(url, [
    { name: "Home", item: abs("/") },
    { name: "Programs", item: abs("/programs/") },
    { name: d.name, item: url },
  ]),
];
---
<BaseLayout title={d.title} description={d.description} pageSchema={pageSchema}>
  <Nav />
  <main id="main">
    <section class="relative overflow-hidden bg-neutral text-neutral-content py-16 px-4">
      <div class="relative z-10 max-w-4xl mx-auto">
        <Breadcrumb items={[{label:"Home",href:"/"}, {label:"Programs", href:"/programs/"}, {label:d.name}]} tone="dark" />
        <p class="mt-4 font-heading text-sm uppercase tracking-[0.25em] text-marigold">Programs by Age · {d.band}</p>
        <div class="mt-2 flex items-center gap-3">
          <Icon name={d.icon} class="w-9 h-9 text-accent" aria-hidden="true" />
          <h1 class="font-display fluid-lg uppercase text-white">{d.name}</h1>
        </div>
        <div class="mt-4 w-28"><Ornament variant="stitch" /></div>
        <p class="mt-4 text-lg text-neutral-content/85 max-w-2xl">{d.goal}</p>
        <div class="mt-6 flex flex-wrap gap-3">
          <a href="/#book" class="btn btn-accent btn-lg">Claim Your Free First Lesson</a>
          <a href="/#packages" class="btn btn-lg btn-outline text-white border-white hover:bg-white hover:text-primary">View Packages</a>
        </div>
      </div>
    </section>

    <section class="py-16 px-4 bg-base-100">
      <div class="max-w-3xl mx-auto prose prose-headings:font-heading prose-headings:text-primary prose-a:text-primary">
        <p class="text-lg">{d.lead}</p>
        {d.body.map((p) => <p>{p}</p>)}
      </div>
    </section>

    <section class="py-16 px-4 bg-paper">
      <div class="max-w-3xl mx-auto">
        <SectionHeading eyebrow="The Work" title="What we focus on at this stage" align="left" />
        <Reveal>
          <ul class="mt-6 grid sm:grid-cols-2 gap-3">
            {d.focus.map((f) => (
              <li class="card bg-base-100 p-4">
                <p class="font-semibold text-primary">{f.name}</p>
                {f.note && <p class="text-sm text-base-content/70 mt-1">{f.note}</p>}
              </li>
            ))}
          </ul>
          <p class="mt-6 text-sm text-base-content/60">Every session is built around your player — Coach Myles travels to you across Long Beach &amp; Orange County.</p>
        </Reveal>
      </div>
    </section>

    <section class="py-16 px-4 bg-base-100">
      <div class="max-w-3xl mx-auto">
        <SectionHeading eyebrow="The Mental Game" title="Mindset at this stage" align="left" />
        <p class="mt-6 text-lg text-base-content/80">{d.mentalGame}</p>
      </div>
    </section>

    <section class="py-16 px-4 bg-paper">
      <div class="max-w-3xl mx-auto">
        <SectionHeading eyebrow="What's Next" title="Where this leads" align="left" />
        <p class="mt-6 text-lg text-base-content/80">{d.preparingFor}</p>
        <div class="mt-6 flex flex-wrap gap-3">
          {next ? (
            <a href={`/programs/${next.id}/`} class="btn btn-primary">Next: {next.data.name} →</a>
          ) : (
            <a href="/#book" class="btn btn-accent">Claim Your Free First Lesson</a>
          )}
          <a href="/programs/" class="btn btn-outline btn-primary">All Programs</a>
        </div>
      </div>
    </section>

    {d.faq.length > 0 && (
      <section class="py-16 px-4 bg-base-100">
        <div class="max-w-3xl mx-auto">
          <SectionHeading eyebrow="Common Questions" title={`${d.name} — Common Questions`} align="center" />
          <Reveal>
            <div class="mt-8 space-y-3">
              {d.faq.map((f) => (
                <details class="collapse collapse-arrow bg-base-200" name="programs-faq">
                  <summary class="collapse-title text-lg font-semibold">{f.q}</summary>
                  <div class="collapse-content"><p class="text-base-content/80">{f.a}</p></div>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    )}
  </main>
  <Footer />
</BaseLayout>
```

- [ ] **Step 6: Create the hub**

Create `src/pages/programs/index.astro`:

```astro
---
import { getCollection } from "astro:content";
import { Icon } from "astro-icon/components";
import BaseLayout from "../../layouts/BaseLayout.astro";
import Nav from "../../components/Nav.astro";
import Footer from "../../components/Footer.astro";
import Breadcrumb from "../../components/ui/Breadcrumb.astro";
import Ornament from "../../components/ui/Ornament.astro";
import Reveal from "../../components/ui/Reveal.astro";
import { abs, collectionPageNode, breadcrumbNode, webPageIdFor, breadcrumbIdFor } from "../../data/schema";

const bands = (await getCollection("programs")).sort((a, b) => a.data.order - b.data.order);
const url = abs("/programs/");
const title = "Baseball Training by Age — Programs for Ages 8–18 | MBM";
const description =
  "Age-specific baseball training with Coach Myles — from Foundations (8–10) to College & Pro Prep (16–18) across Long Beach & Orange County. Find your player's stage.";

const pageSchema = [
  collectionPageNode({
    url,
    name: "Baseball Training Programs by Age",
    description,
    hasPart: bands.map((b) => webPageIdFor(abs(`/programs/${b.id}/`))),
    breadcrumb: breadcrumbIdFor(url),
  }),
  breadcrumbNode(url, [
    { name: "Home", item: abs("/") },
    { name: "Programs", item: url },
  ]),
];
---
<BaseLayout title={title} description={description} pageSchema={pageSchema}>
  <Nav />
  <main id="main">
    <section class="bg-neutral text-neutral-content py-16 px-4">
      <div class="max-w-4xl mx-auto">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Programs" }]} tone="dark" />
        <p class="mt-4 font-heading text-sm uppercase tracking-[0.25em] text-marigold">Programs by Age</p>
        <h1 class="font-display fluid-lg uppercase text-white mt-2">Baseball Training by Age</h1>
        <div class="mt-4 w-28"><Ornament variant="stitch" /></div>
        <p class="mt-4 text-lg text-neutral-content/85 max-w-2xl">{description}</p>
      </div>
    </section>

    <section class="bg-paper py-16 px-4">
      <div class="max-w-4xl mx-auto">
        <Reveal>
          <div class="grid sm:grid-cols-2 gap-4">
            {bands.map((b, i) => (
              <a href={`/programs/${b.id}/`} class="group relative block overflow-hidden rounded-box border border-base-300 bg-base-100 p-6 transition-all hover:-translate-y-1 hover:border-marigold/60 hover:shadow-lg">
                <span aria-hidden="true" class="absolute right-4 top-4 text-marigold"><Ornament variant="diamond" class="w-3.5 h-3.5" /></span>
                <span aria-hidden="true" class="font-display text-base-content/15 text-3xl leading-none">{String(i + 1).padStart(2, "0")}</span>
                <Icon name={b.data.icon} class="w-9 h-9 text-accent mt-2" aria-hidden="true" />
                <p class="mt-2 font-heading text-sm uppercase tracking-[0.2em] text-accent">{b.data.band}</p>
                <h2 class="mt-1 text-xl font-heading font-bold text-primary uppercase">{b.data.name}</h2>
                <p class="mt-2 text-sm text-base-content/70">{b.data.goal}</p>
                <span class="mt-3 inline-block text-sm font-semibold text-primary opacity-80 transition-opacity group-hover:opacity-100">Learn more →</span>
              </a>
            ))}
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

- [ ] **Step 7: Register `/programs/` in the schema-check gate**

In `scripts/schema-check.mjs`, inside `expectedExtra()`, add the two `programs` lines immediately after the coaching block (the lines matching `coaching/index.html` and `^coaching\/...`):

```js
  // Programs by age: /programs/ hub + /programs/<slug>/
  if (p === "programs/index.html") return ["CollectionPage", "BreadcrumbList"];
  if (/^programs\/[^/]+\/index\.html$/.test(p)) return ["Service", "WebPage", "BreadcrumbList"];
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npm run build && node --test tests/programs.test.mjs`
Expected: PASS (4 tests).

- [ ] **Step 9: Run the full gate suite**

Run: `npm run check:content`
Expected: `Content check passed.`

Run: `npm run schema-check`
Expected: `schema-check passed (N page(s)).` (N increased by 5: hub + 4 bands)

Run: `npm test`
Expected: all tests pass (the existing suite + the 4 new program tests).

- [ ] **Step 10: Commit**

```bash
git add src/content.config.ts src/data/programs/ src/pages/programs/ scripts/schema-check.mjs tests/programs.test.mjs docs/content/programs-age-pages-spec.md docs/superpowers/plans/2026-06-25-programs-age-pages.md
git commit -m "feat(programs): age-band program pages (8-10, 11-13, 14-15, 16-18) + hub"
```

---

### Task 2: Discovery — nav entry + homepage band-picker

**Files:**
- Modify: `tests/programs.test.mjs` (append two tests)
- Modify: `src/data/site.json:18` (add "Programs" nav item after "Services")
- Create: `src/components/Programs.astro`
- Modify: `src/pages/index.astro:40` (import + render `<Programs />` after `<Services />`)

**Interfaces:**
- Consumes: `getCollection("programs")` and each entry's `data.{name,band,icon,goal}` + `id` (from Task 1).

- [ ] **Step 1: Write the failing tests**

Append to `tests/programs.test.mjs`:

```js
test("main nav links to the Programs hub", () => {
  const html = readFileSync(join(dist, "index.html"), "utf8");
  assert.match(html, /href="\/programs\/"/, "homepage nav missing Programs link");
});

test("homepage band-picker links each program band", () => {
  const html = readFileSync(join(dist, "index.html"), "utf8");
  for (const slug of SLUGS) {
    assert.match(html, new RegExp(`href="/programs/${slug}/"`), `homepage missing link to /programs/${slug}/`);
  }
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run build && node --test tests/programs.test.mjs`
Expected: FAIL — the two new tests fail (no `/programs/` links on the homepage yet).

- [ ] **Step 3: Add the "Programs" nav entry**

In `src/data/site.json`, change the `nav` array so "Programs" follows "Services":

```json
  "nav": [
    { "label": "About", "href": "/#about" },
    { "label": "Services", "href": "/#services" },
    { "label": "Programs", "href": "/programs/" },
    { "label": "Pitching", "href": "/#pitching" },
    { "label": "Packages", "href": "/#packages" },
    { "label": "Book", "href": "/#book" },
    { "label": "FAQ", "href": "/#faq" },
    { "label": "Contact", "href": "/contact/" }
  ],
```

- [ ] **Step 4: Create the homepage band-picker component**

Create `src/components/Programs.astro`:

```astro
---
import { getCollection } from "astro:content";
import { Icon } from "astro-icon/components";
import SectionHeading from "./ui/SectionHeading.astro";

const bands = (await getCollection("programs")).sort((a, b) => a.data.order - b.data.order);
---
<section id="programs" class="py-16 px-4 bg-base-100">
  <div class="max-w-5xl mx-auto">
    <SectionHeading eyebrow="Programs by Age" title="Find your player's stage" align="center" />
    <p class="mt-3 text-center text-base-content/70 max-w-2xl mx-auto">From keeping the game fun at 8 to college- and pro-ready at 18 — training built around exactly what your player needs at their age.</p>
    <div class="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {bands.map((b) => (
        <a href={`/programs/${b.id}/`} class="group relative block overflow-hidden rounded-box border border-base-300 bg-base-100 p-5 transition-all hover:-translate-y-1 hover:border-marigold/60 hover:shadow-lg">
          <Icon name={b.data.icon} class="w-8 h-8 text-accent" aria-hidden="true" />
          <p class="mt-2 font-heading text-xs uppercase tracking-[0.2em] text-accent">{b.data.band}</p>
          <h3 class="mt-1 text-lg font-heading font-bold text-primary uppercase">{b.data.name}</h3>
          <p class="mt-2 text-sm text-base-content/70">{b.data.goal}</p>
          <span class="mt-3 inline-block text-sm font-semibold text-primary opacity-80 transition-opacity group-hover:opacity-100">Learn more →</span>
        </a>
      ))}
    </div>
    <div class="text-center mt-8">
      <a href="/programs/" class="btn btn-outline btn-primary">See all programs</a>
    </div>
  </div>
</section>
```

- [ ] **Step 5: Render the band-picker on the homepage**

In `src/pages/index.astro`, add the import alongside the other component imports:

```astro
import Programs from "../components/Programs.astro";
```

Then insert it immediately after the Services line so the homepage order mirrors the nav (About → Services → Programs → Pitching):

```astro
    <Reveal><Services /></Reveal>
    <Reveal><Programs /></Reveal>
    <Pitching />
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npm run build && node --test tests/programs.test.mjs`
Expected: PASS (6 tests).

Run: `npm run check:content`
Expected: `Content check passed.` (the `/programs/` nav href is a real path, not a `#`-anchor, so the anchor check skips it.)

- [ ] **Step 7: Commit**

```bash
git add tests/programs.test.mjs src/data/site.json src/components/Programs.astro src/pages/index.astro
git commit -m "feat(programs): Programs nav entry + homepage band-picker"
```

---

### Task 3: Age-audience structured-data signal

**Files:**
- Modify: `tests/programs.test.mjs` (append one test)
- Modify: `src/data/schema.ts:84-109` (`ServiceOpts` + `serviceNode`)
- Modify: `src/pages/programs/[slug].astro` (the `serviceNode({...})` call)

**Interfaces:**
- Consumes: `data.ageMin` / `data.ageMax` (Task 1).
- Produces: each program Service node gains `audience: { "@type": "PeopleAudience", suggestedMinAge, suggestedMaxAge }`.

- [ ] **Step 1: Write the failing test**

Append to `tests/programs.test.mjs`:

```js
test("College & Pro Prep Service declares a PeopleAudience age range", () => {
  const nodes = graph(readFileSync(join(dist, "programs", "college-prep", "index.html"), "utf8"));
  const svc = nodes.find((n) => n["@type"] === "Service");
  assert.ok(svc, "no Service node on /programs/college-prep/");
  assert.equal(svc.audience?.["@type"], "PeopleAudience");
  assert.equal(svc.audience?.suggestedMinAge, 16);
  assert.equal(svc.audience?.suggestedMaxAge, 18);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run build && node --test tests/programs.test.mjs`
Expected: FAIL — `svc.audience` is undefined.

- [ ] **Step 3: Add an `audience` passthrough to `serviceNode`**

In `src/data/schema.ts`, add `audience` to the `ServiceOpts` interface:

```ts
interface ServiceOpts {
  url: string;
  name: string;
  description?: string;
  serviceType?: string;
  /** Override the global areaServed for a location-specific Service. */
  areaServed?: unknown;
  /** Nested Offer(s) for a purchasable Service (e.g. a pricing tier). */
  offers?: unknown;
  /** Nested audience (e.g. a PeopleAudience age range for age-banded pages). */
  audience?: unknown;
}
```

And emit it in `serviceNode`, alongside the other optional fields:

```ts
  if (opts.serviceType) node.serviceType = opts.serviceType;
  if (opts.description) node.description = opts.description;
  if (opts.areaServed) node.areaServed = opts.areaServed;
  if (opts.offers) node.offers = opts.offers;
  if (opts.audience) node.audience = opts.audience;
  return node;
```

- [ ] **Step 4: Pass the age range from the renderer**

In `src/pages/programs/[slug].astro`, update the `serviceNode({...})` call to include `audience`:

```ts
  serviceNode({
    url,
    name: `${d.name} — Baseball Training`,
    serviceType: d.serviceType,
    description: d.description,
    audience: { "@type": "PeopleAudience", suggestedMinAge: d.ageMin, suggestedMaxAge: d.ageMax },
  }),
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm run build && node --test tests/programs.test.mjs`
Expected: PASS (7 tests).

Run: `npm run schema-check`
Expected: `schema-check passed (N page(s)).` — `PeopleAudience` carries no `@id`, so it adds no reference to resolve and is not a forbidden type.

- [ ] **Step 6: Commit**

```bash
git add tests/programs.test.mjs src/data/schema.ts src/pages/programs/[slug].astro
git commit -m "feat(programs): PeopleAudience age signal on program Service nodes"
```

---

## Final verification (after all tasks)

- [ ] Run the whole gate suite once more, clean:

```bash
npm run check:content && npm run schema-check && npm test
```

Expected: `Content check passed.`, `schema-check passed (N page(s)).`, and the full `node --test` suite green (existing tests + 7 program tests).

- [ ] **Stop. Do not push or open a PR.** Report results to Clay and await the go-ahead (STOP-before-push). When approved, the normal flow is a PR to `main` (Cloudflare auto-deploys on merge) + an IndexNow ping for the new URLs.

## Out of scope (deferred, deliberately)

- **Footer links to `/programs/`** and **per-skill `/coaching/` ↔ band back-links** — the nav entry, homepage band-picker, hub, and next-band links already provide clean discovery; a skill→age mapping is fuzzy and not worth forcing now.
- **Real photos / video stills** — fallback navy heroes ship now; the 2026-06-25 footage is branding-gated and a future reshoot is the preferred source (see spec §8).
- **Myles's per-band "booster" specifics** — the drafted copy is complete and shippable pending his sign-off; specific drill names can be folded in during his review without structural change.

## Self-review notes

- **Spec coverage:** §2 bands → Task 1 data; §3 IA (collection/hub/renderer/nav/band-picker/next-link) → Tasks 1–2; §4 honesty gate → Zod `.min()` in Task 1; §5 page anatomy → Task 1 renderer; §6 schema (Service+audience/WebPage/Breadcrumb/CollectionPage + schema-check registration) → Tasks 1 & 3; §7 fallback heroes → renderer (no photos); §8 gates/voice → Global Constraints; §11 resolved decisions → reflected. No uncovered spec requirement.
- **Placeholder scan:** none — all copy and code is complete.
- **Type consistency:** `data.name`/`band`/`ageMin`/`ageMax`/`nextSlug` are defined in the Task 1 schema and consumed unchanged in Tasks 2–3; `serviceNode` gains `audience?` in Task 3 before the renderer passes it.
