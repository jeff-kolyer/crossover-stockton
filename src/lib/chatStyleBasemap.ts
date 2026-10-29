import type { Map as MapLibreMap } from "maplibre-gl";

// An isolated OpenFreeMap preview. Roads remain centerlines; the high-zoom
// casing and white interior are a cartographic approximation, not road polygons.
const palette = {
  background: "#F8F9F7",
  minorRoad: "#C8C9C5",
  majorRoad: "#B7B9B5",
  roadInterior: "#FFFFFF",
  building: "#DCDBD7",
  buildingOutline: "#CBCBC7",
  water: "#A5D6F5",
  park: "#ADE5BC",
  primaryText: "#252525",
  secondaryText: "#77858B",
  highway: "#F2AB72",
  highwayEdge: "#E6843E",
} as const;

const interpolate = (...stops: (number | string)[]) => ["interpolate", ["linear"], ["zoom"], ...stops];

function paint(map: MapLibreMap, layerId: string, property: string, value: unknown) {
  if (map.getLayer(layerId)) map.setPaintProperty(layerId, property as never, value as never);
}

function layout(map: MapLibreMap, layerId: string, property: string, value: unknown) {
  if (map.getLayer(layerId)) map.setLayoutProperty(layerId, property as never, value as never);
}

type RoadFamily = {
  fills: string[];
  casings: string[];
  color: unknown;
  edge: string;
  width: unknown;
  casingWidth: unknown;
  opacity?: unknown;
  casingOpacity?: unknown;
};

const localColor = interpolate(10, palette.minorRoad, 15, palette.minorRoad, 16.5, palette.roadInterior);
const arterialColor = interpolate(10, palette.majorRoad, 15, palette.majorRoad, 16.5, palette.roadInterior);
const casingFade = interpolate(10, 0, 14.5, 0, 16, 0.3, 17.5, 1);
const majorCasingFade = interpolate(10, 0, 14.5, 0, 15.5, 0.25, 17.5, 1);

const roadFamilies: RoadFamily[] = [
  {
    fills: ["road_minor", "tunnel_minor", "bridge_street"],
    casings: ["road_minor_casing", "tunnel_street_casing", "bridge_street_casing"],
    color: localColor,
    edge: palette.minorRoad,
    width: interpolate(10, 0.35, 13, 0.75, 15, 1.5, 16, 2.3, 17, 3.7, 18, 6.5, 19, 10.5, 20, 15),
    casingWidth: interpolate(10, 0.35, 13, 0.75, 15, 1.7, 16, 2.9, 17, 4.6, 18, 7.7, 19, 11.9, 20, 16.5),
    opacity: interpolate(10, 0, 11.5, 0, 12.5, 0.6, 13.5, 1),
    casingOpacity: casingFade,
  },
  {
    fills: ["road_service_track", "tunnel_service_track", "bridge_service_track"],
    casings: ["road_service_track_casing", "tunnel_service_track_casing", "bridge_service_track_casing"],
    color: localColor,
    edge: palette.minorRoad,
    width: interpolate(10, 0.2, 14, 0.5, 16, 1.4, 17, 2.5, 18, 4.3, 19, 7, 20, 10),
    casingWidth: interpolate(10, 0.2, 14, 0.5, 16, 1.8, 17, 3.2, 18, 5.2, 19, 8, 20, 11),
    opacity: interpolate(10, 0, 14.5, 0, 16, 0.7, 17, 1),
    casingOpacity: casingFade,
  },
  {
    fills: ["road_secondary_tertiary", "tunnel_secondary_tertiary", "bridge_secondary_tertiary"],
    casings: ["road_secondary_tertiary_casing", "tunnel_secondary_tertiary_casing", "bridge_secondary_tertiary_casing"],
    color: arterialColor,
    edge: palette.majorRoad,
    width: interpolate(10, 0.9, 13, 1.5, 15, 2.1, 16, 3, 17, 4.5, 18, 7.5, 19, 12, 20, 17),
    casingWidth: interpolate(10, 0.9, 13, 1.5, 15, 2.3, 16, 3.7, 17, 5.5, 18, 8.7, 19, 13.4, 20, 18.5),
    casingOpacity: majorCasingFade,
  },
  {
    fills: ["road_trunk_primary", "tunnel_trunk_primary", "bridge_trunk_primary", "road_link", "tunnel_link", "bridge_link"],
    casings: ["road_trunk_primary_casing", "tunnel_trunk_primary_casing", "bridge_trunk_primary_casing", "road_link_casing", "tunnel_link_casing", "bridge_link_casing"],
    color: arterialColor,
    edge: palette.majorRoad,
    width: interpolate(10, 1.2, 13, 2.1, 15, 3, 16, 4, 17, 5.8, 18, 9, 19, 14, 20, 19),
    casingWidth: interpolate(10, 1.2, 13, 2.1, 15, 3.3, 16, 4.8, 17, 6.9, 18, 10.3, 19, 15.5, 20, 20.5),
    casingOpacity: majorCasingFade,
  },
  {
    fills: ["road_motorway", "tunnel_motorway", "bridge_motorway", "road_motorway_link", "tunnel_motorway_link", "bridge_motorway_link"],
    casings: ["road_motorway_casing", "tunnel_motorway_casing", "bridge_motorway_casing", "road_motorway_link_casing", "tunnel_motorway_link_casing", "bridge_motorway_link_casing"],
    color: palette.highway,
    edge: palette.highwayEdge,
    width: interpolate(10, 2, 13, 3, 15, 4.5, 17, 6.5, 18, 9.5, 19, 14, 20, 19),
    casingWidth: interpolate(10, 2, 13, 3, 15, 5.2, 17, 7.5, 18, 10.8, 19, 15.5, 20, 20.5),
    casingOpacity: interpolate(10, 0, 14.5, 0, 15.5, 0.4, 17, 0.8, 18, 1),
  },
];

export function applyChatStyleBasemap(map: MapLibreMap) {
  paint(map, "background", "background-color", palette.background);

  if (map.getSource("openmaptiles") && map.getLayer("park") && !map.getLayer("chat-style-rural-landcover")) {
    map.addLayer({
      id: "chat-style-rural-landcover",
      type: "fill",
      source: "openmaptiles",
      "source-layer": "landcover",
      filter: ["match", ["get", "class"], ["farmland", "grass", "wetland"], true, false],
      paint: { "fill-color": "#C5ECD2", "fill-opacity": 0.92 },
    }, "park");
  }

  paint(map, "landuse_residential", "fill-color", palette.background);
  paint(map, "landuse_residential", "fill-opacity", 1);
  paint(map, "park", "fill-color", palette.park);
  paint(map, "park", "fill-outline-color", palette.park);
  paint(map, "park", "fill-opacity", 0.95);
  layout(map, "park_outline", "visibility", "none");
  paint(map, "landcover_wood", "fill-color", "#BFE6CA");
  paint(map, "landcover_wood", "fill-opacity", 0.75);
  paint(map, "landcover_grass", "fill-color", "#C9EBD2");
  paint(map, "landcover_grass", "fill-opacity", 0.7);
  paint(map, "landuse_pitch", "fill-color", "#C8E9CF");
  paint(map, "landuse_track", "fill-color", "#E8EEE9");
  paint(map, "landuse_cemetery", "fill-color", "#DDEADB");
  paint(map, "landuse_hospital", "fill-color", "#F4F1EF");
  paint(map, "landuse_school", "fill-color", "#ECF2EE");
  paint(map, "water", "fill-color", palette.water);
  for (const id of ["waterway_tunnel", "waterway_river", "waterway_other"]) paint(map, id, "line-color", palette.water);
  layout(map, "road_area_pattern", "visibility", "none");

  // Liberty stacks all road casings below their interiors. Keeping that order
  // lets local intersections merge cleanly when the casing fades in.
  for (const road of roadFamilies) {
    for (const id of road.casings) {
      paint(map, id, "line-color", road.edge);
      paint(map, id, "line-width", road.casingWidth);
      paint(map, id, "line-opacity", road.casingOpacity ?? casingFade);
    }
    for (const id of road.fills) {
      paint(map, id, "line-color", road.color);
      paint(map, id, "line-width", road.width);
      paint(map, id, "line-opacity", road.opacity ?? 1);
    }
  }
  for (const id of ["road_path_pedestrian", "tunnel_path_pedestrian", "bridge_path_pedestrian"]) {
    paint(map, id, "line-color", "#A8B9AD");
    paint(map, id, "line-width", interpolate(14, 0.4, 16, 0.7, 18, 1.2, 20, 1.8));
    paint(map, id, "line-opacity", interpolate(14, 0, 15, 0.5, 17, 0.85));
  }
  paint(map, "bridge_path_pedestrian_casing", "line-opacity", 0);

  // Flat footprints appear only once they help identify individual parcels.
  layout(map, "building-3d", "visibility", "none");
  if (map.getLayer("building")) map.setLayerZoomRange("building", 17, 24);
  paint(map, "building", "fill-color", palette.building);
  paint(map, "building", "fill-outline-color", palette.buildingOutline);
  paint(map, "building", "fill-opacity", interpolate(17, 0, 17.6, 0.9, 18, 1));

  for (const id of ["label_city", "label_city_capital", "label_town", "label_village", "highway-name-major", "highway-name-minor", "highway-name-path"]) {
    paint(map, id, "text-color", palette.primaryText);
    paint(map, id, "text-halo-color", palette.background);
    paint(map, id, "text-halo-width", 0.65);
    paint(map, id, "text-halo-blur", 0);
  }
  for (const id of ["label_other", "label_state", "poi_r1", "poi_r7", "poi_r20", "poi_transit"]) {
    paint(map, id, "text-color", palette.secondaryText);
    paint(map, id, "text-halo-color", palette.background);
    paint(map, id, "text-halo-width", 0.55);
    paint(map, id, "text-halo-blur", 0);
  }
  for (const id of ["waterway_line_label", "water_name_point_label", "water_name_line_label"]) {
    paint(map, id, "text-color", "#548DAA");
    paint(map, id, "text-halo-color", palette.background);
    paint(map, id, "text-halo-width", 0.6);
  }
  if (map.getLayer("highway-name-major")) map.setLayerZoomRange("highway-name-major", 11.5, 24);
  if (map.getLayer("highway-name-minor")) map.setLayerZoomRange("highway-name-minor", 14.5, 24);
  if (map.getLayer("poi_r1")) map.setLayerZoomRange("poi_r1", 14.5, 24);

  // OpenMapTiles includes golf POIs at zoom 14, ahead of Liberty's general POI labels.
  if (map.getSource("openmaptiles") && map.getLayer("poi_r1") && !map.getLayer("chat-style-golf-label")) {
    map.addLayer({
      id: "chat-style-golf-label",
      type: "symbol",
      source: "openmaptiles",
      "source-layer": "poi",
      minzoom: 14,
      maxzoom: 16,
      filter: ["all", ["==", ["get", "class"], "golf"], ["in", ["get", "subclass"], ["literal", ["golf", "golf_course"]]]],
      layout: {
        "text-field": ["coalesce", ["get", "name_en"], ["get", "name"]],
        "text-font": ["Noto Sans Italic"],
        "text-size": 12,
        "text-max-width": 9,
      },
      paint: {
        "text-color": palette.secondaryText,
        "text-halo-color": palette.background,
        "text-halo-width": 0.55,
        "text-halo-blur": 0,
      },
    }, "poi_r1");
  }

  if (map.getSource("openmaptiles") && !map.getLayer("chat-style-housenumbers")) {
    map.addLayer({
      id: "chat-style-housenumbers",
      type: "symbol",
      source: "openmaptiles",
      "source-layer": "housenumber",
      minzoom: 18.5,
      layout: {
        "text-field": ["get", "housenumber"],
        "text-font": ["Noto Sans Regular"],
        "text-size": 9,
        "text-allow-overlap": false,
      },
      paint: {
        "text-color": "#8D969A",
        "text-halo-color": palette.background,
        "text-halo-width": 0.45,
      },
    }, "waterway_line_label");
  }
}
