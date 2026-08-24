import {
  BadgeCheck,
  BriefcaseBusiness,
  CircleAlert,
  HandHeart,
  MapPin,
  Megaphone,
  MessageSquareText,
  Soup,
} from "lucide-react";
import type { ModeId, RecordKind, TagFamily } from "./types";

export const MODES: Array<{
  id: ModeId;
  kind: RecordKind;
  label: string;
  question: string;
  empty: string;
  icon: typeof Megaphone;
}> = [
  { id: "signals", kind: "signal", label: "Signals", question: "What changed?", empty: "No current signals match these filters.", icon: Megaphone },
  { id: "services", kind: "service", label: "Services", question: "What exists?", empty: "No services match these tags.", icon: HandHeart },
  { id: "gaps", kind: "gap", label: "Gaps", question: "What is needed?", empty: "No tracked gaps match these tags.", icon: CircleAlert },
  { id: "work", kind: "work", label: "Work", question: "What is being done?", empty: "No work records match these tags.", icon: BriefcaseBusiness },
  { id: "posts", kind: "post", label: "Posts", question: "What are people saying?", empty: "No posts match these tags.", icon: MessageSquareText },
];

export const DEFAULT_FILTER_FAMILIES: Record<RecordKind, TagFamily[]> = {
  signal: ["time", "trust", "urgency", "area", "support", "service_type", "related"],
  service: ["availability", "access", "service_type", "time", "trust", "area", "population_fit"],
  gap: ["support", "service_type", "gap_pattern", "severity", "urgency", "time", "trust", "area"],
  work: ["work_stage", "support", "service_type", "urgency", "time", "trust", "area"],
  post: ["post_type", "support", "service_type", "time", "area", "related"],
};

export const FAMILY_LABELS: Record<TagFamily, string> = {
  support: "Support",
  service_type: "Service Type",
  availability: "Availability",
  access: "Access",
  gap_pattern: "Gap Pattern",
  severity: "Severity",
  urgency: "Urgency",
  time: "Time",
  trust: "Trust",
  work_stage: "Work Stage",
  post_type: "Post Type",
  area: "Area",
  population_fit: "Population Fit",
  source_type: "Source",
  related: "Related",
};

export const SUPPORT_ICONS: Record<string, typeof Soup> = {
  food: Soup,
  shelter: HandHeart,
  cooling: BadgeCheck,
  water: BadgeCheck,
  restrooms: MapPin,
  safe_parking: MapPin,
  id_service: BadgeCheck,
  transportation: MapPin,
};
