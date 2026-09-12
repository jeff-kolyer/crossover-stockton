import type { SourceRecord } from "../types";

export function sourceLinkLabel(source: SourceRecord) {
  const publisher = source.publisher?.toLowerCase() ?? "";
  const type = source.type?.toLowerCase() ?? "";
  const hostname = source.url ? sourceHostname(source.url) : "";

  if (publisher.includes("linkedin") || hostname.includes("linkedin.com")) return "Read on LinkedIn";
  if (publisher.includes("youtube") || hostname.includes("youtube.com") || hostname.includes("youtu.be")) return "Watch on YouTube";
  if (type.includes("pdf") || type.includes("report") || hostname.endsWith(".pdf")) return "View report";
  if (type.includes("organization") || type.includes("service") || type.includes("program")) return "Visit organization";
  if (publisher.includes("stocktonia")) return "Read at Stocktonia";
  if (publisher.includes("cbs")) return "Read at CBS";

  return "View source";
}

function sourceHostname(url: string) {
  if (url.startsWith("/")) return "";

  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}
