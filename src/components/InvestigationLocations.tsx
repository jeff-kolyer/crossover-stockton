import { CalendarDays, ChevronRight, Dog, Expand, ExternalLink, FileText, Info, MapPin, Shrink } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType } from "react";
import locationsData from "../data/investigation-locations.json";

export interface InvestigationLocation {
  id: string;
  investigation_id: string;
  name: string;
  area: string;
  coordinates: [number, number];
  coordinate_note: string;
  coordinate_reference_url: string;
  evidence_date: string;
  evidence_type: string;
  status: "reported" | "exploratory";
  description: string;
  unknown: string;
  source_url: string;
  evidence_record_id?: string;
  field_report_id?: string;
}

const locations = locationsData as InvestigationLocation[];
type MapProps = { locations: InvestigationLocation[]; selectedId: string; onSelect: (id: string) => void; wheelZoom: boolean };

function shortName(location: InvestigationLocation) { return location.name.split(" — ")[0]; }
function monthYear(date: string) { return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`)); }
function fullDate(date: string) { return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`)); }

function InvestigationLocationSelector({ location, selected, onSelect }: { location: InvestigationLocation; selected: boolean; onSelect: (id: string) => void }) {
  const Icon = location.status === "exploratory" ? MapPin : Dog;
  return <button type="button" className={`investigation-location-selector${selected ? " is-selected" : ""}`} aria-pressed={selected} onClick={() => onSelect(location.id)}>
    <span className={`investigation-location-selector-icon${location.status === "exploratory" ? " is-exploratory" : ""}`}><Icon size={19} aria-hidden="true" /></span>
    <span className="investigation-location-selector-copy"><strong>{shortName(location)}</strong><small>{monthYear(location.evidence_date)}</small></span>
    <ChevronRight className="investigation-location-selector-chevron" size={18} aria-hidden="true" />
  </button>;
}

function InvestigationLocationDetails({ location, onOpenReport }: { location: InvestigationLocation; onOpenReport: (id: string) => void }) {
  const Icon = location.status === "exploratory" ? MapPin : Dog;
  return <article className="investigation-location-details" aria-live="polite">
    <div className="investigation-location-details-icon"><Icon size={24} aria-hidden="true" /></div>
    <div className="investigation-location-details-content">
      <div className="investigation-location-details-top"><div><h3>{location.name}</h3><p className="investigation-location-area">{location.area}</p></div><div className="investigation-location-details-meta"><span className={`investigation-location-status is-${location.status}`}>{location.status === "reported" ? "Reported" : "Exploratory"}</span><time dateTime={location.evidence_date}><CalendarDays size={15} aria-hidden="true" />{fullDate(location.evidence_date)}</time><span><FileText size={15} aria-hidden="true" />{location.evidence_type}</span></div></div>
      <p className="investigation-location-description">{location.description}</p>
      <p className="investigation-location-unknown"><Info size={18} aria-hidden="true" /><span><strong>What remains unknown:</strong> {location.unknown}</span></p>
      <div className="investigation-location-links"><a href={location.source_url} target="_blank" rel="noreferrer"><ExternalLink size={15} aria-hidden="true" /> Read supporting source</a>{location.field_report_id && <a href={`/reports/${location.field_report_id}/`} onClick={(event) => { event.preventDefault(); onOpenReport(location.field_report_id!); }}>Read field report</a>}</div>
    </div>
  </article>;
}

export function InvestigationLocations({ investigationId, onOpenReport }: { investigationId: string; onOpenReport: (id: string) => void }) {
  const entries = useMemo(() => locations.filter((location) => location.investigation_id === investigationId), [investigationId]);
  const [selectedId, setSelectedId] = useState(entries[0]?.id ?? "");
  const [Map, setMap] = useState<ComponentType<MapProps> | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const selected = entries.find((location) => location.id === selectedId) ?? entries[0];

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
    <div className="investigation-section-heading"><span className="investigation-locations-heading-icon"><MapPin size={22} aria-hidden="true" /></span><h2 id="investigation-locations-title">Field observation map</h2></div>
    <p className="investigation-locations-intro gap-mobile-body">These markers show approximate historical reference areas from published reports. They do not confirm current locations of people or animals. Current conditions need field verification.</p>
    <div ref={workspaceRef} className="investigation-map-workspace">
      <div className="investigation-locations-map" role="group" aria-label="Map of approximate historical reference areas">
        <div className="investigation-map-canvas">
          {Map ? <Map locations={entries} selectedId={selected.id} onSelect={setSelectedId} wheelZoom={isFullscreen} /> : <div className="investigation-map-loading">Loading map…</div>}
          <button type="button" className="investigation-map-fullscreen" onClick={toggleFullscreen} aria-label={isFullscreen ? "Exit fullscreen map" : "View map fullscreen"} aria-pressed={isFullscreen} title={isFullscreen ? "Exit fullscreen map" : "View map fullscreen"}>{isFullscreen ? <Shrink size={17} aria-hidden="true" /> : <Expand size={17} aria-hidden="true" />}<span>{isFullscreen ? "Exit fullscreen" : "Fullscreen"}</span></button>
        </div>
        <div className="investigation-location-selectors" role="group" aria-label="Historical reference areas">{entries.map((location) => <InvestigationLocationSelector key={location.id} location={location} selected={location.id === selected.id} onSelect={setSelectedId} />)}</div>
      </div>
      <InvestigationLocationDetails location={selected} onOpenReport={onOpenReport} />
    </div>
    <p className="investigation-locations-footnote">Markers are generalized to nearby public landmarks for context. They are not directions to a person, animal, or current encampment.</p>
    <details className="investigation-location-source-index"><summary>All historical reference sources</summary><ol>{entries.map((location) => <li key={location.id}><strong>{location.name}</strong> ({monthYear(location.evidence_date)}): {location.description} {location.unknown} <a href={location.source_url} target="_blank" rel="noreferrer">Supporting source</a></li>)}</ol></details>
  </section>;
}
