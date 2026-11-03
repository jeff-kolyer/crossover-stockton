import dogsInvestigationsData from "./dogs-investigations.json";
import recordsData from "./records.json";
import actionPage from "./pages/action.json";
import workstreams from "./workstreams.json";
import type { EvidenceRecord } from "../types";

// The investigation names the request record; its outcome tracks whether it is still pending.
const recordsRequestId = (dogsInvestigationsData as {
  active_investigations: Array<{ id: string; records_request?: { activity_record_id: string } }>;
}).active_investigations.find((investigation) => investigation.id === "street-dog-immediate-welfare")?.records_request?.activity_record_id;
const recordsRequest = (recordsData as EvidenceRecord[]).find((record) => record.id === recordsRequestId && record.record_type === "activity");
const recordsRequestPending = recordsRequest?.outcome?.status === "awaiting_response" ? "1"
  : recordsRequest?.outcome?.status === "received" || recordsRequest?.outcome?.status === "closed" ? "0"
  : workstreams[1].status[2].value;

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

// The request metrics remain bound to the investigation record. Other metric values are
// manually reported in JSON until the corresponding evidence has a computable status.
export const crossoverActions: CrossoverAction[] = actionPage.actions.map((configuration) => {
  const workstream = workstreams.find((item) => item.id === configuration.id);
  if (!workstream) throw new Error(`Missing workstream: ${configuration.id}`);
  return { ...workstream, href: configuration.href, buttonLabel: configuration.buttonLabel };
}).map((action) =>
  action.id === "requesting-records"
    ? { ...action, status: action.status.map((metric, index) => index === 0
      ? { ...metric, value: recordsRequest ? "1" : metric.value }
      : index === 2 ? { ...metric, value: recordsRequestPending } : metric) }
    : action
);

export const activeCrossoverActions = crossoverActions.filter((action) => action.active);
