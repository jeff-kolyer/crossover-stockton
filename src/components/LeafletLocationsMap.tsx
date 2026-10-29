import { useEffect, useRef, useState } from "react";
import * as L from "leaflet";
import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import { setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "leaflet/dist/leaflet.css";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MappedInvestigationLocation } from "./InvestigationLocations";
import { locationMarkerColor } from "../lib/evidenceCategoryColors";
import { openTaskLocationIds } from "../lib/investigationData";

setWorkerUrl(workerUrl);

type LocationsMapProps = {
  locations: MappedInvestigationLocation[];
  selectedId: string;
  onSelect: (id: string) => void;
  wheelZoom: boolean;
  preview?: boolean;
  followSelection?: boolean;
};

const dogIcon = '<g transform="translate(1.2 1.2) scale(.9)" stroke-width="2"><path d="M11.25 16.25h1.5L12 17z"/><path d="M16 14v.5"/><path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309"/><path d="M8 14v.5"/><path d="M8.5 8.5c-.384 1.05-1.083 2.028-2.344 2.5-1.931.722-3.576-.297-3.656-1-.113-.994 1.177-6.53 4-7 1.923-.321 3.651.845 3.651 2.235A7.497 7.497 0 0 1 14 5.277c0-1.39 1.844-2.598 3.767-2.277 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5"/></g>';
const eyeIcon = '<path d="M2 12s3.7-5.6 10-5.6S22 12 22 12s-3.7 5.6-10 5.6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>';
const alertBadge = '<g transform="translate(5.3 5.3) scale(.82)"><circle cx="35" cy="35" r="11" fill="#D74B45" stroke="#fff" stroke-width="1.5"/><path d="M35 27.5 42 40H28Z" fill="#fff"/><path d="M35 32v4" stroke="#D74B45" stroke-width="1.8" stroke-linecap="round"/><circle cx="35" cy="38" r="1" fill="#D74B45"/></g>';
const labelLineLength = 22;
const labelOffset = 20;

function makeCircleMarker(location: MappedInvestigationLocation, selected: boolean) {
  const kind = location.marker_kind;
  const icon = kind === "firsthand_observation" ? eyeIcon : dogIcon;
  const fill = locationMarkerColor(location.category, openTaskLocationIds.has(location.id));
  const size = kind === "major_reported_concern" ? 46 : 38;
  const circle = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '"><circle cx="19" cy="19" r="16" fill="' + fill + '" stroke="' + (selected ? '#000' : '#fff') + '" stroke-width="' + (selected ? 3 : 2.25) + '"/><g transform="translate(7 7)" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + icon + '</g>' + (kind === "major_reported_concern" ? alertBadge : '') + '</svg>';
  return L.icon({ iconUrl: 'data:image/svg+xml,' + encodeURIComponent(circle), iconSize: [size, size], iconAnchor: [19, 19] });
}

function balancedLabelLines(place: string) {
  if (place.length <= labelLineLength) return [place];

  const conjunction = place.match(/^(.+?)\s+(&|and)\s+(.+)$/i);
  if (conjunction) return [conjunction[1], `${conjunction[2]} ${conjunction[3]}`];

  const slashGroup = place.match(/^(.+?\s\/)\s+(.+)$/);
  if (slashGroup) return [slashGroup[1], slashGroup[2]];

  const words = place.split(/\s+/);
  if (words.length < 3) return [place];
  let best = [place];
  let bestScore = Number.POSITIVE_INFINITY;
  for (let index = 1; index < words.length; index += 1) {
    const lines = [words.slice(0, index).join(" "), words.slice(index).join(" ")];
    const longest = Math.max(...lines.map((line) => line.length));
    const orphanPenalty = index === 1 || index === words.length - 1 ? 8 : 0;
    const score = longest * 2 + Math.abs(lines[0].length - lines[1].length) + orphanPenalty;
    if (score < bestScore) {
      best = lines;
      bestScore = score;
    }
  }
  return best;
}

function labelContent(location: MappedInvestigationLocation) {
  const label = document.createElement("span");
  label.className = "investigation-map-label__content";
  balancedLabelLines(location.map_label.place).forEach((line) => {
    const row = document.createElement("span");
    row.className = "investigation-map-label__line";
    row.textContent = line;
    label.append(row);
  });
  return label;
}

function updateVisibleLabels(map: L.Map, locations: MappedInvestigationLocation[], markers: Map<string, L.Marker>, selectedId: string) {
  const containerBounds = map.getContainer().getBoundingClientRect();
  const bounds = {
    left: Math.max(containerBounds.left, 0),
    right: Math.min(containerBounds.right, window.innerWidth),
    top: Math.max(containerBounds.top, 0),
    bottom: Math.min(containerBounds.bottom, window.innerHeight),
  };
  const markerRects = locations.map((location) => ({ id: location.id, rect: markers.get(location.id)?.getElement()?.getBoundingClientRect() }));
  const labels: DOMRect[] = [];
  const overlaps = (a: DOMRect, b: DOMRect, gap = 4) => a.left < b.right + gap && a.right > b.left - gap && a.top < b.bottom + gap && a.bottom > b.top - gap;
  const candidates = locations.filter((location) => location.id === selectedId || openTaskLocationIds.has(location.id) || location.category === "recent_public_report")
    .sort((a, b) => Number(b.id === selectedId) - Number(a.id === selectedId)
      || Number(openTaskLocationIds.has(b.id)) - Number(openTaskLocationIds.has(a.id))
      || Number(b.category === "recent_public_report") - Number(a.category === "recent_public_report")
      || b.evidence_date.localeCompare(a.evidence_date));

  locations.forEach((location) => markers.get(location.id)?.closeTooltip());
  for (const location of candidates) {
    const marker = markers.get(location.id);
    const tooltip = marker?.getTooltip();
    if (!marker || !tooltip) continue;
    marker.openTooltip();
    const element = tooltip.getElement();
    if (!element) continue;
    tooltip.update();
    const rect = element.getBoundingClientRect();
    const fits = rect.left >= bounds.left + 5 && rect.right <= bounds.right - 5 && rect.top >= bounds.top + 5 && rect.bottom <= bounds.bottom - 5;
    const collides = labels.some((other) => overlaps(rect, other, 6))
      || markerRects.some((other) => other.id !== location.id && other.rect && overlaps(rect, other.rect, 5));
    if (fits && (location.id === selectedId || !collides)) {
      labels.push(rect);
    } else {
      marker.closeTooltip();
    }
  }
}

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
  const selectedIdRef = useRef(selectedId);
  onSelectRef.current = onSelect;
  selectedIdRef.current = selectedId;

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
    const basemap = maplibreGL({ style: "https://tiles.openfreemap.org/styles/liberty" }).addTo(instance);
    const vectorMap = basemap.getMaplibreMap();
    vectorMap.on("style.load", () => {
      if (new URLSearchParams(window.location.search).get("palette") === "liberty") return;

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
      const colors: Record<string, ["background-color" | "fill-color" | "line-color" | "text-color", string]> = {
        background: ["background-color", "#f0ece3"],
        landuse_residential: ["fill-color", "#f8f9f6"],
        building: ["fill-color", "#f0ece3"],
        park: ["fill-color", "#d7f2df"],
        landcover_wood: ["fill-color", "#d7f2df"],
        landcover_grass: ["fill-color", "#d7f2df"],
        water: ["fill-color", "#8bd4ea"],
        waterway_line_label: ["text-color", "#348da4"],
        water_name_line_label: ["text-color", "#348da4"],
        water_name_point_label: ["text-color", "#348da4"],
        road_minor_casing: ["line-color", "#e2e6ea"],
        road_minor: ["line-color", "#ffffff"],
        road_service_track_casing: ["line-color", "#e2e6ea"],
        road_service_track: ["line-color", "#ffffff"],
        road_secondary_tertiary_casing: ["line-color", "#d0d8e1"],
        road_secondary_tertiary: ["line-color", "#e9eef3"],
        road_trunk_primary_casing: ["line-color", "#d0d8e1"],
        road_trunk_primary: ["line-color", "#e9eef3"],
        road_link_casing: ["line-color", "#d0d8e1"],
        road_link: ["line-color", "#e9eef3"],
        road_motorway_casing: ["line-color", "#9aa7b6"],
        road_motorway: ["line-color", "#c6d1dc"],
        road_motorway_link_casing: ["line-color", "#9aa7b6"],
        road_motorway_link: ["line-color", "#c6d1dc"],
        bridge_motorway_casing: ["line-color", "#9aa7b6"],
        bridge_motorway: ["line-color", "#c6d1dc"],
        tunnel_motorway_casing: ["line-color", "#9aa7b6"],
        tunnel_motorway: ["line-color", "#c6d1dc"],
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
      if (vectorMap.getLayer("park")) {
        vectorMap.setPaintProperty("park", "fill-outline-color", "#d7f2df");
        vectorMap.setPaintProperty("park", "fill-opacity", 1);
      }
      if (vectorMap.getLayer("landcover_wood")) {
        vectorMap.setPaintProperty("landcover_wood", "fill-opacity", ["interpolate", ["linear"], ["zoom"], 8, 0, 12, 1]);
      }
      if (vectorMap.getLayer("landuse_residential")) vectorMap.setPaintProperty("landuse_residential", "fill-opacity", 1);
      ["waterway_river", "waterway_other"].forEach((layer) => {
        if (vectorMap.getLayer(layer)) vectorMap.setPaintProperty(layer, "line-color", "#8bd4ea");
      });
      const roadWidths: Record<string, number[]> = {
        road_minor_casing: [8, 0.7, 12, 1.6, 15, 3.5, 20, 13],
        road_minor: [8, 0.4, 12, 1, 15, 2.7, 20, 11.5],
        road_secondary_tertiary_casing: [11, 3.5, 13, 4.5, 16, 7, 20, 18],
        road_secondary_tertiary: [11, 1.5, 13, 2.5, 16, 5, 20, 15],
        road_trunk_primary_casing: [11, 3.5, 13, 4.5, 16, 7, 20, 18],
        road_trunk_primary: [11, 1.5, 13, 2.5, 16, 5, 20, 15],
        road_motorway_casing: [6, 2.5, 10, 5.5, 13, 8, 16, 12, 20, 26],
        road_motorway: [6, 1.1, 10, 3.5, 13, 6, 16, 9, 20, 22],
        bridge_motorway_casing: [6, 3, 10, 6, 13, 9, 16, 13, 20, 28],
        bridge_motorway: [6, 1.4, 10, 4, 13, 6.5, 16, 10, 20, 24],
        tunnel_motorway_casing: [6, 2.5, 10, 5.5, 13, 8, 16, 12, 20, 26],
        tunnel_motorway: [6, 1.1, 10, 3.5, 13, 6, 16, 9, 20, 22],
      };
      Object.entries(roadWidths).forEach(([layer, stops]) => {
        if (vectorMap.getLayer(layer)) vectorMap.setPaintProperty(layer, "line-width", ["interpolate", ["linear"], ["zoom"], ...stops]);
      });
      if (vectorMap.getLayer("road_minor_casing")) vectorMap.setPaintProperty("road_minor_casing", "line-opacity", 1);
      if (vectorMap.getLayer("poi_r1")) vectorMap.setLayerZoomRange("poi_r1", 14, 24);
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
    const markers = locations.map((location) => {
      const marker = L.marker(location.coordinates, {
        icon: makeCircleMarker(location, false),
        title: location.map_label.place,
        alt: location.map_label.place,
      }).on("click", () => onSelectRef.current(selectedIdRef.current === location.id ? "" : location.id)).addTo(map);
      marker.bindTooltip(labelContent(location), {
        permanent: true,
        direction: "right",
        offset: L.point(labelOffset, 0),
        opacity: 1,
        className: openTaskLocationIds.has(location.id)
          ? "investigation-map-label investigation-map-label--task"
          : location.marker_kind === "reported_sighting"
            ? "investigation-map-label investigation-map-label--orange"
            : "investigation-map-label",
      });
      return marker;
    });
    markersRef.current = new Map(locations.map((location, index) => [location.id, markers[index]]));
    const refreshLabels = () => updateVisibleLabels(map, locations, markersRef.current, selectedIdRef.current);
    map.on("zoomend moveend resize", refreshLabels);
    refreshLabels();
    return () => {
      map.off("zoomend moveend resize", refreshLabels);
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
      marker.setIcon(makeCircleMarker(location, selected));
      marker.setZIndexOffset(selected ? 1000 : 0);

    });
    updateVisibleLabels(map, locations, markersRef.current, selectedId);
  }, [map, locations, selectedId]);

  return <div className="investigation-map-frame">
    <div ref={containerRef} className="investigation-leaflet-shell" aria-label="Map of generalized historical and public report areas" />
  </div>;
}
