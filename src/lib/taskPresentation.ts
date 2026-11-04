import uiCopy from "../ui/investigation.json";
import type { InvestigationTask } from "../types/investigation";
import { investigationRecordById } from "./investigationData";

export function taskListContext(task: InvestigationTask) {
  const status = task.status === "waiting" ? uiCopy.statusLabels.waiting : task.status === "cancelled" ? uiCopy.statusLabels.cancelled : uiCopy.statusLabels.open;
  if (!task.list_context || task.status === "cancelled") return status;

  const dateLabel = task.list_date_label;
  const datedRecord = dateLabel ? task.basis_record_ids
    .map((id) => investigationRecordById.get(id))
    .find((record) => record?.occurred_at || record?.published_at) : undefined;
  const date = datedRecord?.occurred_at || datedRecord?.published_at;
  const shortDate = date && new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
    .format(new Date(`${date.slice(0, 10)}T12:00:00Z`));
  return [status, dateLabel && shortDate ? `${dateLabel} ${shortDate}` : null, task.list_context].filter(Boolean).join(" · ");
}
