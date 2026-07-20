#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build global-events-cv.pdf from global-events-cv.html via WeasyPrint."""
import re, pathlib, subprocess

HERE = pathlib.Path(__file__).resolve().parent
SRC = HERE / "global-events-cv.html"
PRINT = pathlib.Path("/tmp/ge-print.html")
BG = HERE / "rail-bg.png"
OUT = HERE / "global-events-cv.pdf"
BG_URL = BG.as_posix()
PHOTO_URL = (HERE / "profile.jpg").as_posix()
RAIL_RGB = (30, 41, 59)

src = SRC.read_text(encoding="utf-8")
src = re.sub(r'<link href="https://fonts.googleapis.com[^>]*>', '', src)
src = src.replace('src="profile.jpg"', 'src="' + PHOTO_URL + '"')
for e in ["\U0001F464", "\U0001F4BC", "\U0001F331", "\U0001F393"]:
    src = src.replace('<span class="section-icon">' + e + '</span>',
                      '<span class="section-icon">&#9670;</span>')
src = re.sub(r'<div class="sidebar-section">\s*<div class="sidebar-section-title">Skills Snapshot</div>.*?</div>\s*</div>\s*(?=<div class="sidebar-section">\s*<div class="sidebar-section-title">Languages</div>)',
             '', src, flags=re.S)
src = re.sub(r'<div class="bar-track"><div class="bar-fill"[^>]*></div></div>\s*', '', src)
_int = {
  "Basketball coach for local youth teams. Former national youth player — teamwork, discipline, leadership.":
    "Basketball coach; former national youth player.",
  "Extensive global travel across 100+ countries — deep appreciation for cultural nuance in live experiences.":
    "Travelled across 100+ countries.",
  "AI and emerging technology, with active use of AI tools in production planning and brief development.":
    "Active use of AI in event production and planning.",
}
for _k, _v in _int.items():
    src = src.replace(_k, _v)

override = """
<style>
@page { size: A4; margin: 0; }
html{ background-image: url('__BG__'); background-repeat: repeat; background-position: top left; }
body{ background: transparent; }
.page{ display:block; width:100%; max-width:100%; margin:0; border-radius:0; box-shadow:none; background:transparent; }
.sidebar{ display:block; position:absolute; top:0; left:0; bottom:0; width:232px; padding:24px 20px; overflow:hidden; background:transparent; }
.main{ display:block; margin-left:232px; padding:28px 30px 28px 32px; background:#ffffff; }
.sidebar-section, .cap-list, .skill-entry, .lang-entry, .interests-list,
.content-section, .exp-entry, .exp-header, .exp-roles, .exp-role-row,
.highlights, .contact-item, .cap-item, .interest-item,
.section-header, .name-block, .sidebar-photo, .lang-row, .contact-strip { display:block; }
.sidebar-section{ margin-bottom:12px; }
.sidebar-photo{ text-align:center; margin-bottom:12px; }
.photo-circle{ display:inline-block; width:74px; height:74px; overflow:hidden; }
.photo-circle img{ width:100%; height:100%; object-fit:cover; border-radius:50%; }
.sidebar-section-title{ margin-bottom:6px; font-size:0.55rem; }
.contact-item{ margin-bottom:4px; }
.contact-icon{ display:inline-block; }
.cap-item{ margin-bottom:4px; }
.lang-entry{ margin-bottom:6px; }
.lang-name{ display:inline-block; }
.lang-level{ float:right; }
.lang-row{ overflow:hidden; }
.interest-item{ margin-bottom:6px; }
.content-section{ margin-bottom:18px; }
.section-header{ margin-bottom:10px; }
.section-icon, .section-title{ display:inline; vertical-align:middle; }
.profile-text{ margin-bottom:7px; }
.exp-entry{ padding-bottom:11px; page-break-inside:avoid; }
.exp-entry + .exp-entry{ padding-top:11px; }
.exp-company{ margin-bottom:2px; }
.exp-role-row{ margin-bottom:1px; }
.exp-role-title, .exp-period{ display:inline; }
.exp-period{ margin-left:8px; }
.highlights{ margin-top:5px; }
.highlights li{ margin-bottom:3px; }
.name-block .role-title{ margin-bottom:7px; }
.contact-strip span{ display:inline-block; margin-right:14px; }
</style>
"""
override = override.replace("__BG__", BG_URL)
src = src.replace("</head>", override + "\n</head>")
PRINT.write_text(src, encoding="utf-8")

if not BG.exists():
    import fitz
    W, H = 794, 1123
    pm = fitz.Pixmap(fitz.csRGB, fitz.IRect(0, 0, W, H), False)
    pm.set_rect(fitz.IRect(0, 0, W, H), (255, 255, 255))
    pm.set_rect(fitz.IRect(0, 0, 232, H), RAIL_RGB)
    pm.save(str(BG))

subprocess.run(["weasyprint", str(PRINT), str(OUT)], check=True)
print("rendered", OUT)
