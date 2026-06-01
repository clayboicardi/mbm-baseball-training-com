#!/usr/bin/env python3
"""MBM Baseball Training — composed brand assets (stage 2).

Builds lockups + social surfaces from the keyed transparent masters produced by
brand_pipeline.py. Composites from the FULL-RES masters to avoid upscaling.

Outputs -> assets-incoming/brand/
  mbm-lockup-horizontal.png (+ preview on white)   nav / header
  mbm-lockup-stacked.png    (+ preview on white)    footer / splash / mobile
  mbm-og.png                1200x630                Open Graph / social card
  mbm-avatar.png            1024x1024               IG/social profile (circle-safe)
"""
from pathlib import Path
from PIL import Image

PROJ = Path(r"C:\Users\chawo\Projects\mbm-baseball-training-com")
BRAND = PROJ / "assets-incoming" / "brand"
WORK = BRAND / "_preview"
WORK.mkdir(parents=True, exist_ok=True)
WHITE = (255, 255, 255)
NAVY = (11, 31, 51)   # dark field for dark-mode surfaces

emblem = Image.open(BRAND / "mbm-emblem-master.png").convert("RGBA")   # 4096^2 transparent
word = Image.open(BRAND / "mbm-wordmark-master.png").convert("RGBA")   # 6153x426 transparent


def h(img, height):
    return img.resize((round(img.width * height / img.height), height), Image.LANCZOS)


def flatten(rgba, bg=WHITE):
    c = Image.new("RGBA", rgba.size, bg + (255,))
    c.alpha_composite(rgba)
    return c.convert("RGB")


def cap_width(img, maxw):
    return img.resize((maxw, round(img.height * maxw / img.width)), Image.LANCZOS) if img.width > maxw else img


# ---------- Horizontal lockup (emblem | wordmark) ----------
E = 1200
em, wm = h(emblem, E), h(word, int(E * 0.34))
gap = int(E * 0.14)
lock = Image.new("RGBA", (em.width + gap + wm.width, E), (0, 0, 0, 0))
lock.alpha_composite(em, (0, (E - em.height) // 2))
lock.alpha_composite(wm, (em.width + gap, (E - wm.height) // 2))
lock = cap_width(lock, 2600)
lock.save(BRAND / "mbm-lockup-horizontal.png")
flatten(lock).save(WORK / "prev-lockup-horizontal.png")

# ---------- Stacked lockup (emblem over wordmark) ----------
E2 = 1280
em2, wm2 = h(emblem, E2), h(word, int(E2 * 0.15))
gap2 = int(E2 * 0.07)
W2, H2 = max(em2.width, wm2.width), em2.height + gap2 + wm2.height
st = Image.new("RGBA", (W2, H2), (0, 0, 0, 0))
st.alpha_composite(em2, ((W2 - em2.width) // 2, 0))
st.alpha_composite(wm2, ((W2 - wm2.width) // 2, em2.height + gap2))
st = cap_width(st, 2000)
st.save(BRAND / "mbm-lockup-stacked.png")
flatten(st).save(WORK / "prev-lockup-stacked.png")

# ---------- OG image 1200x630 (stacked lockup centered on white) ----------
og = Image.new("RGBA", (1200, 630), WHITE + (255,))
s = min(1000 / st.width, 500 / st.height)
lk = st.resize((round(st.width * s), round(st.height * s)), Image.LANCZOS)
og.alpha_composite(lk, ((1200 - lk.width) // 2, (630 - lk.height) // 2))
og.convert("RGB").save(BRAND / "mbm-og.png")

# ---------- Avatar 1024 (emblem centered, scaled to survive circle crop) ----------
av = Image.new("RGBA", (1024, 1024), WHITE + (255,))
em_av = h(emblem, 676)   # corners stay inside the inscribed circle (IG/Discord crop)
av.alpha_composite(em_av, ((1024 - em_av.width) // 2, (1024 - em_av.height) // 2))
av.convert("RGB").save(BRAND / "mbm-avatar.png")


# ---------- DARK variants (white wordmark on navy) ----------
def recolor(mark, rgb):
    out = Image.new("RGBA", mark.size, rgb + (0,))
    out.putalpha(mark.getchannel("A"))
    return out


word_w = recolor(word, WHITE)
cap_width(word_w, 2400).save(BRAND / "mbm-wordmark-white.png")

# dark horizontal lockup (transparent; use on dark surfaces)
emh, wmh = h(emblem, E), h(word_w, int(E * 0.34))
lockd = Image.new("RGBA", (emh.width + gap + wmh.width, E), (0, 0, 0, 0))
lockd.alpha_composite(emh, (0, (E - emh.height) // 2))
lockd.alpha_composite(wmh, (emh.width + gap, (E - wmh.height) // 2))
lockd = cap_width(lockd, 2600)
lockd.save(BRAND / "mbm-lockup-horizontal-dark.png")
flatten(lockd, NAVY).save(WORK / "prev-lockup-horizontal-dark.png")

# dark stacked lockup
em2d, wm2d = h(emblem, E2), h(word_w, int(E2 * 0.15))
W2d, H2d = max(em2d.width, wm2d.width), em2d.height + gap2 + wm2d.height
std = Image.new("RGBA", (W2d, H2d), (0, 0, 0, 0))
std.alpha_composite(em2d, ((W2d - em2d.width) // 2, 0))
std.alpha_composite(wm2d, ((W2d - wm2d.width) // 2, em2d.height + gap2))
std = cap_width(std, 2000)
std.save(BRAND / "mbm-lockup-stacked-dark.png")

# dark OG (stacked white-wordmark lockup on navy)
ogd = Image.new("RGBA", (1200, 630), NAVY + (255,))
sd = min(1000 / std.width, 500 / std.height)
lkd = std.resize((round(std.width * sd), round(std.height * sd)), Image.LANCZOS)
ogd.alpha_composite(lkd, ((1200 - lkd.width) // 2, (630 - lkd.height) // 2))
ogd.convert("RGB").save(BRAND / "mbm-og-dark.png")

# dark avatar (emblem on navy)
avd = Image.new("RGBA", (1024, 1024), NAVY + (255,))
avd.alpha_composite(em_av, ((1024 - em_av.width) // 2, (1024 - em_av.height) // 2))
avd.convert("RGB").save(BRAND / "mbm-avatar-dark.png")

print("compose done: light + dark variants "
      f"(horizontal {lock.size}, stacked {st.size}, og/avatar light+dark, wordmark-white)")
