
import { useEffect, useMemo, useRef, useState, type ComponentType, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import "../styles/map.css";
import "../styles/activity.css";
import gapsData from "../data/gaps.json";
import projectsData from "../data/projects.json";
import orgsData from "../data/orgs.json";
import { activeCrossoverActions, dogStreetActionId } from "../data/crossoverActions";
import locations from "../data/investigation-locations.json";
import recordsData from "../data/records.json";
import workData from "../data/work.json";
import type { CapacityProject, EvidenceRecord, GapRecord, OrgRecord, PublicActionRecord, WorkRecord } from "../types";
import { gapUpdates, gapUpdateHref } from "../lib/gapUpdates";
import { evidenceCategoryColors } from "../lib/evidenceCategoryColors";
import { investigationStatusLabel } from "../lib/gapInvestigationStatus";
import { navigateInternalLink } from "../lib/internalLink";
import { activeInvestigations, investigationActivities, investigationFindings, investigationQuestionById, investigationRecordById, investigationTasks } from "../lib/investigationData";
import { articleForPath, publishedArticles } from "../lib/articles";
import { orderInvestigationTasks, taskPriorityContext } from "../lib/taskListPriorities";
import type { InvestigationTask } from "../types/investigation";
import { DogCareScenario } from "./DogCareScenario";
import { DogGapOverviewLanding } from "./DogGapOverviewLanding";
import { CrossoverLocationDetails } from "./CrossoverLocationDetails";
import { CloseDetailButton, PlainActionButton } from "./PlainActionButton";
import { DogsSolutionsContent } from "./DogsSolutionsContent";
import { DogsInvestigationContent } from "./DogsInvestigationContent";
import { DogsResearchContent } from "./DogsResearchContent";
import { GenericGapImprovements, GenericGapOverview, GenericGapResearchIntro, GenericGapWaysToHelp } from "./GenericGapSections";
import { KeyFactorsPage } from "./KeyFactorsPage";
import { InvestigationPageHeader } from "./InvestigationPageHeader";
import { ArticleContent } from "./ArticlePages";
import { WorkspacePage, WorkspaceSection } from "./WorkspacePage";
import type { InvestigationLocation, MappedInvestigationLocation } from "./InvestigationLocations";

type Section = "overview" | "tasks" | "activity" | "reports" | "map" | "findings" | "more" | "key-factors" | "ways-to-help" | "improvements" | "our-findings" | "research" | "updates";
type TaskFilter = "open" | "waiting" | "done" | "all";
const taskStatusColors = {
  open: evidenceCategoryColors.crossover_firsthand,
  waiting: evidenceCategoryColors.recent_public_report,
  done: evidenceCategoryColors.historical_published_report,
} as const;
const tabs: { id: Section; label: string }[] = [
  { id: "overview", label: "Overview" }, { id: "key-factors", label: "Key Factors" },
  { id: "improvements", label: "Improvements" }, { id: "our-findings", label: "Our Findings" },
  { id: "ways-to-help", label: "Ways to Help" }, { id: "research", label: "Sources" }, { id: "updates", label: "Updates" },
];
const sectionMenus = {
  overview: [
    { id: "summary", label: "Summary" },
    { id: "system-model", label: "System model" },
    { id: "reported-locations", label: "Reported locations" },
  ],
  "key-factors": [
    { id: "key-factors-intro", label: "Key factors" },
    { id: "system-model", label: "Care model" },
    { id: "key-factors-list", label: "Explore factors" },
  ],
  "ways-to-help": [
    { id: "pathways-overview", label: "How care is reached" },
    { id: "pathways-reporting", label: "Report and response" },
    { id: "pathways-shelter", label: "Shelter care" },
    { id: "pathways-rescue", label: "Foster and rescue" },
    { id: "pathways-volunteering", label: "Volunteering" },
    { id: "pathways-adoption", label: "Adoption and reunification" },
    { id: "pathways-support", label: "Street care and transport" },
    { id: "pathways-verification", label: "Veterinary care" },
    { id: "pathways-detail", label: "Investigation detail" },
  ],
  improvements: [
    { id: "solutions-overview", label: "Summary" },
    { id: "solutions-improvements", label: "Tracked improvements" },
    { id: "solutions-ideas", label: "Ideas to test" },
  ],
  "our-findings": [
    { id: "investigation-questions", label: "Investigation questions" },
    { id: "investigation-methods", label: "How we'll verify" },
    { id: "field-observation-procedure", label: "Field plan" },
    { id: "investigation-contacts", label: "Contacts" },
    { id: "investigation-records-request", label: "Records request" },
    { id: "investigation-knowledge", label: "Evidence so far" },
    { id: "investigation-findings", label: "Established findings" },
    { id: "investigation-outcomes", label: "Potential responses" },
    { id: "activity-log", label: "Activity log" },
    { id: "investigation-records", label: "Investigation records" },
  ],
  research: [
    { id: "research-at-a-glance", label: "At a glance" },
    { id: "research-whats-new", label: "What's new" },
    { id: "research-need", label: "The need" },
    { id: "research-system", label: "Current system" },
    { id: "research-factors", label: "Unknowns" },
    { id: "research-improvements", label: "Improvements under review" },
    { id: "research-sources", label: "Research sources" },
    { id: "sources-records", label: "Evidence records" },
    { id: "sources-additional", label: "Additional source" },
  ],
  updates: [
    { id: "updates-intro", label: "About these updates" },
    { id: "updates-list", label: "Activity timeline" },
  ],
};
const genericSectionMenus = {
  overview: [
    { id: "summary", label: "Summary" },
    { id: "system-model", label: "System model" },
    { id: "reported-evidence", label: "What is documented" },
    { id: "related-records", label: "Detailed records" },
  ],
  "key-factors": sectionMenus["key-factors"].filter((item) => item.id !== "system-model"),
  "ways-to-help": [
    { id: "ways-intro", label: "Ways to help" },
    { id: "ways-actions", label: "Current options" },
    { id: "ways-organizations", label: "Organizations" },
  ],
  improvements: [
    { id: "improvements-intro", label: "Summary" },
    { id: "improvements-projects", label: "Tracked projects" },
    { id: "improvements-barriers", label: "Barriers to address" },
  ],
  research: [
    { id: "research-intro", label: "Research summary" },
    { id: "sources-intro", label: "Source index" },
    { id: "sources-records", label: "Evidence records" },
  ],
  updates: sectionMenus.updates,
};
const works = workData as WorkRecord[];
const organizations = orgsData as OrgRecord[];
const records = recordsData as EvidenceRecord[];
const activeGaps = (gapsData as GapRecord[]).filter((item) => item.active).sort((a, b) => a.rank - b.rank);
const getWork = (id: string) => works.find((item) => item.id === id);
const fmt = (value?: string | null) => value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value.length === 10 ? `${value}T12:00:00` : value)) : "Date not recorded";
const allLocations = locations as InvestigationLocation[];
const mappedLocations = allLocations.filter((item): item is MappedInvestigationLocation => item.coordinates !== null && item.marker_kind !== null && item.map_label !== null);
const mappedLocationIdsFor = (record: { location_ids?: string[]; organization_ids: string[] }) => [
  ...(record.location_ids ?? []),
  ...record.organization_ids.map((id) => organizations.find((item) => item.id === id)?.map_location_id),
].filter((id): id is string => Boolean(id));
const activityMappedLocationIds = (activity: EvidenceRecord) => [
  ...(activity.location_ids ?? []),
  ...(activity.report_record_ids ?? []).flatMap((id) => {
    const report = investigationRecordById.get(id);
    return report ? mappedLocationIdsFor(report) : [];
  }),
  ...mappedLocationIdsFor({ organization_ids: activity.organization_ids }),
];
const taskMappedLocation = (task: InvestigationTask) => {
  for (const id of mappedLocationIdsFor(task)) {
    const location = mappedLocations.find((item) => item.id === id);
    if (location) return location;
  }
  return undefined;
};
const activityMappedLocation = (activity: EvidenceRecord) => {
  for (const id of activityMappedLocationIds(activity)) {
    const location = mappedLocations.find((item) => item.id === id);
    if (location) return location;
  }
  return undefined;
};
const locationFilterOptions: { value: "all" | InvestigationLocation["category"]; label: string }[] = [
  { value: "all", label: "All" },
  { value: "recent_public_report", label: "Recent" },
  { value: "historical_published_report", label: "Historical" },
  { value: "official_location_record", label: "Official" },
  { value: "crossover_firsthand", label: "Firsthand" },
];

function DogGapOverviewMap({ locations, selectedId, onSelect, followSelection }: { locations: MappedInvestigationLocation[]; selectedId: string; onSelect: (id: string) => void; followSelection: boolean }) {
  const [Map, setMap] = useState<ComponentType<{ locations: MappedInvestigationLocation[]; selectedId: string; onSelect: (id: string) => void; wheelZoom: boolean; preview?: boolean; followSelection?: boolean }> | null>(null);
  useEffect(() => {
    let active = true;
    import("./InvestigationLocationsMap").then(({ InvestigationLocationsMap }) => {
      if (active) setMap(() => InvestigationLocationsMap);
    });
    return () => { active = false; };
  }, []);
  return <div className="dog-gap-real-map" aria-label="Map of generalized historical and public report areas">
    {Map ? <Map locations={locations} selectedId={selectedId} onSelect={onSelect} wheelZoom={true} followSelection={followSelection} /> : <div className="dog-gap-map-loading" role="status">Loading map…</div>}
  </div>;
}

export function DogGapExperience({ gap, section, workspaceBasePath, articlePath, onOpenArticle, onOpenSection, onOpenGap, onNavigate, onOpenWork, onOpenReport, onOpenAction, onOpenActionDetail }: {
  gap: GapRecord; section: Section; onOpenSection: (section: Section, anchor?: string) => void;
  workspaceBasePath?: string;
  articlePath?: string;
  onOpenArticle?: (path: string) => void;
  onOpenGap: (slug: string) => void; onNavigate: (page: "home" | "reality" | "action" | "organizations") => void;
  onOpenWork: (id: string, anchor?: string) => void; onOpenReport: (id: string) => void;
  onOpenAction: (action: PublicActionRecord) => void;
  onOpenActionDetail: () => void;
}) {
  const [exploreOpen, setExploreOpen] = useState(false);
  const [pageMenuOpen, setPageMenuOpen] = useState(false);
  const [sheetState, setSheetState] = useState<"collapsed" | "partial" | "expanded">(section === "map" ? "collapsed" : "expanded");
  const [panelWidth, setPanelWidth] = useState<number | null>(null);
  const [dragTop, setDragTop] = useState<number | null>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; startY: number; startTop: number; height: number } | null>(null);
  const panelDragRef = useRef<{ pointerId: number; startX: number; startWidth: number } | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [focusSelectedLocation, setFocusSelectedLocation] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [locationFilter, setLocationFilter] = useState<"all" | InvestigationLocation["category"]>("all");
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("all");
  const showTaskLocation = (task: InvestigationTask) => {
    setTaskFilter((current) => current === "all" || current === task.status ? current : task.status === "cancelled" ? "all" : task.status);
    const location = taskMappedLocation(task);
    setSelectedLocationId(location?.id ?? "");
    setFocusSelectedLocation(Boolean(location));
  };
  useEffect(() => {
    setSheetState(section === "map" ? selectedLocationId ? "partial" : "collapsed" : "expanded");
    setDragTop(null);
  }, [section]);
  useEffect(() => {
    if (section !== "findings") return;
    sheetRef.current?.scrollTo({ top: 0 });
  }, [articlePath]);
  useEffect(() => {
    if (section !== "tasks") return;
    const taskId = decodeURIComponent(window.location.hash.slice(1));
    const task = investigationTasks.find((item) => item.id === taskId);
    if (task) {
      setSelectedTaskId(task.id);
      showTaskLocation(task);
      setSheetState("expanded");
    }
  }, [section]);
  const visibleLocations = useMemo(() => allLocations.filter((location) => locationFilter === "all" || location.category === locationFilter), [locationFilter]);
  const visibleMappedLocations = useMemo(() => visibleLocations.filter((location): location is MappedInvestigationLocation => location.coordinates !== null && location.marker_kind !== null && location.map_label !== null), [visibleLocations]);
  const filteredTasks = orderInvestigationTasks(investigationTasks).filter((task) => taskFilter === "all" || task.status === taskFilter);
  const taskLocationIds = new Set(filteredTasks.flatMap(mappedLocationIdsFor));
  const taskMappedLocations = mappedLocations.filter((location) => taskLocationIds.has(location.id));
  const activityLocationIds = new Set(investigationActivities.flatMap(activityMappedLocationIds));
  const activityMappedLocations = mappedLocations.filter((location) => activityLocationIds.has(location.id));
  const article = articlePath ? articleForPath(articlePath) : undefined;
  const articleLocationIds = new Set(article?.related_location_ids ?? []);
  const articleMappedLocations = mappedLocations.filter((location) => articleLocationIds.has(location.id));
  const selectedLocation = allLocations.find((location) => location.id === selectedLocationId);
  const selectedTask = investigationTasks.find((task) => task.id === selectedTaskId);
  const isDogGap = gap.id === "dogs-safe-placement";
  const findingsInvestigation = activeInvestigations.find((investigation) => investigation.gap_id === gap.id);
  const findingsIntroduction = findingsInvestigation?.findings_introduction;
  const currentFindings = investigationFindings.filter((finding) => finding.investigation_id === findingsInvestigation?.id && finding.current !== false);
  const findingsLocationIds = new Set(currentFindings.flatMap((finding) => [
    ...finding.location_ids,
    ...(publishedArticles.find((article) => article.id === finding.article_id)?.related_location_ids ?? []),
  ]));
  const findingsMappedLocations = mappedLocations.filter((location) => findingsLocationIds.has(location.id));
  const isWorkspace = isDogGap && Boolean(workspaceBasePath);
  const gapIndex = activeGaps.findIndex((item) => item.id === gap.id);
  const previousGap = gapIndex > 0 ? activeGaps[gapIndex - 1] : undefined;
  const nextGap = gapIndex >= 0 ? activeGaps[gapIndex + 1] : undefined;
  const hasProjects = (projectsData as CapacityProject[]).some((project) => project.gap_ids.includes(gap.id));
  const pageMenu = isDogGap ? sectionMenus[section as keyof typeof sectionMenus] ?? sectionMenus.overview : section === "our-findings" ? genericSectionMenus.overview : (genericSectionMenus[section as keyof typeof genericSectionMenus] ?? genericSectionMenus.overview).filter((item) => item.id !== "improvements-projects" || hasProjects);
  const updates = gapUpdates(gap);
  const latest = updates.find((item) => item.crossover && item.destination) || updates.find((item) => item.destination);
  const tabLink = (id: Section) => workspaceBasePath && ["tasks", "activity", "map", "findings"].includes(id)
    ? `${workspaceBasePath}${id}/`
    : `/reality/${gap.slug}/${id === "overview" ? "" : `${id}/`}`;
  const primaryTab = section === "reports" ? "activity" : section === "our-findings" ? "findings" : section;
  const openPrimary = (tab: "tasks" | "activity" | "map" | "findings") => {
    setSelectedTaskId("");
    setSelectedActivityId("");
    setSelectedLocationId("");
    setFocusSelectedLocation(false);
    setDragTop(null);
    setSheetState(tab === "map" ? "collapsed" : "expanded");
    sheetRef.current?.scrollTo({ top: 0 });
    onOpenSection(tab);
  };
  const selectLocation = (id: string, focus = false) => {
    setSelectedTaskId("");
    setSelectedLocationId(id);
    setFocusSelectedLocation(focus);
    setSheetState("partial");
    sheetRef.current?.scrollTo({ top: 0 });
    if (section !== "map") {
      setLocationFilter("all");
      onOpenSection("map");
    }
  };
  const openTaskLocationOnMap = (id: string) => {
    const location = allLocations.find((item) => item.id === id);
    if (!location?.coordinates || !location.marker_kind || !location.map_label) return;
    selectLocation(id, true);
  };
  const selectTask = (task: InvestigationTask) => {
    setSelectedTaskId(task.id);
    showTaskLocation(task);
    setSheetState("expanded");
    sheetRef.current?.scrollTo({ top: 0 });
  };
  const selectActivity = (activity: EvidenceRecord) => {
    const location = activityMappedLocation(activity);
    setSelectedActivityId(activity.id);
    setSelectedLocationId(location?.id ?? "");
    setFocusSelectedLocation(Boolean(location));
    setSheetState("expanded");
    sheetRef.current?.scrollTo({ top: 0 });
  };
  const activityAnchor = typeof window === "undefined" ? "" : decodeURIComponent(window.location.hash.slice(1));
  useEffect(() => {
    if (section !== "activity" && section !== "reports") return;
    const activity = investigationActivities.find((record) => record.id === activityAnchor);
    if (activity) selectActivity(activity);
  }, [section, activityAnchor]);
  const openTaskFromLocation = (task: InvestigationTask) => {
    selectTask(task);
    onOpenSection("tasks");
  };
  const backToTasks = () => {
    setSelectedTaskId("");
    setSheetState("expanded");
    sheetRef.current?.scrollTo({ top: 0 });
  };
  const backToLocations = () => {
    setSelectedLocationId("");
    setFocusSelectedLocation(false);
    sheetRef.current?.scrollTo({ top: 0 });
  };
  const changeLocationFilter = (filter: typeof locationFilter) => {
    setLocationFilter(filter);
    setSelectedLocationId("");
    setFocusSelectedLocation(false);
  };
  const sheetPositions = ["expanded", "partial", "collapsed"] as const;
  function startSheetDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!window.matchMedia("(max-width: 1023px)").matches) return;
    const map = mapRef.current;
    if (!map) return;
    const height = map.clientHeight;
    dragRef.current = { pointerId: event.pointerId, startY: event.clientY, startTop: event.currentTarget.parentElement!.getBoundingClientRect().top - map.getBoundingClientRect().top, height };
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
  const panelWidthBounds = () => {
    const workspaceWidth = workspaceRef.current?.clientWidth ?? window.innerWidth;
    if (workspaceWidth >= 1200) return { min: 600, max: workspaceWidth - 600 };
    return { min: 280, max: Math.max(280, Math.min(700, workspaceWidth - 320)) };
  };
  const clampPanelWidth = (width: number) => {
    const { min, max } = panelWidthBounds();
    return Math.max(min, Math.min(max, width));
  };
  function startPanelDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    if (window.matchMedia("(max-width: 1023px)").matches) return;
    const workspace = workspaceRef.current;
    const sheet = sheetRef.current;
    if (!workspace || !sheet) return;
    panelDragRef.current = { pointerId: event.pointerId, startX: event.clientX, startWidth: sheet.getBoundingClientRect().width };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }
  function movePanelDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = panelDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setPanelWidth(clampPanelWidth(drag.startWidth + event.clientX - drag.startX));
  }
  function endPanelDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    if (panelDragRef.current?.pointerId !== event.pointerId) return;
    panelDragRef.current = null;
  }
  function movePanelWithKeyboard(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const currentWidth = sheetRef.current?.getBoundingClientRect().width ?? panelWidth ?? 480;
    setPanelWidth(clampPanelWidth(currentWidth + (event.key === "ArrowRight" ? 24 : -24)));
  }
  const reportRecords = records.filter((record) => record.record_type === "field_report" && record.gap_ids.includes(gap.id));
  const activityRecords = investigationActivities;
  const selectedActivity = activityRecords.find((record) => record.id === selectedActivityId);
  const recordLink = (id: string) => {
    const record = investigationRecordById.get(id);
    if (!record) return null;
    if (record.record_type === "field_report") return <a key={id} href={`/reports/${id}/`} onClick={(event) => { event.preventDefault(); onOpenReport(id); }}>{record.title}</a>;
    if (record.record_type === "activity") return <a key={id} href={`/work/dogs/activity/#${encodeURIComponent(id)}`}>{record.title}</a>;
    if (record.source.url) return <a key={id} href={record.source.url} target="_blank" rel="noreferrer">{record.title}</a>;
    return <span key={id}>{record.title}</span>;
  };
  const openUpdate = (update: typeof updates[number]) => {
    const destination = update.destination;
    if (destination?.kind === "work") onOpenWork(destination.id, destination.anchor);
    if (destination?.kind === "report") onOpenReport(destination.id);
  };
  const updateLink = (update: typeof updates[number]) => {
    const href = gapUpdateHref(update.destination);
    if (!href) return null;
    const internal = update.destination?.kind !== "external";
    return <a href={href} target={internal ? undefined : "_blank"} rel={internal ? undefined : "noreferrer"} onClick={internal ? (event) => navigateInternalLink(event, () => openUpdate(update)) : undefined}>{update.linkLabel || "View record"} </a>;
  };
  const primaryTabs = (className: string) => <nav className={`crossover-primary-tabs ${className}`} aria-label="Investigation sections">{(["tasks", "activity", "map", "findings"] as const).map((tab) => <a key={tab} href={tabLink(tab)} aria-current={primaryTab === tab ? "page" : undefined} onClick={(event) => navigateInternalLink(event, () => openPrimary(tab))}>{tab[0].toUpperCase() + tab.slice(1)}</a>)}</nav>;
  const investigationHeader = (className: string) => <div className={`crossover-investigation-header ${className}`}>
    <div className="crossover-brand-row"><a href="/" onClick={(event) => navigateInternalLink(event, () => onNavigate("home"))}>CROSSOVER</a><a href="/about/">About</a></div>
    <div className="crossover-investigation-title">Dogs on the street in Stockton</div><p>Investigating · Stockton, California</p>
    {isWorkspace && primaryTabs("crossover-mobile-tabs")}
  </div>;

  return <>
    {isDogGap && !isWorkspace && investigationHeader("crossover-outer-header")}
    <div ref={workspaceRef} className={isWorkspace ? `crossover-map-workspace is-${sheetState}${dragTop === null ? "" : " is-dragging"}` : "dog-gap-layout"} style={isWorkspace && panelWidth !== null ? { "--crossover-expanded-panel-width": `${panelWidth}px` } as CSSProperties : undefined}>
      {isWorkspace && investigationHeader("crossover-workspace-header")}
      {isWorkspace && <div ref={mapRef} className="crossover-shared-map"><DogGapOverviewMap locations={articlePath ? articleMappedLocations : section === "tasks" ? taskMappedLocations : section === "activity" || section === "reports" ? activityMappedLocations : section === "findings" ? findingsMappedLocations : visibleMappedLocations} selectedId={selectedLocationId} onSelect={(id) => selectLocation(id)} followSelection={focusSelectedLocation} /></div>}
      {isWorkspace && <button type="button" className="crossover-panel-resize-handle" aria-label="Drag to resize investigation panel; use left and right arrow keys to adjust" onPointerDown={startPanelDrag} onPointerMove={movePanelDrag} onPointerUp={endPanelDrag} onPointerCancel={endPanelDrag} onKeyDown={movePanelWithKeyboard} />}
      <div ref={sheetRef} className="crossover-sheet" style={dragTop === null ? undefined : { top: dragTop }}>
        {isWorkspace && <button type="button" className="crossover-sheet-grip" aria-label="Drag to resize investigation details; use up and down arrow keys to adjust" onPointerDown={startSheetDrag} onPointerMove={moveSheetDrag} onPointerUp={endSheetDrag} onPointerCancel={endSheetDrag} onKeyDown={moveSheetWithKeyboard}><span aria-hidden="true" /></button>}
        {isWorkspace && primaryTabs("crossover-desktop-tabs")}
    {!isDogGap && <div className="dog-gap-topbar">
      <a href="/reality/" onClick={(event) => navigateInternalLink(event, () => onNavigate("reality"))}> Back to needs</a>
      <nav className="dog-gap-topbar-switcher" aria-label="Gap navigation">
        <span>{gapIndex + 1} of {activeGaps.length}</span>
        <button type="button" aria-label="Previous gap" disabled={!previousGap} onClick={() => previousGap && onOpenGap(previousGap.slug)}>Previous gap</button>
        <button type="button" aria-label="Next gap" disabled={!nextGap} onClick={() => nextGap && onOpenGap(nextGap.slug)}>Next gap</button>
      </nav>
    </div>}
  <div className={`dog-gap-layout ${isDogGap ? "is-dog-redesign" : ""}`}>
    {!isDogGap && <aside className="dog-gap-sidebar" aria-label="On this page">
      <span>On this page</span>
      {pageMenu.map(({ id, label }) => <a href={`#${id}`} key={id}> {label}</a>)}
    </aside>}
    <div className="dog-gap-main">
      {!isDogGap && <section className="dog-gap-identity" aria-label="Current need">
        <div className="dog-gap-identity-copy"><span className="dog-gap-status investigation-status-pill">{investigationStatusLabel(gap.investigation_status)}</span><h1>{gap.title}</h1><p className="dog-gap-deck">{gap.summary}</p><div className="dog-gap-meta"><span> {gap.sources.length} sources</span><span> {gap.organization_ids.length} organizations</span>{gap.updated_at && <span> Record updated {fmt(gap.updated_at)}</span>}</div></div>
        {latest && <div className="dog-gap-latest"><span className="dog-gap-eyebrow">Latest activity</span><strong>{latest.title}</strong><p>{latest.summary}</p><time dateTime={latest.date}>{fmt(latest.date)}</time>{updateLink(latest)}</div>}
        {gap.artwork && <img className="dog-gap-photo" src={gap.artwork} alt={gap.title} />}
      </section>}
      {!isDogGap && <div className="dog-gap-mobile-menus">
        <div className="dog-gap-mobile-menu">
          <button type="button" aria-expanded={exploreOpen} aria-controls="dog-gap-explore-links" onClick={() => setExploreOpen((open) => !open)}><span>Explore the gap</span><span>{tabs.find((tab) => tab.id === section)?.label}</span></button>
          <nav id="dog-gap-explore-links" aria-label="Explore the gap" hidden={!exploreOpen}>{tabs.filter((tab) => isDogGap || tab.id !== "our-findings").map((tab) => <a key={tab.id} href={tabLink(tab.id)} aria-current={section === tab.id ? "page" : undefined} onClick={(event) => navigateInternalLink(event, () => { setExploreOpen(false); onOpenSection(tab.id); })}>{tab.label}</a>)}</nav>
        </div>
        <div className="dog-gap-mobile-menu">
          <button type="button" aria-expanded={pageMenuOpen} aria-controls="dog-gap-page-links" onClick={() => setPageMenuOpen((open) => !open)}><span>On this page</span><span aria-hidden="true">{pageMenuOpen ? "−" : "+"}</span></button>
          <nav id="dog-gap-page-links" aria-label="On this page" hidden={!pageMenuOpen}>{pageMenu.map(({ id, label }) => <a href={`#${id}`} key={id} onClick={() => setPageMenuOpen(false)}>{label}</a>)}</nav>
        </div>
      </div>}
      {!isDogGap && <nav className="dog-gap-tabs" aria-label="Need sections">{tabs.filter((tab) => isDogGap || tab.id !== "our-findings").map((tab) => <a key={tab.id} href={tabLink(tab.id)} aria-current={section === tab.id ? "page" : undefined} onClick={(event) => navigateInternalLink(event, () => onOpenSection(tab.id))}>{tab.label}</a>)}</nav>}
      {section === "overview" && !isDogGap && <GenericGapOverview gap={gap} onOpenWork={onOpenWork} onOpenKeyFactors={() => onOpenSection("key-factors")} />}
      {section === "overview" && isDogGap && <DogGapOverviewLanding gap={gap} map={null} onOpenSection={onOpenSection} onOpenWork={onOpenWork} onOpenActionDetail={onOpenActionDetail} onOpenActionIndex={() => onNavigate("action")} />}
      {section === "tasks" && isDogGap && (selectedTask ? <div className="crossover-workspace-page"><article aria-label={`Task details: ${selectedTask.title}`}>
          <div className="crossover-detail-heading"><div><p className="crossover-secondary-text">Task details</p><h2>{selectedTask.title}</h2></div><CloseDetailButton label="task" onClick={backToTasks} /></div>
          <p className="crossover-secondary-text">Status: {selectedTask.status === "done" ? "Completed action" : selectedTask.status === "waiting" ? "Waiting for response" : selectedTask.status === "open" ? "Open" : "Cancelled"}</p>
          {selectedTask.completed_at && <p><span className="crossover-secondary-text">Completed {fmt(selectedTask.completed_at)}.</span> Completion of this task does not establish the outcome of an application or inquiry.</p>}
          <p>{selectedTask.instructions}</p>
          {selectedTask.location_ids.length > 0 && <section><h3>Locations</h3><ul>{selectedTask.location_ids.map((id) => {
            const location = allLocations.find((item) => item.id === id);
             return location ? <li key={id}>{location.name} · <a href={tabLink("map")} onClick={(event) => navigateInternalLink(event, () => openTaskLocationOnMap(id))}>Open on map</a></li> : null;
          })}</ul><p>These are generalized evidence areas, not current dog locations.</p></section>}
          {selectedTask.organization_ids.length > 0 && <section><h3>Organizations</h3><ul>{selectedTask.organization_ids.map((id) => {
            const org = organizations.find((item) => item.id === id);
             const mappedLocation = org?.map_location_id ? allLocations.find((item) => item.id === org.map_location_id) : undefined;
             return org ? <li key={id}><a href={`/organizations/${org.slug}/`}>{org.name}</a>{mappedLocation?.coordinates && mappedLocation.marker_kind && mappedLocation.map_label && <> · <a href={tabLink("map")} onClick={(event) => navigateInternalLink(event, () => openTaskLocationOnMap(mappedLocation.id))}>Open on map</a></>}</li> : null;
          })}</ul></section>}
          {selectedTask.checklist && <section><h3>Questions to ask</h3><ul>{selectedTask.checklist.map((item) => <li key={item}>{item}</li>)}</ul></section>}
          {selectedTask.question_ids.length > 0 && <section><h3>Investigation questions</h3><ul>{selectedTask.question_ids.map((id) => <li key={id}>{investigationQuestionById.get(id)?.title}</li>)}</ul></section>}
          {selectedTask.basis_record_ids.length > 0 && <section><h3>Basis and sources</h3><ul>{selectedTask.basis_record_ids.map((id) => <li key={id}>{recordLink(id)}</li>)}</ul></section>}
          {selectedTask.activity_record_ids.length > 0 && <section><h3>Documented activity</h3><ul>{selectedTask.activity_record_ids.map((id) => <li key={id}>{recordLink(id)}</li>)}</ul></section>}
        </article></div> : <WorkspacePage title="Tasks" subtitle="Planned actions and documented completed steps. A planned visit is not a field observation.">
          <div className="crossover-map-filters" role="group" aria-label="Task filters">{(["all", "open", "waiting", "done"] as const).map((filter) => <PlainActionButton key={filter} variant="filter" pressed={taskFilter === filter} onClick={() => { setTaskFilter(filter); setSelectedLocationId(""); setFocusSelectedLocation(false); }}>{filter !== "all" && <span className="crossover-evidence-dot" style={{ backgroundColor: taskStatusColors[filter] }} aria-hidden="true" />}{filter === "done" ? "Completed" : filter[0].toUpperCase() + filter.slice(1)}</PlainActionButton>)}</div>
          <div className="crossover-record-list crossover-task-list">{filteredTasks.map((task) => <button type="button" key={task.id} onClick={() => selectTask(task)}>
            <strong className="crossover-task-title">{task.status !== "cancelled" && <span className="crossover-evidence-dot" style={{ backgroundColor: taskStatusColors[task.status] }} aria-hidden="true" />}{task.title}</strong>
            <small>{task.status === "done" ? `Completed ${fmt(task.completed_at)}` : taskPriorityContext(task)}</small>
          </button>)}</div>
        </WorkspacePage>)}
      {(section === "activity" || section === "reports") && isDogGap && (selectedActivity ? <div className="crossover-workspace-page"><article id={selectedActivity.id} aria-label={`Activity details: ${selectedActivity.title}`}>
          <div className="crossover-detail-heading"><h2>{selectedActivity.title}</h2><CloseDetailButton label="activity" onClick={() => setSelectedActivityId("")} /></div>
          <p className="crossover-secondary-text">{fmt(selectedActivity.occurred_at ?? selectedActivity.recorded_at ?? selectedActivity.published_at)} · {selectedActivity.evidence_status?.replaceAll("_", " ") ?? "Recorded activity"}</p>
          <p>{selectedActivity.summary}</p>
          {selectedActivity.outcome && <p><strong>Outcome:</strong> {selectedActivity.outcome.summary}</p>}
          {selectedActivity.organization_ids.length > 0 && <p>Organizations: {selectedActivity.organization_ids.map((id) => {
            const org = organizations.find((item) => item.id === id);
            return org ? <a key={id} href={`/organizations/${org.slug}/`}>{org.name}</a> : null;
          })}</p>}
          {investigationTasks.filter((task) => task.activity_record_ids.includes(selectedActivity.id)).map((task) => <p key={task.id}>Task: <button type="button" onClick={() => openTaskFromLocation(task)}>{task.title}</button></p>)}
          {(selectedActivity.report_record_ids ?? []).map((id) => <p key={id}>Field report: {recordLink(id)}</p>)}
          {selectedActivity.source.url && <a href={selectedActivity.source.url} target="_blank" rel="noreferrer">View source</a>}
        </article></div> : <WorkspacePage title="Activity" subtitle="Dated visits, inquiries, applications, and records requests from existing investigation records.">
           <div className="crossover-record-list crossover-report-list">{activityRecords.map((record) => <button type="button" id={record.id} key={record.id} onClick={() => selectActivity(record)}><strong>{record.title}</strong><small>{fmt(record.occurred_at ?? record.recorded_at ?? record.published_at)} · {record.evidence_status?.replaceAll("_", " ") ?? "Recorded activity"}</small></button>)}</div>
          <WorkspaceSection title="Field reports"><div className="crossover-record-list crossover-report-list">{reportRecords.map((report) => <button type="button" key={report.id} onClick={() => onOpenReport(report.id)}><strong>{report.title}</strong><small>{fmt(report.occurred_at)} · {report.location || "Stockton"}</small><span>{report.summary}</span></button>)}</div></WorkspaceSection>
        </WorkspacePage>)}
      {section === "map" && isDogGap && (selectedLocation
        ? <CrossoverLocationDetails location={selectedLocation} records={records} tasks={investigationTasks} activities={activityRecords} onBack={backToLocations} onOpenTask={openTaskFromLocation} onOpenReport={onOpenReport} onOpenActionDetail={onOpenActionDetail} />
        : <WorkspacePage title="Locations" subtitle="Markers identify investigation locations and generalized report areas. They do not show where dogs are now."><div className="crossover-map-filters" role="group" aria-label="Map evidence filters">{locationFilterOptions.map(({ value, label }) => <PlainActionButton key={value} variant="filter" pressed={locationFilter === value} onClick={() => changeLocationFilter(value)}>{value !== "all" && <span className="crossover-evidence-dot" style={{ backgroundColor: evidenceCategoryColors[value] }} aria-hidden="true" />}{label}</PlainActionButton>)}</div><div className="crossover-record-list crossover-location-list">{visibleLocations.map((location) => <button type="button" key={location.id} onClick={() => selectLocation(location.id, true)}><strong className="crossover-location-title"><span className="crossover-evidence-dot" style={{ backgroundColor: evidenceCategoryColors[location.category] }} aria-hidden="true" />{location.name}{location.marker_kind === "major_reported_concern" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D74B45" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Reported historical concern"><path d="M10.7 4.6a1.5 1.5 0 0 1 2.6 0l8.1 13.8a1.5 1.5 0 0 1-1.3-2.3H3.9a1.5 1.5 0 0 1-1.3-2.3Z"/><path d="M12 9v5M12 17.5h.01"/></svg>}</strong><small>{fmt(location.evidence_date)} · {location.verification_status}{!location.coordinates && " · No map pin"}</small></button>)}</div></WorkspacePage>)}
      {section === "more" && isDogGap && <DogGapOverviewLanding gap={gap} map={null} onOpenSection={onOpenSection} onOpenWork={onOpenWork} onOpenActionDetail={onOpenActionDetail} onOpenActionIndex={() => onNavigate("action")} />}
      {section === "key-factors" && <KeyFactorsPage gap={gap} onOpenSection={onOpenSection} onOpenMap={() => onOpenWork("dogs-locations-map")} model={isDogGap ? <DogCareScenario heading="Explore the full care model" factorHref={(key) => `#factor-${key}`} onOpenFactor={(key) => onOpenSection("key-factors", `factor-${key}`)} improvementHref={(id) => `${tabLink("improvements")}#${id}`} onOpenImprovement={(id) => onOpenSection("improvements", id)} /> : undefined} />}
      {section === "ways-to-help" && !isDogGap && <GenericGapWaysToHelp gap={gap} onOpenAction={onOpenAction} />}
      {section === "ways-to-help" && isDogGap && <div className="dog-gap-tab-content dog-gap-participation">
        <div className="dog-gap-tab-heading"><p className="dog-gap-eyebrow">Crossover actions</p><h2>Show Up With Us</h2><p>We're investigating how dogs reach care in Stockton by showing up, testing available pathways, and documenting what happens. Here's how you can participate.</p></div>
        <div className="dog-gap-participation-list">{activeCrossoverActions.map((action) => <article className="action-index-feature dog-gap-participation-card" key={action.id}>
          <img className="action-index-image" src={action.image.src} alt={action.image.alt} width={action.image.width} height={action.image.height} decoding="async" />
          <div className="action-index-feature-copy">
            <div><h3>{action.title}</h3><p>{action.summary}</p></div>
            <dl className="action-index-status" aria-label="Fieldwork status">{action.status.map(({ value, label }) => <div className="action-index-status-item" key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
            <a className="action-index-button" href={action.href} onClick={action.id === dogStreetActionId ? (event) => navigateInternalLink(event, onOpenActionDetail) : undefined}>{action.buttonLabel} </a>
          </div>
        </article>)}</div>
      </div>}
      {section === "improvements" && !isDogGap && <GenericGapImprovements gap={gap} />}
      {section === "improvements" && isDogGap && <div className="dog-gap-tab-content is-investigation-subpage"><InvestigationPageHeader title="Improvements" description="Project stages and possible effects come from the existing evidence records. Delivered capacity and impact remain unverified unless stated." />{getWork("dogs-solutions") && <DogsSolutionsContent item={getWork("dogs-solutions")!} onOpenReport={onOpenReport} />}</div>}
      {section === "findings" && isDogGap && article && <ArticleContent article={article} onBack={() => onOpenSection("findings")} />}
      {section === "findings" && isDogGap && articlePath && !article && <WorkspacePage title="Article not found" subtitle="This article is not published." backLink={<a href="/work/dogs/findings/">← Findings</a>}>{null}</WorkspacePage>}
      {section === "findings" && isDogGap && !articlePath && <WorkspacePage title="Findings" headingId="investigation-findings" subtitle="Propositions evaluated against evidence. Status and limitations are part of each finding.">
        {findingsInvestigation?.findings_summary && <WorkspaceSection title="Summary"><p>{findingsInvestigation.findings_summary}</p></WorkspaceSection>}
        {findingsIntroduction && <WorkspaceSection title={findingsIntroduction.heading} headingId="findings-introduction-heading">
          {findingsIntroduction.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </WorkspaceSection>}
        <WorkspaceSection title="Current findings" headingId="current-findings-heading">
          <div className="crossover-record-list">{currentFindings.map((finding) => {
            const relatedArticle = publishedArticles.find((item) => item.id === finding.article_id);
            return <article key={finding.id}>
              <strong>{finding.title}</strong>
              <p>{finding.statement}</p>
              <small>{finding.status.charAt(0).toUpperCase() + finding.status.slice(1).replaceAll("_", " ")}{relatedArticle && <> · <a href={relatedArticle.path} onClick={onOpenArticle ? (event) => navigateInternalLink(event, () => onOpenArticle(relatedArticle.path)) : undefined}>{relatedArticle.title}</a></>}</small>
            </article>;
          })}</div>
        </WorkspaceSection>
      </WorkspacePage>}
      {section === "our-findings" && isDogGap && <div className="dog-gap-tab-content is-investigation-subpage"><InvestigationPageHeader title="Findings" description="Review published evidence, Crossover's firsthand checks, and questions still under investigation." />{getWork("dogs-map-placement-barriers") && <DogsInvestigationContent item={getWork("dogs-map-placement-barriers")!} onOpenReport={onOpenReport} includeMap={false} />}</div>}
      {section === "research" && <div className={`dog-gap-tab-content${isDogGap ? " is-investigation-subpage" : ""}`}>{isDogGap && <InvestigationPageHeader title="Sources" description="Explore the public records and source material behind this investigation." />}{isDogGap ? getWork("dogs-public-source-review") && <DogsResearchContent item={getWork("dogs-public-source-review")!} onOpenReport={onOpenReport} /> : <GenericGapResearchIntro gap={gap} />}<div className="dog-gap-tab-heading" id="sources-intro"><p className="dog-gap-eyebrow">Evidence index</p><h2>Source index</h2><p>Source dates and limitations remain attached to the underlying records.</p></div><div className="dog-gap-source-list" id="sources-records">{records.filter((record) => record.gap_ids.includes(gap.id) && record.source?.url).map((record) => <article className="dog-gap-card" key={record.id}><span>{record.record_type.replace(/_/g, " ")} · {fmt(record.published_at || record.checked_at)}</span><h3>{record.title}</h3><p>{record.summary}</p><small>{record.source.publisher || record.source.type} · {record.evidence_status?.replace(/_/g, " ") || "Evidence record"}</small><a href={record.source.url} target="_blank" rel="noreferrer">View source </a></article>)}{gap.sources.filter((source) => source.url && !records.some((record) => record.gap_ids.includes(gap.id) && record.source?.url === source.url)).map((source, index) => <article className="dog-gap-card" id={index === 0 ? "sources-additional" : undefined} key={source.url}><span>Gap source · Date not recorded</span><h3>{source.label || "Additional source"}</h3><p>This source is listed on the need record; no separate evidence record or verification date is available.</p><a href={source.url} target="_blank" rel="noreferrer">View source </a></article>)}</div></div>}
      {section === "updates" && <div className={`dog-gap-tab-content${isDogGap ? " is-investigation-subpage" : ""}`}>{isDogGap ? <InvestigationPageHeader id="updates-intro" title="Updates" description="Research, fieldwork, requests, announcements, and project milestones related to this need." /> : <div className="dog-gap-tab-heading" id="updates-intro"><p className="dog-gap-eyebrow">Need activity</p><h2>Updates</h2><p>Research, fieldwork, requests, announcements, and project milestones related to this need.</p></div>}<div className="dog-gap-update-list" id="updates-list">{updates.map((update) => <article className="dog-gap-card" key={update.id}><span>{update.typeLabel} · <time dateTime={update.date}>{fmt(update.date)}</time></span><h3>{update.title}</h3><p>{update.summary}</p>{updateLink(update)}</article>)}</div></div>}
    </div>
  </div></div></div></>;
}
