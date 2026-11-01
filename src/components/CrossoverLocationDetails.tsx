
import type { EvidenceRecord } from "../types";
import type { InvestigationTask } from "../types/investigation";
import { navigateInternalLink } from "../lib/internalLink";
import type { InvestigationLocation } from "./InvestigationLocations";
import { CloseDetailButton } from "./PlainActionButton";

const categoryLabels: Record<InvestigationLocation["category"], string> = {
  historical_published_report: "Historical published report",
  recent_public_report: "Recent public report",
  official_location_record: "Official location or record",
  crossover_firsthand: "Crossover firsthand observation",
};

function fullDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value.slice(0, 10)}T12:00:00Z`));
}

export function CrossoverLocationDetails({ location, records, tasks, activities, onBack, onOpenTask, onOpenReport }: {
  location: InvestigationLocation;
  records: EvidenceRecord[];
  tasks: InvestigationTask[];
  activities: EvidenceRecord[];
  onBack: () => void;
  onOpenTask: (task: InvestigationTask) => void;
  onOpenReport: (id: string) => void;
}) {
  const evidenceIds = location.evidence_record_ids ?? (location.evidence_record_id ? [location.evidence_record_id] : []);
  const evidence = evidenceIds.flatMap((id) => records.find((record) => record.id === id) ?? []);
  const observations = activities.flatMap((record) => (record.planned_sites ?? [])
    .filter((site) => site.location_id === location.id)
    .map((site) => ({ record, site })));
  const reportIds = new Set([location.field_report_id, ...observations.flatMap(({ record }) => record.report_record_ids ?? [])].filter((id): id is string => Boolean(id)));
  const reports = [...reportIds].flatMap((id) => records.find((record) => record.id === id) ?? []);
  const relatedTasks = tasks.filter((task) => task.location_ids.includes(location.id));

  return <article className="location-sheet-detail" aria-label={`Location details: ${location.name}`}>
    <div className="detail-heading">
      <div><p className="location-eyebrow">Location details</p><h1>{location.name}</h1></div>
      <CloseDetailButton label="location" onClick={onBack} />
    </div>
    <p className="location-area">{location.area}</p>
    <p className="location-status">{location.verification_status}</p>
    {location.marker_kind === "major_reported_concern" && <p>The red alert badge indicates a safety concern in the source report. It does not establish current danger; current conditions at this generalized area are unknown.</p>}
    <dl className="location-facts">
      <div><dt>Record</dt><dd>{categoryLabels[location.category]}</dd></div>
      <div><dt>{location.date_label}</dt><dd>{fullDate(location.evidence_date)}</dd></div>
      <div><dt>Evidence type</dt><dd>{location.evidence_type}</dd></div>
      <div><dt>Source reviewed</dt><dd>{location.source_reviewed_at ? fullDate(location.source_reviewed_at) : "Not recorded"}</dd></div>
    </dl>
    <section><h2>What was reported</h2><p>{location.description}</p></section>
    <section><h2>Last known outcome</h2><p>{location.last_known_outcome}</p></section>
    <section><h2>What remains unknown</h2><p>{location.unknown}</p></section>
    <section><h2>Field reports</h2>{reports.length ? <ul>{reports.map((report) => <li key={report.id}><a href={`/work/dogs/reports/${encodeURIComponent(report.id)}/?from=map&location=${encodeURIComponent(location.id)}`} onClick={(event) => navigateInternalLink(event, () => onOpenReport(report.id))}>{report.title}</a>{report.occurred_at && ` · ${fullDate(report.occurred_at)}`}</li>)}</ul> : <p>No field report is linked to this location yet.</p>}</section>
    <section><h2>Related tasks</h2>{relatedTasks.length ? <ul>{relatedTasks.map((task) => <li key={task.id}><a href={`/work/dogs/tasks/#${encodeURIComponent(task.id)}`} onClick={(event) => navigateInternalLink(event, () => onOpenTask(task))}>{task.title}</a> · {task.status}</li>)}</ul> : <p>No task is linked to this location yet.</p>}</section>
    <section><h2>What Crossover observed</h2>{observations.length ? observations.map(({ record, site }) => <div className="location-record" key={`${record.id}-${site.label}`}><strong>{site.label}{record.occurred_at && ` · ${fullDate(record.occurred_at)}`}</strong><p>{site.reason}</p><small>{record.outcome?.summary ?? record.summary}</small></div>) : <p>No Crossover field observation is documented for this location.</p>}</section>
    <section><h2>Evidence</h2>{evidence.length ? evidence.map((record) => <div className="location-record" key={record.id}><strong>{record.title}</strong><p>{record.summary}</p>{record.source.url && <a href={record.source.url} target="_blank" rel="noreferrer">{record.source.publisher ?? "Read source"}</a>}</div>) : <p>{location.evidence_type}: {location.description}</p>}</section>
    <section><h2>Sources</h2><div className="location-links"><a href={location.source_url} target="_blank" rel="noreferrer"> Read supporting source</a>{location.google_maps_url && <a href={location.google_maps_url} target="_blank" rel="noreferrer">Open in Google Maps</a>}{location.coordinate_reference_url && <a href={location.coordinate_reference_url} target="_blank" rel="noreferrer"> Location reference</a>}</div><p className="location-coordinate-note">{location.coordinate_note}</p></section>
  </article>;
}
