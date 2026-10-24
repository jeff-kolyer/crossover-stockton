import { ArrowLeft, ArrowRight, BarChart3, ChevronLeft, ChevronRight, Clock3, FileText, MapPin, Users } from "lucide-react";
import { useEffect, useState, type ComponentType } from "react";
import gapsData from "../data/gaps.json";
import projectsData from "../data/projects.json";
import gapsResearch from "../data/dogs-research.json";
import locations from "../data/investigation-locations.json";
import recordsData from "../data/records.json";
import workData from "../data/work.json";
import type { CapacityProject, EvidenceRecord, GapRecord, PublicActionRecord, WorkRecord } from "../types";
import { gapUpdates, gapUpdateHref } from "../lib/gapUpdates";
import { InvestigationStatusIcon, investigationStatusLabel } from "../lib/gapInvestigationStatus";
import { navigateInternalLink } from "../lib/internalLink";
import { DogCareScenario } from "./DogCareScenario";
import { DogsPathwaysContent } from "./DogsPathwaysContent";
import { DogsSolutionsContent } from "./DogsSolutionsContent";
import { DogsInvestigationContent } from "./DogsInvestigationContent";
import { DogsResearchContent } from "./DogsResearchContent";
import { GenericGapImprovements, GenericGapOverview, GenericGapResearchIntro, GenericGapWaysToHelp } from "./GenericGapSections";
import type { InvestigationLocation, MappedInvestigationLocation } from "./InvestigationLocations";
import "./DogGapOverview.css";
import "./DogGapExperience.css";

type Section = "overview" | "ways-to-help" | "improvements" | "our-findings" | "research" | "updates";
const tabs: { id: Section; label: string }[] = [
  { id: "overview", label: "Overview" }, { id: "ways-to-help", label: "Ways to Help" },
  { id: "improvements", label: "Improvements" }, { id: "our-findings", label: "Our Findings" },
  { id: "research", label: "Research" }, { id: "updates", label: "Updates" },
];
const sectionMenus = {
  overview: [
    { id: "summary", label: "Summary", Icon: FileText },
    { id: "system-model", label: "System model", Icon: BarChart3 },
    { id: "reported-locations", label: "Reported locations", Icon: MapPin },
  ],
  "ways-to-help": [
    { id: "pathways-overview", label: "How care is reached", Icon: FileText },
    { id: "pathways-reporting", label: "Report and response", Icon: MapPin },
    { id: "pathways-shelter", label: "Shelter care", Icon: Users },
    { id: "pathways-rescue", label: "Foster and rescue", Icon: Users },
    { id: "pathways-volunteering", label: "Volunteering", Icon: Users },
    { id: "pathways-adoption", label: "Adoption and reunification", Icon: FileText },
    { id: "pathways-support", label: "Street care and transport", Icon: MapPin },
    { id: "pathways-verification", label: "Veterinary care", Icon: FileText },
    { id: "pathways-detail", label: "Investigation detail", Icon: BarChart3 },
  ],
  improvements: [
    { id: "solutions-overview", label: "Summary", Icon: FileText },
    { id: "solutions-improvements", label: "Tracked improvements", Icon: BarChart3 },
    { id: "solutions-ideas", label: "Ideas to test", Icon: FileText },
  ],
  "our-findings": [
    { id: "investigation-questions", label: "Investigation questions", Icon: BarChart3 },
    { id: "investigation-methods", label: "How we'll verify", Icon: FileText },
    { id: "field-observation-procedure", label: "Field plan", Icon: MapPin },
    { id: "investigation-contacts", label: "Contacts", Icon: Users },
    { id: "investigation-records-request", label: "Records request", Icon: FileText },
    { id: "investigation-knowledge", label: "Evidence so far", Icon: FileText },
    { id: "investigation-findings", label: "Established findings", Icon: FileText },
    { id: "investigation-outcomes", label: "Potential responses", Icon: BarChart3 },
    { id: "investigation-records", label: "Investigation records", Icon: FileText },
  ],
  research: [
    { id: "research-at-a-glance", label: "At a glance", Icon: BarChart3 },
    { id: "research-whats-new", label: "What's new", Icon: Clock3 },
    { id: "research-need", label: "The need", Icon: FileText },
    { id: "research-system", label: "Current system", Icon: BarChart3 },
    { id: "research-factors", label: "Unknowns", Icon: FileText },
    { id: "research-improvements", label: "Improvements under review", Icon: BarChart3 },
    { id: "research-sources", label: "Research sources", Icon: FileText },
    { id: "sources-records", label: "Evidence records", Icon: BarChart3 },
    { id: "sources-additional", label: "Additional source", Icon: FileText },
  ],
  updates: [
    { id: "updates-intro", label: "About these updates", Icon: FileText },
    { id: "updates-list", label: "Activity timeline", Icon: Clock3 },
  ],
};
const genericSectionMenus = {
  overview: [
    { id: "summary", label: "Summary", Icon: FileText },
    { id: "system-model", label: "System model", Icon: BarChart3 },
    { id: "reported-evidence", label: "What is documented", Icon: FileText },
    { id: "related-records", label: "Detailed records", Icon: FileText },
  ],
  "ways-to-help": [
    { id: "ways-intro", label: "Ways to help", Icon: FileText },
    { id: "ways-actions", label: "Current options", Icon: Users },
    { id: "ways-organizations", label: "Organizations", Icon: Users },
  ],
  improvements: [
    { id: "improvements-intro", label: "Summary", Icon: FileText },
    { id: "improvements-projects", label: "Tracked projects", Icon: BarChart3 },
    { id: "improvements-barriers", label: "Barriers to address", Icon: FileText },
  ],
  research: [
    { id: "research-intro", label: "Research summary", Icon: FileText },
    { id: "sources-intro", label: "Source index", Icon: FileText },
    { id: "sources-records", label: "Evidence records", Icon: BarChart3 },
  ],
  updates: sectionMenus.updates,
};
const works = workData as WorkRecord[];
const records = recordsData as EvidenceRecord[];
const activeGaps = (gapsData as GapRecord[]).filter((item) => item.active).sort((a, b) => a.rank - b.rank);
const getWork = (id: string) => works.find((item) => item.id === id);
const fmt = (value?: string | null) => value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value.length === 10 ? `${value}T12:00:00` : value)) : "Date not recorded";
const intake = gapsResearch.measurements.find((item) => item.id === "sas-2024-dog-intake-stray")?.value.toLocaleString() ?? "—";
const mappedLocations = (locations as InvestigationLocation[]).filter((item): item is MappedInvestigationLocation => item.coordinates !== null);

function DogGapOverviewMap() {
  const [Map, setMap] = useState<ComponentType<{ locations: MappedInvestigationLocation[]; selectedId: string; onSelect: (id: string) => void; wheelZoom: boolean }> | null>(null);
  const [selectedId, setSelectedId] = useState(mappedLocations[0]?.id ?? "");
  const selected = mappedLocations.find((item) => item.id === selectedId);
  useEffect(() => {
    let active = true;
    import("./InvestigationLocationsMap").then(({ InvestigationLocationsMap }) => {
      if (active) setMap(() => InvestigationLocationsMap);
    });
    return () => { active = false; };
  }, []);
  return <div className="dog-gap-real-map" aria-label="Map of generalized historical and public report areas">
    {Map ? <Map locations={mappedLocations} selectedId={selectedId} onSelect={setSelectedId} wheelZoom={false} /> : <div className="dog-gap-map-loading" role="status">Loading map…</div>}
    <div className="dog-gap-map-caption"><strong>{selected?.name || "Stockton area"}</strong><span>{selected ? `${fmt(selected.evidence_date)} · ${selected.verification_status}` : "Generalized evidence areas"}</span><small>Historical and public reports; current animal locations are unknown.</small></div>
  </div>;
}

export function DogGapExperience({ gap, section, onOpenSection, onOpenGap, onNavigate, onOpenWork, onOpenReport, onOpenAction }: {
  gap: GapRecord; section: Section; onOpenSection: (section: Section) => void;
  onOpenGap: (slug: string) => void; onNavigate: (page: "reality") => void;
  onOpenWork: (id: string, anchor?: string) => void; onOpenReport: (id: string) => void;
  onOpenAction: (action: PublicActionRecord) => void;
}) {
  const isDogGap = gap.id === "dogs-safe-placement";
  const gapIndex = activeGaps.findIndex((item) => item.id === gap.id);
  const previousGap = gapIndex > 0 ? activeGaps[gapIndex - 1] : undefined;
  const nextGap = gapIndex >= 0 ? activeGaps[gapIndex + 1] : undefined;
  const hasProjects = (projectsData as CapacityProject[]).some((project) => project.gap_ids.includes(gap.id));
  const pageMenu = isDogGap ? sectionMenus[section] : section === "our-findings" ? genericSectionMenus.overview : genericSectionMenus[section].filter((item) => item.id !== "improvements-projects" || hasProjects);
  const updates = gapUpdates(gap);
  const latest = updates.find((item) => item.crossover && item.destination) || updates.find((item) => item.destination);
  const tabLink = (id: Section) => `/reality/${gap.slug}/${id === "overview" ? "" : `${id}/`}`;
  const localLink = (id: Section, label: string, className?: string) => <a className={className} href={tabLink(id)} onClick={(event) => navigateInternalLink(event, () => onOpenSection(id))}>{label} <ArrowRight size={16} aria-hidden="true" /></a>;
  const openUpdate = (update: typeof updates[number]) => {
    const destination = update.destination;
    if (destination?.kind === "work") onOpenWork(destination.id, destination.anchor);
    if (destination?.kind === "report") onOpenReport(destination.id);
  };
  const updateLink = (update: typeof updates[number]) => {
    const href = gapUpdateHref(update.destination);
    if (!href) return null;
    const internal = update.destination?.kind !== "external";
    return <a href={href} target={internal ? undefined : "_blank"} rel={internal ? undefined : "noreferrer"} onClick={internal ? (event) => navigateInternalLink(event, () => openUpdate(update)) : undefined}>{update.linkLabel || "View record"} <ArrowRight size={15} aria-hidden="true" /></a>;
  };

  return <div className="dog-gap-layout">
    <aside className="dog-gap-sidebar" aria-label="On this page">
      <div className="dog-gap-browse">
        <a href="/reality/" onClick={(event) => navigateInternalLink(event, () => onNavigate("reality"))}><ArrowLeft size={17} aria-hidden="true" /> Back to needs</a>
        <div><span>Browse needs · {gapIndex + 1} of {activeGaps.length}</span><div className="dog-gap-browse-controls"><a className={!previousGap ? "is-disabled" : undefined} href={previousGap ? `/reality/${previousGap.slug}/` : undefined} aria-disabled={!previousGap || undefined} onClick={previousGap ? (event) => navigateInternalLink(event, () => onOpenGap(previousGap.slug)) : undefined}><ChevronLeft size={16} /> Previous</a><a className={!nextGap ? "is-disabled" : undefined} href={nextGap ? `/reality/${nextGap.slug}/` : undefined} aria-disabled={!nextGap || undefined} onClick={nextGap ? (event) => navigateInternalLink(event, () => onOpenGap(nextGap.slug)) : undefined}>Next <ChevronRight size={16} /></a></div>{nextGap && <p>Next need<strong>{nextGap.title}</strong></p>}</div>
      </div>
      <span>On this page</span>
      {pageMenu.map(({ id, label, Icon }) => <a href={`#${id}`} key={id}><Icon size={19} aria-hidden="true" /> {label}</a>)}
    </aside>
    <div className="dog-gap-main">
      <section className="dog-gap-identity" aria-label="Current need">
        <div className="dog-gap-identity-copy">
          <span className="dog-gap-status investigation-status-pill"><InvestigationStatusIcon status={gap.investigation_status} size={14} />{investigationStatusLabel(gap.investigation_status)}</span>
          <h1>{isDogGap ? "Dogs on the street" : gap.title}</h1>
          <p className="dog-gap-deck">{isDogGap ? "Investigating how dogs reach care in Stockton, where that process breaks down, and what could improve it." : gap.summary}</p>
          <div className="dog-gap-meta"><span><FileText size={17} /> {gap.sources.length} sources</span><span><Users size={17} /> {gap.organization_ids.length} organizations</span>{gap.updated_at && <span><Clock3 size={17} /> Record updated {fmt(gap.updated_at)}</span>}</div>
        </div>
        {latest && <div className="dog-gap-latest"><span className="dog-gap-eyebrow">Latest activity</span><strong>{latest.title}</strong><p>{latest.summary}</p><time dateTime={latest.date}>{fmt(latest.date)}</time>{updateLink(latest)}</div>}
        {gap.artwork && <img className="dog-gap-photo" src={gap.artwork} alt={isDogGap ? "Dog related to the street dogs and access to care investigation" : gap.title} />}
      </section>
      <nav className="dog-gap-tabs" aria-label="Need sections">{tabs.filter((tab) => isDogGap || tab.id !== "our-findings").map((tab) => <a key={tab.id} href={tabLink(tab.id)} aria-current={section === tab.id ? "page" : undefined} onClick={(event) => navigateInternalLink(event, () => onOpenSection(tab.id))}>{tab.label}</a>)}</nav>
      {section === "overview" && !isDogGap && <GenericGapOverview gap={gap} onOpenWork={onOpenWork} />}
      {section === "overview" && isDogGap && <div className="dog-gap-overview">
        <section className="dog-gap-summary dog-gap-card" id="summary">
          <div><p className="dog-gap-eyebrow">Overview</p><h2>What is happening in Stockton?</h2><p>Public records establish substantial stray-dog intake, but do not tell us how many dogs currently need care, where they are, or what prevents them from reaching it.</p></div>
          <div className="dog-gap-kpis"><div><strong>{intake}</strong><b>Stray intakes</b><small>2024 · Animal Services multi-jurisdiction service area</small></div><div><strong>Unknown</strong><b>On streets now</b><small>No verified current census</small></div><div><strong>2</strong><b>Capacity projects</b><small>Shelter expansion and proposed Canine Campus · different stages</small></div></div>
        </section>
        <div className="dog-gap-model-wrap"><DogCareScenario heading="Understand the issue" compactHeader />{localLink("improvements", "Explore related improvements", "dog-gap-model-link")}</div>
        <section className="dog-gap-locations dog-gap-card" id="reported-locations">
          <div><p className="dog-gap-eyebrow">Reported locations</p><h2>Where dogs are being reported</h2><p>These dated, generalized public references help guide verification. They are not live dog locations or a count of dogs on the street.</p><ol>{locations.slice(0, 3).map((location) => <li key={location.id}><strong>{location.name}</strong><span>{fmt(location.evidence_date)} · {location.verification_status}</span></li>)}</ol><a href="/work/dogs-locations-map/" onClick={(event) => navigateInternalLink(event, () => onOpenWork("dogs-locations-map"))}>Open full map <ArrowRight size={16} /></a></div>
          <DogGapOverviewMap />
        </section>
        <section className="dog-gap-related dog-gap-card" aria-label="Detailed investigation records"><p className="dog-gap-eyebrow">Detailed records</p><div>{(gap.work_ids ?? []).map((id) => { const item = getWork(id); return item && <a key={id} href={`/work/${id}/`} onClick={(event) => navigateInternalLink(event, () => onOpenWork(id))}>{item.title} <ArrowRight size={15} /></a>; })}</div></section>
      </div>}
      {section === "ways-to-help" && !isDogGap && <GenericGapWaysToHelp gap={gap} onOpenAction={onOpenAction} />}
      {section === "ways-to-help" && isDogGap && <div className="dog-gap-tab-content"><div className="dog-gap-tab-heading"><p className="dog-gap-eyebrow">Pathways to care</p><h2>Ways to Help</h2><p>Explore documented routes to care and participation. Each record separates an advertised opportunity, an attempted route, and a confirmed outcome.</p></div>{getWork("dogs-map-placement-barriers") && <DogsPathwaysContent item={getWork("dogs-map-placement-barriers")!} onOpenReport={onOpenReport} />}</div>}
      {section === "improvements" && !isDogGap && <GenericGapImprovements gap={gap} />}
      {section === "improvements" && isDogGap && <div className="dog-gap-tab-content"><div className="dog-gap-tab-heading"><p className="dog-gap-eyebrow">Projects and proposals</p><h2>Improvements</h2><p>Project stages and possible effects come from the existing evidence records. Delivered capacity and impact remain unverified unless stated.</p></div>{getWork("dogs-solutions") && <DogsSolutionsContent item={getWork("dogs-solutions")!} onOpenReport={onOpenReport} />}</div>}
      {section === "our-findings" && isDogGap && <div className="dog-gap-tab-content">{getWork("dogs-map-placement-barriers") && <DogsInvestigationContent item={getWork("dogs-map-placement-barriers")!} onOpenReport={onOpenReport} includeMap={false} />}</div>}
      {section === "research" && <div className="dog-gap-tab-content">{isDogGap ? getWork("dogs-public-source-review") && <DogsResearchContent item={getWork("dogs-public-source-review")!} onOpenReport={onOpenReport} /> : <GenericGapResearchIntro gap={gap} />}<div className="dog-gap-tab-heading" id="sources-intro"><p className="dog-gap-eyebrow">Evidence index</p><h2>Source index</h2><p>Source dates and limitations remain attached to the underlying records.</p></div><div className="dog-gap-source-list" id="sources-records">{records.filter((record) => record.gap_ids.includes(gap.id) && record.source?.url).map((record) => <article className="dog-gap-card" key={record.id}><span>{record.record_type.replace(/_/g, " ")} · {fmt(record.published_at || record.checked_at)}</span><h3>{record.title}</h3><p>{record.summary}</p><small>{record.source.publisher || record.source.type} · {record.evidence_status?.replace(/_/g, " ") || "Evidence record"}</small><a href={record.source.url} target="_blank" rel="noreferrer">View source <ArrowRight size={15} /></a></article>)}{gap.sources.filter((source) => source.url && !records.some((record) => record.gap_ids.includes(gap.id) && record.source?.url === source.url)).map((source, index) => <article className="dog-gap-card" id={index === 0 ? "sources-additional" : undefined} key={source.url}><span>Gap source · Date not recorded</span><h3>{source.label || "Additional source"}</h3><p>This source is listed on the need record; no separate evidence record or verification date is available.</p><a href={source.url} target="_blank" rel="noreferrer">View source <ArrowRight size={15} /></a></article>)}</div></div>}
      {section === "updates" && <div className="dog-gap-tab-content"><div className="dog-gap-tab-heading" id="updates-intro"><p className="dog-gap-eyebrow">Need activity</p><h2>Updates</h2><p>Research, fieldwork, requests, announcements, and project milestones related to this need.</p></div><div className="dog-gap-update-list" id="updates-list">{updates.map((update) => <article className="dog-gap-card" key={update.id}><span>{update.typeLabel} · <time dateTime={update.date}>{fmt(update.date)}</time></span><h3>{update.title}</h3><p>{update.summary}</p>{updateLink(update)}</article>)}</div></div>}
    </div>
  </div>;
}
