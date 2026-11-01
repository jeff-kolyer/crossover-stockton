
import { useEffect, useMemo, useRef, useState, type ComponentType, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import "../styles/map.css";
import "../styles/activity.css";
import "../styles/controls.css";
import orgsData from "../data/orgs.json";
import locations from "../data/investigation-locations.json";
import recordsData from "../data/records.json";
import type { EvidenceRecord, GapRecord, OrgRecord } from "../types";
import { evidenceCategoryColors } from "../lib/evidenceCategoryColors";
import { navigateInternalLink } from "../lib/internalLink";
import { activeInvestigations, investigationActivities, investigationFindings, investigationQuestionById, investigationRecordById, investigationTasks } from "../lib/investigationData";
import { articleForPath, publishedArticles } from "../lib/articles";
import { orderInvestigationTasks, taskPriorityContext } from "../lib/taskListPriorities";
import type { InvestigationTask } from "../types/investigation";
import { CrossoverLocationDetails } from "./CrossoverLocationDetails";
import { CloseDetailButton, PlainActionButton } from "./PlainActionButton";
import { ArticleContent } from "./ArticlePages";
import { FieldReportContent, formatReportDate } from "./FieldReportContent";
import { WorkspacePage, WorkspaceSection } from "./WorkspacePage";
import type { InvestigationLocation, MappedInvestigationLocation } from "./InvestigationLocations";

type Section = "tasks" | "activity" | "map" | "findings";
type TaskFilter = "open" | "waiting" | "done" | "all";
type MarkerTypeFilter = "all" | InvestigationLocation["marker_type"];
const taskStatusColors = {
  open: evidenceCategoryColors.crossover_firsthand,
  waiting: evidenceCategoryColors.recent_public_report,
  done: evidenceCategoryColors.historical_published_report,
} as const;
const organizations = orgsData as OrgRecord[];
const records = recordsData as EvidenceRecord[];
const fmt = (value?: string | null) => value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value.length === 10 ? `${value}T12:00:00` : value)) : "Date not recorded";
const allLocations = locations as InvestigationLocation[];
const mappedLocations = allLocations.filter((item): item is MappedInvestigationLocation => item.coordinates !== null && item.marker_kind !== null && item.map_label !== null);
const mappedLocationIdsFor = (record: { location_ids?: string[]; map_reference_location_ids?: string[]; organization_ids: string[] }) => [
  ...(record.location_ids ?? []),
  ...(record.map_reference_location_ids ?? []),
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
type LocationStatusFilter = "all" | InvestigationLocation["category"];
type MapFilterOption<T extends string> = { value: T; label: string; dotColor?: string };
const locationFilterOptions: MapFilterOption<LocationStatusFilter>[] = [
  { value: "all", label: "All reports" },
  { value: "recent_public_report", label: "Recent", dotColor: evidenceCategoryColors.recent_public_report },
  { value: "historical_published_report", label: "Historical", dotColor: evidenceCategoryColors.historical_published_report },
  { value: "official_location_record", label: "Official", dotColor: evidenceCategoryColors.official_location_record },
  { value: "crossover_firsthand", label: "Firsthand", dotColor: evidenceCategoryColors.crossover_firsthand },
];
const markerTypeOptions: MapFilterOption<MarkerTypeFilter>[] = [
  { value: "all", label: "All locations" },
  { value: "dog_sighting", label: "Dog sightings" },
  { value: "human_services", label: "Human services" },
  { value: "animal_care", label: "Animal care" },
];

function MapFilterDropdown<T extends string>({ value, options, onChange, onOpen, ariaLabel }: { value: T; options: readonly MapFilterOption<T>[]; onChange: (value: T) => void; onOpen: () => void; ariaLabel: string }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const selected = options.find((option) => option.value === value)!;
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) detailsRef.current.open = false;
    };
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && detailsRef.current?.open) {
        detailsRef.current.open = false;
        summaryRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);
  return <details ref={detailsRef} className="map-dropdown" onToggle={(event) => { if (event.currentTarget.open) onOpen(); }}>
    <summary ref={summaryRef} className="plain-action-button is-filter" aria-label={`${ariaLabel}: ${selected.label}`}>
      <span>{selected.dotColor && <span className="evidence-dot" style={{ backgroundColor: selected.dotColor }} aria-hidden="true" />}{selected.label}</span>
    </summary>
    <div className="map-dropdown-options" role="group" aria-label={ariaLabel}>
      {options.map((option) => <button type="button" key={option.value} aria-pressed={value === option.value} onClick={(event) => { onChange(option.value); if (detailsRef.current) detailsRef.current.open = false; if (event.detail === 0) summaryRef.current?.focus(); }}>
        {option.dotColor && <span className="map-dropdown-dot" aria-hidden="true"><span className="evidence-dot" style={{ backgroundColor: option.dotColor }} /></span>}
        {option.label}
      </button>)}
    </div>
  </details>;
}

function DogGapOverviewMap({ locations, selectedId, onSelect, followSelection, preserveViewOnFilter }: { locations: MappedInvestigationLocation[]; selectedId: string; onSelect: (id: string) => void; followSelection: boolean; preserveViewOnFilter: boolean }) {
  const [Map, setMap] = useState<ComponentType<{ locations: MappedInvestigationLocation[]; selectedId: string; onSelect: (id: string) => void; wheelZoom: boolean; preview?: boolean; followSelection?: boolean; preserveViewOnFilter?: boolean }> | null>(null);
  useEffect(() => {
    let active = true;
    import("./InvestigationLocationsMap").then(({ InvestigationLocationsMap }) => {
      if (active) setMap(() => InvestigationLocationsMap);
    });
    return () => { active = false; };
  }, []);
  return <div className="dog-gap-real-map" aria-label="Map of generalized historical and public report areas">
    {Map ? <Map locations={locations} selectedId={selectedId} onSelect={onSelect} wheelZoom={true} followSelection={followSelection} preserveViewOnFilter={preserveViewOnFilter} /> : <div className="dog-gap-map-loading" role="status">Loading map…</div>}
  </div>;
}

export function DogGapExperience({ gap, section, workspaceBasePath, articlePath, reportId, reportLocationId, onOpenArticle, onOpenSection, onNavigate, onOpenReport }: {
  gap: GapRecord; section: Section; onOpenSection: (section: Section, anchor?: string) => void;
  workspaceBasePath: string;
  articlePath?: string;
  reportId?: string;
  reportLocationId?: string;
  onOpenArticle?: (path: string) => void;
  onNavigate: (page: "home" | "reality" | "action" | "organizations") => void;
  onOpenReport: (id: string, locationId?: string) => void;
}) {
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
  const [markerTypeFilter, setMarkerTypeFilter] = useState<MarkerTypeFilter>("all");
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("all");
  const showTaskLocation = (task: InvestigationTask) => {
    setTaskFilter((current) => current === "all" || current === task.status ? current : task.status === "cancelled" ? "all" : task.status);
    const location = taskMappedLocation(task) ?? allLocations.find((item) => task.location_ids.includes(item.id));
    setSelectedLocationId(location?.id ?? "");
    setFocusSelectedLocation(Boolean(location?.coordinates));
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
  useEffect(() => {
    if (section !== "map") return;
    const locationId = decodeURIComponent(window.location.hash.slice(1));
    const location = allLocations.find((item) => item.id === locationId);
    if (!location) return;
    setLocationFilter("all");
    setSelectedLocationId(location.id);
    setFocusSelectedLocation(Boolean(location.coordinates));
    setSheetState("partial");
  }, [section]);
  const showLocationStatusFilters = markerTypeFilter === "all" || markerTypeFilter === "dog_sighting";
  const visibleLocations = useMemo(() => allLocations.filter((location) =>
    (markerTypeFilter === "all" || location.marker_type === markerTypeFilter)
    && (!showLocationStatusFilters || locationFilter === "all" || location.category === locationFilter)
  ), [locationFilter, markerTypeFilter, showLocationStatusFilters]);
  const visibleMappedLocations = useMemo(() => visibleLocations.filter((location): location is MappedInvestigationLocation => location.coordinates !== null && location.marker_kind !== null && location.map_label !== null), [visibleLocations]);
  const filteredTasks = orderInvestigationTasks(investigationTasks).filter((task) => taskFilter === "all" || task.status === taskFilter);
  const taskLocationIds = new Set(filteredTasks.flatMap(mappedLocationIdsFor));
  const taskMappedLocations = mappedLocations.filter((location) => taskLocationIds.has(location.id));
  const activityLocationIds = new Set(investigationActivities.flatMap(activityMappedLocationIds));
  const activityMappedLocations = mappedLocations.filter((location) => activityLocationIds.has(location.id));
  const article = articlePath ? articleForPath(articlePath) : undefined;
  const report = reportId ? records.find((record) => record.id === reportId && record.record_type === "field_report") : undefined;
  const reportAssociatedLocationId = reportLocationId ?? report?.location_ids?.[0] ?? report?.organization_ids.map((id) => organizations.find((org) => org.id === id)?.map_location_id).find(Boolean);
  const reportMappedLocations = mappedLocations.filter((location) => location.id === reportAssociatedLocationId);
  const articleLocationIds = new Set(article?.related_location_ids ?? []);
  const articleMappedLocations = mappedLocations.filter((location) => articleLocationIds.has(location.id));
  const selectedLocation = allLocations.find((location) => location.id === selectedLocationId);
  useEffect(() => {
    if (!reportId) return;
    setSelectedLocationId(reportAssociatedLocationId ?? "");
    setFocusSelectedLocation(Boolean(reportAssociatedLocationId));
    setSheetState("expanded");
    sheetRef.current?.scrollTo({ top: 0 });
  }, [reportId, reportAssociatedLocationId]);
  const selectedTask = investigationTasks.find((task) => task.id === selectedTaskId);
  const findingsInvestigation = activeInvestigations.find((investigation) => investigation.gap_id === gap.id);
  const findingsIntroduction = findingsInvestigation?.findings_introduction;
  const currentFindings = investigationFindings.filter((finding) => finding.investigation_id === findingsInvestigation?.id && finding.current !== false);
  const findingsLocationIds = new Set(currentFindings.flatMap((finding) => [
    ...finding.location_ids,
    ...(publishedArticles.find((article) => article.id === finding.article_id)?.related_location_ids ?? []),
  ]));
  const findingsMappedLocations = mappedLocations.filter((location) => findingsLocationIds.has(location.id));
  const tabLink = (id: Section) => `${workspaceBasePath}${id}/`;
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
    if (!location) return;
    selectLocation(id, Boolean(location.coordinates));
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
    if (section !== "activity") return;
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
    setFocusSelectedLocation(false);
    const selected = allLocations.find((location) => location.id === selectedLocationId);
    if (selected && ((filter !== "all" && selected.category !== filter) || (markerTypeFilter !== "all" && selected.marker_type !== markerTypeFilter))) setSelectedLocationId("");
  };
  const openMapFilterMenu = () => {
    if (window.matchMedia("(max-width: 1023px)").matches) setSheetState((current) => current === "collapsed" ? "partial" : current);
  };
  const changeMarkerTypeFilter = (filter: MarkerTypeFilter) => {
    setMarkerTypeFilter(filter);
    setLocationFilter("all");
    setFocusSelectedLocation(false);
    const selected = allLocations.find((location) => location.id === selectedLocationId);
    if (selected && filter !== "all" && selected.marker_type !== filter) setSelectedLocationId("");
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
  const reportHref = (id: string, locationId?: string) => `/work/dogs/reports/${encodeURIComponent(id)}/?from=${section}${locationId ? `&location=${encodeURIComponent(locationId)}` : ""}`;
  const openInvestigationReport = (id: string, locationId?: string) => onOpenReport(id, locationId ?? (selectedLocationId || undefined));
  const recordLink = (id: string) => {
    const record = investigationRecordById.get(id);
    if (!record) return null;
    if (record.record_type === "field_report") return <a key={id} href={reportHref(id, selectedLocationId || undefined)} onClick={(event) => navigateInternalLink(event, () => openInvestigationReport(id))}>{record.title}</a>;
    if (record.record_type === "activity") return <a key={id} href={`/work/dogs/activity/#${encodeURIComponent(id)}`}>{record.title}</a>;
    if (record.source.url) return <a key={id} href={record.source.url} target="_blank" rel="noreferrer">{record.title}</a>;
    return <span key={id}>{record.title}</span>;
  };
  const primaryTabs = (className: string) => <nav className={`primary-tabs ${className}`} aria-label="Investigation sections">{(["tasks", "activity", "map", "findings"] as const).map((tab) => <a key={tab} href={tabLink(tab)} aria-current={section === tab ? "page" : undefined} onClick={(event) => navigateInternalLink(event, () => openPrimary(tab))}>{tab[0].toUpperCase() + tab.slice(1)}</a>)}</nav>;
  const investigationHeader = (className: string) => <header className={`investigation-header ${className}`}>
    <div className="brand-row"><a href="/" onClick={(event) => navigateInternalLink(event, () => onNavigate("home"))}>CROSSOVER</a><a href="/about/">About</a></div>
    <hgroup><h1>Dogs on the street in Stockton</h1><p>Investigating · Stockton, California</p></hgroup>
    {primaryTabs("mobile-tabs")}
  </header>;

  return <>
    <div ref={workspaceRef} className={`map-workspace is-${sheetState}${dragTop === null ? "" : " is-dragging"}`} style={panelWidth !== null ? { "--crossover-expanded-panel-width": `${panelWidth}px` } as CSSProperties : undefined}>
      {investigationHeader("workspace-header")}
      <div ref={mapRef} className="shared-map"><DogGapOverviewMap locations={reportId ? reportMappedLocations : articlePath ? articleMappedLocations : section === "tasks" ? taskMappedLocations : section === "activity" ? activityMappedLocations : section === "findings" ? findingsMappedLocations : visibleMappedLocations} selectedId={selectedLocationId} onSelect={(id) => { selectLocation(id); if (reportId) onOpenSection("map", id); }} followSelection={focusSelectedLocation} preserveViewOnFilter={section === "map"} /></div>
      <button type="button" className="panel-resize-handle" aria-label="Drag to resize investigation panel; use left and right arrow keys to adjust" onPointerDown={startPanelDrag} onPointerMove={movePanelDrag} onPointerUp={endPanelDrag} onPointerCancel={endPanelDrag} onKeyDown={movePanelWithKeyboard} />
      <div ref={sheetRef} className="sheet" style={dragTop === null ? undefined : { top: dragTop }}>
        <button type="button" className="sheet-grip" aria-label="Drag to resize investigation details; use up and down arrow keys to adjust" onPointerDown={startSheetDrag} onPointerMove={moveSheetDrag} onPointerUp={endSheetDrag} onPointerCancel={endSheetDrag} onKeyDown={moveSheetWithKeyboard}><span aria-hidden="true" /></button>
        {primaryTabs("desktop-tabs")}
  <div className="dog-gap-layout is-dog-redesign">
    <div className="dog-gap-main">
      {reportId && (report ? <WorkspacePage article title={report.title} subtitle={<><time dateTime={report.occurred_at}>{formatReportDate(report.occurred_at)}</time>{report.location && <> · {report.location}</>}</>} backLink={<a href={reportAssociatedLocationId ? `${tabLink("map")}#${encodeURIComponent(reportAssociatedLocationId)}` : tabLink(section)} onClick={(event) => navigateInternalLink(event, () => {
        if (reportAssociatedLocationId) {
          setSelectedLocationId(reportAssociatedLocationId);
          setFocusSelectedLocation(false);
          setSheetState("partial");
          onOpenSection("map", reportAssociatedLocationId);
        } else onOpenSection(section);
      })}>← {reportAssociatedLocationId ? "Location" : section[0].toUpperCase() + section.slice(1)}</a>}><p>{report.summary}</p><div className="field-report"><FieldReportContent report={report} /></div></WorkspacePage> : <WorkspacePage title="Field report not found" subtitle="This report ID does not match a published field report.">{null}</WorkspacePage>)}
      {!reportId && section === "tasks" && (selectedTask ? <div className="workspace-page"><article aria-label={`Task details: ${selectedTask.title}`}>
          <div className="detail-heading"><div><p className="secondary-text">Task details</p><h1>{selectedTask.title}</h1></div><CloseDetailButton label="task" onClick={backToTasks} /></div>
          <p className="secondary-text">Status: {selectedTask.status === "done" ? "Completed action" : selectedTask.status === "waiting" ? "Waiting for response" : selectedTask.status === "open" ? "Open" : "Cancelled"}</p>
          {selectedTask.completed_at && <p><span className="secondary-text">Completed {fmt(selectedTask.completed_at)}.</span> Completion of this task does not establish the outcome of an application or inquiry.</p>}
          <p>{selectedTask.instructions}</p>
          {selectedTask.location_ids.length > 0 && <section><h2>Locations</h2><ul>{selectedTask.location_ids.map((id) => {
            const location = allLocations.find((item) => item.id === id);
             return location ? <li key={id}>{location.name} · <a href={tabLink("map")} onClick={(event) => navigateInternalLink(event, () => openTaskLocationOnMap(id))}>{location.coordinates ? "Open on map" : "View area details"}</a></li> : null;
          })}</ul><p>These are generalized evidence areas, not current dog locations.</p></section>}
          {selectedTask.map_reference_location_ids?.length ? <section><h2>Nearby map reference</h2><ul>{selectedTask.map_reference_location_ids.map((id) => {
            const location = allLocations.find((item) => item.id === id);
            return location ? <li key={id}>{location.name} · <a href={tabLink("map")} onClick={(event) => navigateInternalLink(event, () => openTaskLocationOnMap(id))}>Open on map</a></li> : null;
          })}</ul><p>This marker identifies the organization, not the field observation site.</p></section> : null}
          {selectedTask.organization_ids.length > 0 && <section><h2>Organizations</h2><ul>{selectedTask.organization_ids.map((id) => {
            const org = organizations.find((item) => item.id === id);
             const mappedLocation = org?.map_location_id ? allLocations.find((item) => item.id === org.map_location_id) : undefined;
             return org ? <li key={id}><a href={`/organizations/${org.slug}/`}>{org.name}</a>{mappedLocation?.coordinates && mappedLocation.marker_kind && mappedLocation.map_label && <> · <a href={tabLink("map")} onClick={(event) => navigateInternalLink(event, () => openTaskLocationOnMap(mappedLocation.id))}>Open on map</a></>}</li> : null;
          })}</ul></section>}
          {selectedTask.checklist && <section><h2>Questions to ask</h2><ul>{selectedTask.checklist.map((item) => <li key={item}>{item}</li>)}</ul></section>}
          {selectedTask.question_ids.length > 0 && <section><h2>Investigation questions</h2><ul>{selectedTask.question_ids.map((id) => <li key={id}>{investigationQuestionById.get(id)?.title}</li>)}</ul></section>}
          {selectedTask.basis_record_ids.length > 0 && <section><h2>Basis and sources</h2><ul>{selectedTask.basis_record_ids.map((id) => <li key={id}>{recordLink(id)}</li>)}</ul></section>}
          {selectedTask.activity_record_ids.length > 0 && <section><h2>Documented activity</h2><ul>{selectedTask.activity_record_ids.map((id) => <li key={id}>{recordLink(id)}</li>)}</ul></section>}
        </article></div> : <WorkspacePage title="Tasks" subtitle="Planned actions and documented completed steps. A planned visit is not a field observation.">
          <div className="map-filters" role="group" aria-label="Task filters">{(["all", "open", "waiting", "done"] as const).map((filter) => <PlainActionButton key={filter} variant="filter" pressed={taskFilter === filter} onClick={() => { setTaskFilter(filter); setSelectedLocationId(""); setFocusSelectedLocation(false); }}>{filter !== "all" && <span className="evidence-dot" style={{ backgroundColor: taskStatusColors[filter] }} aria-hidden="true" />}{filter === "done" ? "Completed" : filter[0].toUpperCase() + filter.slice(1)}</PlainActionButton>)}</div>
          <div className="record-list task-list">{filteredTasks.map((task) => <button type="button" key={task.id} onClick={() => selectTask(task)}>
            <strong className="task-title"><span className="evidence-dot" style={task.status === "cancelled" ? { visibility: "hidden" } : { backgroundColor: taskStatusColors[task.status] }} aria-hidden="true" />{task.title}</strong>
            <small>{task.status === "done" ? `Completed ${fmt(task.completed_at)}` : taskPriorityContext(task)}</small>
          </button>)}</div>
        </WorkspacePage>)}
      {!reportId && section === "activity" && (selectedActivity ? <div className="workspace-page"><article id={selectedActivity.id} aria-label={`Activity details: ${selectedActivity.title}`}>
          <div className="detail-heading"><h1>{selectedActivity.title}</h1><CloseDetailButton label="activity" onClick={() => setSelectedActivityId("")} /></div>
          <p className="secondary-text">{fmt(selectedActivity.occurred_at ?? selectedActivity.recorded_at ?? selectedActivity.published_at)} · {selectedActivity.evidence_status?.replaceAll("_", " ") ?? "Recorded activity"}</p>
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
          <section aria-label="Activity records"><div className="record-list report-list">{activityRecords.map((record) => <button type="button" id={record.id} key={record.id} onClick={() => selectActivity(record)}><strong>{record.title}</strong><small>{fmt(record.occurred_at ?? record.recorded_at ?? record.published_at)} · {record.evidence_status?.replaceAll("_", " ") ?? "Recorded activity"}</small></button>)}</div></section>
          <WorkspaceSection title="Field reports"><div className="record-list report-list">{reportRecords.map((report) => <button type="button" key={report.id} onClick={() => openInvestigationReport(report.id)}><strong>{report.title}</strong><small>{fmt(report.occurred_at)} · {report.location || "Stockton"}</small><span>{report.summary}</span></button>)}</div></WorkspaceSection>
        </WorkspacePage>)}
      {!reportId && section === "map" && (selectedLocation
        ? <CrossoverLocationDetails location={selectedLocation} records={records} tasks={investigationTasks} activities={activityRecords} onBack={backToLocations} onOpenTask={openTaskFromLocation} onOpenReport={openInvestigationReport} />
        : <WorkspacePage title="Locations" subtitle="Markers identify investigation locations and generalized report areas. They do not show where dogs are now.">
          <div className="map-filter-row">
            <MapFilterDropdown value={markerTypeFilter} options={markerTypeOptions} onChange={changeMarkerTypeFilter} onOpen={openMapFilterMenu} ariaLabel="Location type" />
            {showLocationStatusFilters && <MapFilterDropdown value={locationFilter} options={locationFilterOptions} onChange={changeLocationFilter} onOpen={openMapFilterMenu} ariaLabel="Report status" />}
          </div>
          <div className="record-list location-list">{visibleLocations.map((location) => <button type="button" key={location.id} onClick={() => selectLocation(location.id, true)}><strong className="location-title"><span className="evidence-dot" style={{ backgroundColor: evidenceCategoryColors[location.category] }} aria-hidden="true" />{location.name}{location.marker_kind === "major_reported_concern" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D74B45" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Reported historical concern"><path d="M10.7 4.6a1.5 1.5 0 0 1 2.6 0l8.1 13.8a1.5 1.5 0 0 1-1.3-2.3H3.9a1.5 1.5 0 0 1-1.3-2.3Z"/><path d="M12 9v5M12 17.5h.01"/></svg>}</strong><small>{fmt(location.evidence_date)} · {location.verification_status}{!location.coordinates && " · No map pin"}</small></button>)}</div>
          {visibleLocations.length === 0 && <p>No matching locations.</p>}
        </WorkspacePage>)}
      {!reportId && section === "findings" && article && <ArticleContent article={article} onBack={() => onOpenSection("findings")} onOpenReport={openInvestigationReport} />}
      {!reportId && section === "findings" && articlePath && !article && <WorkspacePage title="Article not found" subtitle="This article is not published." backLink={<a href="/work/dogs/findings/">← Findings</a>}>{null}</WorkspacePage>}
      {!reportId && section === "findings" && !articlePath && <WorkspacePage title="Findings" headingId="investigation-findings" subtitle="Propositions evaluated against evidence. Status and limitations are part of each finding.">
        {findingsInvestigation?.findings_summary && <WorkspaceSection title="Summary"><p>{findingsInvestigation.findings_summary}</p></WorkspaceSection>}
        {findingsIntroduction && <WorkspaceSection title={findingsIntroduction.heading} headingId="findings-introduction-heading">
          {findingsIntroduction.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </WorkspaceSection>}
        <WorkspaceSection title="Current findings" headingId="current-findings-heading">
          <div className="record-list">{currentFindings.map((finding) => {
            const relatedArticle = publishedArticles.find((item) => item.id === finding.article_id);
            return <article key={finding.id}>
              <h3>{finding.title}</h3>
              <div>{finding.statement}</div>
              <small>{finding.status.charAt(0).toUpperCase() + finding.status.slice(1).replaceAll("_", " ")}{relatedArticle && <> · <a href={relatedArticle.path} onClick={onOpenArticle ? (event) => navigateInternalLink(event, () => onOpenArticle(relatedArticle.path)) : undefined}>{relatedArticle.title}</a></>}</small>
            </article>;
          })}</div>
        </WorkspaceSection>
      </WorkspacePage>}
    </div>
  </div></div></div></>;
}
