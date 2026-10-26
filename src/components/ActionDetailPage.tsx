import { AlertTriangle, ArrowLeft, ArrowRight, BookOpen, CalendarDays, ChevronRight, Dog, ExternalLink, FileText, Home as HomeIcon, Info, MapPin, Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType } from "react";
import investigationsData from "../data/dogs-investigations.json";
import locationsData from "../data/investigation-locations.json";
import recordsData from "../data/records.json";
import { dogGapBase, dogMapPath } from "../lib/dogGapLegacy";
import { navigateInternalLink } from "../lib/internalLink";
import type { EvidenceRecord } from "../types";
import type { InvestigationLocation, MappedInvestigationLocation } from "./InvestigationLocations";
import { PublicSiteNav } from "./PublicSiteNav";
import "./ActionDetailPage.css";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";
type MapProps = { locations: MappedInvestigationLocation[]; selectedId: string; onSelect: (id: string) => void; wheelZoom: boolean; followSelection: boolean };

const instructionsPath = `${dogGapBase}our-findings/#field-observation-procedure`;
// Existing action ID for checking reported stray-dog areas; only reports explicitly linked to it belong here.
const actionRecordId = "check-reported-stray-dog-area";
const fieldReports = (recordsData as EvidenceRecord[]).filter((record) => record.record_type === "field_report" && record.action_ids?.includes(actionRecordId));
const investigationId = investigationsData.active_investigations[0].id;
const areas = (locationsData as InvestigationLocation[]).filter((location): location is MappedInvestigationLocation => location.investigation_id === investigationId && location.category === "recent_public_report" && location.coordinates !== null);

function fullDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
}

export function ActionDetailPage({ onNavigate, onOpenInstructions, onOpenMap, onOpenReport }: { onNavigate: (page: PublicRoute) => void; onOpenInstructions: () => void; onOpenMap: () => void; onOpenReport: (id: string) => void }) {
  const [Map, setMap] = useState<ComponentType<MapProps> | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const selected = useMemo(() => areas.find((location) => location.id === selectedId), [selectedId]);

  useEffect(() => {
    let active = true;
    import("./InvestigationLocationsMap").then(({ InvestigationLocationsMap }) => {
      if (active) setMap(() => InvestigationLocationsMap);
    });
    return () => { active = false; };
  }, []);

  function selectLocation(id: string) {
    setSelectedId(id);
    if (window.matchMedia("(max-width: 700px)").matches) requestAnimationFrame(() => panelRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }));
  }

  const stats = [
    { value: String(fieldReports.length), label: "Field visits" },
    { value: "0", label: "Dogs spotted" },
    { value: "Not yet", label: "Reporting tested" },
  ];

  return <main className="public-home action-detail-page">
    <PublicSiteNav active="action" onNavigate={onNavigate} variant="dark" />
    <div className="action-detail-canvas">
      <div className="action-detail-content">
        <a className="action-detail-back" href="/action/" onClick={(event) => navigateInternalLink(event, () => onNavigate("action"))}><ArrowLeft size={17} aria-hidden="true" /> Back to actions</a>

        <header className="action-detail-intro">
          <p className="action-detail-eyebrow">Crossover actions</p>
          <h1>Look for dogs on the street</h1>
          <p>Help us verify reports of roaming dogs in Stockton and document what we find.</p>
        </header>

        <dl className="action-detail-stats" aria-label="Action status">
          {stats.map(({ value, label }) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>

        <section className="action-detail-areas" aria-labelledby="action-detail-areas-title">
          <div className="action-detail-section-heading"><h2 id="action-detail-areas-title">Areas to check</h2><a href={dogMapPath} onClick={(event) => navigateInternalLink(event, onOpenMap)}>Full map <ArrowRight size={16} aria-hidden="true" /></a></div>
          <p className="action-detail-section-note">These are approximate areas from recent public reports, not confirmed current dog locations.</p>
          <div className="action-detail-map-layout">
            <div className="action-detail-map" role="group" aria-label="Map of recent reported dog locations">
              {Map ? <Map locations={areas} selectedId={selectedId} onSelect={selectLocation} wheelZoom={false} followSelection={false} /> : <div className="action-detail-map-loading">Loading map…</div>}
              <div className="action-detail-map-legend" aria-label="Map marker legend"><span><i className="is-recent"><Dog size={12} aria-hidden="true" /></i> Recent public report</span><span><i className="is-selected" /> Selected marker</span></div>
            </div>
            <div className="action-detail-location-panel" ref={panelRef}>
              {selected ? <article className="action-detail-location-details" aria-live="polite">
                <button type="button" className="action-detail-location-back" onClick={() => setSelectedId("")}><ArrowLeft size={16} aria-hidden="true" /> Back to areas</button>
                <p className="action-detail-location-eyebrow">Recent public report</p>
                <h3>{selected.name}</h3>
                <p className="action-detail-location-area">{selected.area}</p>
                <span className="action-detail-location-status">{selected.verification_status}</span>
                <p className="action-detail-location-meta"><CalendarDays size={15} aria-hidden="true" /> {selected.date_label} {fullDate(selected.evidence_date)} · {selected.evidence_type}</p>
                <p className="action-detail-location-reviewed">Source reviewed {selected.source_reviewed_at ? fullDate(selected.source_reviewed_at) : "not yet recorded"}</p>
                <h4>What was reported</h4><p>{selected.description}</p>
                <h4>Last known outcome</h4><p>{selected.last_known_outcome}</p>
                <div className="action-detail-location-unknown"><Info size={16} aria-hidden="true" /><p><strong>What remains unknown</strong><br />{selected.unknown}</p></div>
                <div className="action-detail-location-links"><a href={selected.source_url} target="_blank" rel="noreferrer"><ExternalLink size={15} aria-hidden="true" /> Read supporting source</a><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.coordinates.join(","))}`} target="_blank" rel="noreferrer"><MapPin size={15} aria-hidden="true" /> Explore generalized area in Google Maps</a><a href={dogMapPath} onClick={(event) => navigateInternalLink(event, onOpenMap)}>Open full map <ArrowRight size={15} aria-hidden="true" /></a></div>
              </article> : <div className="action-detail-location-list" role="group" aria-label="Recent reported areas">{areas.map((location) => <button type="button" key={location.id} onClick={() => selectLocation(location.id)}><span className="action-detail-location-icon"><Dog size={18} aria-hidden="true" /></span><span><strong>{location.name}</strong><small>{fullDate(location.evidence_date)} · {location.verification_status}</small></span><ChevronRight size={18} aria-hidden="true" /></button>)}</div>}
            </div>
          </div>

          <div className="action-detail-controls">
            <div className="action-detail-control is-unavailable" aria-disabled="true"><span className="action-detail-control-icon"><FileText size={27} aria-hidden="true" /></span><span><strong>Submit a field report</strong><small>Coming soon! You'll be able to document where you went and what you observed.</small><em>Coming soon</em></span></div>
            <a className="action-detail-control" href={instructionsPath} onClick={(event) => navigateInternalLink(event, onOpenInstructions)}><span className="action-detail-control-icon"><BookOpen size={27} aria-hidden="true" /></span><span><strong>Field instructions</strong><small>What to look for, safety guidance, and how to document your observations.</small></span><ChevronRight size={19} aria-hidden="true" /></a>
          </div>
        </section>

        <section className="action-detail-reports" aria-labelledby="action-detail-reports-title">
          <h2 id="action-detail-reports-title">Field reports</h2>
          {fieldReports.length ? <div className="action-detail-report-list">{fieldReports.map((report) => <a key={report.id} href={`/reports/${report.id}/`} onClick={(event) => navigateInternalLink(event, () => onOpenReport(report.id))}><FileText size={21} aria-hidden="true" /><span><strong>{report.title}</strong><small>{report.summary}</small></span><ChevronRight size={18} aria-hidden="true" /></a>)}</div> : <div className="action-detail-report-empty"><FileText size={29} aria-hidden="true" /><strong>No field reports yet.</strong><p>Field observations will appear here as we document visits.</p></div>}
        </section>
      </div>
    </div>

    <footer className="public-footer">
      <div className="footer-logo" aria-label="Crossover"><picture><source media="(max-width: 760px)" srcSet="/images/logo_dark.webp" /><img src="/images/logo_light.webp" alt="" decoding="async" /></picture><span>Crossover</span></div>
      <span>© 2026 Crossover Stockton</span><p>Reality. Connection. Action.</p>
      <button type="button" onClick={() => onNavigate("reality")}>Needs</button><button type="button" className="is-active" onClick={() => onNavigate("action")}>Action</button><button type="button" onClick={() => onNavigate("about")}>About</button>
    </footer>
    <nav className="public-bottom-nav" aria-label="Mobile primary">
      <button type="button" onClick={() => onNavigate("home")}><HomeIcon size={21} /><span>Home</span></button>
      <button type="button" onClick={() => onNavigate("connection")}><MapPin size={21} /><span>Stories</span></button>
      <button type="button" onClick={() => onNavigate("reality")}><Search size={21} /><span>Needs</span></button>
      <button type="button" className="is-active" onClick={() => onNavigate("action")}><AlertTriangle size={21} /><span>Action</span></button>
      <button type="button" onClick={() => onNavigate("about")}><Sparkles size={21} /><span>About</span></button>
    </nav>
  </main>;
}
