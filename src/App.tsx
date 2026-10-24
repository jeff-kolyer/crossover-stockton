import { useEffect, useState } from "react";
import gapsData from "./data/gaps.json";
import { ActionModal } from "./components/ActionModal";
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

const gaps = gapsData as GapRecord[];
const stories = storiesData as StoryRecord[];
const work = workData as { id: string; title: string }[];
const reports = (recordsData as EvidenceRecord[]).filter((record) => record.record_type === "field_report");

type AppRoute = "home" | "reality" | "gapDetail" | "gapUpdates" | "gapSources" | "work" | "report" | "storyDetail" | "connection" | "action" | "updates" | "about" | "organizations";

interface RouteState {
  page: AppRoute;
  gapSlug?: string;
  gapSection?: "overview" | "ways-to-help" | "improvements" | "our-findings" | "research" | "updates";
  storySlug?: string;
  workId?: string;
  reportId?: string;
}

const ROUTE_PATHS: Record<Exclude<AppRoute, "gapDetail" | "gapUpdates" | "gapSources" | "work" | "report" | "storyDetail">, string> = {
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
  const gapSection = normalized.match(/^\/reality\/([^/]+)\/(ways-to-help|improvements|our-findings|research|sources|updates)$/);
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
    return { page: "work", workId: decodeURIComponent(normalized.replace("/work/", "")) };
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

function canonicalPathname(pathname: string) {
  const sourceAlias = pathname.match(/^\/reality\/([^/]+)\/sources\/?$/);
  if (sourceAlias) return `/reality/${sourceAlias[1]}/research/`;
  const findings = pathname.match(/^\/reality\/([^/]+)\/our-findings\/?$/);
  if (findings && gaps.find((gap) => gap.slug === decodeURIComponent(findings[1]))?.investigation_status !== "investigating") return `/reality/${findings[1]}/`;
  return pathname === "/" || pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function titleForRoute(route: RouteState) {
  if (route.page === "gapDetail" || route.page === "gapUpdates" || route.page === "gapSources") {
    const gap = gaps.find((item) => item.slug === route.gapSlug);
    const suffix = route.page === "gapUpdates" ? "Updates" : route.page === "gapSources" ? "Sources" : route.gapSection ? ({ overview: "Overview", "ways-to-help": "Ways to Help", improvements: "Improvements", "our-findings": "Our Findings", research: "Research", updates: "Updates" }[route.gapSection]) : "Reality";
    return gap ? `${gap.title} — ${suffix} | Crossover Stockton` : `${suffix} | Crossover Stockton`;
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
  const titles: Record<Exclude<AppRoute, "gapDetail" | "gapUpdates" | "gapSources" | "work" | "report" | "storyDetail">, string> = {
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
      const pathname = canonicalPathname(window.location.pathname);
      if (pathname !== window.location.pathname) {
        window.history.replaceState({}, "", `${pathname}${window.location.search}${window.location.hash}`);
      }
      return pathname;
    }

    ensureCanonicalPath();

    function handlePopState() {
      setRoute(routeFromPathname(ensureCanonicalPath()));
      requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    document.title = titleForRoute(route);
  }, [route]);

  function showPage(page: Exclude<AppRoute, "gapDetail" | "gapUpdates" | "gapSources" | "work" | "report" | "storyDetail">) {
    const nextPath = ROUTE_PATHS[page];
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    setRoute({ page });
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

  function showGapSection(slug: string, section: NonNullable<RouteState["gapSection"]>) {
    const nextPath = `/reality/${slug}/${section === "overview" ? "" : `${section}/`}`;
    if (window.location.pathname !== nextPath) window.history.pushState({}, "", nextPath);
    setRoute({ page: "gapDetail", gapSlug: slug, gapSection: section });
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  }

  function showGapUpdates(slug: string) {
    showGapSection(slug, "updates");
  }

  function showGapSources(slug: string) {
    showGapSection(slug, "research");
  }

  function showWork(workId: string, anchor?: string) {
    const nextPath = `/work/${workId}/${anchor ? `#${encodeURIComponent(anchor)}` : ""}`;
    if (`${window.location.pathname}${window.location.hash}` !== nextPath) window.history.pushState({}, "", nextPath);
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
      {(route.page === "home" || route.page === "reality" || route.page === "connection" || route.page === "action") && (
        <HomePage
          page={route.page}
          onNavigate={showPage}
          onOpenAbout={() => showPage("about")}
          onOpenGap={showGap}
          onOpenWork={showWork}
          onOpenReport={showReport}
          onOpenStory={showStory}
          onOpenAction={setSelectedAction}
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
          onOpenReport={showReport}
        />
      )}
    </div>
  );
}
