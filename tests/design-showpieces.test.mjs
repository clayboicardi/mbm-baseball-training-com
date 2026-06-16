import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const home = join(root, "dist", "index.html");
const html = () => {
  if (!existsSync(home)) throw new Error("dist/index.html missing — run `npm run build`");
  return readFileSync(home, "utf8");
};

test("hero uses the display headline + a decorative emblem watermark", () => {
  const h = html();
  // the H1 carries the display face + fluid display size
  assert.match(h, /<h1[^>]*\bfont-display\b[^>]*\bfluid-display\b|<h1[^>]*\bfluid-display\b[^>]*\bfont-display\b/);
  // the watermark emblem is decorative (empty alt — Astro emits a bare `alt`
  // attribute for alt="", which is valid and ignored by screen readers).
  assert.match(h, /<img\b[^>]*\balt(=""|(?=[\s>]))/);
});

test("hero keeps the LCP image eager + high priority", () => {
  assert.match(html(), /fetchpriority="high"/);
});

test("hero exposes all trust items", () => {
  const h = html();
  for (const t of ["20+ years in the game", "Ages 8–18", "Long Beach & Orange County"]) {
    assert.ok(h.includes(t), `hero missing trust item: ${t}`);
  }
});

test("What I Coach cards are numbered with a decorative diamond tick", () => {
  const h = html();
  // a 2-digit zero-padded index label appears (01..05) and a decorative diamond svg
  assert.match(h, /\b0[1-9]\b/);
  assert.match(h, /<svg[^>]*aria-hidden="true"[\s\S]*?<polygon/); // diamond Ornament
});

test("Pitching section uses a SectionHeading display title", () => {
  const h = html();
  assert.match(h, /How Coach Myles Builds a Pitcher/);
  // the display-face heading class is present in the pitching area
  assert.match(h, /font-display/);
});
