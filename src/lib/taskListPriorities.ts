import type { InvestigationTask } from "../types/investigation";
import { investigationRecordById } from "./investigationData";

// Reviewed ordering of active work. Update this assessment when the evidence or next steps change.
const assessment = [
  { id: "task-ssd-ask-contact-questions", dateLabel: "Applied", context: "Clarify field access and current care needs" },
  { id: "task-sas-field-call-follow-up", dateLabel: "Requested", context: "General-area records could guide fieldwork" },
  { id: "task-visit-st-marys-dog-care", context: "Field visit planned · Learn from existing caregivers" },
  { id: "task-verify-south-stockton-district-5-reports", dateLabel: "KCRA", context: "Identify a supported public location first" },
  { id: "task-review-reported-location-sources", context: "Review historical Louis Park and Stanislaus reports before fieldwork" },
  { id: "task-sas-volunteer-onboarding-follow-up", dateLabel: "Applied", context: "Check onboarding and orientation" },
  { id: "task-contact-cbs-charlie-lapastora", context: "Clarify reported locations and seek firsthand leads" },
  { id: "task-monitor-animal-control-ordinance", context: "Verify the Council outcome" },
] as const;

const assessmentById = new Map<string, (typeof assessment)[number]>(assessment.map((item) => [item.id, item]));
const orderById = new Map<string, number>(assessment.map((item, index) => [item.id, index]));

export function orderInvestigationTasks(tasks: InvestigationTask[]) {
  const group = (task: InvestigationTask) => task.status === "done" ? 2 : task.status === "cancelled" ? 1 : 0;
  return [...tasks].sort((a, b) => group(a) - group(b)
    || (a.status === "done" && b.status === "done" ? (b.completed_at ?? "").localeCompare(a.completed_at ?? "") : 0)
    || (orderById.get(a.id) ?? assessment.length) - (orderById.get(b.id) ?? assessment.length)
    || a.title.localeCompare(b.title));
}

export function taskPriorityContext(task: InvestigationTask) {
  const status = task.status === "waiting" ? "Waiting for response" : task.status === "cancelled" ? "Cancelled" : "Open";
  const item = assessmentById.get(task.id);
  if (!item || task.status === "cancelled") return status;

  const dateLabel = "dateLabel" in item ? item.dateLabel : undefined;
  const datedRecord = dateLabel && task.basis_record_ids
    .map((id) => investigationRecordById.get(id))
    .find((record) => record?.occurred_at || record?.published_at);
  const date = datedRecord?.occurred_at || datedRecord?.published_at;
  const shortDate = date && new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
    .format(new Date(`${date.slice(0, 10)}T12:00:00Z`));
  return [status, dateLabel && shortDate ? `${dateLabel} ${shortDate}` : null, item.context].filter(Boolean).join(" · ");
}
