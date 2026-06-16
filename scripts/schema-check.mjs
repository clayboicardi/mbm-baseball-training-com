// Structured-data gate for dist/ HTML output. Ported from clayboicardi.com,
// right-sized for MBM's single-business @graph. Run via `npm run schema-check`
// (preschema-check builds first). Pure helpers are exported for node:test.
//
// Invariants per built page:
//   1. Exactly one <script type="application/ld+json">.
//   2. Parses to { "@context": "https://schema.org", "@graph": [...] }.
//   3. Every top-level node @id is unique within the page graph.
//   4. Every @id reference resolves intra-page (a top-level @id here) or
//      cross-page (an absolute URL of a built page that defines that @id).
//   5. No forbidden markup anywhere: FAQPage, ProfessionalService, Review,
//      AggregateRating, or the `aggregateRating` / `review` properties.
//   6. Per-route top-level @type expectations: every page carries the global
//      identity (LocalBusiness, WebSite, Person); legal/404 carry ONLY it;
//      content routes additionally carry their required nodes.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { join, dirname, relative, sep } from "node:path";

export const SITE = "https://mbm-baseball-training.com";

// Must appear (as a subset) on EVERY page.
export const GLOBAL_REQUIRED = ["LocalBusiness", "WebSite", "Person"];
// Exact top-level type set for identity-only routes (the LocalBusiness node's
// @type is an array, so SportsActivityLocation is always present too).
export const IDENTITY_EXACT = ["LocalBusiness", "SportsActivityLocation", "WebSite", "Person"];
// Routes that carry ONLY the global identity graph.
export const IDENTITY_ONLY = new Set(["privacy/index.html", "terms/index.html", "404.html"]);
// Required EXTRA top-level types (beyond the global identity) for known routes.
// Superset allowed. Templated routes are matched by pattern in expectedExtra().
export const ROUTE_EXTRA = {
  "index.html": ["WebPage"],
};
export const FORBIDDEN_TYPES = ["FAQPage", "ProfessionalService", "Review", "AggregateRating"];
export const FORBIDDEN_KEYS = ["aggregateRating", "review"];

/** Required extra top-level types for a route (beyond GLOBAL_REQUIRED), or null
 *  if the route is identity-only / unknown. Pattern-matches templated routes. */
export function expectedExtra(rel) {
  const p = rel.split(sep).join("/");
  if (ROUTE_EXTRA[p]) return ROUTE_EXTRA[p];
  // Phase 3: /baseball-lessons/ hub + /baseball-lessons/<city>/
  if (p === "baseball-lessons/index.html") return ["CollectionPage", "BreadcrumbList"];
  if (/^baseball-lessons\/[^/]+\/index\.html$/.test(p)) return ["Service", "WebPage", "BreadcrumbList"];
  // Phase 4: /pitching/ hub + /pitching/<slug>/
  if (p === "pitching/index.html") return ["CollectionPage", "BreadcrumbList"];
  if (/^pitching\/[^/]+\/index\.html$/.test(p)) return ["Article", "WebPage", "BreadcrumbList"];
  return null;
}

/** Canonical absolute URL for a built page's relative path. */
export function canonicalUrlFor(rel) {
  const p = rel.split(sep).join("/");
  if (p === "index.html") return `${SITE}/`;
  if (p.endsWith("/index.html")) return `${SITE}/${p.slice(0, -"index.html".length)}`;
  return `${SITE}/${p}`;
}

/** Flatten a node's @type (string or array) to an array of strings. */
export function typesOf(node) {
  const t = node?.["@type"];
  return Array.isArray(t) ? t : t ? [t] : [];
}

/** All top-level @type strings present across a graph's nodes. */
export function collectTopLevelTypes(graph) {
  const set = new Set();
  for (const node of graph) for (const t of typesOf(node)) set.add(t);
  return set;
}

/** Recursively: does any object in `node` have @type including `type`? */
export function deepHasType(node, type) {
  if (Array.isArray(node)) return node.some((n) => deepHasType(n, type));
  if (node && typeof node === "object") {
    if (typesOf(node).includes(type)) return true;
    return Object.values(node).some((v) => deepHasType(v, type));
  }
  return false;
}

/** Recursively: does any object in `node` have own-property `key`? */
export function deepHasKey(node, key) {
  if (Array.isArray(node)) return node.some((n) => deepHasKey(n, key));
  if (node && typeof node === "object") {
    if (Object.prototype.hasOwnProperty.call(node, key)) return true;
    return Object.values(node).some((v) => deepHasKey(v, key));
  }
  return false;
}

/** Collect @id reference strings: @ids of NESTED objects (top-level node @ids
 *  are definitions, not references). */
export function collectRefs(graph) {
  const refs = [];
  const topLevel = new Set(graph);
  const walk = (node) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (node && typeof node === "object") {
      if (!topLevel.has(node) && typeof node["@id"] === "string") refs.push(node["@id"]);
      for (const v of Object.values(node)) walk(v);
    }
  };
  graph.forEach(walk);
  return refs;
}

/** Invariant 4: resolve refs intra-page (definedSet) or cross-page (pageIdMap:
 *  canonical page URL -> Set of @ids defined there). Returns failure messages. */
export function resolveRefs(rel, refs, definedSet, pageIdMap) {
  const failures = [];
  for (const ref of refs) {
    if (definedSet.has(ref)) continue; // intra-page
    const hashIdx = ref.indexOf("#");
    if (hashIdx > 0) {
      const base = ref.slice(0, hashIdx);
      const target =
        pageIdMap.get(base) || pageIdMap.get(base + "/") || pageIdMap.get(base.replace(/\/$/, ""));
      if (target && target.has(ref)) continue; // cross-page
    }
    failures.push(`${rel}: unresolved @id reference "${ref}"`);
  }
  return failures;
}

/** Invariant 6: top-level @type expectations for a route. */
export function routeTypeFailures(rel, typeSet) {
  const failures = [];
  const p = rel.split(sep).join("/");
  for (const t of GLOBAL_REQUIRED) {
    if (!typeSet.has(t)) failures.push(`${rel}: missing required global @type "${t}"`);
  }
  if (IDENTITY_ONLY.has(p)) {
    const expected = new Set(IDENTITY_EXACT);
    for (const t of typeSet) {
      if (!expected.has(t)) failures.push(`${rel}: identity-only route has unexpected @type "${t}"`);
    }
    return failures;
  }
  const extra = expectedExtra(p);
  if (extra) {
    for (const t of extra) {
      if (!typeSet.has(t)) failures.push(`${rel}: missing expected @type "${t}"`);
    }
  }
  return failures;
}

// --- HTML / JSON-LD extraction (impure; used by main) ---
const LD_RE = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;

function htmlFiles(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) htmlFiles(p, out);
    else if (e.endsWith(".html")) out.push(p);
  }
  return out;
}

function main() {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const dist = join(root, "dist");
  let pages;
  try {
    pages = htmlFiles(dist);
  } catch {
    console.error("schema-check: dist/ not found — run `npm run build` first.");
    process.exit(1);
  }
  const failures = [];
  const parsed = []; // { rel, url, graph, definedIds, refs, typeSet }
  const pageIdMap = new Map();

  // PASS 1: parse + invariants 1,2,3,5
  for (const file of pages) {
    const rel = relative(dist, file);
    const html = readFileSync(file, "utf8");
    const blocks = [...html.matchAll(LD_RE)].map((m) => m[1]);
    if (blocks.length !== 1) {
      failures.push(`${rel}: expected exactly 1 JSON-LD block, found ${blocks.length}`);
      continue;
    }
    let data;
    try {
      data = JSON.parse(blocks[0]);
    } catch (e) {
      failures.push(`${rel}: JSON-LD is not valid JSON — ${e.message}`);
      continue;
    }
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      failures.push(`${rel}: JSON-LD root is not an object`);
      continue;
    }
    if (data["@context"] !== "https://schema.org") {
      failures.push(`${rel}: @context must be "https://schema.org"`);
    }
    const graph = data["@graph"];
    if (!Array.isArray(graph)) {
      failures.push(`${rel}: missing @graph array`);
      continue;
    }
    // Invariant 3: unique top-level @ids
    const definedIds = new Set();
    for (const node of graph) {
      const id = node?.["@id"];
      if (typeof id !== "string") continue;
      if (definedIds.has(id)) failures.push(`${rel}: duplicate top-level @id "${id}"`);
      definedIds.add(id);
    }
    // Invariant 5: forbidden markup
    for (const t of FORBIDDEN_TYPES) {
      if (deepHasType(graph, t)) failures.push(`${rel}: forbidden @type "${t}" present`);
    }
    for (const k of FORBIDDEN_KEYS) {
      if (deepHasKey(graph, k)) failures.push(`${rel}: forbidden property "${k}" present`);
    }
    const url = canonicalUrlFor(rel);
    pageIdMap.set(url, definedIds);
    parsed.push({ rel, url, graph, definedIds, refs: collectRefs(graph), typeSet: collectTopLevelTypes(graph) });
  }

  // PASS 2: invariants 4 + 6
  for (const page of parsed) {
    failures.push(...resolveRefs(page.rel, page.refs, page.definedIds, pageIdMap));
    failures.push(...routeTypeFailures(page.rel, page.typeSet));
  }

  if (failures.length) {
    console.error("schema-check FAILED:\n" + failures.map((f) => "  - " + f).join("\n"));
    process.exit(1);
  }
  console.log(`schema-check passed (${parsed.length} page(s)).`);
}

// Run only when invoked directly (not when imported by tests).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
