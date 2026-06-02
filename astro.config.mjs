// @ts-check
import { defineConfig } from 'astro/config';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

// Single source of truth for content freshness: the last git commit date.
// Stable across identical rebuilds (unlike Date.now(), which would re-stamp on
// every deploy and train crawlers to ignore lastmod) and accurate for the
// homepage, which re-renders on essentially every deploy. `git log -1` returns
// HEAD's date even on shallow CI clones. Falls back to build time if git is
// unavailable. Feeds sitemap <lastmod>, og:updated_time, and Last-Modified.
function lastModified() {
  try {
    // execFileSync (no shell) — avoids any metacharacter handling, incl. the
    // %cI format token being mangled by cmd.exe on Windows.
    const iso = execFileSync('git', ['log', '-1', '--format=%cI'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'], // discard git's stderr ("not a git repository") — handled by the catch
    }).trim();
    const date = iso ? new Date(iso) : null;
    // Guard against an unparseable string -> Invalid Date, whose toISOString()/
    // toUTCString() would throw a RangeError and crash the build.
    if (date && !Number.isNaN(date.getTime())) return date;
  } catch {
    // not a git checkout / git missing — fall through
  }
  return new Date();
}
const LASTMOD = lastModified();

// Inject a Last-Modified header into the built _headers file. Cloudflare Workers
// static assets read dist/_headers; doing this at build:done keeps the source
// public/_headers clean and guarantees the date matches this exact build.
/**
 * @param {string} httpDate - RFC 1123 date string for the Last-Modified header
 * @returns {import('astro').AstroIntegration}
 */
function lastModifiedHeader(httpDate) {
  return {
    name: 'mbm:last-modified-header',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const headers = new URL('_headers', dir);
        if (!existsSync(headers)) {
          logger.warn('_headers missing from build output; skipped Last-Modified injection');
          return;
        }
        const txt = readFileSync(headers, 'utf8');
        if (/^\s*Last-Modified:/m.test(txt)) return; // already present
        // Add it as the first header under the catch-all /* block. Capture the
        // line ending (\r?) so a CRLF _headers stays CRLF instead of getting a
        // mixed/!matched line and silently skipping the injection.
        const next = txt.replace(/^(\/\*[ \t]*)(\r?)$/m, (_m, block, cr) => `${block}${cr}\n  Last-Modified: ${httpDate}${cr}`);
        if (next === txt) {
          logger.warn('no catch-all "/*" block in _headers; skipped Last-Modified injection');
          return;
        }
        writeFileSync(headers, next);
        logger.info(`injected Last-Modified: ${httpDate}`);
      },
    },
  };
}

export default defineConfig({
  site: 'https://mbm-baseball-training.com',
  integrations: [
    sitemap({ lastmod: LASTMOD }),
    icon(),
    lastModifiedHeader(LASTMOD.toUTCString()),
  ],
  // @ts-ignore – tailwindcss/vite ships Vite 8 types; Astro 6 bundles Vite 7; runtime is fine
  vite: {
    plugins: [tailwindcss()],
    define: { __SITE_LASTMOD__: JSON.stringify(LASTMOD.toISOString()) },
  },
});
