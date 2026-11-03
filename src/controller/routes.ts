import uiCopy from "../data/ui-copy.json";
import gapsData from "../data/gaps.json";
import storiesData from "../data/stories.json";
import workData from "../data/work.json";
import recordsData from "../data/records.json";
import orgsData from "../data/orgs.json";
import { articleForPath } from "../lib/articles";
import { organizationActivityHref, organizationsActivityHref } from "../lib/organizationActivity";
import { dogGapBase, dogGapSlug, legacyDogWorkDestination } from "../lib/dogGapLegacy";
import type { EvidenceRecord, GapRecord, OrgRecord, StoryRecord } from "../types";
import type { PublicRoute } from "../components/PublicMobileMenu";
import { siteModel } from "../model";

export const gaps = gapsData as GapRecord[];
const stories = storiesData as StoryRecord[];
const work = workData as { id: string; title: string }[];
const reports = (recordsData as EvidenceRecord[]).filter((record) => record.record_type === "field_report");
const organizations = orgsData as OrgRecord[];
const uiText = uiCopy.App;

export type AppRoute = "home" | "workInvestigation" | "reality" | "gapDetail" | "report" | "article" | "storyDetail" | "connection" | "action" | "updates" | "about";
export type WorkSection = "tasks" | "activity" | "map" | "findings";
export const investigations = [{ slug: "dogs", id: "street-dog-immediate-welfare", gapSlug: dogGapSlug, title: siteModel.getInvestigation("street-dog-immediate-welfare")!.publicName }] as const;
export const workSections: WorkSection[] = ["tasks", "activity", "map", "findings"];

export interface RouteState {
  page: AppRoute;
  gapSlug?: string;
  gapSection?: "overview" | "tasks" | "activity" | "reports" | "map" | "findings" | "more" | "key-factors" | "ways-to-help" | "improvements" | "our-findings" | "research" | "updates";
  storySlug?: string;
  reportId?: string;
  reportLocationId?: string;
  articlePath?: string;
  investigationSlug?: string;
  workSection?: WorkSection;
}

export const ROUTE_PATHS: Record<Exclude<PublicRoute, "investigation">, string> = {
  home: "/",
  reality: "/reality/",
  connection: "/connection/",
  action: "/action/",
  updates: "/updates/",
  about: "/about/",
};

export function routeFromPathname(pathname: string, search = ""): RouteState {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (normalized === "/work") return { page: "action" };
  if (/^\/articles\/[^/]+$/.test(normalized)) return { page: "article", articlePath: `${normalized}/` };
  if (normalized === "/work/dogs/about") return { page: "workInvestigation", investigationSlug: "dogs", workSection: "activity" };
  if (normalized === `${dogGapBase}about`.replace(/\/$/, "")) return { page: "gapDetail", gapSlug: dogGapSlug, gapSection: "overview" };
  const investigationReport = normalized.match(/^\/work\/dogs\/reports\/([^/]+)$/);
  if (investigationReport) {
    const params = new URLSearchParams(search);
    const from = params.get("from");
    return { page: "workInvestigation", investigationSlug: "dogs", workSection: workSections.includes(from as WorkSection) ? from as WorkSection : "map", reportId: decodeURIComponent(investigationReport[1]), reportLocationId: params.get("location") ?? undefined };
  }
  const workInvestigation = normalized.match(/^\/work\/([^/]+)(?:\/(tasks|activity|map|findings))?$/);
  if (workInvestigation && investigations.some((item) => item.slug === workInvestigation[1])) return { page: "workInvestigation", investigationSlug: workInvestigation[1], workSection: (workInvestigation[2] as WorkSection | undefined) ?? "tasks" };
  if (normalized === "/action/look-for-dogs-on-the-street") return { page: "workInvestigation", investigationSlug: "dogs", workSection: "tasks" };
  const organizationDetail = normalized.match(/^\/organizations\/([^/]+)$/);
  if (organizationDetail) return { page: "workInvestigation", investigationSlug: "dogs", workSection: "activity" };
  const gapSection = normalized.match(/^\/reality\/([^/]+)\/(tasks|activity|reports|map|findings|more|key-factors|ways-to-help|improvements|our-findings|research|sources|updates)$/);
  if (gapSection) {
    const gapSlug = decodeURIComponent(gapSection[1]);
    const gap = gaps.find((item) => item.slug === gapSlug);
    const requestedSection = gapSection[2] === "sources" ? "research" : gapSection[2];
    return { page: "gapDetail", gapSlug, gapSection: requestedSection === "our-findings" && gap?.investigation_status !== "investigating" ? "overview" : requestedSection as RouteState["gapSection"] };
  }
  if (normalized.startsWith("/work/")) {
    const workId = decodeURIComponent(normalized.replace("/work/", ""));
    const destination = legacyDogWorkDestination(workId);
    return destination ? { page: "gapDetail", gapSlug: dogGapSlug, gapSection: destination.section } : { page: "action" };
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
  if (normalized === "/organizations") return { page: "workInvestigation", investigationSlug: "dogs", workSection: "activity" };
  return { page: "home" };
}

export function canonicalPathname(pathname: string, hash = "") {
  if (/^\/work\/?$/.test(pathname)) return "/action/";
  if (/^\/work\/dogs\/about\/?$/.test(pathname)) return "/work/dogs/activity/#overview";
  if (/^\/organizations\/?$/.test(pathname)) return organizationsActivityHref;
  const oldOrganization = pathname.match(/^\/organizations\/([^/]+)\/?$/);
  if (oldOrganization) {
    const slug = decodeURIComponent(oldOrganization[1]);
    return organizations.some((org) => org.slug === slug) ? organizationActivityHref(slug) : organizationsActivityHref;
  }
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

export function titleForRoute(route: RouteState) {
  if (route.page === "article") return `${articleForPath(route.articlePath ?? "")?.title ?? uiText.articleNotFound} | ${uiText.siteName}`;
  if (route.page === "workInvestigation" && route.reportId) return `${reports.find((item) => item.id === route.reportId)?.title ?? uiText.fieldReportNotFound} | ${uiText.siteName}`;
  if (route.page === "workInvestigation" && route.workSection === "findings") return `${uiText.sectionTitles.findings} | ${uiText.siteName}`;
  if (route.page === "workInvestigation") return `${investigations.find((item) => item.slug === route.investigationSlug)?.title ?? uiText.investigation} — ${uiText.workSectionTitles[route.workSection ?? "tasks"]} | ${uiText.siteName}`;
  if (route.page === "gapDetail") {
    const gap = gaps.find((item) => item.slug === route.gapSlug);
    const suffix = route.gapSection ? uiText.sectionTitles[route.gapSection] : uiText.reality;
    return gap ? `${gap.title} — ${suffix} | ${uiText.siteName}` : `${suffix} | ${uiText.siteName}`;
  }
  if (route.page === "report") {
    const report = reports.find((item) => item.id === route.reportId);
    return report ? `${report.title} | ${uiText.siteName}` : `${uiText.fieldReportNotFound} | ${uiText.siteName}`;
  }
  if (route.page === "storyDetail") {
    const story = stories.find((item) => item.slug === route.storySlug);
    return story ? `${story.title} | ${uiText.siteName}` : `${uiText.stories} | ${uiText.siteName}`;
  }
  const titles: Record<Exclude<AppRoute, "gapDetail" | "workInvestigation" | "report" | "article" | "storyDetail">, string> = uiText.routeTitles;
  return titles[route.page];
}
