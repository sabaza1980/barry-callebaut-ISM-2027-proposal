import sys, pathlib
from playwright.sync_api import sync_playwright
src, out = sys.argv[1], sys.argv[2]
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page()
    pg.route("**/fonts.googleapis.com/**", lambda r: r.abort())
    pg.emulate_media(media="print")
    pg.goto(pathlib.Path(src).resolve().as_uri(), wait_until="load")
    pg.evaluate("document.fonts.ready.then(()=>true)")
    pg.wait_for_timeout(300)
    pg.pdf(path=out, format="A4", print_background=True, prefer_css_page_size=True)
    b.close()
