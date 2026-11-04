import crossoverData from "../data/crossover.json";
import peopleData from "../data/people.json";
import needsData from "../data/needs.json";
import investigationsData from "../data/investigations.json";
import objectivesData from "../data/objectives.json";
import actionsData from "../data/actions.json";
import activitiesData from "../data/activities.json";
import evidenceData from "../data/evidence.json";
import findingsData from "../data/findings.json";
import orgsData from "../data/organizations.json";
import storiesData from "../data/stories.json";
import locationsData from "../data/locations.json";
import projectsData from "../data/projects.json";
import measurementsData from "../data/measurements.json";
import claimsData from "../data/claims.json";
import articlesData from "../data/articles.json";
import type { EvidenceRecord, GapRecord, OrgRecord, StoryRecord } from "../types";
import type { InvestigationFinding, InvestigationObjective, InvestigationAction } from "../types/investigation";
import { publicUpdateCategory, selectPublicUpdates } from "./publicUpdates";

type Identified = { id: string };
const index = <T extends Identified>(items: T[], collection: string) => {
  const result = new Map<string, T>();
  for (const item of items) {
    if (!item.id || result.has(item.id)) throw new Error(`${collection}: missing or duplicate ID ${item.id}`);
    result.set(item.id, item);
  }
  return result;
};
const requireReference = <T>(value: T | undefined, collection: string, id: string): T => {
  if (!value) throw new Error(`Missing ${collection} reference: ${id}`);
  return value;
};

export type InformationInput = {
  identity: typeof crossoverData.identity;
  people: typeof peopleData;
  principles: typeof crossoverData.principles;
  methods: typeof crossoverData.methods;
  needs: GapRecord[];
  investigations: typeof investigationsData.records;
  objectives: InvestigationObjective[];
  actions: InvestigationAction[];
  activities: EvidenceRecord[];
  evidence: EvidenceRecord[];
  findings: InvestigationFinding[];
  organizations: OrgRecord[];
  stories: StoryRecord[];
  locations: typeof locationsData;
  projects: typeof projectsData;
  measurements: typeof measurementsData;
  claims: typeof claimsData;
  articles: typeof articlesData.records;
};

/** The Model has no React or page-layout dependency. It keeps raw records distinct from derived queries. */
export function createInformationModel(input: InformationInput) {
  const people = index(input.people, "people");
  const principles = index(input.principles, "principles");
  const methods = index(input.methods, "methods");
  const needs = index(input.needs, "needs");
  const investigations = index(input.investigations, "investigations");
  const objectives = index(input.objectives, "objectives");
  const actions = index(input.actions, "actions");
  const orderedActions = [...input.actions].sort((a, b) => a.order_by_id - b.order_by_id || a.id.localeCompare(b.id));
  const activities = index(input.activities, "activities");
  const evidence = index(input.evidence, "evidence");
  const allRecords = [...input.evidence, ...input.activities];
  const records = index(allRecords, "activities and evidence");
  if (input.activities.some((record) => record.record_type !== "activity" || !record.occurred_at || record.evidence_status?.startsWith("planned"))) throw new Error("activities.json must contain completed activities");
  if (input.evidence.some((record) => record.record_type === "activity")) throw new Error("evidence.json contains an activity");
  const findings = index(input.findings, "findings");
  const organizations = index(input.organizations, "organizations");
  const stories = index(input.stories, "stories");
  const locations = index(input.locations, "locations");
  const projects = index(input.projects, "projects");
  const measurements = index(input.measurements, "measurements");
  const claims = index(input.claims, "claims");
  const articles = index(input.articles, "articles");

  requireReference(people.get(input.identity.founderPersonId), "person", input.identity.founderPersonId);
  for (const id of input.identity.principleIds) requireReference(principles.get(id), "principle", id);
  for (const id of input.identity.methodIds) requireReference(methods.get(id), "method", id);
  for (const item of input.objectives) requireReference(investigations.get(item.investigation_id), "investigation", item.investigation_id);
  for (const item of input.actions) requireReference(investigations.get(item.investigation_id), "investigation", item.investigation_id);
  for (const item of input.findings) requireReference(investigations.get(item.investigation_id), "investigation", item.investigation_id);
  for (const claim of input.claims) {
    requireReference(needs.get(claim.needId), "need", claim.needId);
    for (const id of claim.sourceRecordIds) requireReference(evidence.get(id), "evidence", id);
    if ("measurementId" in claim && claim.measurementId) requireReference(measurements.get(claim.measurementId), "measurement", claim.measurementId);
  }

  return {
    getIdentity: () => input.identity,
    getPerson: (id: string) => people.get(id),
    getPrinciple: (id: string) => principles.get(id),
    getMethod: (id: string) => methods.get(id),
    getNeed: (id: string) => needs.get(id),
    getNeeds: () => input.needs,
    getInvestigation: (id: string) => investigations.get(id),
    getInvestigations: () => input.investigations,
    getObjective: (id: string) => objectives.get(id),
    getObjectives: (investigationId: string) => input.objectives.filter((objective) => objective.investigation_id === investigationId),
    getActivityObjectives: (investigationId: string) => input.objectives.filter((objective) => objective.investigation_id === investigationId),
    getAllObjectives: () => input.objectives,
    getAction: (id: string) => actions.get(id),
    getActions: (investigationId: string) => orderedActions.filter((action) => action.investigation_id === investigationId),
    getAllActions: () => orderedActions,
    getActivity: (id: string) => activities.get(id),
    getAllActivities: () => input.activities,
    getActivities: (objectiveId: string) => {
      const objective = requireReference(objectives.get(objectiveId), "objective", objectiveId);
      return objective.activity_record_ids.map((id) => requireReference(activities.get(id), "actual activity", id));
    },
    getFinding: (id: string) => findings.get(id),
    getAllFindings: () => input.findings,
    getFindings: (objectiveId: string) => {
      const objective = requireReference(objectives.get(objectiveId), "objective", objectiveId);
      return objective.finding_ids.map((id) => requireReference(findings.get(id), "finding", id));
    },
    getEvidenceRecord: (id: string) => evidence.get(id),
    getAllEvidence: () => input.evidence,
    getRecord: (id: string) => records.get(id),
    getAllRecords: () => allRecords,
    getPublicUpdates: () => selectPublicUpdates(input.needs, allRecords),
    getPublicDevelopments: () => selectPublicUpdates(input.needs, allRecords).filter(({ record }) => publicUpdateCategory(record) === "development"),
    getInvestigationUpdates: () => selectPublicUpdates(input.needs, allRecords).filter(({ record }) => publicUpdateCategory(record) === "investigation_update"),
    getEvidence: (findingId: string) => {
      const finding = requireReference(findings.get(findingId), "finding", findingId);
      return { supporting: finding.supporting_record_ids.map((id) => requireReference(records.get(id), "record", id)), contradicting: finding.contradicting_record_ids.map((id) => requireReference(records.get(id), "record", id)) };
    },
    getSources: (recordId: string) => {
      const record = requireReference(records.get(recordId), "record", recordId);
      return [record.source, ...(record.context_sources ?? [])];
    },
    getRelatedLocations: (recordId: string) => {
      requireReference(records.get(recordId), "record", recordId);
      return input.locations.filter((location) => location.evidence_record_id === recordId || location.evidence_record_ids?.includes(recordId));
    },
    getLocation: (id: string) => locations.get(id),
    getAllLocations: () => input.locations,
    getPeople: () => input.people,
    getPrinciples: () => input.principles,
    getMethods: () => input.methods,
    getOrganization: (id: string) => id === input.identity.id ? input.identity : organizations.get(id),
    getOrganizations: () => input.organizations,
    getStory: (id: string) => stories.get(id),
    getStories: () => input.stories,
    getProject: (id: string) => projects.get(id),
    getProjects: () => input.projects,
    getMeasurement: (id: string) => measurements.get(id),
    getMeasurements: () => input.measurements,
    getClaim: (id: string) => claims.get(id),
    getClaims: (needId: string) => input.claims.filter((claim) => claim.needId === needId),
    getAllClaims: () => input.claims,
    getArticle: (id: string) => articles.get(id),
    getArticles: () => input.articles,
    getDevelopments: () => input.evidence.filter((record) => ["update", "planning_update", "operational_change", "organization_update", "capacity_intervention", "reported_context"].includes(record.record_type)),
  };
}

export const siteModel = createInformationModel({
  identity: crossoverData.identity,
  people: peopleData,
  principles: crossoverData.principles,
  methods: crossoverData.methods,
  needs: needsData.records as GapRecord[],
  investigations: investigationsData.records,
  objectives: objectivesData as InvestigationObjective[],
  actions: actionsData as InvestigationAction[],
  activities: activitiesData as EvidenceRecord[],
  evidence: evidenceData as EvidenceRecord[],
  findings: findingsData as InvestigationFinding[],
  organizations: orgsData as OrgRecord[],
  stories: storiesData.records as StoryRecord[],
  locations: locationsData,
  projects: projectsData,
  measurements: measurementsData,
  claims: claimsData,
  articles: articlesData.records,
});
