# Managing the catalog

Most changes happen in `data/catalog.json`. This JSON is readable, versioned with the site, and requires no paid management service.

## Common changes

- **Description/headline:** edit the product’s `description` and `headline` strings.
- **Name:** edit `name` and its menu entry’s `label`. Keep the `id` if you want to preserve its URL.
- **Photo:** put a WebP into `artwork/` and set the product’s `image` to `/assets/products/your-photo.webp`. Update the descriptive `imageAlt` too.
- **Category:** change `category`, and move its entry under `categories[].links`.
- **Homepage selection:** edit the six product IDs in the `home` function in `src/templates.mjs`.
- **Remove product:** remove the product and its menu links, then decide whether its old URL should redirect to a replacement.

Run `npm run build` after editing. JSON must use straight double quotes and cannot have trailing commas. Commit the changes through GitHub and Netlify rebuilds automatically.

## New product

Copy a similar product object, give it a unique `id`, and add its category menu entry. The `id` becomes `/products/id/`. Include a useful original description, image, and `config`. Every new non-custom product automatically gets a static product page; there is no page HTML to duplicate.

New configuration fields use this pattern:

```json
{
  "label": "Material",
  "options": ["Verified material A", "Verified material B"],
  "required": true
}
```

To show a field only after another choice:

```json
{
  "label": "Foil color",
  "options": ["Gold", "Silver"],
  "when": {"Specialty finish": "Raised Foil"},
  "required": true
}
```

To constrain options based on another field:

```json
{
  "label": "Size",
  "required": true,
  "optionsBy": {
    "field": "Shape",
    "values": {"Circle": ["2 inches", "3 inches"]},
    "fallback": []
  }
}
```

Dependencies must come **after** the field they depend on. The shared resolver resets choices that become invalid and removes inactive fields. The quote endpoint independently validates them again.

Only insert specifications and combinations confirmed by your production source. Use `reviewRequired: true` and requested quantity entry where the supplier’s complete options are unknown. The review flag is internal; customer product pages do not imply stock is unavailable. Internal notification emails flag those items for review.

## Existing Churches product data

The main catalog’s `legacyName` points to the reused configurations in `data/legacy.json` and `lib/legacy-resolver.part`. Edit those copies to change the new main catalog. The original `/churches/` directory is isolated in `legacy-site/churches` and copied unchanged.

Flyer mailing has been added to the main catalog resolver; it does not modify the Churches page. Large Format Posters reuse the old Posters configuration. Bulk Posters use the separate new product.

## Stickers and future industry pages

Stickers use a `Format` selector and `config.variants`. The four menu entries link to the same page with `?format=...`; the product URL itself stays canonical.

Future industry pages can use the same product IDs, resolver, cart, and quote endpoint. The renderer accepts ordinary product objects, so an industry page can select a subset and override an image/description for presentation without creating a second configuration. An example data shape is provided in `data/industry-presets.example.json`; no new industry routes have been published or built.

## Useful checks

Run `npm test` for shared specification and quote handling checks. After configuration changes, also test affected combinations in the browser, particularly changing a parent choice after selecting child options. Keep source URLs, inspection dates, and manual-review notes with the product research.

## Artwork quantities and controls (Revision 08)

Set `versionMode: "breakdown"` on products that support independent artwork quantities. Canonical items contain `quantityMode: "breakdown"`, total `quantity`, and `artworkVersions: [{name, quantity}]`. The total must equal the sum and the row count must match `choices.Versions`. Do not multiply this total again. Old items and unique per-version products keep `quantityMode: "per-version"`. Notepad quantity counts pads.

`ui` can select shape, orientation, material or segmented native-button controls. `customSize: true` adds a Custom Size shortcut; include `Custom size` in the Size options and conditional numeric Width/Height fields. Empty dependent option lists hide a field. One-option lists render as fixed specifications.

Live-source records are in `research/roll-labels-live-flow.json` and `research/axiom-live-flows-rev08.json`. Update verified options and their evidence together.
