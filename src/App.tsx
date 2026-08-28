import { useEffect, useState } from "react";
import gapsData from "./data/gaps.json";
import { ActionModal } from "./components/ActionModal";
import { AboutPage } from "./components/AboutPage";
import { GapDetailPage } from "./components/GapDetailPage";
import { GapUpdatesPage } from "./components/GapUpdatesPage";
import { HomePage } from "./components/HomePage";
import { OrganizationsPage } from "./components/OrganizationsPage";
import { StoryDetailPage } from "./components/StoryDetailPage";
import { UpdatesPage } from "./components/UpdatesPage";
import { warmImage } from "./lib/preloadImages";
import storiesData from "./data/stories.json";
import type { GapRecord, PublicActionRecord, StoryRecord } from "./types";

const gaps = gapsData as GapRecord[];
const stories = storiesData as StoryRecord[];

type AppRoute = "home" | "reality" | "gapDetail" | "gapUpdates" | "storyDetail" | "connection" | "action" | "updates" | "about" | "organizations";

interface RouteState {
  page: AppRoute;
  gapSlug?: string;
  storySlug?: string;
}

const ROUTE_PATHS: Record<Exclude<AppRoute, "gapDetail" | "gapUpdates" | "storyDetail">, string> = {
  home: "/",
  reality: "/reality",
  connection: "/connection",
  action: "/action",
  updates: "/updates",
  about: "/about",
  organizations: "/organizations",
};

const pageHeroImages: Partial<Record<AppRoute, string>> = {
  home: "/images/home/background_home.jpg",
  reality: "/images/reality/reality_banner.jpg",
  connection: "/images/connection/connection_banner.jpg",
  action: "/images/action/action_banner.jpg",
  about: "/images/about/about-crossover-hero.jpg",
  organizations: "/images/organizations/organizations-we-follow-hero.jpg",
};

function routeFromPathname(pathname: string): RouteState {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (normalized.startsWith("/reality/") && normalized.endsWith("/updates")) {
    const gapSlug = normalized.replace("/reality/", "").replace(/\/updates$/, "");
    return { page: "gapUpdates", gapSlug: decodeURIComponent(gapSlug) };
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

export default function App() {
  const [route, setRoute] = useState<RouteState>(() => routeFromPathname(window.location.pathname));
  const [selectedAction, setSelectedAction] = useState<PublicActionRecord | null>(null);

  useEffect(() => {
    const routeImage = route.page === "gapDetail"
      ? gaps.find((gap) => gap.slug === route.gapSlug)?.artwork
      : route.page === "storyDetail"
        ? stories.find((story) => story.slug === route.storySlug)?.image
        : pageHeroImages[route.page];

    void warmImage(routeImage);
  }, [route]);

  useEffect(() => {
    function handlePopState() {
      setRoute(routeFromPathname(window.location.pathname));
      requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  async function showPage(page: Exclude<AppRoute, "gapDetail" | "gapUpdates" | "storyDetail">) {
    const nextPath = ROUTE_PATHS[page];
    await warmImage(pageHeroImages[page]);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    setRoute({ page });
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  }

  async function showGap(slug: string) {
    const nextPath = `/reality/${slug}`;
    await warmImage(gaps.find((gap) => gap.slug === slug)?.artwork);
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    setRoute({ page: "gapDetail", gapSlug: slug });
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  }

  async function showGapUpdates(slug: string) {
    const nextPath = `/reality/${slug}/updates`;
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    setRoute({ page: "gapUpdates", gapSlug: slug });
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  }

  async function showStory(slug: string) {
    const nextPath = `/stories/${slug}`;
    await warmImage(stories.find((story) => story.slug === slug)?.image);
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
