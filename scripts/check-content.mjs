import { readFileSync, readdirSync, statSync } from "node:fs"; // readdirSync also used for package-pages 1:1 check
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
// #D72B31 is the AA-accessible dark red (white-on-red 4.91:1) used only for
// small text on/over red — the "Best Value" badge and the About tagline. The
// locked brand red #EF3E42 still applies globally to large CTAs + decoration.
// See docs/audits implementation prompt, Decision 2.
const ALLOWED = new Set(
  ["#005A9C", "#FFFFFF", "#EF3E42", "#D72B31", "#F4F7FA", "#E5EBF1", "#0B1F33", "#1A8F4C", "#E0A106", "#EBB257"].map((h) => h.toUpperCase())
);
const errors = [];
const ids = new Set();

function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(astro|css|ts|js|mjs)$/.test(e)) checkFile(p);
  }
}
function checkFile(p) {
  const text = readFileSync(p, "utf8");
  if (p.endsWith(".astro")) {
    for (const m of text.matchAll(/\sid=["']([^"']+)["']/g)) ids.add(m[1]); // anchor targets
  }
  if (p.endsWith("global.css")) return; // theme definition lives here
  for (const h of text.match(/#[0-9a-fA-F]{6}\b/g) || []) {
    if (!ALLOWED.has(h.toUpperCase())) errors.push(`${p.replace(ROOT, "")}: off-brand hex ${h}`);
  }
}
for (const f of ["site.json", "services.json", "packages.json", "testimonials.json"]) {
  try { JSON.parse(readFileSync(join(SRC, "data", f), "utf8")); }
  catch (e) { errors.push(`data/${f}: invalid JSON — ${e.message}`); }
}
walk(SRC);

// Bail out now if JSON failed to parse (or a hex check failed) — the
// referential checks below re-parse these files and would otherwise crash
// with an unhandled exception on malformed JSON before reporting the cause.
if (errors.length) { console.error("Content check FAILED:\n" + errors.join("\n")); process.exit(1); }

// Referential integrity: in-page anchors must resolve to a real element id,
// and every package add-on key must exist in the add-on catalog.
const site = JSON.parse(readFileSync(join(SRC, "data", "site.json"), "utf8"));
const packages = JSON.parse(readFileSync(join(SRC, "data", "packages.json"), "utf8"));
const catalogKeys = new Set(Object.keys(packages.addOnsCatalog ?? {}));
const checkAnchor = (href, where) => {
  if (typeof href !== "string") return;
  // Accept "#id" (same-page) and "/#id" (homepage-rooted, so it still works from
  // subpages like /pitching/<slug>); both must resolve to a real element id.
  const m = href.match(/^\/?#(.+)$/);
  if (m && !ids.has(m[1]))
    errors.push(`${where}: anchor "${href}" has no matching id in any .astro file`);
};
for (const item of site.nav ?? []) checkAnchor(item.href, `site.json nav "${item.label}"`);
for (const tier of packages.tiers ?? []) {
  checkAnchor(tier.cta?.target, `packages.json tier "${tier.id}" cta.target`);
  for (const k of tier.addOns ?? [])
    if (!catalogKeys.has(k)) errors.push(`packages.json tier "${tier.id}": addOn "${k}" not in addOnsCatalog`);
}

// Package detail pages must map 1:1 to packages.json tiers: every page joins a
// real tier id, and every tier has exactly one page (so /packages/<slug> can't
// drift out of sync with the locked pricing data).
const tierIds = new Set((packages.tiers ?? []).map((t) => t.id));
const pageTiers = new Map(); // tier id -> page filename
const pkgDir = join(SRC, "data", "package-pages");
let pkgFiles = [];
try { pkgFiles = readdirSync(pkgDir).filter((f) => f.endsWith(".json")); } catch { /* none yet */ }
for (const f of pkgFiles) {
  let data;
  try { data = JSON.parse(readFileSync(join(pkgDir, f), "utf8")); }
  catch (e) { errors.push(`data/package-pages/${f}: invalid JSON — ${e.message}`); continue; }
  const slug = f.replace(/\.json$/, "");
  if (data.tier !== slug)
    errors.push(`data/package-pages/${f}: tier "${data.tier}" must equal filename slug "${slug}"`);
  if (!tierIds.has(data.tier))
    errors.push(`data/package-pages/${f}: tier "${data.tier}" is not a packages.json tier id`);
  if (pageTiers.has(data.tier))
    errors.push(`data/package-pages/${f}: duplicate page for tier "${data.tier}" (also ${pageTiers.get(data.tier)})`);
  pageTiers.set(data.tier, f);
}
for (const id of tierIds)
  if (!pageTiers.has(id)) errors.push(`packages.json tier "${id}" has no matching data/package-pages/${id}.json`);

if (errors.length) { console.error("Content check FAILED:\n" + errors.join("\n")); process.exit(1); }
console.log("Content check passed.");
