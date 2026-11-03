import uiCopy from "../data/pages/updates.json";
import type { SourceRecord } from "../types";

export function sourceLinkLabel(source: SourceRecord) {
  const publisher = source.publisher?.toLowerCase() ?? "";
  const type = source.type?.toLowerCase() ?? "";
  const hostname = source.url ? sourceHostname(source.url) : "";

  if (publisher.includes("linkedin") || hostname.includes("linkedin.com")) return uiCopy.sourceLinks.linkedIn;
  if (publisher.includes("youtube") || hostname.includes("youtube.com") || hostname.includes("youtu.be")) return uiCopy.sourceLinks.youTube;
  if (type.includes("pdf") || type.includes("report") || hostname.endsWith(".pdf")) return uiCopy.sourceLinks.report;
  if (type.includes("organization") || type.includes("service") || type.includes("program")) return uiCopy.sourceLinks.organization;
  if (publisher.includes("stocktonia")) return uiCopy.sourceLinks.stocktonia;
  if (publisher.includes("cbs")) return uiCopy.sourceLinks.cbs;

  return uiCopy.sourceLinks.default;
}

function sourceHostname(url: string) {
  if (url.startsWith("/")) return "";

  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}
