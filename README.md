# Quixprint — production deployment source

Approved design through Revision 14, with production deployment configuration and a corrected Netlify runtime context check for quote delivery. The live website has not been changed by preparing this package.

**Start with docs/DEPLOYMENT.md.** Use the existing GitHub repository and Netlify project. Do not upload the portable preview as the website.

## What stays the same

Churches retains its existing design, layout, products, cart, and quote endpoint. Its generated HTML receives the shared GA4 initializer, as requested for all pages. Original Churches source and endpoint remain unchanged.

## Build

Requires Node.js 22 or later. No package dependencies or database are required.

```sh
npm run build
npm test
```

Local builds default to preview. Netlify production builds use live mode through netlify.toml; branch deploys and Deploy Previews use preview mode. Set production runtime variables in the Netlify UI as described in the deployment guide. Values in netlify.toml alone are not available to serverless functions.

Build command: npm run build. Publish directory: dist. Functions directory: netlify/functions. Repository root must contain package.json and netlify.toml.

For a local production build:

```sh
SITE_MODE=live QUOTE_MODE=live npm run build
npm test
```

## Included

- Homepage, full catalog, 30 product configurators, custom inquiry, journal, policies, and preserved Churches section.
- Browser-saved multi-item quote cart, artwork version quantities, and quote checkout.
- Netlify quote endpoint with Brevo sales notification and customer acknowledgement.
- GA4 G-D2CW5LWNT1 on all 75 HTML pages; active only on production domains in live mode.
- SEO metadata, sitemap, robots rules, optimized product imagery, and automated checks.

This is a quote-request website: no payment processing, instant prices, customer login, or order-management database. See docs/REVIEW-STATUS.md for remaining product option research limits. Automated tests use mocked email responses; real delivery and analytics receipt must be verified after publishing.

The compact production ZIP contains optimized web assets and build sources. Original high-resolution artwork and research are retained in the separate full source archive. The build also generates Quixprint-Full-Preview.html for offline review; that preview never sends quotes or loads analytics.
