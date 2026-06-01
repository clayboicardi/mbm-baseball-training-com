# MBM Baseball Training — Website v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy the v1 single-page MBM Baseball Training site (Astro + Tailwind v4 + daisyUI, Cloudflare static hosting).

**Architecture:** Static Astro site. One page (`index.astro`) composed of section components; content lives in `src/data/*.json`; styling via a custom daisyUI theme mapping the locked brand palette. Build-time only — zero runtime JS. Hybrid booking via embeddable third-party tools (stubbed until accounts exist). Brand assets (logo/favicon/OG) swap in from a parallel branding session.

**Tech Stack:** Astro 6, Tailwind CSS v4 (`@tailwindcss/vite`), daisyUI v5, astro-icon (lucide), @astrojs/sitemap, @fontsource (Oswald + Inter), Cloudflare (wrangler), Node 22.

**Spec:** `docs/superpowers/specs/2026-06-01-mbm-website-design.md`

---

## Verification approach (read before executing)

This is a static content site — no unit-test framework (YAGNI; mirrors clayboicardi). Each task's verification is one of these **real** checks:
- `npm run check` → `astro check` (TS + template validation)
- `npm run build` → production build succeeds
- `npm run check:content` → brand/JSON content script
- `npm run dev` → open `http://localhost:4321` and confirm the described visual outcome
- `npx wrangler deploy --dry-run` for deploy config

Commit after every task (conventional-commit messages).

## Scope check

Single cohesive subsystem (one site + third-party embeds). Branding and market research are separate workstreams already handed off (`docs/branding/…`, `docs/research/…`); their outputs feed labeled tasks here (Task 18 brand swap; market research → `packages.json`). No further decomposition needed.

## File structure

```
mbm-baseball-training-com/
├─ .nvmrc                       # 22
├─ .gitignore
├─ package.json
├─ astro.config.mjs             # tailwind vite plugin + sitemap + site URL
├─ tsconfig.json
├─ wrangler.jsonc               # Cloudflare static assets + custom domain
├─ scripts/
│  └─ check-content.mjs         # off-brand hex + JSON validation
├─ public/
│  ├─ robots.txt
│  ├─ favicon.ico               # placeholder until brand session
│  └─ og-image.png              # placeholder until brand session
├─ src/
│  ├─ assets/photos/            # optimized via astro:assets
│  │  ├─ coach-huddle.jpg       # hero bg
│  │  ├─ coach-with-players.jpg # about
│  │  └─ gallery/*.jpg          # proof grid
│  ├─ data/
│  │  ├─ site.json              # identity, contact, nav, hero, booking config
│  │  ├─ services.json
│  │  ├─ packages.json          # DRAFT pricing — revised by market research
│  │  └─ testimonials.json      # [] — section degrades gracefully
│  ├─ styles/global.css         # tailwind + daisyUI plugin + "mbm" theme + fonts
│  ├─ layouts/
│  │  ├─ BaseLayout.astro       # head, meta, OG, JSON-LD schema
│  │  └─ LegalLayout.astro
│  ├─ components/
│  │  ├─ Nav.astro  Hero.astro  About.astro
│  │  ├─ Services.astro  ServiceCard.astro
│  │  ├─ Packages.astro  PackageCard.astro
│  │  ├─ Booking.astro  Proof.astro  Contact.astro  Footer.astro
│  └─ pages/
│     ├─ index.astro  404.astro  privacy.astro  terms.astro
```

---

## Phase 0 — Repo & scaffold

### Task 1: Initialize git + Node version

**Files:** Create `.nvmrc`, `.gitignore`

- [ ] **Step 1: Init repo** (local dir is not yet a git repo; GitHub remote exists)

```bash
cd C:/Users/chawo/Projects/mbm-baseball-training-com
git init
git branch -M main
git remote add origin https://github.com/clayboicardi/mbm-baseball-training-com.git
```

- [ ] **Step 2: Create `.nvmrc`**

```
22
```

- [ ] **Step 3: Create `.gitignore`**

```
node_modules/
dist/
.astro/
.wrangler/
.env
.DS_Store
*.log
```

- [ ] **Step 4: Commit**

```bash
git add .nvmrc .gitignore
git commit -m "chore: init repo, node version, gitignore"
```

### Task 2: package.json + Astro core

**Files:** Create `package.json`, `tsconfig.json`, `astro.config.mjs`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "mbm-baseball-training-com",
  "type": "module",
  "version": "0.1.0",
  "engines": { "node": ">=22.12.0" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "check:content": "node scripts/check-content.mjs",
    "astro": "astro"
  }
}
```

- [ ] **Step 2: Install deps**

```bash
npm install astro @astrojs/sitemap @tailwindcss/vite tailwindcss daisyui astro-icon @iconify-json/lucide @fontsource/oswald @fontsource/inter
npm install -D @astrojs/check typescript
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{ "extends": "astro/tsconfigs/strict" }
```

- [ ] **Step 4: Create `astro.config.mjs`**

```js
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://mbm-baseball-training.com',
  integrations: [sitemap(), icon()],
  vite: { plugins: [tailwindcss()] },
});
```

- [ ] **Step 5: Verify + commit**

```bash
npx astro check   # may warn about no pages yet — should not error on config
git add package.json package-lock.json tsconfig.json astro.config.mjs
git commit -m "chore: astro core + tailwind/daisyui/sitemap/icon deps"
```

---

## Phase 1 — Styling foundation

### Task 3: global.css — daisyUI "mbm" theme + fonts

**Files:** Create `src/styles/global.css`

- [ ] **Step 1: Write `src/styles/global.css`**

```css
@import "tailwindcss";
@import "@fontsource/oswald/400.css";
@import "@fontsource/oswald/600.css";
@import "@fontsource/oswald/700.css";
@import "@fontsource/inter/400.css";
@import "@fontsource/inter/500.css";
@import "@fontsource/inter/700.css";

@plugin "daisyui";
@plugin "daisyui/theme" {
  name: "mbm";
  default: true;
  prefersdark: false;
  color-scheme: light;

  --color-primary: #005A9C;
  --color-primary-content: #FFFFFF;
  --color-secondary: #FFFFFF;
  --color-secondary-content: #005A9C;
  --color-accent: #EF3E42;
  --color-accent-content: #FFFFFF;
  --color-base-100: #FFFFFF;
  --color-base-200: #F4F7FA;
  --color-base-300: #E5EBF1;
  --color-base-content: #0B1A2B;
  --color-neutral: #0B1A2B;
  --color-neutral-content: #FFFFFF;
  --color-info: #005A9C;
  --color-info-content: #FFFFFF;
  --color-success: #1A8F4C;
  --color-success-content: #FFFFFF;
  --color-warning: #E0A106;
  --color-warning-content: #0B1A2B;
  --color-error: #EF3E42;
  --color-error-content: #FFFFFF;

  --radius-box: 0.75rem;
  --radius-field: 0.5rem;
  --radius-selector: 0.5rem;
}

:root { --font-heading: "Oswald", system-ui, sans-serif; --font-body: "Inter", system-ui, sans-serif; }
html { scroll-behavior: smooth; }
body { font-family: var(--font-body); }
h1, h2, h3, .font-heading { font-family: var(--font-heading); letter-spacing: 0.01em; }
```

> Fonts are provisional — the branding session may select a heading face that pairs with the wordmark. The palette is locked.

- [ ] **Step 2: Commit** (verified once a page consumes it in Task 5)

```bash
git add src/styles/global.css
git commit -m "feat: daisyUI mbm theme + fonts"
```

---

## Phase 2 — Content data + photos

### Task 4: Data files

**Files:** Create `src/data/site.json`, `services.json`, `packages.json`, `testimonials.json`

- [ ] **Step 1: `src/data/site.json`**

```json
{
  "business": {
    "name": "MBM Baseball Training",
    "coach": "Myles Berniard-Mendez",
    "tagline": "Train with purpose. Play with confidence. Compete with passion.",
    "location": "Long Beach, CA",
    "serviceArea": "Serving Long Beach & surrounding areas",
    "phone": "(562) 884-0746",
    "phoneHref": "tel:+15628840746",
    "email": "Mylesberniardmendez@gmail.com",
    "instagram": "https://www.instagram.com/coach_berniard_mendez_",
    "instagramHandle": "@coach_berniard_mendez_"
  },
  "nav": [
    { "label": "About", "href": "#about" },
    { "label": "Services", "href": "#services" },
    { "label": "Packages", "href": "#packages" },
    { "label": "Book", "href": "#book" },
    { "label": "Contact", "href": "#contact" }
  ],
  "hero": {
    "headline": "Private Baseball Training in Long Beach",
    "subhead": "1-on-1 coaching for players ages 8–18 — hitting, fielding, throwing, and baseball IQ from a former semi-pro.",
    "tagline": "Train with purpose. Play with confidence. Compete with passion.",
    "primaryCta": { "label": "Claim Your Free First Lesson", "href": "#book" },
    "secondaryCta": { "label": "View Packages", "href": "#packages" },
    "trust": ["20+ years in the game", "Ages 8–18", "Long Beach, CA"]
  },
  "booking": {
    "calcom": { "base": "" },
    "tallyEliteEmbed": ""
  }
}
```

- [ ] **Step 2: `src/data/services.json`**

```json
[
  { "title": "Hitting", "blurb": "Swing mechanics, timing, and approach that carry into real at-bats.", "icon": "lucide:zap" },
  { "title": "Fielding", "blurb": "Footwork, glovework, and reads that lock down the defense.", "icon": "lucide:shield" },
  { "title": "Throwing Mechanics", "blurb": "Arm care, accuracy, and velocity through clean mechanics.", "icon": "lucide:move-up-right" },
  { "title": "Baseball IQ", "blurb": "Situational awareness and decision-making that win games.", "icon": "lucide:brain" },
  { "title": "Player Development", "blurb": "Confidence, accountability, and a growth mindset on and off the field.", "icon": "lucide:trending-up" }
]
```

- [ ] **Step 3: `src/data/packages.json`** (DRAFT — market research revises this)

```json
[
  { "name": "Free First Lesson", "price": "Free", "duration": "30 minutes", "description": "Try it risk-free.", "features": ["Initial skill evaluation", "Training plan preview", "Q&A with coach"], "featured": false, "ctaLabel": "Book Free Lesson", "ctaHref": "#book" },
  { "name": "30-Minute Session", "price": "$45", "cadence": "/ session", "duration": "30 minutes", "description": "Focused 1-on-1 training for quick skill work.", "features": ["Personalized drills", "Mechanics breakdown", "Progress tracking"], "addon": "+$100 for video analysis", "featured": false, "ctaLabel": "Book 30-Min", "ctaHref": "#book" },
  { "name": "60-Minute Session", "price": "$65", "cadence": "/ session", "duration": "60 minutes", "description": "Full intensive session for comprehensive training.", "features": ["Extended personalized drills", "Deep mechanics breakdown", "Progress tracking"], "addon": "+$100 for video analysis", "featured": true, "ctaLabel": "Book 60-Min", "ctaHref": "#book" },
  { "name": "Elite Package", "price": "$1,500", "cadence": "/ full season", "duration": "30 sessions (60 min each)", "description": "The ultimate program for athletes committed to the next level.", "features": ["30 sessions (60 min each)", "Priority scheduling", "Video analysis included", "Custom training program", "Game film review"], "featured": false, "ctaLabel": "Inquire About Elite", "ctaHref": "#book-elite" }
]
```

- [ ] **Step 4: `src/data/testimonials.json`**

```json
[]
```

- [ ] **Step 5: Commit**

```bash
git add src/data
git commit -m "feat: content-as-data (site, services, packages, testimonials)"
```

### Task 5: Organize photos into src/assets

**Files:** Create `src/assets/photos/` (+ `gallery/`) from `assets-incoming/`

- [ ] **Step 1: Copy + rename** (PowerShell)

```powershell
$src = "C:\Users\chawo\Projects\mbm-baseball-training-com\assets-incoming"
$dst = "C:\Users\chawo\Projects\mbm-baseball-training-com\src\assets\photos"
New-Item -ItemType Directory -Force "$dst\gallery" | Out-Null
Copy-Item "$src\7e32e648-c1e5-4cbc-90ae-d15a82dc3f38.jpg" "$dst\coach-huddle.jpg"
Copy-Item "$src\825a232e-6573-4c58-b175-c9d2f95ef2de.jpg" "$dst\coach-with-players.jpg"
Copy-Item "$src\c109f697-fd63-4ee9-84fc-5884a7790fe1.jpg" "$dst\gallery\coaching-instruction.jpg"
Copy-Item "$src\c2eaf26d-9bc6-4bec-87d4-a7a5585877e7.jpg" "$dst\gallery\game-day.jpg"
Copy-Item "$src\c3c279bc-9653-4e57-b653-81eff8ac225c.jpg" "$dst\gallery\bullpen.jpg" -ErrorAction SilentlyContinue
Copy-Item "$src\c3c279bc-c279bc-*.jpg" "$dst\gallery\bullpen.jpg" -ErrorAction SilentlyContinue
Copy-Item "$src\df3b7201-1170-41fb-bb45-6440842f6fe5.jpg" "$dst\gallery\base-coaching.jpg"
Copy-Item "$src\1f9aaa02-d568-4dd1-8f93-db47c27bb82a.jpg" "$dst\gallery\team-huddle.jpg"
Copy-Item "$src\c3c279bc-6e53-*.jpg" "$dst\gallery\bullpen.jpg" -ErrorAction SilentlyContinue
```

> The exact bullpen filename is `c3c279bc-…` — if the wildcard misses, copy it manually from `assets-incoming/`. Final gallery set: coaching-instruction, game-day, bullpen, base-coaching, team-huddle.

- [ ] **Step 2: Commit**

```bash
git add src/assets/photos
git commit -m "chore: stage optimized-ready photos (low-res placeholders, swap when better arrive)"
```

---

## Phase 3 — Layout + SEO

### Task 6: BaseLayout with meta + JSON-LD schema

**Files:** Create `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Write `src/layouts/BaseLayout.astro`**

```astro
---
import "../styles/global.css";
import site from "../data/site.json";

interface Props { title?: string; description?: string; image?: string; }
const {
  title = `${site.business.name} | Private Baseball Lessons in Long Beach`,
  description = site.hero.subhead,
  image = "/og-image.png",
} = Astro.props;

const canonical = new URL(Astro.url.pathname, Astro.site).href;
const ogImage = new URL(image, Astro.site).href;

const schema = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: site.business.name,
  description,
  url: Astro.site?.href,
  telephone: site.business.phone,
  email: site.business.email,
  areaServed: site.business.serviceArea,
  address: { "@type": "PostalAddress", addressLocality: "Long Beach", addressRegion: "CA", addressCountry: "US" },
  sameAs: [site.business.instagram],
  priceRange: "$$",
};
---
<!doctype html>
<html lang="en" data-theme="mbm">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="canonical" href={canonical} />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={ogImage} />
    <meta property="og:url" content={canonical} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content={ogImage} />
    <script type="application/ld+json" set:html={JSON.stringify(schema)} />
  </head>
  <body class="bg-base-100 text-base-content">
    <slot />
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: BaseLayout with meta, OG, and SportsActivityLocation schema"
```

### Task 7: LegalLayout

**Files:** Create `src/layouts/LegalLayout.astro`

- [ ] **Step 1: Write `src/layouts/LegalLayout.astro`**

```astro
---
import BaseLayout from "./BaseLayout.astro";
import site from "../data/site.json";
interface Props { title: string; }
const { title } = Astro.props;
---
<BaseLayout title={`${title} | ${site.business.name}`}>
  <main class="max-w-3xl mx-auto px-4 py-16 prose prose-slate">
    <a href="/" class="link link-primary no-underline">&larr; Back home</a>
    <h1 class="font-heading">{title}</h1>
    <slot />
  </main>
</BaseLayout>
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/LegalLayout.astro
git commit -m "feat: LegalLayout"
```

---

## Phase 4 — Section components

### Task 8: Nav

**Files:** Create `src/components/Nav.astro`

- [ ] **Step 1: Write `src/components/Nav.astro`**

```astro
---
import site from "../data/site.json";
---
<header class="navbar bg-base-100/90 backdrop-blur sticky top-0 z-50 border-b border-base-300">
  <div class="navbar-start">
    <div class="dropdown lg:hidden">
      <div tabindex="0" role="button" class="btn btn-ghost" aria-label="Open menu">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
      </div>
      <ul tabindex="0" class="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow">
        {site.nav.map((item) => <li><a href={item.href}>{item.label}</a></li>)}
      </ul>
    </div>
    <a href="#top" class="text-xl font-heading font-bold text-primary px-2">{site.business.name}</a>
  </div>
  <nav class="navbar-center hidden lg:flex">
    <ul class="menu menu-horizontal px-1">
      {site.nav.map((item) => <li><a href={item.href}>{item.label}</a></li>)}
    </ul>
  </nav>
  <div class="navbar-end">
    <a href="#book" class="btn btn-accent btn-sm sm:btn-md">Free First Lesson</a>
  </div>
</header>
```

> Wordmark is a text placeholder — replaced by the logo lockup in Task 18.

- [ ] **Step 2: Commit**

```bash
git add src/components/Nav.astro
git commit -m "feat: sticky nav (daisyUI navbar)"
```

### Task 9: Hero

**Files:** Create `src/components/Hero.astro`

- [ ] **Step 1: Write `src/components/Hero.astro`**

```astro
---
import { getImage } from "astro:assets";
import site from "../data/site.json";
import heroImg from "../assets/photos/coach-huddle.jpg";
const bg = await getImage({ src: heroImg, format: "webp", width: 1600 });
---
<section id="top" class="hero min-h-[80vh] relative bg-cover bg-center" style={`background-image:url(${bg.src})`}>
  <div class="hero-overlay bg-primary/75"></div>
  <div class="hero-content text-center">
    <div class="max-w-2xl">
      <h1 class="text-4xl sm:text-6xl font-heading font-bold uppercase text-white">{site.hero.headline}</h1>
      <p class="py-5 text-lg text-white/90">{site.hero.subhead}</p>
      <p class="font-heading text-accent text-xl uppercase tracking-wide">{site.hero.tagline}</p>
      <div class="mt-6 flex flex-wrap gap-3 justify-center">
        <a href={site.hero.primaryCta.href} class="btn btn-accent btn-lg">{site.hero.primaryCta.label}</a>
        <a href={site.hero.secondaryCta.href} class="btn btn-lg btn-outline text-white border-white hover:bg-white hover:text-primary">{site.hero.secondaryCta.label}</a>
      </div>
      <div class="mt-8 flex flex-wrap gap-3 justify-center">
        {site.hero.trust.map((t) => <span class="badge badge-lg badge-outline border-white/50 text-white">{t}</span>)}
      </div>
    </div>
  </div>
</section>
```

> The `bg-primary/75` scrim is intentional: it carries the brand color AND masks the low-res source photo. Swap the source when higher-res arrives.

- [ ] **Step 2: Verify**

Run: `npm run dev` → open `http://localhost:4321`
Expected: full-height hero, blue scrim over photo, white headline, red tagline + CTAs. (This is the first render — confirms theme + fonts + image pipeline all work.)

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero.astro
git commit -m "feat: hero with scrimmed photo bg + CTAs"
```

### Task 10: About

**Files:** Create `src/components/About.astro`

- [ ] **Step 1: Write `src/components/About.astro`**

```astro
---
import { Image } from "astro:assets";
import coachPortrait from "../assets/photos/coach-with-players.jpg";
import site from "../data/site.json";
---
<section id="about" class="py-20 px-4 bg-base-100">
  <div class="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
    <Image src={coachPortrait} alt={`Coach ${site.business.coach} with two young players`} width={520} class="rounded-box shadow-xl w-full object-cover" />
    <div>
      <h2 class="text-3xl font-heading font-bold text-primary uppercase">Meet Coach Myles</h2>
      <p class="mt-4 text-base-content/80">Baseball has been part of my life for over 20 years. As a former semi-professional player and current coach, my passion is helping young athletes build confidence, develop their skills, and learn what it takes to succeed both on and off the field.</p>
      <p class="mt-4 text-base-content/80">I specialize in private instruction for players ages 8–18 — hitting, fielding, throwing mechanics, baseball IQ, and overall player development — in a positive environment where athletes improve their fundamentals and compete with confidence.</p>
      <p class="mt-4 font-heading text-accent uppercase tracking-wide">{site.business.tagline}</p>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/About.astro
git commit -m "feat: about section (condensed bio + portrait)"
```

### Task 11: Services + ServiceCard

**Files:** Create `src/components/ServiceCard.astro`, `src/components/Services.astro`

- [ ] **Step 1: Write `src/components/ServiceCard.astro`**

```astro
---
import { Icon } from "astro-icon/components";
interface Props { title: string; blurb: string; icon: string; }
const { title, blurb, icon } = Astro.props;
---
<div class="card bg-base-200 hover:shadow-lg transition-shadow">
  <div class="card-body items-center text-center">
    <Icon name={icon} class="w-10 h-10 text-accent" />
    <h3 class="card-title font-heading">{title}</h3>
    <p class="text-sm text-base-content/70">{blurb}</p>
  </div>
</div>
```

- [ ] **Step 2: Write `src/components/Services.astro`**

```astro
---
import ServiceCard from "./ServiceCard.astro";
import services from "../data/services.json";
---
<section id="services" class="py-20 px-4 bg-base-200/50">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-heading font-bold text-primary uppercase text-center">What I Coach</h2>
    <p class="text-center mt-2 text-base-content/70">Complete development for players ages 8–18.</p>
    <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s) => <ServiceCard title={s.title} blurb={s.blurb} icon={s.icon} />)}
    </div>
  </div>
</section>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ServiceCard.astro src/components/Services.astro
git commit -m "feat: services grid with lucide icons"
```

### Task 12: Packages + PackageCard

**Files:** Create `src/components/PackageCard.astro`, `src/components/Packages.astro`

- [ ] **Step 1: Write `src/components/PackageCard.astro`**

```astro
---
interface Props {
  name: string; price: string; cadence?: string; duration?: string;
  description?: string; features: string[]; addon?: string;
  featured?: boolean; ctaLabel: string; ctaHref: string;
}
const { name, price, cadence, duration, description, features, addon, featured, ctaLabel, ctaHref } = Astro.props;
---
<div class={`card border bg-base-100 ${featured ? "border-accent shadow-xl lg:scale-[1.03]" : "border-base-300"}`}>
  <div class="card-body">
    {featured && <span class="badge badge-accent self-start">Best Value</span>}
    <h3 class="card-title font-heading text-2xl">{name}</h3>
    {duration && <p class="text-sm text-base-content/60">{duration}</p>}
    <p class="mt-2"><span class="text-3xl font-bold text-primary">{price}</span>{cadence && <span class="text-base-content/60"> {cadence}</span>}</p>
    {description && <p class="mt-2 text-sm text-base-content/70">{description}</p>}
    <ul class="mt-4 space-y-2 text-sm">
      {features.map((f) => <li class="flex gap-2"><span class="text-accent font-bold">✓</span><span>{f}</span></li>)}
    </ul>
    {addon && <p class="mt-3 text-xs text-base-content/60 italic">{addon}</p>}
    <div class="card-actions mt-6">
      <a href={ctaHref} class={`btn w-full ${featured ? "btn-accent" : "btn-primary"}`}>{ctaLabel}</a>
    </div>
  </div>
</div>
```

- [ ] **Step 2: Write `src/components/Packages.astro`**

```astro
---
import PackageCard from "./PackageCard.astro";
import packages from "../data/packages.json";
---
<section id="packages" class="py-20 px-4 bg-base-100">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-heading font-bold text-primary uppercase text-center">Training Packages</h2>
    <p class="text-center mt-2 text-base-content/70">Start with a free lesson. Train at your pace.</p>
    <div class="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4 items-start">
      {packages.map((p) => <PackageCard {...p} />)}
    </div>
  </div>
</section>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/PackageCard.astro src/components/Packages.astro
git commit -m "feat: packages pricing grid"
```

### Task 13: Booking (hybrid stub)

**Files:** Create `src/components/Booking.astro`

- [ ] **Step 1: Write `src/components/Booking.astro`**

```astro
---
import site from "../data/site.json";
const { calcom, tallyEliteEmbed } = site.booking;
const hasCalcom = Boolean(calcom.base);
const hasTally = Boolean(tallyEliteEmbed);
---
<section id="book" class="py-20 px-4 bg-base-200/50">
  <div class="max-w-4xl mx-auto text-center">
    <h2 class="text-3xl font-heading font-bold text-primary uppercase">Book a Session</h2>
    <p class="mt-2 text-base-content/70">Pick a time that works for you — or ask about the Elite program.</p>

    <div class="mt-8">
      {hasCalcom ? (
        <iframe title="Book a session" src={`https://cal.com/${calcom.base}`} class="w-full rounded-box border border-base-300" style="height:700px" loading="lazy"></iframe>
      ) : (
        <div class="card bg-base-100 border border-base-300 p-8">
          <p class="text-base-content/70">Online scheduling is being set up. To book your free first lesson now, call or text
            <a class="link link-primary font-semibold" href={site.business.phoneHref}>{site.business.phone}</a>.</p>
        </div>
      )}
    </div>

    <div id="book-elite" class="mt-12">
      <h3 class="text-2xl font-heading text-primary">Elite Program Inquiry</h3>
      {hasTally ? (
        <iframe title="Elite program inquiry" src={`https://tally.so/embed/${tallyEliteEmbed}`} class="w-full rounded-box border border-base-300 mt-4" style="height:500px" loading="lazy"></iframe>
      ) : (
        <p class="mt-4 text-base-content/70">For the Elite Package, call/text
          <a class="link link-primary font-semibold" href={site.business.phoneHref}>{site.business.phone}</a> or email
          <a class="link link-primary font-semibold" href={`mailto:${site.business.email}`}>{site.business.email}</a>.</p>
      )}
    </div>
  </div>
</section>
```

> Stub is fully functional: until Myles creates his Cal.com + Tally accounts, the phone/email fallback shows. To go live, set `booking.calcom.base` (e.g. `coach-myles`) and `booking.tallyEliteEmbed` (form id) in `site.json`.

- [ ] **Step 2: Commit**

```bash
git add src/components/Booking.astro
git commit -m "feat: hybrid booking section (cal.com + tally stubs w/ phone fallback)"
```

### Task 14: Proof (gallery + testimonials + IG)

**Files:** Create `src/components/Proof.astro`

- [ ] **Step 1: Write `src/components/Proof.astro`**

```astro
---
import { Image } from "astro:assets";
import site from "../data/site.json";
import testimonials from "../data/testimonials.json";
const galleryMods = import.meta.glob("../assets/photos/gallery/*.{jpg,jpeg,png}", { eager: true });
const gallery = Object.values(galleryMods).map((m) => (m as any).default);
---
<section class="py-20 px-4 bg-base-100">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-heading font-bold text-primary uppercase text-center">On the Field</h2>
    <div class="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3">
      {gallery.map((img) => <Image src={img} alt="Coach Myles working with players" width={420} class="rounded-box w-full h-48 object-cover" />)}
    </div>

    {testimonials.length > 0 && (
      <div class="mt-12 grid gap-6 md:grid-cols-2">
        {testimonials.map((t: any) => (
          <blockquote class="card bg-base-200 p-6">
            <p class="italic">&ldquo;{t.quote}&rdquo;</p>
            <footer class="mt-3 text-sm font-semibold text-primary">— {t.author}</footer>
          </blockquote>
        ))}
      </div>
    )}

    <div class="text-center mt-10">
      <a href={site.business.instagram} target="_blank" rel="noopener" class="btn btn-outline btn-primary">Follow {site.business.instagramHandle}</a>
    </div>
  </div>
</section>
```

> Testimonials render only when `testimonials.json` is non-empty (graceful empty per spec). Gallery auto-includes any image dropped in `src/assets/photos/gallery/`.

- [ ] **Step 2: Commit**

```bash
git add src/components/Proof.astro
git commit -m "feat: proof section (gallery + testimonials + IG)"
```

### Task 15: Contact + Footer

**Files:** Create `src/components/Contact.astro`, `src/components/Footer.astro`

- [ ] **Step 1: Write `src/components/Contact.astro`**

```astro
---
import site from "../data/site.json";
---
<section id="contact" class="py-20 px-4 bg-primary text-primary-content">
  <div class="max-w-3xl mx-auto text-center">
    <h2 class="text-3xl font-heading font-bold uppercase">Ready to Get Started?</h2>
    <p class="mt-2 text-primary-content/80">Book your free first lesson or reach out with any questions.</p>
    <div class="mt-6 flex flex-wrap gap-4 justify-center">
      <a href={site.business.phoneHref} class="btn btn-accent btn-lg">Call / Text {site.business.phone}</a>
      <a href={`mailto:${site.business.email}`} class="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-primary">Email Coach Myles</a>
    </div>
    <p class="mt-4 text-primary-content/70">{site.business.serviceArea}</p>
  </div>
</section>
```

- [ ] **Step 2: Write `src/components/Footer.astro`**

```astro
---
import site from "../data/site.json";
const year = new Date().getFullYear();
---
<footer class="footer footer-center bg-neutral text-neutral-content p-10">
  <aside>
    <p class="font-heading text-xl">{site.business.name}</p>
    <p class="text-neutral-content/70">{site.business.location}</p>
    <div class="flex flex-wrap gap-4 mt-2 justify-center">
      <a href={site.business.phoneHref} class="link link-hover">{site.business.phone}</a>
      <a href={`mailto:${site.business.email}`} class="link link-hover">Email</a>
      <a href={site.business.instagram} target="_blank" rel="noopener" class="link link-hover">Instagram</a>
    </div>
    <nav class="mt-2 flex gap-4 text-sm text-neutral-content/60 justify-center">
      <a href="/privacy" class="link link-hover">Privacy</a>
      <a href="/terms" class="link link-hover">Terms</a>
    </nav>
    <p class="mt-2 text-xs text-neutral-content/50">© {year} {site.business.name}. All rights reserved.</p>
  </aside>
</footer>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Contact.astro src/components/Footer.astro
git commit -m "feat: contact CTA + footer"
```

---

## Phase 5 — Pages + public assets

### Task 16: index + 404

**Files:** Create `src/pages/index.astro`, `src/pages/404.astro`

- [ ] **Step 1: Write `src/pages/index.astro`**

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import Nav from "../components/Nav.astro";
import Hero from "../components/Hero.astro";
import About from "../components/About.astro";
import Services from "../components/Services.astro";
import Packages from "../components/Packages.astro";
import Booking from "../components/Booking.astro";
import Proof from "../components/Proof.astro";
import Contact from "../components/Contact.astro";
import Footer from "../components/Footer.astro";
---
<BaseLayout>
  <Nav />
  <main>
    <Hero />
    <About />
    <Services />
    <Packages />
    <Booking />
    <Proof />
    <Contact />
  </main>
  <Footer />
</BaseLayout>
```

- [ ] **Step 2: Write `src/pages/404.astro`**

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
---
<BaseLayout title="Page Not Found | MBM Baseball Training">
  <main class="min-h-[70vh] grid place-items-center text-center px-4">
    <div>
      <p class="text-6xl font-heading font-bold text-primary">404</p>
      <p class="mt-4 text-base-content/70">That page is out of the park. Let's get you back.</p>
      <a href="/" class="btn btn-accent mt-6">Back to Home</a>
    </div>
  </main>
</BaseLayout>
```

- [ ] **Step 3: Verify**

Run: `npm run dev` → open `http://localhost:4321` and `http://localhost:4321/404`
Expected: full page renders all sections in order; 404 renders. Test nav anchor links + mobile menu.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/pages/404.astro
git commit -m "feat: home page assembly + custom 404"
```

### Task 17: Legal pages + public assets

**Files:** Create `src/pages/privacy.astro`, `src/pages/terms.astro`, `public/robots.txt`, placeholder `public/favicon.ico` + `public/og-image.png`

- [ ] **Step 1: Write `src/pages/privacy.astro`**

```astro
---
import LegalLayout from "../layouts/LegalLayout.astro";
---
<LegalLayout title="Privacy Policy">
  <p>MBM Baseball Training respects your privacy. We collect only the information you provide when you contact us or book a session (name, phone, email) and use it solely to schedule and deliver training. We do not sell or share your information.</p>
  <p>Questions? Email <a href="mailto:Mylesberniardmendez@gmail.com">Mylesberniardmendez@gmail.com</a>.</p>
</LegalLayout>
```

- [ ] **Step 2: Write `src/pages/terms.astro`**

```astro
---
import LegalLayout from "../layouts/LegalLayout.astro";
---
<LegalLayout title="Terms of Service">
  <p>By booking a session with MBM Baseball Training you agree to our scheduling and cancellation terms. Payment is due at the time of service unless otherwise arranged. Sessions cancelled with less than 24 hours' notice may be subject to a fee.</p>
  <p>Questions? Email <a href="mailto:Mylesberniardmendez@gmail.com">Mylesberniardmendez@gmail.com</a>.</p>
</LegalLayout>
```

> Placeholder legal copy — have Myles review before launch; not legal advice.

- [ ] **Step 3: Write `public/robots.txt`**

```
User-agent: *
Allow: /
Sitemap: https://mbm-baseball-training.com/sitemap-index.xml
```

- [ ] **Step 4: Placeholder favicon + OG** (replaced in Task 18)

```powershell
# Temporary 1x1/simple placeholders so links resolve; brand session overwrites.
$pub = "C:\Users\chawo\Projects\mbm-baseball-training-com\public"
Copy-Item "C:\Users\chawo\Projects\clayboicardi-com\public\favicon.ico" "$pub\favicon.ico"
Copy-Item "C:\Users\chawo\Projects\mbm-baseball-training-com\src\assets\photos\coach-huddle.jpg" "$pub\og-image.png"
```

> These are throwaway placeholders just so `<head>` references resolve and OG previews don't 404. Task 18 replaces both with real brand assets.

- [ ] **Step 5: Commit**

```bash
git add src/pages/privacy.astro src/pages/terms.astro public
git commit -m "feat: legal pages, robots.txt, placeholder favicon/og"
```

---

## Phase 6 — Quality gate

### Task 18: Content/brand check script

**Files:** Create `scripts/check-content.mjs`

- [ ] **Step 1: Write `scripts/check-content.mjs`**

```js
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const ALLOWED = new Set(
  ["#005A9C", "#FFFFFF", "#EF3E42", "#F4F7FA", "#E5EBF1", "#0B1A2B", "#1A8F4C", "#E0A106"].map((h) => h.toUpperCase())
);
const errors = [];

function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(astro|css|ts|js|mjs)$/.test(e)) checkFile(p);
  }
}
function checkFile(p) {
  if (p.endsWith("global.css")) return; // theme definition lives here
  const text = readFileSync(p, "utf8");
  for (const h of text.match(/#[0-9a-fA-F]{6}\b/g) || []) {
    if (!ALLOWED.has(h.toUpperCase())) errors.push(`${p.replace(ROOT, "")}: off-brand hex ${h}`);
  }
}
for (const f of ["site.json", "services.json", "packages.json", "testimonials.json"]) {
  try { JSON.parse(readFileSync(join(SRC, "data", f), "utf8")); }
  catch (e) { errors.push(`data/${f}: invalid JSON — ${e.message}`); }
}
walk(SRC);
if (errors.length) { console.error("Content check FAILED:\n" + errors.join("\n")); process.exit(1); }
console.log("Content check passed.");
```

- [ ] **Step 2: Run full quality gate**

Run:
```bash
npm run check:content   # Expected: "Content check passed."
npm run check           # Expected: astro check, 0 errors
npm run build           # Expected: build completes, dist/ generated
```

- [ ] **Step 3: Commit**

```bash
git add scripts/check-content.mjs
git commit -m "chore: content/brand check script"
```

---

## Phase 7 — Brand integration (QUARANTINED — blocked on branding session)

### Task 19: Swap in real brand assets

> **BLOCKED until the branding session delivers assets.** Everything above ships with placeholders. Do this task when Clay provides the brand asset filepath. The locked palette means tokens don't change — only images + (optionally) the heading font.

**Files:** Replace `public/favicon.ico` + favicon PNGs, `public/og-image.png`; modify `Nav.astro`, `Hero.astro`, `global.css` (font only)

- [ ] **Step 1: Drop favicon set into `public/`** (`favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`) and add the PNG `<link>`s to `BaseLayout.astro` head.
- [ ] **Step 2: Replace `public/og-image.png`** with the real 1200×630 OG image.
- [ ] **Step 3: Replace the Nav text wordmark** with the logo lockup:

```astro
<a href="#top" class="px-2"><img src="/logo.svg" alt="MBM Baseball Training" class="h-9" /></a>
```

- [ ] **Step 4: Optional** — if the wordmark dictates a heading font, update `--font-heading` + the `@fontsource` imports in `global.css`.
- [ ] **Step 5: Verify + commit**

```bash
npm run build
git add public src/components/Nav.astro src/layouts/BaseLayout.astro src/styles/global.css
git commit -m "feat: integrate brand assets (logo, favicon, OG)"
```

---

## Phase 8 — Deploy

### Task 20: Cloudflare config + deploy

**Files:** Create `wrangler.jsonc`, `README.md`

- [ ] **Step 1: Write `wrangler.jsonc`**

```jsonc
{
  "name": "mbm-baseball-training-com",
  "compatibility_date": "2026-05-01",
  "assets": {
    "directory": "./dist",
    "html_handling": "auto-trailing-slash",
    "not_found_handling": "404-page"
  },
  "routes": [
    { "pattern": "mbm-baseball-training.com", "custom_domain": true },
    { "pattern": "www.mbm-baseball-training.com", "custom_domain": true }
  ]
}
```

- [ ] **Step 2: Write `README.md`** (dev/build/deploy notes — mirror clayboicardi's).

- [ ] **Step 3: Dry-run deploy**

Run: `npm run build && npx wrangler deploy --dry-run`
Expected: build + dry-run succeed; assets resolved from `dist/`.

- [ ] **Step 4: Live deploy** (when Clay approves going live)

Run: `npx wrangler deploy`
Expected: deployed; custom domain attaches (Cloudflare auto-creates DNS for the zone).

- [ ] **Step 5: Commit**

```bash
git add wrangler.jsonc README.md
git commit -m "chore: cloudflare deploy config + readme"
```

---

## Post-build follow-ups (tracked, not v1 blockers)

- Fold market-research output into `packages.json` (esp. the +$100 video-analysis line).
- Set `booking.calcom.base` + `booking.tallyEliteEmbed` once Myles creates accounts.
- Collect + add testimonials.
- Swap in higher-res + 1-on-1 training photos + a headshot.
- Stripe online payments (fast-follow).
- Google Business Profile (off-site).

---

## Self-review

**1. Spec coverage:**
- Single-page scroll + sticky nav + legal + 404 → Tasks 8, 16, 17 ✓
- Hybrid booking (cal.com + tally) → Task 13 ✓
- Logo-first / placeholder + quarantined swap → Task 19 ✓
- Locked palette via daisyUI theme → Task 3 ✓
- All 8 sections → Tasks 8–16 ✓
- Data model (site/services/packages/testimonials) → Task 4 ✓
- SEO/schema → Task 6 ✓; sitemap → Task 2; robots → Task 17 ✓
- Cloudflare deploy → Task 20 ✓
- Quality gate (astro check, build, content script) → Tasks 2/18 ✓
- Dependencies/fast-follow captured → Post-build section ✓

**2. Placeholder scan:** No "TBD"/"implement later". Legal copy + brand assets are explicitly flagged placeholders with owners, not silent gaps. Brand task is intentionally blocked with a clear trigger.

**3. Type/name consistency:** `site.business.*`, `site.hero.*`, `site.nav`, `site.booking.{calcom.base, tallyEliteEmbed}` used identically across components and `site.json`. `packages.json` keys match `PackageCard` props (spread `{...p}`). `services.json` keys (title/blurb/icon) match `ServiceCard`. Photo import paths match Task 5 outputs. Anchor IDs (`#about #services #packages #book #book-elite #contact #top`) consistent between `nav`, sections, and CTAs.
