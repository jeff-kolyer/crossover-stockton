import { useEffect, useState } from "react";
import gapsData from "./data/gaps.json";
import { ActionModal } from "./components/ActionModal";
import { AboutPage } from "./components/AboutPage";
import { GapDetailPage } from "./components/GapDetailPage";
import { GapSourcesPage } from "./components/GapSourcesPage";
import { GapUpdatesPage } from "./components/GapUpdatesPage";
import { WorkPage } from "./components/WorkPage";
import { HomePage } from "./components/HomePage";
import { OrganizationsPage } from "./components/OrganizationsPage";
import { StoryDetailPage } from "./components/StoryDetailPage";
import { UpdatesPage } from "./components/UpdatesPage";
import storiesData from "./data/stories.json";
import type { GapRecord, PublicActionRecord, StoryRecord } from "./types";

const gaps = gapsData as GapRecord[];
const stories = storiesData as StoryRecord[];

type AppRoute = "home" | "reality" | "gapDetail" | "gapUpdates" | "gapSources" | "work" | "storyDetail" | "connection" | "action" | "updates" | "about" | "organizations";

interface RouteState {
  page: AppRoute;
  gapSlug?: string;
  storySlug?: string;
  workId?: string;
}

const ROUTE_PATHS: Record<Exclude<AppRoute, "gapDetail" | "gapUpdates" | "gapSources" | "work" | "storyDetail">, string> = {
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
  return pathname === "/" || pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function titleForRoute(route: RouteState) {
  if (route.page === "gapDetail" || route.page === "gapUpdates" || route.page === "gapSources") {
    const gap = gaps.find((item) => item.slug === route.gapSlug);
    const suffix = route.page === "gapUpdates" ? "Updates" : route.page === "gapSources" ? "Sources" : "Reality";
    return gap ? `${gap.title} — ${suffix} | Crossover Stockton` : `${suffix} | Crossover Stockton`;
  }
  if (route.page === "work") return "Crossover work | Crossover Stockton";
  if (route.page === "storyDetail") {
    const story = stories.find((item) => item.slug === route.storySlug);
    return story ? `${story.title} | Crossover Stockton` : "Stories | Crossover Stockton";
  }
  const titles: Record<Exclude<AppRoute, "gapDetail" | "gapUpdates" | "gapSources" | "work" | "storyDetail">, string> = {
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

export default function App() {
  const [route, setRoute] = useState<RouteState>(() => routeFromPathname(window.location.pathname));
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

  function showPage(page: Exclude<AppRoute, "gapDetail" | "gapUpdates" | "gapSources" | "work" | "storyDetail">) {
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
    setRoute({ page: "gapDetail", gapSlug: slug });
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  }

  function showGapUpdates(slug: string) {
    const nextPath = `/reality/${slug}/updates/`;
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    setRoute({ page: "gapUpdates", gapSlug: slug });
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  }

  function showGapSources(slug: string) {
    const nextPath = `/reality/${slug}/sources/`;
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    setRoute({ page: "gapSources", gapSlug: slug });
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  }

  function showWork(workId: string) {
    const nextPath = `/work/${workId}/`;
    if (window.location.pathname !== nextPath) window.history.pushState({}, "", nextPath);
    setRoute({ page: "work", workId });
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
          onOpenStory={showStory}
          onOpenAction={setSelectedAction}
        />
      )}

      {route.page === "gapDetail" && (
        <GapDetailPage
          slug={route.gapSlug ?? firstGapSlug}
          onNavigate={showPage}
          onOpenAbout={() => showPage("about")}
          onOpenGap={showGap}
          onOpenUpdates={showGapUpdates}
          onOpenSources={showGapSources}
          onOpenWork={showWork}
          onOpenStory={showStory}
          onOpenAction={setSelectedAction}
        />
      )}

      {route.page === "gapUpdates" && (
        <GapUpdatesPage
          slug={route.gapSlug ?? firstGapSlug}
          onNavigate={showPage}
          onOpenAbout={() => showPage("about")}
          onOpenGap={showGap}
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
          onOpenAbout={() => showPage("about")}
        />
      )}

      {route.page === "about" && (
        <AboutPage
          onNavigate={showPage}
          onPrimaryAction={() => showPage("action")}
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
        />
      )}

      {selectedAction && (
        <ActionModal
          action={selectedAction}
          onClose={() => setSelectedAction(null)}
          onOpenGap={showGap}
        />
      )}
    </div>
  );
}
