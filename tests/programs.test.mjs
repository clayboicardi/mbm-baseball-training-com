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
