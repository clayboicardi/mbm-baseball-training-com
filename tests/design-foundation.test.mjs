import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(root, "src", "styles", "global.css"), "utf8");

test("global.css declares the display font, fluid scale, and surface tokens", () => {
  assert.match(css, /@import "@fontsource\/big-shoulders-display\/latin-700\.css"/);
  assert.match(css, /--font-display:/);
  assert.match(css, /--step-display:\s*clamp\(/);
  assert.match(css, /--step-h1:\s*clamp\(/);
  assert.match(css, /--color-paper:/);
  assert.match(css, /--color-marigold:/);
});

test("scroll-reveal is gated so JS-off / reduced-motion never hides content", () => {
  assert.match(css, /prefers-reduced-motion: no-preference/);
  assert.match(css, /\.js-reveal \.reveal\b[\s\S]*?opacity:\s*0/);
});

test("duotone treatment is CSS-only (no extra requests)", () => {
  assert.match(css, /\.duotone::after/);
  assert.match(css, /mix-blend-mode:\s*multiply/);
});
