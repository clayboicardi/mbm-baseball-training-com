import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

// Local-SEO support: the Contact section carries a crawlable NAP + hours block
// (visible on-page text reinforcing the Map Pack listings — name in schema/
// footer, phone as a tel link, service area, and the previously-missing hours).
// Assert against site.json (single source of truth) rather than hardcoded
// copy, HTML-escaping expected values so entity-encoded chars (e.g. & -> &amp;)
// still match the rendered output.
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const home = join(root, "dist", "index.html");
const site = JSON.parse(readFileSync(join(root, "src", "data", "site.json"), "utf8")).business;
const esc = (str) => str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const contactSection = () => {
  if (!existsSync(home)) throw new Error("dist/index.html missing — run `npm run build`");
  const m = readFileSync(home, "utf8").match(/<section id="contact"[\s\S]*?<\/section>/);
  assert.ok(m, "contact section not found");
  return m[0];
};

test("Contact exposes visible business hours (the NAP gap we filled)", () => {
  assert.ok(contactSection().includes(esc(site.hours)), `missing hours: ${site.hours}`);
});

test("Contact carries a crawlable phone (visible number + tel: link)", () => {
  const s = contactSection();
  assert.ok(s.includes(`href="${site.phoneHref}"`), `missing tel link: ${site.phoneHref}`);
  assert.ok(s.includes(esc(site.phone)), `missing phone text: ${site.phone}`);
});

test("Contact names the service area on-page", () => {
  assert.ok(contactSection().includes(esc(site.serviceArea)), `missing service area: ${site.serviceArea}`);
});
