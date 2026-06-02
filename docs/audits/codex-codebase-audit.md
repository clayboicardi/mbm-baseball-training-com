# MBM Baseball Training - Engineering Codebase Audit

Date: 2026-06-01
Scope: Astro/Tailwind/daisyUI static codebase, production build output, package/deploy config, and live HEAD checks for the deployed Cloudflare hosts.

## Verification Performed

- `npm run check:content` passed.
- `npm run check` passed: 0 errors, 0 warnings, 0 hints across 20 Astro files.
- `npm run build` passed: 4 pages, sitemap generated, 11 optimized images generated.
- `npm ls vite @tailwindcss/vite tailwindcss daisyui astro` confirmed the Vite override resolves Astro and `@tailwindcss/vite` to Vite 7.3.5.
- `npm audit --omit=dev` found 0 runtime dependency vulnerabilities.
- `npm audit` found 5 moderate dev-only advisories through `@astrojs/check` -> `yaml-language-server` -> `yaml`.
- Live HEAD checks on `https://www.mbm-baseball-training.com` and `https://mbm-baseball-training.com` both returned `200 OK` with no redirect.
- Live HEAD check on `/_astro/BaseLayout.BNaKMoxa.css` returned `Cache-Control: public, max-age=0, must-revalidate`.

## Intentional Non-Findings

- Booking fallback blocks are correctly rendered because `site.json` has empty Cal.com and Tally values.
- `testimonials.json` is empty and `Proof.astro` degrades cleanly.
- Low-resolution photos are not flagged per project direction.
- Missing `priceFlag` / `paymentPlan` data is not flagged.
- The one `@ts-ignore` in `astro.config.mjs:10` is documented and matches the Vite 7/8 type mismatch note.
- `set:html` is only used for static code-built JSON-LD in `BaseLayout.astro:56`; I did not find other unsafe HTML injection.
- External Instagram links use `target="_blank"` with `rel="noopener noreferrer"` in `Footer.astro:14` and `Proof.astro:27`.
- Booking iframes are already sandboxed and have `referrerpolicy` in `Booking.astro:14` and `Booking.astro:26`.

## Critical

No critical findings.

## Important

### 1. Canonical host is inconsistent with the deployed hosts

File: `astro.config.mjs:8`, `wrangler.jsonc:10-12`, `public/robots.txt:3`

What is wrong: The checked-in Astro `site` and robots sitemap URL use `https://mbm-baseball-training.com`, while the project brief identifies `https://www.mbm-baseball-training.com` as the live site. Both apex and `www` return `200 OK` directly, so there is no deployed canonical-host redirect. The live `www` page also emits apex-domain canonical, OG, schema, and sitemap URLs.

Why it matters: This creates two first-class hosts for the same site. Even if search is audited separately, this is still deployment correctness: absolute URLs, social cards, schema `url`, sitemap entries, analytics attribution, cache behavior, and user-shared URLs can diverge.

Concrete fix: Choose one canonical host and enforce it everywhere. If `www` is the intended public host, update:

```js
// astro.config.mjs
site: 'https://www.mbm-baseball-training.com',
```

Then update `public/robots.txt` to:

```txt
Sitemap: https://www.mbm-baseball-training.com/sitemap-index.xml
```

Add a Cloudflare Redirect Rule from apex to `www`. If apex is intended instead, leave Astro as-is and redirect `www` to apex.

Effort: quick-win if done with Cloudflare rules and two file edits.

### 2. Live responses lack basic security headers

File: `wrangler.jsonc:5-13`

What is wrong: The checked-in Worker config only declares static assets and routes. Live responses for both hostnames did not include common hardening headers such as `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`, or `frame-ancestors`.

Why it matters: This is a static marketing site, so the exploit surface is small, but the site embeds third-party booking surfaces and handles parent contact intent. Missing headers weaken browser-side protections against content sniffing, clickjacking, overly broad referrer leakage, and accidental future script/style expansion.

Concrete fix: Add Cloudflare response-header rules, or add a thin Worker if the team wants headers versioned in code. A starting policy for the current site:

```txt
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; base-uri 'self'; frame-ancestors 'none'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; frame-src https://cal.com https://tally.so; connect-src 'self'
```

The `unsafe-inline` allowances are currently needed because the hero uses an inline `style` attribute and JSON-LD is inline. Tighten this after moving the hero image out of inline CSS or after adding CSP hashes.

Effort: quick-win for Cloudflare dashboard rules; larger if implemented as a versioned Worker.

### 3. Hashed static assets are served with no long-lived browser cache

File: `wrangler.jsonc:5-13`

What is wrong: The live hashed CSS asset `/_astro/BaseLayout.BNaKMoxa.css` returned `Cache-Control: public, max-age=0, must-revalidate`. Astro emits content-hashed asset names specifically so those files can be cached aggressively.

Why it matters: Parents on phones are likely to revisit or bounce between links. Forcing validation on hashed CSS, font, and image assets adds avoidable latency and network dependency on repeat visits.

Concrete fix: Add Cloudflare cache/header rules for immutable build assets:

```txt
Path: /_astro/*
Cache-Control: public, max-age=31536000, immutable
```

Keep HTML as `max-age=0, must-revalidate` so content updates are visible quickly. Consider shorter but still useful caching for non-hashed public files like favicons and `mbm-og.png`.

Effort: quick-win.

### 4. The red accent token fails WCAG AA for normal text

File: `src/styles/global.css:21-22`, `src/components/Hero.astro:17`, `src/components/PackageCard.astro:19`, `src/components/PackageCard.astro:33`, `src/components/Contact.astro:9`, `src/components/About.astro:13`

What is wrong: `--color-accent: #EF3E42` with white text has a contrast ratio of 3.86:1. That misses WCAG 2.1 AA for normal-size text. It affects primary CTAs (`btn-accent`), the "Best Value" badge, and red text treatments.

Why it matters: The highest-value action on the page ("Claim Your Free First Lesson") is not reliably readable for low-vision users or phones in bright outdoor light.

Concrete fix: Use the exact brand red for non-text decoration only, and use a darker accessible red for text-bearing UI. A close AA-safe option is:

```css
--color-accent: #D72B31;
--color-accent-content: #FFFFFF;
```

`#D72B31` on white text is about 4.91:1. Alternatively, keep `#EF3E42` for borders/icons and make CTA buttons primary blue.

Effort: quick-win, followed by a visual pass.

### 5. There is no skip link / bypass mechanism

File: `src/layouts/BaseLayout.astro:58-59`, `src/pages/index.astro:15`, `src/layouts/LegalLayout.astro:8`, `src/pages/404.astro:5`

What is wrong: The index page starts with a sticky nav and has no keyboard-visible "skip to content" link. Legal and 404 pages also have `<main>` landmarks, but no shared bypass link targets.

Why it matters: WCAG 2.1 AA requires a way to bypass repeated blocks. Keyboard and switch users should not have to tab through navigation before reaching page content.

Concrete fix: Add a skip link in `BaseLayout.astro` immediately inside `<body>`, and give each page's `<main>` an `id="main"`:

```astro
<a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:btn focus:btn-primary">
  Skip to content
</a>
```

Then update `index.astro`, `LegalLayout.astro`, and `404.astro` main elements to `id="main"`.

Effort: quick-win.

### 6. Hero LCP image is a CSS background with no responsive image or fetch priority

File: `src/components/Hero.astro:6-8`, `src/components/Hero.astro:12`

What is wrong: The hero photo is generated once at 1200px and applied as an inline CSS background. The emitted HTML has no `<img>`, `srcset`, `sizes`, preload, or `fetchpriority="high"` for the likely LCP image. The above-the-fold emblem also emits as `loading="lazy"`.

Why it matters: CSS background images are discovered later than high-priority image elements and cannot use Astro's responsive image machinery. This is a direct mobile LCP risk.

Concrete fix: Render the hero media as an absolutely positioned Astro `Image` or `Picture` behind the overlay:

```astro
<section id="top" class="hero min-h-[80vh] relative overflow-hidden">
  <Image
    src={heroImg}
    alt=""
    widths={[640, 960, 1200, 1600]}
    sizes="100vw"
    format="webp"
    loading="eager"
    fetchpriority="high"
    class="absolute inset-0 h-full w-full object-cover"
  />
  <div class="hero-overlay bg-neutral/85"></div>
  ...
</section>
```

Also set the emblem to `loading="eager"` or leave it unprioritized only after measuring.

Effort: larger, because it needs a viewport/LCP verification pass.

### 7. Font imports emit unnecessary subsets and fallback files

File: `src/styles/global.css:2-7`

What is wrong: The imports use package root weight CSS files such as `@fontsource/inter/400.css`. The built output includes many Cyrillic, Greek, Vietnamese, Latin, Latin-ext, `.woff`, and `.woff2` assets. The emitted CSS file is 97,630 bytes before compression.

Why it matters: CSS is render-blocking. The browser may only download matching unicode-range font files, but it still has to fetch and parse the larger CSS, and the deployment carries unnecessary assets.

Concrete fix: Import only needed subsets and weights:

```css
@import "@fontsource/oswald/latin-400.css";
@import "@fontsource/oswald/latin-600.css";
@import "@fontsource/oswald/latin-700.css";
@import "@fontsource/inter/latin-400.css";
@import "@fontsource/inter/latin-500.css";
@import "@fontsource/inter/latin-700.css";
```

If the name "Berniard-Mendez" and local copy do not need Latin-ext glyphs, Latin is enough. Otherwise add only the specific `latin-ext-*` weights needed.

Effort: quick-win, then verify `dist/_astro` asset count and visual glyph coverage.

## Minor

### 1. Gallery images all use the same generic alt text

File: `src/components/Proof.astro:12`

What is wrong: Every gallery image emits `alt="Coach Myles working with players"`.

Why it matters: Repeated generic alt text creates noise for screen reader users and does not describe what is unique about each image. If the gallery is decorative proof, it should not be announced repeatedly; if it is content, each image needs specific alt text.

Concrete fix: Move gallery to a small data array with `src` and `alt`, or set `alt=""` for decorative images:

```astro
{gallery.map((img) => <Image src={img} alt="" width={420} class="rounded-box w-full h-48 object-cover" />)}
```

Effort: quick-win.

### 2. Decorative icons and checkmarks are exposed as content

File: `src/components/ServiceCard.astro:8`, `src/components/PackageCard.astro:25`

What is wrong: Service icons and checkmark glyphs are visual decoration, but they are not marked `aria-hidden`.

Why it matters: Screen readers can announce decorative SVGs or repeated checkmarks, adding clutter before every card/list item.

Concrete fix:

```astro
<Icon name={icon} class="w-10 h-10 text-accent" aria-hidden="true" />
...
<span aria-hidden="true" class="text-accent font-bold">✓</span>
```

Effort: quick-win.

### 3. Mobile menu target sizing and close behavior should be tightened

File: `src/components/Nav.astro:9-15`

What is wrong: The mobile menu uses `menu-sm`, which produces compact menu links, and clicking an in-page anchor does not close the native `<details>` dropdown.

Why it matters: The audience is mostly parents on phones. Small menu rows are harder to tap, and a dropdown that remains open after navigation can cover content after the page scrolls.

Concrete fix: Use normal menu sizing or add `min-h-11` / `py-3` to links, and close the details element on menu link click with a tiny script or delegated event.

Effort: quick-win.

### 4. Currency is modeled in data but hard-coded in rendering

File: `src/data/packages.json:2`, `src/components/PackageCard.astro:15`, `src/components/PackageCard.astro:29`

What is wrong: `packages.json` declares `"currency": "USD"`, but package prices and add-ons render hard-coded `$` strings.

Why it matters: It weakens the content-as-data pattern. If pricing format changes, the data file suggests configurability that the UI does not honor.

Concrete fix: Pass `currency` into `PackageCard` and format numeric prices with `Intl.NumberFormat("en-US", { style: "currency", currency })`. Keep `priceLabel` as an override for intentionally custom labels.

Effort: quick-win.

### 5. Add-on key mistakes are silently dropped

File: `src/components/Packages.astro:11-14`, `scripts/check-content.mjs:26-31`

What is wrong: Package add-ons are resolved with `.map((k) => catalog[k]).filter(Boolean)`. A typo in `packages.json` would silently remove the add-on from the site. The content check validates JSON syntax and brand hexes but not add-on references.

Why it matters: This is the exact kind of content regression that can ship unnoticed on a static client site.

Concrete fix: Update `scripts/check-content.mjs` to assert every `tier.addOns[]` key exists in `addOnsCatalog`, every `cta.target` points to a known section id or URL, and every nav href points to an existing section id.

Effort: quick-win.

### 6. Proof/testimonial code opts out of type safety

File: `src/components/Proof.astro:6`, `src/components/Proof.astro:17`, `src/components/Packages.astro:12`

What is wrong: `Proof.astro` uses `(m as any).default` and `testimonials.map((t: any) => ...)`. `Packages.astro` casts JSON tiers with `as Tier[]`.

Why it matters: Astro strict mode is clean, but these casts hide content-shape errors from future edits. The empty testimonials file makes this easy to miss.

Concrete fix: Use explicit interfaces and `ImageMetadata`, or move structured content to `.ts` files / Astro content collections where `satisfies` can validate shapes.

Effort: larger if moving to content collections; quick-win for local interfaces.

### 7. Legal pages duplicate the email instead of using site data

File: `src/pages/privacy.astro:5-6`, `src/pages/terms.astro:5-6`, `src/data/site.json:10`

What is wrong: Privacy and Terms hard-code `Mylesberniardmendez@gmail.com` instead of importing `site.business.email`.

Why it matters: Contact info can drift between legal pages and the main site.

Concrete fix: Import `site` in both legal pages and render `mailto:${site.business.email}` plus display text from the JSON data.

Effort: quick-win.

### 8. 404 page has no real heading

File: `src/pages/404.astro:7-9`

What is wrong: The visible "404" is a paragraph, and the page has no `<h1>`.

Why it matters: Assistive technology users navigating by headings do not get a clear page title.

Concrete fix:

```astro
<h1 class="text-6xl font-heading font-bold text-primary">404</h1>
<p class="mt-4 text-base-content/70">Page not found. Let's get you back.</p>
```

Effort: quick-win.

### 9. Dev-only dependency audit has a moderate advisory

File: `package.json:28`, `package-lock.json:6760`, `package-lock.json:6999`

What is wrong: Full `npm audit` reports moderate advisories through `@astrojs/check` -> `yaml-language-server` -> `yaml@2.7.1`. Runtime audit with `--omit=dev` is clean.

Why it matters: This does not affect the deployed static site, but CI/developer tooling still processes project files. Avoid feeding untrusted YAML into the checker toolchain.

Concrete fix: Track an `@astrojs/check` / `@astrojs/language-server` update that pulls `yaml >= 2.8.3`. Do not blindly run `npm audit fix --force` here because npm proposes a breaking downgrade.

Effort: larger because it should be paired with dependency compatibility verification.

## Recommended Action List

1. Pick the canonical host. If `www` is the intended live host, update `astro.config.mjs`, `public/robots.txt`, and configure a Cloudflare apex-to-`www` redirect. If apex is intended, redirect `www` to apex.
2. Add Cloudflare response-header rules for HSTS, `nosniff`, referrer policy, permissions policy, CSP, and `frame-ancestors`. Test the CSP before enabling Cal.com/Tally embeds.
3. Add a Cloudflare cache rule for `/_astro/*` with `Cache-Control: public, max-age=31536000, immutable`; keep HTML revalidated.
4. Fix the accent contrast by darkening text-bearing accent UI to an AA-safe red such as `#D72B31`, or switch CTA buttons to primary blue and reserve `#EF3E42` for decoration.
5. Rework the hero background into an eager responsive Astro image with `widths`, `sizes`, and `fetchpriority="high"`. Verify the mobile LCP path after the change.
6. Add a shared skip link and `id="main"` targets to all pages; convert the 404 "404" paragraph to an `<h1>`.
7. Reduce font imports to Latin or Latin-ext-only `@fontsource` files and verify the rebuilt CSS and font asset count.
8. Tighten mobile nav behavior: larger menu rows and close `<details>` after a link click.
9. Clean up image/icon semantics: data-driven gallery alt text or decorative empty alts, `aria-hidden` on decorative icons/checkmarks.
10. Extend `scripts/check-content.mjs` to validate nav anchors, package CTA anchors, add-on keys, and package currency rendering assumptions.
11. Replace `any` casts in `Proof.astro` / package data handling with typed data shapes.
12. Track the dev-only `@astrojs/check` advisory and update when the Astro language-server chain pulls a patched `yaml`.

## Re-run After Fixes

```bash
npm run check:content
npm run check
npm run build
npm audit --omit=dev
curl.exe -I https://www.mbm-baseball-training.com
curl.exe -I https://www.mbm-baseball-training.com/_astro/<current-built-css>.css
```
