import { useEffect, useState } from "react";
import gapsData from "./data/gaps.json";
import { ActionModal } from "./components/ActionModal";
import { ActionIndexPage } from "./components/ActionIndexPage";
import { ActionDetailPage } from "./components/ActionDetailPage";
import { AboutPage } from "./components/AboutPage";
import { GapDetailPage } from "./components/GapDetailPage";
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
import type { EvidenceRecord, GapRecord, PublicActionRecord, StoryRecord } from "./types";
import { dogGapBase, dogGapSlug, dogMapPath, legacyDogWorkDestination } from "./lib/dogGapLegacy";

const gaps = gapsData as GapRecord[];
const stories = storiesData as StoryRecord[];
const work = workData as { id: string; title: string }[];
const reports = (recordsData as EvidenceRecord[]).filter((record) => record.record_type === "field_report");

type AppRoute = "home" | "reality" | "gapDetail" | "gapUpdates" | "gapSources" | "work" | "report" | "storyDetail" | "connection" | "action" | "actionDetail" | "updates" | "about" | "organizations";

interface RouteState {
  page: AppRoute;
  gapSlug?: string;
  gapSection?: "overview" | "key-factors" | "ways-to-help" | "improvements" | "our-findings" | "research" | "updates";
  storySlug?: string;
  workId?: string;
  reportId?: string;
}

const ROUTE_PATHS: Record<Exclude<AppRoute, "gapDetail" | "gapUpdates" | "gapSources" | "work" | "report" | "storyDetail" | "actionDetail">, string> = {
  home: "/",
  reality: "/reality/",
  connection: "/connection/",
  action: "/action/",
  updates: "/updates/",
  about: "/about/",
  organizations: "/organizations/",
};

function routeFromPathname(pathname: string): RouteState {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (normalized === "/action/look-for-dogs-on-the-street") return { page: "actionDetail" };
  const gapSection = normalized.match(/^\/reality\/([^/]+)\/(key-factors|ways-to-help|improvements|our-findings|research|sources|updates)$/);
  if (gapSection) {
    const gapSlug = decodeURIComponent(gapSection[1]);
    const gap = gaps.find((item) => item.slug === gapSlug);
    const requestedSection = gapSection[2] === "sources" ? "research" : gapSection[2];
    return { page: "gapDetail", gapSlug, gapSection: requestedSection === "our-findings" && gap?.investigation_status !== "investigating" ? "overview" : requestedSection as RouteState["gapSection"] };
  }
  if (normalized === dogMapPath.replace(/\/$/, "")) return { page: "work", workId: "dogs-locations-map" };
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
  const legacyWork = pathname.match(/^\/work\/([^/]+)\/?$/);
  if (legacyWork) {
    const workId = decodeURIComponent(legacyWork[1]);
    const anchor = decodeURIComponent(hash.slice(1));
    if (workId === "dogs-locations-map" || workId === "dogs-map-placement-barriers" && anchor === "field-observation-map") return `${dogMapPath}${anchor ? `#${encodeURIComponent(anchor)}` : ""}`;
    const destination = legacyDogWorkDestination(workId, anchor);
    if (destination) return `${dogGapBase}${destination.section}/${destination.anchor ? `#${encodeURIComponent(destination.anchor)}` : ""}`;
  }
  const sourceAlias = pathname.match(/^\/reality\/([^/]+)\/sources\/?$/);
  if (sourceAlias) return `/reality/${sourceAlias[1]}/research/`;
  const findings = pathname.match(/^\/reality\/([^/]+)\/our-findings\/?$/);
  if (findings && gaps.find((gap) => gap.slug === decodeURIComponent(findings[1]))?.investigation_status !== "investigating") return `/reality/${findings[1]}/`;
  return pathname === "/" || pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function titleForRoute(route: RouteState) {
  if (route.page === "actionDetail") return "Look for dogs on the street | Crossover Stockton";
  if (route.page === "gapDetail" || route.page === "gapUpdates" || route.page === "gapSources") {
    const gap = gaps.find((item) => item.slug === route.gapSlug);
    const suffix = route.page === "gapUpdates" ? "Updates" : route.page === "gapSources" ? "Sources" : route.gapSection ? ({ overview: "Overview", "key-factors": "Key Factors", "ways-to-help": "Ways to Help", improvements: "Improvements", "our-findings": "Our Findings", research: "Research", updates: "Updates" }[route.gapSection]) : "Reality";
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
  const titles: Record<Exclude<AppRoute, "gapDetail" | "gapUpdates" | "gapSources" | "work" | "report" | "storyDetail" | "actionDetail">, string> = {
    home: "Crossover Stockton",
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

  function showPage(page: Exclude<AppRoute, "gapDetail" | "gapUpdates" | "gapSources" | "work" | "report" | "storyDetail" | "actionDetail">) {
    const nextPath = ROUTE_PATHS[page];
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    setRoute({ page });
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  }

  function showActionDetail() {
    const nextPath = "/action/look-for-dogs-on-the-street/";
    if (window.location.pathname !== nextPath) window.history.pushState({}, "", nextPath);
    setRoute({ page: "actionDetail" });
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  }

  function showGap(slug: string) {
    const nextPath = `/reality/${slug}/`;
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    setRoute({ page: "gapDetail", gapSlug: slug, gapSection: "overview" });
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  }

  function showGapSection(slug: string, section: NonNullable<RouteState["gapSection"]>, anchor?: string) {
    const nextPath = `/reality/${slug}/${section === "overview" ? "" : `${section}/`}${anchor ? `#${anchor}` : ""}`;
    if (`${window.location.pathname}${window.location.hash}` !== nextPath) window.history.pushState({}, "", nextPath);
    setRoute({ page: "gapDetail", gapSlug: slug, gapSection: section });
    requestAnimationFrame(() => {
      if (!anchor) window.scrollTo({ top: 0, left: 0 });
      else {
        const target = document.getElementById(anchor);
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
    const destination = legacyDogWorkDestination(workId, anchor);
    if (destination) {
      showGapSection(dogGapSlug, destination.section, destination.anchor);
      return;
    }
    const nextPath = `${workId === "dogs-locations-map" ? dogMapPath : `/work/${workId}/`}${anchor ? `#${encodeURIComponent(anchor)}` : ""}`;
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

      {route.page === "actionDetail" && (
        <ActionDetailPage
          onNavigate={showPage}
          onOpenInstructions={() => showGapSection(dogGapSlug, "our-findings", "field-observation-procedure")}
          onOpenMap={() => showWork("dogs-locations-map")}
          onOpenReport={showReport}
        />
      )}

      {route.page === "gapDetail" && (
        <GapDetailPage
          slug={route.gapSlug ?? firstGapSlug}
          section={route.gapSection ?? "overview"}
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
        />
      )}

      {route.page === "report" && (
        <FieldReportPage
          reportId={route.reportId}
          onNavigate={showPage}
          onOpenGap={showGap}
          onOpenWork={showWork}
          onOpenAction={setSelectedAction}
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

      {route.page === "organizations" && (
        <OrganizationsPage
          onNavigate={showPage}
          onOpenReport={showReport}
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
