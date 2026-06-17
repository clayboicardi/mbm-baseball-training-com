import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

// Local-SEO support: the Contact section carries a crawlable NAP + hours block
// (visible on-page text reinforcing the Map Pack listings — name in schema/
// footer, phone as a tel link, service area, and the previously-missing hours).
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const home = join(root, "dist", "index.html");
const contactSection = () => {
  if (!existsSync(home)) throw new Error("dist/index.html missing — run `npm run build`");
  const html = readFileSync(home, "utf8");
  const m = html.match(/<section id="contact"[\s\S]*?<\/section>/);
  assert.ok(m, "contact section not found");
  return m[0];
};

test("Contact exposes visible business hours (the NAP gap we filled)", () => {
  const s = contactSection();
  assert.match(s, /6\s*AM[^<]*7\s*PM/);
  assert.match(s, /by appointment/i);
});

test("Contact carries a crawlable phone (visible number + tel: link)", () => {
  const s = contactSection();
  assert.match(s, /href="tel:\+15628840746"/);
  assert.match(s, /\(562\)\s*884-0746/);
});

test("Contact names the service area on-page", () => {
  assert.match(contactSection(), /Long Beach/);
});
