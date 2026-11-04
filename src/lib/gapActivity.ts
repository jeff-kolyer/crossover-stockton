import { siteModel } from "../model";
import type { GapRecord } from "../types";

const investigations = siteModel.getInvestigations();

/** Keep changes to the gap assessment distinct from changes to linked work. */
export function latestGapActivity(gap: GapRecord): { date: string; kind: "assessment" | "work" } | undefined {
  const workDates = investigations
    .filter((item) => item.gap_id === gap.id)
    .map((item) => item.last_updated_at)
    .filter((date): date is string => typeof date === "string" && !Number.isNaN(Date.parse(date)));

  const latestWorkDate = workDates.sort((a, b) => b.slice(0, 10).localeCompare(a.slice(0, 10)))[0];
  if (latestWorkDate && (!gap.updated_at || latestWorkDate.slice(0, 10) > gap.updated_at.slice(0, 10))) {
    return { date: latestWorkDate, kind: "work" };
  }
  return gap.updated_at ? { date: gap.updated_at, kind: "assessment" } : undefined;
}
