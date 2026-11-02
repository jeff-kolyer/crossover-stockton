
import gapsData from "../data/gaps.json";
import recordsData from "../data/records.json";
import type { EvidenceRecord, GapRecord } from "../types";
import { FieldReportContent, formatReportDate } from "./FieldReportContent";
import { PublicSiteNav } from "./PublicSiteNav";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "investigation";

interface FieldReportPageProps {
  reportId?: string;
  onNavigate: (page: PublicRoute) => void;
  onOpenGap: (slug: string) => void;
  onOpenWork: (id: string) => void;
  onOpenInvestigationReports: () => void;
}

const reports = (recordsData as EvidenceRecord[]).filter((record) => record.record_type === "field_report");
const gaps = gapsData as GapRecord[];
const logoLight = "/images/logo_light.webp";
const logoDark = "/images/logo_dark.webp";

export function FieldReportPage({ reportId, onNavigate, onOpenGap, onOpenWork, onOpenInvestigationReports }: FieldReportPageProps) {
  const report = reports.find((item) => item.id === reportId);
  const relatedGaps = (report?.gap_ids ?? []).map((id) => gaps.find((gap) => gap.id === id)).filter((gap): gap is GapRecord => Boolean(gap));

  return (
    <main className="work-page report-page gap-page">
      <PublicSiteNav active="reality" onNavigate={onNavigate} variant="dark" />

      <div className="work-page-shell report-shell">
        <p><button className="gap-history-back" type="button" onClick={() => relatedGaps.some((gap) => gap.id === "dogs-safe-placement") ? onOpenInvestigationReports() : report?.work_id ? onOpenWork(report.work_id) : onNavigate("reality")}> {relatedGaps.some((gap) => gap.id === "dogs-safe-placement") ? "Back to reports" : report?.work_id ? "Back to activity" : "Back to needs"}</button></p>
        {!report ? (
          <div className="work-page-header"><span className="work-page-kicker">Field report</span><h1>Field report not found</h1><p>This report ID does not match a published field report.</p></div>
        ) : (
          <>
            <div className="work-page-header gap-detail-copy">
              <span className="work-page-kicker">Field report</span>
              <h1>{report.title}</h1>
              <div className="report-meta"><time dateTime={report.occurred_at}>{formatReportDate(report.occurred_at)}</time>{report.location && <span>{report.location}</span>}</div>
              <p className="gap-mobile-body">{report.summary}</p>
            </div>
            <FieldReportContent report={report} publicNavigation={{ onOpenGap, onOpenWork }} />
          </>
        )}
      </div>

      <footer className="public-footer"><div className="footer-logo" aria-label="Crossover"><picture><source media="(max-width: 760px)" srcSet={logoDark} /><img src={logoLight} alt="" /></picture><span>Crossover</span></div><span>© 2026 Crossover Stockton</span><p>Reality. Connection. Action.</p><button type="button" onClick={() => onNavigate("reality")}>Needs</button><button type="button" onClick={() => onNavigate("action")}>Action</button><button type="button" onClick={() => onNavigate("about")}>About</button></footer>
    </main>
  );
}
