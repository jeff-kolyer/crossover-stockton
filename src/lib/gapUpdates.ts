import { ClipboardList, FileText, Search, type LucideIcon } from "lucide-react";
import researchData from "../data/dogs-research.json";
import recordsData from "../data/records.json";
import workData from "../data/work.json";
import type { DogsResearchBaseline, EvidenceRecord, GapRecord, WorkRecord } from "../types";
import { sourceLinkLabel } from "./sourceLinks";
import { updateIcon, updateTypeLabel } from "./updatePresentation";
import { dogGapDestinationHref, legacyDogWorkDestination } from "./dogGapLegacy";

export type GapUpdateDestination =
  | { kind: "report"; id: string }
  | { kind: "work"; id: string; anchor: string }
  | { kind: "external"; url: string };

export interface GapUpdateEntry {
  id: string;
  date: string;
  dateContext?: string;
  title: string;
  summary: string;
  typeLabel: string;
  Icon: LucideIcon;
  crossover: boolean;
  destination?: GapUpdateDestination;
  linkLabel?: string;
}

const records = recordsData as EvidenceRecord[];
const work = workData as WorkRecord[];
const research = researchData as DogsResearchBaseline;

export function gapUpdates(gap: GapRecord): GapUpdateEntry[] {
  const relevantRecords = records.filter((record) => record.gap_ids.includes(gap.id));
  const reportIds = new Set(relevantRecords.filter((record) => record.record_type === "field_report").map((record) => record.id));
  const researchFindings = research.gap_id === gap.id
    ? research.latest_findings.filter((finding) => finding.show_in_gap_updates)
    : [];
  const researchSourceIds = new Set(researchFindings.flatMap((finding) => finding.evidence_record_ids));

  const sourceEntries = relevantRecords
    .filter((record) => record.record_type !== "finding")
    .filter((record) => record.record_type !== "activity" || !record.report_record_ids?.some((id) => reportIds.has(id)))
    .filter((record) => !(["current_ask", "current_service"].includes(record.record_type) && !record.published_at))
    .filter((record) => !(researchSourceIds.has(record.id) && !record.published_at))
    .map(recordEntry)
    .filter((entry): entry is GapUpdateEntry => Boolean(entry));

  const researchEntries: GapUpdateEntry[] = researchFindings.map((finding) => ({
    id: finding.id,
    date: finding.discovered_at,
    title: finding.short_update ?? finding.finding,
    summary: finding.what_changed,
    typeLabel: "Crossover · Research",
    Icon: FileText,
    crossover: true,
    destination: { kind: "work", id: research.work_id, anchor: finding.id },
    linkLabel: "Read research finding",
  }));

  return [...sourceEntries, ...researchEntries]
    .filter((entry, index, all) => all.findIndex((candidate) => candidate.id === entry.id) === index)
    .sort((a, b) => b.date.slice(0, 10).localeCompare(a.date.slice(0, 10)) || Number(b.crossover) - Number(a.crossover) || a.id.localeCompare(b.id));
}

function recordEntry(record: EvidenceRecord): GapUpdateEntry | null {
  const crossover = isCrossover(record);
  const planned = record.record_type === "activity" && record.outcome?.status === "planned";
  const date = record.record_type === "activity" || record.record_type === "field_report"
    ? (planned ? record.recorded_at : record.occurred_at || record.recorded_at || record.published_at)
    : record.published_at || record.checked_at;
  if (!date) return null;

  const matchingWork = work.find((item) => item.id === record.work_id && record.gap_ids.includes(item.gap_id));
  const destination: GapUpdateDestination | undefined = record.record_type === "field_report"
    ? { kind: "report", id: record.id }
    : record.record_type === "activity" && matchingWork
      ? { kind: "work", id: matchingWork.id, anchor: record.id }
      : record.source.url
        ? { kind: "external", url: record.source.url }
        : undefined;

  const typeLabel = crossover
    ? record.record_type === "field_report" ? "Crossover · Field report"
      : planned ? "Crossover · Investigation"
        : record.record_type === "activity" ? "Crossover · Activity"
          : `Crossover · ${updateTypeLabel(record)}`
    : externalTypeLabel(record);
  const status = record.record_type === "activity" && record.outcome?.summary ? ` ${record.outcome.summary}` : "";

  return {
    id: record.id,
    date,
    dateContext: planned ? "Plan recorded" : !record.published_at && !record.occurred_at && !crossover ? "Source checked" : undefined,
    title: planned ? "Field observation plan recorded" : record.work_update_label || record.title,
    summary: `${record.summary}${status}`,
    typeLabel,
    Icon: crossover ? planned ? Search : record.record_type === "field_report" ? ClipboardList : record.record_type === "activity" ? ClipboardList : updateIcon(record) : updateIcon(record),
    crossover,
    destination,
    linkLabel: destination?.kind === "report" ? "Read field report"
      : destination?.kind === "work" ? planned ? "View investigation plan" : "View activity record"
        : record.source.url ? sourceLinkLabel(record.source) : undefined,
  };
}

function isCrossover(record: EvidenceRecord) {
  return record.trust === "crossover_source" || record.id.startsWith("crossover-") || record.source.publisher?.startsWith("Crossover") === true;
}

function externalTypeLabel(record: EvidenceRecord) {
  const type = record.source.type?.toLowerCase() ?? "";
  if (type.includes("news") || type.includes("local_reporting")) return "News";
  if (type.includes("government") || type.includes("official") || record.trust === "government") return "Government";
  if (type.includes("organization") || type.includes("program") || type.includes("service")) return "Organization";
  return updateTypeLabel(record);
}

export function gapUpdateHref(destination?: GapUpdateDestination) {
  if (!destination) return undefined;
  if (destination.kind === "external") return destination.url;
  if (destination.kind === "report") return `/reports/${destination.id}/`;
  const dogDestination = legacyDogWorkDestination(destination.id, destination.anchor);
  if (dogDestination) return dogGapDestinationHref(dogDestination);
  return `/work/${destination.id}/#${destination.anchor}`;
}
