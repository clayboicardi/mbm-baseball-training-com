import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// The IndexNow key file must ship at the site root with EXACTLY the key as its
// content — that's how IndexNow verifies ownership before accepting submissions.
// Keep this in sync with scripts/indexnow-submit.mjs.
const KEY = "c9723679a7f69055f7b9788f4b3c92ff";

test("IndexNow key file ships at the site root with the exact key", () => {
  const f = join(root, "dist", `${KEY}.txt`);
  assert.ok(existsSync(f), "IndexNow key file missing from build (public/<key>.txt)");
  assert.equal(readFileSync(f, "utf8").trim(), KEY);
});

test("the IndexNow submit script references the same key + a hosted keyLocation", () => {
  const src = readFileSync(join(root, "scripts", "indexnow-submit.mjs"), "utf8");
  assert.ok(src.includes(KEY), "submit script key does not match the key file");
  assert.match(src, /keyLocation/);
  assert.match(src, /api\.indexnow\.org/);
});
