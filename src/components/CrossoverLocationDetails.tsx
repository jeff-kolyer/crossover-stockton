import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import type { EvidenceRecord } from "../types";
import type { InvestigationLocation } from "./InvestigationLocations";
import { PlainActionButton } from "./PlainActionButton";

const categoryLabels: Record<InvestigationLocation["category"], string> = {
  historical_published_report: "Historical published report",
  recent_public_report: "Recent public report",
  official_animal_services_record: "Official Animal Services record",
  crossover_firsthand: "Crossover firsthand observation",
};

function fullDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value.slice(0, 10)}T12:00:00Z`));
}

export function CrossoverLocationDetails({ location, records, onBack, onOpenReport, onOpenActionDetail }: {
  location: InvestigationLocation;
  records: EvidenceRecord[];
  onBack: () => void;
  onOpenReport: (id: string) => void;
  onOpenActionDetail: () => void;
}) {
  const evidence = location.evidence_record_id ? records.find((record) => record.id === location.evidence_record_id) : undefined;
  const report = location.field_report_id ? records.find((record) => record.id === location.field_report_id) : undefined;
  const observations = records.flatMap((record) => (record.planned_sites ?? [])
    .filter((site) => site.location_id === location.id)
    .map((site) => ({ record, site })));

  return <article className="crossover-location-sheet-detail" aria-label={`Location details: ${location.name}`}>
    <button type="button" className="crossover-location-back" onClick={onBack}><ArrowLeft size={18} aria-hidden="true" /> Back to locations</button>
    <p className="crossover-location-eyebrow">Location details</p>
    <h2>{location.name}</h2>
    <p className="crossover-location-area">{location.area}</p>
    <p className="crossover-location-status">{location.verification_status}</p>
    <dl className="crossover-location-facts">
      <div><dt>Record</dt><dd>{categoryLabels[location.category]}</dd></div>
      <div><dt>{location.date_label}</dt><dd>{fullDate(location.evidence_date)}</dd></div>
      <div><dt>Evidence type</dt><dd>{location.evidence_type}</dd></div>
      <div><dt>Source reviewed</dt><dd>{location.source_reviewed_at ? fullDate(location.source_reviewed_at) : "Not recorded"}</dd></div>
    </dl>
    <section><h3>What was reported</h3><p>{location.description}</p></section>
    <section><h3>Last known outcome</h3><p>{location.last_known_outcome}</p></section>
    <section><h3>What remains unknown</h3><p>{location.unknown}</p></section>
    <section><h3>Field reports</h3>{report ? <a href={`/reports/${report.id}/`} onClick={(event) => { event.preventDefault(); onOpenReport(report.id); }}><FileText size={16} aria-hidden="true" /> Read {report.title}</a> : <p>No field report is linked to this location yet.</p>}</section>
    <section><h3>Observations</h3>{observations.length ? observations.map(({ record, site }) => <div className="crossover-location-record" key={`${record.id}-${site.label}`}><strong>{site.label}</strong><p>{site.reason}</p><small>{record.outcome?.summary ?? record.summary}</small></div>) : <p>No Crossover field observation is documented for this location.</p>}</section>
    <section><h3>Evidence</h3>{evidence ? <div className="crossover-location-record"><strong>{evidence.title}</strong><p>{evidence.summary}</p></div> : <p>{location.evidence_type}: {location.description}</p>}</section>
    <section><h3>Sources</h3><div className="crossover-location-links"><a href={location.source_url} target="_blank" rel="noreferrer"><ExternalLink size={16} aria-hidden="true" /> Read supporting source</a>{location.coordinate_reference_url && <a href={location.coordinate_reference_url} target="_blank" rel="noreferrer"><ExternalLink size={16} aria-hidden="true" /> Location reference</a>}</div><p className="crossover-location-coordinate-note">{location.coordinate_note}</p></section>
    <PlainActionButton onClick={onOpenActionDetail}>File a new report</PlainActionButton>
  </article>;
}
