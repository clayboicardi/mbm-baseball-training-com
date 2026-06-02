# MBM Site — Post-Audit Implementation Prompt

> **How to use:** open a FRESH Claude Code session with working dir
> `C:\Users\chawo\Projects\mbm-baseball-training-com` and paste this whole file.
> Fresh context is intended — the build session is near-full.

You're implementing fixes from two completed audits on a **live**, deployed site
(MBM Baseball Training — Astro 6 static site on Cloudflare, www.mbm-baseball-training.com).

## Read first (full detail + exact file:line live here)
- `docs/audits/codex-codebase-audit.md` (engineering)
- `docs/audits/codex-seo-audit.md` (SEO)
- `mem_search` engram project `mbm-baseball-training-com` for stack/brand/deploy facts.

## Stack / facts
Astro 6 static · Tailwind v4 (@tailwindcss/vite, Vite pinned ^7 via package.json overrides) · daisyUI v5 ("mbm" theme in src/styles/global.css) · astro-icon/lucide · @astrojs/sitemap · @fontsource Oswald/Inter. Deploy: Cloudflare Workers static assets (wrangler.jsonc, build cmd `npm run build` in CF dashboard) — `git push main` auto-builds; local `npm run build && npx wrangler deploy` also works (account_id pinned). Brand LOCKED (docs/branding/brand-locked.md): blue #005A9C + white dominant, red #EF3E42 sparing, marigold #EBB257 folk-art only, navy #0B1F33 dark field; **don't change locked palette globally without flagging Clay.**

## DECISIONS (defaults set — Clay can flip; ask if unsure)
1. **Canonical host = apex `https://mbm-baseball-training.com`** (matches astro.config `site` + robots, least change). Both apex + www currently return 200 with no redirect. → Add a **www→apex 301 redirect** (try `public/_redirects`; if Workers-assets won't do host redirects, document a Cloudflare Redirect Rule for Clay). *(Flip to www if Clay prefers — then update astro.config `site` + robots.)*
2. **Accent contrast:** keep the locked brand red `#EF3E42` on **large/bold CTAs** (white-on-red ≈3.86:1 passes the 3:1 large-text AA bar) and decorative use, but **fix small-text-on-red** (the "Best Value" badge fails AA). Make the badge navy text on red, or a darker red just there. **Do NOT change the global locked red** without Clay's OK.
3. **Real schema data** (geo lat/lng, openingHours, street address) is unknown — implement schema with what's known; leave geo/hours/address out (or `TODO`) until Clay/Myles provides. No `aggregateRating`/review schema until real reviews exist.

## A. Code changes (implement, grouped; commit per group)

### A1 — Accessibility
- Add a **skip link** (`<a href="#main" class="sr-only focus:not-sr-only …">Skip to content</a>`) just inside `<body>` in BaseLayout; give each page's `<main>` `id="main"`.
- **404.astro**: make the "404" an `<h1>`; add a `noindex` (see A2 BaseLayout prop).
- `aria-hidden="true"` on decorative icons (ServiceCard lucide icons) + the `✓` checkmarks (PackageCard, package features).
- **Nav mobile**: larger tap targets (`min-h-11`/`py-3` on menu links) + close the `<details>` after a link click (tiny inline script toggling `open`).
- **Proof gallery alt**: make it data-driven with a unique alt per image (or `alt=""` for purely decorative) — no more identical alt on all 5.

### A2 — SEO / meta / schema
- **Canonical host** per Decision 1 (config/robots consistent + redirect).
- **BaseLayout**: add optional `noindex` prop (emits `<meta name="robots" content="noindex,follow">`) and ensure per-page `description` is settable.
- **Per-page meta**: unique descriptions for privacy/terms; **noindex the 404**. Homepage description → `"Private youth baseball lessons in Long Beach with Coach Myles — hitting, fielding, throwing, and baseball IQ for ages 8–18. Claim a free first lesson."` Consider title → `"Private Baseball Lessons Long Beach | MBM Baseball Training"`.
- **Enrich JSON-LD LocalBusiness/SportsActivityLocation**: add `@id`, `telephone` in E.164 (`+15628840746`), `areaServed` (Long Beach + nearby), `sameAs` ([IG]), `founder` (Person "Myles Berniard-Mendez"), and `hasOfferCatalog`/`Offer`s built from packages.json. Add `geo`/`openingHours`/full `address` only with real data (Decision 3).
- Add an `id` to the Proof section (`#gallery` or `#on-the-field`).
- Weave natural local-keyword variants into existing copy/headings ("private baseball coach Long Beach", "hitting lessons Long Beach") — no stuffing.

### A3 — Performance
- **Hero LCP**: replace the CSS-background (`getImage` → inline `style`) with an absolutely-positioned eager `<Image>`/`<picture>` behind the overlay — responsive widths, `sizes="100vw"`, `loading="eager"`, `fetchpriority="high"`. Verify the mobile LCP visually after.
- **Fonts**: switch `@fontsource/*` imports to **latin-only** subset files (e.g. `@fontsource/inter/latin-400.css`, matching Oswald weights) to shrink the render-blocking CSS + drop unused subset assets.

### A4 — Headers / cache / redirect (committable, no dashboard needed)
- Add **`public/_headers`**:
  - `/_astro/*` → `Cache-Control: public, max-age=31536000, immutable`
  - Global security headers: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, and a `Content-Security-Policy` allowing `frame-src https://cal.com https://tally.so`, `frame-ancestors 'none'`, `img-src 'self' data: https:`, and `'unsafe-inline'` for style/script (hero inline style + JSON-LD) — tighten later.
- **`public/_redirects`** for the canonical host redirect (test it works on Workers static assets; if not, leave a note for Clay to add a Cloudflare Redirect Rule).

### A5 — Quality / maintainability
- Legal pages: use `site.business.email` instead of the hard-coded address.
- PackageCard: format prices with `Intl.NumberFormat` using `packages.json` `currency` (drop hard-coded `$`).
- Replace `as any`/loose casts in Proof.astro + Packages.astro with typed interfaces (+ `ImageMetadata`).
- Extend `scripts/check-content.mjs` to validate: nav anchors resolve, package `cta.target` anchors exist, and `addOns[]` keys exist in `addOnsCatalog`.

## B. Verify (after each group + at the end)
`npm run check:content` → `npx astro check` (expect 0/0/0) → `npm run build` → visual check via `npm run preview` (desktop + mobile) → validate the JSON-LD (Google Rich Results) → Lighthouse if available. Commit per group with conventional messages. **Push to `main` only when Clay approves** (it deploys live via Cloudflare). This is a static site — rely on astro check/build/check-content + visual verification (no unit-test framework; don't add one).

## C. Off-site / Clay-owned (NOT code — for Clay, listed so nothing's lost)
- **Google Business Profile** — create/verify + fully complete (categories, services, hours, photos, booking URL). #1 local-pack lever.
- Start collecting **Google reviews** → then add review/aggregateRating schema (only when real).
- **Citations**: Bing Places, Apple Business Connect, Yelp, FB/IG, Nextdoor, youth-sports directories (consistent NAP).
- **Local backlinks**: Long Beach leagues/schools/sponsor pages.
- Provide **real schema data** (geo, hours, address) for A2.
- Confirm the **apex domain** stays attached + the chosen redirect is live.

## D. Clay's additional changes
<!-- Clay: add anything you want implemented on top of the audit findings here. -->

## Approach
Implement directly per the grouped list (the changes are well-specified — pull exact file:line + code from the two audit docs). Group commits by section (A1…A5). Don't touch the locked brand palette globally. Surface the 3 decisions to Clay if not already answered. When done, summarize what shipped + what's left for Clay (off-site + any deferred).
