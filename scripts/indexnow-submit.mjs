// Submit the site's URLs to IndexNow (Bing, Yandex, Seznam, Naver, …) for
// near-instant crawl/refresh on the engines that power DuckDuckGo & Bing — the
// ones MBM already ranks #1 on. Reads the LIVE sitemap, extracts every URL, and
// POSTs the batch to api.indexnow.org (which fans out to all participating
// engines). Ownership is proven by the key file at public/<key>.txt.
//
// Usage:
//   npm run indexnow            # submit every sitemap URL to IndexNow
//   npm run indexnow -- --dry-run   # print the URLs without submitting
//
// Run it AFTER a deploy (the script reads the live production sitemap, so it
// always reflects the currently-published pages). No account required.

const HOST = "mbm-baseball-training.com";
const KEY = "c9723679a7f69055f7b9788f4b3c92ff";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_INDEX = `https://${HOST}/sitemap-index.xml`;
const ENDPOINT = "https://api.indexnow.org/indexnow";
const dryRun = process.argv.includes("--dry-run");

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "mbm-indexnow/1.0" },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status} ${res.statusText}`);
  return res.text();
}

const decodeXmlEntities = (s) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

const extractLocs = (xml) =>
  [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => decodeXmlEntities(m[1]));

async function collectUrls() {
  const xml = await fetchText(SITEMAP_INDEX);
  const urls = new Set();
  // Support both a <sitemapindex> (fetch each child sitemap) and a flat <urlset>.
  if (xml.includes("<sitemapindex")) {
    for (const sm of extractLocs(xml)) {
      for (const u of extractLocs(await fetchText(sm))) urls.add(u);
    }
  } else {
    for (const u of extractLocs(xml)) urls.add(u);
  }
  return [...urls];
}

async function main() {
  const urlList = await collectUrls();
  if (urlList.length === 0) throw new Error(`no <loc> URLs found in ${SITEMAP_INDEX}`);
  console.log(`Collected ${urlList.length} URL(s) from ${SITEMAP_INDEX}`);

  if (dryRun) {
    console.log(urlList.join("\n"));
    console.log("\n[dry-run] not submitting.");
    return;
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
    signal: AbortSignal.timeout(15000),
  });
  const txt = await res.text().catch(() => "");
  console.log(`IndexNow ${ENDPOINT} → ${res.status} ${res.statusText}${txt ? `\n${txt}` : ""}`);
  // 200 OK / 202 Accepted both mean the submission was accepted.
  if (res.status !== 200 && res.status !== 202) {
    throw new Error("IndexNow submission was not accepted.");
  }
  console.log(`✓ Submitted ${urlList.length} URL(s) to IndexNow.`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
