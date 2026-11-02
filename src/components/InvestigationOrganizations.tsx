import orgsData from "../data/orgs.json";
import recordsData from "../data/records.json";
import workData from "../data/work.json";
import { navigateInternalLink } from "../lib/internalLink";
import { recordLinkLabel } from "../lib/linkLabels";
import type { EvidenceRecord, OrgRecord, WorkRecord } from "../types";

const orgs = orgsData as OrgRecord[];
const records = recordsData as EvidenceRecord[];
const works = workData as WorkRecord[];
const engagementRecords = records.filter((record) =>
  record.source.publisher?.startsWith("Crossover Stockton") &&
  (record.record_type === "activity" || record.record_type === "field_report" || record.record_type === "field_investigation") &&
  !record.evidence_status?.startsWith("planned") &&
  record.organization_ids.length > 0,
);
const engagedIds = new Set(engagementRecords.flatMap((record) => record.organization_ids));
const dateLabel = (date?: string | null) => date
  ? new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(`${date.slice(0, 10)}T12:00:00`))
  : "Date not recorded";
const activityFor = (org: OrgRecord) => {
  const related = engagementRecords.filter((record) => record.organization_ids.includes(org.id));
  const history = related.filter((record) => record.record_type !== "field_report");
  return (history.length ? history : related).sort((a, b) => (b.occurred_at ?? b.recorded_at ?? "").localeCompare(a.occurred_at ?? a.recorded_at ?? ""));
};
const engagedOrgs = orgs.filter((org) => org.active && engagedIds.has(org.id)).sort((a, b) => {
  const lastDate = (org: OrgRecord) => activityFor(org)[0]?.occurred_at ?? "";
  return lastDate(b).localeCompare(lastDate(a));
});

export function InvestigationOrganizations({ onOpenActivity }: { onOpenActivity: (record: EvidenceRecord) => void }) {
  return <section className="investigation-organizations-section" aria-labelledby="organizations">
    <h4 id="organizations">Organizations contacted or visited</h4>
    <p>Groups known only through published material remain sources and references.</p>
    <div className="investigation-organizations">
      {engagedOrgs.map((org) => {
        const history = activityFor(org);
        const fieldReports = engagementRecords.filter((record) => record.record_type === "field_report" && record.organization_ids.includes(org.id));
        const sourceRecords = (org.verification?.evidence_record_ids ?? []).map((id) => records.find((record) => record.id === id)).filter((record): record is EvidenceRecord => Boolean(record));
        const contactQuestions = works.flatMap((work) => work.contact_questions ?? []).filter((item) => item.organization_id === org.id);
        return <article id={`organization-${org.slug}`} key={org.id}>
          <h5>{org.name}</h5>
          <p>{org.summary}</p>
          <p><strong>Our involvement:</strong></p><ul>{history.map((record) => <li key={record.id}>{dateLabel(record.occurred_at ?? record.recorded_at)}: <a href={`/work/dogs/activity/#${encodeURIComponent(record.id)}`} onClick={(event) => navigateInternalLink(event, () => onOpenActivity(record))}>{recordLinkLabel(record)}</a></li>)}</ul>
          {history[0]?.outcome && <p><strong>Latest recorded outcome:</strong> {history[0].outcome.summary}</p>}
          {fieldReports.length > 0 && <p><strong>Field reports:</strong> {fieldReports.map((report) => <a key={report.id} href={`/reports/${report.id}/`}>{recordLinkLabel(report)}</a>)}</p>}
          {org.verification && <section><p><strong>What remains unverified:</strong> {org.verification.direct_check}</p><ul>{org.verification.open_questions.map((question) => <li key={question}>{question}</li>)}</ul></section>}
          {contactQuestions.length > 0 && <section><p><strong>Related questions to ask:</strong></p><ul>{contactQuestions.flatMap((item) => item.questions).map((question) => <li key={question}>{question}</li>)}</ul></section>}
          <p><strong>Sources:</strong></p><ul>{sourceRecords.filter((record) => record.source.url).map((record) => <li key={record.id}><a href={record.source.url} target="_blank" rel="noreferrer">{recordLinkLabel(record)}</a></li>)}{org.website && <li><a href={org.website} target="_blank" rel="noreferrer">{org.name} website</a></li>}</ul>
        </article>;
      })}
    </div>
  </section>;
}
