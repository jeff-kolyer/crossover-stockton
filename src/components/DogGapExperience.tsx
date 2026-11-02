
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
import type { PublicRoute } from "./PublicMobileMenu";
import { PublicSiteNav } from "./PublicSiteNav";
import { InvestigationActivitySections } from "./InvestigationActivitySections";
import { InvestigationOverview } from "./InvestigationOverview";
import { dogActivityQuestions } from "../data/dog-activity-questions";
import { organizationActivityHref } from "../lib/organizationActivity";
import { articleLinkLabel, recordLinkLabel } from "../lib/linkLabels";
import type { InvestigationLocation, MappedInvestigationLocation } from "./InvestigationLocations";

type Section = "tasks" | "activity" | "map" | "findings";
type TaskFilter = "open" | "waiting" | "done" | "all";
type MarkerTypeFilter = InvestigationLocation["marker_type"];
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
type LocationStatusFilter = InvestigationLocation["category"];
type MapFilterOption<T extends string> = { value: T; label: string; dotColor?: string };
const locationFilterOptions: MapFilterOption<LocationStatusFilter>[] = [
  { value: "recent_public_report", label: "Recent", dotColor: evidenceCategoryColors.recent_public_report },
  { value: "historical_published_report", label: "Historical", dotColor: evidenceCategoryColors.historical_published_report },
  { value: "official_location_record", label: "Official", dotColor: evidenceCategoryColors.official_location_record },
  { value: "crossover_firsthand", label: "Firsthand", dotColor: evidenceCategoryColors.crossover_firsthand },
];
const markerTypeOptions: MapFilterOption<MarkerTypeFilter>[] = [
  { value: "dog_sighting", label: "Dog sightings" },
  { value: "human_services", label: "Human services" },
  { value: "animal_care", label: "Animal care" },
];

const toggleFilter = <T extends string,>(current: T[], value: T): T[] => current.includes(value)
  ? current.filter((item) => item !== value)
  : [...current, value];

function MarkerTypeFilterIcon({ type }: { type: MarkerTypeFilter }) {
  return <svg className="marker-type-filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {type === "dog_sighting" && <><path d="M2 12s3.7-5.6 10-5.6S22 12 22 12s-3.7 5.6-10 5.6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>}
    {type === "human_services" && <><path d="M11 14h2a2 2 0 0 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16" /><path d="m14.45 13.39 5.05-4.694C20.196 8 21 6.85 21 5.75a2.75 2.75 0 0 0-4.797-1.837.276.276 0 0 1-.406 0A2.75 2.75 0 0 0 11 5.75c0 1.2.802 2.248 1.5 2.946L16 11.95" /><path d="m2 15 6 6" /><path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a1 1 0 0 0-2.75-2.91" /></>}
    {type === "animal_care" && <><circle cx="11" cy="4" r="2" /><circle cx="18" cy="8" r="2" /><circle cx="20" cy="16" r="2" /><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" /></>}
  </svg>;
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

export function DogGapExperience({ gap, section, workspaceBasePath, articlePath, reportId, reportLocationId, googleExperiment = false, onOpenArticle, onOpenSection, onNavigate, onOpenReport }: {
  gap: GapRecord; section: Section; onOpenSection: (section: Section, anchor?: string) => void;
  workspaceBasePath: string;
  articlePath?: string;
  reportId?: string;
  reportLocationId?: string;
  googleExperiment?: boolean;
  onOpenArticle?: (path: string) => void;
  onNavigate: (page: PublicRoute) => void;
  onOpenReport: (id: string, locationId?: string) => void;
}) {
  const [sheetState, setSheetState] = useState<"collapsed" | "peek" | "partial" | "expanded">(section === "map" ? "peek" : "expanded");
  const [panelWidth, setPanelWidth] = useState<number | null>(null);
  const [dragTop, setDragTop] = useState<number | null>(null);
  const [isSheetDragging, setIsSheetDragging] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; startY: number; startTop: number; height: number; maxTop: number } | null>(null);
  const panelDragRef = useRef<{ pointerId: number; startX: number; startWidth: number } | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [focusSelectedLocation, setFocusSelectedLocation] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [showOverview, setShowOverview] = useState(false);
  const [showMapFilters, setShowMapFilters] = useState(false);
  const overviewLinkRef = useRef<HTMLAnchorElement>(null);
  const mapFilterButtonRef = useRef<HTMLButtonElement>(null);
  const overviewReturnRef = useRef<{ sheetState: typeof sheetState; dragTop: number | null; scrollTop: number } | null>(null);
  const mapFilterReturnRef = useRef<{ sheetState: typeof sheetState; dragTop: number | null; scrollTop: number } | null>(null);
  const routeIdentity = `${section}|${articlePath ?? ""}|${reportId ?? ""}`;
  const previousRouteIdentity = useRef(routeIdentity);
  useEffect(() => {
    if (previousRouteIdentity.current === routeIdentity) return;
    previousRouteIdentity.current = routeIdentity;
    setShowOverview(false);
    overviewReturnRef.current = null;
    setShowMapFilters(false);
    mapFilterReturnRef.current = null;
  }, [routeIdentity]);
  const [locationFilters, setLocationFilters] = useState<LocationStatusFilter[]>([]);
  const [markerTypeFilters, setMarkerTypeFilters] = useState<MarkerTypeFilter[]>([]);
  const [pendingLocationFilters, setPendingLocationFilters] = useState<LocationStatusFilter[]>([]);
  const [pendingMarkerTypeFilters, setPendingMarkerTypeFilters] = useState<MarkerTypeFilter[]>([]);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("all");
  const showTaskLocation = (task: InvestigationTask) => {
    setTaskFilter((current) => current === "all" || current === task.status ? current : task.status === "cancelled" ? "all" : task.status);
    const location = taskMappedLocation(task) ?? allLocations.find((item) => task.location_ids.includes(item.id));
    setSelectedLocationId(location?.id ?? "");
    setFocusSelectedLocation(Boolean(location?.coordinates));
  };
  useEffect(() => {
    setSheetState(section === "map" ? selectedLocationId ? "partial" : "peek" : "expanded");
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
    setLocationFilters([]);
    setSelectedLocationId(location.id);
    setFocusSelectedLocation(Boolean(location.coordinates));
    setSheetState("partial");
  }, [section]);
  const visibleLocations = useMemo(() => allLocations.filter((location) =>
    (markerTypeFilters.length === 0 || markerTypeFilters.includes(location.marker_type))
    && (locationFilters.length === 0 || locationFilters.includes(location.category))
  ), [locationFilters, markerTypeFilters]);
  const visibleMappedLocations = useMemo(() => visibleLocations.filter((location): location is MappedInvestigationLocation => location.coordinates !== null && location.marker_kind !== null && location.map_label !== null), [visibleLocations]);
  const filteredTasks = useMemo(() => orderInvestigationTasks(investigationTasks).filter((task) => taskFilter === "all" || task.status === taskFilter), [taskFilter]);
  const taskMappedLocations = useMemo(() => {
    const locationIds = new Set(filteredTasks.flatMap(mappedLocationIdsFor));
    return mappedLocations.filter((location) => locationIds.has(location.id));
  }, [filteredTasks]);
  const activityMappedLocations = useMemo(() => {
    const locationIds = new Set(investigationActivities.flatMap(activityMappedLocationIds));
    return mappedLocations.filter((location) => locationIds.has(location.id));
  }, []);
  const article = articlePath ? articleForPath(articlePath) : undefined;
  const report = reportId ? records.find((record) => record.id === reportId && record.record_type === "field_report") : undefined;
  const reportAssociatedLocationId = reportLocationId ?? report?.location_ids?.[0] ?? report?.organization_ids.map((id) => organizations.find((org) => org.id === id)?.map_location_id).find(Boolean);
  const reportMappedLocations = useMemo(() => mappedLocations.filter((location) => location.id === reportAssociatedLocationId), [reportAssociatedLocationId]);
  const articleMappedLocations = useMemo(() => {
    const locationIds = new Set(article?.related_location_ids ?? []);
    return mappedLocations.filter((location) => locationIds.has(location.id));
  }, [article]);
  const selectedLocation = allLocations.find((location) => location.id === selectedLocationId);
  useEffect(() => {
    if (!reportId) return;
    setSelectedLocationId(reportAssociatedLocationId ?? "");
    setFocusSelectedLocation(Boolean(reportAssociatedLocationId));
    setDragTop(null);
    setSheetState("expanded");
    sheetRef.current?.scrollTo({ top: 0 });
  }, [reportId, reportAssociatedLocationId]);
  const selectedTask = investigationTasks.find((task) => task.id === selectedTaskId);
  const findingsInvestigation = activeInvestigations.find((investigation) => investigation.gap_id === gap.id);
  const findingsIntroduction = findingsInvestigation?.findings_introduction;
  const currentFindings = useMemo(() => investigationFindings.filter((finding) => finding.investigation_id === findingsInvestigation?.id && finding.current !== false), [findingsInvestigation?.id]);
  const findingsMappedLocations = useMemo(() => {
    const locationIds = new Set(currentFindings.flatMap((finding) => [
      ...finding.location_ids,
      ...(publishedArticles.find((article) => article.id === finding.article_id)?.related_location_ids ?? []),
    ]));
    return mappedLocations.filter((location) => locationIds.has(location.id));
  }, [currentFindings]);
  const tabLink = (id: Section) => `${workspaceBasePath}${id}/${googleExperiment ? "?ui=google" : ""}`;
  const openOverview = () => {
    if (showOverview) return;
    overviewReturnRef.current = showMapFilters && mapFilterReturnRef.current ? mapFilterReturnRef.current : { sheetState, dragTop, scrollTop: sheetRef.current?.scrollTop ?? 0 };
    setShowMapFilters(false);
    mapFilterReturnRef.current = null;
    setShowOverview(true);
    setDragTop(null);
    setSheetState("expanded");
    sheetRef.current?.scrollTo({ top: 0 });
  };
  const closeOverview = () => {
    const previous = overviewReturnRef.current;
    setShowOverview(false);
    if (previous) {
      setSheetState(previous.sheetState);
      setDragTop(previous.dragTop);
      requestAnimationFrame(() => sheetRef.current?.scrollTo({ top: previous.scrollTop }));
    }
    overviewReturnRef.current = null;
    if (section === "activity" && window.location.hash === "#overview") window.history.replaceState({}, "", `${window.location.pathname}${window.location.search}`);
    overviewLinkRef.current?.focus();
  };
  const openPrimary = (tab: "tasks" | "activity" | "map" | "findings", anchor?: string) => {
    setShowOverview(false);
    overviewReturnRef.current = null;
    setShowMapFilters(false);
    mapFilterReturnRef.current = null;
    setSelectedTaskId("");
    setSelectedActivityId("");
    setSelectedLocationId("");
    setFocusSelectedLocation(false);
    setDragTop(null);
    setSheetState(tab === "map" ? "peek" : "expanded");
    sheetRef.current?.scrollTo({ top: 0 });
    onOpenSection(tab, anchor);
  };
  const selectLocation = (id: string, focus = false) => {
    setShowMapFilters(false);
    mapFilterReturnRef.current = null;
    setSelectedTaskId("");
    setSelectedLocationId(id);
    setFocusSelectedLocation(focus);
    setDragTop(null);
    setSheetState("partial");
    sheetRef.current?.scrollTo({ top: 0 });
    if (section !== "map") {
      setLocationFilters([]);
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
    setDragTop(null);
    setSheetState("expanded");
    sheetRef.current?.scrollTo({ top: 0 });
  };
  const selectActivity = (activity: EvidenceRecord) => {
    const location = activityMappedLocation(activity);
    setSelectedActivityId(activity.id);
    setSelectedLocationId(location?.id ?? "");
    setFocusSelectedLocation(Boolean(location));
    setDragTop(null);
    setSheetState("expanded");
    sheetRef.current?.scrollTo({ top: 0 });
  };
  const activityAnchor = typeof window === "undefined" ? "" : decodeURIComponent(window.location.hash.slice(1));
  useEffect(() => {
    if (section === "activity" && activityAnchor === "overview") openOverview();
  }, [section, activityAnchor]);
  useEffect(() => {
    if (section !== "activity") return;
    const activity = investigationActivities.find((record) => record.id === activityAnchor);
    if (activity) { selectActivity(activity); return; }
    setSelectedActivityId("");
    if (activityAnchor && activityAnchor !== "overview") requestAnimationFrame(() => document.getElementById(activityAnchor)?.scrollIntoView({ block: "start" }));
  }, [section, activityAnchor]);
  useEffect(() => {
    if (section !== "findings" || !activityAnchor) return;
    requestAnimationFrame(() => document.getElementById(activityAnchor)?.scrollIntoView({ block: "start" }));
  }, [section, activityAnchor, articlePath]);
  const openTaskFromLocation = (task: InvestigationTask) => {
    selectTask(task);
    onOpenSection("tasks");
  };
  const backToTasks = () => {
    setSelectedTaskId("");
    setDragTop(null);
    setSheetState("expanded");
    sheetRef.current?.scrollTo({ top: 0 });
  };
  const backToLocations = () => {
    setSelectedLocationId("");
    setFocusSelectedLocation(false);
    sheetRef.current?.scrollTo({ top: 0 });
  };
  const applyMapFilters = (types: MarkerTypeFilter[], reports: LocationStatusFilter[]) => {
    setMarkerTypeFilters(types);
    setLocationFilters(reports);
    setFocusSelectedLocation(false);
    const selected = allLocations.find((location) => location.id === selectedLocationId);
    if (selected && ((reports.length > 0 && !reports.includes(selected.category)) || (types.length > 0 && !types.includes(selected.marker_type)))) setSelectedLocationId("");
  };
  const openMapFilters = () => {
    setPendingMarkerTypeFilters([...markerTypeFilters]);
    setPendingLocationFilters([...locationFilters]);
    mapFilterReturnRef.current = { sheetState, dragTop, scrollTop: sheetRef.current?.scrollTop ?? 0 };
    setShowMapFilters(true);
    setDragTop(null);
    setSheetState("expanded");
    sheetRef.current?.scrollTo({ top: 0 });
  };
  const closeMapFilters = (apply = false) => {
    if (apply) applyMapFilters(pendingMarkerTypeFilters, pendingLocationFilters);
    const previous = mapFilterReturnRef.current;
    setShowMapFilters(false);
    if (previous) {
      setSheetState(previous.sheetState);
      setDragTop(previous.dragTop);
      requestAnimationFrame(() => sheetRef.current?.scrollTo({ top: previous.scrollTop }));
    }
    mapFilterReturnRef.current = null;
    requestAnimationFrame(() => mapFilterButtonRef.current?.focus());
  };
  const sheetPositions = ["expanded", "partial", "peek", "collapsed"] as const;
  function startSheetDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!window.matchMedia("(max-width: 1023px)").matches) return;
    const map = mapRef.current;
    if (!map) return;
    const height = map.getBoundingClientRect().height;
    const sheet = event.currentTarget.parentElement!;
    dragRef.current = { pointerId: event.pointerId, startY: event.clientY, startTop: sheet.getBoundingClientRect().top - map.getBoundingClientRect().top, height, maxTop: Math.max(0, height - event.currentTarget.getBoundingClientRect().height - parseFloat(getComputedStyle(sheet).borderTopWidth)) };
    setIsSheetDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function moveSheetDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setDragTop(Math.max(0, Math.min(drag.maxTop, drag.startTop + event.clientY - drag.startY)));
  }
  function endSheetDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const top = Math.max(0, Math.min(drag.maxTop, drag.startTop + event.clientY - drag.startY));
    const peekHeight = parseFloat(getComputedStyle(workspaceRef.current!).getPropertyValue("--sheet-peek-height"));
    const keyboardStops = [0, drag.height * .42, Math.max(0, drag.height - peekHeight), drag.maxTop];
    const nearest = keyboardStops.reduce((best, value, index) => Math.abs(top - value) < Math.abs(top - keyboardStops[best]) ? index : best, 0);
    setSheetState(sheetPositions[nearest]);
    setDragTop(top);
    setIsSheetDragging(false);
    dragRef.current = null;
  }
  function moveSheetWithKeyboard(event: ReactKeyboardEvent<HTMLButtonElement>) {
    const index = sheetPositions.indexOf(sheetState);
    const next = event.key === "ArrowUp" ? sheetPositions[Math.max(0, index - 1)]
      : event.key === "ArrowDown" ? sheetPositions[Math.min(sheetPositions.length - 1, index + 1)]
        : event.key === "Home" ? "expanded" : event.key === "End" ? "collapsed" : null;
    if (next) { event.preventDefault(); setDragTop(null); setSheetState(next); }
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
  const reportHref = (id: string, locationId?: string) => `/work/dogs/reports/${encodeURIComponent(id)}/?from=${section}${locationId ? `&location=${encodeURIComponent(locationId)}` : ""}${googleExperiment ? "&ui=google" : ""}`;
  const openInvestigationReport = (id: string, locationId?: string) => onOpenReport(id, locationId ?? (selectedLocationId || undefined));
  const recordLink = (id: string) => {
    const record = investigationRecordById.get(id);
    if (!record) return null;
    if (record.record_type === "field_report") return <a key={id} href={reportHref(id, selectedLocationId || undefined)} onClick={(event) => navigateInternalLink(event, () => openInvestigationReport(id))}>{recordLinkLabel(record)}</a>;
    if (record.record_type === "activity") return <a key={id} href={`/work/dogs/activity/#${encodeURIComponent(id)}`}>{recordLinkLabel(record)}</a>;
    if (record.source.url) return <a key={id} href={record.source.url} target="_blank" rel="noreferrer">{recordLinkLabel(record)}</a>;
    return <span key={id}>{record.title}</span>;
  };
  const primaryTabs = () => <nav className="primary-tabs" aria-label="Investigation sections">{(["tasks", "activity", "map", "findings"] as const).map((tab) => <a key={tab} href={tabLink(tab)} aria-current={section === tab ? "page" : undefined} onClick={(event) => navigateInternalLink(event, () => openPrimary(tab))}>{tab[0].toUpperCase() + tab.slice(1)}</a>)}</nav>;
  const nextTask = orderInvestigationTasks(investigationTasks).find((task) => task.status === "open");
  const nextTaskLabel = nextTask?.id === "task-verify-st-marys-church-street-dog-scale" ? "Verify conditions at St. Mary’s" : nextTask?.title;
  const investigationHeader = (className: string) => <div className={`investigation-header ${className}`}>
    <PublicSiteNav active="investigation" onNavigate={onNavigate} variant="investigation" />
    <header className="investigation-identity">
      <div className="investigation-identity-inner">
      <img className="investigation-dog-icon" src="/images/reality/dog-thumb.jpg" alt="" width="61" height="61" />
      <div className="investigation-identity-copy">
        <h2>Dogs on the street in Stockton</h2>
        <div className="investigation-identity-meta">
          <a ref={overviewLinkRef} href="/work/dogs/about/" onClick={(event) => navigateInternalLink(event, openOverview)}>Overview</a>
          {nextTask && <a className="investigation-identity-next" href={`${tabLink("tasks")}#${encodeURIComponent(nextTask.id)}`} onClick={(event) => navigateInternalLink(event, () => { setShowOverview(false); overviewReturnRef.current = null; setShowMapFilters(false); mapFilterReturnRef.current = null; selectTask(nextTask); onOpenSection("tasks", nextTask.id); })}><span>Next:</span> {nextTaskLabel}</a>}
        </div>
      </div>
      </div>
    </header>
    <div className="investigation-tabs-band">{primaryTabs()}</div>
  </div>;

  return <>
    <div ref={workspaceRef} className={`map-workspace is-${sheetState}${isSheetDragging ? " is-dragging" : ""}`} style={panelWidth !== null ? { "--crossover-expanded-panel-width": `${panelWidth}px` } as CSSProperties : undefined}>
      {investigationHeader("workspace-header")}
      <div ref={mapRef} className="shared-map"><DogGapOverviewMap locations={reportId ? reportMappedLocations : articlePath ? articleMappedLocations : section === "tasks" ? taskMappedLocations : section === "activity" ? activityMappedLocations : section === "findings" ? findingsMappedLocations : visibleMappedLocations} selectedId={selectedLocationId} onSelect={(id) => { selectLocation(id); if (reportId) onOpenSection("map", id); }} followSelection={focusSelectedLocation} preserveViewOnFilter /></div>
      <button type="button" className="panel-resize-handle" aria-label="Drag to resize investigation panel; use left and right arrow keys to adjust" onPointerDown={startPanelDrag} onPointerMove={movePanelDrag} onPointerUp={endPanelDrag} onPointerCancel={endPanelDrag} onKeyDown={movePanelWithKeyboard} />
      <div ref={sheetRef} className="sheet" style={dragTop === null ? undefined : { top: dragTop }}>
        <button type="button" className="sheet-grip" aria-label="Drag to resize investigation details; use up and down arrow keys to adjust" onPointerDown={startSheetDrag} onPointerMove={moveSheetDrag} onPointerUp={endSheetDrag} onPointerCancel={endSheetDrag} onKeyDown={moveSheetWithKeyboard}><span aria-hidden="true" /></button>
  <div className="dog-gap-layout is-dog-redesign">
    <div className="dog-gap-main">
      {showOverview && <div className="workspace-page" aria-label="Investigation overview">
        <div className="detail-heading"><p className="secondary-text">Overview</p><CloseDetailButton label="overview" onClick={closeOverview} /></div>
        <InvestigationOverview />
        <p><a href={tabLink("findings")} onClick={(event) => navigateInternalLink(event, () => openPrimary("findings"))}>See findings</a></p>
      </div>}
      <div hidden={showOverview}>
      {reportId && (report ? <WorkspacePage article title={report.title} subtitle={<><time dateTime={report.occurred_at}>{formatReportDate(report.occurred_at)}</time>{report.location && <> · {report.location}</>}</>} backLink={<a href={reportAssociatedLocationId ? `${tabLink("map")}#${encodeURIComponent(reportAssociatedLocationId)}` : tabLink(section)} onClick={(event) => navigateInternalLink(event, () => {
        if (reportAssociatedLocationId) {
          setSelectedLocationId(reportAssociatedLocationId);
          setFocusSelectedLocation(false);
          setSheetState("partial");
          onOpenSection("map", reportAssociatedLocationId);
        } else onOpenSection(section);
      })}>← {reportAssociatedLocationId ? "Location" : section[0].toUpperCase() + section.slice(1)}</a>}><p>{report.summary}</p><div className="field-report"><FieldReportContent report={report} /></div></WorkspacePage> : <WorkspacePage title="Field report not found" subtitle="This report ID does not match a published field report.">{null}</WorkspacePage>)}
      {!reportId && section === "tasks" && (selectedTask ? <div className="workspace-page"><article aria-label={`Task details: ${selectedTask.title}`}>
          <div className="detail-heading"><div><p className="secondary-text">Task details</p><h2>{selectedTask.title}</h2></div><CloseDetailButton label="task" onClick={backToTasks} /></div>
          <p className="secondary-text">Status: {selectedTask.status === "done" ? "Completed action" : selectedTask.status === "waiting" ? "Waiting for response" : selectedTask.status === "open" ? "Open" : "Cancelled"}</p>
          {selectedTask.completed_at && <p><span className="secondary-text">Completed {fmt(selectedTask.completed_at)}.</span> Completion of this task does not establish the outcome of an application or inquiry.</p>}
          <p>{selectedTask.instructions}</p>
          {selectedTask.location_ids.length > 0 && <section><h3>Locations</h3><ul>{selectedTask.location_ids.map((id) => {
            const location = allLocations.find((item) => item.id === id);
              return location ? <li key={id}>{location.name} · <a href={tabLink("map")} aria-label={`${location.coordinates ? "Open on map" : "View area details"}: ${location.name}`} onClick={(event) => navigateInternalLink(event, () => openTaskLocationOnMap(id))}>{location.coordinates ? "Open on map" : "View area details"}</a></li> : null;
          })}</ul><p>These are generalized evidence areas, not current dog locations.</p></section>}
          {selectedTask.map_reference_location_ids?.length ? <section><h3>Nearby map reference</h3><ul>{selectedTask.map_reference_location_ids.map((id) => {
            const location = allLocations.find((item) => item.id === id);
             return location ? <li key={id}>{location.name} · <a href={tabLink("map")} aria-label={`Open on map: ${location.name}`} onClick={(event) => navigateInternalLink(event, () => openTaskLocationOnMap(id))}>Open on map</a></li> : null;
          })}</ul><p>This marker identifies the organization, not the field observation site.</p></section> : null}
          {selectedTask.organization_ids.length > 0 && <section><h3>Organizations</h3><ul>{selectedTask.organization_ids.map((id) => {
            const org = organizations.find((item) => item.id === id);
             const mappedLocation = org?.map_location_id ? allLocations.find((item) => item.id === org.map_location_id) : undefined;
               return org ? <li key={id}><a href={organizationActivityHref(org.slug)}>{org.name}</a>{mappedLocation?.coordinates && mappedLocation.marker_kind && mappedLocation.map_label && <> · <a href={tabLink("map")} aria-label={`Open on map: ${org.name}`} onClick={(event) => navigateInternalLink(event, () => openTaskLocationOnMap(mappedLocation.id))}>Open on map</a></>}</li> : null;
          })}</ul></section>}
          {selectedTask.checklist && <section><h3>Questions to ask</h3><ul>{selectedTask.checklist.map((item) => <li key={item}>{item}</li>)}</ul></section>}
          {selectedTask.question_ids.length > 0 && <section><h3>Investigation questions</h3><ul>{selectedTask.question_ids.map((id) => <li key={id}>{investigationQuestionById.get(id)?.title}</li>)}</ul></section>}
          {selectedTask.basis_record_ids.length > 0 && <section><h3>Basis and sources</h3><ul>{selectedTask.basis_record_ids.map((id) => <li key={id}>{recordLink(id)}</li>)}</ul></section>}
          {selectedTask.activity_record_ids.length > 0 && <section><h3>Documented activity</h3><ul>{selectedTask.activity_record_ids.map((id) => <li key={id}>{recordLink(id)}</li>)}</ul></section>}
        </article></div> : <WorkspacePage title="Tasks">
          <div className="map-filters filter-buttons" role="group" aria-label="Task filters">{(["all", "open", "waiting", "done"] as const).map((filter) => <PlainActionButton key={filter} variant="selection" pressed={taskFilter === filter} onClick={() => { setTaskFilter(filter); setSelectedLocationId(""); setFocusSelectedLocation(false); }}>{filter !== "all" && <span className="evidence-dot" style={{ backgroundColor: taskStatusColors[filter] }} aria-hidden="true" />}{filter === "done" ? "Completed" : filter[0].toUpperCase() + filter.slice(1)}</PlainActionButton>)}</div>
          <div className="record-list task-list">{filteredTasks.map((task) => <button type="button" key={task.id} onClick={() => selectTask(task)}>
            <strong className="task-title"><span className="evidence-dot" style={task.status === "cancelled" ? { visibility: "hidden" } : { backgroundColor: taskStatusColors[task.status] }} aria-hidden="true" />{task.title}</strong>
            <small>{task.status === "done" ? `Completed ${fmt(task.completed_at)}` : taskPriorityContext(task)}</small>
          </button>)}</div>
        </WorkspacePage>)}
      {!reportId && section === "activity" && (selectedActivity ? <div className="workspace-page"><article id={selectedActivity.id} aria-label={`Activity details: ${selectedActivity.title}`}>
          <div className="detail-heading"><h2>{selectedActivity.title}</h2><CloseDetailButton label="activity" onClick={() => setSelectedActivityId("")} /></div>
          <p className="secondary-text">{fmt(selectedActivity.occurred_at ?? selectedActivity.recorded_at ?? selectedActivity.published_at)} · {selectedActivity.evidence_status?.replaceAll("_", " ") ?? "Recorded activity"}</p>
          <p>{selectedActivity.summary}</p>
          {selectedActivity.outcome && <p><strong>Outcome:</strong> {selectedActivity.outcome.summary}</p>}
          {selectedActivity.organization_ids.length > 0 && <p>Organizations: {selectedActivity.organization_ids.map((id) => {
            const org = organizations.find((item) => item.id === id);
            return org ? <a key={id} href={organizationActivityHref(org.slug)} onClick={(event) => navigateInternalLink(event, () => { window.history.pushState({}, "", organizationActivityHref(org.slug)); setSelectedActivityId(""); })}>{org.name}</a> : null;
          })}</p>}
          {investigationTasks.filter((task) => task.activity_record_ids.includes(selectedActivity.id)).map((task) => <p key={task.id}>Task: <button type="button" onClick={() => openTaskFromLocation(task)}>{task.title}</button></p>)}
          {(selectedActivity.report_record_ids ?? []).map((id) => <p key={id}>Field report: {recordLink(id)}</p>)}
           {selectedActivity.source.url && <a href={selectedActivity.source.url} target="_blank" rel="noreferrer">{recordLinkLabel(selectedActivity)}</a>}
        </article></div> : <InvestigationActivitySections activities={activityRecords} reports={reportRecords} activeAnchor={activityAnchor} activeQuestionId={dogActivityQuestions.some((question) => question.id === activityAnchor) ? activityAnchor : activityAnchor === "organizations" || activityAnchor.startsWith("organization-") ? "question-care" : undefined} onOpenActivity={selectActivity} onOpenReport={openInvestigationReport} onOpenFindings={(anchor) => onOpenSection("findings", anchor)} />)}
      {!reportId && section === "map" && (showMapFilters
        ? <div className="workspace-page">
          <div className="detail-heading"><h2>Filters</h2><CloseDetailButton label="filters" onClick={() => closeMapFilters()} /></div>
          <section aria-labelledby="location-type-filter-heading">
            <h3 id="location-type-filter-heading">Location type</h3>
            <div className="map-filters filter-buttons" role="group" aria-label="Location type filters">{markerTypeOptions.map((option) => <PlainActionButton key={option.value} variant="selection" tone="light-blue" pressed={pendingMarkerTypeFilters.includes(option.value)} onClick={() => setPendingMarkerTypeFilters((current) => toggleFilter(current, option.value))}><MarkerTypeFilterIcon type={option.value} />{option.label}</PlainActionButton>)}</div>
          </section>
          <section aria-labelledby="report-type-filter-heading">
            <h3 id="report-type-filter-heading">Report type</h3>
            <div className="map-filters filter-buttons" role="group" aria-label="Report type filters">{locationFilterOptions.map((option) => <PlainActionButton key={option.value} variant="selection" tone="light-blue" pressed={pendingLocationFilters.includes(option.value)} onClick={() => setPendingLocationFilters((current) => toggleFilter(current, option.value))}>{option.dotColor && <span className="evidence-dot" style={{ backgroundColor: option.dotColor }} aria-hidden="true" />}{option.label}</PlainActionButton>)}</div>
          </section>
          <div className="map-filter-actions"><PlainActionButton onClick={() => { setPendingMarkerTypeFilters([]); setPendingLocationFilters([]); }}>Clear all</PlainActionButton><PlainActionButton onClick={() => closeMapFilters(true)}>Apply</PlainActionButton></div>
        </div>
        : selectedLocation
        ? <CrossoverLocationDetails location={selectedLocation} records={records} tasks={investigationTasks} activities={activityRecords} onBack={backToLocations} onOpenTask={openTaskFromLocation} onOpenReport={openInvestigationReport} />
        : <div className="workspace-page">
          <div className="detail-heading"><h2>Locations</h2><PlainActionButton buttonRef={mapFilterButtonRef} onClick={openMapFilters}><svg className="map-filter-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4" /></svg>Filters</PlainActionButton></div>
          {(markerTypeFilters.length > 0 || locationFilters.length > 0) && <div className="map-filters filter-buttons map-active-filters" role="group" aria-label="Active location filters">
            {markerTypeOptions.filter((option) => markerTypeFilters.includes(option.value)).map((option) => <PlainActionButton key={option.value} variant="applied-filter" ariaLabel={`Remove ${option.label} filter`} onClick={() => applyMapFilters(markerTypeFilters.filter((value) => value !== option.value), locationFilters)}><MarkerTypeFilterIcon type={option.value} />{option.label}<span className="map-filter-remove" aria-hidden="true">×</span></PlainActionButton>)}
            {locationFilterOptions.filter((option) => locationFilters.includes(option.value)).map((option) => <PlainActionButton key={option.value} variant="applied-filter" ariaLabel={`Remove ${option.label} filter`} onClick={() => applyMapFilters(markerTypeFilters, locationFilters.filter((value) => value !== option.value))}><span className="evidence-dot" style={{ backgroundColor: option.dotColor }} aria-hidden="true" />{option.label}<span className="map-filter-remove" aria-hidden="true">×</span></PlainActionButton>)}
          </div>}
          <div className="record-list location-list">{visibleLocations.map((location) => <button type="button" key={location.id} onClick={() => selectLocation(location.id, true)}><strong className="location-title"><span className="evidence-dot" style={{ backgroundColor: evidenceCategoryColors[location.category] }} aria-hidden="true" />{location.name}{location.marker_kind === "major_reported_concern" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D74B45" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Reported historical concern"><path d="m10.29 3.86-8.47 14.14A2 2 0 0 0 3.53 21h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v5M12 17.5h.01"/></svg>}</strong><small>{fmt(location.evidence_date)} · {location.verification_status}{!location.coordinates && " · No map pin"}</small></button>)}</div>
          {visibleLocations.length === 0 && <p>No matching locations.</p>}
        </div>)}
      {!reportId && section === "findings" && article && <ArticleContent article={article} onBack={() => onOpenSection("findings")} onOpenReport={openInvestigationReport} />}
      {!reportId && section === "findings" && articlePath && !article && <WorkspacePage title="Article not found" subtitle="This article is not published." backLink={<a href="/work/dogs/findings/">← Findings</a>}>{null}</WorkspacePage>}
      {!reportId && section === "findings" && !articlePath && <div className="workspace-page">
        {findingsInvestigation?.findings_summary && <WorkspaceSection title="Summary" headingId="investigation-findings"><p>{findingsInvestigation.findings_summary}</p></WorkspaceSection>}
        {findingsIntroduction && <WorkspaceSection title={findingsIntroduction.heading} headingId="findings-introduction-heading">
          {findingsIntroduction.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </WorkspaceSection>}
        <WorkspaceSection title="Findings" headingId="current-findings-heading">
          {dogActivityQuestions.map((question, index) => {
            const questionFindings = currentFindings.filter((finding) => finding.primary_question_id === question.id);
            return <section id={question.id} className="investigation-finding-question" aria-labelledby={`${question.id}-findings-title`} key={question.id}>
              <h3 id={`${question.id}-findings-title`}>{index + 1}. {question.title}</h3>
              {questionFindings.length ? <div className="record-list">{questionFindings.map((finding) => {
                const relatedArticle = publishedArticles.find((item) => item.id === finding.article_id);
                return <article id={finding.id} key={finding.id}>
                  <h4>{finding.title}</h4>
                  <div>{finding.statement}</div>
                   <small>{finding.status.charAt(0).toUpperCase() + finding.status.slice(1).replaceAll("_", " ")} · Reviewed {fmt(finding.last_reviewed_at)}{relatedArticle && <> · <a href={`${relatedArticle.path}${googleExperiment ? "?ui=google" : ""}`} onClick={onOpenArticle ? (event) => navigateInternalLink(event, () => onOpenArticle(relatedArticle.path)) : undefined}>{articleLinkLabel(relatedArticle)}</a></>}</small>
                  <p><strong>Limitations:</strong> {finding.limitations}</p>
                  <p><strong>Evidence:</strong> {finding.supporting_record_ids.map((id, evidenceIndex) => <span key={id}>{evidenceIndex > 0 && "; "}{recordLink(id)}</span>)}</p>
                </article>;
              })}</div> : <p>No established finding yet.</p>}
               <p><a href={`/work/dogs/activity/#${question.id}`} aria-label={`See activity: ${question.title}`} onClick={(event) => navigateInternalLink(event, () => onOpenSection("activity", question.id))}>See activity</a></p>
            </section>;
          })}
        </WorkspaceSection>
      </div>}
      </div>
    </div>
  </div></div></div></>;
}
