#!/usr/bin/env python3
"""Regenerate assets/luke-erickson-resume.pdf from tools/resume-print.html
using headless Chrome (fonts embedded, brand-styled, Letter size).

    python3 tools/build-resume-pdf.py

Edit tools/resume-print.html first when roles or figures change, and keep it
in sync with resume/index.html.
"""
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "tools/resume-print.html"
OUT = ROOT / "assets/luke-erickson-resume.pdf"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

if not pathlib.Path(CHROME).exists():
    sys.exit(f"Chrome not found at {CHROME}")

cmd = [
    CHROME,
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    "--allow-file-access-from-files",
    f"--print-to-pdf={OUT}",
    SRC.as_uri(),
]
subprocess.run(cmd, check=True, capture_output=True, timeout=60)
print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size:,} bytes)")
