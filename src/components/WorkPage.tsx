import { ArrowLeft, ArrowRight, ChartNoAxesColumnIncreasing, CheckCircle2, ChevronDown, ClipboardList, FileText, HardHat, ListFilter, MapPin, MessageCircle, Network, Route, Search, Sparkles, Users } from "lucide-react";
import gapsData from "../data/gaps.json";
import orgsData from "../data/orgs.json";
import recordsData from "../data/records.json";
import workData from "../data/work.json";
import type { EvidenceRecord, GapRecord, OrgRecord, WorkRecord } from "../types";
import type { ReactNode } from "react";
import { PublicMobileMenu } from "./PublicMobileMenu";
import { OrganizationCard } from "./OrganizationCard";
import { DogsResearchContent } from "./DogsResearchContent";
import { DogsInvestigationContent } from "./DogsInvestigationContent";
import { WorkSectionNav, type WorkSectionNavItem } from "./WorkSectionNav";
import { navigateInternalLink } from "../lib/internalLink";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";

interface WorkPageProps {
  workId?: string;
  onNavigate: (page: PublicRoute) => void;
  onOpenGap: (slug: string) => void;
  onOpenWork: (workId: string) => void;
  onOpenReport: (reportId: string) => void;
  onOpenAbout: () => void;
}

const works = workData as WorkRecord[];
const gaps = gapsData as GapRecord[];
const records = recordsData as EvidenceRecord[];
const organizations = orgsData as OrgRecord[];
const logoLight = "/images/logo_light.webp";
const logoDark = "/images/logo_dark.webp";
const investigationNavItems: WorkSectionNavItem[] = [
  { id: "investigation-questions", label: "Focus", icon: Search },
  { id: "field-observation-map", label: "Map", icon: MapPin },
  { id: "investigation-methods", label: "Method", icon: ListFilter },
  { id: "investigation-knowledge", label: "Evidence", icon: ChartNoAxesColumnIncreasing },
  { id: "investigation-outcomes", label: "Outcomes", icon: Route },
  { id: "investigation-findings", label: "Findings", icon: CheckCircle2 },
  { id: "investigation-records", label: "Records", icon: FileText },
];
const researchNavItems: WorkSectionNavItem[] = [
  { id: "research-whats-new", label: "What's New", icon: Sparkles },
  { id: "research-need", label: "The Need", icon: ChartNoAxesColumnIncreasing },
  { id: "research-system", label: "System", icon: Network },
  { id: "research-improvements", label: "Improvements", icon: HardHat },
  { id: "research-sources", label: "Sources", icon: FileText },
];
const activityNavItems: WorkSectionNavItem[] = [
  { id: "activity-progress", label: "Progress", icon: ClipboardList },
  { id: "activity-organizations", label: "Contacts", icon: Users },
  { id: "activity-questions", label: "Questions", icon: Search },
];

export function WorkPage({ workId, onNavigate, onOpenGap, onOpenWork, onOpenReport, onOpenAbout }: WorkPageProps) {
  const item = works.find((work) => work.id === workId);
  const gap = item && gaps.find((candidate) => candidate.id === item.gap_id);
  const siblingWorks = gap ? (gap.work_ids ?? []).map((id) => works.find((work) => work.id === id)).filter((work): work is WorkRecord => Boolean(work)) : [];
  const nextStep = item?.next_step ? (typeof item.next_step === "string" ? { title: "Next step", summary: item.next_step } : item.next_step) : undefined;
  const isWorkspace = item?.page_kind === "investigation" || item?.page_kind === "research" || item?.page_kind === "activity";
  const isResearch = item?.page_kind === "research";
  const isActivity = item?.page_kind === "activity";

  return (
    <main className="work-page gap-page">
      <PublicNav onNavigate={onNavigate} onOpenAbout={onOpenAbout} />
      {!item || !gap ? (
        <section className="work-page-shell"><button className="gap-history-back" type="button" onClick={() => onNavigate("reality")}><ArrowLeft size={16} /> Back to needs</button><h1>Work item not found</h1><p>This work record may have moved or not been added to the public data yet.</p></section>
      ) : (
        <div className={isWorkspace ? "work-page-grid" : undefined}>
          {isWorkspace && <WorkSectionNav items={isResearch ? researchNavItems : isActivity ? activityNavItems : investigationNavItems} />}
          <div className={isWorkspace ? `work-page-main ${isResearch ? "research-page-main" : isActivity ? "activity-page-main" : "investigation-page-main"}` : undefined}>
          <section className="work-page-shell">
            <button className="gap-history-back" type="button" onClick={() => onOpenGap(gap.slug)}><ArrowLeft size={16} /> {gap.title}</button>
            <nav className="work-switcher" aria-label="Work for this gap">
              {siblingWorks.map((work) => <a key={work.id} href={`/work/${work.id}/`} className={work.id === item.id ? "is-selected" : ""} aria-current={work.id === item.id ? "page" : undefined} onClick={(event) => navigateInternalLink(event, () => onOpenWork(work.id))}>{pageKindLabel(work)}</a>)}
            </nav>
            <div className="work-page-header gap-detail-copy">
              <span className="work-page-kicker">{pageKindLabel(item)}</span>
              <h1>{item.title}</h1>
              <p className="gap-mobile-body">{item.summary}</p>
              <div className="work-page-meta"><span className={`gap-work-status is-${item.status}`}>{item.page_kind === "research" && item.status === "in_progress" ? "Ongoing" : workStatusLabel(item.status)}</span>{item.page_kind === "research" && item.last_reviewed_at ? <span>Last reviewed {formatDate(item.last_reviewed_at)}</span> : item.updated_at && <span>Updated {formatDate(item.updated_at)}</span>}</div>
            </div>
            {nextStep && <section className="work-next-step"><strong>Next step: {nextStep.title}</strong><p className="gap-mobile-body">{nextStep.summary}</p></section>}
          </section>
          <WorkContent item={item} onOpenReport={onOpenReport} />
          </div>
        </div>
      )}
      <footer className="public-footer"><div className="footer-logo" aria-label="Crossover"><picture><source media="(max-width: 760px)" srcSet={logoDark} /><img src={logoLight} alt="" /></picture><span>Crossover</span></div><span>© 2026 Crossover Stockton</span><p>Reality. Connection. Action.</p><button type="button" onClick={() => onNavigate("reality")}>Needs</button><button type="button" onClick={() => onNavigate("action")}>Action</button><button type="button" onClick={onOpenAbout}>About</button></footer>
    </main>
  );
}

function WorkContent({ item, onOpenReport }: { item: WorkRecord; onOpenReport: (id: string) => void }) {
  const selected = (ids: string[] | undefined) => (ids ?? []).map((id) => records.find((record) => record.id === id)).filter((record): record is EvidenceRecord => Boolean(record));
  const learning = selected(item.learning_record_ids);
  const activity = selected(item.activity_record_ids);
  const orgs = (item.organization_ids ?? []).map((id) => organizations.find((org) => org.id === id)).filter((org): org is OrgRecord => Boolean(org));

  if (item.page_kind === "research") return <DogsResearchContent item={item} onOpenReport={onOpenReport} />;
  if (item.page_kind === "investigation") return <DogsInvestigationContent item={item} onOpenReport={onOpenReport} />;
  return <div className="work-page-content"><WorkSection id="activity-progress" title="Progress" icon={<ClipboardList size={20} />}><ActivityTable records={activity} onOpenReport={onOpenReport} /></WorkSection>{orgs.length > 0 && <WorkSection id="activity-organizations" title="Organizations contacted" icon={<Users size={20} />}><div className="organizations-grid">{orgs.map((org) => <OrganizationCard org={org} key={org.id} />)}</div></WorkSection>}{learning.length > 0 && <WorkSection title="Learning" icon={<MessageCircle size={20} />}><RecordList records={learning} /></WorkSection>}<Questions id="activity-questions" questions={item.open_questions} /></div>;
}

function WorkSection({ id, title, icon, children }: { id?: string; title: string; icon: ReactNode; children: ReactNode }) { return <section id={id} className="work-content-section gap-refined-card"><div className="work-content-heading">{icon}<h2>{title}</h2></div>{children}</section>; }
function Questions({ id, questions }: { id?: string; questions?: string[] }) { return questions?.length ? <section id={id} className="work-questions"><h2>Open questions</h2><ul>{questions.map((question) => <li key={question}>{question}</li>)}</ul></section> : null; }
function RecordList({ records: items, empty = "No records selected.", onOpenReport }: { records: EvidenceRecord[]; empty?: string; onOpenReport?: (id: string) => void }) { return items.length ? <div className="work-record-list">{items.map((record) => <article key={record.id}><div className="work-record-meta">{formatDate(record.published_at || record.checked_at || record.recorded_at)}<span>{record.record_type.replace(/_/g, " ")}</span></div><h3>{record.title}</h3><p className="gap-mobile-body">{record.summary}</p>{record.evidence_status && <small>Evidence label: {record.evidence_status.replace(/_/g, " ")}</small>}{record.record_type === "field_report" ? <a href={`/reports/${record.id}/`} onClick={(event) => { if (onOpenReport) { event.preventDefault(); onOpenReport(record.id); } }}>Read field report <ArrowRight size={14} /></a> : record.source.url ? <a href={record.source.url} target="_blank" rel="noreferrer">View source <ArrowRight size={14} /></a> : <small>Source: {record.source.publisher || record.source.type || "Internal record"}</small>}</article>)}</div> : <p className="work-empty gap-mobile-body">{empty}</p>; }
function ActivityTable({ records: items, onOpenReport }: { records: EvidenceRecord[]; onOpenReport: (id: string) => void }) { return items.length ? <div className="work-activity-table"><div className="work-activity-row work-activity-head"><span>Date</span><span>What we did</span><span>What happened</span><span>Report</span></div>{items.map((record) => <div className="work-activity-row" key={record.id}><time>{formatDate(record.occurred_at)}</time><strong>{record.title}</strong><span>{record.outcome?.summary || record.summary}</span><span>{record.report_record_ids?.length ? record.report_record_ids.map((id) => { const report = records.find((item) => item.id === id && item.record_type === "field_report"); return report ? <a key={id} href={`/reports/${id}/`} onClick={(event) => { event.preventDefault(); onOpenReport(id); }}>{report.title}</a> : null; }) : "—"}</span></div>)}</div> : <p className="work-empty">No activity recorded yet.</p>; }
function pageKindLabel(item: WorkRecord) { return item.page_kind === "activity" ? "Activity" : item.page_kind === "investigation" ? "Investigation" : "Research"; }
function workStatusLabel(status: WorkRecord["status"]) { return status === "in_progress" ? "In progress" : status === "next" ? "Next" : "Completed"; }
function formatDate(value?: string | null) { if (!value) return "Undated"; const date = new Date(`${value.length === 10 ? `${value}T12:00:00` : value}`); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date); }

function PublicNav({ onNavigate, onOpenAbout }: { onNavigate: (page: PublicRoute) => void; onOpenAbout: () => void }) { return <header className="public-nav gap-detail-nav"><PublicMobileMenu active="reality" onNavigate={onNavigate} onOpenAbout={onOpenAbout} /><button className="public-logo" type="button" aria-label="Crossover home" onClick={() => onNavigate("home")}><img src={logoLight} alt="" /><span>Crossover</span></button><nav aria-label="Primary"><button type="button" className="is-active" onClick={() => onNavigate("reality")}>Needs</button><button type="button" onClick={() => onNavigate("connection")}>Stories</button><button type="button" onClick={() => onNavigate("action")}>Action</button><button type="button" onClick={() => onNavigate("updates")}>Updates</button><button type="button" onClick={() => onNavigate("organizations")}>Organizations</button><button type="button" onClick={onOpenAbout}>About</button></nav><button className="location-pill" type="button" onClick={() => onNavigate("home")}><MapPin size={16} />Stockton, CA<ChevronDown size={15} /></button></header>; }
