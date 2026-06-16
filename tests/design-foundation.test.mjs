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
  assert.match(css, /--step-lg:\s*clamp\(/);
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

const home = join(root, "dist", "index.html");
const html = () => {
  if (!existsSync(home)) throw new Error("dist/index.html missing — run `npm run build`");
  return readFileSync(home, "utf8");
};

test("built homepage preloads the display font", () => {
  assert.match(html(), /rel="preload"[^>]*big-shoulders-display[^>]*as="font"/);
});

test("inline reveal script honors reduced-motion and targets [data-reveal]", () => {
  const h = html();
  assert.match(h, /matchMedia\(["']\(prefers-reduced-motion: no-preference\)["']\)/);
  assert.match(h, /js-reveal/);
  assert.match(h, /\[data-reveal\]/);
});

test("Services uses SectionHeading (display title) + a stitch divider on paper", () => {
  const h = html();
  assert.match(h, /What I Coach/);
  assert.match(h, /font-display/);
  assert.match(h, /bg-paper/);
  assert.match(h, /<svg[^>]*aria-hidden="true"[\s\S]*?<pattern[\s\S]*?<line/);
});

test("About coach photo uses the duotone treatment with explicit dimensions", () => {
  assert.match(html(), /class="[^"]*\bduotone\b[^"]*"[\s\S]*?<img[^>]*\bwidth="\d+"[^>]*\bheight="\d+"/);
});

test("two homepage sections are wrapped for scroll-reveal", () => {
  const count = (html().match(/data-reveal/g) || []).length;
  assert.ok(count >= 2, `expected >= 2 data-reveal sections, found ${count}`);
});
