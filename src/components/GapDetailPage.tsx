import gapsData from "../data/gaps.json";
import type { GapRecord } from "../types";
import { DogGapExperience } from "./DogGapExperience";

type Section = "tasks" | "activity" | "map" | "findings";

interface GapDetailPageProps {
  slug?: string;
  section: Section;
  workspaceBasePath: string;
  articlePath?: string;
  onOpenArticle?: (path: string) => void;
  onOpenSection: (slug: string, section: Section, anchor?: string) => void;
  onNavigate: (page: "home" | "reality" | "action" | "organizations") => void;
  onOpenReport: (reportId: string) => void;
}

const gaps = gapsData as GapRecord[];

export function GapDetailPage({ slug, section, workspaceBasePath, articlePath, onOpenArticle, onOpenSection, onNavigate, onOpenReport }: GapDetailPageProps) {
  const gap = gaps.find((item) => item.slug === slug);
  if (!gap) return <main className="gap-page"><h1>Investigation not found</h1></main>;

  return <main className={`gap-page dog-gap-page is-${gap.investigation_status} crossover-workspace-app`}>
    <DogGapExperience
      gap={gap}
      section={section}
      workspaceBasePath={workspaceBasePath}
      articlePath={articlePath}
      onOpenArticle={onOpenArticle}
      onOpenSection={(next, anchor) => onOpenSection(gap.slug, next, anchor)}
      onNavigate={onNavigate}
      onOpenReport={onOpenReport}
    />
  </main>;
}
