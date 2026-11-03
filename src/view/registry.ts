import compositions from "../data/pages/compositions.json";
import { siteModel } from "../model";

export const viewMethods = [
  "prose", "media-list", "media-grid", "collection-index", "disclosure-list", "timeline",
  "evidence-list", "finding-explanation", "statistics", "geographic-map", "split-investigation-workspace",
] as const;
export type ViewMethod = typeof viewMethods[number];
export type InformationSource = "identity" | "people" | "principles" | "methods" | "needs" | "investigations" | "questions" | "tasks" | "activities" | "evidence" | "findings" | "claims" | "organizations" | "stories" | "locations" | "workstreams" | "legacy-work" | "projects" | "articles" | "measurements" | "developments";

const sources = {
  identity: () => [siteModel.getIdentity()],
  people: () => siteModel.getPeople(),
  principles: () => siteModel.getPrinciples(),
  methods: () => siteModel.getMethods(),
  needs: () => siteModel.getNeeds(),
  investigations: () => siteModel.getInvestigations(),
  questions: () => siteModel.getAllQuestions(),
  tasks: () => siteModel.getAllTasks(),
  activities: () => siteModel.getAllActivities(),
  evidence: () => siteModel.getAllEvidence(),
  findings: () => siteModel.getAllFindings(),
  claims: () => siteModel.getAllClaims(),
  organizations: () => siteModel.getOrganizations(),
  stories: () => siteModel.getStories(),
  locations: () => siteModel.getAllLocations(),
  workstreams: () => siteModel.getWorkstreams(),
  "legacy-work": () => siteModel.getAllLegacyWork(),
  projects: () => siteModel.getProjects(),
  articles: () => siteModel.getArticles(),
  measurements: () => siteModel.getMeasurements(),
  developments: () => siteModel.getDevelopments(),
} satisfies Record<InformationSource, () => readonly { id: string }[]>;

export function getPageComposition(id: string) {
  return compositions.find((page) => page.id === id);
}

export function resolvePageSection(pageId: string, sectionId: string) {
  const page = getPageComposition(pageId);
  if (!page) throw new Error(`Unknown page composition: ${pageId}`);
  const section = page.sections.find((item) => item.id === sectionId);
  if (!section) throw new Error(`Unknown section: ${pageId}/${sectionId}`);
  if (!viewMethods.includes(section.method as ViewMethod)) throw new Error(`Unknown view method: ${section.method}`);
  if (!(section.source in sources)) throw new Error(`Unknown information source: ${section.source}`);
  const items = sources[section.source as InformationSource]();
  const resolved = section.recordIds ? section.recordIds.map((id) => {
    const record = items.find((item) => item.id === id);
    if (!record) throw new Error(`Missing ${section.source} record: ${id}`);
    return record;
  }) : items;
  return { method: section.method as ViewMethod, items: resolved };
}
