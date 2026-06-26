import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

// Source headers file copied verbatim to dist/_headers at build (the build also
// injects Last-Modified; this asserts the static security/cache policy).
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const headers = readFileSync(join(root, "public", "_headers"), "utf8");

test("security headers are present", () => {
  for (const h of [
    "Strict-Transport-Security",
    "X-Content-Type-Options: nosniff",
    "Referrer-Policy",
    "Permissions-Policy",
    "Content-Security-Policy",
  ]) {
    assert.match(headers, new RegExp(h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `missing ${h}`);
  }
});

test("CSP allows the cal.com + tally booking embeds and blocks framing", () => {
  const csp = headers.match(/Content-Security-Policy:.*/)?.[0] ?? "";
  assert.match(csp, /frame-src[^;]*https:\/\/cal\.com/);
  assert.match(csp, /frame-src[^;]*https:\/\/tally\.so/);
  assert.match(csp, /frame-ancestors 'none'/);
});

test("/_astro assets are cached immutably for a year", () => {
  assert.match(headers, /\/_astro\/\*[\s\S]*?max-age=31536000, immutable/);
});

test("no-transform cache policy covers the dynamic HTML sections", () => {
  // Without these the new city/pitch/coaching pages would let Cloudflare inject
  // its JS-Detections script and regress the Lighthouse Best Practices score.
  assert.match(headers, /\/baseball-lessons\/\*[\s\S]*?no-transform/);
  assert.match(headers, /\/pitching\/\*[\s\S]*?no-transform/);
  assert.match(headers, /\/coaching\/\*[\s\S]*?no-transform/);
  assert.match(headers, /\/packages\/\*[\s\S]*?no-transform/);
  assert.match(headers, /\/programs\/\*[\s\S]*?no-transform/);
  assert.match(headers, /\/contact\/[\s\S]*?no-transform/);
});
