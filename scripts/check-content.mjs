import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const ALLOWED = new Set(
  ["#005A9C", "#FFFFFF", "#EF3E42", "#F4F7FA", "#E5EBF1", "#0B1A2B", "#1A8F4C", "#E0A106"].map((h) => h.toUpperCase())
);
const errors = [];

function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(astro|css|ts|js|mjs)$/.test(e)) checkFile(p);
  }
}
function checkFile(p) {
  if (p.endsWith("global.css")) return; // theme definition lives here
  const text = readFileSync(p, "utf8");
  for (const h of text.match(/#[0-9a-fA-F]{6}\b/g) || []) {
    if (!ALLOWED.has(h.toUpperCase())) errors.push(`${p.replace(ROOT, "")}: off-brand hex ${h}`);
  }
}
for (const f of ["site.json", "services.json", "packages.json", "testimonials.json"]) {
  try { JSON.parse(readFileSync(join(SRC, "data", f), "utf8")); }
  catch (e) { errors.push(`data/${f}: invalid JSON — ${e.message}`); }
}
walk(SRC);
if (errors.length) { console.error("Content check FAILED:\n" + errors.join("\n")); process.exit(1); }
console.log("Content check passed.");
