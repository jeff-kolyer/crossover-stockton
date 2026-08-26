import { useEffect, useState } from "react";
import gapsData from "./data/gaps.json";
import { ActionModal } from "./components/ActionModal";
import { AboutPage } from "./components/AboutPage";
import { GapDetailPage } from "./components/GapDetailPage";
import { HomePage } from "./components/HomePage";
import { OrganizationsPage } from "./components/OrganizationsPage";
import { StoryDetailPage } from "./components/StoryDetailPage";
import { warmImage, warmSiteImages } from "./lib/preloadImages";
import storiesData from "./data/stories.json";
import type { GapRecord, PublicActionRecord, StoryRecord } from "./types";

const gaps = gapsData as GapRecord[];
const stories = storiesData as StoryRecord[];

type AppRoute = "home" | "reality" | "gapDetail" | "storyDetail" | "connection" | "action" | "about" | "organizations";

interface RouteState {
  page: AppRoute;
  gapSlug?: string;
  storySlug?: string;
}

const ROUTE_PATHS: Record<Exclude<AppRoute, "gapDetail" | "storyDetail">, string> = {
  home: "/",
  reality: "/reality",
  connection: "/connection",
  action: "/action",
  about: "/about",
  organizations: "/organizations",
};

const pageHeroImages: Partial<Record<AppRoute, string>> = {
  home: "/images/home/background_home.jpg",
  reality: "/images/reality/reality_banner.jpg",
  connection: "/images/connection/connection_banner.jpg",
  action: "/images/action/action_banner.jpg",
  about: "/images/about/background_about.png",
  organizations: "/images/organizations/organizations-we-follow-hero.jpg",
};

function routeFromPathname(pathname: string): RouteState {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (normalized.startsWith("/reality/")) {
    return { page: "gapDetail", gapSlug: decodeURIComponent(normalized.replace("/reality/", "")) };
  }
  if (normalized.startsWith("/stories/")) {
    return { page: "storyDetail", storySlug: decodeURIComponent(normalized.replace("/stories/", "")) };
  }
  if (normalized === "/reality") return { page: "reality" };
  if (normalized === "/connection") return { page: "connection" };
  if (normalized === "/action") return { page: "action" };
  if (normalized === "/about") return { page: "about" };
  if (normalized === "/organizations") return { page: "organizations" };
  return { page: "home" };
}

export default function App() {
  const [route, setRoute] = useState<RouteState>(() => routeFromPathname(window.location.pathname));
  const [selectedAction, setSelectedAction] = useState<PublicActionRecord | null>(null);

  useEffect(() => {
    warmSiteImages();
  }, []);

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

  function showPage(page: Exclude<AppRoute, "gapDetail" | "storyDetail">) {
    const nextPath = ROUTE_PATHS[page];
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    setRoute({ page });
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  }

  function showGap(slug: string) {
    const nextPath = `/reality/${slug}`;
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    setRoute({ page: "gapDetail", gapSlug: slug });
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  }

  function showStory(slug: string) {
    const nextPath = `/stories/${slug}`;
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
          onOpenStory={showStory}
          onOpenAction={setSelectedAction}
        />
      )}

      {route.page === "about" && (
        <AboutPage
          onNavigate={showPage}
          onPrimaryAction={() => showPage("action")}
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
