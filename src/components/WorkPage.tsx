import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardList, FileText, MapPin, MessageCircle, Users } from "lucide-react";
import gapsData from "../data/gaps.json";
import orgsData from "../data/orgs.json";
import recordsData from "../data/records.json";
import workData from "../data/work.json";
import type { EvidenceRecord, GapRecord, OrgRecord, WorkRecord } from "../types";
import type { ReactNode } from "react";
import { PublicMobileMenu } from "./PublicMobileMenu";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";

interface WorkPageProps {
  workId?: string;
  onNavigate: (page: PublicRoute) => void;
  onOpenGap: (slug: string) => void;
  onOpenWork: (workId: string) => void;
  onOpenAbout: () => void;
}

const works = workData as WorkRecord[];
const gaps = gapsData as GapRecord[];
const records = recordsData as EvidenceRecord[];
const organizations = orgsData as OrgRecord[];
const logoLight = "/images/logo_light.webp";
const logoDark = "/images/logo_dark.webp";

export function WorkPage({ workId, onNavigate, onOpenGap, onOpenWork, onOpenAbout }: WorkPageProps) {
  const item = works.find((work) => work.id === workId);
  const gap = item && gaps.find((candidate) => candidate.id === item.gap_id);
  const siblingWorks = gap ? (gap.work_ids ?? []).map((id) => works.find((work) => work.id === id)).filter((work): work is WorkRecord => Boolean(work)) : [];
  const nextStep = item?.next_step ? (typeof item.next_step === "string" ? { title: "Next step", summary: item.next_step } : item.next_step) : undefined;

  return (
    <main className="work-page gap-page">
      <PublicNav onNavigate={onNavigate} onOpenAbout={onOpenAbout} />
      {!item || !gap ? (
        <section className="work-page-shell"><button className="gap-history-back" type="button" onClick={() => onNavigate("reality")}><ArrowLeft size={16} /> Back to needs</button><h1>Work item not found</h1><p>This work record may have moved or not been added to the public data yet.</p></section>
      ) : (
        <>
          <section className="work-page-shell">
            <button className="gap-history-back" type="button" onClick={() => onOpenGap(gap.slug)}><ArrowLeft size={16} /> {gap.title}</button>
            <nav className="work-switcher" aria-label="Work for this gap">
              {siblingWorks.map((work) => <button key={work.id} type="button" className={work.id === item.id ? "is-selected" : ""} aria-current={work.id === item.id ? "page" : undefined} onClick={() => onOpenWork(work.id)}>{pageKindLabel(work)}</button>)}
            </nav>
            <div className="work-page-header gap-detail-copy">
              <span className="work-page-kicker">{pageKindLabel(item)}</span>
              <h1>{item.title}</h1>
              <p className="gap-mobile-body">{item.summary}</p>
              <div className="work-page-meta"><span className={`gap-work-status is-${item.status}`}>{workStatusLabel(item.status)}</span>{item.updated_at && <span>Updated {formatDate(item.updated_at)}</span>}</div>
            </div>
            {nextStep && <section className="work-next-step"><strong>Next step: {nextStep.title}</strong><p className="gap-mobile-body">{nextStep.summary}</p></section>}
          </section>
          <WorkContent item={item} />
        </>
      )}
      <footer className="public-footer"><div className="footer-logo" aria-label="Crossover"><picture><source media="(max-width: 760px)" srcSet={logoDark} /><img src={logoLight} alt="" /></picture><span>Crossover</span></div><span>© 2026 Crossover Stockton</span><p>Reality. Connection. Action.</p><button type="button" onClick={() => onNavigate("reality")}>Needs</button><button type="button" onClick={() => onNavigate("action")}>Action</button><button type="button" onClick={onOpenAbout}>About</button></footer>
    </main>
  );
}

function WorkContent({ item }: { item: WorkRecord }) {
  const selected = (ids: string[] | undefined) => (ids ?? []).map((id) => records.find((record) => record.id === id)).filter((record): record is EvidenceRecord => Boolean(record));
  const evidence = selected(item.record_ids).filter((record) => record.record_type !== "finding" && record.record_type !== "activity");
  const learning = selected(item.learning_record_ids);
  const activity = selected(item.activity_record_ids);
  const orgs = (item.organization_ids ?? []).map((id) => organizations.find((org) => org.id === id)).filter((org): org is OrgRecord => Boolean(org));

  if (item.page_kind === "research") return <div className="work-page-content"><WorkSection title="Review records" icon={<FileText size={20} />}><RecordList records={evidence} /></WorkSection><Questions questions={item.open_questions} /></div>;
  if (item.page_kind === "investigation") return <div className="work-page-content"><WorkSection title="Initial map" icon={<MapPin size={20} />}><div className="work-map-note"><CheckCircle2 size={20} /><span className="gap-mobile-body">{item.initial_map?.summary}</span></div></WorkSection><WorkSection title="Barrier threads" icon={<MessageCircle size={20} />}><div className="work-thread-list">{(item.threads ?? []).map((thread) => <details key={thread.id}><summary>{thread.title}</summary><p className="gap-mobile-body">{thread.summary}</p><Questions questions={thread.open_questions} /><RecordList records={selected(thread.record_ids)} /></details>)}</div></WorkSection><WorkSection title="Learning" icon={<ClipboardList size={20} />}><RecordList records={learning} /></WorkSection><Questions questions={item.open_questions} /><EvidenceSection records={evidence} /></div>;
  return <div className="work-page-content"><WorkSection title="Progress" icon={<ClipboardList size={20} />}><ActivityTable records={activity} /></WorkSection>{orgs.length > 0 && <WorkSection title="Organizations contacted" icon={<Users size={20} />}><div className="work-org-list">{orgs.map((org) => <div key={org.id}><strong>{org.name}</strong><span className="gap-mobile-body">{org.summary}</span></div>)}</div></WorkSection>}{learning.length > 0 && <WorkSection title="Learning" icon={<MessageCircle size={20} />}><RecordList records={learning} /></WorkSection>}<Questions questions={item.open_questions} /></div>;
}

function WorkSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) { return <section className="work-content-section gap-refined-card"><div className="work-content-heading">{icon}<h2>{title}</h2></div>{children}</section>; }
function Questions({ questions }: { questions?: string[] }) { return questions?.length ? <section className="work-questions"><h2>Open questions</h2><ul>{questions.map((question) => <li key={question}>{question}</li>)}</ul></section> : null; }
function EvidenceSection({ records: evidence }: { records: EvidenceRecord[] }) { return evidence.length ? <WorkSection title="Evidence" icon={<FileText size={20} />}><RecordList records={evidence} /></WorkSection> : null; }
function RecordList({ records: items, empty = "No records selected." }: { records: EvidenceRecord[]; empty?: string }) { return items.length ? <div className="work-record-list">{items.map((record) => <article key={record.id}><div className="work-record-meta">{formatDate(record.published_at || record.checked_at || record.recorded_at)}<span>{record.record_type.replace(/_/g, " ")}</span></div><h3>{record.title}</h3><p className="gap-mobile-body">{record.summary}</p>{record.evidence_status && <small>Evidence label: {record.evidence_status.replace(/_/g, " ")}</small>}{record.source.url ? <a href={record.source.url} target="_blank" rel="noreferrer">View source <ArrowRight size={14} /></a> : <small>Source: {record.source.publisher || record.source.type || "Internal record"}</small>}</article>)}</div> : <p className="work-empty gap-mobile-body">{empty}</p>; }
function ActivityTable({ records: items }: { records: EvidenceRecord[] }) { return items.length ? <div className="work-activity-table"><div className="work-activity-row work-activity-head"><span>Date</span><span>What we did</span><span>What happened</span><span>Report</span></div>{items.map((record) => <div className="work-activity-row" key={record.id}><time>{formatDate(record.occurred_at)}</time><strong>{record.title}</strong><span>{record.outcome?.summary || record.summary}</span><span>{record.report_record_ids?.length ? record.report_record_ids.join(", ") : "—"}</span></div>)}</div> : <p className="work-empty">No activity recorded yet.</p>; }
function pageKindLabel(item: WorkRecord) { return item.page_kind === "activity" ? "Activity" : item.page_kind === "investigation" ? "Investigation" : "Research"; }
function workStatusLabel(status: WorkRecord["status"]) { return status === "in_progress" ? "In progress" : status === "next" ? "Next" : "Completed"; }
function formatDate(value?: string | null) { if (!value) return "Undated"; const date = new Date(`${value.length === 10 ? `${value}T12:00:00` : value}`); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date); }

function PublicNav({ onNavigate, onOpenAbout }: { onNavigate: (page: PublicRoute) => void; onOpenAbout: () => void }) { return <header className="public-nav gap-detail-nav"><PublicMobileMenu active="reality" onNavigate={onNavigate} onOpenAbout={onOpenAbout} /><button className="public-logo" type="button" aria-label="Crossover home" onClick={() => onNavigate("home")}><img src={logoLight} alt="" /><span>Crossover</span></button><nav aria-label="Primary"><button type="button" className="is-active" onClick={() => onNavigate("reality")}>Needs</button><button type="button" onClick={() => onNavigate("connection")}>Stories</button><button type="button" onClick={() => onNavigate("action")}>Action</button><button type="button" onClick={() => onNavigate("updates")}>Updates</button><button type="button" onClick={() => onNavigate("organizations")}>Organizations</button><button type="button" onClick={onOpenAbout}>About</button></nav><button className="location-pill" type="button" onClick={() => onNavigate("home")}>Stockton, CA</button></header>; }
