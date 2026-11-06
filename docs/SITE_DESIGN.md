# Site design rules

## Current visual skin

The current Crossover site is one visual rendering of the public feed. It uses white space, dark navy type, blue accents, direct headings, clear rules, and compact linked rows. The shared CSS is in `site/one-file-template.html`; the current visual layer is `site/clean.css`. Alternate skins may change the appearance while preserving the feed's record meanings and provenance rules in `src/model/explorer-publication.json`.

The homepage is the main account: aim, connected needs, current picture, map and places, activity, next actions, key questions, and the public records. It does not use a photographic hero, need-status badges, an investigation workspace, or an invented density layer. The map uses OpenStreetMap for geographic context. Individual place records supply precision and source links; the base map itself does not verify reported conditions.

Keep source-linked figures scoped and clearly named. Question, action, and activity lists use one line per item, with full context on the record page. Documentary images need source and context near the image.

## Link arrows

Use the inline SVG `right-arrow` for navigation to another site page, with path `M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3`. Use the inline SVG `external-arrow` for links that leave the site experience, including other websites and the raw JSON feed, with path `m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25`. Display both at 1.05em with a 1.75 stroke. Do not put arrows on status labels. Apply these shapes to regenerated pages.

## Civic heart

Render the heart in article copy with the inline `civic-heart` SVG using path `M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z`, displayed at 1.05em with a 1.75 stroke and the site's accent color.
