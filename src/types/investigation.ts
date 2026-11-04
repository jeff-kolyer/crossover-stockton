export type ActionStatus = "open" | "waiting" | "done" | "cancelled";

export interface InvestigationAction {
  id: string;
  order_by_id: number;
  investigation_id: string;
  title: string;
  status: ActionStatus;
  type: "application" | "inquiry" | "field_observation" | "records_request" | "follow_up" | "source_review" | "organization_contact" | "policy_monitoring";
  instructions: string;
  list_context?: string;
  list_date_label?: string;
  location_ids: string[];
  map_reference_location_ids?: string[];
  organization_ids: string[];
  objective_ids: string[];
  basis_record_ids: string[];
  activity_record_ids: string[];
  completed_at?: string;
  checklist?: string[];
}

export interface InvestigationObjective {
  id: string;
  investigation_id: string;
  title: string;
  description: string;
  action_ids: string[];
  activity_record_ids: string[];
  evidence_record_ids: string[];
  finding_ids: string[];
}

export interface InvestigationFinding {
  id: string;
  investigation_id: string;
  /** One of the shared Overview, Activity, and Findings objective IDs. */
  primary_objective_id?: string;
  /** False retains a superseded finding and its evidence links without listing it as current. Defaults to true. */
  current?: boolean;
  title: string;
  /** Preliminary: limited direct observations; developing: evidence synthesis still incomplete; exploratory: potential effect has not been tested. Existing statuses retain their meanings. */
  status: "established" | "developing" | "contradicted" | "insufficient_evidence" | "preliminary" | "exploratory";
  statement: string;
  article_id?: string;
  supporting_record_ids: string[];
  contradicting_record_ids: string[];
  related_objective_ids: string[];
  related_action_ids: string[];
  related_project_ids: string[];
  location_ids: string[];
  limitations: string;
  last_reviewed_at: string;
}
