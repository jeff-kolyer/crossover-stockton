# Unified layout verification

The rebuild uses one `SiteShell`, one global `SiteHeader`, and one first-party stylesheet (`src/styles/crossover.css`). The preserved checkpoint is commit `d3cb159` on `codex/unified-crossover-site`.

## Responsive route checks

All 28 generated routes were opened at 320, 375, 412, 768, and 1280px (140 route/width combinations). Each had exactly one global header, route content, and no document-level horizontal overflow. Computed `PageShell` top padding was 24px for `standard` and `hero` routes and 0px for `flush` investigation and article routes. The actual first route-content box was measured on Home, Needs, Stories, Action, Updates, About, Tasks, and Map at all five widths: 24px below the 62px header on the six document pages and 0px below it on the two investigation pages. The shared footer appeared once on document routes; it is omitted from the viewport-filling investigation workspace.

The desktop investigation showed its identity and tabs above the left content panel, with the contextual map beside it. At 412px, the Tasks list remained usable and the Map tab displayed the map with its draggable detail sheet. Applying the Dog sightings filter retained map markers; selecting the Crown Avenue marker opened its location details. An Activity question expanded to reveal its related record. The mobile global menu navigated from Activity to Action while retaining one header.

`npm run build` passed, including the layout, public action, data, prerender, readability, gap tab, and redirect validators. The build emitted a bundle-size advisory for the existing map dependencies.

## Visual comparisons

The `docs/layout-screenshots` directory retains earlier `before-*` and `after-*` captures and adds `rebuild-home-412.png`, `rebuild-action-412.png`, `rebuild-map-412.png`, and `rebuild-investigation-1280.png`. The map uses externally served tiles, so a capture taken immediately after navigation may show markers before the tile imagery arrives.

## Exceptions

`docs/layout-exceptions.json` registers 16 narrow exceptions: home rail and display treatments, responsive chrome, map panel and sheet geometry, and fixed navigation clearance. Named document-width roles are standard tokens and are no longer registered as exceptions.
