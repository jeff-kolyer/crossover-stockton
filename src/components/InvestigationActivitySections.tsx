import { useEffect, useState } from "react";
import { dogActivityQuestions } from "../data/dog-activity-questions";
import { navigateInternalLink } from "../lib/internalLink";
import { recordLinkLabel } from "../lib/linkLabels";
import type { EvidenceRecord } from "../types";
import { InvestigationOrganizations } from "./InvestigationOrganizations";

const dateLabel = (date?: string | null) => date
  ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date.slice(0, 10)}T12:00:00`))
  : "Date not recorded";

const occurredAt = (record: EvidenceRecord) => record.occurred_at ?? record.recorded_at ?? record.published_at;
const newestFirst = (a: EvidenceRecord, b: EvidenceRecord) => (occurredAt(b) ?? "").localeCompare(occurredAt(a) ?? "");

export function InvestigationActivitySections({ activities, reports, activeQuestionId, activeAnchor, onOpenActivity, onOpenReport, onOpenFindings }: {
  activities: EvidenceRecord[];
  reports: EvidenceRecord[];
  activeQuestionId?: string;
  activeAnchor?: string;
  onOpenActivity: (record: EvidenceRecord) => void;
  onOpenReport: (id: string) => void;
  onOpenFindings: (questionId: string) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const activeQuestionExpanded = activeQuestionId ? expanded.has(activeQuestionId) : false;
  useEffect(() => {
    if (!activeQuestionId) return;
    setExpanded((current) => new Set(current).add(activeQuestionId));
  }, [activeQuestionId]);
  useEffect(() => {
    if (!activeQuestionId || !activeAnchor || !activeQuestionExpanded) return;
    requestAnimationFrame(() => document.getElementById(activeAnchor)?.scrollIntoView({ block: "start" }));
  }, [activeAnchor, activeQuestionId, activeQuestionExpanded]);

  const activityById = new Map(activities.map((record) => [record.id, record]));
  const reportById = new Map(reports.map((record) => [record.id, record]));

  const openActivity = (record: EvidenceRecord) => {
    const href = `/work/dogs/activity/#${encodeURIComponent(record.id)}`;
    window.history.pushState({}, "", href);
    onOpenActivity(record);
  };
  const activityHref = (record: EvidenceRecord) => `/work/dogs/activity/#${encodeURIComponent(record.id)}`;
  const reportHref = (record: EvidenceRecord) => `/work/dogs/reports/${encodeURIComponent(record.id)}/?from=activity`;
  const recordLink = (record: EvidenceRecord) => record.record_type === "field_report"
    ? <a href={reportHref(record)} onClick={(event) => navigateInternalLink(event, () => onOpenReport(record.id))}>{recordLinkLabel(record)}</a>
    : <a href={activityHref(record)} onClick={(event) => navigateInternalLink(event, () => openActivity(record))}>{recordLinkLabel(record)}</a>;

  return <div className="workspace-page investigation-activity-page">
    <section className="investigation-activity-work" aria-labelledby="recorded-activity-title">
      <h2 id="recorded-activity-title">Activity</h2>
      <p>What we've done to answer these questions.</p>
      {dogActivityQuestions.map((question, index) => {
        const questionActivities = question.activityIds.map((id) => activityById.get(id)).filter((record): record is EvidenceRecord => Boolean(record));
        const questionReports = question.reportIds.map((id) => reportById.get(id)).filter((record): record is EvidenceRecord => Boolean(record));
        const primary = [...questionActivities, ...questionReports].sort(newestFirst);
        const related = [
          ...(question.relatedActivityIds ?? []).map((id) => activityById.get(id)).filter((record): record is EvidenceRecord => Boolean(record)),
          ...(question.relatedReportIds ?? []).map((id) => reportById.get(id)).filter((record): record is EvidenceRecord => Boolean(record)),
        ].sort(newestFirst);
        const count = primary.length || related.length;
        const countLabel = primary.length ? `recorded ${count === 1 ? "activity" : "activities"}` : `related ${count === 1 ? "record" : "records"}`;
        const isExpanded = expanded.has(question.id);
        return <section id={question.id} className="investigation-activity-question" aria-labelledby={`${question.id}-title`} key={question.id}>
          <button type="button" className="activity-question-toggle" aria-expanded={isExpanded} aria-controls={`${question.id}-records`} onClick={() => setExpanded((current) => {
            const next = new Set(current);
            if (next.has(question.id)) next.delete(question.id);
            else next.add(question.id);
            return next;
          })}>
            <span className="activity-question-copy">
              <strong id={`${question.id}-title`}>{index + 1}. {question.title}</strong>
              <span>{count} {countLabel}{question.note ? ` · ${question.note}` : "."}</span>
            </span>
            <span className="activity-question-chevron" aria-hidden="true" />
          </button>
          <p className="activity-question-findings"><a href={`/work/dogs/findings/#${question.id}`} aria-label={`See findings: ${question.title}`} onClick={(event) => navigateInternalLink(event, () => onOpenFindings(question.id))}>See findings</a></p>
          <div id={`${question.id}-records`} className="activity-question-records" hidden={!isExpanded}>
            {primary.length > 0 && <div className="record-list activity-record-list">{primary.map((record) => <article id={record.id} key={record.id}>
              <h4><time dateTime={occurredAt(record)?.slice(0, 10)}>{dateLabel(occurredAt(record))}</time> · {record.title}</h4>
              <p>{record.summary}</p>
              <p><a href={record.record_type === "field_report" ? reportHref(record) : activityHref(record)} onClick={(event) => navigateInternalLink(event, () => record.record_type === "field_report" ? onOpenReport(record.id) : openActivity(record))}>{recordLinkLabel(record)}</a></p>
            </article>)}</div>}
            {related.length > 0 && <p className="investigation-activity-related"><strong>Related recorded work:</strong> {related.map((record, relatedIndex) => <span key={record.id}>{relatedIndex > 0 && "; "}{recordLink(record)}</span>)}</p>}
            {question.id === "question-care" && <InvestigationOrganizations onOpenActivity={onOpenActivity} />}
          </div>
        </section>;
      })}
    </section>
  </div>;
}
