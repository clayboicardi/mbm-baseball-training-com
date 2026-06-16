// Per-route structured-data node builders (clayboicardi @graph pattern, slimmed
// for a local-business site). All builders return BARE nodes (no @context);
// StructuredData.astro merges global + per-route nodes into one @graph.
//
// Cross-references use { "@id": "..." } pointing at either a global node
// (ID.localBusiness / ID.website / ID.coach — present on every page) or another
// top-level node on the same page. schema-check.mjs verifies every ref resolves.
import { SITE, ID } from "./schema-global";

/** Canonical @id for a page's BreadcrumbList — single source of truth so a page
 *  and anything referencing its breadcrumb stay mechanically in sync. */
export const breadcrumbIdFor = (url: string) => `${url}#breadcrumb`;
/** Canonical @id for a page's WebPage node. */
export const webPageIdFor = (url: string) => `${url}#webpage`;
/** Canonical @id for a page's Service node. */
export const serviceIdFor = (url: string) => `${url}#service`;

interface WebPageOpts {
  url: string;
  name: string;
  description?: string;
  /** @id of the entity this page is primarily about (e.g. a Service or the business). */
  about?: string;
  /** @id of this page's BreadcrumbList, if any. */
  breadcrumb?: string;
}

/** WebPage node. isPartOf always references the global WebSite. */
export function webPageNode(opts: WebPageOpts) {
  const node: Record<string, unknown> = {
    "@type": "WebPage",
    "@id": webPageIdFor(opts.url),
    url: opts.url,
    name: opts.name,
    isPartOf: { "@id": ID.website },
  };
  if (opts.description) node.description = opts.description;
  if (opts.about) {
    node.about = { "@id": opts.about };
    node.mainEntity = { "@id": opts.about };
  }
  if (opts.breadcrumb) node.breadcrumb = { "@id": opts.breadcrumb };
  return node;
}

interface Crumb {
  name: string;
  item: string;
}

/** BreadcrumbList node. `item` values are plain absolute URLs (not @id refs). */
export function breadcrumbNode(url: string, trail: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    "@id": breadcrumbIdFor(url),
    itemListElement: trail.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.item,
    })),
  };
}

interface OfferOpts {
  url: string;
  /** Price in major currency units (e.g. 55 or 0). Serialized as a string. */
  price: number;
  priceCurrency: string;
}

/** Nested Offer for a purchasable Service (price stays sourced from the locked
 *  packages.json — never hard-coded here). availability is always InStock. */
export function offerNode(opts: OfferOpts) {
  return {
    "@type": "Offer",
    price: String(opts.price),
    priceCurrency: opts.priceCurrency,
    availability: "https://schema.org/InStock",
    url: opts.url,
  };
}

interface ServiceOpts {
  url: string;
  name: string;
  description?: string;
  serviceType?: string;
  /** Override the global areaServed for a location-specific Service. */
  areaServed?: unknown;
  /** Nested Offer(s) for a purchasable Service (e.g. a pricing tier). */
  offers?: unknown;
}

/** Service node. provider always references the global business. */
export function serviceNode(opts: ServiceOpts) {
  const node: Record<string, unknown> = {
    "@type": "Service",
    "@id": serviceIdFor(opts.url),
    name: opts.name,
    provider: { "@id": ID.localBusiness },
    url: opts.url,
  };
  if (opts.serviceType) node.serviceType = opts.serviceType;
  if (opts.description) node.description = opts.description;
  if (opts.areaServed) node.areaServed = opts.areaServed;
  if (opts.offers) node.offers = opts.offers;
  return node;
}

interface ArticleOpts {
  url: string;
  headline: string;
  description?: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
}

/** Article node for a pitch post. author = coach, publisher = business. */
export function articleNode(opts: ArticleOpts) {
  const node: Record<string, unknown> = {
    "@type": "Article",
    "@id": `${opts.url}#article`,
    headline: opts.headline,
    url: opts.url,
    author: { "@id": ID.coach },
    publisher: { "@id": ID.localBusiness },
    mainEntityOfPage: { "@id": webPageIdFor(opts.url) },
  };
  if (opts.description) node.description = opts.description;
  if (opts.image) node.image = opts.image;
  if (opts.datePublished) node.datePublished = opts.datePublished;
  if (opts.dateModified) node.dateModified = opts.dateModified;
  return node;
}

interface CollectionPageOpts {
  url: string;
  name: string;
  description?: string;
  /** @ids of member entities (e.g. each city page's Service), as cross-page refs. */
  hasPart?: string[];
  breadcrumb?: string;
}

/** CollectionPage node (a WebPage subtype) for hub pages — no separate WebPage
 *  node needed. */
export function collectionPageNode(opts: CollectionPageOpts) {
  const node: Record<string, unknown> = {
    "@type": "CollectionPage",
    "@id": webPageIdFor(opts.url),
    url: opts.url,
    name: opts.name,
    isPartOf: { "@id": ID.website },
  };
  if (opts.description) node.description = opts.description;
  if (opts.hasPart?.length) node.hasPart = opts.hasPart.map((id) => ({ "@id": id }));
  if (opts.breadcrumb) node.breadcrumb = { "@id": opts.breadcrumb };
  return node;
}

/** Absolute URL for a site-relative path, e.g. abs("/baseball-lessons/") . */
export const abs = (path: string) => `${SITE}${path}`;
