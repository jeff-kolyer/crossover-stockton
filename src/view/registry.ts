import compositions from "../pages/compositions.json";
import home from "../pages/home.json";
import siteNavigation from "../pages/site-navigation.json";
import actionCards from "../pages/action-cards.json";
import { siteModel } from "../model";

export const viewMethods = [
  "prose", "media-list", "media-grid", "collection-index", "disclosure-list", "timeline",
  "evidence-list", "finding-explanation", "statistics", "geographic-map", "split-investigation-workspace",
] as const;
export type ViewMethod = typeof viewMethods[number];
export type InformationSource = "site-navigation" | "action-cards" | "identity" | "people" | "principles" | "methods" | "needs" | "investigations" | "objectives" | "tasks" | "activities" | "evidence" | "findings" | "claims" | "organizations" | "stories" | "locations" | "projects" | "articles" | "measurements" | "developments";
export type PageSection = {
  id: string;
  source: InformationSource;
  method: ViewMethod;
  renderer?: string;
  region?: "hero" | "hero-action" | "body";
  field?: string;
  filter?: "active" | "featured" | "in_progress" | "home";
  order?: "rank" | "published-desc";
  limit?: number;
  recordIds?: string[];
};
type PageComposition = { id: string; route: string; sections: PageSection[] };

const sources = {
  "site-navigation": () => siteNavigation,
  "action-cards": () => actionCards,
  identity: () => [siteModel.getIdentity()],
  people: () => siteModel.getPeople(),
  principles: () => siteModel.getPrinciples(),
  methods: () => siteModel.getMethods(),
  needs: () => siteModel.getNeeds(),
  investigations: () => siteModel.getInvestigations(),
  objectives: () => siteModel.getAllObjectives(),
  tasks: () => siteModel.getAllTasks(),
  activities: () => siteModel.getAllActivities(),
  evidence: () => siteModel.getAllEvidence(),
  findings: () => siteModel.getAllFindings(),
  claims: () => siteModel.getAllClaims(),
  organizations: () => siteModel.getOrganizations(),
  stories: () => siteModel.getStories(),
  locations: () => siteModel.getAllLocations(),
  projects: () => siteModel.getProjects(),
  articles: () => siteModel.getArticles(),
  measurements: () => siteModel.getMeasurements(),
  developments: () => siteModel.getDevelopments(),
} satisfies Record<InformationSource, () => readonly { id: string }[]>;

export function getPageComposition(id: string) {
  return id === "home" ? home as PageComposition : (compositions as PageComposition[]).find((page) => page.id === id);
}

export function resolvePageSection(pageId: string, sectionId: string, model: typeof siteModel = siteModel) {
  const page = getPageComposition(pageId);
  if (!page) throw new Error(`Unknown page composition: ${pageId}`);
  const section = page.sections.find((item) => item.id === sectionId);
  if (!section) throw new Error(`Unknown section: ${pageId}/${sectionId}`);
  if (!viewMethods.includes(section.method as ViewMethod)) throw new Error(`Unknown view method: ${section.method}`);
  if (!(section.source in sources)) throw new Error(`Unknown information source: ${section.source}`);
  const items = (model === siteModel ? sources[section.source] : sourceForModel(model, section.source))();
  const resolved = section.recordIds ? section.recordIds.map((id) => {
    const record = items.find((item) => item.id === id);
    if (!record) throw new Error(`Missing ${section.source} record: ${id}`);
    return record;
  }) : items;
  let selected = [...resolved] as Array<{ id: string; [key: string]: unknown }>;
  if (section.filter === "active") selected = selected.filter((item) => item.active === true);
  if (section.filter === "featured") selected = selected.filter((item) => item.active === true && item.featured === true);
  if (section.filter === "in_progress") selected = selected.filter((item) => item.status === "in_progress");
  if (section.filter === "home") selected = selected.filter((item) => item.surface === "home");
  if (section.order === "rank") selected.sort((a, b) => (Number(a.status === "monitored") - Number(b.status === "monitored")) || Number(a.rank) - Number(b.rank));
  if (section.order === "published-desc") selected.sort((a, b) => Date.parse(String(b.published_at ?? "")) - Date.parse(String(a.published_at ?? "")));
  if (section.limit !== undefined) selected = selected.slice(0, section.limit);
  return { section, method: section.method, items: selected, value: section.field ? selected[0]?.[section.field] : undefined };
}

function sourceForModel(model: typeof siteModel, source: InformationSource): () => readonly { id: string }[] {
  if (source === "site-navigation") return () => siteNavigation;
  if (source === "action-cards") return () => actionCards;
  if (source === "identity") return () => [model.getIdentity()];
  if (source === "needs") return () => model.getNeeds();
  if (source === "investigations") return () => model.getInvestigations();
  if (source === "stories") return () => model.getStories();
  throw new Error(`Model override does not support ${source}`);
}
