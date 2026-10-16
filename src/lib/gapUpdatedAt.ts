import dogsInvestigationData from "../data/dogs-investigations.json";
import workData from "../data/work.json";
import type { DogsInvestigationData, GapRecord, WorkRecord } from "../types";

const work = workData as WorkRecord[];
const dogsInvestigation = dogsInvestigationData as DogsInvestigationData;

/** Latest published content change for a gap or its linked work. */
export function gapUpdatedAt(gap: GapRecord): string | undefined {
  const linkedWorkIds = new Set(gap.work_ids ?? []);
  const dates = [
    gap.updated_at,
    ...work
      .filter((item) => item.gap_id === gap.id && linkedWorkIds.has(item.id))
      .map((item) => item.updated_at),
    ...(dogsInvestigation.gap_id === gap.id && linkedWorkIds.has(dogsInvestigation.work_id)
      ? dogsInvestigation.active_investigations.map((item) => item.last_updated_at)
      : []),
    ...(gap.responder_roles ?? []).map((role) => role.updated_at),
  ].filter((date): date is string => typeof date === "string" && !Number.isNaN(Date.parse(date)));

  // ISO dates and timestamps share a sortable calendar-date prefix.
  return dates.sort((a, b) => b.slice(0, 10).localeCompare(a.slice(0, 10)))[0];
}
