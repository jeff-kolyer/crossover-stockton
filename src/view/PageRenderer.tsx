import { ActionIndexPage } from "../components/ActionIndexPage";
import { AboutPage } from "../components/AboutPage";
import { GapDetailPage } from "../components/GapDetailPage";
import { GapReferencePage } from "../components/GapReferencePage";
import { FieldReportPage } from "../components/FieldReportPage";
import { HomePage } from "../components/HomePage";
import { StoryDetailPage } from "../components/StoryDetailPage";
import { SiteShell, type PageMode } from "../components/SiteShell";
import { UpdatesPage } from "../components/UpdatesPage";
import { ExplorerPage } from "../components/ExplorerPage";
import type { PublicRoute } from "../components/PublicMobileMenu";
import { dogGapSlug } from "../lib/dogGapLegacy";
import { gaps, investigations, type RouteState, type WorkSection } from "../controller/routes";

type PageHandlers = {
  showPage: (page: PublicRoute) => void;
  showGap: (slug: string) => void;
  showInvestigation: (slug: string, section?: WorkSection, anchor?: string) => void;
  showGapSection: (slug: string, section: NonNullable<RouteState["gapSection"]>, anchor?: string) => void;
  showWork: (workId: string, anchor?: string) => void;
  showStory: (slug: string) => void;
  showArticle: (path: string) => void;
  showInvestigationReport: (reportId: string, locationId?: string) => void;
  showDogTasks: () => void;
};

export function PageRenderer({ route, googleExperiment, explorerResetKey, handlers }: { route: RouteState; googleExperiment: boolean; explorerResetKey: number; handlers: PageHandlers }) {
  const { showPage, showGap, showInvestigation, showGapSection, showWork, showStory, showArticle, showInvestigationReport, showDogTasks } = handlers;
  const firstGapSlug = gaps.find((gap) => gap.active)?.slug ?? gaps[0]?.slug;
  const pageMode: PageMode = route.page === "workInvestigation" || route.page === "article" ? "flush"
    : route.page === "home" || route.page === "reality" || route.page === "connection" ? "hero" : "standard";
  const activePage: PublicRoute = route.page === "workInvestigation" || route.page === "article" ? "investigation"
    : route.page === "gapDetail" || route.page === "report" ? "reality"
    : route.page === "storyDetail" ? "connection" : route.page;

  return (
    <SiteShell active={activePage} mode={pageMode} onNavigate={showPage}>
      {(route.page === "home" || route.page === "reality" || route.page === "connection") && (
        <HomePage
          page={route.page}
          onNavigate={showPage}
          onOpenAbout={() => showPage("about")}
          onOpenGap={showGap}
          onOpenOverview={() => showInvestigation("dogs", "activity", "overview")}
          onOpenGapSection={showGapSection}
          onOpenWork={showWork}
          onOpenStory={showStory}
          onOpenTasks={showDogTasks}
        />
      )}

      {route.page === "action" && (
        <ActionIndexPage
          onOpenTasks={showDogTasks}
          onOpenInvestigation={() => showInvestigation("dogs", "activity", "overview")}
        />
      )}

      {route.page === "gapDetail" && (
        <GapReferencePage slug={route.gapSlug ?? firstGapSlug} onNavigate={showPage} onOpenGap={showGap} onOpenArticle={showArticle} onOpenFindings={() => showInvestigation("dogs", "findings")} />
      )}

      {(route.page === "workInvestigation" || route.page === "article") && <GapDetailPage
        slug={route.page === "article" ? dogGapSlug : investigations.find((item) => item.slug === route.investigationSlug)?.gapSlug}
        section={route.page === "article" ? "findings" : route.workSection ?? "tasks"}
        articlePath={route.page === "article" ? route.articlePath : undefined}
        reportId={route.reportId}
        reportLocationId={route.reportLocationId}
        googleExperiment={googleExperiment}
        onOpenArticle={showArticle}
        workspaceBasePath={route.page === "article" ? "/work/dogs/" : `/work/${route.investigationSlug}/`}
        onOpenSection={showGapSection}
        onOpenReport={showInvestigationReport}
      />}

      {route.page === "report" && (
        <FieldReportPage
          reportId={route.reportId}
          onNavigate={showPage}
          onOpenGap={showGap}
          onOpenInvestigationActivity={(id) => {
            const investigation = investigations.find((item) => item.id === id);
            if (investigation) showInvestigation(investigation.slug, "activity");
          }}
          onOpenInvestigationReports={() => showGapSection(dogGapSlug, "reports")}
        />
      )}

      {route.page === "about" && (
        <AboutPage
          onNavigate={showPage}
          onOpenTasks={() => showInvestigation("dogs", "tasks")}
          onOpenWork={showWork}
          onOpenGap={showGap}
          onOpenResearch={() => showGapSection("too-many-dogs-still-lack-safe-placement", "research")}
          onOpenFindings={() => showInvestigation("dogs", "findings")}
        />
      )}

      {route.page === "updates" && (
        <UpdatesPage
          onOpenGap={showGap}
        />
      )}

      {route.page === "data" && <ExplorerPage key={explorerResetKey} />}

      {route.page === "storyDetail" && (
        <StoryDetailPage
          slug={route.storySlug}
          onOpenGap={showGap}
        />
      )}

    </SiteShell>
  );
}
