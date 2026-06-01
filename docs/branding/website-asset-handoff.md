# Branding handoff → website session (MBM Baseball Training)

Branding is **LOCKED and deploy-ready.** Don't regenerate or restyle the marks —
pull them from the paths below (all repo-relative). The emblem is a Día de Muertos
capped-sugar-skull baseball in a diamond badge.

**Read first:** `docs/branding/brand-locked.md` — the authoritative brand spec
(palette tokens, type, every asset path, usage rules, exact `<head>`/OG snippets).
Theme the site against it.

## Palette (CSS tokens)

- `--blue #005A9C` + `--white #FFFFFF` → **dominant** (frames, headings, surfaces)
- `--red #EF3E42` → sparing accent (CTAs, small highlights)
- `--marigold #EBB257` → sparing festive accent (don't make it a UI color)
- `--navy #0B1F33` → dark-mode field (pair with the white wordmark)

Keep blue + white dominant. Warm neutrals; avoid pure `#000`.

## Favicons — already in `public/` (served at site root)

`favicon.svg` · `favicon.ico` · `favicon-16x16.png` · `favicon-32x32.png` ·
`favicon-48x48.png` · `apple-touch-icon.png` · `android-chrome-192x192.png` ·
`android-chrome-512x512.png` · `site.webmanifest`

```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#005A9C">
```

## Brand marks — `assets-incoming/brand/` (transparent PNG unless noted)

Import however fits your setup (e.g. `src/assets/brand/` for `astro:assets`
optimization, or copy to `public/`):

| File | Use |
|---|---|
| `mbm-emblem.png` (2048² transp) | Hero / primary logo |
| `mbm-emblem-on-white.png` · `mbm-emblem-master.png` (4K) | Flat-bg / print archive |
| `mbm-lockup-horizontal.png` (+`-dark`) | Nav / header |
| `mbm-lockup-stacked.png` (+`-dark`) | Footer / splash / mobile |
| `mbm-wordmark.png` (blue) · `mbm-wordmark-white.png` | Text lockups; white = on dark |
| `mbm-monogram.png` | Compact mark / tight spaces |

## OG / social

- Use `assets-incoming/brand/mbm-og.png` (light) and `mbm-og-dark.png` (dark), 1200×630.
- Avatar: `mbm-avatar.png` / `mbm-avatar-dark.png`.
- ⚠️ **You have a placeholder `public/og-image.png`** — replace it with `mbm-og.png`
  (or repoint `og:image` at the real asset). Don't ship the placeholder.

```html
<meta property="og:image" content="https://mbm-baseball-training.com/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
```

## Type

Logo ships as image assets — **no webfont needed for the logo.** For site type that
echoes it: headings in a condensed athletic / slab face (*Oswald*, *Saira
Condensed*, or *Zilla Slab*); body in *Inter* / system. Your call.

## Usage rules (locked)

- Don't recolor, stretch, rotate, or re-effect the mark; scale evenly.
- Emblem reads on white/light/dark — **never on a blue field** (use a dark bg or
  `mbm-emblem-on-white.png`). White wordmark on dark.
- Full emblem needs ≥ ~40px tall; below that use the monogram/favicon. The favicon
  monogram is intentionally a mark (not readable as "MBM") at a true 16px.
- **Don't edit the brand assets** — they're locked and reproducible via
  `scripts/brand_pipeline.py` + `scripts/brand_compose.py`. Need a new
  size/variant/crop? Ask the branding session instead of editing the marks.
