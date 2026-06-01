# MBM Baseball Training — Brand Locked

> **Status: LOCKED 2026-06-01.** The deploy-ready brand kit. **Website session:
> theme against this file.** Direction/rationale lives in `mbm-brand-intake.md`;
> this is the as-built reference.

The mark: a **capped sugar-skull baseball** (Día de Muertos calavera + baseball
cap, "11" on the brow) inside a blue **baseball-diamond** frame with crossed bats
and an "MBM BASEBALL TRAINING" banner. Restrained Día de Muertos folk-art register.

---

## Palette — CSS tokens (use these exact values)

| Token | Hex | Role | Rule |
|---|---|---|---|
| `--blue` | `#005A9C` | Dodger Blue — primary | **Dominant.** Frames, headings, primary UI. |
| `--white` | `#FFFFFF` | White — primary | **Dominant.** Surfaces, negative space, knockouts. |
| `--red` | `#EF3E42` | Red — accent | Sparing: CTAs, small highlights. |
| `--marigold` | `#EBB257` | Marigold gold — festive accent | Sparing: folk-art touches only. Don't make it a UI color. |
| `--navy` | `#0B1F33` | Dark field | Dark-mode backgrounds; pair with the white wordmark. |

**Dominance rule (locked):** blue + white carry the design; red + marigold are
accents used sparingly. Neutrals: keep them warm-neutral, avoid pure `#000`.

> Note: the emblem *image* renders blue slightly deeper (~`#1E5690`) for depth —
> that's internal to the artwork. Site chrome uses the token `#005A9C`.

## Type

- **Logo wordmark + monogram:** athletic **varsity slab-serif**, all-caps. Shipped
  as image assets — **no webfont needed** to use the logo.
- **Recommended site type (website session's call) to echo the logo:** headings in
  a condensed athletic / slab face (e.g. *Oswald*, *Saira Condensed*, or *Zilla
  Slab*); body in a clean neutral sans (*Inter* / system). Optional — pick what
  reads well on mobile.

## Assets

### Brand marks → `assets-incoming/brand/`

| File | What | Size | Bg | Use |
|---|---|---|---|---|
| `mbm-emblem.png` | Primary emblem | 2048² | transparent | Hero, primary logo |
| `mbm-emblem-on-white.png` | Emblem, flattened | 4096² | white | When transparency isn't wanted |
| `mbm-emblem-master.png` | Emblem archive | 4096² | transparent | Print/merch/high-res |
| `mbm-wordmark.png` | Wordmark "MBM BASEBALL TRAINING" | 2400×166 | transparent | Text lockups, nav |
| `mbm-monogram.png` | MBM monogram | 1167×668 | transparent | Compact mark, favicons, merch |
| `mbm-lockup-horizontal.png` | Emblem + wordmark, side by side | 2600×430 | transparent | **Nav / header** |
| `mbm-lockup-stacked.png` | Emblem over wordmark | 2000×1126 | transparent | Footer / splash / mobile |
| `mbm-og.png` | Social card | 1200×630 | white | Open Graph / Twitter image |
| `mbm-avatar.png` | Profile image (circle-safe) | 1024² | white | Instagram / social avatar |
| `mbm-wordmark-white.png` | Wordmark, white | 2400×166 | transparent | Wordmark on dark fields |
| `mbm-lockup-horizontal-dark.png` | Horizontal lockup, white wordmark | 2600×430 | transparent | Nav/header on dark |
| `mbm-lockup-stacked-dark.png` | Stacked lockup, white wordmark | 2000×1126 | transparent | Footer/splash on dark |
| `mbm-og-dark.png` | Social card, dark | 1200×630 | navy | OG / Twitter image (dark) |
| `mbm-avatar-dark.png` | Profile image, dark | 1024² | navy | Social avatar (dark) |

### Favicons → `public/`

`favicon.svg` · `favicon.ico` · `favicon-16x16.png` · `favicon-32x32.png` ·
`favicon-48x48.png` · `apple-touch-icon.png` (180) · `android-chrome-192x192.png` ·
`android-chrome-512x512.png` · `site.webmanifest`

`<head>`:
```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#005A9C">
```

OG meta (use `mbm-og.png`, deployed to site root or `/og`):
```html
<meta property="og:image" content="https://mbm-baseball-training.com/mbm-og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
```

## Usage rules

- **Clear space:** keep padding ≥ the cap-height of the wordmark's "M" around any
  lockup.
- **Min size:** the full emblem needs ≥ ~40px tall to hold detail; below that use
  `mbm-monogram.png` or the favicon.
- **Backgrounds:** the emblem is transparent and reads on white, light, and dark.
  Avoid placing the blue emblem on a blue field (low contrast) — use white/light,
  a dark field, or `mbm-emblem-on-white.png`. On busy photos, sit it on a panel.
- **Don't:** recolor, rotate, add effects/shadows, stretch, or recompose the mark.

## Source & reproducibility

- **Sources:** `~/agent/inbox/images/mbm-emblem-master-v1.jpg`,
  `mbm-icon-candidates-v1.jpg` (cell 3 = monogram), `mbm-wordmark-candidates-v1.jpg`
  (row 3 = wordmark) — Nano Banana Pro renders via AI Studio.
- **Pipeline:** `scripts/brand_pipeline.py` (crop + key + favicons),
  `scripts/brand_compose.py` (lockups + OG + avatar). Re-run after any source swap.
- **`assets-incoming/brand/_preview/`** is QA scratch — **not for deploy.**
- Direction/rationale: `docs/branding/mbm-brand-intake.md`. Reference: `references/myles-ref-dia-de-muertos.png`.
