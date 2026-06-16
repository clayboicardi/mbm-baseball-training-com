import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

// Reads the built homepage. `pretest` (astro build) populates dist/ first.
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const indexHtml = join(root, "dist", "index.html");

const html = existsSync(indexHtml) ? readFileSync(indexHtml, "utf8") : null;

test("dist/index.html exists (build ran)", () => {
  assert.ok(html, "dist/index.html missing — run `npm run build`");
});

test("homepage has exactly one <title> containing 'Long Beach'", () => {
  const titles = [...html.matchAll(/<title>([\s\S]*?)<\/title>/g)];
  assert.equal(titles.length, 1);
  assert.match(titles[0][1], /Long Beach/);
});

test("homepage has a non-empty meta description", () => {
  const m = html.match(/<meta name="description" content="([^"]*)"/);
  assert.ok(m, "no meta description");
  assert.ok(m[1].trim().length > 0, "meta description empty");
});

test("homepage has exactly one canonical = apex root", () => {
  const links = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)];
  assert.equal(links.length, 1);
  assert.equal(links[0][1], "https://mbm-baseball-training.com/");
});

test("homepage has exactly one og:image", () => {
  const og = [...html.matchAll(/<meta property="og:image" content="[^"]*"\s*\/?>/g)];
  assert.equal(og.length, 1);
});

test("homepage has exactly one JSON-LD block with a LocalBusiness node", () => {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  assert.equal(blocks.length, 1);
  const data = JSON.parse(blocks[0][1]);
  assert.equal(data["@context"], "https://schema.org");
  assert.ok(Array.isArray(data["@graph"]));
  const hasLB = data["@graph"].some((n) => {
    const t = n["@type"];
    return Array.isArray(t) ? t.includes("LocalBusiness") : t === "LocalBusiness";
  });
  assert.ok(hasLB, "no LocalBusiness node in homepage @graph");
});

test("404 page is noindex", () => {
  const notFound = join(root, "dist", "404.html");
  assert.ok(existsSync(notFound), "dist/404.html missing");
  assert.match(readFileSync(notFound, "utf8"), /name="robots" content="noindex/);
});
