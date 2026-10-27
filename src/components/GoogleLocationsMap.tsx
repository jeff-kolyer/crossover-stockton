import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { Dog, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { MappedInvestigationLocation } from "./InvestigationLocations";

declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

export const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
if (googleMapsApiKey) setOptions({ key: googleMapsApiKey, v: "weekly" });

type LocationsMapProps = {
  locations: MappedInvestigationLocation[];
  selectedId: string;
  onSelect: (id: string) => void;
  wheelZoom: boolean;
  preview?: boolean;
  followSelection?: boolean;
};

function createLocationOverlay(location: MappedInvestigationLocation, selected: boolean, onSelect: (id: string) => void) {
  const Icon = location.status === "exploratory" ? MapPin : Dog;
  const button = document.createElement("button");
  button.type = "button";
  button.className = `investigation-map-marker${selected ? " is-selected" : ""}${location.status === "exploratory" ? " is-exploratory" : ""}${location.category === "recent_public_report" ? " is-recent" : ""}`;
  button.title = `${location.name} — generalized evidence area`;
  button.setAttribute("aria-label", button.title);
  button.innerHTML = renderToStaticMarkup(<Icon size={18} strokeWidth={2.3} aria-hidden="true" />);
  button.style.position = "absolute";
  button.style.width = "32px";
  button.style.height = "32px";
  button.style.padding = "0";
  button.style.cursor = "pointer";
  button.style.transform = "translate(-50%, -50%)";
  button.addEventListener("click", () => onSelect(location.id));
  google.maps.OverlayView.preventMapHitsAndGesturesFrom(button);

  class LocationOverlay extends google.maps.OverlayView {
    onAdd() {
      this.getPanes()?.overlayMouseTarget.appendChild(button);
    }
    draw() {
      const point = this.getProjection()?.fromLatLngToDivPixel({ lat: location.coordinates[0], lng: location.coordinates[1] });
      if (point) {
        button.style.left = `${point.x}px`;
        button.style.top = `${point.y}px`;
      }
    }
    onRemove() {
      button.remove();
    }
  }
  return new LocationOverlay();
}

function frameLocations(map: google.maps.Map, locations: MappedInvestigationLocation[]) {
  if (!locations.length) {
    map.moveCamera({ center: { lat: 37.98, lng: -121.33 }, zoom: 10 });
    return;
  }
  const bounds = new google.maps.LatLngBounds();
  locations.forEach(({ coordinates }) => bounds.extend({ lat: coordinates[0], lng: coordinates[1] }));
  const northEast = bounds.getNorthEast();
  const southWest = bounds.getSouthWest();
  const mercatorY = (latitude: number) => {
    const sin = Math.sin(latitude * Math.PI / 180);
    return .5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI);
  };
  const width = Math.max(1, map.getDiv().clientWidth - 92);
  const height = Math.max(1, map.getDiv().clientHeight - 92);
  const xSpan = Math.abs(northEast.lng() - southWest.lng()) / 360;
  const ySpan = Math.abs(mercatorY(northEast.lat()) - mercatorY(southWest.lat()));
  const zoom = Math.max(1, Math.min(11, Math.floor(Math.log2(Math.min(
    xSpan ? width / (256 * xSpan) : Infinity,
    ySpan ? height / (256 * ySpan) : Infinity,
  )))));
  map.moveCamera({ center: bounds.getCenter(), zoom });
}

export function GoogleLocationsMap({ locations, selectedId, onSelect, wheelZoom, preview = false, followSelection = true }: LocationsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [error, setError] = useState("");
  const previous = useRef<{ locations: MappedInvestigationLocation[]; selectedId: string } | null>(null);

  useEffect(() => {
    if (!googleMapsApiKey || !containerRef.current) return;
    let active = true;
    let instance: google.maps.Map | undefined;
    const previousAuthFailure = window.gm_authFailure;
    const onAuthFailure = () => {
      if (active) setError("Google Maps rejected the API key. Check that the key is the API key string from Google Cloud.");
      previousAuthFailure?.();
    };
    window.gm_authFailure = onAuthFailure;
    void importLibrary("maps").then(({ Map }) => {
      if (!active || !containerRef.current) return;
      instance = new Map(containerRef.current, {
        center: { lat: 37.98, lng: -121.33 },
        zoom: 10,
        minZoom: 1,
        disableDefaultUI: true,
        zoomControl: !preview,
        gestureHandling: "greedy",
        scrollwheel: wheelZoom,
        clickableIcons: false,
      });
      setMap(instance);
    }).catch(() => {
      if (active) setError("Google Maps could not load. Check the API key and Maps JavaScript API settings.");
    });
    return () => {
      active = false;
      if (window.gm_authFailure === onAuthFailure) window.gm_authFailure = previousAuthFailure;
      if (instance) google.maps.event.clearInstanceListeners(instance);
      setMap(null);
      previous.current = null;
    };
  }, [preview]);

  useEffect(() => {
    map?.setOptions({ scrollwheel: wheelZoom });
  }, [map, wheelZoom]);

  useEffect(() => {
    if (!map) return;
    const last = previous.current;
    previous.current = { locations, selectedId };
    if (!last || last.locations !== locations) {
      frameLocations(map, locations);
    } else if (followSelection && last.selectedId !== selectedId) {
      const location = locations.find(({ id }) => id === selectedId);
      if (location) {
        map.moveCamera({ center: { lat: location.coordinates[0], lng: location.coordinates[1] }, zoom: 15 });
      }
    }
  }, [map, locations, selectedId, followSelection]);

  useEffect(() => {
    if (!map) return;
    const overlays = locations.map((location) => {
      const overlay = createLocationOverlay(location, selectedId === location.id, onSelect);
      overlay.setMap(map);
      return overlay;
    });
    return () => overlays.forEach((overlay) => overlay.setMap(null));
  }, [map, locations, selectedId, onSelect]);

  return <div className="investigation-map-frame google-map-frame">
    <div ref={containerRef} className="investigation-leaflet-shell" aria-label="Map of generalized historical and public report areas" />
    {error && <p className="investigation-google-map-error" role="status">{error}</p>}
  </div>;
}
