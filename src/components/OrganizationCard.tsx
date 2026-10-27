
import orgsData from "../data/orgs.json";
import recordsData from "../data/records.json";
import type { EvidenceRecord, OrgRecord } from "../types";

const reports = (recordsData as EvidenceRecord[]).filter((record) => record.record_type === "field_report");
const evidenceById = new Map((recordsData as EvidenceRecord[]).map((record) => [record.id, record]));

export function OrganizationCard({ org, onOpenReport }: { org: OrgRecord; onOpenReport?: (id: string) => void }) {
  const href = org.website || org.source_url;
  const orgReports = reports.filter((report) => report.organization_ids.includes(org.id)).sort((a, b) => (b.occurred_at ?? b.published_at ?? "").localeCompare(a.occurred_at ?? a.published_at ?? ""));

  return (
    <article className="organization-card">
      
      <div>
        <h3>{org.name}</h3>
        <p><strong>Publicly described work:</strong> {org.summary}</p>
        <p>We check stated services against dated sources and firsthand evidence. A service that has not been directly verified is not a failed service.</p>
        {!org.verification && <p><strong>Crossover verification:</strong> Direct capability check not yet recorded.</p>}
        {org.verification && <div className="organization-field-reports"><strong>Verification · {org.verification.checked_at}</strong><span>{org.verification.direct_check}</span>{org.verification.evidence_record_ids.map((id) => { const record = evidenceById.get(id); return record?.source.url ? <a key={id} href={record.source.url} target="_blank" rel="noreferrer">{record.title} </a> : null; })}<strong>Still to check</strong>{org.verification.open_questions.map((question) => <span key={question}>{question}</span>)}</div>}
        {href && (
          <a href={href} target="_blank" rel="noreferrer">
            Visit their website 
          </a>
        )}
        {orgReports.length > 0 && <div className="organization-field-reports"><strong>Field Reports</strong>{orgReports.map((report) => <a key={report.id} href={`/reports/${report.id}/`} onClick={(event) => { if (onOpenReport) { event.preventDefault(); onOpenReport(report.id); } }}>{report.title} </a>)}</div>}
      </div>
    </article>
  );
}
