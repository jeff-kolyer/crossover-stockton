import crossoverData from "../data/crossover.json";
import peopleData from "../data/people.json";
import gapsData from "../data/gaps.json";
import tasksData from "../data/tasks.json";
import activitiesData from "../data/activities.json";
import evidenceData from "../data/evidence.json";
import findingsData from "../data/findings.json";
import orgsData from "../data/organizations.json";
import locationsData from "../data/locations.json";
import initiativesData from "../data/improvements.json";
import measurementsData from "../data/measurements.json";
import claimsData from "../data/claims.json";
import type { EvidenceRecord, GapRecord, OrgRecord } from "../types";
import type { FindingRecord, TaskRecord } from "../types/work";
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
  gaps: GapRecord[];
  tasks: TaskRecord[];
  activities: EvidenceRecord[];
  evidence: EvidenceRecord[];
  findings: FindingRecord[];
  organizations: OrgRecord[];
  locations: typeof locationsData;
  initiatives: typeof initiativesData;
  measurements: typeof measurementsData;
  claims: typeof claimsData;
};

/** The Model has no React or page-layout dependency. It keeps raw records distinct from derived queries. */
export function createInformationModel(input: InformationInput) {
  const people = index(input.people, "people");
  const principles = index(input.principles, "principles");
  const methods = index(input.methods, "methods");
  const gaps = index(input.gaps, "gaps");
  const tasks = index(input.tasks, "tasks");
  const orderedTasks = [...input.tasks].sort((a, b) => a.order_by_id - b.order_by_id || a.id.localeCompare(b.id));
  const activities = index(input.activities, "activities");
  const evidence = index(input.evidence, "evidence");
  const allRecords = [...input.evidence, ...input.activities];
  const records = index(allRecords, "activities and evidence");
  if (input.activities.some((record) => record.record_type !== "activity" || !record.occurred_at || record.evidence_status?.startsWith("planned"))) throw new Error("activities.json must contain completed activities");
  if (input.evidence.some((record) => record.record_type === "activity")) throw new Error("evidence.json contains an activity");
  const findings = index(input.findings, "findings");
  const organizations = index(input.organizations, "organizations");
  const locations = index(input.locations, "locations");
  const initiatives = index(input.initiatives, "initiatives");
  const measurements = index(input.measurements, "measurements");
  const claims = index(input.claims, "claims");

  requireReference(people.get(input.identity.founderPersonId), "person", input.identity.founderPersonId);
  for (const id of input.identity.principleIds) requireReference(principles.get(id), "principle", id);
  for (const id of input.identity.methodIds) requireReference(methods.get(id), "method", id);
  for (const item of [...input.tasks, ...input.findings, ...input.locations, ...input.activities, ...input.evidence])
    for (const id of item.gap_ids ?? []) requireReference(gaps.get(id), "gap", id);
  for (const claim of input.claims) {
    requireReference(gaps.get(claim.gap_id), "gap", claim.gap_id);
    for (const id of claim.sourceRecordIds) requireReference(evidence.get(id), "evidence", id);
    if ("measurementId" in claim && claim.measurementId) requireReference(measurements.get(claim.measurementId), "measurement", claim.measurementId);
  }

  return {
    getIdentity: () => input.identity,
    getPerson: (id: string) => people.get(id),
    getPrinciple: (id: string) => principles.get(id),
    getMethod: (id: string) => methods.get(id),
    getGap: (id: string) => gaps.get(id),
    getGaps: () => input.gaps,
    getTask: (id: string) => tasks.get(id),
    getTasks: (gapId: string) => orderedTasks.filter((task) => task.gap_ids.includes(gapId)),
    getAllTasks: () => orderedTasks,
    getActivity: (id: string) => activities.get(id),
    getAllActivities: () => input.activities,
    getActivities: (gapId: string) => input.activities.filter((activity) => activity.gap_ids.includes(gapId)),
    getFinding: (id: string) => findings.get(id),
    getAllFindings: () => input.findings,
    getFindings: (gapId: string) => input.findings.filter((finding) => finding.gap_ids.includes(gapId)),
    getEvidenceRecord: (id: string) => evidence.get(id),
    getAllEvidence: () => input.evidence,
    getRecord: (id: string) => records.get(id),
    getAllRecords: () => allRecords,
    getPublicUpdates: () => selectPublicUpdates(input.gaps, allRecords),
    getPublicDevelopments: () => selectPublicUpdates(input.gaps, allRecords).filter(({ record }) => publicUpdateCategory(record) === "development"),
    getInvestigationUpdates: () => selectPublicUpdates(input.gaps, allRecords).filter(({ record }) => publicUpdateCategory(record) === "investigation_update"),
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
    getInitiative: (id: string) => initiatives.get(id),
    getInitiatives: () => input.initiatives,
    getMeasurement: (id: string) => measurements.get(id),
    getMeasurements: () => input.measurements,
    getClaim: (id: string) => claims.get(id),
    getClaims: (gapId: string) => input.claims.filter((claim) => claim.gap_id === gapId),
    getAllClaims: () => input.claims,
    getDevelopments: () => input.evidence.filter((record) => ["update", "planning_update", "operational_change", "organization_update", "capacity_intervention", "reported_context"].includes(record.record_type)),
  };
}

export const siteModel = createInformationModel({
  identity: crossoverData.identity,
  people: peopleData,
  principles: crossoverData.principles,
  methods: crossoverData.methods,
  gaps: gapsData.records as GapRecord[],
  tasks: tasksData as TaskRecord[],
  activities: activitiesData as EvidenceRecord[],
  evidence: evidenceData as EvidenceRecord[],
  findings: findingsData as FindingRecord[],
  organizations: orgsData as OrgRecord[],
  locations: locationsData,
  initiatives: initiativesData,
  measurements: measurementsData,
  claims: claimsData,
});
