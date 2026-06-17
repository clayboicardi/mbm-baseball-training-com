import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

// Batch 5 — locations get a shared treated photo hero (P20 golden-hour field)
// plus an optional P21 dusk-cages CTA band. Guard the LCP distinction:
// the above-fold hero stays eager + high priority; the below-fold CTA stays lazy.
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const page = join(root, "dist", "baseball-lessons", "long-beach", "index.html");
const html = () => {
  if (!existsSync(page)) throw new Error("dist/baseball-lessons/long-beach/index.html missing — run `npm run build`");
  return readFileSync(page, "utf8");
};

test("city hero uses the shared field photo, eager + high priority (LCP)", () => {
  const h = html();
  const hero = h.match(/<img\b[^>]*field-longbeach[^>]*>/);
  assert.ok(hero, "field-longbeach hero img not found");
  assert.match(hero[0], /loading="eager"/);
  assert.match(hero[0], /fetchpriority="high"/);
  assert.doesNotMatch(hero[0], /loading="lazy"/);
  assert.match(hero[0], /object-cover/);
  // honest, people-free alt
  assert.match(hero[0], /alt="[^"]*field[^"]*"/i);
});

test("city hero photo sits under a left-weighted navy scrim", () => {
  assert.match(html(), /from-neutral\/80[^"]*via-neutral\/50[^"]*to-neutral\/22/);
});

test("CTA band photo (dusk cages) is below the fold — lazy, never the LCP", () => {
  const h = html();
  const cta = h.match(/<img\b[^>]*field-cages[^>]*>/);
  assert.ok(cta, "field-cages CTA img not found");
  assert.match(cta[0], /loading="lazy"/);
  assert.doesNotMatch(cta[0], /fetchpriority="high"/);
  assert.match(cta[0], /object-cover/);
});

test("hero copy carries a text-shadow for legibility over the photo", () => {
  // the H1 display headline gets the heavier shadow token
  assert.match(html(), /<h1[^>]*text-shadow:0_2px_16px_#0b1f33a6/);
});
