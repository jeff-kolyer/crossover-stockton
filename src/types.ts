export type RecordKind = "signal" | "service" | "gap" | "work" | "post";

export type ModeId = "signals" | "services" | "gaps" | "work" | "posts";

export type TagFamily =
  | "support"
  | "service_type"
  | "availability"
  | "access"
  | "gap_pattern"
  | "severity"
  | "urgency"
  | "time"
  | "trust"
  | "work_stage"
  | "post_type"
  | "area"
  | "population_fit"
  | "source_type"
  | "related";

export interface TagDefinition {
  id: string;
  label: string;
  family: TagFamily;
  description?: string;
  applies_to_record_kinds: RecordKind[];
  filterable: boolean;
  show_on_card?: boolean;
  show_in_detail?: boolean;
  display_priority: number;
  filter_priority?: number;
  show_in_filter_default?: boolean;
  parent_tag_ids?: string[];
  related_tag_ids?: string[];
}

export interface CivicSource {
  id: string;
  type?: string;
  type_tag_id?: string;
  title: string;
  publisher?: string;
  summary?: string;
  url?: string;
  retrieved_at?: string;
  published_at?: string;
  public?: boolean;
}

export interface CivicLocation {
  label?: string;
  address?: string;
  lat: number;
  lng: number;
}

export type RecordStatus = "active" | "needs_verification" | "in_progress" | "partially_resolved" | "resolved";

export type ActionKind = "verify" | "deliver" | "ride" | "call" | "clean" | "donate" | "join";

export interface ActionOption {
  id: string;
  label: string;
  kind: ActionKind;
  summary: string;
  related_record_ids?: string[];
  status?: "suggested" | "claimed" | "in_progress" | "completed";
}

export interface Observation {
  id: string;
  type: "human_report" | "field_check" | "partner_update" | "source_check" | "model_inference";
  note: string;
  observed_at: string;
  source_ids?: string[];
  confidence?: number;
}

export interface ResourceMatch {
  id: string;
  record_id?: string;
  label: string;
  summary: string;
  fit: "strong" | "partial" | "blocked" | "unknown";
}

export interface OutcomeEvent {
  id: string;
  label: string;
  note?: string;
  happened_at: string;
}

export interface FeedRecord {
  id: string;
  record_kind: RecordKind;
  title: string;
  summary: string;
  tag_ids: string[];
  time: Record<string, string | undefined>;
  trust: {
    confidence?: number;
    tag_ids?: string[];
  };
  sources: string[];
  current_relevance: {
    is_currently_relevant: boolean;
    reason?: string;
    last_evaluated_at?: string;
    expires_at?: string;
  };
  location?: CivicLocation;
  area_tag_ids?: string[];
  related_record_ids?: string[];
  support_instruction?: string;
  detail_sections?: Array<{ title: string; body: string }>;
  actions?: ActionOption[];
  observations?: Observation[];
  resource_matches?: ResourceMatch[];
  status?: RecordStatus;
  outcomes?: OutcomeEvent[];
}

export interface CrossoverFeed {
  schema_version: string;
  feed_id: string;
  demo_notice?: string;
  city: {
    city_id: string;
    city_name: string;
    state: string;
    country: string;
    timezone: string;
    map_center: { lat: number; lng: number };
    default_zoom: number;
  };
  feed_refreshed_at: string;
  view_id?: string;
  active_mode?: ModeId;
  selected_tag_ids: string[];
  selected_record_kinds?: RecordKind[];
  tag_registry: { tags: TagDefinition[] };
  records: FeedRecord[];
  sources: CivicSource[];
}

export type GapStatus = "critical" | "high_priority" | "monitored" | "improving";
export type GapInvestigationStatus = "investigating" | "identified";

export interface GapRecord {
  id: string;
  slug: string;
  title: string;
  status: GapStatus;
  investigation_status: GapInvestigationStatus;
  active: boolean;
  rank: number;
  summary: string;
  what_we_are_seeing: string[];
  why_icons?: Array<
    | "Dog"
    | "Stethoscope"
    | "HeartHandshake"
    | "PawPrint"
    | "House"
    | "DoorClosed"
    | "ClipboardList"
    | "PackageOpen"
    | "Refrigerator"
    | "Truck"
    | "DoorOpen"
    | "Users"
    | "BedSingle"
    | "Route"
    | "KeyRound"
  >;
  contributing_factors: string[];
  organization_ids: string[];
  action_ids: string[];
  story_ids: string[];
  updates?: Array<{ date: string; text: string }>;
  sources: Array<{ url?: string; label?: string }>;
  artwork?: string;
  thumbnail_image?: string;
  first_seen?: string;
  updated_at?: string;
  current_state?: string;
  current_state_items?: Array<{
    label: string;
    detail: string;
    value: string;
    record_ids?: string[];
  }>;
  record_ids?: string[];
  work_ids?: string[];
  most_useful_now?: {
    label: string;
    action_ids: string[];
    confidence?: string;
    basis_record_ids?: string[];
  };
  latest_change?: {
    record_id?: string;
    label: string;
  };
  responder_roles?: Array<{
    organization_id: string;
    label: string;
    current_role: string;
    basis_record_ids?: string[];
    updated_at?: string;
  }>;
}

export type WorkStatus = "completed" | "in_progress" | "next";
export type WorkType = "research" | "investigation" | "field_work";

export interface WorkRecord {
  id: string;
  gap_id: string;
  title: string;
  summary: string;
  gap_summary?: string;
  status: WorkStatus;
  type: WorkType;
  started_at?: string;
  completed_at?: string;
  updated_at?: string;
  last_reviewed_at?: string;
  research_data_id?: string;
  investigation_data_id?: string;
  page_kind?: "research" | "investigation" | "activity";
  next_step?: string | { title: string; summary: string; action_id?: string; status?: "planned" | "awaiting_response"; planned_for?: string };
  open_questions?: string[];
  threads?: WorkThread[];
  initial_map?: { status: "completed" | "in_progress"; summary: string };
  activity_record_ids?: string[];
  report_record_ids?: string[];
  learning_record_ids?: string[];
  organization_ids?: string[];
  project_ids?: string[];
  contact_questions?: Array<{ organization_id: string; status: "to_ask"; questions: string[] }>;
  record_ids: string[];
}

export interface WorkThread {
  id: string;
  title: string;
  summary: string;
  open_questions?: string[];
  project_ids?: string[];
  record_ids: string[];
}

export interface ActiveInvestigation {
  id: string;
  gap_id: string;
  title: string;
  status: "preparing_fieldwork" | "in_progress" | "completed";
  introduction: string;
  purpose: string;
  questions: Array<{ id: string; icon: "ClipboardList" | "HeartPulse" | "MapPin" | "Package" | "Users"; title: string; description: string }>;
  method_summary: string;
  methods: string[];
  fieldwork_plan?: { activity_record_id: string; observation_fields: string[]; result_options: string[]; report_outline: string };
  records_request?: { activity_record_id: string; submitted_at: string; status: string; summary: string; review_plan: string };
  care_coordination?: { title: string; central_question: string; participation_scope: string; public_source_review: { checked_at: string; summary: string; sources: Array<{ label: string; url: string }> }; questions: string[]; decentralized_protocol_concept: { status: "concept_only"; steps: string[]; note: string }; potential_capabilities?: string[]; capability_note?: string; potential_outcome: string };
  participation_roles?: Array<{ name: string; purpose: string; state: "available" | "investigating" | "proposed"; action_id?: string }>;
  safeguards: string[];
  public_approach: string;
  evidence_record_ids: string[];
  known_so_far: string;
  evidence_context: Array<{ label: string; summary: string; record_id: string | null }>;
  uncertainties: string[];
  possible_outcomes: string[];
  illustrative_outcome: { title: string; description: string; status: "illustrative_only" };
  opportunity_rule: string;
  related_barrier_thread_ids: string[];
  related_project_ids: string[];
  verified_finding_ids: string[];
  last_updated_at: string;
  short_focus?: string;
  next_verification_step: string;
}

export interface EstablishedInvestigationFinding {
  id: string;
  title: string;
  summary: string;
  evidence_kind: "crossover_firsthand" | "official_public_record" | "organization_report";
  evidence_record_ids: string[];
  observed_at: string;
  related_barrier_thread_ids: string[];
  related_project_ids: string[];
}

export interface DogsInvestigationData {
  id: string;
  work_id: string;
  gap_id: string;
  active_investigations: ActiveInvestigation[];
  established_findings: EstablishedInvestigationFinding[];
}

export type ProjectStage = "proposed" | "funded" | "under_development" | "operational" | "completed" | "unknown";
export type ProjectOperationalStatus = "operational" | "partially_operational" | "not_operational" | "unknown";

export interface CapacityProject {
  id: string;
  title: string;
  description: string;
  intended_outcome: string;
  gap_ids: string[];
  organization_ids: string[];
  location: { address: string; verified_by: string } | null;
  development_stage: ProjectStage;
  operational_status: ProjectOperationalStatus;
  funding_status?: "unknown" | "authorized" | "contract_awarded" | "operating_funds_allocated";
  funding_source_urls?: string[];
  expected_capacity_or_benefit: { description: string; status: "proposed" | "reported" | "verified"; evidence_record_ids: string[] } | null;
  actual_additional_capacity?: { description: string; status: "reported" | "verified"; evidence_record_ids: string[] } | null;
  capacity_summary: { headline: string; how_it_helps: string; not_yet_verified: string };
  demand_contribution?: string;
  milestones: Array<{ date: string | null; status: "planned" | "in_progress" | "reported_complete" | "verified_complete" | "unknown"; description: string; evidence_record_ids: string[] }>;
  procedure_tracking?: { planned: number | null; completed: number | null; capacity_change: string | null; period: string | null };
  barrier_thread_ids: string[];
  evidence_record_ids: string[];
  source_urls?: string[];
  last_verified_at: string | null;
  open_questions: string[];
  next_verification_step: string;
}

export interface ResearchMeasurement {
  id: string;
  domain: "demand" | "current_results";
  measure: string;
  value: number;
  unit: string;
  species: "dog" | "cat" | "all_animals";
  period_start: string;
  period_end: string;
  coverage_id: string;
  evidence_status: "official_reported_actual" | "calculated_from_official" | "self_reported" | "planned_authorized" | "estimate";
  source_record_id: string;
  verified_at: string;
  note?: string;
}

export interface DogsResearchBaseline {
  id: string;
  work_id: string;
  gap_id: string;
  last_reviewed_at: string;
  report_path: string;
  coverage: Record<string, string>;
  latest_findings: Array<{
    id: string;
    finding: string;
    short_update?: string;
    show_in_gap_updates?: boolean;
    discovered_at: string;
    what_changed: string;
    previous_state: string | null;
    current_verified_state: string;
    evidence_record_ids: string[];
    why_it_matters: string;
  }>;
  measurements: ResearchMeasurement[];
  planned_improvements: { project_ids: string[]; note: string };
}

export interface OrgRecord {
  id: string;
  slug: string;
  name: string;
  summary: string;
  website?: string;
  source_url?: string;
  active: boolean;
  tracked?: boolean;
  verification?: { checked_at: string; evidence_record_ids: string[]; direct_check: string; open_questions: string[] };
}

export interface PublicActionRecord {
  id: string;
  slug: string;
  title: string;
  summary: string;
  tags?: ActionTag[];
  at_a_glance?: {
    what?: string;
    time?: string;
    why?: string;
    availability?: string;
  };
  organization_id?: string;
  gap_ids: string[];
  source_url?: string;
  source_label?: string;
  featured: boolean;
  active: boolean;
  updated_at?: string;
  when_label?: string;
  location_label?: string;
  distance_label?: string;
  priority?: "high" | "medium" | "supporting" | "low";
  priority_basis?: string[];
  currentness?: "standing" | "recent" | "dated" | "unverified";
  last_supported_at?: string | null;
  modal_title?: string;
  why_it_helps?: string;
  what_to_expect?: string[];
  provider_label?: string;
  handoff_label?: string;
  action_type?: "investigation" | "direct action" | "direct care" | "organizational opportunity";
  estimated_time?: string;
  requirements?: string[];
  evidence_record_ids?: string[];
  evidence_url?: string;
  evidence_label?: string;
  last_verified_at?: string;
  availability_status?: string;
  related_work_id?: string;
  related_anchor?: string;
  next_url?: string;
  participation_roles?: Array<{ name: string; state: "available" | "investigating" | "proposed" }>;
}

export type ActionTag = "dogs" | "today" | "volunteer" | "donate" | "food" | "housing" | "reentry" | "foster-adopt";

export interface StoryRecord {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body?: string;
  image?: string;
  gap_ids: string[];
  organization_ids: string[];
  featured: boolean;
  active: boolean;
  published_at?: string;
  updated_at?: string;
  source_url?: string;
  source_label?: string;
  source_published_at?: string | null;
  sign_of_being?: string;
  connection?: string[];
  fruit?: string[];
  moments?: StoryMoment[];
  evidence?: StoryEvidence[];
}

export interface StoryMoment {
  title: string;
  text: string;
  source_label?: string;
  source_url?: string;
}

export interface StoryEvidence {
  label: string;
  url: string;
  published_at?: string | null;
}

export interface SourceRecord {
  publisher?: string;
  url?: string;
  type?: string;
}

export interface EvidenceRecord {
  id: string;
  gap_ids: string[];
  organization_ids: string[];
  published_at?: string | null;
  checked_at?: string;
  record_type:
    | "condition"
    | "capacity_constraint"
    | "capacity_intervention"
    | "operational_change"
    | "current_need"
    | "current_ask"
    | "current_service"
    | "field_investigation"
    | "update"
    | "measurement_change"
    | "response"
    | "outcome"
    | "planning_update"
    | "organization_update"
    | "finding"
    | "activity"
    | "field_report";
  trust: string;
  title: string;
  work_update_label?: string;
  summary: string;
  source: SourceRecord;
  context_sources?: SourceRecord[];
  image?: string;
  image_alt?: string;
  image_caption?: string;
  recorded_at?: string;
  occurred_at?: string;
  planned_for?: string;
  planned_sites?: Array<{ label: string; location_id?: string; reason: string; condition?: string }>;
  work_id?: string;
  thread_id?: string;
  evidence_status?: "initial_assessment" | "self_reported" | string;
  basis_record_ids?: string[];
  outcome?: { status: string; summary: string; as_of: string };
  report_record_ids?: string[];
  action_ids?: string[];
  location?: string;
  map_url?: string;
  visit_notes?: Array<{ title: string; body: string }>;
  sections?: Array<{ title: string; body: string }>;
  supports?: string[];
  action_signals?: string[];
  role_signals?: string[];
}
