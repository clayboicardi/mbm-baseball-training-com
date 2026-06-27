import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

// `pretest` (astro build) populates dist/ first.
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

const pitching = JSON.parse(readFileSync(join(root, "src", "data", "pitching.json"), "utf8"));
const pillars = JSON.parse(readFileSync(join(root, "src", "data", "pillars.json"), "utf8"));
// The pillars whose pages live under /coaching/ (Pitching links out to /pitching/).
const coachingPillars = pillars.filter((p) => p.href.startsWith("/coaching/"));

const LD_RE = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
function graphTypes(html) {
  const blocks = [...html.matchAll(LD_RE)].map((m) => m[1]);
  assert.equal(blocks.length, 1, "expected exactly one JSON-LD block");
  const set = new Set();
  for (const node of JSON.parse(blocks[0])["@graph"]) {
    const t = node["@type"];
    (Array.isArray(t) ? t : [t]).forEach((x) => set.add(x));
  }
  return set;
}

test("every coaching pillar slug resolves to a built page", () => {
  for (const p of coachingPillars) {
    const slug = p.href.replace(/^\/coaching\//, "").replace(/\/$/, "");
    assert.ok(existsSync(join(dist, "coaching", slug, "index.html")), `missing ${p.href}`);
  }
});

test("every Arsenal card slug resolves to a built pitch page", () => {
  for (const p of pitching.arsenal) {
    assert.ok(existsSync(join(dist, "pitching", p.slug, "index.html")), `missing /pitching/${p.slug}/`);
  }
});

test("each coaching pillar page carries Service + WebPage + BreadcrumbList", () => {
  for (const p of coachingPillars) {
    const slug = p.href.replace(/^\/coaching\//, "").replace(/\/$/, "");
    const types = graphTypes(readFileSync(join(dist, "coaching", slug, "index.html"), "utf8"));
    for (const t of ["Service", "WebPage", "BreadcrumbList", "LocalBusiness", "WebSite", "Person"]) {
      assert.ok(types.has(t), `/coaching/${slug}/ missing @type ${t}`);
    }
  }
});

test("coaching pages have an accessible breadcrumb with aria-current", () => {
  const html = readFileSync(join(dist, "coaching", "hitting", "index.html"), "utf8");
  assert.match(html, /<nav aria-label="Breadcrumb"/);
  assert.match(html, /aria-current="page"/);
});

test("footer nav landmarks each have a unique aria-label", () => {
  const html = readFileSync(join(dist, "index.html"), "utf8");
  const footer = html.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? "";
  const navs = [...footer.matchAll(/<nav\b([^>]*)>/g)].map((m) => m[1]);
  assert.ok(navs.length >= 4, `expected 4+ footer navs, found ${navs.length}`);
  const labels = navs.map((attrs) => attrs.match(/aria-label="([^"]+)"/)?.[1]);
  assert.ok(labels.every(Boolean), "every footer nav must have an aria-label");
  assert.equal(new Set(labels).size, labels.length, "footer nav aria-labels must be unique");
});

test("coaching hub is a CollectionPage", () => {
  const file = join(dist, "coaching", "index.html");
  assert.ok(existsSync(file), "missing /coaching/ hub");
  assert.ok(graphTypes(readFileSync(file, "utf8")).has("CollectionPage"));
});
