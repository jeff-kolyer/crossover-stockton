import actionPage from "./pages/action.json";
import { siteModel } from "../model";

// The investigation names the request record; its outcome tracks whether it is still pending.
const recordsRequestId = siteModel.getInvestigation("street-dog-immediate-welfare")?.records_request?.activity_record_id;
const recordsRequest = recordsRequestId ? siteModel.getActivity(recordsRequestId) : undefined;
const workstreams = siteModel.getWorkstreams();
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
