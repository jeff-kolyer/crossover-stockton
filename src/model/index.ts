import identityData from "../data/crossover.json";
import peopleData from "../data/people.json";
import principlesData from "../data/principles.json";
import methodsData from "../data/methods.json";
import gapsData from "../data/gaps.json";
import investigationsData from "../data/dogs-investigations.json";
import questionsData from "../data/investigation-questions.json";
import tasksData from "../data/tasks.json";
import recordsData from "../data/records.json";
import findingsData from "../data/findings.json";
import orgsData from "../data/orgs.json";
import storiesData from "../data/stories.json";
import locationsData from "../data/investigation-locations.json";
import projectsData from "../data/projects.json";
import researchData from "../data/dogs-research.json";
import claimsData from "../data/claims.json";
import workstreamsData from "../data/workstreams.json";
import legacyWorkData from "../data/work.json";
import articlesData from "../data/articles.json";
import mapMaintenanceData from "../data/investigation-map-maintenance.json";
import activityQuestionGroupsData from "../data/activity-question-groups.json";
import type { EvidenceRecord, GapRecord, OrgRecord, StoryRecord } from "../types";
import type { InvestigationFinding, InvestigationQuestion, InvestigationTask } from "../types/investigation";
import { selectPublicUpdates } from "./publicUpdates";

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
  identity: typeof identityData;
  people: typeof peopleData;
  principles: typeof principlesData;
  methods: typeof methodsData;
  needs: GapRecord[];
  investigations: typeof investigationsData.active_investigations;
  questions: InvestigationQuestion[];
  tasks: InvestigationTask[];
  evidence: EvidenceRecord[];
  findings: InvestigationFinding[];
  organizations: OrgRecord[];
  stories: StoryRecord[];
  locations: typeof locationsData;
  projects: typeof projectsData;
  measurements: typeof researchData.measurements;
  researchBaseline: typeof researchData;
  investigationDataset: typeof investigationsData;
  mapMaintenance: typeof mapMaintenanceData;
  claims: typeof claimsData;
  workstreams: typeof workstreamsData;
  legacyWork: typeof legacyWorkData;
  articles: typeof articlesData;
  activityQuestionGroups: typeof activityQuestionGroupsData;
};

/** The Model has no React or page-layout dependency. It keeps raw records distinct from derived queries. */
export function createInformationModel(input: InformationInput) {
  const people = index(input.people, "people");
  const principles = index(input.principles, "principles");
  const methods = index(input.methods, "methods");
  const needs = index(input.needs, "needs");
  const investigations = index(input.investigations, "investigations");
  const questions = index(input.questions, "questions");
  const tasks = index(input.tasks, "tasks");
  const orderedTasks = [...input.tasks].sort((a, b) => a.order_by_id - b.order_by_id || a.id.localeCompare(b.id));
  const evidence = index(input.evidence, "evidence");
  const findings = index(input.findings, "findings");
  const organizations = index(input.organizations, "organizations");
  const stories = index(input.stories, "stories");
  const locations = index(input.locations, "locations");
  const projects = index(input.projects, "projects");
  const measurements = index(input.measurements, "measurements");
  const claims = index(input.claims, "claims");
  const workstreams = index(input.workstreams, "workstreams");
  const legacyWork = index(input.legacyWork, "legacy work");
  const articles = index(input.articles, "articles");
  const activityQuestionGroups = index(input.activityQuestionGroups, "activity question groups");

  requireReference(people.get(input.identity.founderPersonId), "person", input.identity.founderPersonId);
  for (const id of input.identity.principleIds) requireReference(principles.get(id), "principle", id);
  for (const id of input.identity.methodIds) requireReference(methods.get(id), "method", id);
  for (const item of input.questions) requireReference(investigations.get(item.investigation_id), "investigation", item.investigation_id);
  for (const item of input.tasks) requireReference(investigations.get(item.investigation_id), "investigation", item.investigation_id);
  for (const item of input.findings) requireReference(investigations.get(item.investigation_id), "investigation", item.investigation_id);
  for (const claim of input.claims) {
    requireReference(needs.get(claim.needId), "need", claim.needId);
    for (const id of claim.sourceRecordIds) requireReference(evidence.get(id), "evidence", id);
    if ("measurementId" in claim && claim.measurementId) requireReference(measurements.get(claim.measurementId), "measurement", claim.measurementId);
  }

  const actualActivities = input.evidence.filter((record) => record.record_type === "activity" && record.occurred_at && !record.evidence_status?.startsWith("planned"));
  return {
    getIdentity: () => input.identity,
    getPerson: (id: string) => people.get(id),
    getPrinciple: (id: string) => principles.get(id),
    getMethod: (id: string) => methods.get(id),
    getNeed: (id: string) => needs.get(id),
    getNeeds: () => input.needs,
    getInvestigation: (id: string) => investigations.get(id),
    getInvestigations: () => input.investigations,
    getInvestigationDataset: () => input.investigationDataset,
    getQuestion: (id: string) => questions.get(id),
    getQuestions: (investigationId: string) => input.questions.filter((question) => question.investigation_id === investigationId),
    getAllQuestions: () => input.questions,
    getTask: (id: string) => tasks.get(id),
    getTasks: (investigationId: string) => orderedTasks.filter((task) => task.investigation_id === investigationId),
    getAllTasks: () => orderedTasks,
    getActivity: (id: string) => actualActivities.find((record) => record.id === id),
    getAllActivities: () => actualActivities,
    getActivities: (questionId: string) => {
      const question = requireReference(questions.get(questionId), "question", questionId);
      return question.activity_record_ids.map((id) => requireReference(actualActivities.find((record) => record.id === id), "actual activity", id));
    },
    getFinding: (id: string) => findings.get(id),
    getAllFindings: () => input.findings,
    getFindings: (questionId: string) => {
      const question = requireReference(questions.get(questionId), "question", questionId);
      return question.finding_ids.map((id) => requireReference(findings.get(id), "finding", id));
    },
    getEvidenceRecord: (id: string) => evidence.get(id),
    getAllEvidence: () => input.evidence,
    getPublicUpdates: () => selectPublicUpdates(input.needs, input.evidence),
    getEvidence: (findingId: string) => {
      const finding = requireReference(findings.get(findingId), "finding", findingId);
      return { supporting: finding.supporting_record_ids.map((id) => requireReference(evidence.get(id), "evidence", id)), contradicting: finding.contradicting_record_ids.map((id) => requireReference(evidence.get(id), "evidence", id)) };
    },
    getSources: (recordId: string) => {
      const record = requireReference(evidence.get(recordId), "evidence", recordId);
      return [record.source, ...(record.context_sources ?? [])];
    },
    getRelatedLocations: (recordId: string) => {
      requireReference(evidence.get(recordId), "evidence", recordId);
      return input.locations.filter((location) => location.evidence_record_id === recordId || location.evidence_record_ids?.includes(recordId));
    },
    getLocation: (id: string) => locations.get(id),
    getAllLocations: () => input.locations,
    getMapMaintenance: () => input.mapMaintenance,
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
    getResearchBaseline: () => input.researchBaseline,
    getClaim: (id: string) => claims.get(id),
    getClaims: (needId: string) => input.claims.filter((claim) => claim.needId === needId),
    getAllClaims: () => input.claims,
    getWorkstream: (id: string) => workstreams.get(id),
    getWorkstreams: () => input.workstreams,
    getLegacyWork: (id: string) => legacyWork.get(id),
    getAllLegacyWork: () => input.legacyWork,
    getArticle: (id: string) => articles.get(id),
    getArticles: () => input.articles,
    getActivityQuestionGroup: (id: string) => activityQuestionGroups.get(id),
    getActivityQuestionGroups: () => input.activityQuestionGroups,
    getDevelopments: () => input.evidence.filter((record) => ["update", "planning_update", "operational_change", "organization_update", "capacity_intervention", "reported_context"].includes(record.record_type)),
  };
}

export const siteModel = createInformationModel({
  identity: identityData,
  people: peopleData,
  principles: principlesData,
  methods: methodsData,
  needs: gapsData as GapRecord[],
  investigations: investigationsData.active_investigations,
  questions: questionsData as InvestigationQuestion[],
  tasks: tasksData as InvestigationTask[],
  evidence: recordsData as EvidenceRecord[],
  findings: findingsData as InvestigationFinding[],
  organizations: orgsData as OrgRecord[],
  stories: storiesData as StoryRecord[],
  locations: locationsData,
  projects: projectsData,
  measurements: researchData.measurements,
  researchBaseline: researchData,
  investigationDataset: investigationsData,
  mapMaintenance: mapMaintenanceData,
  claims: claimsData,
  workstreams: workstreamsData,
  legacyWork: legacyWorkData,
  articles: articlesData,
  activityQuestionGroups: activityQuestionGroupsData,
});
