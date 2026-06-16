// Global identity graph — emitted on EVERY route by StructuredData.astro.
//
// Ported from clayboicardi.com's typed @graph system, right-sized for a single
// local business: the LocalBusiness/SportsActivityLocation IS the anchor entity
// (no separate Organization). These three nodes (business + website + coach)
// carry stable @ids and appear on every page so per-route nodes (WebPage,
// Service, Article, BreadcrumbList) can cross-reference them.
//
// Builders return BARE nodes (no @context) — StructuredData.astro adds the single
// top-level @context when it merges everything into one @graph.
import site from "./site.json";
import packagesData from "./packages.json";

// Canonical origin, no trailing slash. Centralized for @id stability — do NOT
// derive from Astro.site (keeps @ids identical regardless of render context).
export const SITE = "https://mbm-baseball-training.com";

// The three global @ids. Every page's graph contains these as top-level nodes.
export const ID = {
  localBusiness: `${SITE}/#localbusiness`,
  website: `${SITE}/#website`,
  coach: `${SITE}/#coach`,
} as const;

// Stable business-level strings (NOT page-specific — the business entity is the
// same on every URL, so its description/image must not vary per page).
const BUSINESS_DESCRIPTION =
  "Private 1-on-1 youth baseball lessons in Long Beach and Orange County — hitting, fielding, throwing, baseball IQ, and the mental game for players ages 8–18, coached by Myles Berniard-Mendez.";
const BUSINESS_IMAGE = `${SITE}/mbm-og.png`;
const BOOK_URL = `${SITE}/#book`;

// Service-area coverage. Myles travels to fields/parks; areaServed carries the
// coverage in lieu of a single geo point (Decision: service-area business, so
// geo / openingHoursSpecification / street address are intentionally omitted —
// confirmed with Clay 2026-06-15).
const AREA_SERVED = [
  { "@type": "City", name: "Long Beach" },
  { "@type": "AdministrativeArea", name: "Los Angeles County" },
  { "@type": "AdministrativeArea", name: "Orange County" },
  { "@type": "City", name: "Irvine" },
  { "@type": "City", name: "Newport Beach" },
  { "@type": "City", name: "Huntington Beach" },
  { "@type": "City", name: "Costa Mesa" },
  { "@type": "City", name: "Mission Viejo" },
  { "@type": "City", name: "Aliso Viejo" },
  { "@type": "City", name: "Laguna Beach" },
  { "@type": "City", name: "Laguna Niguel" },
  { "@type": "City", name: "Ladera Ranch" },
  { "@type": "City", name: "Dana Point" },
  { "@type": "City", name: "San Juan Capistrano" },
  { "@type": "City", name: "San Clemente" },
];

/** LocalBusiness / SportsActivityLocation — the anchor entity. */
export function localBusinessNode() {
  const telephone = site.business.phoneHref?.replace("tel:", "") ?? "";
  return {
    "@type": ["LocalBusiness", "SportsActivityLocation"],
    "@id": ID.localBusiness,
    name: site.business.name,
    description: BUSINESS_DESCRIPTION,
    image: BUSINESS_IMAGE,
    url: `${SITE}/`,
    // Omit telephone entirely if unset, rather than emitting an empty string.
    ...(telephone ? { telephone } : {}),
    email: site.business.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Long Beach",
      addressRegion: "CA",
      addressCountry: "US",
    },
    // Home-base park (Heartwell Park, Long Beach) per Myles via Clay 2026-06-16.
    // A coarse anchor for a service-area business; no public street address.
    geo: {
      "@type": "GeoCoordinates",
      latitude: 33.8313,
      longitude: -118.1206,
    },
    areaServed: AREA_SERVED,
    sameAs: [site.business.instagram],
    founder: { "@id": ID.coach },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Baseball training packages",
      itemListElement: packagesData.tiers.map((tier) => ({
        "@type": "Offer",
        name: tier.name,
        price: tier.price,
        priceCurrency: packagesData.currency,
        url: BOOK_URL,
      })),
    },
    // Min non-zero tier ($55) to top tier ($1,500); tracks packages.json.
    priceRange: "$55–$1,500",
    // Myles's stated availability: any day, 6am–7pm (summer). By-appointment
    // within this window (Myles via Clay 2026-06-16).
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "06:00",
      closes: "19:00",
    },
  };
}

/** WebSite node — publisher is the business. */
export function webSiteNode() {
  return {
    "@type": "WebSite",
    "@id": ID.website,
    url: `${SITE}/`,
    name: site.business.name,
    publisher: { "@id": ID.localBusiness },
    inLanguage: "en-US",
  };
}

/** Coach Myles — the founder Person, author of pitch articles. */
export function coachNode() {
  return {
    "@type": "Person",
    "@id": ID.coach,
    name: site.business.coach,
    jobTitle: "Private youth baseball coach",
    worksFor: { "@id": ID.localBusiness },
    sameAs: [site.business.instagram],
    knowsAbout: [
      "Hitting lessons",
      "Fielding",
      "Throwing mechanics",
      "Baseball IQ",
      "Pitching development",
      "Sports psychology",
    ],
  };
}

/** The global identity graph, in stable order, emitted on every route. */
export function globalNodes() {
  return [localBusinessNode(), webSiteNode(), coachNode()];
}
