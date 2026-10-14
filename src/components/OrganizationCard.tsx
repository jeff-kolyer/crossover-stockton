import { ArrowRight, Building2, HandHeart, Home, PawPrint, ShieldCheck } from "lucide-react";
import orgsData from "../data/orgs.json";
import recordsData from "../data/records.json";
import type { EvidenceRecord, OrgRecord } from "../types";

const trackedOrgs = (orgsData as OrgRecord[]).filter((org) => org.active && org.tracked !== false);
const icons = [PawPrint, HandHeart, ShieldCheck, Home, Building2];
const reports = (recordsData as EvidenceRecord[]).filter((record) => record.record_type === "field_report");

export function OrganizationCard({ org, onOpenReport }: { org: OrgRecord; onOpenReport?: (id: string) => void }) {
  const index = trackedOrgs.findIndex((item) => item.id === org.id);
  const Icon = icons[Math.max(0, index) % icons.length];
  const href = org.website || org.source_url;
  const orgReports = reports.filter((report) => report.organization_ids.includes(org.id)).sort((a, b) => (b.occurred_at ?? b.published_at ?? "").localeCompare(a.occurred_at ?? a.published_at ?? ""));

  return (
    <article className="organization-card">
      <Icon size={34} aria-hidden="true" />
      <div>
        <h3>{org.name}</h3>
        <p>{org.summary}</p>
        {href && (
          <a href={href} target="_blank" rel="noreferrer">
            Visit their website <ArrowRight size={15} aria-hidden="true" />
          </a>
        )}
        {orgReports.length > 0 && <div className="organization-field-reports"><strong>Field Reports</strong>{orgReports.map((report) => <a key={report.id} href={`/reports/${report.id}/`} onClick={(event) => { if (onOpenReport) { event.preventDefault(); onOpenReport(report.id); } }}>{report.title} <ArrowRight size={15} aria-hidden="true" /></a>)}</div>}
      </div>
    </article>
  );
}
