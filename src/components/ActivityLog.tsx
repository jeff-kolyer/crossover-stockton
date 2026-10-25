import recordsData from "../data/records.json";
import type { EvidenceRecord } from "../types";

const records = recordsData as EvidenceRecord[];

function formatDate(value?: string | null) {
  if (!value) return "Undated";
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export function ActivityLog({ records: items, onOpenReport }: { records: EvidenceRecord[]; onOpenReport: (id: string) => void }) {
  if (!items.length) return <p className="work-empty">No activity recorded yet.</p>;

  return <div className="work-activity-table">
    <div className="work-activity-row work-activity-head"><span>Date</span><span>Activity</span><span>Status / outcome</span><span>Report</span></div>
    {items.map((record) => <div className="work-activity-row" id={record.id} key={record.id}>
      <time dateTime={record.planned_for || record.recorded_at || record.occurred_at}>{record.planned_for ? `Planned ${formatDate(record.planned_for)}` : record.outcome?.status === "planned" ? `Plan recorded ${formatDate(record.recorded_at)}` : formatDate(record.occurred_at)}</time>
      <strong>{record.title}</strong>
      <span>{record.outcome?.summary || record.summary}{record.planned_sites?.length ? <ul className="work-planned-sites">{record.planned_sites.map((site) => <li key={site.label}><strong>{site.label}:</strong> {site.reason} {site.condition}</li>)}</ul> : null}</span>
      <span>{record.report_record_ids?.length ? record.report_record_ids.map((id) => {
        const report = records.find((item) => item.id === id && item.record_type === "field_report");
        return report ? <a key={id} href={`/reports/${id}/`} onClick={(event) => { event.preventDefault(); onOpenReport(id); }}>{report.title}</a> : null;
      }) : "—"}</span>
    </div>)}
  </div>;
}
