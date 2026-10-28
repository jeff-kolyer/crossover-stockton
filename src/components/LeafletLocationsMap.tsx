import { useEffect, useRef, useState } from "react";
import * as L from "leaflet";
import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import { setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "leaflet/dist/leaflet.css";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MappedInvestigationLocation } from "./InvestigationLocations";
import { evidenceCategoryColors } from "../lib/evidenceCategoryColors";

setWorkerUrl(workerUrl);

type LocationsMapProps = {
  locations: MappedInvestigationLocation[];
  selectedId: string;
  onSelect: (id: string) => void;
  wheelZoom: boolean;
  preview?: boolean;
  followSelection?: boolean;
};

const pinOutline = "M13 1.5 C6.65 1.5 1.5 6.65 1.5 13 C1.5 22 8.5 29.7 13 34.4 C17.5 29.7 24.5 22 24.5 13 C24.5 6.65 19.35 1.5 13 1.5 Z";

function makePin(color: string, selected: boolean) {
  const width = selected ? 39 : 32;
  const height = selected ? 53 : 44;
  const ring = selected ? `<path d="${pinOutline}" fill="${color}" stroke="#263747" stroke-width="3"/>` : "";
  const pin = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 26 36">${ring}<path d="${pinOutline}" fill="${color}" stroke="#fff" stroke-width="1.5"/><circle cx="13" cy="12.7" r="4.3" fill="#fff"/></svg>`;
  return L.icon({
    iconUrl: `data:image/svg+xml,${encodeURIComponent(pin)}`,
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -height + 7],
  });
}

const categoryPins = Object.fromEntries(Object.entries(evidenceCategoryColors).map(([category, color]) => [category, {
  default: makePin(color, false),
  selected: makePin(color, true),
}])) as Record<MappedInvestigationLocation["category"], { default: L.Icon; selected: L.Icon }>;

function frameLocations(map: L.Map, locations: MappedInvestigationLocation[]) {
  if (!locations.length) {
    map.setView([37.98, -121.33], 11, { animate: false });
    return;
  }
  const bounds = L.latLngBounds(locations.map(({ coordinates }) => coordinates));
  map.fitBounds(bounds, { padding: [46, 46], maxZoom: 11, animate: false });
  map.setZoom(map.getZoom() + 1, { animate: false });
}

export function LeafletLocationsMap({ locations, selectedId, onSelect, wheelZoom, preview = false, followSelection = true }: LocationsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const previous = useRef<{ locations: MappedInvestigationLocation[]; selectedId: string; followSelection: boolean } | null>(null);
  const markersRef = useRef(new Map<string, L.Marker>());
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!containerRef.current) return;
    const instance = L.map(containerRef.current, {
      center: [37.98, -121.33],
      zoom: 10,
      minZoom: 1,
      zoomControl: !preview,
      scrollWheelZoom: wheelZoom,
      zoomAnimation: false,
      fadeAnimation: false,
      markerZoomAnimation: false,
    });
    const basemap = maplibreGL({ style: "https://tiles.openfreemap.org/styles/positron" }).addTo(instance);
    const vectorMap = basemap.getMaplibreMap();
    vectorMap.on("load", () => {
      if (vectorMap.getSource("openmaptiles") && vectorMap.getLayer("park") && !vectorMap.getLayer("crossover-rural-landcover")) {
        vectorMap.addLayer({
          id: "crossover-rural-landcover",
          type: "fill",
          source: "openmaptiles",
          "source-layer": "landcover",
          filter: ["match", ["get", "class"], ["farmland", "grass", "wetland"], true, false],
          paint: { "fill-color": "#d7f2df" },
        }, "park");
      }
      if (vectorMap.getLayer("highway_minor") && !vectorMap.getLayer("crossover-minor-street-casing")) {
        vectorMap.addLayer({
          id: "crossover-minor-street-casing",
          type: "line",
          source: "openmaptiles",
          "source-layer": "transportation",
          minzoom: 8,
          filter: ["all", ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false], ["match", ["get", "class"], ["minor", "service", "track"], true, false]],
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": "#e2e6ea",
            "line-width": ["interpolate", ["linear"], ["zoom"], 8, 0.7, 12, 1.6, 15, 3.5, 20, 13],
          },
        }, "highway_minor");
      }
      const colors: Record<string, ["background-color" | "fill-color" | "line-color" | "text-color", string]> = {
        background: ["background-color", "#f0ece3"],
        landuse_residential: ["fill-color", "#f8f9f6"],
        building: ["fill-color", "#f0ece3"],
        road_area_pier: ["fill-color", "#f0ece3"],
        road_pier: ["line-color", "#f0ece3"],
        park: ["fill-color", "#d7f2df"],
        landcover_wood: ["fill-color", "#d7f2df"],
        water: ["fill-color", "#8bd4ea"],
        waterway_line_label: ["text-color", "#348da4"],
        water_name_line_label: ["text-color", "#348da4"],
        water_name_point_label: ["text-color", "#348da4"],
        highway_minor: ["line-color", "#ffffff"],
        highway_major_casing: ["line-color", "#d0d8e1"],
        highway_major_inner: ["line-color", "#e9eef3"],
        highway_major_subtle: ["line-color", "#e9eef3"],
        highway_motorway_casing: ["line-color", "#9aa7b6"],
        highway_motorway_inner: ["line-color", "#c6d1dc"],
        highway_motorway_subtle: ["line-color", "#c6d1dc"],
        highway_motorway_bridge_casing: ["line-color", "#9aa7b6"],
        highway_motorway_bridge_inner: ["line-color", "#c6d1dc"],
        tunnel_motorway_casing: ["line-color", "#9aa7b6"],
        tunnel_motorway_inner: ["line-color", "#c6d1dc"],
        label_city: ["text-color", "#1d1d1f"],
        label_city_capital: ["text-color", "#1d1d1f"],
        label_town: ["text-color", "#6e6e73"],
        label_village: ["text-color", "#6e6e73"],
        label_other: ["text-color", "#6e6e73"],
        label_state: ["text-color", "#6e6e73"],
        "highway-name-path": ["text-color", "#6e6e73"],
        "highway-name-minor": ["text-color", "#6e6e73"],
        "highway-name-major": ["text-color", "#6e6e73"],
        airport: ["text-color", "#007aff"],
      };
      Object.entries(colors).forEach(([layer, [property, color]]) => {
        if (vectorMap.getLayer(layer)) vectorMap.setPaintProperty(layer, property, color);
      });
      if (vectorMap.getLayer("landuse_residential")) vectorMap.setPaintProperty("landuse_residential", "fill-opacity", 1);
      if (vectorMap.getLayer("waterway")) {
        vectorMap.setPaintProperty("waterway", "line-color", ["match", ["get", "class"], ["river", "canal"], "#8bd4ea", "#bfeaf5"]);
      }
      const roadWidths: Record<string, number[]> = {
        highway_minor: [8, 0.4, 12, 1, 15, 2.7, 20, 11.5],
        highway_major_casing: [11, 3.5, 13, 4.5, 16, 7, 20, 18],
        highway_major_inner: [11, 1.5, 13, 2.5, 16, 5, 20, 15],
        highway_motorway_casing: [6, 2.5, 10, 5.5, 13, 8, 16, 12, 20, 26],
        highway_motorway_inner: [6, 1.1, 10, 3.5, 13, 6, 16, 9, 20, 22],
        highway_motorway_bridge_casing: [6, 3, 10, 6, 13, 9, 16, 13, 20, 28],
        highway_motorway_bridge_inner: [6, 1.4, 10, 4, 13, 6.5, 16, 10, 20, 24],
        tunnel_motorway_casing: [6, 2.5, 10, 5.5, 13, 8, 16, 12, 20, 26],
        tunnel_motorway_inner: [6, 1.1, 10, 3.5, 13, 6, 16, 9, 20, 22],
      };
      Object.entries(roadWidths).forEach(([layer, stops]) => {
        if (vectorMap.getLayer(layer)) vectorMap.setPaintProperty(layer, "line-width", ["interpolate", ["linear"], ["zoom"], ...stops]);
      });
      if (vectorMap.getLayer("highway_minor")) vectorMap.setPaintProperty("highway_minor", "line-opacity", 1);
    });
    const resizeObserver = new ResizeObserver(() => instance.invalidateSize({ pan: false, animate: false }));
    resizeObserver.observe(containerRef.current);
    setMap(instance);
    return () => {
      resizeObserver.disconnect();
      instance.remove();
      previous.current = null;
      setMap(null);
    };
  }, [preview]);

  useEffect(() => {
    if (!map) return;
    if (wheelZoom) map.scrollWheelZoom.enable();
    else map.scrollWheelZoom.disable();
  }, [map, wheelZoom]);

  useEffect(() => {
    if (!map) return;
    const last = previous.current;
    previous.current = { locations, selectedId, followSelection };
    if (!last || last.locations !== locations) frameLocations(map, locations);
    if (followSelection && selectedId && (!last || last.locations !== locations || last.selectedId !== selectedId || !last.followSelection)) {
      const location = locations.find(({ id }) => id === selectedId);
      if (location) {
        const zoom = 15;
        const target = L.latLng(location.coordinates);
        const offset = window.matchMedia("(max-width: 1023px)").matches ? map.getSize().y * .27 : 0;
        const projectedCenter = map.project(target, zoom).add([0, offset]);
        map.setView(map.unproject(projectedCenter, zoom), zoom, { animate: false });
      }
    }
  }, [map, locations, selectedId, followSelection]);

  useEffect(() => {
    if (!map) return;
    const markers = locations.map((location) => L.marker(location.coordinates, {
      icon: categoryPins[location.category].default,
      title: `${location.name} — generalized evidence area`,
      alt: location.name,
    }).on("click", () => onSelectRef.current(location.id)).addTo(map));
    markersRef.current = new Map(locations.map((location, index) => [location.id, markers[index]]));
    return () => {
      markers.forEach((marker) => marker.remove());
      markersRef.current.clear();
    };
  }, [map, locations]);

  useEffect(() => {
    if (!map) return;
    locations.forEach((location) => {
      const marker = markersRef.current.get(location.id);
      if (!marker) return;
      const selected = location.id === selectedId;
      marker.setIcon(categoryPins[location.category][selected ? "selected" : "default"]);
      marker.setZIndexOffset(selected ? 1000 : 0);
    });
  }, [map, locations, selectedId]);

  return <div className="investigation-map-frame">
    <div ref={containerRef} className="investigation-leaflet-shell" aria-label="Map of generalized historical and public report areas" />
  </div>;
}
