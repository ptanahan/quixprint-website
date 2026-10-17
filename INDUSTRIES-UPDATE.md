# Quixprint industry landing pages — October 17, 2026

Status: revision 11, prepared for review. Nothing has been deployed.

Religious Organizations uses the main-site catalog and quote flow. The existing TrueLife Churches section and its partnership terms are untouched. Healthcare covers practices beyond dental; Hotels & Hospitality covers property and guest materials beyond the restaurant offering.

## What is included

Revision 11 replaces the Real Estate hero with a clear, minimal Just Listed postcard photograph, including optimized desktop and mobile assets. The industry overview and social-sharing image use the same replacement. Restaurants & Cafes now reads across three lines: “On the table. / On the bag. / On brand.” Trade Shows reads “Show up. / Stand out. / Stay with them.” Each closing phrase stays together on its third line. Other industry copy and images are retained.

Revision 10 makes every available Orientation field use the same labeled icon buttons: Horizontal first, then Vertical. Landscape/Portrait values display these consistent labels while retaining their original values in specifications and quotes. Existing defaults, conditional field visibility, options and product dependencies are unchanged. Products without orientation options remain unchanged.

Revision 9 moves the design-template request note from the specification form into the left-hand product description area, just above “A little help with your project.” This applies to every main-site product template, including custom printing. Each product-specific email subject is preserved. On mobile the note follows the description in the existing stacked layout.

Revision 8 adds an independently curated Popular Products directory with sixteen alphabetical shortcuts. Business cards, brochures, postcards, roll labels and other individual products link straight to their specification pages. Banners, menus, posters, signs and stickers open right-hand flyouts. The six featured tiles are smaller, arranged three across and two down on desktop, with the directory and grid sharing their top and bottom edges. Medium widths use two tile columns; at 760px and below the directory is hidden and the original six mobile tiles remain below search. Header categories are unchanged. All revision 7 homepage copy is retained.


Revision 5 finalized the industry section and added the initial homepage copy updates. All twelve “Good to know” FAQ sections are removed. The homepage has the new headline, supporting copy, section headings, three consistent Request a quote links and Booklets & catalogs capitalization. Revision 7 supersedes the earlier hero and section copy; existing imagery and the broader page design are retained.

Heading letter spacing is slightly more open across the main site. Horizontal and Landscape option icons both use a wide rectangle; Vertical and Portrait remain tall. Every product configuration has a small “* Required fields” explanation. Product specifications, dependencies, quantities and quote handling are unchanged.

Revision 4 restores the original mobile navigation layout. Industries is visible in the desktop header only; an open Industries menu closes when the viewport narrows past its breakpoint.

Revision 3 replaces all 24 large industry photographs with simpler compositions and more distinct settings and palettes. Restaurants & Cafes is the updated category name. The shared footer now places Industries under Let’s talk print, immediately before Custom printing, and removes it from the bottom link row.

Twelve landing pages use the existing Quixprint visual system, typography, product cards, vector icons, cart and quote-request flow. Each has two simplified, industry-specific photographs, concise product descriptions, recurring printing copy, a compact quote process with no FAQ section. The original five pages have been simplified along with the seven additions. An Industries overview and shared navigation menu connect them to the existing site.

| Industry | Production path |
| --- | --- |
| Overview | /industries/ |
| Real Estate | /industries/real-estate/ |
| Law Firms | /industries/law-firms/ |
| Dental | /industries/dental/ |
| Restaurants & Cafes | /industries/restaurants/ |
| Building Materials | /industries/building-materials/ |
| Retail | /industries/retail/ |
| Education | /industries/education/ |
| Automotive | /industries/automotive/ |
| Trade Shows | /industries/trade-shows/ |
| Religious Organizations | /industries/religious/ |
| Healthcare | /industries/healthcare/ |
| Hotels & Hospitality | /industries/hotels-hospitality/ |

These paths will become public only after an approved production deploy.

The existing GitHub + Netlify build remains `npm run build`, with `dist` as the publish directory and the existing Netlify functions. No service, dependency, account system or paid tool was added. The quote remains a request for manually prepared pricing.

## Review first

Download Quixprint-Industries-Preview.html and open it in a desktop browser. It is a self-contained review file that opens to the homepage and is labeled REVISION 11 — INDUSTRY REFINEMENTS. All twelve landing pages, the catalog, product configurations and a simulated quote flow are included. The preview uses separate browser storage and sends no quote requests, uploads, emails or analytics. Preview URLs use hash routing; production URLs do not.

Resize the browser to review the mobile layout. The narrow-screen header retains the original single row with the logo, Products and Quote. Industries hides at 900px and below, alongside Why Quixprint and Journal, and remains accessible through the footer. Native touch-select behavior, including foil colors, is retained.

The review file is not a deployable website. Use the source update for GitHub.

## Files and deployment after approval

- Quixprint-Industries-Update.zip: new and changed source files only, placed at the ZIP root to match your repository.
- Quixprint-Industries-Full-Backup.zip: complete updated website source in `quixprint-website-main/`, plus `review/` with this guide, the QA summary, campaign notes and original editorial PNGs.
- Your original uploaded ZIP is unchanged and remains your pre-update rollback copy.

Do not push to the connected production branch until you approve the pages: pushing that branch can automatically deploy through Netlify.

After approval:

1. Unzip the update and copy its contents into the root of your existing Quixprint repository. Merge folders and replace the listed matching files; do not replace an entire existing folder with the smaller patch folder. In Finder, Option-drag folders and choose Merge, or copy the files within each folder. The root is the folder containing `package.json` and `netlify.toml`.
2. Do not upload the enclosing ZIP folder as a new folder. Do not place these files inside `churches`, `legacy-site`, `website-update` or `dist`.
3. In GitHub Desktop, verify the changed files against the manifest in the update ZIP. Commit, then push to the connected branch when deployment is approved.
4. Netlify will run the existing build. Keep the current environment variables and email settings. No new variables are needed.
5. Check all twelve URLs, both menus, a product configuration, the quote cart, and Churches on the deployed site. Complete a real email-delivery check only when you intend to send a real quote request.
6. The build creates the new sitemap automatically. The existing sitemap address remains https://quixprint.com/sitemap.xml. The source-root sitemap is a retained legacy file; the deployed sitemap is generated in `dist`.

For a branch review, Netlify's existing deploy-preview/branch-deploy configuration keeps quote sending and indexing off. Those builds are review deployments and were not created in this task.

### Rollback

Keep the original uploaded ZIP. The cleanest rollback after a later deployment is to revert the industry-update commit in Git and push the revert, or restore the previous Netlify production deploy. A Git revert also removes the added files. Merely copying the original ZIP over the new tree will not remove new industry files.

## Where future edits live

- `data/industries.json`: headlines, descriptions, FAQs, product IDs and per-industry copy.
- `src/industries.mjs`: shared industry page and overview templates.
- `src/industries.css`: industry layouts and the new navigation rules.
- `src/home-products.css`: homepage product directory, search layout and mobile rules.
- `src/templates.mjs`: existing shared site header/footer, now including Industries.
- `src/app.js`: existing application, with industry navigation and click-event handlers added separately.
- `artwork/industry-*-1536.webp` and `*-768.webp`: responsive hero and editorial photographs.
- `scripts/build.mjs`: builds the industry pages, metadata, sitemap and portable preview.

Product catalog data, specification engine, email libraries, Netlify configuration/functions and both copies of Churches source are unchanged. Production Churches output matches the original production build byte-for-byte.
