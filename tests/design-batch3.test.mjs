import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => {
  const f = join(root, "dist", p);
  if (!existsSync(f)) throw new Error(`${p} missing — run \`npm run build\``);
  return readFileSync(f, "utf8");
};
const home = () => read("index.html");

test("homepage remaining sections use SectionHeading eyebrows", () => {
  const h = home();
  for (const eyebrow of ["Coaching Philosophy", "Get on the Schedule", "Before You Start"]) {
    assert.ok(h.includes(eyebrow), `missing eyebrow: ${eyebrow}`);
  }
});

test("warm paper surface rhythm is applied (no leftover bg-base-200/50 on home)", () => {
  assert.ok(!home().includes("bg-base-200/50"), "bg-base-200/50 should be replaced by bg-paper");
});

test("about image ships a responsive srcset (not a single fixed asset)", () => {
  const h = home();
  assert.match(h, /coach-with-players[^"]*\.webp\s+\d+w/);
});

test("contact band uses the display face + marigold eyebrow", () => {
  const h = home();
  assert.ok(h.includes("Free First Lesson"));
  assert.match(h, /<h2[^>]*font-display[^>]*>\s*Ready to Get Started\?/);
});

test("coaching hub h1 uses the display face", () => {
  assert.match(read("coaching/index.html"), /<h1[^>]*font-display[^>]*>/);
});
test("hub card grids are wrapped for scroll-reveal", () => {
  assert.match(read("pitching/index.html"), /data-reveal/);
});
test("coaching detail h1 uses display face + in-page headings use SectionHeading eyebrows", () => {
  const h = read("coaching/hitting/index.html");
  assert.match(h, /<h1[^>]*font-display[^>]*>/);
  assert.match(h, /tracking-\[0\.2em\][^>]*text-brand-red-dark|text-brand-red-dark[^>]*tracking-\[0\.2em\]/);
});
test("package detail still renders its price (no pricing drift)", () => {
  assert.ok(read("packages/elite-season/index.html").includes("$1,500"));
});