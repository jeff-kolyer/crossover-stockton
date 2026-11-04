import actionCards from "../pages/action-cards.json";
import { siteModel } from "../model";

const investigationId = "street-dog-immediate-welfare";
const tasks = siteModel.getTasks(investigationId);
const activities = siteModel.getAllActivities();
const activityById = new Map(activities.map((record) => [record.id, record]));
const completedActivitiesFor = (types: string[]) => tasks
  .filter((task) => types.includes(task.type))
  .flatMap((task) => task.activity_record_ids)
  .map((id) => activityById.get(id))
  .filter((record) => record !== undefined);

const fieldVisits = completedActivitiesFor(["field_observation"]);
const dogCounts = fieldVisits.map((record) => record.observed_dog_count);
const recordRequests = completedActivitiesFor(["records_request"]);
const applications = completedActivitiesFor(["application"]);
const count = (items: readonly unknown[]) => String(items.length);
const values: Record<string, string> = {
  "field-visits": count(fieldVisits),
  "dogs-spotted": fieldVisits.length === 0 ? "0" : dogCounts.every((value) => typeof value === "number") ? String(dogCounts.reduce((sum, value) => sum + (value ?? 0), 0)) : "Unknown",
  "reporting-tested": activities.some((record) => record.investigation_id === investigationId && record.outcome?.status === "reporting_tested") ? "Yes" : "Not yet",
  requested: count(recordRequests),
  received: count(recordRequests.filter((record) => record.outcome?.status === "received")),
  pending: count(recordRequests.filter((record) => record.outcome?.status === "awaiting_response")),
  initiated: count(applications),
  "awaiting-response": count(applications.filter((record) => record.outcome?.status === "awaiting_response" || record.outcome?.status === "awaiting_next_step")),
  tested: count(applications.filter((record) => record.outcome?.status === "participated" || record.outcome?.status === "onboarded")),
};

export type CrossoverAction = {
  id: string;
  title: string;
  href: string;
  summary: string;
  buttonLabel: string;
  image: { src: string; alt: string; width: number; height: number };
  status: { value: string; label: string }[];
  active: boolean;
};

export const dogStreetActionId = "verifying-reported-conditions";

export const crossoverActions: CrossoverAction[] = actionCards.map((card) => ({
  ...card,
  status: card.metrics.map(({ id, label }) => {
    if (!(id in values)) throw new Error(`Unknown Action metric: ${id}`);
    return { value: values[id], label };
  }),
}));
export const activeCrossoverActions = crossoverActions.filter((action) => action.active);
