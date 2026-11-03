import uiCopy from "../data/pages/investigations/dogs/overview.json";
import { siteModel } from "../model";
import type { GapRecord } from "../types";
import { DogGapExperience } from "./DogGapExperience";

const uiText = uiCopy.GapDetailPage;

type Section = "tasks" | "activity" | "map" | "findings";

interface GapDetailPageProps {
  slug?: string;
  section: Section;
  workspaceBasePath: string;
  articlePath?: string;
  reportId?: string;
  reportLocationId?: string;
  googleExperiment?: boolean;
  onOpenArticle?: (path: string) => void;
  onOpenSection: (slug: string, section: Section, anchor?: string) => void;
  onOpenReport: (reportId: string, locationId?: string) => void;
}

const gaps = siteModel.getNeeds();

export function GapDetailPage({ slug, section, workspaceBasePath, articlePath, reportId, reportLocationId, googleExperiment = false, onOpenArticle, onOpenSection, onOpenReport }: GapDetailPageProps) {
  const gap = gaps.find((item) => item.slug === slug);
  if (!gap) return <main className="gap-page"><h1>{uiText.investigationNotFound}</h1></main>;

  return <main className={`gap-page dog-gap-page is-${gap.investigation_status} workspace-app${googleExperiment ? " investigation-google" : ""}`}>
    <DogGapExperience
      gap={gap}
      section={section}
      workspaceBasePath={workspaceBasePath}
      articlePath={articlePath}
      reportId={reportId}
      reportLocationId={reportLocationId}
      googleExperiment={googleExperiment}
      onOpenArticle={onOpenArticle}
      onOpenSection={(next, anchor) => onOpenSection(gap.slug, next, anchor)}
      onOpenReport={onOpenReport}
    />
  </main>;
}
