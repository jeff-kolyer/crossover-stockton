import { siteModel } from "../model";
import uiCopy from "../ui/shared.json";
import type { ActiveInvestigation } from "../types";

export const dogInvestigationId = "street-dog-immediate-welfare";
export const activeInvestigations = siteModel.getInvestigations() as ActiveInvestigation[];
export const investigationTasks = siteModel.getAllTasks();
export const openTaskLocationIds = new Set(investigationTasks
  .filter((task) => task.status === "open")
  .flatMap((task) => task.location_ids));
export const investigationObjectives = siteModel.getAllObjectives();
export const investigationFindings = siteModel.getAllFindings();
export const investigationRecords = siteModel.getAllRecords();

// The original evidence record is the Activity. No second event record is created.
export const investigationActivities = investigationRecords
  .filter((record) => record.record_type === "activity"
    && record.investigation_id === dogInvestigationId
    && Boolean(record.occurred_at)
    && !record.evidence_status?.startsWith("planned")
    && record.source.publisher?.startsWith(uiCopy.App.siteName))
  .sort((a, b) => (b.occurred_at ?? "").localeCompare(a.occurred_at ?? ""));

export const investigationRecordById = new Map(investigationRecords.map((record) => [record.id, record]));
export const investigationTaskById = new Map(investigationTasks.map((task) => [task.id, task]));
export const investigationObjectiveById = new Map(investigationObjectives.map((objective) => [objective.id, objective]));
