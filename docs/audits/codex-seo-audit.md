# SEO Audit: MBM Baseball Training

Live site checked: https://www.mbm-baseball-training.com  
Source checked from repo root on 2026-06-01. Build validation passed with `npm run check:content` and `npm run build`.

## Executive Summary

The site has a solid single-page foundation: one clear H1, strong free-first-lesson CTAs, valid-looking OG/Twitter metadata, a 1200x630 OG image, robots/sitemap output, and visible NAP/contact paths. The biggest SEO risks are local-SEO entity signals rather than basic crawlability.

Top priorities:

1. Resolve the canonical host issue. Source, sitemap, robots, schema, and OG URLs point to `https://mbm-baseball-training.com`, while the live promoted URL is `https://www.mbm-baseball-training.com`. In this run both hosts returned 200 with no host redirect, which creates duplicate host access; if apex is not reliably attached, the canonical points at the wrong host.
2. Strengthen LocalBusiness/SportsActivityLocation schema for Long Beach local intent.
3. Add page-specific descriptions and suppress homepage LocalBusiness schema on legal/404 pages.
4. Improve LCP handling by moving the hero image out of CSS background-only delivery or preloading it.
5. Treat Google Business Profile as the main local-pack lever, then align NAP, categories, services, photos, and reviews.

## On-Site Fixes For Implementer

### Critical

**Where:** `astro.config.mjs:8`, `src/layouts/BaseLayout.astro:12`, `public/robots.txt:3`, generated `dist/sitemap-*.xml`, live `www` homepage canonical  
**Issue:** Canonical/site URLs are apex (`https://mbm-baseball-training.com`) while the live shared host is `www`. Live checks returned 200 on both apex and `www` with no host redirect, and `www` HTML canonicalizes to apex. This can split crawl signals or canonicalize to a host that is not consistently attached.  
**Fix:** Pick one canonical host and enforce it everywhere. Given the current live URL, fastest fix is:

```js
// astro.config.mjs
site: 'https://www.mbm-baseball-training.com',
```

Then update `public/robots.txt` sitemap URL, rebuild sitemap, and make JSON-LD/OG/canonical inherit the same host. Longer-term, attach apex and add a 301 redirect from the non-canonical host to the canonical host.  
**Effort:** S-M.

**Where:** `src/layouts/BaseLayout.astro:15-29` JSON-LD  
**Issue:** LocalBusiness schema is present but thin for local search: no stable `@id`, no geo coordinates, no opening hours, no postal code/street/service-area detail, no founder/coach Person, no Service/Offer catalog for packages, and `areaServed` is a single text string.  
**Fix:** Expand schema using known facts only. Do not invent a street address if MBM is a service-area business or uses private fields. Add actual training location or service-area geo when confirmed.

```js
const businessId = new URL('/#localbusiness', Astro.site).href;
const schema = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'SportsActivityLocation'],
  '@id': businessId,
  name: site.business.name,
  url: Astro.site?.href,
  telephone: '+15628840746',
  email: site.business.email,
  image: ogImage,
  priceRange: '$55-$1,500',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Long Beach',
    addressRegion: 'CA',
    addressCountry: 'US'
  },
  geo: { '@type': 'GeoCoordinates', latitude: 'CONFIRM', longitude: 'CONFIRM' },
  areaServed: [
    { '@type': 'City', name: 'Long Beach' },
    { '@type': 'AdministrativeArea', name: 'Los Angeles County' }
  ],
  sameAs: [site.business.instagram],
  founder: {
    '@type': 'Person',
    name: site.business.coach,
    jobTitle: 'Private youth baseball coach',
    sameAs: [site.business.instagram],
    knowsAbout: ['Hitting lessons', 'Fielding', 'Throwing mechanics', 'Baseball IQ']
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Baseball training packages',
    itemListElement: packagesData.tiers.map((tier) => ({
      '@type': 'Offer',
      name: tier.name,
      price: tier.price,
      priceCurrency: 'USD',
      url: new URL('/#book', Astro.site).href
    }))
  }
};
```

Add `openingHoursSpecification` once actual lesson availability is known. Add `aggregateRating` or `Review` only after real testimonials/reviews are collected and displayed on the page.  
**Effort:** M.

### Important

**Where:** `src/layouts/BaseLayout.astro:8`, `src/layouts/LegalLayout.astro:7`, `src/pages/404.astro:3`  
**Issue:** Privacy, terms, and 404 pages inherit the homepage meta description and LocalBusiness schema. Built output confirms identical 159-character description on all pages and LocalBusiness schema on legal/404 pages.  
**Fix:** Let layouts accept `description`, `schema`, and `noindex` props. Give legal pages short legal descriptions. For 404, use `noindex, follow`, a short 404 description, and either omit LocalBusiness schema or keep only minimal Organization/WebSite schema on non-home pages.  
**Effort:** S-M.

**Where:** `src/pages/404.astro:5-9`, live missing URL response  
**Issue:** Random missing URLs correctly return HTTP 404, but the 404 template has no H1 and canonicalizes to `/404/`. The direct `/404` route returns 200, so it can be indexed unless noindexed.  
**Fix:** Change the visual 404 label to an H1 or add an H1 such as `Page Not Found`. Add a `noindex` layout prop for this page.  
**Effort:** S.

**Where:** `src/data/site.json:23`, `src/layouts/BaseLayout.astro:8,44`  
**Issue:** Homepage meta description is within typical length at 159 chars, but it lacks "Long Beach" and a booking CTA.  
**Fix:** Replace with a local/CTA description:

```txt
Private youth baseball lessons in Long Beach with Coach Myles. Hitting, fielding, throwing, and baseball IQ for ages 8-18. Claim a free first lesson.
```

**Effort:** S.

**Where:** `src/components/Hero.astro:5,8`  
**Issue:** The likely LCP image is a CSS background, so the browser discovers it later than a high-priority image. The optimized hero WebP is small, but discovery still matters on mobile.  
**Fix:** Prefer an absolutely positioned Astro `<Image>`/`<picture>` in the hero with `loading="eager"` and `fetchpriority="high"`, or at minimum add a preload for `bg.src`. Give the image useful alt text if it is contentful, for example "Coach Myles Berniard-Mendez leading a youth baseball training session in Long Beach."  
**Effort:** S-M.

**Where:** `src/data/site.json:22-23`, `src/components/Services.astro:7`, `src/components/About.astro:10-12`, `src/data/services.json`  
**Issue:** Local keywords are present but not fully aligned to the target queries. The page says "Private Baseball Training in Long Beach" but does not naturally cover exact variants like "baseball lessons Long Beach", "private baseball coach Long Beach", "hitting lessons Long Beach", and "baseball coach for kids Long Beach."  
**Fix:** Update one or two headings and body lines without stuffing. Examples: `Private Baseball Lessons in Long Beach`, `Hitting Lessons, Fielding, Throwing Mechanics, and Baseball IQ`, and "Parents looking for a private baseball coach in Long Beach can start with a free first lesson."  
**Effort:** S.

**Where:** `src/components/Contact.astro:4-13`, `src/components/Footer.astro:9-17`, `src/data/site.json:6-10`  
**Issue:** NAP is visible, but address/location detail is intentionally broad. For local SEO, Google and citations benefit from consistent service-area/address detail.  
**Fix:** Decide whether this is a service-area business or public training location. If public, add street/postal code and map/GBP link. If private/mobile, keep service-area wording but add a clear "Baseball lessons in Long Beach, CA" contact block and align it to GBP.  
**Effort:** M.

**Where:** `src/components/Proof.astro:12`, `src/assets/photos/gallery/*`  
**Issue:** Gallery image alt text is duplicated across all photos, and source filenames are UUIDs. This misses image SEO context and can be noisy for screen readers.  
**Fix:** Rename source images descriptively when replacing placeholders, and provide unique alt text for meaningful photos. Use `alt=""` for decorative repeats.  
**Effort:** S-M.

### Minor

**Where:** `src/layouts/BaseLayout.astro:7`, homepage title  
**Issue:** Homepage title is 62 characters: good keyword/locality coverage but slight truncation risk.  
**Fix:** Consider tightening to `Private Baseball Lessons Long Beach | MBM Baseball Training` or `MBM Baseball Training | Baseball Lessons Long Beach`.  
**Effort:** S.

**Where:** `src/components/Proof.astro:8`  
**Issue:** The "On the Field" section has no descriptive id, while other sections do.  
**Fix:** Add `id="on-the-field"` or `id="gallery"` for anchorability and clearer section semantics.  
**Effort:** XS.

**Where:** `src/components/Nav.astro:18-19`, `src/components/Hero.astro:12`, generated image tags  
**Issue:** Astro marks logos/emblem as lazy-loaded by default. This is usually minor, but the hero emblem appears above the fold.  
**Fix:** Mark the emblem/logo in the first viewport as eager if it visibly affects initial render.  
**Effort:** XS.

**Where:** `src/layouts/BaseLayout.astro:45-55`, public `mbm-og.png`  
**Issue:** OG/Twitter tags are complete and the OG image is 1200x630 and live 200. They inherit the host mismatch if canonical host changes.  
**Fix:** After choosing canonical host, verify `og:url`, `og:image`, `twitter:image`, and schema `image` all use that host. Optional: add `twitter:site` if the brand/X account exists.  
**Effort:** XS.

## Off-Site Local SEO Actions

### Critical

**Google Business Profile:** Create/verify and fully complete GBP. Use the real business name, phone, website, service area, categories, services, hours/availability, photos, and booking/contact URL. This is the top local-pack lever.

**Reviews:** Once real customers exist, ask parents for Google reviews after lessons. Encourage natural detail about the service and city, such as "hitting lesson" or "Long Beach", without scripting reviews. Add website testimonials only after permission.

### Important

**Citations:** Build consistent NAP on Bing Places, Apple Business Connect, Yelp, Facebook/Instagram, Nextdoor, local youth sports directories, and relevant coaching/lesson directories.

**Local backlinks:** Pursue links from Long Beach youth baseball leagues, teams, schools where allowed, community sponsor pages, local sports blogs, and partner facilities.

**GBP content:** Add real training photos regularly and keep services aligned with the site: private baseball lessons, hitting lessons, fielding, throwing mechanics, baseball IQ, youth baseball training.

## Crawlability And Indexability

Robots allows crawling and points to a sitemap. Sitemap includes `/`, `/privacy/`, and `/terms/`. Trailing slash handling redirects `/privacy` and `/terms` to slash URLs with 200 responses. No accidental `noindex` was found. Missing test URL returned HTTP 404.

The main crawl/index issue is host canonicalization. The secondary issue is the direct `/404` URL serving a 200 page with no H1 and no `noindex`.

## Structured Data Notes

Current JSON-LD includes `LocalBusiness` and `SportsActivityLocation`, name, description, image, URL, telephone, email, areaServed, city/state/country address, Instagram `sameAs`, and priceRange.

For Google LocalBusiness rich-result eligibility and entity understanding, strengthen required/recommended fields with accurate address/service area, geo, hours, telephone in E.164 format, images, sameAs, and service/offer data. Test with Google's Rich Results Test after deploy. For local-pack visibility, schema helps consistency but does not replace GBP, reviews, prominence, or proximity.

## Sources Checked

- Source files: `src/layouts/BaseLayout.astro`, `src/layouts/LegalLayout.astro`, `src/pages/*`, `src/components/*`, `src/data/site.json`, `src/data/services.json`, `src/data/packages.json`, `public/robots.txt`, `public/site.webmanifest`, `astro.config.mjs`, `wrangler.jsonc`, generated `dist/sitemap-index.xml`, generated `dist/sitemap-0.xml`.
- Live URLs: `https://www.mbm-baseball-training.com/`, `https://mbm-baseball-training.com/`, robots, sitemap index, sitemap, `/privacy`, `/terms`, missing 404 test URL, `mbm-og.png`.
- Official references: Google Local Business structured data documentation (https://developers.google.com/search/docs/appearance/structured-data/local-business), Google Business Profile local ranking guidance (https://support.google.com/business/answer/4454429), Schema.org LocalBusiness (https://schema.org/LocalBusiness).

## Prioritized Local-SEO Action Plan

1. Choose canonical host now. If only `www` is production, set Astro `site` and robots/sitemap/schema/OG to `https://www.mbm-baseball-training.com`, then 301 apex to `www` or attach apex and redirect `www` to apex.
2. Update homepage title/description/copy around "private baseball lessons in Long Beach" and "free first lesson."
3. Expand LocalBusiness schema with `@id`, E.164 phone, geo/service area, hours, founder Person, and OfferCatalog from packages.
4. Add unique legal/404 descriptions, remove LocalBusiness schema from legal/404 pages, and noindex the 404 route.
5. Convert or preload the hero image for LCP and keep CLS stable with explicit dimensions.
6. Add unique image alt text and replace UUID filenames as photo assets are upgraded.
7. Build/verify GBP, then align NAP, categories, services, photos, and website URL.
8. Start citations and local backlink outreach.
9. Collect real reviews/testimonials, then add visible testimonials and review/aggregateRating schema only when policy-compliant.
