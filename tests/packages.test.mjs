import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

// `pretest` (astro build) populates dist/ first. These assert the built package
// pages, the homepage links, and that each page's Offer price matches the
// locked packages.json (so a page can never drift from real pricing).
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const packages = JSON.parse(readFileSync(join(root, "src", "data", "packages.json"), "utf8"));
const tiers = packages.tiers;

const LD_RE = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
function graph(html) {
  const blocks = [...html.matchAll(LD_RE)].map((m) => m[1]);
  assert.equal(blocks.length, 1, "expected exactly one JSON-LD block");
  return JSON.parse(blocks[0])["@graph"];
}
function typesOf(g) {
  const set = new Set();
  for (const node of g) (Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]]).forEach((t) => set.add(t));
  return set;
}

test("every packages.json tier has a built /packages/<id>/ page", () => {
  for (const t of tiers) {
    assert.ok(existsSync(join(dist, "packages", t.id, "index.html")), `missing /packages/${t.id}/`);
  }
});

test("each package page carries Service + WebPage + BreadcrumbList", () => {
  for (const t of tiers) {
    const g = graph(readFileSync(join(dist, "packages", t.id, "index.html"), "utf8"));
    const types = typesOf(g);
    for (const type of ["Service", "WebPage", "BreadcrumbList", "LocalBusiness", "WebSite", "Person"]) {
      assert.ok(types.has(type), `/packages/${t.id}/ missing @type ${type}`);
    }
  }
});

test("each package page's Offer price matches the locked packages.json", () => {
  for (const t of tiers) {
    const g = graph(readFileSync(join(dist, "packages", t.id, "index.html"), "utf8"));
    const service = g.find((n) => {
      const ty = Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]];
      return ty.includes("Service");
    });
    assert.ok(service?.offers, `/packages/${t.id}/ Service has no nested Offer`);
    assert.equal(service.offers.price, String(t.price), `/packages/${t.id}/ Offer price drifted from packages.json`);
    assert.equal(service.offers.priceCurrency, packages.currency);
  }
});

test("package pages have an accessible breadcrumb with aria-current", () => {
  const html = readFileSync(join(dist, "packages", "elite-season", "index.html"), "utf8");
  assert.match(html, /<nav aria-label="Breadcrumb"/);
  assert.match(html, /aria-current="page"/);
});

test("packages hub is a CollectionPage", () => {
  const file = join(dist, "packages", "index.html");
  assert.ok(existsSync(file), "missing /packages/ hub");
  assert.ok(typesOf(graph(readFileSync(file, "utf8"))).has("CollectionPage"));
});

test("homepage links each package card to its detail page", () => {
  const html = readFileSync(join(dist, "index.html"), "utf8");
  for (const t of tiers) {
    assert.match(html, new RegExp(`href="/packages/${t.id}/"`), `homepage missing link to /packages/${t.id}/`);
  }
});

test("no forbidden Review/AggregateRating leaked into package pages", () => {
  for (const t of tiers) {
    const html = readFileSync(join(dist, "packages", t.id, "index.html"), "utf8");
    const g = JSON.stringify(graph(html));
    assert.doesNotMatch(g, /"@type":"(Review|AggregateRating|FAQPage|ProfessionalService)"/);
  }
});
