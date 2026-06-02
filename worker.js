// Cloudflare Worker entry for the static site.
//
// With `assets.run_worker_first = true` (wrangler.jsonc) this runs before any
// static asset is served, so it can 301-redirect the `www` host to the canonical
// apex (Decision 1) — something a zone Redirect Rule can't do while `www` is a
// Worker custom domain. Every other host falls through to the static assets,
// which keep their `_headers` (cache + security) behavior.
const CANONICAL_ORIGIN = "https://mbm-baseball-training.com";

export default {
  async fetch(request, env) {
    if (request.headers.get("host") === "www.mbm-baseball-training.com") {
      const { pathname, search } = new URL(request.url);
      return Response.redirect(CANONICAL_ORIGIN + pathname + search, 301);
    }
    return env.ASSETS.fetch(request);
  },
};
