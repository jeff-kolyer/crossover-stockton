# Map presentation handoff

This records the current map's presentation for a future site whose location facts come only from the public feed. Keep this preset with the site design assets; it is not investigation evidence or location data.

## Basemap

- Map implementation: Leaflet with a MapLibre vector layer.
- Vector style source: `https://tiles.openfreemap.org/styles/liberty`.
- Default variant: `chat-style` (unless the URL explicitly selects `style=classic` or `style=liberty`).
- Exact layer paint, road-width interpolation, label treatment, building visibility, and added layers: [`src/lib/chatStyleBasemap.ts`](../src/lib/chatStyleBasemap.ts), applied by [`src/components/LeafletLocationsMap.tsx`](../src/components/LeafletLocationsMap.tsx). Preserve that function or port its MapLibre layer operations when building the new site.
- Main chat-style palette: background `#F6F5F2`, minor roads `#C8C9C5`, major roads `#B7B9B5`, road interiors `#FFFFFF`, buildings `#DCDBD7` with `#CBCBC7` outlines, water `#9CDEFD`, parks `#C7EFC2`, highways `#FFB34F` with `#E77E14` edges, primary labels `#252525`, secondary labels `#77858B`.
- The alternate classic palette remains in `LeafletLocationsMap.tsx`; the unmodified Liberty style remains available for comparison.

## View and zoom

- The Leaflet instance starts at `[37.98, -121.33]`, zoom `10`, but this is normally replaced immediately by the framing rule below.
- With visible locations, fit their bounds with 46 px padding and a fit-bounds maximum zoom of 11, then add one zoom level. The final zoom therefore varies with the visible set and viewport size.
- With no visible locations, use `[37.98, -121.33]`, zoom `11`.
- Selecting a location moves to zoom `15`. On screens below 1024 px, the center shifts vertically so the selected location remains visible with the details panel.
- In chat-style mode, a URL with valid `lat`, `lon`, and `zoom` parameters overrides the initial fit. Accepted zoom is 1 through 20. The current map does **not** write pan or zoom changes back to the URL or local storage.
- Chat-style zoom snaps to `0.1`; classic and Liberty snap to whole zoom levels. Scroll-wheel zoom follows the page's `wheelZoom` setting.

## Markers and labels

- Marker evidence colors: historical published report `#65686E`; recent public report `#F8830D`; official location record `#0D69D9`; Crossover firsthand `#3AB034`. The source is [`src/lib/evidenceCategoryColors.ts`](../src/lib/evidenceCategoryColors.ts).
- Markers are 36 px circular SVGs with a white outline; selected markers grow to 40 px. Icon shape follows `marker_kind`: paw for animal shelter, hand/heart for organization, eye for other kinds.
- Permanent labels, collision/visibility behavior, and their CSS are in `LeafletLocationsMap.tsx` and [`src/styles/crossover.css`](../src/styles/crossover.css). Preserve these alongside the basemap palette if the goal is a close visual match.

## New-site boundary

Read location records and their evidence classifications from the public feed. Treat this map preset as renderer configuration. If a future map needs a particular fixed opening view, record that center and zoom explicitly instead of assuming the current bounds-based opening view is fixed.
