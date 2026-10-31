
import orgsData from "../data/orgs.json";
import recordsData from "../data/records.json";
import workData from "../data/work.json";
import { navigateInternalLink } from "../lib/internalLink";
import { PublicSiteNav } from "./PublicSiteNav";
import { PublicFooter } from "./PublicFooter";
import type { EvidenceRecord, OrgRecord, WorkRecord } from "../types";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";

interface OrganizationsPageProps {
  onNavigate: (page: PublicRoute) => void;
  onOpenReport: (id: string) => void;
  selectedSlug?: string;
  onOpenOrganization: (slug: string) => void;
}

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
  return (history.length ? history : related).sort((a, b) => (a.occurred_at ?? a.recorded_at ?? "").localeCompare(b.occurred_at ?? b.recorded_at ?? ""));
};
const engagedOrgs = orgs.filter((org) => org.active && engagedIds.has(org.id)).sort((a, b) => {
  const lastDate = (org: OrgRecord) => activityFor(org).at(-1)?.occurred_at ?? "";
  return lastDate(b).localeCompare(lastDate(a));
});

export function OrganizationsPage({ onNavigate, onOpenReport, selectedSlug, onOpenOrganization }: OrganizationsPageProps) {
  const selected = engagedOrgs.find((org) => org.slug === selectedSlug);
  const organizationLink = (org: OrgRecord) => `/organizations/${org.slug}/`;
  const history = selected ? activityFor(selected) : [];
  const fieldReports = selected ? engagementRecords.filter((record) => record.record_type === "field_report" && record.organization_ids.includes(selected.id)) : [];
  const sourceRecords = selected ? (selected.verification?.evidence_record_ids ?? []).map((id) => records.find((record) => record.id === id)).filter((record): record is EvidenceRecord => Boolean(record)) : [];
  const contactQuestions = selected ? works.flatMap((work) => work.contact_questions ?? []).filter((item) => item.organization_id === selected.id) : [];

  return (
    <main className="public-site organizations-page">
      <PublicSiteNav active="organizations" onNavigate={onNavigate} />
      <div className="crossover-index-body public-document">
        {selected ? <>
          <p><a href="/organizations/" onClick={(event) => navigateInternalLink(event, () => onNavigate("organizations"))}>Back to Organizations</a></p>
          <h1>{selected.name}</h1>
          <p>{selected.summary}</p>
          <section><h2>Our involvement</h2><ol>{history.map((record) => <li key={record.id}><strong>{dateLabel(record.occurred_at ?? record.recorded_at)}:</strong> {record.title}. {record.outcome?.summary ?? record.summary}</li>)}</ol></section>
          {history.at(-1)?.outcome && <p><strong>Latest recorded outcome:</strong> {history.at(-1)!.outcome!.summary}</p>}
          {fieldReports.length > 0 && <section><h2>Field reports</h2><ul>{fieldReports.map((report) => <li key={report.id}><a href={`/reports/${report.id}/`} onClick={(event) => navigateInternalLink(event, () => onOpenReport(report.id))}>{report.title}</a></li>)}</ul></section>}
          {selected.verification && <section><h2>What remains unverified</h2><p>{selected.verification.direct_check}</p><ul>{selected.verification.open_questions.map((question) => <li key={question}>{question}</li>)}</ul></section>}
          {contactQuestions.length > 0 && <section><h2>Related questions to ask</h2><ul>{contactQuestions.flatMap((item) => item.questions).map((question) => <li key={question}>{question}</li>)}</ul></section>}
          <section><h2>Sources</h2><ul>{sourceRecords.filter((record) => record.source.url).map((record) => <li key={record.id}><a href={record.source.url} target="_blank" rel="noreferrer">{record.title}</a></li>)}{selected.website && <li><a href={selected.website} target="_blank" rel="noreferrer">Organization website</a></li>}</ul></section>
        </> : <>
          <h1>Organizations</h1>
          <p>Organizations Crossover has contacted or visited. Groups known only through published material remain sources and references.</p>
          {engagedOrgs.map((org) => <article key={org.id}><h2><a href={organizationLink(org)} onClick={(event) => navigateInternalLink(event, () => onOpenOrganization(org.slug))}>{org.name}</a></h2><p>{org.summary}</p><p><strong>Our involvement:</strong> {activityFor(org).map((record) => `${dateLabel(record.occurred_at ?? record.recorded_at)} — ${record.title}`).join("; ")}.</p>{activityFor(org).at(-1)?.outcome && <p><strong>Latest recorded outcome:</strong> {activityFor(org).at(-1)!.outcome!.summary}</p>}</article>)}
        </>}
      </div>
      <PublicFooter active="organizations" onNavigate={onNavigate} />
    </main>
  );
}
