import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

// Batch 6 (finale): the Contact CTA becomes a treated color photo band (P23
// high-five), and two slim navy+marigold duotone strips break up the homepage
// as decorative breathers. Guard the treatment + the a11y/perf intent.
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const home = join(root, "dist", "index.html");
const html = () => {
  if (!existsSync(home)) throw new Error("dist/index.html missing — run `npm run build`");
  return readFileSync(home, "utf8");
};

test("Contact CTA is a treated photo band (P23), lazy — not the LCP", () => {
  const h = html();
  const img = h.match(/<img\b[^>]*cta-celebrate[^>]*>/);
  assert.ok(img, "cta-celebrate img not found");
  assert.match(img[0], /loading="lazy"/);
  assert.doesNotMatch(img[0], /fetchpriority="high"/);
  assert.match(img[0], /object-cover/);
  // honest alt naming the high-five
  assert.match(img[0], /alt="[^"]*high-five[^"]*"/i);
  // a downward readability scrim exists (don't lock exact opacity stops)
  assert.match(h, /bg-gradient-to-b[^"]*\bfrom-neutral\//);
});

test("two decorative duotone divider strips break up the homepage", () => {
  const h = html();
  // match a duotone wrapper that is aria-hidden, robust to class order / extras
  const strips = h.match(/<div\b[^>]*\bclass=['"][^'"]*\bduotone\b[^'"]*['"][^>]*\baria-hidden=['"]true['"][^>]*>/g) || [];
  assert.equal(strips.length, 2, "expected exactly 2 duotone divider strips");
  // each strip carries one of the detail shots, decorative (empty alt) + lazy
  for (const name of ["detail-cleats", "detail-bats"]) {
    const img = h.match(new RegExp(`<img\\b[^>]*${name}[^>]*>`));
    assert.ok(img, `${name} divider img not found`);
    assert.match(img[0], /loading="lazy"/);
    assert.match(img[0], /\balt(=""|(?=[\s>]))/); // empty/decorative alt
  }
});
