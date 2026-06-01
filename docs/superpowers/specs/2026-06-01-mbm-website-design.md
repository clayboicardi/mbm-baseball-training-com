# MBM Baseball Training — Website Design Spec

**Date:** 2026-06-01
**Status:** Draft for review
**Author:** Clay + CC

## Goal

A fast, professional single-page marketing + booking site for **MBM Baseball
Training** (Coach Myles Berniard-Mendez, Long Beach CA) that converts visiting
parents into booked sessions — with the **free first lesson** as the primary
conversion hook — and presents the coach credibly. Built free by Clay; quality
bar is high (it's replacing a half-effort site and doubles as a portfolio piece).

## Context

- Audience: parents of players ages 8–18 (mostly on phones) + the players.
- Reference build: `C:\Users\chawo\Projects\clayboicardi-com` (Astro + Cloudflare). We reuse its playbook wholesale.
- Branding is a **separate parallel workstream** (own CC session, AI Studio / Nano Banana Pro). Its output feeds a small, quarantined set of this build's tasks. See `docs/branding/branding-session-handoff.md`.

## Architecture & stack

- **Astro** static site generation. Near-zero runtime deps (mirror clayboicardi).
- **Styling: Tailwind CSS v4 + daisyUI** with a **custom daisyUI theme** mapping the locked brand colors to `primary` / `secondary` / `accent`. Installed via `astro add tailwind`; theme + globals in `src/styles/global.css`. Build-time only — preserves Astro's zero-runtime-JS output. **Anti-generic principle:** use daisyUI for primitives (`btn`, `card`, `badge`, `navbar`, footer, form controls); hand-craft the signature layouts (hero, section composition) so it reads as MBM, not a stock template. *(Conscious divergence from clayboicardi's plain-CSS playbook, for build velocity + a consistent themed component set. Verified current via Context7: daisyUI v5 + Tailwind v4 + Astro v6.)*
- **Content-as-data:** copy and structured lists live in `src/data/*.json`, separate from layout.
- **Component sections:** one `.astro` component per page section.
- **Hosting:** Cloudflare static assets via `wrangler.jsonc` (custom domain `mbm-baseball-training.com`, already in Cloudflare). Mirror clayboicardi's wrangler config.
- **Node 22** (`.nvmrc`).
- **Quality gate:** an adapted voice/quality/color check script (from clayboicardi's `check-voice.sh`) — enforces brand-color discipline (only the daisyUI theme tokens; no off-brand/raw hex outside `global.css`) and basic content rules.

## Locked decisions (from brainstorming, 2026-06-01)

1. **Single-page scroll** + sticky anchor nav (Home · About · Services · Book · Contact) + legal pages + custom 404. Mobile-first.
2. **Hybrid booking:** self-serve calendar scheduling for standard 30/60-min sessions (**Cal.com**, candidate — free tier to verify) + a request/intake form for **Elite/custom** inquiries (**Tally**, candidate).
3. **Payments:** in-person for now; online via **Stripe** is an explicit fast-follow, out of v1.
4. **Branding: logo-first** sequencing — the site themes to the finished brand kit; a **text wordmark placeholder** is used until assets land so the build is never blocked.
5. **Palette (locked):** Primary Dodger Blue `#005A9C`, White `#FFFFFF`, Accent Red `#EF3E42`.
6. **Review workflow:** code-first; Clay inspects the live running site (local `npm run dev` or a Cloudflare preview) and iterates. No mockups.

## Site structure (single page, top → bottom)

Each section = one component. Content pulled from `src/data/*.json` where noted.

| # | Section | Component | Content / source | Notes |
|---|---|---|---|---|
| 1 | Sticky Nav | `Nav.astro` | `site.json` (links, CTA) | Wordmark (placeholder) left; anchor links; "Free First Lesson" CTA; mobile hamburger |
| 2 | Hero | `Hero.astro` | `site.json` | Coaching photo w/ scrim (low-res-safe); tagline; primary CTA *Claim Your Free First Lesson* + secondary *View Packages*; trust strip (20+ yrs · ages 8–18 · Long Beach) |
| 3 | About — Meet Coach Myles | `About.astro` | `site.json` (bio) | Posing photo; condensed bio; credentials; philosophy |
| 4 | What I Coach | `Services.astro` + `ServiceCard.astro` | `services.json` | hitting · fielding · throwing mechanics · baseball IQ · player development (icon cards); who it's for |
| 5 | Packages | `Packages.astro` + `PackageCard.astro` | `packages.json` | 4 tiers (Free First = entry hook; 30/60-min; Elite featured); add-ons; pending market research |
| 6 | Book a Session | `Booking.astro` | `site.json` | Cal.com scheduler embed (30/60-min) + *Inquire about Elite/custom* → Tally form. Stubbed w/ clear placeholder until Myles's accounts exist |
| 7 | Proof | `Proof.astro` | `testimonials.json` (+ photos) | Action-photo gallery + IG link + testimonials slot (graceful if empty) |
| 8 | Contact / Footer | `Contact.astro`, `Footer.astro` | `site.json` | Tap-to-call · email · IG · Long Beach + service area · CTA repeat · legal links |

Plus:
- `src/pages/index.astro` — assembles sections 1–8.
- `src/pages/404.astro` — custom 404.
- `src/pages/privacy.astro`, `src/pages/terms.astro` — via `LegalLayout.astro`.
- `BaseLayout.astro` — meta, Open Graph, Twitter card, theme, and **JSON-LD `LocalBusiness` / `SportsActivityLocation` schema** (name, Long Beach address/area, phone, `sameAs` IG, `priceRange`, offers).

## Data model (`src/data/`)

- `site.json` — business identity, contact (phone/email/IG), location/service area, nav links, hero copy, tagline, CTA labels.
- `services.json` — list of coaching focus areas (label, blurb, icon).
- `packages.json` — the 4 tiers (name, price, duration, bullet features, add-ons, `featured` flag, CTA target).
- `testimonials.json` — parent/player quotes (starts empty; section degrades gracefully).

## Scope

**v1 (this plan):** sections 1–8, legal pages, 404, SEO/schema, responsive + a11y pass, design tokens from the locked palette, content JSON, booking embeds (stubbed until accounts exist), favicon/OG (placeholder until brand kit), Cloudflare deploy config, quality-check script.

**Fast-follow (not v1):** Stripe online payments; testimonials once collected; expanded gallery/blog; Google Business Profile (off-site, parallel).

## Brand integration (quarantined — depends on the branding session)

These tasks are isolated so everything else proceeds. Placeholder until assets land:
- Favicon set (`.ico` + PNG sizes) ← simplified icon
- OG / social image ← lockup
- Nav logo + hero emblem ← emblem/lockup
- Body/heading **font pairing** ← if the wordmark dictates one (default to a sensible pairing meanwhile)

Swap-in is a single labeled task group; the locked palette means tokens don't change.

## Dependencies & open items

- **Branding assets** — parallel session; Clay supplies filepath when done.
- **Myles to set up** Cal.com (availability/calendar) + Tally (Elite inquiries) accounts → embed IDs.
- **Market research** — Long Beach competitors/pricing; informs `packages.json`. Flag: **+$100 video analysis on a $45 session** needs validation.
- **Photos** — current 7 are low-res, game-day only, no headshot, minor-consent on identifiable kids. Want higher-res + 1-on-1 training shots + a headshot; launch-able with current set.
- **Google Business Profile** — top local-SEO lever; off-site, Clay/Myles to create.

## Risks / validations

- Cal.com / Tally / Stripe **free-tier** limits — verify current state before locking the booking tool.
- **Contrast:** `#005A9C` on white passes AA; accent red `#EF3E42` must be used for accents/buttons, not body text — verify AA on every pairing in the check script.
- **Hero image quality** — 600px sources may look soft full-bleed; mitigate with scrim/crop, swap when better photos arrive.

## Out of scope

- Online payments (fast-follow), blog/CMS, player portal/login, e-commerce, multi-page IA, the branding asset generation itself (separate session).

## Testing / quality

- `astro check` (TS + template validation).
- Adapted `scripts/check-voice.sh` — palette anti-pattern grep (no off-brand hex), basic content/voice rules, pricing sanity.
- Manual: live preview on mobile + desktop; Lighthouse pass (perf/a11y/SEO); validate JSON-LD.
