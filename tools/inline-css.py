#!/usr/bin/env python3
"""Inline assets/css/styles.css into every page.

styles.css stays the source of truth. After ANY edit to it, run:

    python3 tools/inline-css.py

The script rewrites the <style data-inline-css> block in each HTML page
(idempotent). Relative font url()s are rewritten to root-absolute so the
inlined CSS works at any URL depth (/, /resume/, /about/me/).
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES = ["index.html", "resume/index.html", "about/me/index.html", "404.html", "privacy/index.html", "press/index.html", "speaking/index.html", "mentorship/index.html", "guides/angel-investors-ventura-county/index.html", "guides/start-a-nonprofit-in-your-20s/index.html", "guides/join-a-board-in-your-20s/index.html"]

css = (ROOT / "assets/css/styles.css").read_text()
css = css.replace("url('../fonts/", "url('/assets/fonts/")
style_block = "<style data-inline-css>\n" + css.strip() + "\n</style>"

link_re = re.compile(r'<link rel="stylesheet" href="[^"]*styles\.css[^"]*"[^>]*>')
style_re = re.compile(r"<style data-inline-css>.*?</style>", re.S)

failed = False
for rel in PAGES:
    page = ROOT / rel
    html = page.read_text()
    if style_re.search(html):
        html = style_re.sub(lambda _: style_block, html, count=1)
    elif link_re.search(html):
        html = link_re.sub(lambda _: style_block, html, count=1)
    else:
        print(f"ERROR: no stylesheet link or inline block found in {rel}")
        failed = True
        continue
    page.write_text(html)
    print(f"inlined into {rel} ({len(style_block):,} bytes)")

sys.exit(1 if failed else 0)
