# Canonical-host redirect — Cloudflare setup (Clay action)

**Decision 1: the apex `https://mbm-baseball-training.com` is canonical.**
`astro.config.mjs` `site`, `public/robots.txt`, JSON-LD, OG, and `<link rel="canonical">`
all already emit apex URLs, so the *source* is consistent. The only remaining piece is a
**301 redirect from `www` → apex** so the two hosts stop both answering `200`.

## Why this is not in `public/_redirects`

Workers static-assets `_redirects` **does not support domain-level (host-based) redirects** —
it is documented as unsupported (❌ "Domain-level redirects") at
<https://developers.cloudflare.com/workers/static-assets/redirects/>. A `_redirects` rule
can only match on path, so it cannot send `www.…` to the apex. Shipping one would be a no-op,
so none was added. Use a zone-level **Single Redirect** instead (Cloudflare's recommended
mechanism for apex/www canonicalization).

## Add the redirect (Cloudflare dashboard)

Dashboard → the `mbm-baseball-training.com` zone → **Rules → Redirect Rules → Create rule**
→ template **"Redirect from WWW to Root"**, or enter manually:

- **Rule name:** `www to apex (canonical 301)`
- **If incoming requests match:** Custom filter / Wildcard pattern
  - **Request URL:** `https://www.mbm-baseball-training.com/*`
- **Then:**
  - **Type:** Dynamic / Wildcard
  - **Target URL:** `https://mbm-baseball-training.com/${1}`
  - **Status code:** `301`
  - **Preserve query string:** Enabled

To also catch plain `http://` (Cloudflare already upgrades to HTTPS via HSTS/SSL, so this is
optional), match `http*://www.mbm-baseball-training.com/*` and target
`https://mbm-baseball-training.com/${2}`.

## Verify after it's live

```powershell
curl.exe -sI https://www.mbm-baseball-training.com/ | findstr /I "HTTP location"
# expect: HTTP/2 301  +  location: https://mbm-baseball-training.com/

curl.exe -sI https://mbm-baseball-training.com/ | findstr /I "HTTP"
# expect: HTTP/2 200  (apex serves directly, no redirect loop)
```

## If you'd rather make `www` canonical instead

Flip it: set `astro.config.mjs` `site` to `https://www.mbm-baseball-training.com`, update
`public/robots.txt`'s `Sitemap:` line to the `www` host, rebuild, and reverse the rule
(apex `/*` → `https://www.mbm-baseball-training.com/${1}`).
