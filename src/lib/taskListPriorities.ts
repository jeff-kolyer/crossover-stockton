import uiCopy from "../data/pages/investigations/dogs/tasks.json";
import type { InvestigationTask } from "../types/investigation";
import { investigationRecordById } from "./investigationData";

// Reviewed ordering of active work. Update this assessment when the evidence or next steps change.
const assessment: Array<{ id: string; context: string; dateLabel?: string }> = uiCopy.assessments;

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
  const status = task.status === "waiting" ? uiCopy.taskListPriorities.waiting : task.status === "cancelled" ? uiCopy.taskListPriorities.cancelled : uiCopy.taskListPriorities.open;
  const item = assessmentById.get(task.id);
  if (!item || task.status === "cancelled") return status;

  const dateLabel = "dateLabel" in item ? item.dateLabel : undefined;
  const datedRecord = dateLabel ? task.basis_record_ids
    .map((id) => investigationRecordById.get(id))
    .find((record) => record?.occurred_at || record?.published_at) : undefined;
  const date = datedRecord?.occurred_at || datedRecord?.published_at;
  const shortDate = date && new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
    .format(new Date(`${date.slice(0, 10)}T12:00:00Z`));
  return [status, dateLabel && shortDate ? `${dateLabel} ${shortDate}` : null, item.context].filter(Boolean).join(" · ");
}
