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

test("two duotone divider strips break up the homepage, lazy + described", () => {
  const h = html();
  // match the duotone DIVIDER wrappers specifically (duotone + the strip's
  // h-24 height), so an unrelated .duotone element elsewhere can't skew the count
  const strips = h.match(/<div\b[^>]*\bclass=['"][^'"]*\bduotone\b[^'"]*\bh-24\b[^'"]*['"][^>]*>/g) || [];
  assert.equal(strips.length, 2, "expected exactly 2 duotone divider strips");
  // each strip carries one of the detail shots, lazy + a real (non-empty) alt
  // so it earns image-search visibility instead of being decorative-only
  for (const name of ["detail-cleats", "detail-bats"]) {
    const img = h.match(new RegExp(`<img\\b[^>]*${name}[^>]*>`));
    assert.ok(img, `${name} divider img not found`);
    assert.match(img[0], /loading="lazy"/);
    assert.match(img[0], /alt="[^"]*baseball[^"]*"/i); // described, mentions baseball
    assert.doesNotMatch(img[0], /alt=""/); // not decorative anymore
  }
});
