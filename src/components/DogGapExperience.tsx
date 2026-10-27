import { ArrowLeft, ArrowRight, BarChart3, Bell, ChevronDown, ChevronLeft, ChevronRight, Clock3, FileText, HeartHandshake, MapPin, Search, Users, Wrench, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ComponentType, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import gapsData from "../data/gaps.json";
import projectsData from "../data/projects.json";
import { activeCrossoverActions, dogStreetActionId } from "../data/crossoverActions";
import locations from "../data/investigation-locations.json";
import recordsData from "../data/records.json";
import workData from "../data/work.json";
import type { CapacityProject, EvidenceRecord, GapRecord, PublicActionRecord, WorkRecord } from "../types";
import { gapUpdates, gapUpdateHref } from "../lib/gapUpdates";
import { InvestigationStatusIcon, investigationStatusLabel } from "../lib/gapInvestigationStatus";
import { navigateInternalLink } from "../lib/internalLink";
import { DogCareScenario } from "./DogCareScenario";
import { DogGapOverviewLanding } from "./DogGapOverviewLanding";
import { CrossoverLocationDetails } from "./CrossoverLocationDetails";
import { PlainActionButton } from "./PlainActionButton";
import { DogsSolutionsContent } from "./DogsSolutionsContent";
import { DogsInvestigationContent } from "./DogsInvestigationContent";
import { DogsResearchContent } from "./DogsResearchContent";
import { GenericGapImprovements, GenericGapOverview, GenericGapResearchIntro, GenericGapWaysToHelp } from "./GenericGapSections";
import { KeyFactorsPage } from "./KeyFactorsPage";
import { InvestigationPageHeader } from "./InvestigationPageHeader";
import type { InvestigationLocation, MappedInvestigationLocation } from "./InvestigationLocations";
import "./DogGapOverview.css";
import "./DogGapExperience.css";
import "./DogGapLanding.css";
import "./ActionIndexPage.css";

type Section = "overview" | "reports" | "map" | "more" | "key-factors" | "ways-to-help" | "improvements" | "our-findings" | "research" | "updates";
const tabs: { id: Section; label: string; Icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", Icon: FileText }, { id: "key-factors", label: "Key Factors", Icon: BarChart3 },
  { id: "improvements", label: "Improvements", Icon: Wrench }, { id: "our-findings", label: "Our Findings", Icon: Search },
  { id: "ways-to-help", label: "Ways to Help", Icon: HeartHandshake }, { id: "research", label: "Sources", Icon: FileText }, { id: "updates", label: "Updates", Icon: Bell },
];
const sectionMenus = {
  overview: [
    { id: "summary", label: "Summary", Icon: FileText },
    { id: "system-model", label: "System model", Icon: BarChart3 },
    { id: "reported-locations", label: "Reported locations", Icon: MapPin },
  ],
  "key-factors": [
    { id: "key-factors-intro", label: "Key factors", Icon: FileText },
    { id: "system-model", label: "Care model", Icon: BarChart3 },
    { id: "key-factors-list", label: "Explore factors", Icon: BarChart3 },
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
    { id: "activity-log", label: "Activity log", Icon: Clock3 },
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
  "key-factors": sectionMenus["key-factors"].filter((item) => item.id !== "system-model"),
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
const mappedLocations = (locations as InvestigationLocation[]).filter((item): item is MappedInvestigationLocation => item.coordinates !== null);

function DogGapOverviewMap({ locations, selectedId, onSelect }: { locations: MappedInvestigationLocation[]; selectedId: string; onSelect: (id: string) => void }) {
  const [Map, setMap] = useState<ComponentType<{ locations: MappedInvestigationLocation[]; selectedId: string; onSelect: (id: string) => void; wheelZoom: boolean; preview?: boolean; followSelection?: boolean }> | null>(null);
  useEffect(() => {
    let active = true;
    import("./InvestigationLocationsMap").then(({ InvestigationLocationsMap }) => {
      if (active) setMap(() => InvestigationLocationsMap);
    });
    return () => { active = false; };
  }, []);
  return <div className="dog-gap-real-map" aria-label="Map of generalized historical and public report areas">
    {Map ? <Map locations={locations} selectedId={selectedId} onSelect={onSelect} wheelZoom={false} followSelection={false} /> : <div className="dog-gap-map-loading" role="status">Loading map…</div>}
  </div>;
}

export function DogGapExperience({ gap, section, onOpenSection, onOpenGap, onNavigate, onOpenWork, onOpenReport, onOpenAction, onOpenActionDetail }: {
  gap: GapRecord; section: Section; onOpenSection: (section: Section, anchor?: string) => void;
  onOpenGap: (slug: string) => void; onNavigate: (page: "home" | "reality" | "action" | "organizations") => void;
  onOpenWork: (id: string, anchor?: string) => void; onOpenReport: (id: string) => void;
  onOpenAction: (action: PublicActionRecord) => void;
  onOpenActionDetail: () => void;
}) {
  const [exploreOpen, setExploreOpen] = useState(false);
  const [pageMenuOpen, setPageMenuOpen] = useState(false);
  const [sheetState, setSheetState] = useState<"collapsed" | "partial" | "expanded">(section === "map" ? "collapsed" : "expanded");
  const [dragTop, setDragTop] = useState<number | null>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; startY: number; startTop: number; height: number } | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [locationFilter, setLocationFilter] = useState<"all" | InvestigationLocation["category"]>("all");
  const visibleLocations = useMemo(() => locationFilter === "all" ? mappedLocations : mappedLocations.filter((location) => location.category === locationFilter), [locationFilter]);
  const selectedLocation = mappedLocations.find((location) => location.id === selectedLocationId);
  const isDogGap = gap.id === "dogs-safe-placement";
  const gapIndex = activeGaps.findIndex((item) => item.id === gap.id);
  const previousGap = gapIndex > 0 ? activeGaps[gapIndex - 1] : undefined;
  const nextGap = gapIndex >= 0 ? activeGaps[gapIndex + 1] : undefined;
  const hasProjects = (projectsData as CapacityProject[]).some((project) => project.gap_ids.includes(gap.id));
  const pageMenu = isDogGap ? sectionMenus[section as keyof typeof sectionMenus] ?? sectionMenus.overview : section === "our-findings" ? genericSectionMenus.overview : (genericSectionMenus[section as keyof typeof genericSectionMenus] ?? genericSectionMenus.overview).filter((item) => item.id !== "improvements-projects" || hasProjects);
  const updates = gapUpdates(gap);
  const latest = updates.find((item) => item.crossover && item.destination) || updates.find((item) => item.destination);
  const tabLink = (id: Section) => `/reality/${gap.slug}/${id === "overview" ? "" : `${id}/`}`;
  const primaryTab = section === "reports" ? "reports" : section === "map" ? "map" : section === "overview" ? "overview" : "more";
  const openPrimary = (tab: "overview" | "reports" | "map" | "more") => { setSheetState(tab === "map" ? "collapsed" : "expanded"); onOpenSection(tab); };
  const selectLocation = (id: string) => {
    setSelectedLocationId(id);
    setSheetState("partial");
    sheetRef.current?.scrollTo({ top: 0 });
    if (section !== "map") onOpenSection("map");
  };
  const backToLocations = () => {
    setSelectedLocationId("");
    sheetRef.current?.scrollTo({ top: 0 });
  };
  const changeLocationFilter = (filter: typeof locationFilter) => {
    setLocationFilter(filter);
    setSelectedLocationId("");
  };
  const sheetPositions = ["expanded", "partial", "collapsed"] as const;
  function startSheetDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!window.matchMedia("(max-width: 760px)").matches) return;
    const workspace = workspaceRef.current;
    if (!workspace) return;
    const height = workspace.clientHeight;
    dragRef.current = { pointerId: event.pointerId, startY: event.clientY, startTop: event.currentTarget.parentElement!.getBoundingClientRect().top - workspace.getBoundingClientRect().top, height };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function moveSheetDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setDragTop(Math.max(0, Math.min(drag.height * .78, drag.startTop + event.clientY - drag.startY)));
  }
  function endSheetDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const top = Math.max(0, Math.min(drag.height * .78, drag.startTop + event.clientY - drag.startY));
    const snapTops = [0, drag.height * .42, drag.height * .78];
    const nearest = snapTops.reduce((best, value, index) => Math.abs(top - value) < Math.abs(top - snapTops[best]) ? index : best, 0);
    setSheetState(sheetPositions[nearest]);
    setDragTop(null);
    dragRef.current = null;
  }
  function moveSheetWithKeyboard(event: ReactKeyboardEvent<HTMLButtonElement>) {
    const index = sheetPositions.indexOf(sheetState);
    if (event.key === "ArrowUp") { event.preventDefault(); setSheetState(sheetPositions[Math.max(0, index - 1)]); }
    if (event.key === "ArrowDown") { event.preventDefault(); setSheetState(sheetPositions[Math.min(2, index + 1)]); }
    if (event.key === "Home") { event.preventDefault(); setSheetState("expanded"); }
    if (event.key === "End") { event.preventDefault(); setSheetState("collapsed"); }
  }
  const reportRecords = records.filter((record) => record.record_type === "field_report" && record.gap_ids.includes(gap.id));
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

  return <>
    {isDogGap && <div className="crossover-investigation-header">
      <div className="crossover-brand-row"><a href="/" onClick={(event) => navigateInternalLink(event, () => onNavigate("home"))}>CROSSOVER</a><a href="/about/">About</a></div>
      <h1>Dogs on the street in Stockton</h1><p>Investigating · Stockton, California</p>
      <nav className="crossover-primary-tabs" aria-label="Investigation sections">{(["overview", "reports", "map", "more"] as const).map((tab) => <a key={tab} href={tabLink(tab)} aria-current={primaryTab === tab ? "page" : undefined} onClick={(event) => navigateInternalLink(event, () => openPrimary(tab))}>{tab[0].toUpperCase() + tab.slice(1)}</a>)}</nav>
    </div>}
    <div ref={workspaceRef} className={`${isDogGap ? `crossover-map-workspace ${section === "map" ? "is-map-view" : "is-content-view"}` : ""} is-${sheetState}`}>
      {isDogGap && <div className="crossover-shared-map"><DogGapOverviewMap locations={visibleLocations} selectedId={selectedLocationId} onSelect={selectLocation} /></div>}
      <div ref={sheetRef} className="crossover-sheet" style={dragTop === null ? undefined : { top: dragTop }}>
        {isDogGap && <button type="button" className="crossover-sheet-grip" aria-label="Drag to resize investigation details; use up and down arrow keys to adjust" onPointerDown={startSheetDrag} onPointerMove={moveSheetDrag} onPointerUp={endSheetDrag} onPointerCancel={endSheetDrag} onKeyDown={moveSheetWithKeyboard}><span aria-hidden="true" /></button>}
    {!isDogGap && <div className="dog-gap-topbar">
      <a href="/reality/" onClick={(event) => navigateInternalLink(event, () => onNavigate("reality"))}><ArrowLeft size={18} aria-hidden="true" /> Back to needs</a>
      <nav className="dog-gap-topbar-switcher" aria-label="Gap navigation">
        <span>{gapIndex + 1} of {activeGaps.length}</span>
        <button type="button" aria-label="Previous gap" disabled={!previousGap} onClick={() => previousGap && onOpenGap(previousGap.slug)}><ChevronLeft size={22} aria-hidden="true" /></button>
        <button type="button" aria-label="Next gap" disabled={!nextGap} onClick={() => nextGap && onOpenGap(nextGap.slug)}><ChevronRight size={22} aria-hidden="true" /></button>
      </nav>
    </div>}
  <div className={`dog-gap-layout ${isDogGap ? "is-dog-redesign" : ""}`}>
    {!isDogGap && <aside className="dog-gap-sidebar" aria-label="On this page">
      <span>On this page</span>
      {pageMenu.map(({ id, label, Icon }) => <a href={`#${id}`} key={id}><Icon size={19} aria-hidden="true" /> {label}</a>)}
    </aside>}
    <div className="dog-gap-main">
      {!isDogGap && <section className="dog-gap-identity" aria-label="Current need">
        <div className="dog-gap-identity-copy"><span className="dog-gap-status investigation-status-pill"><InvestigationStatusIcon status={gap.investigation_status} size={14} />{investigationStatusLabel(gap.investigation_status)}</span><h1>{gap.title}</h1><p className="dog-gap-deck">{gap.summary}</p><div className="dog-gap-meta"><span><FileText size={17} /> {gap.sources.length} sources</span><span><Users size={17} /> {gap.organization_ids.length} organizations</span>{gap.updated_at && <span><Clock3 size={17} /> Record updated {fmt(gap.updated_at)}</span>}</div></div>
        {latest && <div className="dog-gap-latest"><span className="dog-gap-eyebrow">Latest activity</span><strong>{latest.title}</strong><p>{latest.summary}</p><time dateTime={latest.date}>{fmt(latest.date)}</time>{updateLink(latest)}</div>}
        {gap.artwork && <img className="dog-gap-photo" src={gap.artwork} alt={gap.title} />}
      </section>}
      {!isDogGap && <div className="dog-gap-mobile-menus">
        <div className="dog-gap-mobile-menu">
          <button type="button" aria-expanded={exploreOpen} aria-controls="dog-gap-explore-links" onClick={() => setExploreOpen((open) => !open)}><span>Explore the gap</span><span>{tabs.find((tab) => tab.id === section)?.label}<ChevronDown size={18} aria-hidden="true" /></span></button>
          <nav id="dog-gap-explore-links" aria-label="Explore the gap" hidden={!exploreOpen}>{tabs.filter((tab) => isDogGap || tab.id !== "our-findings").map((tab) => <a key={tab.id} href={tabLink(tab.id)} aria-current={section === tab.id ? "page" : undefined} onClick={(event) => navigateInternalLink(event, () => { setExploreOpen(false); onOpenSection(tab.id); })}>{tab.label}</a>)}</nav>
        </div>
        <div className="dog-gap-mobile-menu">
          <button type="button" aria-expanded={pageMenuOpen} aria-controls="dog-gap-page-links" onClick={() => setPageMenuOpen((open) => !open)}><span>On this page</span><span aria-hidden="true">{pageMenuOpen ? "−" : "+"}</span></button>
          <nav id="dog-gap-page-links" aria-label="On this page" hidden={!pageMenuOpen}>{pageMenu.map(({ id, label, Icon }) => <a href={`#${id}`} key={id} onClick={() => setPageMenuOpen(false)}><Icon size={18} aria-hidden="true" />{label}</a>)}</nav>
        </div>
      </div>}
      {!isDogGap && <nav className="dog-gap-tabs" aria-label="Need sections">{tabs.filter((tab) => isDogGap || tab.id !== "our-findings").map((tab) => <a key={tab.id} href={tabLink(tab.id)} aria-current={section === tab.id ? "page" : undefined} onClick={(event) => navigateInternalLink(event, () => onOpenSection(tab.id))}>{tab.label}</a>)}</nav>}
      {section === "overview" && !isDogGap && <GenericGapOverview gap={gap} onOpenWork={onOpenWork} onOpenKeyFactors={() => onOpenSection("key-factors")} />}
      {section === "overview" && isDogGap && <DogGapOverviewLanding gap={gap} map={null} onOpenSection={onOpenSection} onOpenWork={onOpenWork} onOpenActionDetail={onOpenActionDetail} onOpenActionIndex={() => onNavigate("action")} />}
      {section === "reports" && isDogGap && <div className="crossover-simple-section"><h2>Field reports</h2><p>Firsthand visits and observations from this investigation.</p><PlainActionButton onClick={onOpenActionDetail}>Explore field reporting</PlainActionButton><div className="crossover-report-list">{reportRecords.map((report) => <button type="button" key={report.id} onClick={() => onOpenReport(report.id)}><strong>{report.title}</strong><small>{fmt(report.occurred_at)} · {report.location || "Stockton"}</small><span>{report.summary}</span></button>)}</div></div>}
      {section === "map" && isDogGap && (selectedLocation
        ? <CrossoverLocationDetails location={selectedLocation} records={records} onBack={backToLocations} onOpenReport={onOpenReport} onOpenActionDetail={onOpenActionDetail} />
        : <div className="crossover-simple-section crossover-map-content"><h2>Reported locations</h2><p>Markers indicate generalized evidence areas. They do not show where dogs are now.</p><div className="crossover-map-filters" role="group" aria-label="Map evidence filters"><button type="button" aria-pressed={locationFilter === "all"} onClick={() => changeLocationFilter("all")}>All</button><button type="button" aria-pressed={locationFilter === "historical_published_report"} onClick={() => changeLocationFilter("historical_published_report")}>Historical</button><button type="button" aria-pressed={locationFilter === "recent_public_report"} onClick={() => changeLocationFilter("recent_public_report")}>Recent</button><button type="button" aria-pressed={locationFilter === "official_animal_services_record"} onClick={() => changeLocationFilter("official_animal_services_record")}>Official</button><button type="button" aria-pressed={locationFilter === "crossover_firsthand"} onClick={() => changeLocationFilter("crossover_firsthand")}>Firsthand</button></div><div className="crossover-location-list">{visibleLocations.map((location) => <button type="button" key={location.id} onClick={() => selectLocation(location.id)}><strong>{location.name}</strong><small>{fmt(location.evidence_date)} · {location.verification_status}</small></button>)}</div></div>)}
      {section === "more" && isDogGap && <div className="crossover-simple-section"><h2>Explore the investigation</h2><div className="crossover-more-list"><button type="button" onClick={() => onNavigate("organizations")}>Organizations <ArrowRight size={16} /></button><button type="button" onClick={() => onOpenSection("ways-to-help")}>Pathways to care <ArrowRight size={16} /></button><button type="button" onClick={() => onOpenSection("improvements")}>Improvements <ArrowRight size={16} /></button><button type="button" onClick={() => onOpenSection("key-factors")}>System model <ArrowRight size={16} /></button><button type="button" onClick={() => onOpenSection("our-findings")}>Findings <ArrowRight size={16} /></button><button type="button" onClick={() => onOpenSection("research")}>Sources <ArrowRight size={16} /></button><button type="button" onClick={() => onOpenSection("updates")}>Updates <ArrowRight size={16} /></button></div></div>}
      {section === "key-factors" && <KeyFactorsPage gap={gap} onOpenSection={onOpenSection} onOpenMap={() => onOpenWork("dogs-locations-map")} model={isDogGap ? <DogCareScenario heading="Explore the full care model" factorHref={(key) => `#factor-${key}`} onOpenFactor={(key) => onOpenSection("key-factors", `factor-${key}`)} improvementHref={(id) => `${tabLink("improvements")}#${id}`} onOpenImprovement={(id) => onOpenSection("improvements", id)} /> : undefined} />}
      {section === "ways-to-help" && !isDogGap && <GenericGapWaysToHelp gap={gap} onOpenAction={onOpenAction} />}
      {section === "ways-to-help" && isDogGap && <div className="dog-gap-tab-content dog-gap-participation">
        <div className="dog-gap-tab-heading"><p className="dog-gap-eyebrow">Crossover actions</p><h2>Show Up With Us</h2><p>We're investigating how dogs reach care in Stockton by showing up, testing available pathways, and documenting what happens. Here's how you can participate.</p></div>
        <div className="dog-gap-participation-list">{activeCrossoverActions.map((action) => <article className="action-index-feature dog-gap-participation-card" key={action.id}>
          <img className="action-index-image" src={action.image.src} alt={action.image.alt} width={action.image.width} height={action.image.height} decoding="async" />
          <div className="action-index-feature-copy">
            <div><h3>{action.title}</h3><p>{action.summary}</p></div>
            <dl className="action-index-status" aria-label="Fieldwork status">{action.status.map(({ value, label }) => <div className="action-index-status-item" key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
            <a className="action-index-button" href={action.href} onClick={action.id === dogStreetActionId ? (event) => navigateInternalLink(event, onOpenActionDetail) : undefined}>{action.buttonLabel} <ArrowRight size={19} aria-hidden="true" /></a>
          </div>
        </article>)}</div>
      </div>}
      {section === "improvements" && !isDogGap && <GenericGapImprovements gap={gap} />}
      {section === "improvements" && isDogGap && <div className="dog-gap-tab-content is-investigation-subpage"><InvestigationPageHeader title="Improvements" description="Project stages and possible effects come from the existing evidence records. Delivered capacity and impact remain unverified unless stated." />{getWork("dogs-solutions") && <DogsSolutionsContent item={getWork("dogs-solutions")!} onOpenReport={onOpenReport} />}</div>}
      {section === "our-findings" && isDogGap && <div className="dog-gap-tab-content is-investigation-subpage"><InvestigationPageHeader title="Our Findings" description="Review published evidence, Crossover's firsthand checks, and questions still under investigation." />{getWork("dogs-map-placement-barriers") && <DogsInvestigationContent item={getWork("dogs-map-placement-barriers")!} onOpenReport={onOpenReport} includeMap={false} />}</div>}
      {section === "research" && <div className={`dog-gap-tab-content${isDogGap ? " is-investigation-subpage" : ""}`}>{isDogGap && <InvestigationPageHeader title="Sources" description="Explore the public records and source material behind this investigation." />}{isDogGap ? getWork("dogs-public-source-review") && <DogsResearchContent item={getWork("dogs-public-source-review")!} onOpenReport={onOpenReport} /> : <GenericGapResearchIntro gap={gap} />}<div className="dog-gap-tab-heading" id="sources-intro"><p className="dog-gap-eyebrow">Evidence index</p><h2>Source index</h2><p>Source dates and limitations remain attached to the underlying records.</p></div><div className="dog-gap-source-list" id="sources-records">{records.filter((record) => record.gap_ids.includes(gap.id) && record.source?.url).map((record) => <article className="dog-gap-card" key={record.id}><span>{record.record_type.replace(/_/g, " ")} · {fmt(record.published_at || record.checked_at)}</span><h3>{record.title}</h3><p>{record.summary}</p><small>{record.source.publisher || record.source.type} · {record.evidence_status?.replace(/_/g, " ") || "Evidence record"}</small><a href={record.source.url} target="_blank" rel="noreferrer">View source <ArrowRight size={15} /></a></article>)}{gap.sources.filter((source) => source.url && !records.some((record) => record.gap_ids.includes(gap.id) && record.source?.url === source.url)).map((source, index) => <article className="dog-gap-card" id={index === 0 ? "sources-additional" : undefined} key={source.url}><span>Gap source · Date not recorded</span><h3>{source.label || "Additional source"}</h3><p>This source is listed on the need record; no separate evidence record or verification date is available.</p><a href={source.url} target="_blank" rel="noreferrer">View source <ArrowRight size={15} /></a></article>)}</div></div>}
      {section === "updates" && <div className={`dog-gap-tab-content${isDogGap ? " is-investigation-subpage" : ""}`}>{isDogGap ? <InvestigationPageHeader id="updates-intro" title="Updates" description="Research, fieldwork, requests, announcements, and project milestones related to this need." /> : <div className="dog-gap-tab-heading" id="updates-intro"><p className="dog-gap-eyebrow">Need activity</p><h2>Updates</h2><p>Research, fieldwork, requests, announcements, and project milestones related to this need.</p></div>}<div className="dog-gap-update-list" id="updates-list">{updates.map((update) => <article className="dog-gap-card" key={update.id}><span>{update.typeLabel} · <time dateTime={update.date}>{fmt(update.date)}</time></span><h3>{update.title}</h3><p>{update.summary}</p>{updateLink(update)}</article>)}</div></div>}
    </div>
  </div></div></div></>;
}
