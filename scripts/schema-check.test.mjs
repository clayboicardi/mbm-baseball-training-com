import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SITE,
  resolveRefs,
  routeTypeFailures,
  deepHasType,
  deepHasKey,
  collectRefs,
  collectTopLevelTypes,
  canonicalUrlFor,
  expectedExtra,
} from "./schema-check.mjs";

const IDENTITY = new Set(["LocalBusiness", "SportsActivityLocation", "WebSite", "Person"]);

test("resolveRefs: intra-page ref resolves against defined set", () => {
  const defined = new Set([`${SITE}/#localbusiness`, `${SITE}/#webpage`]);
  const refs = [`${SITE}/#localbusiness`];
  assert.deepEqual(resolveRefs("index.html", refs, defined, new Map()), []);
});

test("resolveRefs: unknown ref fails", () => {
  const defined = new Set([`${SITE}/#localbusiness`]);
  const out = resolveRefs("index.html", [`${SITE}/#nope`], defined, new Map());
  assert.equal(out.length, 1);
  assert.match(out[0], /unresolved @id reference/);
});

test("resolveRefs: cross-page ref resolves via pageIdMap", () => {
  const map = new Map([[`${SITE}/hitting/`, new Set([`${SITE}/hitting/#service`])]]);
  const out = resolveRefs("index.html", [`${SITE}/hitting/#service`], new Set(), map);
  assert.deepEqual(out, []);
});

test("routeTypeFailures: home with WebPage passes", () => {
  const types = new Set([...IDENTITY, "WebPage"]);
  assert.deepEqual(routeTypeFailures("index.html", types), []);
});

test("routeTypeFailures: home missing WebPage fails", () => {
  const out = routeTypeFailures("index.html", new Set(IDENTITY));
  assert.equal(out.length, 1);
  assert.match(out[0], /missing expected @type "WebPage"/);
});

test("routeTypeFailures: legal page with exact identity passes", () => {
  assert.deepEqual(routeTypeFailures("privacy/index.html", new Set(IDENTITY)), []);
});

test("routeTypeFailures: legal page with extra WebPage fails (identity-only)", () => {
  const out = routeTypeFailures("terms/index.html", new Set([...IDENTITY, "WebPage"]));
  assert.equal(out.length, 1);
  assert.match(out[0], /unexpected @type "WebPage"/);
});

test("routeTypeFailures: any page missing a global type fails", () => {
  const out = routeTypeFailures("index.html", new Set(["WebSite", "Person", "WebPage"]));
  assert.ok(out.some((f) => /missing required global @type "LocalBusiness"/.test(f)));
});

test("routeTypeFailures: local landing page pattern passes", () => {
  const types = new Set([...IDENTITY, "Service", "WebPage", "BreadcrumbList"]);
  assert.deepEqual(routeTypeFailures("baseball-lessons/long-beach/index.html", types), []);
});

test("routeTypeFailures: pitch post pattern passes", () => {
  const types = new Set([...IDENTITY, "Article", "WebPage", "BreadcrumbList"]);
  assert.deepEqual(routeTypeFailures("pitching/changeup/index.html", types), []);
});

test("expectedExtra: pitch hub expects CollectionPage + BreadcrumbList", () => {
  assert.deepEqual(expectedExtra("pitching/index.html"), ["CollectionPage", "BreadcrumbList"]);
});

test("expectedExtra: local-pages hub expects CollectionPage + BreadcrumbList", () => {
  assert.deepEqual(expectedExtra("baseball-lessons/index.html"), ["CollectionPage", "BreadcrumbList"]);
});

test("deepHasType: detects forbidden FAQPage nested and via @type array", () => {
  assert.equal(deepHasType([{ "@type": "WebPage", x: { "@type": "FAQPage" } }], "FAQPage"), true);
  assert.equal(deepHasType([{ "@type": ["Thing", "Review"] }], "Review"), true);
  assert.equal(deepHasType([{ "@type": "WebPage" }], "AggregateRating"), false);
});

test("deepHasKey: detects forbidden aggregateRating/review props", () => {
  assert.equal(deepHasKey([{ "@type": "X", aggregateRating: {} }], "aggregateRating"), true);
  assert.equal(deepHasKey([{ "@type": "X" }], "review"), false);
});

test("collectRefs: returns nested @ids, not top-level node @ids", () => {
  const a = { "@type": "WebPage", "@id": `${SITE}/#webpage`, about: { "@id": `${SITE}/#localbusiness` } };
  const b = { "@type": "LocalBusiness", "@id": `${SITE}/#localbusiness` };
  const refs = collectRefs([a, b]);
  assert.deepEqual(refs, [`${SITE}/#localbusiness`]);
});

test("collectTopLevelTypes: flattens @type arrays", () => {
  const types = collectTopLevelTypes([{ "@type": ["LocalBusiness", "SportsActivityLocation"] }, { "@type": "WebSite" }]);
  assert.ok(types.has("LocalBusiness") && types.has("SportsActivityLocation") && types.has("WebSite"));
});

test("canonicalUrlFor: index and nested routes", () => {
  assert.equal(canonicalUrlFor("index.html"), `${SITE}/`);
  assert.equal(canonicalUrlFor("privacy/index.html"), `${SITE}/privacy/`);
});
