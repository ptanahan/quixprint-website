#!/usr/bin/env python3
"""Create responsive WebP exports from an approved high-quality blog hero.
Usage: python3 scripts/prepare-blog-images.py /path/to/master.png article-slug
Requires: python3 -m pip install Pillow
Output: legacy-site/assets/<slug>-hero-{480,960,source-width}.webp
Review source at 100% before exporting; this does not repair AI artifacts.
"""
import sys
from pathlib import Path
from PIL import Image, ImageOps
if len(sys.argv) != 3:
    raise SystemExit('Usage: python3 scripts/prepare-blog-images.py MASTER_IMAGE slug')
source, slug = Path(sys.argv[1]), sys.argv[2]
if not slug.replace('-', '').isalnum(): raise SystemExit('Use a simple URL-safe slug')
image = ImageOps.exif_transpose(Image.open(source)).convert('RGB')
if image.width < 1200: raise SystemExit('Master image too small: use a higher-resolution source')
out = Path(__file__).resolve().parents[1] / 'legacy-site/assets'
out.mkdir(parents=True, exist_ok=True)
for width in sorted(set([480, 960, image.width])):
    if width > image.width: continue
    scaled = image if width == image.width else image.resize((width, round(image.height * width / image.width)), Image.Resampling.LANCZOS)
    path = out / f'{slug}-hero-{width}.webp'
    scaled.save(path, 'WEBP', quality=90 if width == image.width else 86, method=6)
    print(path, f'{path.stat().st_size/1024:.0f} KB')
