export type TaskStatus = "open" | "waiting" | "done" | "cancelled";

export interface InvestigationTask {
  id: string;
  investigation_id: string;
  title: string;
  status: TaskStatus;
  type: "application" | "inquiry" | "field_observation" | "records_request" | "follow_up" | "source_review" | "organization_contact";
  instructions: string;
  location_ids: string[];
  organization_ids: string[];
  question_ids: string[];
  basis_record_ids: string[];
  activity_record_ids: string[];
  completed_at?: string;
  checklist?: string[];
}

export interface InvestigationQuestion {
  id: string;
  investigation_id: string;
  title: string;
  description: string;
  task_ids: string[];
  activity_record_ids: string[];
  evidence_record_ids: string[];
  finding_ids: string[];
}

export interface InvestigationFinding {
  id: string;
  investigation_id: string;
  /** False retains a superseded finding and its evidence links without listing it as current. Defaults to true. */
  current?: boolean;
  title: string;
  /** Preliminary: limited direct observations; developing: evidence synthesis still incomplete; exploratory: potential effect has not been tested. Existing statuses retain their meanings. */
  status: "established" | "developing" | "contradicted" | "insufficient_evidence" | "preliminary" | "exploratory";
  statement: string;
  article_id?: string;
  supporting_record_ids: string[];
  contradicting_record_ids: string[];
  related_question_ids: string[];
  related_task_ids: string[];
  related_project_ids: string[];
  location_ids: string[];
  limitations: string;
  last_reviewed_at: string;
}
