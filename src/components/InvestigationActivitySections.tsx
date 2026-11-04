import uiCopy from "../ui/investigation.json";
import activityPage from "../pages/activity.json";
import { useEffect, useState } from "react";
import { siteModel } from "../model";
import { navigateInternalLink } from "../lib/internalLink";
import { recordLinkLabel } from "../lib/linkLabels";
import type { EvidenceRecord } from "../types";
import { InvestigationOrganizations } from "./InvestigationOrganizations";
import { ActivityRecord, HeadingGroup, QuestionGroup, RecordList } from "./layout";

const uiText = uiCopy.InvestigationActivitySections;
const investigationObjectives = siteModel.getActivityObjectives("street-dog-immediate-welfare");

const dateLabel = (date?: string | null) => date
  ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date.slice(0, 10)}T12:00:00`))
  : uiText.dateNotRecorded;

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
      <HeadingGroup><h2 id="recorded-activity-title">{uiText.activity}</h2>
        <p>{uiText.workTowardObjectives}</p></HeadingGroup>
      {investigationObjectives.map((question, index) => {
        const display = (activityPage.objectiveDisplay as Record<string, { note?: string; showOrganizations?: boolean }>)[question.id];
        const linkedActivities = question.activity_record_ids.map((id) => activityById.get(id)).filter((record): record is EvidenceRecord => Boolean(record));
        const questionActivities = linkedActivities.filter((record) => record.primary_objective_id === question.id);
        const questionReports = reports.filter((record) => record.objective_ids?.includes(question.id) && record.primary_objective_id === question.id);
        const primary = [...questionActivities, ...questionReports].sort(newestFirst);
        const related = [
          ...linkedActivities.filter((record) => record.primary_objective_id !== question.id),
          ...reports.filter((record) => record.objective_ids?.includes(question.id) && record.primary_objective_id !== question.id),
        ].sort(newestFirst);
        const count = primary.length || related.length;
        const countLabel = primary.length ? `${uiText.recorded} ${count === 1 ? uiText.activitySingular : uiText.activityPlural}` : `${uiText.related} ${count === 1 ? uiText.recordSingular : uiText.recordPlural}`;
        const isExpanded = expanded.has(question.id);
        return <QuestionGroup id={question.id} className="investigation-activity-question" aria-labelledby={`${question.id}-title`} key={question.id}>
          <button type="button" className="activity-question-toggle" aria-expanded={isExpanded} aria-controls={`${question.id}-records`} onClick={() => setExpanded((current) => {
            const next = new Set(current);
            if (next.has(question.id)) next.delete(question.id);
            else next.add(question.id);
            return next;
          })}>
            <span className="activity-question-copy">
              <strong id={`${question.id}-title`}>{index + 1}. {question.title}</strong>
              <span>{count} {countLabel}{display?.note ? ` · ${display.note}` : "."}</span>
            </span>
            <span className="activity-question-chevron" aria-hidden="true" />
          </button>
          <p className="activity-question-findings"><a href={`/work/dogs/findings/#${question.id}`} aria-label={`${uiText.seeFindingsPrefix}${question.title}`} onClick={(event) => navigateInternalLink(event, () => onOpenFindings(question.id))}>{uiText.seeFindings}</a></p>
          <div id={`${question.id}-records`} className="activity-question-records" hidden={!isExpanded}>
            {primary.length > 0 && <RecordList className="record-list activity-record-list">{primary.map((record) => <ActivityRecord id={record.id} key={record.id}>
              <h4><time dateTime={occurredAt(record)?.slice(0, 10)}>{dateLabel(occurredAt(record))}</time> · {record.title}</h4>
              <p>{record.summary}</p>
              <p><a href={record.record_type === "field_report" ? reportHref(record) : activityHref(record)} onClick={(event) => navigateInternalLink(event, () => record.record_type === "field_report" ? onOpenReport(record.id) : openActivity(record))}>{recordLinkLabel(record)}</a></p>
            </ActivityRecord>)}</RecordList>}
            {related.length > 0 && <p className="investigation-activity-related"><strong>{uiText.relatedRecordedWork}</strong> {related.map((record, relatedIndex) => <span key={record.id}>{relatedIndex > 0 && "; "}{recordLink(record)}</span>)}</p>}
            {display?.showOrganizations && <InvestigationOrganizations onOpenActivity={onOpenActivity} />}
          </div>
        </QuestionGroup>;
      })}
    </section>
  </div>;
}
