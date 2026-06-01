#!/usr/bin/env python3
"""MBM Baseball Training — brand asset pipeline.

Takes the AI-Studio (Nano Banana Pro) source renders from ~/agent/inbox/images/
and produces the deploy-ready brand bundle:

  assets-incoming/brand/  — emblem (transparent + on-white), wordmark, monogram
  public/                 — favicon set (.ico + PNG sizes, apple-touch, android-chrome)
  assets-incoming/brand/_preview/ — QA previews (emblem on light/dark, favicon strip)

Sources (locked picks):
  mbm-emblem-master-v1.jpg      — hero emblem (capped sugar-skull baseball badge)
  mbm-icon-candidates-v1.jpg    — favicon icons; we crop CELL 3 (MBM varsity monogram)
  mbm-wordmark-candidates-v1.jpg — wordmarks; we crop ROW 3 (blue slab serif)

Keying: single-color marks (monogram, wordmark) are luma-keyed to antialiased
transparent blue. The multi-color emblem (has white interior) is keyed by
flood-filling the exterior gray from the corners, preserving interior whites.

Re-run after replacing any source. Idempotent.
"""
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw

SRC = Path.home() / "agent" / "inbox" / "images"
PROJ = Path(r"C:\Users\chawo\Projects\mbm-baseball-training-com")
BRAND = PROJ / "assets-incoming" / "brand"
PUBLIC = PROJ / "public"
WORK = BRAND / "_preview"
for d in (BRAND, PUBLIC, WORK):
    d.mkdir(parents=True, exist_ok=True)

BLUE = (0, 90, 156)      # #005A9C
RED = (239, 62, 66)      # #EF3E42
WHITE = (255, 255, 255)
DARK = (11, 31, 51)      # preview dark field
GRAY = (233, 233, 233)   # render background


def blue_mask(img):
    """Bright where pixel is brand-blue (B channel >> R channel)."""
    r, g, b = img.convert("RGB").split()
    return ImageChops.subtract(b, r)


def blue_bbox(img, x0f=0.0, x1f=1.0, y0f=0.0, y1f=1.0, thr=40):
    w, h = img.size
    box = (int(w * x0f), int(h * y0f), int(w * x1f), int(h * y1f))
    reg = img.crop(box)
    mask = blue_mask(reg).point(lambda i: 255 if i > thr else 0)
    bb = mask.getbbox()
    if not bb:
        raise SystemExit("no blue content found in region")
    return (bb[0] + box[0], bb[1] + box[1], bb[2] + box[0], bb[3] + box[1])


def nongray_bbox(img, thr=14):
    w, h = img.size
    diff = ImageChops.difference(img.convert("RGB"), Image.new("RGB", (w, h), GRAY)).convert("L")
    bb = diff.point(lambda i: 255 if i > thr else 0).getbbox()
    if not bb:
        raise SystemExit("no non-gray content found")
    return bb


def pad_crop(img, bb, pad):
    w, h = img.size
    pw, ph = int((bb[2] - bb[0]) * pad), int((bb[3] - bb[1]) * pad)
    return img.crop((max(0, bb[0] - pw), max(0, bb[1] - ph),
                     min(w, bb[2] + pw), min(h, bb[3] + ph)))


def key_solid(img, color=BLUE, full=110):
    """Key a single-color (blue) mark by blueness (B-R) -> antialiased transparent
    `color`. Drops neutral-gray cell labels (B-R ~ 0) regardless of crop padding."""
    r, g, b = img.convert("RGB").split()
    diff = ImageChops.subtract(b, r)
    lut = [min(255, int(i / full * 255)) for i in range(256)]
    out = Image.new("RGBA", img.size, color + (0,))
    out.putalpha(diff.point(lut))
    return out


def trim_alpha(rgba, pad=0.03):
    """Crop an RGBA image to its non-transparent bounds + a small even margin."""
    bb = rgba.getbbox()
    return pad_crop(rgba, bb, pad) if bb else rgba


def key_emblem(img, thresh=46):
    """Flood-fill exterior gray -> transparent; preserve interior whites."""
    rgba = img.convert("RGBA")
    w, h = rgba.size
    for xy in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        ImageDraw.floodfill(rgba, xy, (0, 0, 0, 0), thresh=thresh)
    return rgba


def fit_square(mark, size, pad, bg=None):
    canvas = Image.new("RGBA", (size, size), (bg + (255,)) if bg else (0, 0, 0, 0))
    inner = int(size * (1 - 2 * pad))
    m = mark.copy()
    m.thumbnail((inner, inner), Image.LANCZOS)
    canvas.alpha_composite(m, ((size - m.width) // 2, (size - m.height) // 2))
    return canvas


def on_field(mark, bg, pad=40, maxs=640):
    m = mark.copy()
    m.thumbnail((maxs, maxs), Image.LANCZOS)
    c = Image.new("RGBA", (m.width + 2 * pad, m.height + 2 * pad), bg + (255,))
    c.alpha_composite(m, (pad, pad))
    return c.convert("RGB")


# ---------- EMBLEM (hero) ----------
em = Image.open(SRC / "mbm-emblem-master-v1.jpg")
em_c = pad_crop(em, nongray_bbox(em), 0.03)
em_t = trim_alpha(key_emblem(em_c))
em_t.save(BRAND / "mbm-emblem-master.png")                       # full-res transparent archive
web = em_t.copy(); web.thumbnail((2048, 2048), Image.LANCZOS)
web.save(BRAND / "mbm-emblem.png")                               # web transparent (2048)
Image.alpha_composite(Image.new("RGBA", em_t.size, WHITE + (255,)), em_t)\
    .convert("RGB").save(BRAND / "mbm-emblem-on-white.png")
print(f"emblem: src {em.size} -> crop {em_c.size}")

# ---------- WORDMARK (row 3) ----------
wm = Image.open(SRC / "mbm-wordmark-candidates-v1.jpg")
wm_c = pad_crop(wm, blue_bbox(wm, y0f=0.66, y1f=1.0), 0.05)
wm_t = trim_alpha(key_solid(wm_c))
wm_t.save(BRAND / "mbm-wordmark-master.png")
wmw = wm_t.copy(); wmw.thumbnail((2400, 2400), Image.LANCZOS)
wmw.save(BRAND / "mbm-wordmark.png")
print(f"wordmark: crop {wm_c.size}")

# ---------- MONOGRAM (cell 3) -> favicons ----------
ic = Image.open(SRC / "mbm-icon-candidates-v1.jpg")
mono_c = pad_crop(ic, blue_bbox(ic, x0f=0.66), 0.04)
mono = trim_alpha(key_solid(mono_c))
mono.save(BRAND / "mbm-monogram.png")
print(f"monogram: crop {mono_c.size}")

for s in (16, 32, 48):
    fit_square(mono, s, 0.06).save(PUBLIC / f"favicon-{s}x{s}.png")
fit_square(mono, 256, 0.06).save(PUBLIC / "favicon.ico", format="ICO",
                                 sizes=[(16, 16), (32, 32), (48, 48)])
fit_square(mono, 180, 0.16, bg=WHITE).convert("RGB").save(PUBLIC / "apple-touch-icon.png")
fit_square(mono, 192, 0.16, bg=WHITE).convert("RGB").save(PUBLIC / "android-chrome-192x192.png")
fit_square(mono, 512, 0.16, bg=WHITE).convert("RGB").save(PUBLIC / "android-chrome-512x512.png")

# SVG favicon: binary-trace the monogram, recolor paths to brand blue, transparent bg
try:
    import vtracer
    bw = Image.composite(Image.new("RGB", mono.size, (0, 0, 0)),
                         Image.new("RGB", mono.size, (255, 255, 255)), mono.getchannel("A"))
    bw.thumbnail((400, 400), Image.LANCZOS)  # compact trace; SVG scales infinitely anyway
    tmp = WORK / "_mono_bw.png"
    bw.save(tmp)
    svg = PUBLIC / "favicon.svg"
    vtracer.convert_image_to_svg_py(str(tmp), str(svg), colormode="binary",
                                    filter_speckle=6, corner_threshold=70)
    import re
    t = svg.read_text(encoding="utf-8")
    for k in ('fill="#000000"', 'fill="black"', 'fill="#000"'):
        t = t.replace(k, 'fill="#005A9C"')
    t = re.sub(r'(<svg\b[^>]*?\bwidth="(\d+)" height="(\d+)")>',
               r'\1 viewBox="0 0 \2 \3">', t, count=1)
    svg.write_text(t, encoding="utf-8")
    print("favicon.svg written")
except Exception as e:
    print("favicon.svg skipped:", repr(e))

# ---------- QA PREVIEWS ----------
on_field(em_t, WHITE).save(WORK / "prev-emblem-white.png")
on_field(em_t, DARK).save(WORK / "prev-emblem-dark.png")
on_field(wm_t, WHITE, maxs=1400).save(WORK / "prev-wordmark-white.png")
strip = Image.new("RGBA", (16 + 32 + 48 + 70, 84), WHITE + (255,))
x = 12
for s in (16, 32, 48):
    strip.alpha_composite(fit_square(mono, s, 0.06), (x, (84 - s) // 2)); x += s + 18
strip.alpha_composite(fit_square(mono, 16, 0.06).resize((64, 64), Image.NEAREST), (x, 10))
strip.convert("RGB").save(WORK / "prev-favicons.png")
print("done")
