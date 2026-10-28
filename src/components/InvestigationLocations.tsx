
import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType } from "react";
import locationsData from "../data/investigation-locations.json";
import maintenanceData from "../data/investigation-map-maintenance.json";

export interface InvestigationLocation {
  id: string;
  investigation_id: string;
  name: string;
  area: string;
  coordinates: [number, number] | null;
  coordinate_note: string;
  coordinate_reference_url: string | null;
  evidence_date: string;
  date_label: "Occurred" | "Reported occurrence" | "Report published";
  evidence_type: string;
  category: "historical_published_report" | "recent_public_report" | "official_animal_services_record" | "crossover_firsthand";
  marker_kind: "reported_sighting" | "historical_sighting" | "major_reported_concern" | "firsthand_observation" | null;
  map_label: { place: string; report: string; note?: string } | null;
  source_reviewed_at: string | null;
  verification_status: string;
  last_known_outcome: string;
  status: "reported" | "exploratory";
  description: string;
  unknown: string;
  source_url: string;
  evidence_record_id?: string;
  field_report_id?: string;
}

const locations = locationsData as InvestigationLocation[];
const maintenance = maintenanceData;
export type MappedInvestigationLocation = InvestigationLocation & { coordinates: [number, number]; marker_kind: NonNullable<InvestigationLocation["marker_kind"]>; map_label: NonNullable<InvestigationLocation["map_label"]> };
type MapProps = { locations: MappedInvestigationLocation[]; selectedId: string; onSelect: (id: string) => void; wheelZoom: boolean };

function monthYear(date: string) { return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`)); }
function fullDate(date: string) { return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`)); }
const categoryLabels: Record<InvestigationLocation["category"], string> = {
  historical_published_report: "Historical published reports",
  recent_public_report: "Recent public reports",
  official_animal_services_record: "Official Animal Services records",
  crossover_firsthand: "Crossover firsthand observations",
};
const categoryRowLabels: Record<InvestigationLocation["category"], string> = {
  historical_published_report: "Historical published report",
  recent_public_report: "Recent public report",
  official_animal_services_record: "Animal Services record",
  crossover_firsthand: "Crossover observation",
};

function InvestigationLocationSelector({ location, selected, onSelect }: { location: InvestigationLocation; selected: boolean; onSelect: (id: string) => void }) {
  return <button type="button" className={`investigation-location-selector${selected ? " is-selected" : ""}${location.status === "exploratory" ? " is-exploratory" : ""}${location.category === "recent_public_report" ? " is-recent" : ""}`} aria-pressed={selected} onClick={() => onSelect(location.id)}>
    <span className="investigation-location-selector-copy"><strong>{location.name}</strong><small>{monthYear(location.evidence_date)} · {categoryRowLabels[location.category]}{!location.coordinates && " · No pin"}</small></span>
    
  </button>;
}

function InvestigationLocationDetails({ location, onOpenReport }: { location: InvestigationLocation; onOpenReport: (id: string) => void }) {
  return <article className="investigation-location-details" aria-live="polite">
    <div className="investigation-location-details-content">
      <div className="investigation-location-details-top"><div><h3>{location.name}</h3><p className="investigation-location-area">{location.area}</p></div><div className="investigation-location-details-meta"><span className={`investigation-location-status is-${location.status}`}>{location.verification_status}</span><time dateTime={location.evidence_date}>{location.date_label} {fullDate(location.evidence_date)}</time><span>{location.evidence_type}</span></div></div>
      <p className="investigation-location-description">{location.description} {!location.coordinates && <strong>This broad report has no map pin.</strong>}</p>
      <p className="investigation-location-description"><strong>Last known outcome:</strong> {location.last_known_outcome} <strong>Source reviewed:</strong> {location.source_reviewed_at ? fullDate(location.source_reviewed_at) : "Not yet recorded"}.</p>
      <p className="investigation-location-unknown"><span><strong>What remains unknown:</strong> {location.unknown}</span></p>
      <div className="investigation-location-links"><a href={location.source_url} target="_blank" rel="noreferrer"> Read supporting source</a>{location.coordinates && <a href={`https://www.openstreetmap.org/?mlat=${location.coordinates[0]}&mlon=${location.coordinates[1]}#map=15/${location.coordinates[0]}/${location.coordinates[1]}`} target="_blank" rel="noreferrer"> Explore generalized area in OpenStreetMap</a>}{location.field_report_id && <a href={`/reports/${location.field_report_id}/`} onClick={(event) => { event.preventDefault(); onOpenReport(location.field_report_id!); }}>Read field report</a>}</div>
    </div>
  </article>;
}

export function InvestigationLocations({ investigationId, onOpenReport }: { investigationId: string; onOpenReport: (id: string) => void }) {
  const entries = useMemo(() => locations.filter((location) => location.investigation_id === investigationId), [investigationId]);
  const [filter, setFilter] = useState<"all" | InvestigationLocation["category"]>("all");
  const visibleEntries = useMemo(() => filter === "all" ? entries : entries.filter((location) => location.category === filter), [entries, filter]);
  const mappedEntries = useMemo(() => visibleEntries.filter((location): location is MappedInvestigationLocation => location.coordinates !== null && location.marker_kind !== null && location.map_label !== null), [visibleEntries]);
  const [selectedId, setSelectedId] = useState(entries[0]?.id ?? "");
  const [Map, setMap] = useState<ComponentType<MapProps> | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const selected = visibleEntries.find((location) => location.id === selectedId) ?? visibleEntries[0];

  useEffect(() => {
    let active = true;
    import("./InvestigationLocationsMap").then(({ InvestigationLocationsMap }) => {
      if (active) setMap(() => InvestigationLocationsMap);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(document.fullscreenElement === workspaceRef.current);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  async function toggleFullscreen() {
    if (document.fullscreenElement === workspaceRef.current) await document.exitFullscreen();
    else await workspaceRef.current?.requestFullscreen();
  }

  if (!entries.length) return null;

  return <section id="field-observation-map" className="investigation-locations investigation-section" aria-labelledby="investigation-locations-title">
    <div className="investigation-section-heading"><h2 id="investigation-locations-title">Field observation map</h2></div>
    <p className="investigation-locations-intro gap-mobile-body">Markers show generalized areas from historical reporting and recent public reports. They do not show where a dog or person is now, establish suffering, verify current conditions, or identify a hotspot. Scroll to move the page; hold Ctrl while scrolling over the map to zoom it.</p>
    <div className="investigation-map-filters" role="group" aria-label="Map evidence categories"><button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>All records ({entries.length})</button>{(Object.keys(categoryLabels) as InvestigationLocation["category"][]).map((category) => <button type="button" key={category} aria-pressed={filter === category} onClick={() => setFilter(category)}>{categoryLabels[category]} ({entries.filter((entry) => entry.category === category).length})</button>)}</div>
    {visibleEntries.length ? <>
    <div ref={workspaceRef} className="investigation-map-workspace">
      <div className="investigation-locations-map" role="group" aria-label="Map of approximate historical reference areas">
        <div className="investigation-map-canvas">
          {mappedEntries.length ? (Map ? <Map locations={mappedEntries} selectedId={selected.id} onSelect={setSelectedId} wheelZoom={isFullscreen} /> : <div className="investigation-map-loading">Loading map…</div>) : <div className="investigation-map-loading">These broad reports have no map pin.</div>}
          <button type="button" className="investigation-map-fullscreen" onClick={toggleFullscreen} aria-label={isFullscreen ? "Exit fullscreen map" : "View map fullscreen"} aria-pressed={isFullscreen} title={isFullscreen ? "Exit fullscreen map" : "View map fullscreen"}><span>{isFullscreen ? "Exit fullscreen" : "Fullscreen"}</span></button>
        </div>
        <div className="investigation-location-list"><div className="investigation-location-list-heading"><h3>Reported locations</h3><span>{visibleEntries.length} {visibleEntries.length === 1 ? "location" : "locations"}</span></div><div className="investigation-location-selectors" role="group" aria-label="Map evidence records">{visibleEntries.map((location) => <InvestigationLocationSelector key={location.id} location={location} selected={location.id === selected.id} onSelect={setSelectedId} />)}</div></div>
      </div>
      <InvestigationLocationDetails location={selected} onOpenReport={onOpenReport} />
    </div></> : <p className="investigation-map-empty">No records in this category yet.</p>}
    <div className="investigation-map-maintenance"><h3>How this map is maintained</h3><p>This map uses published reports, public records, and Crossover's firsthand observations when available. Currently only published reports are mapped. {maintenance.review_policy} Historical records remain visible with their limitations.</p><dl><div><dt>Last sources reviewed</dt><dd>{maintenance.last_sources_checked ? fullDate(maintenance.last_sources_checked) : "Not yet recorded"}</dd></div><div><dt>Last map updated</dt><dd>{maintenance.last_map_updated ? fullDate(maintenance.last_map_updated) : "Not yet recorded"}</dd></div><div><dt>Next planned review</dt><dd>{fullDate(maintenance.next_scheduled_review)}</dd></div></dl></div>
    <p className="investigation-locations-footnote">Markers are generalized to nearby public landmarks for context. Broad reports without a supported point are listed without pins. These are not directions to a person, animal, or current encampment.</p>
    <details className="investigation-location-source-index"><summary>All evidence sources</summary><ol>{entries.map((location) => <li key={location.id}><strong>{location.name}</strong> ({monthYear(location.evidence_date)}): {location.description} {location.unknown} <a href={location.source_url} target="_blank" rel="noreferrer">Supporting source</a></li>)}</ol></details>
  </section>;
}
