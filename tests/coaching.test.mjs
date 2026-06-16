import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

// `pretest` (astro build) populates dist/ first. These assert the built coaching
// section + that every homepage card slug resolves to a real built page.
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

const services = JSON.parse(readFileSync(join(root, "src", "data", "services.json"), "utf8"));
const pitching = JSON.parse(readFileSync(join(root, "src", "data", "pitching.json"), "utf8"));

const LD_RE = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
function graphTypes(html) {
  const blocks = [...html.matchAll(LD_RE)].map((m) => m[1]);
  assert.equal(blocks.length, 1, "expected exactly one JSON-LD block");
  const data = JSON.parse(blocks[0]);
  const set = new Set();
  for (const node of data["@graph"]) {
    const t = node["@type"];
    (Array.isArray(t) ? t : [t]).forEach((x) => set.add(x));
  }
  return set;
}

test("every 'What I Coach' card slug resolves to a built coaching page", () => {
  for (const s of services) {
    const file = join(dist, "coaching", s.slug, "index.html");
    assert.ok(existsSync(file), `missing /coaching/${s.slug}/ for service "${s.title}"`);
  }
});

test("every Arsenal card slug resolves to a built pitch page", () => {
  for (const p of pitching.arsenal) {
    const file = join(dist, "pitching", p.slug, "index.html");
    assert.ok(existsSync(file), `missing /pitching/${p.slug}/ for pitch "${p.name}"`);
  }
});

test("each coaching page carries Service + WebPage + BreadcrumbList", () => {
  for (const s of services) {
    const html = readFileSync(join(dist, "coaching", s.slug, "index.html"), "utf8");
    const types = graphTypes(html);
    for (const t of ["Service", "WebPage", "BreadcrumbList", "LocalBusiness", "WebSite", "Person"]) {
      assert.ok(types.has(t), `/coaching/${s.slug}/ missing @type ${t}`);
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
  // Scope to the <footer> so we don't pick up breadcrumb / header navs.
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

test("homepage links each 'What I Coach' card to its coaching page", () => {
  const html = readFileSync(join(dist, "index.html"), "utf8");
  for (const s of services) {
    assert.match(html, new RegExp(`href="/coaching/${s.slug}/"`), `homepage missing link to /coaching/${s.slug}/`);
  }
});

test("homepage links each Arsenal card to its pitch page", () => {
  const html = readFileSync(join(dist, "index.html"), "utf8");
  for (const p of pitching.arsenal) {
    assert.match(html, new RegExp(`href="/pitching/${p.slug}/"`), `homepage missing link to /pitching/${p.slug}/`);
  }
});
