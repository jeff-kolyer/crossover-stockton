import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  FileText,
  Gauge,
  Landmark,
  Linkedin,
  LinkIcon,
  Newspaper,
  Youtube,
} from "lucide-react";
import type { EvidenceRecord } from "../types";

export function updateTypeLabel(record: EvidenceRecord) {
  const publisher = record.source.publisher?.toLowerCase() ?? "";
  const type = record.source.type?.toLowerCase() ?? "";
  const hostname = sourceHostname(record.source.url);
  const roleSignals = record.role_signals ?? [];

  if (roleSignals.some((signal) => ["direct_conversations", "field_work", "field_report", "field_investigation"].includes(signal))) {
    return "Project update";
  }
  if (type.includes("video") || publisher.includes("youtube") || hostname.includes("youtube.com") || hostname.includes("youtu.be")) return "Video";
  if (publisher.includes("linkedin") || hostname.includes("linkedin.com") || type.includes("article") || type.includes("local_reporting")) return "Article";
  if (type.includes("organization") || type.includes("service") || type.includes("program") || record.record_type === "current_service") return "Organization";
  if (type.includes("pdf") || type.includes("report")) return "Report";
  if (record.trust === "government" || type.includes("government")) return "Government";
  if (record.record_type === "current_ask" || record.record_type === "current_need") return "Current ask";
  if (record.record_type === "outcome") return "Outcome";

  return "Source";
}

export function updateIcon(record: EvidenceRecord) {
  const publisher = record.source.publisher?.toLowerCase() ?? "";
  const type = record.source.type?.toLowerCase() ?? "";
  const hostname = sourceHostname(record.source.url);
  const roleSignals = record.role_signals ?? [];

  if (roleSignals.some((signal) => ["direct_conversations", "field_work", "field_report", "field_investigation"].includes(signal))) {
    return ClipboardList;
  }
  if (type.includes("video") || publisher.includes("youtube") || hostname.includes("youtube.com") || hostname.includes("youtu.be")) return Youtube;
  if (publisher.includes("linkedin") || hostname.includes("linkedin.com")) return Linkedin;
  if (type.includes("article") || type.includes("local_reporting") || publisher.includes("stocktonia") || publisher.includes("cbs")) return Newspaper;
  if (type.includes("organization") || type.includes("service") || type.includes("program") || record.record_type === "current_service") return LinkIcon;
  if (type.includes("pdf") || type.includes("report")) return FileText;
  if (record.trust === "government" || type.includes("government")) return Landmark;
  if (record.record_type === "capacity_intervention" || record.record_type === "measurement_change") return Gauge;
  if (record.record_type === "outcome") return CheckCircle2;
  if (record.record_type === "current_ask" || record.record_type === "current_need") return AlertCircle;

  return FileText;
}

function sourceHostname(url?: string) {
  if (!url || url.startsWith("/")) return "";

  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}
