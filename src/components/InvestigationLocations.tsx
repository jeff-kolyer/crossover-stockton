import uiCopy from "../data/pages/investigations/dogs/map.json";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType } from "react";
import locationsData from "../data/investigation-locations.json";
import maintenanceData from "../data/investigation-map-maintenance.json";
import { openTaskLocationIds } from "../lib/investigationData";

const uiText = uiCopy.InvestigationLocations;

export interface InvestigationLocation {
  id: string;
  investigation_id: string;
  name: string;
  area: string;
  coordinates: [number, number] | null;
  coordinate_note: string;
  coordinate_reference_url: string | null;
  evidence_date: string;
  date_label: "Occurred" | "Reported occurrence" | "Report published" | "Source reviewed";
  evidence_type: string;
  marker_type: "dog_sighting" | "human_services" | "animal_care";
  category: "historical_published_report" | "recent_public_report" | "official_location_record" | "crossover_firsthand";
  marker_kind: "reported_sighting" | "historical_sighting" | "major_reported_concern" | "firsthand_observation" | "organization" | "animal_shelter" | null;
  map_label: { place: string; report: string; note?: string } | null;
  source_reviewed_at: string | null;
  verification_status: string;
  last_known_outcome: string;
  status: "reported" | "exploratory";
  description: string;
  unknown: string;
  source_url: string;
  google_maps_url?: string;
  evidence_record_id?: string;
  evidence_record_ids?: string[];
  field_report_id?: string;
}

const locations = locationsData as InvestigationLocation[];
const maintenance = maintenanceData;
export type MappedInvestigationLocation = InvestigationLocation & { coordinates: [number, number]; marker_kind: NonNullable<InvestigationLocation["marker_kind"]>; map_label: NonNullable<InvestigationLocation["map_label"]> };
type MapProps = { locations: MappedInvestigationLocation[]; selectedId: string; onSelect: (id: string) => void; wheelZoom: boolean };

function monthYear(date: string) { return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`)); }
function fullDate(date: string) { return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`)); }
const categoryLabels: Record<InvestigationLocation["category"], string> = {
  ...uiText.categoryLabels,
};
const categoryRowLabels: Record<InvestigationLocation["category"], string> = {
  ...uiText.categoryRowLabels,
};

function InvestigationLocationSelector({ location, selected, onSelect }: { location: InvestigationLocation; selected: boolean; onSelect: (id: string) => void }) {
  return <button type="button" className={`investigation-location-selector${selected ? " is-selected" : ""}${location.status === "exploratory" ? " is-exploratory" : ""}${location.category === "recent_public_report" ? " is-recent" : ""}`} aria-pressed={selected} onClick={() => onSelect(location.id)}>
    <span className="investigation-location-selector-copy"><strong>{location.name}</strong><small>{monthYear(location.evidence_date)} · {categoryRowLabels[location.category]}{!location.coordinates && uiText.noPin}</small></span>
    
  </button>;
}

function InvestigationLocationDetails({ location, onOpenReport }: { location: InvestigationLocation; onOpenReport: (id: string) => void }) {
  return <article className="investigation-location-details" aria-live="polite">
    <div className="investigation-location-details-content">
      <div className="investigation-location-details-top"><div><h3>{location.name}</h3><p className="investigation-location-area">{location.area}</p></div><div className="investigation-location-details-meta"><span className={`investigation-location-status is-${location.status}`}>{location.verification_status}</span><time dateTime={location.evidence_date}>{location.date_label} {fullDate(location.evidence_date)}</time><span>{location.evidence_type}</span></div></div>
      <p className="investigation-location-description">{location.description} {!location.coordinates && <strong>{uiText.thisBroadReportHasNoMapPin}</strong>}</p>
      <p className="investigation-location-description"><strong>{uiText.lastKnownOutcome}</strong> {location.last_known_outcome} <strong>{uiText.sourceReviewed}</strong> {location.source_reviewed_at ? fullDate(location.source_reviewed_at) : uiText.notYetRecorded}.</p>
      <p className="investigation-location-unknown"><span><strong>{uiText.whatRemainsUnknown}</strong> {location.unknown}</span></p>
      <div className="investigation-location-links"><a href={location.source_url} target="_blank" rel="noreferrer"> {uiText.readSupportingSource}</a>{location.google_maps_url && <a href={location.google_maps_url} target="_blank" rel="noreferrer">{uiText.openInGoogleMaps}</a>}{location.coordinates && <a href={`https://www.openstreetmap.org/?mlat=${location.coordinates[0]}&mlon=${location.coordinates[1]}#map=15/${location.coordinates[0]}/${location.coordinates[1]}`} target="_blank" rel="noreferrer"> {uiText.exploreGeneralizedAreaInOpenstreetmap}</a>}{location.field_report_id && <a href={`/work/dogs/reports/${encodeURIComponent(location.field_report_id)}/?from=map&location=${encodeURIComponent(location.id)}`} onClick={(event) => { event.preventDefault(); onOpenReport(location.field_report_id!); }}>{uiText.readFieldReport}</a>}</div>
    </div>
  </article>;
}

export function InvestigationLocations({ investigationId, onOpenReport }: { investigationId: string; onOpenReport: (id: string) => void }) {
  const entries = useMemo(() => locations.filter((location) => location.investigation_id === investigationId), [investigationId]);
  const [filter, setFilter] = useState<"all" | InvestigationLocation["category"]>("all");
  const defaultEntries = useMemo(() => entries.filter((location) => location.category !== "historical_published_report" || openTaskLocationIds.has(location.id)), [entries]);
  const visibleEntries = useMemo(() => filter === "all" ? defaultEntries : entries.filter((location) => location.category === filter), [entries, defaultEntries, filter]);
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
    <div className="investigation-section-heading"><h2 id="investigation-locations-title">{uiText.fieldObservationMap}</h2></div>
    <p className="investigation-locations-intro gap-mobile-body">{uiText.markersShowGeneralizedReportAreasAndDocumented}</p>
    <div className="investigation-map-filters" role="group" aria-label={uiText.mapEvidenceCategories}><button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>{uiText.allRecords}{defaultEntries.length})</button>{(Object.keys(categoryLabels) as InvestigationLocation["category"][]).map((category) => <button type="button" key={category} aria-pressed={filter === category} onClick={() => setFilter(category)}>{categoryLabels[category]} ({entries.filter((entry) => entry.category === category).length})</button>)}</div>
    {visibleEntries.length ? <>
    <div ref={workspaceRef} className="investigation-map-workspace">
      <div className="investigation-locations-map" role="group" aria-label={uiText.mapOfApproximateHistoricalReferenceAreas}>
        <div className="investigation-map-canvas">
          {mappedEntries.length ? (Map ? <Map locations={mappedEntries} selectedId={selected.id} onSelect={setSelectedId} wheelZoom={isFullscreen} /> : <div className="investigation-map-loading">{uiText.loadingMap}</div>) : <div className="investigation-map-loading">{uiText.theseBroadReportsHaveNoMapPin}</div>}
          <button type="button" className="investigation-map-fullscreen" onClick={toggleFullscreen} aria-label={isFullscreen ? uiText.exitFullscreenMap : uiText.viewMapFullscreen} aria-pressed={isFullscreen} title={isFullscreen ? uiText.exitFullscreenMap : uiText.viewMapFullscreen}><span>{isFullscreen ? uiText.exitFullscreen : uiText.fullscreen}</span></button>
        </div>
        <div className="investigation-location-list"><div className="investigation-location-list-heading"><h3>{uiText.reportedLocations}</h3><span>{visibleEntries.length} {visibleEntries.length === 1 ? uiText.locationSingular : uiText.locationPlural}</span></div><div className="investigation-location-selectors" role="group" aria-label={uiText.mapEvidenceRecords}>{visibleEntries.map((location) => <InvestigationLocationSelector key={location.id} location={location} selected={location.id === selected.id} onSelect={setSelectedId} />)}</div></div>
      </div>
      <InvestigationLocationDetails location={selected} onOpenReport={onOpenReport} />
    </div></> : <p className="investigation-map-empty">{uiText.noRecordsInThisCategoryYet}</p>}
    <div className="investigation-map-maintenance"><h3>{uiText.howThisMapIsMaintained}</h3><p>{uiText.thisMapUsesPublishedReportsPublicRecords}{maintenance.review_policy} {uiText.historicalRecordsAreAvailableUnderHistoricalLocations}</p><dl><div><dt>{uiText.lastSourcesReviewed}</dt><dd>{maintenance.last_sources_checked ? fullDate(maintenance.last_sources_checked) : uiText.notYetRecorded}</dd></div><div><dt>{uiText.lastMapUpdated}</dt><dd>{maintenance.last_map_updated ? fullDate(maintenance.last_map_updated) : uiText.notYetRecorded}</dd></div><div><dt>{uiText.nextPlannedReview}</dt><dd>{fullDate(maintenance.next_scheduled_review)}</dd></div></dl></div>
    <p className="investigation-locations-footnote">{uiText.markersAreGeneralizedToNearbyPublicLandmarks}</p>
    <details className="investigation-location-source-index"><summary>{uiText.allEvidenceSources}</summary><ol>{entries.map((location) => <li key={location.id}><strong>{location.name}</strong> ({monthYear(location.evidence_date)}): {location.description} {location.unknown} <a href={location.source_url} target="_blank" rel="noreferrer">{uiText.supportingSource}</a></li>)}</ol></details>
  </section>;
}
