import L from "leaflet";
import { Dog, MapPin } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { MappedInvestigationLocation } from "./InvestigationLocations";

function locationIcon(location: MappedInvestigationLocation, selected: boolean) {
  const Icon = location.status === "exploratory" ? MapPin : Dog;
  return L.divIcon({
    className: `investigation-map-marker${selected ? " is-selected" : ""}${location.status === "exploratory" ? " is-exploratory" : ""}${location.category === "recent_public_report" ? " is-recent" : ""}`,
    html: renderToStaticMarkup(<Icon size={18} strokeWidth={2.3} aria-hidden="true" />),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function MapFocus({ locations, selectedId }: { locations: MappedInvestigationLocation[]; selectedId: string }) {
  const map = useMap();
  const previousSelectedId = useRef(selectedId);
  useEffect(() => {
    map.fitBounds(L.latLngBounds(locations.map(({ coordinates }) => coordinates)), { padding: [46, 46], maxZoom: 11 });
  }, [map, locations]);
  useEffect(() => {
    if (previousSelectedId.current === selectedId) return;
    previousSelectedId.current = selectedId;
    const location = locations.find(({ id }) => id === selectedId);
    if (location) map.flyTo(location.coordinates, Math.max(map.getZoom(), 11), { duration: 0.45 });
  }, [map, locations, selectedId]);
  return null;
}

function MapViewport({ wheelZoom, locations }: { wheelZoom: boolean; locations: MappedInvestigationLocation[] }) {
  const map = useMap();
  const wasFullscreen = useRef(wheelZoom);
  useEffect(() => {
    let resizeFrame = 0;
    if (wheelZoom) map.scrollWheelZoom.enable();
    else {
      map.scrollWheelZoom.disable();
      if (wasFullscreen.current) {
        resizeFrame = requestAnimationFrame(() => {
          map.invalidateSize();
          map.fitBounds(L.latLngBounds(locations.map(({ coordinates }) => coordinates)), { padding: [46, 46], maxZoom: 11 });
        });
      }
    }
    wasFullscreen.current = wheelZoom;
    return () => cancelAnimationFrame(resizeFrame);
  }, [map, wheelZoom, locations]);
  useEffect(() => {
    if (wheelZoom) return;
    const container = map.getContainer();
    let accumulatedDelta = 0;
    let lastWheelAt = 0;
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return;
      event.preventDefault();
      event.stopImmediatePropagation();

      const now = performance.now();
      if (now - lastWheelAt > 250) accumulatedDelta = 0;
      lastWheelAt = now;
      const pixels = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? container.clientHeight : 1);
      accumulatedDelta -= pixels;
      const zoomSteps = Math.trunc(accumulatedDelta / 80);
      if (!zoomSteps) return;
      accumulatedDelta -= zoomSteps * 80;
      map.setZoomAround(map.mouseEventToContainerPoint(event), map.getZoom() + zoomSteps);
    };
    container.addEventListener("wheel", onWheel, { capture: true, passive: false });
    return () => container.removeEventListener("wheel", onWheel, true);
  }, [map, wheelZoom]);
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

export function InvestigationLocationsMap({ locations, selectedId, onSelect, wheelZoom, preview = false }: { locations: MappedInvestigationLocation[]; selectedId: string; onSelect: (id: string) => void; wheelZoom: boolean; preview?: boolean }) {
  const tileFailures = useRef(0);
  const [tilesUnavailable, setTilesUnavailable] = useState(false);
  const icons = useMemo(() => new Map(locations.map((location) => [location.id, locationIcon(location, selectedId === location.id)])), [locations, selectedId]);
  return <div className="investigation-map-frame"><MapContainer center={[37.98, -121.33]} zoom={10} zoomControl={!preview} scrollWheelZoom={false} className="investigation-leaflet-shell">
    {!tilesUnavailable && <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" eventHandlers={{ tileload: () => { tileFailures.current = 0; }, tileerror: () => { tileFailures.current += 1; if (tileFailures.current >= 3) setTilesUnavailable(true); } }} />}
    <MapViewport wheelZoom={wheelZoom} locations={locations} />
    <MapFocus locations={locations} selectedId={selectedId} />
    {locations.map((location) => <Marker key={location.id} position={location.coordinates} icon={icons.get(location.id)} title={`${location.name} — generalized evidence area`} eventHandlers={{
      click: () => onSelect(location.id),
      keydown: (event) => {
        const keyboardEvent = event.originalEvent as KeyboardEvent;
        if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
          keyboardEvent.preventDefault();
          onSelect(location.id);
        }
      },
    }}>
      <Tooltip direction="top" offset={[0, -14]}>{location.name}</Tooltip>
    </Marker>)}
  </MapContainer>{tilesUnavailable && <p className="investigation-map-tile-note" role="status">Map tiles are unavailable. Use the location details for the source and area description.</p>}</div>;
}
