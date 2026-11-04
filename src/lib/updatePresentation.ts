
import uiCopy from "../ui/updates.json";
import type { EvidenceRecord } from "../types";

export function updateTypeLabel(record: EvidenceRecord) {
  if (record.record_type === "activity") return uiCopy.updatePresentation.crossoverActivity;
  const publisher = record.source.publisher?.toLowerCase() ?? "";
  const type = record.source.type?.toLowerCase() ?? "";
  const hostname = sourceHostname(record.source.url);
  const roleSignals = record.role_signals ?? [];

  if (type.includes("news")) return uiCopy.updatePresentation.news;
  if (roleSignals.some((signal) => ["direct_conversations", "field_work", "field_report", "field_investigation"].includes(signal))) {
    return uiCopy.updatePresentation.projectUpdate;
  }
  if (type.includes("video") || publisher.includes("youtube") || hostname.includes("youtube.com") || hostname.includes("youtu.be")) return uiCopy.updatePresentation.video;
  if (publisher.includes("linkedin") || hostname.includes("linkedin.com") || type.includes("article") || type.includes("local_reporting")) return uiCopy.updatePresentation.article;
  if (type.includes("organization") || type.includes("service") || type.includes("program") || record.record_type === "current_service") return uiCopy.updatePresentation.organization;
  if (type.includes("pdf") || type.includes("report")) return uiCopy.updatePresentation.report;
  if (record.trust === "government" || type.includes("government")) return uiCopy.updatePresentation.government;
  if (record.record_type === "current_ask" || record.record_type === "current_need") return uiCopy.updatePresentation.currentAsk;
  if (record.record_type === "outcome") return uiCopy.updatePresentation.outcome;

  return uiCopy.updatePresentation.source;
}

function sourceHostname(url?: string) {
  if (!url || url.startsWith("/")) return "";

  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}
