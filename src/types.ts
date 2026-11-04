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

export type GapInvestigationStatus = "investigating" | "identified";

/** Optional presentation preferences; descriptions are not image alt text or evidence. */
export interface VisualPreferences {
  visual_description?: string;
  preferred_image?: string;
  logo_description?: string;
  preferred_logo?: string;
}

export interface GapRecord extends VisualPreferences {
  id: string;
  slug: string;
  title: string;
  investigation_status: GapInvestigationStatus;
  active: boolean;
  rank: number;
  summary: string;
  what_we_are_seeing: string[];
  unknown_questions?: string[];
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
  story_ids: string[];
  updates?: Array<{ date: string; text: string }>;
  sources: Array<{ url?: string; label?: string }>;
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

export interface ActiveInvestigation extends VisualPreferences {
  id: string;
  gap_id: string;
  title: string;
  primary_goal: string;
  status: "preparing_fieldwork" | "in_progress" | "completed";
  introduction: string;
  findings_summary?: string;
  findings_introduction?: { heading: string; paragraphs: string[] };
  purpose: string;
  evidence_record_ids: string[];
  known_so_far: string;
  evidence_context: Array<{ label: string; summary: string; record_id: string | null }>;
  verified_finding_ids: string[];
  last_updated_at: string;
}

export interface EstablishedInvestigationFinding {
  id: string;
  title: string;
  summary: string;
  evidence_kind: "crossover_firsthand" | "official_public_record" | "organization_report";
  evidence_record_ids: string[];
  observed_at: string;
  related_project_ids: string[];
}

export type ProjectStage = "proposed" | "funded" | "under_development" | "operational" | "completed" | "unknown";
export type ProjectOperationalStatus = "operational" | "partially_operational" | "not_operational" | "unknown";

export interface CapacityProject extends VisualPreferences {
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
  evidence_record_ids: string[];
  source_urls?: string[];
  last_verified_at: string | null;
  open_questions: string[];
  next_verification_step: string;
}

export interface OrgRecord extends VisualPreferences {
  id: string;
  slug: string;
  name: string;
  summary: string;
  map_location_id?: string;
  website?: string;
  source_url?: string;
  active: boolean;
  tracked?: boolean;
  verification?: { checked_at: string; evidence_record_ids: string[]; direct_check: string; open_questions: string[] };
}

export interface StoryRecord extends VisualPreferences {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body?: string;
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
  title?: string;
  publisher?: string;
  url?: string;
  type?: string;
}

export interface EvidenceRecord extends VisualPreferences {
  id: string;
  investigation_id?: string;
  objective_ids?: string[];
  primary_objective_id?: string;
  observed_dog_count?: number;
  coverage_id?: string;
  coverage_note?: string;
  gap_ids: string[];
  organization_ids: string[];
  location_ids?: string[];
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
  public_update?: boolean;
  organization_interaction?: "outreach_attempt" | "response_received" | "in_person_visit_and_application" | "collaboration";
  visibility?: "public" | "internal";
  trust: string;
  title: string;
  work_update_label?: string;
  summary: string;
  source: SourceRecord;
  context_sources?: SourceRecord[];
  source_notes?: string[];
  image?: string;
  image_alt?: string;
  image_caption?: string;
  recorded_at?: string;
  occurred_at?: string;
  planned_for?: string;
  planned_sites?: Array<{ label: string; location_id?: string; reason: string; condition?: string }>;
  thread_id?: string;
  evidence_status?: "initial_assessment" | "self_reported" | string;
  basis_record_ids?: string[];
  outcome?: { status: string; summary: string; as_of: string };
  report_record_ids?: string[];
  location?: string;
  map_url?: string;
  visit_notes?: Array<{ title: string; body: string }>;
  visit_notes_attribution?: string;
  sections?: Array<{ title: string; body: string }>;
  supports?: string[];
  role_signals?: string[];
}
