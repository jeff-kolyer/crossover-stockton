import L from "leaflet";
import {
  Baby,
  BatteryCharging,
  BriefcaseBusiness,
  Bus,
  Car,
  ClipboardCheck,
  Droplets,
  FileBadge,
  HeartPulse,
  Home,
  KeyRound,
  MapPin,
  MessageSquareText,
  PawPrint,
  Scale,
  Shield,
  ShowerHead,
  Snowflake,
  Soup,
  Sparkles,
  ThermometerSun,
  Utensils,
  WashingMachine,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { MapContainer, Marker, Polygon, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import { useEffect } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { FeedRecord, TagDefinition } from "../types";
import { getRecordTags } from "../lib/utils";

type LatLngTuple = [number, number];
type MarkerItem = { record: FeedRecord; position: LatLngTuple; rank?: number };

const AREA_POLYGONS: Record<string, LatLngTuple[]> = {
  downtown: [
    [37.974, -121.315],
    [37.974, -121.275],
    [37.946, -121.275],
    [37.946, -121.315],
  ],
  central_core: [
    [37.971, -121.322],
    [37.971, -121.284],
    [37.939, -121.284],
    [37.939, -121.322],
  ],
  south_stockton: [
    [37.945, -121.329],
    [37.945, -121.268],
    [37.898, -121.268],
    [37.898, -121.329],
  ],
  east_corridor: [
    [37.983, -121.255],
    [37.983, -121.195],
    [37.93, -121.195],
    [37.93, -121.255],
  ],
  north_edge: [
    [38.022, -121.335],
    [38.022, -121.255],
    [37.982, -121.255],
    [37.982, -121.335],
  ],
  citywide: [
    [38.03, -121.36],
    [38.03, -121.18],
    [37.89, -121.18],
    [37.89, -121.36],
  ],
};

interface MapPaneProps {
  center: [number, number];
  zoom: number;
  records: FeedRecord[];
  recordRanks?: Map<string, number>;
  selectedRecordId?: string;
  tagsById: Map<string, TagDefinition>;
  onSelectRecord: (record: FeedRecord) => void;
}

export function MapPane({ center, zoom, records, recordRanks, selectedRecordId, tagsById, onSelectRecord }: MapPaneProps) {
  const markerItems = spreadMarkerItems(records.reduce<MarkerItem[]>((items, record) => {
    const position = getMarkerPosition(record, tagsById);
    if (position) items.push({ record, position, rank: recordRanks?.get(record.id) });
    return items;
  }, []));
  const areaRecords = records
    .filter((record) => record.record_kind === "gap" && record.id === selectedRecordId)
    .map((record) => ({ record, areaId: getAreaId(record, tagsById) }))
    .filter((item): item is { record: FeedRecord; areaId: string } => Boolean(item.areaId && AREA_POLYGONS[item.areaId]));

  return (
    <section className="map-pane">
      <div className="map-title">
        <div>
          <p className="eyebrow">Map</p>
          <h2>{markerItems.length} located records</h2>
        </div>
      </div>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom className="leaflet-shell">
        <TileLayer attribution='&copy; OpenStreetMap contributors &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <MapFocus markerItems={markerItems} areaRecords={areaRecords} selectedRecordId={selectedRecordId} />
        {areaRecords.map(({ record, areaId }) => (
          <Polygon
            key={record.id}
            pathOptions={makeAreaStyle(record, selectedRecordId === record.id)}
            positions={AREA_POLYGONS[areaId]}
            eventHandlers={{ click: () => onSelectRecord(record) }}
          >
            <Tooltip sticky direction="top">
              Affected area - approximate
            </Tooltip>
            <Popup>
              <strong>{record.title}</strong>
              <p>{record.summary}</p>
            </Popup>
          </Polygon>
        ))}
        {markerItems.map(({ record, position, rank }) => (
          <Marker
            key={record.id}
            position={position}
            icon={makeIcon(record, tagsById, selectedRecordId === record.id, rank)}
            eventHandlers={{ click: () => onSelectRecord(record) }}
          >
            <Popup>
              <strong>{record.title}</strong>
              <p>{record.summary}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </section>
  );
}

function MapFocus({
  markerItems,
  areaRecords,
  selectedRecordId,
}: {
  markerItems: MarkerItem[];
  areaRecords: Array<{ record: FeedRecord; areaId: string }>;
  selectedRecordId?: string;
}) {
  const map = useMap();
  useEffect(() => {
    const selectedArea = areaRecords.find((item) => item.record.id === selectedRecordId);
    if (selectedArea) {
      map.fitBounds(AREA_POLYGONS[selectedArea.areaId], { padding: [42, 42], maxZoom: 13 });
      return;
    }
    const selected = markerItems.find((item) => item.record.id === selectedRecordId);
    if (selected) {
      map.flyTo(selected.position, Math.max(map.getZoom(), 13), { duration: 0.45 });
      return;
    }
    const points = markerItems.map((item) => item.position);
    const areaPoints = areaRecords.flatMap((item) => AREA_POLYGONS[item.areaId]);
    const allPoints = [...points, ...areaPoints];
    if (allPoints.length > 1) map.fitBounds(allPoints, { padding: [36, 36], maxZoom: 13 });
  }, [map, markerItems, areaRecords, selectedRecordId]);
  return null;
}

function getAreaId(record: FeedRecord, tagsById: Map<string, TagDefinition>) {
  return getRecordTags(record, tagsById).find((tag) => tag.family === "area")?.id;
}

function getMarkerPosition(record: FeedRecord, tagsById: Map<string, TagDefinition>): LatLngTuple | undefined {
  if (record.location) return [record.location.lat, record.location.lng];
  if (record.record_kind !== "gap") return undefined;
  const areaId = getAreaId(record, tagsById);
  if (!areaId) return undefined;
  const polygon = AREA_POLYGONS[areaId];
  if (!polygon) return undefined;
  const totals = polygon.reduce(
    (sum, point) => ({ lat: sum.lat + point[0], lng: sum.lng + point[1] }),
    { lat: 0, lng: 0 },
  );
  return [totals.lat / polygon.length, totals.lng / polygon.length];
}

function spreadMarkerItems(items: MarkerItem[]) {
  const grouped = items.reduce<Record<string, MarkerItem[]>>((groups, item) => {
    const key = item.position.map((value) => value.toFixed(5)).join(",");
    groups[key] = [...(groups[key] ?? []), item];
    return groups;
  }, {});

  return Object.values(grouped).flatMap((group) => {
    if (group.length === 1) return group;
    const radius = 0.012;
    return group.map((item, index) => {
      const angle = (-Math.PI / 2) + (index / group.length) * Math.PI * 2;
      return {
        ...item,
        position: [item.position[0] + Math.sin(angle) * radius, item.position[1] + Math.cos(angle) * radius] as LatLngTuple,
      };
    });
  });
}

function makeAreaStyle(record: FeedRecord, selected: boolean) {
  const color = "#d9554f";
  return {
    color,
    fillColor: color,
    fillOpacity: selected ? 0.075 : 0.045,
    opacity: selected ? 0.74 : 0.5,
    weight: selected ? 2 : 1.5,
    dashArray: selected ? "8 7" : "7 7",
  };
}

function makeIcon(record: FeedRecord, tagsById: Map<string, TagDefinition>, selected: boolean, rank?: number) {
  const tags = getRecordTags(record, tagsById);
  const support = tags.find((tag) => tag.family === "support")?.id ?? "default";
  const serviceType = tags.find((tag) => tag.family === "service_type")?.id;
  const severity = tags.find((tag) => tag.family === "severity")?.id ?? record.record_kind;
  const availability = tags.find((tag) => tag.family === "availability")?.id;
  const workStage = tags.find((tag) => tag.family === "work_stage")?.id;
  const iconKey = support !== "default" ? support : serviceType ?? record.record_kind;
  const icon = renderMarkerIcon(iconKey);
  const classes = [
    "custom-marker",
    record.record_kind === "gap" && "is-gap",
    `marker-${support}`,
    serviceType && `marker-${serviceType}`,
    `marker-${severity}`,
    availability && `marker-${availability}`,
    workStage && `marker-${workStage}`,
    `marker-kind-${record.record_kind}`,
    selected && "is-selected",
  ]
    .filter(Boolean)
    .join(" ");
  const rankHtml = rank ? `<span class="marker-rank">${rank}</span>` : "";
  const html = `<div class="${classes}">${icon}${rankHtml}</div>`;
  return L.divIcon({ html, className: "marker-shell", iconSize: [44, 44], iconAnchor: [22, 22] });
}

function renderMarkerIcon(tagId: string) {
  const Icon = MARKER_ICONS[tagId] ?? MARKER_ICONS.default;
  return renderToStaticMarkup(<Icon className="marker-icon" size={23} strokeWidth={2.7} aria-hidden="true" />);
}

const MARKER_ICONS: Record<string, LucideIcon> = {
  food: Utensils,
  meal_service: Utensils,
  pantry: Soup,
  grocery_distribution: Soup,
  shelter: Home,
  safe_parking: Car,
  safe_parking_lot: Car,
  overnight_parking: Car,
  hygiene: ShowerHead,
  mobile_shower: ShowerHead,
  laundry: WashingMachine,
  cooling: Snowflake,
  cooling_center: Snowflake,
  water: Droplets,
  hydration_station: Droplets,
  restrooms: MapPin,
  heating: ThermometerSun,
  warming_center: ThermometerSun,
  family_support: Baby,
  charging: BatteryCharging,
  transportation: Bus,
  health: HeartPulse,
  mental_health: HeartPulse,
  substance_use_support: Shield,
  connectivity: Wifi,
  storage: KeyRound,
  storage_locker: KeyRound,
  id_service: FileBadge,
  id_replacement: FileBadge,
  benefits: ClipboardCheck,
  benefits_enrollment: ClipboardCheck,
  legal: Scale,
  legal_clinic: Scale,
  housing_help: Home,
  safety: Shield,
  pets: PawPrint,
  accessibility: HeartPulse,
  work: BriefcaseBusiness,
  post: MessageSquareText,
  signal: Sparkles,
  gap: Sparkles,
  service: ClipboardCheck,
  default: Sparkles,
};
