
import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType } from "react";
import locationsData from "../data/investigation-locations.json";
import maintenanceData from "../data/investigation-map-maintenance.json";
import { dogGapBase } from "../lib/dogGapLegacy";
import { evidenceCategoryColors } from "../lib/evidenceCategoryColors";
import type { InvestigationLocation, MappedInvestigationLocation } from "./InvestigationLocations";
import { InvestigationPageHeader } from "./InvestigationPageHeader";

type Category = "all" | InvestigationLocation["category"];
type MapProps = {
  locations: MappedInvestigationLocation[];
  selectedId: string;
  onSelect: (id: string) => void;
  wheelZoom: boolean;
  followSelection: boolean;
};

const locations = locationsData as InvestigationLocation[];
const maintenance = maintenanceData;
const filters: { value: Category; label: string }[] = [
  { value: "all", label: "All records" },
  { value: "historical_published_report", label: "Historical published reports" },
  { value: "recent_public_report", label: "Recent public reports" },
  { value: "official_animal_services_record", label: "Official Animal Services records" },
  { value: "crossover_firsthand", label: "Crossover firsthand observations" },
];
const categorySingular: Record<InvestigationLocation["category"], string> = {
  historical_published_report: "Historical published report",
  recent_public_report: "Recent public report",
  official_animal_services_record: "Animal Services record",
  crossover_firsthand: "Crossover observation",
};

function fullDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
}

function monthYear(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
}

export function DogsLocationsMapPage({ investigationId, onOpenReport }: { investigationId: string; onOpenReport: (id: string) => void }) {
  const entries = useMemo(() => locations.filter((location) => location.investigation_id === investigationId), [investigationId]);
  const [filter, setFilter] = useState<Category>("recent_public_report");
  const [selectedId, setSelectedId] = useState("");
  const [Map, setMap] = useState<ComponentType<MapProps> | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLElement>(null);
  const visibleEntries = useMemo(() => filter === "all" ? entries : entries.filter((location) => location.category === filter), [entries, filter]);
  const mappedEntries = useMemo(() => visibleEntries.filter((location): location is MappedInvestigationLocation => location.coordinates !== null && location.marker_kind !== null && location.map_label !== null), [visibleEntries]);
  const selected = visibleEntries.find((location) => location.id === selectedId);

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

  useEffect(() => {
    if (selected) detailsRef.current?.focus({ preventScroll: true });
  }, [selected]);

  function changeFilter(next: Category) {
    setFilter(next);
    setSelectedId("");
  }

  function closeDetails() {
    setSelectedId("");
    requestAnimationFrame(() => listRef.current?.focus({ preventScroll: true }));
  }

  async function toggleFullscreen() {
    if (document.fullscreenElement === workspaceRef.current) await document.exitFullscreen();
    else await workspaceRef.current?.requestFullscreen();
  }

  if (!entries.length) return null;

  return <div className="dogs-map-page">
    <InvestigationPageHeader title="Reported locations" description="Explore reports of roaming dogs in Stockton. Locations are approximate and do not confirm dogs are currently present." />

    <div className="dogs-map-filters" role="group" aria-label="Map evidence categories">
      {filters.map(({ value, label }) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => changeFilter(value)}>{value !== "all" && <span className="dogs-map-filter-dot" style={{ backgroundColor: evidenceCategoryColors[value] }} aria-hidden="true" />}{label} ({value === "all" ? entries.length : entries.filter((entry) => entry.category === value).length})</button>)}
    </div>
    <div className="dogs-map-filter-select-wrap">
      <select aria-label="Map evidence category" value={filter} onChange={(event) => changeFilter(event.target.value as Category)}>
        {filters.map(({ value, label }) => <option key={value} value={value}>{label} ({value === "all" ? entries.length : entries.filter((entry) => entry.category === value).length})</option>)}
      </select>
      
    </div>

    <div ref={workspaceRef} className="dogs-map-workspace">
      <div className="dogs-map-canvas" role="group" aria-label="Map of approximate reported locations">
        {Map ? <Map locations={mappedEntries} selectedId={selectedId} onSelect={setSelectedId} wheelZoom={isFullscreen} followSelection={true} /> : <div className="dogs-map-loading">Loading map…</div>}
        <button type="button" className="dogs-map-fullscreen" onClick={toggleFullscreen} aria-label={isFullscreen ? "Exit fullscreen map" : "View map fullscreen"} aria-pressed={isFullscreen} title={isFullscreen ? "Exit fullscreen map" : "View map fullscreen"}><span>{isFullscreen ? "Exit fullscreen" : "Fullscreen"}</span></button>
      </div>

      <aside className={`dogs-map-panel${selected ? " is-details" : ""}`} aria-label={selected ? "Location details" : "Reported locations"}>
        {selected ? <article ref={detailsRef} tabIndex={-1} className="dogs-map-details" aria-live="polite">
          <div className="dogs-map-panel-top"><button type="button" onClick={closeDetails}>Back to locations</button><button type="button" className="dogs-map-close" onClick={closeDetails} aria-label="Close location details">Close</button></div>
          <p className="dogs-map-panel-eyebrow">Location details</p>
          <h2>{selected.name}</h2>
          <p className="dogs-map-area">{selected.area}</p>
          <span className={`dogs-map-status${selected.status === "exploratory" ? " is-exploratory" : ""}`}>{selected.verification_status}</span>
          <div className="dogs-map-meta"><span> {selected.date_label} {fullDate(selected.evidence_date)} · {categorySingular[selected.category]}</span><span> {selected.evidence_type}</span><small>Source reviewed {selected.source_reviewed_at ? fullDate(selected.source_reviewed_at) : "not yet recorded"}</small></div>
          <section><h3>What was reported</h3><p>{selected.description}</p>{!selected.coordinates && <p>This broad report has no map pin.</p>}</section>
          <section><h3>Last known outcome</h3><p>{selected.last_known_outcome}</p></section>
          <div className="dogs-map-unknown"><div><h3>What remains unknown</h3><p>{selected.unknown}</p></div></div>
          {selected.coordinates && <p className="dogs-map-coordinate-note">{selected.coordinate_note}</p>}
          <div className="dogs-map-links"><a href={selected.source_url} target="_blank" rel="noreferrer"> Read supporting source</a>{selected.coordinates && <a href={`https://www.openstreetmap.org/?mlat=${selected.coordinates[0]}&mlon=${selected.coordinates[1]}#map=15/${selected.coordinates[0]}/${selected.coordinates[1]}`} target="_blank" rel="noreferrer"> Explore generalized area in OpenStreetMap</a>}{selected.coordinate_reference_url && <a href={selected.coordinate_reference_url} target="_blank" rel="noreferrer"> Location reference</a>}{selected.field_report_id && <a href={`/reports/${selected.field_report_id}/`} onClick={(event) => { event.preventDefault(); onOpenReport(selected.field_report_id!); }}> Read field report</a>}</div>
        </article> : <div ref={listRef} tabIndex={-1} className="dogs-map-list"><div className="dogs-map-list-heading"><h2>Reported locations</h2><span>{visibleEntries.length} {visibleEntries.length === 1 ? "location" : "locations"}</span></div>{visibleEntries.length ? <div className="dogs-map-list-items">{visibleEntries.map((location) => <button type="button" key={location.id} onClick={() => setSelectedId(location.id)}><span><strong>{location.name}</strong><small>{monthYear(location.evidence_date)} · {categorySingular[location.category]}{!location.coordinates && " · No pin"}</small></span></button>)}</div> : <p className="dogs-map-empty">No records in this category yet.</p>}</div>}
      </aside>
    </div>

    <nav className="dogs-map-resources" aria-label="Field resources">
      <span className="dogs-map-resource-unavailable" aria-disabled="true"> Submit a field report <small>Coming soon</small></span>
      <a href={`${dogGapBase}our-findings/#field-observation-procedure`}> Field instructions </a>
    </nav>

    <details className="dogs-map-about">
      <summary><span>About this map</span></summary>
      <p>This map uses published reports, public records, and Crossover's firsthand observations when available. Locations are generalized to nearby public landmarks for context. They do not show where a dog or person is now, establish suffering, verify current conditions, or identify a hotspot.</p>
      <div className="dogs-map-about-more"><p>Currently only published reports are mapped. {maintenance.review_policy} Historical records remain visible with their limitations. Broad reports without a supported point are listed without pins. These are not directions to a person, animal, or current encampment. Scroll to move the page; hold Ctrl while scrolling over the map to zoom it.</p><dl><div><dt>Last sources reviewed</dt><dd>{maintenance.last_sources_checked ? fullDate(maintenance.last_sources_checked) : "Not yet recorded"}</dd></div><div><dt>Last map updated</dt><dd>{maintenance.last_map_updated ? fullDate(maintenance.last_map_updated) : "Not yet recorded"}</dd></div><div><dt>Next planned review</dt><dd>{fullDate(maintenance.next_scheduled_review)}</dd></div></dl><h3>All evidence sources</h3><ol>{entries.map((location) => <li key={location.id}><strong>{location.name}</strong> ({monthYear(location.evidence_date)}): {location.description} {location.unknown} <a href={location.source_url} target="_blank" rel="noreferrer">Supporting source</a></li>)}</ol></div>
    </details>
  </div>;
}
