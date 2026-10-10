# Review build status

This package is a complete first review build, not a production launch. Preview requests do not send email. The current live website has not been changed.

## Included

- Thirty catalog product pages, with four sticker formats consolidated into one configurator, plus Custom Printing.
- A grouped Products menu with all 33 product entries: hover/click on desktop, expandable categories on mobile, keyboard controls, and Escape dismissal.
- Search and category filtering, original illustrative product artwork, responsive layouts, and rewritten marketing copy.
- Dependent product selections, requested/custom quantities, artwork versions, item notes, and optional current purchasing information.
- Persistent guest quote cart with editing and removal, required contact/shipping information, optional artwork/date/promo code, and printable receipt.
- Preview of the customer acknowledgement and internal quote email. Netlify/Brevo sending implementation is included but disabled in this review build.
- Existing Churches pages/assets/function preserved exactly from the supplied main backup. Journal index redesigned, with all existing article and policy main content preserved. Shared typography, article layouts, and navigation match the main website.
- Complete source, original artwork and prompts, catalog data, build scripts, automated checks, deployment instructions, and rollback instructions.

## Verification and remaining launch checks

The build and automated tests cover option dependencies, invalid selections, quantities, file validation, escaped email content, preview isolation, and mocked email success/failure behavior. Static checks verify internal references in the new pages and preservation of existing content.

Browser QA was unavailable in this environment. Before launch, review desktop and phone layouts, hover/touch/keyboard navigation, cart persistence, form behavior, and the full hosted quote journey in actual browsers. No real transactional email has been sent or verified.

Revision 08 includes direct, read-only inspection of the live Axiom roll-label, four sticker, laminated-menu, takeout-menu, counter-mat, A-frame and window-cling configurators. The captured menus and representative dependencies are implemented. Existing verified main-catalog configurations remain for other products. Exhaustive supplier parity across all materials, sizes, quantities and specialty-finish combinations is not claimed; compare the remaining combinations before production approval. Research JSON records the inspected fields and gaps.

The supplied Window Decals source actually describes clings. The new adhesive Window Decals page therefore accepts a custom inquiry pending verified decal specifications. The existing Churches implementation remains unchanged.

Counter Mats retains the requested Quixprint offering: hard-surface 6 mil white vinyl in 9 × 14, 10 × 15, and 11 × 17 inches. The supplier's current public page describes a different PVC offering. Treat the Quixprint sizes/material as business requirements requiring final fulfillment confirmation, not newly verified supplier specifications.

Artwork is illustrative and uses fictional example brands. Confirm any existing client-brand/logo permissions as part of the normal site review.

## Hosting

No new hosted URL was created. Open the self-contained HTML for design/flow review, or deploy this package to a separate Netlify preview project using DEPLOYMENT.md. Never attach the live domain or replace production until the review and launch approval are complete.

## Revision 07 — complete product review

- Dedicated, uncluttered studio imagery across all 30 catalog products. Twenty-six new shots plus four matching approved feature images. Fictional Alder, Northline, Morrow, Acre, Daymark, and Sora branding; Forma remains the homepage hero.
- Optimized 600px and 1200px WebP product assets, intrinsic 3:2 proportions, and responsive sources. Original PNGs and generation prompts retained.
- Refined product layouts, clearer configuration sections, product-specific details, and related products. Approved homepage/client strip and the six category labels preserved.
- Added verified gloss-coating dependencies for business/greeting cards and limited center-split magnets to verified combinations. Clarified the small-run booklet orientation.
- Fixed inactive purchasing fields blocking form validation and corrected the cart's pre-review wording. Preview cart storage is separated from real-site cart storage.
- Portable preview shares one embedded image registry instead of repeating image data across pages; legacy article images are optimized for the review package. The normal site retains its responsive source images.
- Checks include engine/server validation, controller-level add/edit behavior, portable route/image integrity, and original content preservation. These are not real-browser tests. Live supplier matrices and real email delivery remain launch checks.

## Revision 08 — product specification and quantity flow

- Artwork versions expand into named, independently editable quantity rows. The total is summed once and stays consistent in cart edits, checkout, receipt, and both email templates. Existing saved carts keep their old meaning. Notepad pad quantities and Custom Printing retain per-version controls.
- Roll labels use five shape controls, shape-specific size lists, orientation icons, a Custom Size link and separate dimensions, nine materials, dependent print color/lamination/liners, foil color, raised UV, corners and unwind choices. Turnaround is omitted.
- All four sticker formats use separate live-source menus and material-dependent finishes. Repeated stickers on sheets are counted as stickers; composed kiss-cut sheets are counted as finished sheets.
- Menus, A-frame signs and window clings use the observed live controls. Counter mats adopt lamination/corner and quantity controls while retaining the user-defined material and sizes. No price calculations are copied.
- Plain Product Specifications and Quantities headings, separate free-entry width/height fields, subtle image motion with reduced-motion support, removed sample caption and availability copy. Bulk Posters moved immediately before Large Format Posters in Signs & displays, with its related-product link connected.
- Build and 37 automated checks pass, including all eligible product quantity breakdowns, unequal-version editing, dependent field cleanup, invalid input rejection, email totals/escaping, portable image routes, and preserved Churches/articles. Browser layout QA of this build remains unavailable; supplier browser inspection is separate from site QA.
- Preview only. No production deployment or real transactional email.

## Revision 09 — homepage and checkout refinements

- Products is a catalog link; the adjacent arrow opens categories on touch, hover still opens the desktop dropdown, and Arrow Down opens it from the keyboard.
- Refined homepage experience line and section labels; removed the three numbered homepage steps. Journal cards now say Read article. The closing CTA button sits directly beneath its supporting copy.
- Roll-label foil, foil color, raised UV and round-corner controls removed at the user's request. Other products' finishing options unchanged.
- View roll unwind guide opens an accessible native dialog with an original four-direction diagram. No attachment accompanied the request; this is a provisional replacement based on the previously verified Axiom diagram, not the user's unattached file.
- Product button copy now says No payment required. Just a quote. Checkout required markers share the field-label line; the Questions line contains only the email link. Privacy remains in the global footer.
- Build and 39 automated tests pass. Browser layout QA remains unavailable. Nothing published.

## Revision 10 — journal, policies, and supplied unwind guide
- The roll unwind dialog now uses the exact supplied QXP guide, stored as lossless WebP at its native 503 × 365 resolution.
- Journal intro and archive heading copy stay grouped on desktop. UI calls posts articles. Featured articles rotate on each visit, excluding the previous selection where browser storage is available; same-session navigation also works without storage. The selected article is hidden from the archive to avoid duplication.
- All eight article closing buttons link to matching products: labels, counter mats, table tents, catalogs, postcards, and envelopes; broader color and Dyson articles link to the complete catalog. Article body copy is preserved.
- Privacy and Terms use the shared site typography, spacing, navigation and footer. Their existing legal text is unchanged. Both pages now work in the portable preview.
- Build and 42 automated tests pass. Browser layout QA remains unavailable in this environment. Nothing published or sent.

## Revision 11 — rotating hero and finishing details
- Homepage title: Quixprint | Printing for leading businesses. Experience line: 40+ years of experience. Serving businesses nationwide.
- The original Forma hero remains first. Two new lifestyle photographs (Acre catalogs and Northline stationery) rotate with a 1.35-second fade every 6.5 seconds. Discreet controls allow direct selection and pause. Rotation pauses on hover, keyboard focus, hidden tabs, and when offscreen; reduced-motion preferences disable autoplay. Navigation disposes of timers and listeners.
- Both new images were generated with built-in imagegen. Originals plus responsive 1536- and 768-pixel WebP assets are in artwork; exact prompts and output paths are in artwork/hero-lifestyle-prompts.json.
- The lower project CTA now pairs its existing copy with one stationery image on desktop. Mobile keeps the compact text-and-button layout.
- Unwind guide puts the hand-application note above the supplied graphic; bottom button removed. Native dialog supports X, Escape, and outside-click dismissal.
- Privacy policy address city changed from Porter Ranch to Los Angeles; other policy text preserved. Variable data printing article now links to Postcards.
- Build and 44 automated tests pass, including rotation, pause, reduced-motion, cleanup and backdrop-dismissal behavior. Browser visual QA remains unavailable. Nothing published or sent.

## Revision 12 — cleaner, quicker hero rotation
- Removed the hero dots and play/pause overlay entirely. The photograph itself is a native accessible pause/resume button, with no visible control chrome. Hover and keyboard focus also pause; reduced-motion preference still disables autoplay.
- Replaced only the third hero photo with a new Morrow roll-label-and-sticker lifestyle shot. Northline stationery remains in the lower CTA. Forma and Acre remain the first two slides.
- Rotation interval shortened from 6.5 seconds to 4.5 seconds, retaining the 1.35-second fade.
- New image generated with built-in imagegen and exported to responsive 1536/768 WebP; prompt and paths are in artwork/hero-labels-prompt.json.
- All 44 automated tests pass. Browser visual review remains pending. Preview only; not published.

## Revision 13 — consistent mobile and desktop icons
- Replaced platform-dependent arrow, chevron, search and close glyphs with one shared inline SVG icon set. Icons use currentColor, fixed stroke geometry, and accessible decorative markup.
- Updated dynamic quote/cart/receipt and mobile category controls to use the same SVG set, including quantity plus/minus buttons. No icon fonts or external icon requests.
- Verified all 48 portable preview routes contain no legacy directional-arrow glyphs. All 44 automated tests pass. Churches is still preserved byte-for-byte. Mobile/browser visual QA remains pending. Preview only; not published.

## Revision 14 — fine arrows and complete GA4 coverage
- SVG arrows now use 1.3-unit strokes and compact arrowheads, retaining the original light visual character without emoji glyph fallback.
- A shared independent head initializer now supplies GA4 G-D2CW5LWNT1 to all 75 deployable HTML files, including the two retained Churches files previously missing it. Existing direct tags and the app-tail initializer are removed in generated output to avoid duplicates. Churches page content and behavior remain unchanged apart from analytics.
- Tracking runs only in live builds on quixprint.com/www.quixprint.com over HTTP(S), with a duplicate-initialization guard. Hosted review builds and the portable preview do not track. The portable file contains no Google analytics loader.
- Verified a production build enabled the initializer on all 75 HTML pages, then restored the review build for delivery. All 46 automated tests pass. Browser visual QA and live GA4 event receipt are not verified; nothing published.
- Live deployment still requires SITE_MODE=live per docs/DEPLOYMENT.md. Quote submission remains preview-only until its separate launch configuration is completed.
- Reference: https://developers.google.com/analytics/devguides/collection/ga4/views (Google's default pageview configuration).
