# Chat-style map: cartography audit

The chat-style treatment is now the default investigation basemap. The two earlier treatments remain selectable for comparison.

## Current implementation

- Leaflet owns panning, zooming, markers, tooltips, selection, and map events in `src/components/LeafletLocationsMap.tsx`.
- MapLibre GL renders the OpenFreeMap Liberty basemap inside Leaflet. The vector source is OpenMapTiles data from OpenStreetMap.
- The runtime style overrides target `background`, land use and land cover, `park`, `building`, `water`, waterways, individual road/casing classes, and place/road labels.
- Road widths are interpolated by zoom. Local-road casings and fills remain line layers through zoom 20; the current code widens them substantially at close zoom.
- Liberty's `transportation` source has classed road centerlines and some polygon features such as plazas. Its `road_area_pattern` fill does not represent a full street-surface network. The source's native tiles end at zoom 14, so zoom 17–20 enlarges the available geometry rather than adding surveyed detail.
- Building footprints and house-number data exist in the OpenMapTiles schema. Liberty uses flat buildings only around zoom 13–14 and 3D extrusions above that; it has no house-number style layer. These can be restyled without changing the renderer, subject to data coverage.

## Preview implementation

The user approved a centerline-based preview, then chose it as the default. The normal `/work/dogs/map/` URL uses chat-style. `?style=classic` selects the former Crossover styling, and `?style=liberty` selects unmodified OpenFreeMap Liberty. The preexisting `?palette=liberty` URL still works. `?style=chat-style` remains a valid explicit selector. Optional `lat`, `lon`, and `zoom` parameters place chat-style at a reference view without changing the app's normal navigation or map framing.

The style uses the existing Liberty vector source and changes only its basemap layers. It uses thin, single-stroke classed roads at city scale, gradually wider roads at neighborhood scale, and white interiors over subtle gray casings at close-up scale. Casings stay invisible through zoom 14.5. Local streets and service roads fade in by zoom, while highways and arterials remain visible at city scale. Flat gray buildings appear from zoom 17; available house numbers appear from zoom 18.5. Existing round line joins and the casing-below-interior layer order are retained.

The basemap change makes no changes to investigation markers, their custom labels, filters, panels, navigation, report records, or task records.

## Limits to examine in the field

These are centerline strokes, not geometrically accurate road-surface polygons. At tight or offset intersections, varying road widths can leave seams or create bulky white junctions. Curved streets, divided highways, ramps, and irregular road edges can differ from Bing's actual surface shapes. Tile geometry is generated through zoom 14, so close-up zoom enlarges that geometry and cannot add surveyed curb detail. Building and house-number coverage also depends on OpenStreetMap data in each block.

These are known limitations to inspect, not confirmed visual defects in the preview. Automated style validation and the production build passed; a rendered, tile-backed visual comparison was unavailable in the sandbox. Use the links below to inspect city, neighborhood, and close-up views against the supplied screenshots. In particular, check the Grand/Pershing/Bristol intersections and the I-5 ramps near Louis Park.

## Supplied Bing reference views

The six screenshots now provide a usable scale ladder. Their URLs identify these approximate centers and Bing zoom levels:

| View | Center (lat, lon) | Bing zoom | Visible treatment |
| --- | --- | ---: | --- |
| Residential close-up | 37.971301, -121.318202 | 19.5 | Soft gray individual buildings and small house numbers; white street interiors with very fine neutral edges. |
| Residential blocks | 37.971267, -121.318030 | 18.3 | Individual building footprints; the local street network remains quiet and legible. |
| Neighborhood | 37.973224, -121.313831 | 16.0 | Thin local streets, blue waterways, distinct green parks, selective facilities and services. |
| Wider neighborhood | 37.973037, -121.306198 | 15.2 | More labels and landmarks; orange highway remains visually stronger than local roads. |
| District | 37.974367, -121.307257 | 14.6 | Buildings are suppressed; streets form a fine gray network; parks and waterways anchor orientation. |
| City overview | 37.993170, -121.319175 | 13.6 | Local streets are subdued; highways, large parks, water, and major places carry the hierarchy. |

Bing and MapLibre zoom numbers are not guaranteed to produce identical ground scale in this layout. Compare by the map scale bar and geographic extent, and crop browser chrome before visual comparison. The images confirm the requested palette and level-of-detail transitions. They do not supply missing road-surface geometry to the current OpenFreeMap tiles.

### Preview links

- [Default chat-style map](http://localhost:5173/work/dogs/map/).
- [Former Crossover style](http://localhost:5173/work/dogs/map/?style=classic).
- [OpenFreeMap Liberty style](http://localhost:5173/work/dogs/map/?style=liberty).
- [City overview](http://localhost:5173/work/dogs/map/?style=chat-style&lat=37.993170&lon=-121.319175&zoom=13.6) — compare with screenshot 6.
- [Neighborhood](http://localhost:5173/work/dogs/map/?style=chat-style&lat=37.973224&lon=-121.313831&zoom=16) — compare with screenshot 3.
- [Residential close-up](http://localhost:5173/work/dogs/map/?style=chat-style&lat=37.971301&lon=-121.318202&zoom=19.5) — compare with screenshot 1.


## Marker labels

Keep the present plain-text labels and white halos during the basemap work. A neutral pill might improve contrast in some locations, but it could hide geographic details and report context; evaluate it against the reference screenshots separately before changing marker-label styling.

## References

- [OpenFreeMap overview](https://openfreemap.org/) identifies OpenStreetMap as the data source and the unmodified OpenMapTiles schema.
- [OpenFreeMap Liberty style](https://github.com/hyperknot/openfreemap-styles/blob/main/styles/liberty/style.json) shows the classed road line layers, limited `road_area_pattern` fill, and building presentation.
- [OpenMapTiles transportation schema](https://openmaptiles.org/docs/schema/#transportation) describes roads as transportation features and polygons for features such as plazas.
- [OpenMapTiles vector tile documentation](https://openmaptiles.org/docs/terminology/vector-tiles/) notes that its tiles are generated through zoom 14.
