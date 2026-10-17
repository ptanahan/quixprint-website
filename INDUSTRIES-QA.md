# Industry update verification — October 17, 2026

## Passed

- Preview build and production build both complete: 61 generated pages, 30 catalog products, 79 sitemap URLs, 88 total HTML files including retained pages.
- 74 automated checks pass in each build mode; zero failures.
- Twelve industry pages and one overview have distinct titles/descriptions, canonical URLs, Open Graph imagery and Twitter metadata. Industry pages include service and breadcrumb structured data.
- All new page links, fragment targets, product routes, hero files and responsive image sources resolve to local build output.
- Production industry pages use index/follow; preview pages and quote pages retain their existing noindex behavior.
- New Industries menu behavior was exercised with event fixtures: mouse hover, mobile tap, keyboard ArrowDown, Escape, outside focus, scrim clicks and link clicks. Product/Industries menus close one another. Hub/catalog text links remain regular links.
- Existing product specification, artwork-version, quote validation, attachment and mock email-delivery checks pass, including native mobile foil-color selection tests.
- Portable preview includes all new pages and embedded hero images; its inline scripts parse successfully.
- HTML structure checks cover a single main region, H1 and title, image alt attributes and production indexing.
- Religious Organizations links to the main quote flow and includes no TrueLife promotion.
- Original catalog data, specification libraries, Netlify configuration/functions and Churches source are byte-identical. All 54 deployed Churches files are byte-identical to the original live build.
- No external quote request, email or deployment was performed.

## Existing test maintenance

The input ZIP already failed two assertions: a legal-page test expected an unversioned stylesheet URL even though the build adds a cache version; the email test expected sales@ even though production already routes to quotes@. Both assertions now match the supplied implementation. The analytics page-count assertion now includes the thirteen industry pages, including the overview. These changes do not alter production email behavior.

## Revision 2 design changes

The original five pages have 47–50% fewer words in their main content, including FAQ answers. Twelve industry pages each use a dedicated hero and a second environmental photograph. Seven new heroes and twelve supporting photographs were generated and visually inspected. Product descriptions, recurring-print messaging and calls to action are concise; two FAQs per page retain useful details.

## Revision 3 design changes

All 24 industry photographs are replaced with simpler compositions, usually one or two focal objects. Each industry has a distinct palette and setting. Image containers use a 3:2 ratio to preserve the compositions. The category now reads Restaurants & Cafes throughout the industry pages and navigation. The footer Industries link appears under Let’s talk print, immediately before Custom printing, and no longer appears beside Journal. Footer placement and a single Industries link were verified across all 62 main-site pages with the shared footer.

## Final revision 5

All twelve Good to know sections are removed. Requested homepage text and quote links are checked in generated HTML. Homepage image markup and unrelated copy remain unchanged. Orientation values across the catalog (Horizontal, Vertical, Landscape, Portrait) map to the corresponding shared wide or tall icon rules. All 30 product forms contain the required-fields note. Heading tracking is relaxed without changing typefaces or font sizes; the hero, partnership and closing headings use the requested two-line format.

## Revision 11 industry refinements

The new Real Estate postcard composition was generated with the built-in image-generation tool and visually inspected. Desktop and mobile WebP files retain the 3:2 ratio and existing asset URLs; alt text describes the replacement. The original PNG and prompt are included in review materials. Restaurants & Cafes and Trade Shows have explicit third-line phrases that do not split between words. The remaining visual-review limitations below still apply to browser layouts.

## Revision 10 orientation controls

The shared product renderer now selects the orientation icon control for every Orientation field, including fields originating in the legacy catalog. Horizontal/Landscape uses a wide icon; Vertical/Portrait uses a tall icon. Display labels and order are consistent, while the original stored values and defaults remain intact. Renderer event checks exercise the selected state and both option buttons across product and shape/format cases; the underlying catalog and engine are byte-identical to the original.

## Revision 9 product template placement

Every main-site product page contains exactly one template-request note in the product description section and none in the specification form. The product-specific mailto subject is preserved, and the existing required-field explanation remains in the form. The mobile description ordering is unchanged.

## Revision 8 homepage product shortcuts

The Popular Products directory contains sixteen alphabetized shortcuts and 28 product/format links, plus View all products. The top navigation retains its original categories and all 33 links. Existing homepage copy is retained. Thirty catalog products remain available to live search. Event fixtures cover hover, click, one-open-menu behavior, delayed pointer exit, arrow-key navigation, Escape, outside clicks/focus, resizing to mobile, search, clearing, no results and event cleanup. The suite contains 74 checks. Desktop tiles use three columns and two rows above 1000px, with the directory and grid stretched to the same height. At intermediate widths tiles use two columns. At 760px and below the complete directory is hidden and the original two-column six-tile layout remains with search above it. No fixed heights or clipped text are introduced.

## Responsive implementation reviewed in source

Desktop uses a split copy/image hero, three-column product grid and shared typography. At 760px and below, heroes and editorial/process sections stack, imagery uses a smaller source. The original mobile navigation stays on one row. Industries hides with Why Quixprint and Journal at 900px and below; it remains available in the footer. An open Industries dropdown closes on crossing that breakpoint. The homepage retains two-column product cards on mobile; other product grids use their existing breakpoints. Motion respects reduced-motion preferences. Existing product touch-select behavior is unchanged.

## Remaining visual review

The supported browser-testing integration was unavailable in this session. No real browser rendering, screenshot comparison, measured overflow audit or physical-device test was performed. Event fixtures validate behavior, not actual browser layout or native form validation. Responsive CSS review is not a substitute for those checks.

Before approving deployment, open the portable HTML and inspect widths of 320, 375, 390, 768, 1024 and 1440 pixels. Review the header, menu height, hero wrapping, card grids and quote fields. Check on iPhone Safari and Android Chrome if available. The generated imagery has been visually inspected separately.

Production delivery of emails and actual GA4 event receipt remain post-deployment checks; automated email tests used mocks and previews disable tracking.
