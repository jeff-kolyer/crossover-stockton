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

export type GapStatus = "critical" | "high" | "watch" | "improving";

export interface GapRecord {
  id: string;
  slug: string;
  title: string;
  status: GapStatus;
  active: boolean;
  rank: number;
  summary: string;
  what_we_are_seeing: string[];
  contributing_factors: string[];
  organization_ids: string[];
  action_ids: string[];
  story_ids: string[];
  updates?: Array<{ date: string; text: string }>;
  sources: Array<{ url?: string; label?: string }>;
  artwork?: string;
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

export interface OrgRecord {
  id: string;
  slug: string;
  name: string;
  summary: string;
  website?: string;
  source_url?: string;
  active: boolean;
  tracked?: boolean;
}

export interface PublicActionRecord {
  id: string;
  slug: string;
  title: string;
  summary: string;
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
  provider_label?: string;
  handoff_label?: string;
}

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
    | "capacity_intervention"
    | "operational_change"
    | "current_ask"
    | "current_service"
    | "measurement_change"
    | "response"
    | "outcome";
  trust: string;
  title: string;
  summary: string;
  source: SourceRecord;
  supports?: string[];
  action_signals?: string[];
  role_signals?: string[];
}
