// Cloudflare Worker entry for the static site.
//
// With `assets.run_worker_first = true` (wrangler.jsonc) this runs before any
// static asset is served, so it can 301-redirect the `www` host to the canonical
// apex (Decision 1) — something a zone Redirect Rule can't do while `www` is a
// Worker custom domain. Every other host falls through to the static assets,
// which keep their `_headers` (cache + security) behavior.
//
// Match on `url.hostname` (normalized lowercase, no port) rather than the raw
// Host header, and carry path + query through to the apex.
const CANONICAL_ORIGIN = "https://mbm-baseball-training.com";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "www.mbm-baseball-training.com") {
      return Response.redirect(CANONICAL_ORIGIN + url.pathname + url.search, 301);
    }
    return env.ASSETS.fetch(request);
  },
};
