#!/usr/bin/env python3
"""
Generates NIE's logo set (deterministic; no fonts needed at render time):
  assets/logo.svg        full logo: latte-cream tile, tangled waves resolving into one clean wave across a divider, "NIE" in serif
  assets/logo-small.svg  simplified, bolder variant for <=48px Windows icon sizes (no text)
  apps/web/assets/mark.svg  monochrome (alpha) mark for the app header, tinted with CSS
The "NIE" letters are outlines taken from Liberation Serif Regular, so they render identically everywhere.
Requires: pip install fonttools
"""
import math, pathlib
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONT = "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf"

CREAM_C, CREAM_E = "#fcf6ee", "#efdfcf"
SOFT, DEEP, INK = "#c9ad93", "#8c5d3d", "#7a5236"

def smooth(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)

def path_from(points):
    return "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in points)

def clean_wave(x0, x1, cy, amp, period, phase_x, n=160):
    return [(x0 + (x1 - x0) * i / n, cy - amp * math.sin(2 * math.pi * (x0 + (x1 - x0) * i / n - phase_x) / period)) for i in range(n + 1)]

def tangled_waves(x0, x1, cy, clean_amp, period, phase_x, strands, n=200):
    """Several lines that wander freely at the left edge and are pulled onto the clean wave at x1."""
    out = []
    for amp, per, ph in strands:
        pts = []
        for i in range(n + 1):
            x = x0 + (x1 - x0) * i / n
            t = (x - x0) / (x1 - x0)
            pull = smooth((t - 0.45) / 0.55)  # strands roam freely, then settle onto the clean wave at the divider
            base = cy - clean_amp * math.sin(2 * math.pi * (x - phase_x) / period)
            free = cy + amp * math.sin(2 * math.pi * x / per + ph)
            pts.append((x, free * (1 - pull) + base * pull))
        out.append(pts)
    return out

def glyph_paths(text, size, x_center, baseline, tracking):
    font = TTFont(FONT)
    gs, cmap, upm = font.getGlyphSet(), font.getBestCmap(), font["head"].unitsPerEm
    scale = size / upm
    advances = [font["hmtx"][cmap[ord(c)]][0] * scale for c in text]
    total = sum(advances) + tracking * (len(text) - 1)
    x = x_center - total / 2
    d = []
    for c, adv in zip(text, advances):
        pen = SVGPathPen(gs)
        gs[cmap[ord(c)]].draw(TransformPen(pen, (scale, 0, 0, -scale, x, baseline)))
        d.append(pen.getCommands())
        x += adv + tracking
    return " ".join(d)

def build_full():
    cy, x0, xm, x1 = 213, 55, 250, 445
    strands = [(22, 88, 0.0), (31, 104, 1.3), (17, 76, 2.5), (34, 121, 0.6), (26, 95, 3.3)]
    left = tangled_waves(x0, xm, cy, 22, 80, xm, strands)
    right = clean_wave(xm, x1, cy, 33, 80, xm)
    letters = glyph_paths("NIE", 62, 250, 366, 15)
    g = []
    for i, pts in enumerate(left):
        g.append(f'<path d="{path_from(pts)}" fill="none" stroke="{SOFT}" stroke-width="{1.35 + 0.1 * (i % 2)}" stroke-opacity="{0.55 + 0.1 * (i % 3)}" stroke-linecap="round"/>')
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500" role="img" aria-label="NIE">
  <defs>
    <radialGradient id="tile" cx="50%" cy="44%" r="75%">
      <stop offset="0" stop-color="{CREAM_C}"/><stop offset=".7" stop-color="#f4e7da"/><stop offset="1" stop-color="{CREAM_E}"/>
    </radialGradient>
  </defs>
  <rect width="500" height="500" rx="112" fill="url(#tile)"/>
  <g>{"".join(g)}</g>
  <path d="{path_from(right)}" fill="none" stroke="{DEEP}" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="250" y1="146" x2="250" y2="274" stroke="{DEEP}" stroke-width="1.6" stroke-linecap="round"/>
  <path d="{letters}" fill="{INK}"/>
</svg>
'''

def build_small():
    """Bolder and simpler so it survives 16-48px: two tangled strands, one strong wave, a firm divider, no text."""
    cy, x0, xm, x1 = 250, 70, 250, 430
    strands = [(46, 150, 0.2), (62, 190, 1.7)]
    left = tangled_waves(x0, xm, cy, 52, 190, xm, strands, n=120)
    right = clean_wave(xm, x1, cy, 62, 190, xm, n=120)
    g = "".join(f'<path d="{path_from(p)}" fill="none" stroke="#c19c80" stroke-width="15" stroke-opacity=".85" stroke-linecap="round"/>' for p in left)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500" role="img" aria-label="NIE">
  <defs><radialGradient id="tile" cx="50%" cy="44%" r="75%"><stop offset="0" stop-color="{CREAM_C}"/><stop offset="1" stop-color="{CREAM_E}"/></radialGradient></defs>
  <rect width="500" height="500" rx="112" fill="url(#tile)"/>
  {g}
  <path d="{path_from(right)}" fill="none" stroke="{DEEP}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="250" y1="120" x2="250" y2="380" stroke="{DEEP}" stroke-width="14" stroke-linecap="round"/>
</svg>
'''

def build_mark():
    """Alpha-only artwork (black at varying opacity) used as a CSS mask, so the header mark follows the theme colour."""
    cy, x0, xm, x1 = 30, 4, 60, 116
    strands = [(11, 34, 0.0), (15, 41, 1.3), (9, 29, 2.5)]
    left = tangled_waves(x0, xm, cy, 11, 56, xm, strands, n=90)
    right = clean_wave(xm, x1, cy, 14, 56, xm, n=90)
    g = "".join(f'<path d="{path_from(p)}" fill="none" stroke="#000" stroke-width="2.3" stroke-opacity=".6" stroke-linecap="round"/>' for p in left)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60" width="120" height="60">
  {g}
  <path d="{path_from(right)}" fill="none" stroke="#000" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="60" y1="6" x2="60" y2="54" stroke="#000" stroke-width="2.6" stroke-linecap="round"/>
</svg>
'''

(ROOT / "assets/logo.svg").write_text(build_full())
(ROOT / "assets/logo-small.svg").write_text(build_small())
(ROOT / "apps/web/assets/mark.svg").write_text(build_mark())
(ROOT / "apps/web/assets/logo.svg").write_text(build_full())
print("wrote assets/logo.svg, assets/logo-small.svg, apps/web/assets/mark.svg, apps/web/assets/logo.svg")
