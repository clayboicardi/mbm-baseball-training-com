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
