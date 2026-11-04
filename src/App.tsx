import { useEffect, useState } from "react";
import type { PublicRoute } from "./components/PublicMobileMenu";
import { articleForPath } from "./lib/articles";
import { dogGapSlug, legacyDogWorkDestination } from "./lib/dogGapLegacy";
import { canonicalPathname, investigations, ROUTE_PATHS, routeFromPathname, titleForRoute, workSections, type RouteState, type WorkSection } from "./controller/routes";
import { PageRenderer } from "./view/PageRenderer";

export default function App({ initialPath }: { initialPath?: string }) {
  const [route, setRoute] = useState<RouteState>(() => routeFromPathname(initialPath ?? window.location.pathname));
  const [explorerResetKey, setExplorerResetKey] = useState(0);
  const googleExperiment = import.meta.env.DEV && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("ui") === "google";
  const investigationPath = (path: string) => {
    if (!googleExperiment) return path;
    const url = new URL(path, window.location.origin);
    url.searchParams.set("ui", "google");
    return `${url.pathname}${url.search}${url.hash}`;
  };

  useEffect(() => {
    function ensureCanonicalPath() {
      const path = canonicalPathname(window.location.pathname, window.location.hash);
      const [pathname, redirectedHash] = path.split("#");
      if (pathname !== window.location.pathname || redirectedHash !== undefined) {
        window.history.replaceState({}, "", `${pathname}${window.location.search}${redirectedHash === undefined ? window.location.hash : `#${redirectedHash}`}`);
      }
      return pathname;
    }

    setRoute(routeFromPathname(ensureCanonicalPath(), window.location.search));
    if (window.location.hash) requestAnimationFrame(() => requestAnimationFrame(() => {
      const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      if (target instanceof HTMLDetailsElement) target.open = true;
      target?.scrollIntoView({ block: "start" });
    }));

    function handlePopState() {
      setRoute(routeFromPathname(ensureCanonicalPath(), window.location.search));
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

  function showPage(page: PublicRoute) {
    if (page === "investigation") { showInvestigation("dogs"); return; }
    const nextPath = ROUTE_PATHS[page];
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    if (page === "data") setExplorerResetKey((key) => key + 1);
    setRoute({ page });
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  }

  function showInvestigation(slug: string, section: WorkSection = "tasks", anchor?: string) {
    const investigation = investigations.find((item) => item.slug === slug);
    if (!investigation) return;
    const nextPath = investigationPath(`/work/${slug}/${section === "tasks" ? "" : `${section}/`}${anchor ? `#${encodeURIComponent(anchor)}` : ""}`);
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== nextPath) window.history.pushState({}, "", nextPath);
    setRoute({ page: "workInvestigation", investigationSlug: slug, workSection: section });
    requestAnimationFrame(() => {
      if (anchor) document.getElementById(anchor)?.scrollIntoView({ block: "start" });
      else window.scrollTo({ top: 0, left: 0 });
    });
  }

  function showArticle(path: string) {
    if (!articleForPath(path)) return;
    const nextPath = investigationPath(path);
    if (`${window.location.pathname}${window.location.search}` !== nextPath) window.history.pushState({}, "", nextPath);
    setRoute({ page: "article", articlePath: path });
  }

  function showDogTasks() {
    showInvestigation("dogs");
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
    showPage("action");
  }

  function showReport(reportId: string) {
    const nextPath = `/reports/${encodeURIComponent(reportId)}/`;
    if (window.location.pathname !== nextPath) window.history.pushState({}, "", nextPath);
    setRoute({ page: "report", reportId });
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  }

  function showInvestigationReport(reportId: string, locationId?: string) {
    const originSection = route.page === "article" ? "findings" : route.page === "workInvestigation" ? route.workSection ?? "map" : "map";
    const params = new URLSearchParams({ from: originSection });
    if (locationId) params.set("location", locationId);
    if (googleExperiment) params.set("ui", "google");
    const nextPath = `/work/dogs/reports/${encodeURIComponent(reportId)}/?${params}`;
    if (`${window.location.pathname}${window.location.search}` !== nextPath) window.history.pushState({}, "", nextPath);
    setRoute({ page: "workInvestigation", investigationSlug: "dogs", workSection: originSection, reportId, reportLocationId: locationId });
  }

  function showStory(slug: string) {
    const nextPath = `/stories/${slug}/`;
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
    setRoute({ page: "storyDetail", storySlug: slug });
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0 }));
  }

  return <PageRenderer route={route} googleExperiment={googleExperiment} explorerResetKey={explorerResetKey} handlers={{ showPage, showGap, showInvestigation, showGapSection, showWork, showStory, showArticle, showInvestigationReport, showDogTasks }} />;
}
