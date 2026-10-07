#!/usr/bin/env python3
"""Generate a sitemap from public index.html files before Netlify publishes."""
from pathlib import Path
from urllib.parse import quote
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://www.quixprint.com"
EXCLUDED_PARTS = {"_post-template", "email-preview", "thanks", "cart", "checkout", "custom-product", "node_modules", ".git", "dist", "scripts"}

urls = []
for page in sorted(ROOT.rglob("index.html")):
    relative = page.relative_to(ROOT)
    if any(part in EXCLUDED_PARTS or part.startswith(".") for part in relative.parts[:-1]):
        continue
    folder = relative.parent
    path = "/" if str(folder) == "." else "/" + "/".join(quote(p) for p in folder.parts) + "/"
    urls.append(BASE + path)

lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
lines += [f'  <url><loc>{escape(url)}</loc></url>' for url in urls]
lines.append('</urlset>')
(ROOT / 'sitemap.xml').write_text("\n".join(lines) + "\n", encoding='utf-8')
print(f"Generated sitemap.xml with {len(urls)} public pages")
