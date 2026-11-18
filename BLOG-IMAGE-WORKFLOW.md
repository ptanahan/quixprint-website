# Quixprint blog image workflow

1. Approve the original at 100% zoom. Check lettering, folds, logos and fine details. Prefer actual artwork over AI-generated microtext.
2. Keep the high-quality original outside the website repository as a master.
3. Run `python3 scripts/prepare-blog-images.py /path/to/master.png your-article-slug` (install Pillow if needed).
4. Use `-480.webp` as the blog post `thumbnail`; add `thumbnailSrcSet` with `-480.webp 480w, -960.webp 960w` in `legacy-site/blog/posts.js`.
5. Use the largest exported file for the article hero, with a `srcset` including `-960.webp` and the largest file, and a `sizes` attribute matching the article container.
6. Keep the original `width` and `height` attributes for layout stability. Test both blog cards and the full article on mobile and desktop, including a Retina display.
7. Always edit `legacy-site/` files: the build copies them into `dist/`. Do not edit `dist/` or the unused top-level `blog/` and `assets/` copies.

This fixes image delivery, not AI image artifacts. Existing blog images without variants continue to work unchanged. No paid service or new production dependency is required.
