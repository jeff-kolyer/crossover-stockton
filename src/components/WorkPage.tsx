
import gapsData from "../data/gaps.json";
import orgsData from "../data/orgs.json";
import recordsData from "../data/records.json";
import workData from "../data/work.json";
import type { EvidenceRecord, GapRecord, OrgRecord, WorkRecord } from "../types";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { PublicSiteNav } from "./PublicSiteNav";
import { OrganizationCard } from "./OrganizationCard";
import { DogsResearchContent } from "./DogsResearchContent";
import { DogsInvestigationContent } from "./DogsInvestigationContent";
import { DogsPathwaysContent } from "./DogsPathwaysContent";
import { DogsSolutionsContent } from "./DogsSolutionsContent";
import { DogsLocationsMapPage } from "./DogsLocationsMapPage";
import { DogInvestigationMobileNav, DogInvestigationSidebar, type DogInvestigationPage } from "./DogInvestigationNav";
import investigationsData from "../data/dogs-investigations.json";
import { WorkSectionNav, type WorkSectionNavItem } from "./WorkSectionNav";
import { navigateInternalLink } from "../lib/internalLink";
import { ActivityLog } from "./ActivityLog";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";

interface WorkPageProps {
  workId?: string;
  onNavigate: (page: PublicRoute) => void;
  onOpenGap: (slug: string) => void;
  onOpenGapSection: (slug: string, section: Exclude<DogInvestigationPage, "locations-map">) => void;
  onOpenWork: (workId: string, anchor?: string) => void;
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
  { id: "investigation-questions", label: "Focus" },
  { id: "investigation-methods", label: "Approach" },
  { id: "field-observation-procedure", label: "Fieldwork" },
  { id: "investigation-contacts", label: "Contacts" },
  { id: "investigation-records-request", label: "Records request" },
  { id: "field-observation-map", label: "Map" },
  { id: "investigation-knowledge", label: "Evidence" },
  { id: "investigation-findings", label: "Findings" },
  { id: "investigation-outcomes", label: "Responses" },
  { id: "investigation-records", label: "Archive" },
];
const researchNavItems: WorkSectionNavItem[] = [
  { id: "research-whats-new", label: "What's New" },
  { id: "research-need", label: "The Need" },
  { id: "research-system", label: "System" },
  { id: "research-factors", label: "What's missing" },
  { id: "research-sources", label: "Sources" },
];
const pathwayNavItems: WorkSectionNavItem[] = [
  { id: "pathways-overview", label: "Overview" },
  { id: "pathways-reporting", label: "Report & response" },
  { id: "pathways-shelter", label: "Shelter & rescue" },
  { id: "pathways-volunteering", label: "Participation" },
  { id: "pathways-support", label: "Street care & prevention" },
  { id: "pathways-detail", label: "Investigation detail" },
];
const solutionNavItems: WorkSectionNavItem[] = [
  { id: "solutions-overview", label: "Overview" },
  { id: "solutions-improvements", label: "Tracked projects" },
  { id: "solutions-ideas", label: "Ideas to test" },
];
const activityNavItems: WorkSectionNavItem[] = [
  { id: "activity-progress", label: "Progress" },
  { id: "activity-organizations", label: "Contacts" },
  { id: "activity-questions", label: "Questions" },
];

export function WorkPage({ workId, onNavigate, onOpenGap, onOpenGapSection, onOpenWork, onOpenReport, onOpenAbout }: WorkPageProps) {
  useEffect(() => {
    const anchor = decodeURIComponent(window.location.hash.slice(1));
    if (workId === "dogs-map-placement-barriers" && anchor === "field-observation-map") {
      onOpenWork("dogs-locations-map", anchor);
      return;
    }
    if (anchor) requestAnimationFrame(() => {
      const target = document.getElementById(anchor);
      const detail = target?.closest("details");
      if (detail) detail.open = true;
      target?.scrollIntoView();
    });
  }, [workId, onOpenWork]);
  const item = works.find((work) => work.id === workId);
  const gap = item && gaps.find((candidate) => candidate.id === item.gap_id);
  const siblingWorks = gap ? (gap.id === "dogs-safe-placement" ? ["dogs-public-source-review", "dogs-map-placement-barriers", "dogs-solutions"] : (gap.work_ids ?? [])).map((id) => works.find((work) => work.id === id)).filter((work): work is WorkRecord => Boolean(work)) : [];
  const nextStep = item?.next_step ? (typeof item.next_step === "string" ? { title: "Next step", summary: item.next_step } : item.next_step) : undefined;
  const isWorkspace = item?.page_kind === "investigation" || item?.page_kind === "research" || item?.page_kind === "activity" || item?.page_kind === "solutions";
  const isResearch = item?.page_kind === "research";
  const isActivity = item?.page_kind === "activity";
  const isMap = item?.page_kind === "map";
  const openDogPage = (page: DogInvestigationPage) => page === "locations-map" ? onOpenWork("dogs-locations-map") : page === "overview" ? onOpenGap(gap!.slug) : onOpenGapSection(gap!.slug, page);
  const navItems = isResearch ? researchNavItems : isActivity ? activityNavItems : item?.page_kind === "solutions" ? solutionNavItems : item?.id === "dogs-map-placement-barriers" ? pathwayNavItems : investigationNavItems;

  return (
    <main className={`work-page gap-page${isMap ? " map-redesign dog-gap-page dog-map-gap-page" : ""}`}>
      <PublicNav onNavigate={onNavigate} onOpenAbout={onOpenAbout} />
      {isMap && item && gap ? (<>
        <DogInvestigationMobileNav active="locations-map" onSelect={openDogPage} />
        <div className="dog-gap-layout is-dog-redesign">
          <DogInvestigationSidebar active="locations-map" onSelect={openDogPage} onNeeds={() => onNavigate("reality")} />
          <div className="dog-gap-main"><DogsLocationsMapPage investigationId={investigationsData.active_investigations[0].id} onOpenReport={onOpenReport} /></div>
        </div>
      </>) : !item || !gap ? (
        <section className="work-page-shell"><button className="gap-history-back" type="button" onClick={() => onNavigate("reality")}> Back to needs</button><h1>Work item not found</h1><p>This work record may have moved or not been added to the public data yet.</p></section>
      ) : (
        <div className={isWorkspace ? "work-page-grid" : undefined}>
          {isWorkspace && <WorkSectionNav items={navItems} />}
          <div className={isWorkspace ? `work-page-main ${isResearch ? "research-page-main" : isActivity ? "activity-page-main" : "investigation-page-main"}` : undefined}>
          {!isMap && <section className="work-page-shell">
            <button className="gap-history-back" type="button" onClick={() => onOpenGap(gap.slug)}> {gap.title}</button>
            <nav className="work-switcher" aria-label="Work for this gap">
              {siblingWorks.map((work) => <a key={work.id} href={`/work/${work.id}/`} className={work.id === item.id ? "is-selected" : ""} aria-current={work.id === item.id ? "page" : undefined} onClick={(event) => navigateInternalLink(event, () => onOpenWork(work.id))}>{pageKindLabel(work)}</a>)}
            </nav>
            <div className="work-page-header gap-detail-copy">
              <span className="work-page-kicker">{pageKindLabel(item)}</span>
              <h1>{item.title}</h1>
              <p className="gap-mobile-body">{item.summary}</p>
              <div className="work-page-meta"><span className={`gap-work-status is-${item.status}`}>{item.page_kind === "research" && item.status === "in_progress" ? "Ongoing" : workStatusLabel(item.status)}</span>{item.page_kind === "research" && item.last_reviewed_at ? <span>Last reviewed {formatDate(item.last_reviewed_at)}</span> : item.updated_at && <span>Updated {formatDate(item.updated_at)}</span>}</div>
            </div>
            {nextStep && item.page_kind !== "investigation" && item.page_kind !== "research" && <section className="work-next-step"><strong>Next step: {nextStep.title}</strong>{nextStep.status === "planned" && <p className="gap-mobile-body"><strong>{nextStep.planned_for ? `Planned for ${formatLongDate(nextStep.planned_for)}` : "Planned — date to be confirmed"}</strong></p>}<p className="gap-mobile-body">{nextStep.summary}</p></section>}
          </section>}
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
  if (item.page_kind === "investigation") return item.id === "dogs-map-placement-barriers" ? <DogsPathwaysContent item={item} onOpenReport={onOpenReport} /> : <DogsInvestigationContent item={item} onOpenReport={onOpenReport} />;
  if (item.page_kind === "solutions") return <DogsSolutionsContent item={item} onOpenReport={onOpenReport} />;
  return <div className="work-page-content"><WorkSection id="activity-progress" title="Progress"><ActivityLog records={activity} onOpenReport={onOpenReport} /></WorkSection>{orgs.length > 0 && <WorkSection id="activity-organizations" title="Organizations contacted"><div className="organizations-grid">{orgs.map((org) => <OrganizationCard org={org} key={org.id} />)}</div></WorkSection>}{learning.length > 0 && <WorkSection title="Learning"><RecordList records={learning} /></WorkSection>}<Questions id="activity-questions" questions={item.open_questions} /></div>;
}

function WorkSection({ id, title, children }: { id?: string; title: string; children: ReactNode }) { return <section id={id} className="work-content-section gap-refined-card"><div className="work-content-heading"><h2>{title}</h2></div>{children}</section>; }
function Questions({ id, questions }: { id?: string; questions?: string[] }) { return questions?.length ? <section id={id} className="work-questions"><h2>Open questions</h2><ul>{questions.map((question) => <li key={question}>{question}</li>)}</ul></section> : null; }
function RecordList({ records: items, empty = "No records selected.", onOpenReport }: { records: EvidenceRecord[]; empty?: string; onOpenReport?: (id: string) => void }) { return items.length ? <div className="work-record-list">{items.map((record) => <article key={record.id}><div className="work-record-meta">{formatDate(record.published_at || record.checked_at || record.recorded_at)}<span>{record.record_type.replace(/_/g, " ")}</span></div><h3>{record.title}</h3><p className="gap-mobile-body">{record.summary}</p>{record.evidence_status && <small>Evidence label: {record.evidence_status.replace(/_/g, " ")}</small>}{record.record_type === "field_report" ? <a href={`/reports/${record.id}/`} onClick={(event) => { if (onOpenReport) { event.preventDefault(); onOpenReport(record.id); } }}>Read field report </a> : record.source.url ? <a href={record.source.url} target="_blank" rel="noreferrer">View source </a> : <small>Source: {record.source.publisher || record.source.type || "Internal record"}</small>}</article>)}</div> : <p className="work-empty gap-mobile-body">{empty}</p>; }
function pageKindLabel(item: WorkRecord) { return item.page_kind === "activity" ? "Journey" : item.page_kind === "investigation" ? "Pathways" : item.page_kind === "solutions" ? "Solutions" : item.page_kind === "map" ? "Map" : "Evidence"; }
function workStatusLabel(status: WorkRecord["status"]) { return status === "in_progress" ? "In progress" : status === "next" ? "Next" : "Completed"; }
function formatDate(value?: string | null) { if (!value) return "Undated"; const date = new Date(`${value.length === 10 ? `${value}T12:00:00` : value}`); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date); }
function formatLongDate(value?: string | null) { if (!value) return "Undated"; const date = new Date(`${value.length === 10 ? `${value}T12:00:00` : value}`); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(date); }

function PublicNav({ onNavigate, onOpenAbout }: { onNavigate: (page: PublicRoute) => void; onOpenAbout: () => void }) { return <PublicSiteNav active="reality" onNavigate={onNavigate} onOpenAbout={onOpenAbout} variant="dark" />; }
