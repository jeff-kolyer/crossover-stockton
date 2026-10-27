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
    map.setView([37.98, -121.33], 10, { animate: false });
    return;
  }
  const bounds = L.latLngBounds(locations.map(({ coordinates }) => coordinates));
  map.fitBounds(bounds, { padding: [46, 46], maxZoom: 11, animate: false });
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
      const colors: Record<string, ["background-color" | "fill-color" | "line-color" | "text-color", string]> = {
        background: ["background-color", "#f7f5eb"],
        landuse_residential: ["fill-color", "#f4f1e7"],
        park: ["fill-color", "#cce9b6"],
        landcover_wood: ["fill-color", "#d9ebcc"],
        water: ["fill-color", "#a9d9ef"],
        waterway: ["line-color", "#87c7e6"],
        waterway_line_label: ["text-color", "#397ba6"],
        water_name_line_label: ["text-color", "#397ba6"],
        water_name_point_label: ["text-color", "#397ba6"],
        highway_major_casing: ["line-color", "#aebfd3"],
        highway_major_subtle: ["line-color", "#b7cbe0"],
        highway_motorway_casing: ["line-color", "#829dbb"],
        highway_motorway_subtle: ["line-color", "#a2bad1"],
        highway_motorway_bridge_casing: ["line-color", "#829dbb"],
      };
      Object.entries(colors).forEach(([layer, [property, color]]) => {
        if (vectorMap.getLayer(layer)) vectorMap.setPaintProperty(layer, property, color);
      });
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
