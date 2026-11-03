import uiCopy from "../data/pages/investigations/dogs/activity.json";

import gapsData from "../data/gaps.json";
import recordsData from "../data/records.json";
import type { EvidenceRecord, GapRecord } from "../types";
import { FieldReportContent, formatReportDate } from "./FieldReportContent";

const uiText = uiCopy.FieldReportPage;

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

export function FieldReportPage({ reportId, onNavigate, onOpenGap, onOpenWork, onOpenInvestigationReports }: FieldReportPageProps) {
  const report = reports.find((item) => item.id === reportId);
  const relatedGaps = (report?.gap_ids ?? []).map((id) => gaps.find((gap) => gap.id === id)).filter((gap): gap is GapRecord => Boolean(gap));

  return (
    <main className="work-page report-page gap-page">

      <div className="work-page-shell report-shell">
        <p><button className="gap-history-back" type="button" onClick={() => relatedGaps.some((gap) => gap.id === "dogs-safe-placement") ? onOpenInvestigationReports() : report?.work_id ? onOpenWork(report.work_id) : onNavigate("reality")}> {relatedGaps.some((gap) => gap.id === "dogs-safe-placement") ? uiText.backToReports : report?.work_id ? uiText.backToActivity : uiText.backToNeeds}</button></p>
        {!report ? (
          <div className="work-page-header"><span className="work-page-kicker">{uiText.fieldReport}</span><h1>{uiText.fieldReportNotFound}</h1><p>{uiText.thisReportIdDoesNotMatchA}</p></div>
        ) : (
          <>
            <div className="work-page-header gap-detail-copy">
              <span className="work-page-kicker">{uiText.fieldReport}</span>
              <h1>{report.title}</h1>
              <div className="report-meta"><time dateTime={report.occurred_at}>{formatReportDate(report.occurred_at)}</time>{report.location && <span>{report.location}</span>}</div>
              <p className="gap-mobile-body">{report.summary}</p>
            </div>
            <FieldReportContent report={report} publicNavigation={{ onOpenGap, onOpenWork }} />
          </>
        )}
      </div>

    </main>
  );
}
