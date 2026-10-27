import { useEffect, useState } from "react";
import gapsData from "./data/gaps.json";
import { ActionModal } from "./components/ActionModal";
import { ActionIndexPage } from "./components/ActionIndexPage";
import { AboutPage } from "./components/AboutPage";
import { GapDetailPage } from "./components/GapDetailPage";
import { GapReferencePage } from "./components/GapReferencePage";
import { GapSourcesPage } from "./components/GapSourcesPage";
import { GapUpdatesPage } from "./components/GapUpdatesPage";
import { WorkPage } from "./components/WorkPage";
import { FieldReportPage } from "./components/FieldReportPage";
import { HomePage } from "./components/HomePage";
import { OrganizationsPage } from "./components/OrganizationsPage";
import { StoryDetailPage } from "./components/StoryDetailPage";
import { UpdatesPage } from "./components/UpdatesPage";
import storiesData from "./data/stories.json";
import workData from "./data/work.json";
import recordsData from "./data/records.json";
import orgsData from "./data/orgs.json";
import type { EvidenceRecord, GapRecord, OrgRecord, PublicActionRecord, StoryRecord } from "./types";
import { dogGapBase, dogGapSlug, legacyDogWorkDestination } from "./lib/dogGapLegacy";

const gaps = gapsData as GapRecord[];
const stories = storiesData as StoryRecord[];
const work = workData as { id: string; title: string }[];
const reports = (recordsData as EvidenceRecord[]).filter((record) => record.record_type === "field_report");
const organizations = orgsData as OrgRecord[];

type AppRoute = "home" | "workIndex" | "workInvestigation" | "reality" | "gapDetail" | "gapUpdates" | "gapSources" | "work" | "report" | "storyDetail" | "connection" | "action" | "updates" | "about" | "organizations" | "organizationDetail";
type WorkSection = "tasks" | "activity" | "map" | "findings";
const investigations = [{ slug: "dogs", id: "street-dog-immediate-welfare", gapSlug: dogGapSlug, title: "Dogs on the street in Stockton" }] as const;
const workSections: WorkSection[] = ["tasks", "activity", "map", "findings"];

interface RouteState {
  page: AppRoute;
  gapSlug?: string;
  gapSection?: "overview" | "tasks" | "activity" | "reports" | "map" | "findings" | "more" | "key-factors" | "ways-to-help" | "improvements" | "our-findings" | "research" | "updates";
  storySlug?: string;
  workId?: string;
  reportId?: string;
  organizationSlug?: string;
  investigationSlug?: string;
  workSection?: WorkSection;
}

const ROUTE_PATHS: Record<Exclude<AppRoute, "gapDetail" | "gapUpdates" | "gapSources" | "work" | "workInvestigation" | "report" | "storyDetail" | "organizationDetail">, string> = {
  home: "/",
  workIndex: "/work/",
  reality: "/reality/",
  connection: "/connection/",
  action: "/action/",
  updates: "/updates/",
  about: "/about/",
  organizations: "/organizations/",
};

function routeFromPathname(pathname: string): RouteState {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (normalized === "/work") return { page: "workIndex" };
  if (normalized === `${dogGapBase}about`.replace(/\/$/, "")) return { page: "gapDetail", gapSlug: dogGapSlug, gapSection: "overview" };
  const workInvestigation = normalized.match(/^\/work\/([^/]+)(?:\/(tasks|activity|map|findings))?$/);
  if (workInvestigation && investigations.some((item) => item.slug === workInvestigation[1])) return { page: "workInvestigation", investigationSlug: workInvestigation[1], workSection: (workInvestigation[2] as WorkSection | undefined) ?? "tasks" };
  if (normalized === "/action/look-for-dogs-on-the-street") return { page: "workInvestigation", investigationSlug: "dogs", workSection: "tasks" };
  const organizationDetail = normalized.match(/^\/organizations\/([^/]+)$/);
  if (organizationDetail) return { page: "organizationDetail", organizationSlug: decodeURIComponent(organizationDetail[1]) };
  const gapSection = normalized.match(/^\/reality\/([^/]+)\/(tasks|activity|reports|map|findings|more|key-factors|ways-to-help|improvements|our-findings|research|sources|updates)$/);
  if (gapSection) {
    const gapSlug = decodeURIComponent(gapSection[1]);
    const gap = gaps.find((item) => item.slug === gapSlug);
    const requestedSection = gapSection[2] === "sources" ? "research" : gapSection[2];
    return { page: "gapDetail", gapSlug, gapSection: requestedSection === "our-findings" && gap?.investigation_status !== "investigating" ? "overview" : requestedSection as RouteState["gapSection"] };
  }
  if (normalized.startsWith("/reality/") && normalized.endsWith("/updates")) {
    const gapSlug = normalized.replace("/reality/", "").replace(/\/updates$/, "");
    return { page: "gapUpdates", gapSlug: decodeURIComponent(gapSlug) };
  }
  if (normalized.startsWith("/reality/") && normalized.endsWith("/sources")) {
    const gapSlug = normalized.replace("/reality/", "").replace(/\/sources$/, "");
    return { page: "gapSources", gapSlug: decodeURIComponent(gapSlug) };
  }
  if (normalized.startsWith("/work/")) {
    const workId = decodeURIComponent(normalized.replace("/work/", ""));
    const destination = legacyDogWorkDestination(workId);
    return destination ? { page: "gapDetail", gapSlug: dogGapSlug, gapSection: destination.section } : { page: "work", workId };
  }
  if (normalized.startsWith("/reports/")) {
    return { page: "report", reportId: decodeURIComponent(normalized.replace("/reports/", "")) };
  }
  if (normalized.startsWith("/reality/")) {
    return { page: "gapDetail", gapSlug: decodeURIComponent(normalized.replace("/reality/", "")) };
  }
  if (normalized.startsWith("/stories/")) {
    return { page: "storyDetail", storySlug: decodeURIComponent(normalized.replace("/stories/", "")) };
  }
  if (normalized === "/reality") return { page: "reality" };
  if (normalized === "/connection") return { page: "connection" };
  if (normalized === "/action") return { page: "action" };
  if (normalized === "/updates") return { page: "updates" };
  if (normalized === "/about") return { page: "about" };
  if (normalized === "/organizations") return { page: "organizations" };
  return { page: "home" };
}

function canonicalPathname(pathname: string, hash = "") {
  if (/^\/action\/look-for-dogs-on-the-street\/?$/.test(pathname)) return "/work/dogs/";
  const oldDogSection = pathname.match(/^\/reality\/too-many-dogs-still-lack-safe-placement\/(tasks|activity|reports|map|findings|our-findings|dogs-locations-map)\/?$/);
  if (oldDogSection) {
    if (oldDogSection[1] === "our-findings" && hash === "#field-observation-procedure") return "/work/dogs/tasks/#dogs-check-louis-park";
    if (oldDogSection[1] === "our-findings" && (hash.startsWith("#investigation-records") || hash === "#activity-log")) return hash.includes("records-request") ? "/work/dogs/activity/#crossover-2026-10-20-sas-field-call-records-request" : "/work/dogs/activity/";
    return `/work/dogs/${({ reports: "activity", "our-findings": "findings", "dogs-locations-map": "map" } as Record<string, string>)[oldDogSection[1]] ?? oldDogSection[1]}/${hash}`;
  }
  if (/^\/reality\/too-many-dogs-still-lack-safe-placement\/(?:about|more)\/?$/.test(pathname)) return `${dogGapBase}${hash}`;
  const legacyGapReference = pathname.match(/^\/reality\/([^/]+)\/(key-factors|ways-to-help|improvements|research|sources|updates|more|about|our-findings)\/?$/);
  if (legacyGapReference && gaps.some((gap) => gap.slug === decodeURIComponent(legacyGapReference[1]))) {
    const section = legacyGapReference[2];
    const anchor = section === "research" || section === "sources" ? "gap-sources"
      : section === "key-factors" ? "gap-unknown"
      : section === "ways-to-help" ? "gap-responders"
      : section === "improvements" || section === "updates" || section === "our-findings" ? "gap-known" : "";
    return "/reality/" + legacyGapReference[1] + "/" + (anchor ? "#" + anchor : "");
  }
  const legacyWork = pathname.match(/^\/work\/([^/]+)\/?$/);
  if (legacyWork) {
    const workId = decodeURIComponent(legacyWork[1]);
    const anchor = decodeURIComponent(hash.slice(1));
    if (workId === "dogs-locations-map" || workId === "dogs-map-placement-barriers" && anchor === "field-observation-map") return "/work/dogs/map/";
    if (workId === "dogs-map-placement-barriers" && anchor === "field-observation-procedure") return "/work/dogs/tasks/#dogs-check-louis-park";
    if (workId === "dogs-map-placement-barriers" && anchor.startsWith("pathways-")) return `${dogGapBase}ways-to-help/${hash}`;
    if ((workId === "dogs-map-placement-barriers" || workId === "dogs-direct-field-work") && anchor.includes("records-request")) return "/work/dogs/activity/#crossover-2026-10-20-sas-field-call-records-request";
    if (workId === "dogs-direct-field-work") return `/work/dogs/activity/${anchor.startsWith("crossover-") ? hash : ""}`;
    if (workId === "dogs-map-placement-barriers") return `/work/dogs/findings/${anchor === "investigation-questions" ? hash : ""}`;
    const destination = legacyDogWorkDestination(workId, anchor);
    if (destination) return `${dogGapBase}${destination.section}/${destination.anchor ? `#${encodeURIComponent(destination.anchor)}` : ""}`;
    const legacyItem = work.find((item) => item.id === workId);
    if (legacyItem?.id.endsWith("-public-source-review")) {
      const gap = gaps.find((item) => item.work_ids?.includes(workId));
      if (gap) return `/reality/${gap.slug}/research/${hash}`;
    }
  }
  const sourceAlias = pathname.match(/^\/reality\/([^/]+)\/sources\/?$/);
  if (sourceAlias) return `/reality/${sourceAlias[1]}/research/`;
  const findings = pathname.match(/^\/reality\/([^/]+)\/our-findings\/?$/);
  if (findings && gaps.find((gap) => gap.slug === decodeURIComponent(findings[1]))?.investigation_status !== "investigating") return `/reality/${findings[1]}/`;
  return pathname === "/" || pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function titleForRoute(route: RouteState) {
  if (route.page === "workInvestigation") return `${investigations.find((item) => item.slug === route.investigationSlug)?.title ?? "Investigation"} — ${route.workSection ?? "tasks"} | Crossover Stockton`;
  if (route.page === "gapDetail" || route.page === "gapUpdates" || route.page === "gapSources") {
    const gap = gaps.find((item) => item.slug === route.gapSlug);
    const suffix = route.page === "gapUpdates" ? "Updates" : route.page === "gapSources" ? "Sources" : route.gapSection ? ({ overview: "About the gap", tasks: "Tasks", activity: "Activity", reports: "Activity", map: "Map", findings: "Findings", more: "About the gap", "key-factors": "Key Factors", "ways-to-help": "Ways to Help", improvements: "Improvements", "our-findings": "Findings", research: "Research", updates: "Updates" }[route.gapSection]) : "Reality";
    return gap ? `${gap.title} — ${gap.id === "dogs-safe-placement" && route.gapSection === "ways-to-help" ? "Show Up With Us" : suffix} | Crossover Stockton` : `${suffix} | Crossover Stockton`;
  }
  if (route.page === "work") {
    const item = work.find((entry) => entry.id === route.workId);
    return item ? `${item.title} | Crossover Stockton` : "Crossover work | Crossover Stockton";
  }
  if (route.page === "report") {
    const report = reports.find((item) => item.id === route.reportId);
    return report ? `${report.title} | Crossover Stockton` : "Field report not found | Crossover Stockton";
  }
  if (route.page === "storyDetail") {
    const story = stories.find((item) => item.slug === route.storySlug);
    return story ? `${story.title} | Crossover Stockton` : "Stories | Crossover Stockton";
  }
  if (route.page === "organizationDetail") {
    const org = organizations.find((item) => item.slug === route.organizationSlug);
    return org ? `${org.name} | Crossover Stockton` : "Organizations | Crossover Stockton";
  }
  const titles: Record<Exclude<AppRoute, "gapDetail" | "gapUpdates" | "gapSources" | "work" | "workInvestigation" | "report" | "storyDetail" | "organizationDetail">, string> = {
    home: "Crossover Stockton",
    workIndex: "Investigations | Crossover Stockton",
    reality: "Reality | Crossover Stockton",
    connection: "Connection | Crossover Stockton",
    action: "Action | Crossover Stockton",
    updates: "Updates | Crossover Stockton",
    about: "About | Crossover Stockton",
    organizations: "Organizations | Crossover Stockton",
  };
  return titles[route.page];
}

export default function App({ initialPath }: { initialPath?: string }) {
  const [route, setRoute] = useState<RouteState>(() => routeFromPathname(initialPath ?? window.location.pathname));
  const [selectedAction, setSelectedAction] = useState<PublicActionRecord | null>(null);

  useEffect(() => {
    function ensureCanonicalPath() {
      const path = canonicalPathname(window.location.pathname, window.location.hash);
      const [pathname, redirectedHash] = path.split("#");
      if (pathname !== window.location.pathname || redirectedHash !== undefined) {
        window.history.replaceState({}, "", `${pathname}${window.location.search}${redirectedHash === undefined ? window.location.hash : `#${redirectedHash}`}`);
      }
      return pathname;
    }

    setRoute(routeFromPathname(ensureCanonicalPath()));
    if (window.location.hash) requestAnimationFrame(() => requestAnimationFrame(() => {
      const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      if (target instanceof HTMLDetailsElement) target.open = true;
      target?.scrollIntoView({ block: "start" });
    }));

    function handlePopState() {
      setRoute(routeFromPathname(ensureCanonicalPath()));
      requestAnimationFrame(() => {
        const anchor = decodeURIComponent(window.location.hash.slice(1));
        if (!anchor) {
          window.scrollTo({ top: 0, left: 0 });
          return;
        }
        const target = document.getElementById(anchor);
        if (target instanceof HTMLDetailsElement) target.open = true;
        target?.scrollIntoView({ block: "start" });
      });
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    document.title = titleForRoute(route);
  }, [route]);

  function showPage(page: Exclude<AppRoute, "gapDetail" | "gapUpdates" | "gapSources" | "work" | "workInvestigation" | "report" | "storyDetail" | "organizationDetail">) {
    const nextPath = ROUTE_PATHS[page];
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    setRoute({ page });
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  }

  function showInvestigation(slug: string, section: WorkSection = "tasks", anchor?: string) {
    const investigation = investigations.find((item) => item.slug === slug);
    if (!investigation) return;
    const nextPath = `/work/${slug}/${section === "tasks" ? "" : `${section}/`}${anchor ? `#${encodeURIComponent(anchor)}` : ""}`;
    if (`${window.location.pathname}${window.location.hash}` !== nextPath) window.history.pushState({}, "", nextPath);
    setRoute({ page: "workInvestigation", investigationSlug: slug, workSection: section });
    requestAnimationFrame(() => {
      if (anchor) document.getElementById(anchor)?.scrollIntoView({ block: "start" });
      else window.scrollTo({ top: 0, left: 0 });
    });
  }

  function showActionDetail() {
    showInvestigation("dogs");
  }

  function showOrganization(slug: string) {
    const nextPath = `/organizations/${encodeURIComponent(slug)}/`;
    if (window.location.pathname !== nextPath) window.history.pushState({}, "", nextPath);
    setRoute({ page: "organizationDetail", organizationSlug: slug });
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  }

  function showGap(slug: string) {
    const nextPath = `/reality/${slug}/`;
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    setRoute({ page: "gapDetail", gapSlug: slug });
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  }

  function showGapSection(slug: string, section: NonNullable<RouteState["gapSection"]>, anchor?: string) {
    if (slug === dogGapSlug && (workSections as string[]).includes(section)) { showInvestigation("dogs", section as WorkSection, anchor); return; }
    if (slug === dogGapSlug && section === "reports") { showInvestigation("dogs", "activity", anchor); return; }
    if (slug === dogGapSlug && section === "our-findings") { showInvestigation("dogs", "findings", anchor); return; }
    const referenceAnchor = section === "research" ? "gap-sources"
      : section === "key-factors" ? "gap-unknown"
      : section === "ways-to-help" ? "gap-responders"
      : section === "improvements" || section === "updates" || section === "our-findings" ? "gap-known" : "";
    const nextPath = "/reality/" + slug + "/" + (referenceAnchor ? "#" + referenceAnchor : "");
    if (`${window.location.pathname}${window.location.hash}` !== nextPath) window.history.pushState({}, "", nextPath);
    setRoute({ page: "gapDetail", gapSlug: slug });
    requestAnimationFrame(() => {
      if (!referenceAnchor) window.scrollTo({ top: 0, left: 0 });
      else {
        const target = document.getElementById(referenceAnchor);
        if (target instanceof HTMLDetailsElement) target.open = true;
        target?.scrollIntoView({ block: "start" });
      }
    });
  }

  function showGapUpdates(slug: string) {
    showGapSection(slug, "updates");
  }

  function showGapSources(slug: string) {
    showGapSection(slug, "research");
  }

  function showWork(workId: string, anchor?: string) {
    if (workId === "dogs-map-placement-barriers" && anchor === "field-observation-map") {
      showWork("dogs-locations-map", anchor);
      return;
    }
    if (workId === "dogs-map-placement-barriers" && anchor === "field-observation-procedure") { showInvestigation("dogs", "tasks", "dogs-check-louis-park"); return; }
    if (workId === "dogs-map-placement-barriers" && anchor?.startsWith("pathways-")) { showGapSection(dogGapSlug, "ways-to-help", anchor); return; }
    if ((workId === "dogs-map-placement-barriers" || workId === "dogs-direct-field-work") && anchor?.includes("records-request")) { showInvestigation("dogs", "activity", "crossover-2026-10-20-sas-field-call-records-request"); return; }
    if (workId === "dogs-locations-map") { showInvestigation("dogs", "map", anchor); return; }
    if (workId === "dogs-direct-field-work") { showInvestigation("dogs", "activity", anchor); return; }
    if (workId === "dogs-map-placement-barriers") { showInvestigation("dogs", "findings", anchor === "investigation-questions" ? anchor : undefined); return; }
    const destination = legacyDogWorkDestination(workId, anchor);
    if (destination) {
      showGapSection(dogGapSlug, destination.section, destination.anchor);
      return;
    }
    const nextPath = `/work/${workId}/${anchor ? `#${encodeURIComponent(anchor)}` : ""}`;
    if (`${window.location.pathname}${window.location.hash}` !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    setRoute({ page: "work", workId });
    requestAnimationFrame(() => {
      if (anchor) document.getElementById(anchor)?.scrollIntoView();
      else window.scrollTo({ top: 0, left: 0 });
    });
  }

  function showReport(reportId: string) {
    const nextPath = `/reports/${encodeURIComponent(reportId)}/`;
    if (window.location.pathname !== nextPath) window.history.pushState({}, "", nextPath);
    setSelectedAction(null);
    setRoute({ page: "report", reportId });
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  }

  function showStory(slug: string) {
    const nextPath = `/stories/${slug}/`;
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    setRoute({ page: "storyDetail", storySlug: slug });
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  }

  const firstGapSlug = gaps.find((gap) => gap.active)?.slug ?? gaps[0]?.slug;

  return (
    <div className="app-shell">
      {route.page === "workIndex" && <main className="crossover-index"><header><a href="/" onClick={(event) => { event.preventDefault(); showPage("home"); }}>CROSSOVER</a><button type="button" onClick={() => showPage("about")}>About</button></header><div className="crossover-index-body"><h1>Investigations</h1><p>Explore what we are learning in Stockton.</p><a href="/work/dogs/" className="crossover-investigation-card" onClick={(event) => { event.preventDefault(); showInvestigation("dogs"); }}><span><strong>Dogs on the street in Stockton</strong><small>Investigating · Stockton, California</small><span>Field reports, locations, pathways to care, and current findings.</span></span></a></div></main>}
      {(route.page === "home" || route.page === "reality" || route.page === "connection") && (
        <HomePage
          page={route.page}
          onNavigate={showPage}
          onOpenAbout={() => showPage("about")}
          onOpenGap={showGap}
          onOpenGapSection={showGapSection}
          onOpenWork={showWork}
          onOpenStory={showStory}
          onOpenAction={setSelectedAction}
          onOpenActionDetail={showActionDetail}
        />
      )}

      {route.page === "action" && (
        <ActionIndexPage
          onNavigate={showPage}
          onOpenActionDetail={showActionDetail}
        />
      )}

      {route.page === "gapDetail" && (
        <GapReferencePage slug={route.gapSlug ?? firstGapSlug} onNavigate={showPage} onOpenGap={showGap} />
      )}

      {route.page === "workInvestigation" && <GapDetailPage
        slug={investigations.find((item) => item.slug === route.investigationSlug)?.gapSlug}
        section={route.workSection ?? "tasks"}
        workspaceBasePath={`/work/${route.investigationSlug}/`}
        onOpenSection={showGapSection}
        onNavigate={showPage}
        onOpenAbout={() => showPage("about")}
        onOpenGap={showGap}
        onOpenUpdates={showGapUpdates}
        onOpenSources={showGapSources}
        onOpenWork={showWork}
        onOpenReport={showReport}
        onOpenStory={showStory}
        onOpenAction={setSelectedAction}
        onOpenActionDetail={showActionDetail}
      />}

      {route.page === "report" && (
        <FieldReportPage
          reportId={route.reportId}
          onNavigate={showPage}
          onOpenGap={showGap}
          onOpenWork={showWork}
          onOpenAction={setSelectedAction}
          onOpenInvestigationReports={() => showGapSection(dogGapSlug, "reports")}
        />
      )}

      {route.page === "gapUpdates" && (
        <GapUpdatesPage
          slug={route.gapSlug ?? firstGapSlug}
          onNavigate={showPage}
          onOpenAbout={() => showPage("about")}
          onOpenGap={showGap}
          onOpenWork={showWork}
          onOpenReport={showReport}
        />
      )}

      {route.page === "gapSources" && (
        <GapSourcesPage
          slug={route.gapSlug ?? firstGapSlug}
          onNavigate={showPage}
          onOpenAbout={() => showPage("about")}
          onOpenGap={showGap}
        />
      )}

      {route.page === "work" && (
        <WorkPage
          workId={route.workId}
          onNavigate={showPage}
          onOpenGap={showGap}
          onOpenGapSection={showGapSection}
          onOpenWork={showWork}
          onOpenReport={showReport}
          onOpenAbout={() => showPage("about")}
        />
      )}

      {route.page === "about" && (
        <AboutPage
          onNavigate={showPage}
          onPrimaryAction={() => showPage("action")}
          onOpenWork={showWork}
          onOpenGap={showGap}
          onOpenResearch={() => showGapSection("too-many-dogs-still-lack-safe-placement", "research")}
          onOpenFindings={() => showGapSection("too-many-dogs-still-lack-safe-placement", "our-findings")}
        />
      )}

      {route.page === "updates" && (
        <UpdatesPage
          onNavigate={showPage}
          onOpenGap={showGap}
        />
      )}

      {route.page === "storyDetail" && (
        <StoryDetailPage
          slug={route.storySlug}
          onNavigate={showPage}
        />
      )}

      {(route.page === "organizations" || route.page === "organizationDetail") && (
        <OrganizationsPage
          onNavigate={showPage}
          onOpenReport={showReport}
          selectedSlug={route.organizationSlug}
          onOpenOrganization={showOrganization}
        />
      )}

      {selectedAction && (
        <ActionModal
          action={selectedAction}
          onClose={() => setSelectedAction(null)}
          onOpenGap={showGap}
          onOpenWork={showWork}
          onOpenDogSection={(section, anchor) => showGapSection(dogGapSlug, section, anchor)}
          onOpenReport={showReport}
        />
      )}
    </div>
  );
}
