import tasksData from "../data/tasks.json";
import questionsData from "../data/investigation-questions.json";
import findingsData from "../data/findings.json";
import recordsData from "../data/records.json";
import type { EvidenceRecord } from "../types";
import type { InvestigationFinding, InvestigationQuestion, InvestigationTask } from "../types/investigation";

export const dogInvestigationId = "street-dog-immediate-welfare";
export const investigationTasks = tasksData as InvestigationTask[];
export const investigationQuestions = questionsData as InvestigationQuestion[];
export const investigationFindings = findingsData as InvestigationFinding[];
export const investigationRecords = recordsData as EvidenceRecord[];

// The original evidence record is the Activity. No second event record is created.
export const investigationActivities = investigationRecords
  .filter((record) => record.record_type === "activity"
    && record.investigation_id === dogInvestigationId
    && Boolean(record.occurred_at)
    && !record.evidence_status?.startsWith("planned")
    && record.source.publisher?.startsWith("Crossover Stockton"))
  .sort((a, b) => (b.occurred_at ?? "").localeCompare(a.occurred_at ?? ""));

export const investigationRecordById = new Map(investigationRecords.map((record) => [record.id, record]));
export const investigationTaskById = new Map(investigationTasks.map((task) => [task.id, task]));
export const investigationQuestionById = new Map(investigationQuestions.map((question) => [question.id, question]));
