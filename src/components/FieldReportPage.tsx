
import gapsData from "../data/gaps.json";
import orgsData from "../data/orgs.json";
import recordsData from "../data/records.json";
import type { EvidenceRecord, GapRecord, OrgRecord } from "../types";
import { PublicSiteNav } from "./PublicSiteNav";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";

interface FieldReportPageProps {
  reportId?: string;
  onNavigate: (page: PublicRoute) => void;
  onOpenGap: (slug: string) => void;
  onOpenWork: (id: string) => void;
  onOpenInvestigationReports: () => void;
}

const reports = (recordsData as EvidenceRecord[]).filter((record) => record.record_type === "field_report");
const gaps = gapsData as GapRecord[];
const orgs = orgsData as OrgRecord[];
const logoLight = "/images/logo_light.webp";
const logoDark = "/images/logo_dark.webp";

export function FieldReportPage({ reportId, onNavigate, onOpenGap, onOpenWork, onOpenInvestigationReports }: FieldReportPageProps) {
  const report = reports.find((item) => item.id === reportId);
  const relatedGaps = (report?.gap_ids ?? []).map((id) => gaps.find((gap) => gap.id === id)).filter((gap): gap is GapRecord => Boolean(gap));
  const relatedOrgs = (report?.organization_ids ?? []).map((id) => orgs.find((org) => org.id === id)).filter((org): org is OrgRecord => Boolean(org));
  const visitWebsite = relatedOrgs.length === 1 ? relatedOrgs[0].website : undefined;

  return (
    <main className="work-page report-page gap-page">
      <PublicSiteNav active="reality" onNavigate={onNavigate} variant="dark" />

      <div className="work-page-shell report-shell">
        <button className="gap-history-back" type="button" onClick={() => relatedGaps.some((gap) => gap.id === "dogs-safe-placement") ? onOpenInvestigationReports() : report?.work_id ? onOpenWork(report.work_id) : onNavigate("reality")}> {relatedGaps.some((gap) => gap.id === "dogs-safe-placement") ? "Back to reports" : report?.work_id ? "Back to activity" : "Back to needs"}</button>
        {!report ? (
          <div className="work-page-header"><span className="work-page-kicker">Field report</span><h1>Field report not found</h1><p>This report ID does not match a published field report.</p></div>
        ) : (
          <>
            <div className="work-page-header gap-detail-copy">
              <span className="work-page-kicker">Field report</span>
              <h1>{report.title}</h1>
              <div className="report-meta"><time dateTime={report.occurred_at}>{formatDate(report.occurred_at)}</time>{report.location && <span>{report.location}</span>}</div>
              <p className="gap-mobile-body">{report.summary}</p>
            </div>
            {report.image && <figure className="report-figure"><div className="report-image-frame"><img src={report.image} alt={report.image_alt ?? ""} /></div>{report.image_caption && <figcaption>{report.image_caption}</figcaption>}</figure>}
            <div className="report-body">
              {report.sections?.map((section) => <section key={section.title}><h2>{section.title}</h2>{section.body.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}
            </div>
            {(report.visit_notes?.length || report.map_url) && <section className="work-content-section gap-refined-card report-visit" aria-labelledby="report-visit-title">
              <div className="work-content-heading"><h2 id="report-visit-title">Visiting {relatedOrgs.length === 1 ? relatedOrgs[0].name : report.location?.split(",")[0] ?? "this location"}</h2></div>
              {report.location && <p className="gap-mobile-body">{report.location}</p>}
              {report.visit_notes?.length ? <dl className="report-visit-notes">{report.visit_notes.map((note) => <div key={note.title}><dt>{note.title}</dt><dd>{note.body}</dd></div>)}</dl> : null}
              {(report.map_url || visitWebsite) && <div className="report-visit-links">{report.map_url && <a className="gap-history-back" href={report.map_url} target="_blank" rel="noreferrer">View location in OpenStreetMap </a>}{visitWebsite && <a className="gap-history-back" href={visitWebsite} target="_blank" rel="noreferrer">Shelter website </a>}</div>}
              <small className="report-visit-context">Firsthand visitor observations · {formatDate(report.occurred_at)}. Parking, entry procedures, and construction conditions may change.</small>
            </section>}
            <div className="report-related">
              <h2>Connected records</h2>
              {relatedOrgs.length > 0 && <div><strong>Organizations</strong>{relatedOrgs.map((org) => <button type="button" key={org.id} onClick={() => onNavigate("organizations")}>{org.name}</button>)}</div>}
              {relatedGaps.length > 0 && <div><strong>Needs</strong>{relatedGaps.map((gap) => <button type="button" key={gap.id} onClick={() => onOpenGap(gap.slug)}>{gap.title}</button>)}</div>}
              {report.work_id && <div><strong>Activity</strong><button type="button" onClick={() => onOpenWork(report.work_id!)}>Direct conversations and field visits</button></div>}
            </div>
            <p className="report-provenance">Source: {report.source.publisher ?? "Crossover Stockton"} · {report.evidence_status?.replace(/_/g, " ") ?? "firsthand account"}. Statements attributed to staff are reported from a brief conversation. {report.context_sources?.[0]?.url && <>Additional context: <a href={report.context_sources[0].url} target="_blank" rel="noreferrer">City shelter renovation plans</a>.</>}</p>
          </>
        )}
      </div>

      <footer className="public-footer"><div className="footer-logo" aria-label="Crossover"><picture><source media="(max-width: 760px)" srcSet={logoDark} /><img src={logoLight} alt="" /></picture><span>Crossover</span></div><span>© 2026 Crossover Stockton</span><p>Reality. Connection. Action.</p><button type="button" onClick={() => onNavigate("reality")}>Needs</button><button type="button" onClick={() => onNavigate("action")}>Action</button><button type="button" onClick={() => onNavigate("about")}>About</button></footer>
    </main>
  );
}

function formatDate(value?: string) {
  if (!value) return "Undated";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(year, month - 1, day));
}
