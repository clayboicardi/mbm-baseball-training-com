import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

// `pretest` (astro build) populates dist/ first.
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

const NEW_PILLARS = ["infield", "outfield", "catching", "baserunning"];

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

test("each new coaching pillar builds with Service + WebPage + BreadcrumbList", () => {
  for (const slug of NEW_PILLARS) {
    const file = join(dist, "coaching", slug, "index.html");
    assert.ok(existsSync(file), `missing /coaching/${slug}/`);
    const types = graphTypes(readFileSync(file, "utf8"));
    for (const t of ["Service", "WebPage", "BreadcrumbList", "LocalBusiness", "WebSite", "Person"]) {
      assert.ok(types.has(t), `/coaching/${slug}/ missing @type ${t}`);
    }
  }
});

test("/pitching/ hub carries the pitching philosophy intro and The Method", () => {
  const html = readFileSync(join(dist, "pitching", "index.html"), "utf8");
  assert.match(html, /pitching starts in the mind/, "missing relocated intro");
  assert.match(html, /The Method/, "missing The Method heading");
  assert.match(html, /Mental game first/, "missing a Method item");
});
