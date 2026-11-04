import uiCopy from "../ui/investigation.json";

import type { EvidenceRecord } from "../types";
import type { InvestigationTask } from "../types/investigation";
import { navigateInternalLink } from "../lib/internalLink";
import { locationSourceLinkLabel, recordLinkLabel, taskLinkLabel } from "../lib/linkLabels";
import type { InvestigationLocation } from "./InvestigationLocations";
import { CloseDetailButton } from "./PlainActionButton";

const uiText = uiCopy.CrossoverLocationDetails;

const categoryLabels: Record<InvestigationLocation["category"], string> = uiText.categoryLabels;

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
  const primarySource = evidence.find((record) => record.source.url === location.source_url);
  const sourceLabel = primarySource ? recordLinkLabel(primarySource) : locationSourceLinkLabel(location.id);
  const observations = activities.flatMap((record) => (record.planned_sites ?? [])
    .filter((site) => site.location_id === location.id)
    .map((site) => ({ record, site })));
  const reportIds = new Set([location.field_report_id, ...observations.flatMap(({ record }) => record.report_record_ids ?? [])].filter((id): id is string => Boolean(id)));
  const reports = [...reportIds].flatMap((id) => records.find((record) => record.id === id) ?? []);
  const relatedTasks = tasks.filter((task) => task.location_ids.includes(location.id));

  return <article className="location-sheet-detail" aria-label={`${uiText.locationDetailsPrefix}${location.name}`}>
    <div className="detail-heading">
      <div><p className="location-eyebrow">{uiText.locationDetails}</p><h2>{location.name}</h2></div>
      <CloseDetailButton label="location" onClick={onBack} />
    </div>
    <p className="location-area">{location.area}</p>
    <p className="location-status">{location.verification_status}</p>
    {location.marker_kind === "major_reported_concern" && <p>{uiText.theRedAlertBadgeIndicatesASafety}</p>}
    <dl className="location-facts">
      <div><dt>{uiText.record}</dt><dd>{categoryLabels[location.category]}</dd></div>
      <div><dt>{location.date_label}</dt><dd>{fullDate(location.evidence_date)}</dd></div>
      <div><dt>{uiText.evidenceType}</dt><dd>{location.evidence_type}</dd></div>
      <div><dt>{uiText.sourceReviewed}</dt><dd>{location.source_reviewed_at ? fullDate(location.source_reviewed_at) : uiText.notRecorded}</dd></div>
    </dl>
    <section><h3>{uiText.whatWasReported}</h3><p>{location.description}</p></section>
    <section><h3>{uiText.lastKnownOutcome}</h3><p>{location.last_known_outcome}</p></section>
    <section><h3>{uiText.whatRemainsUnknown}</h3><p>{location.unknown}</p></section>
    <section><h3>{uiText.fieldReports}</h3>{reports.length ? <ul>{reports.map((report) => <li key={report.id}><a href={`/work/dogs/reports/${encodeURIComponent(report.id)}/?from=map&location=${encodeURIComponent(location.id)}`} onClick={(event) => navigateInternalLink(event, () => onOpenReport(report.id))}>{recordLinkLabel(report)}</a>{report.occurred_at && ` · ${fullDate(report.occurred_at)}`}</li>)}</ul> : <p>{uiText.noFieldReportIsLinkedToThis}</p>}</section>
    <section><h3>{uiText.relatedTasks}</h3>{relatedTasks.length ? <ul>{relatedTasks.map((task) => <li key={task.id}><a href={`/work/dogs/tasks/#${encodeURIComponent(task.id)}`} onClick={(event) => navigateInternalLink(event, () => onOpenTask(task))}>{taskLinkLabel(task)}</a> · {task.status}</li>)}</ul> : <p>{uiText.noTaskIsLinkedToThisLocation}</p>}</section>
    <section><h3>{uiText.whatCrossoverObserved}</h3>{observations.length ? observations.map(({ record, site }) => <div className="location-record" key={`${record.id}-${site.label}`}><strong>{site.label}{record.occurred_at && ` · ${fullDate(record.occurred_at)}`}</strong><p>{site.reason}</p><small>{record.outcome?.summary ?? record.summary}</small></div>) : <p>{uiText.noCrossoverFieldObservationIsDocumentedFor}</p>}</section>
    <section><h3>{uiText.evidence}</h3>{evidence.length ? evidence.map((record) => <div className="location-record" key={record.id}><strong>{record.title}</strong><p>{record.summary}</p>{record.source.url && <a href={record.source.url} target="_blank" rel="noreferrer">{recordLinkLabel(record)}</a>}</div>) : <p>{location.evidence_type}: {location.description}</p>}</section>
    <section><h3>{uiText.sources}</h3><div className="location-links"><a href={location.source_url} target="_blank" rel="noreferrer">{sourceLabel}</a>{location.google_maps_url && <a href={location.google_maps_url} target="_blank" rel="noreferrer">{uiText.openInGoogleMaps}</a>}{location.coordinate_reference_url && <a href={location.coordinate_reference_url} target="_blank" rel="noreferrer">{uiText.locationReference}</a>}</div><p className="location-coordinate-note">{location.coordinate_note}</p></section>
  </article>;
}
