import dogsInvestigationData from "../data/dogs-investigations.json";
import dogsResearchData from "../data/dogs-research.json";
import recordsData from "../data/records.json";
import type { DogsInvestigationData, DogsResearchBaseline, EvidenceRecord, WorkRecord } from "../types";

const investigationData = dogsInvestigationData as DogsInvestigationData;
const researchData = dogsResearchData as DogsResearchBaseline;
const records = recordsData as EvidenceRecord[];

interface WorkProgress {
  label: string;
  text: string;
  date?: string;
}

export function gapWorkSummary(item: WorkRecord): { description: string; progress?: WorkProgress } {
  const description = item.gap_summary ?? item.summary;

  if (item.research_data_id === researchData.id && item.gap_id === researchData.gap_id) {
    const finding = [...researchData.latest_findings]
      .sort((a, b) => b.discovered_at.localeCompare(a.discovered_at))[0];
    if (finding) return {
      description,
      progress: { label: "Latest", text: finding.short_update ?? finding.finding, date: finding.discovered_at },
    };
  }

  if (item.investigation_data_id === investigationData.id && item.gap_id === investigationData.gap_id) {
    const active = [...investigationData.active_investigations]
      .filter((entry) => entry.status !== "completed")
      .sort((a, b) => b.last_updated_at.localeCompare(a.last_updated_at))[0];
    if (active) return {
      description,
      progress: { label: "Current focus", text: active.short_focus ?? active.next_verification_step },
    };
  }

  if (item.page_kind === "activity") {
    const activity = records
      .filter((record) => record.work_id === item.id && (record.record_type === "field_report" || record.record_type === "activity"))
      .sort((a, b) => {
        const dateOrder = (b.occurred_at ?? b.recorded_at ?? "").localeCompare(a.occurred_at ?? a.recorded_at ?? "");
        return dateOrder || Number(b.record_type === "field_report") - Number(a.record_type === "field_report");
      })[0];
    if (activity) return {
      description,
      progress: {
        label: "Latest activity",
        text: activity.work_update_label ?? activity.title,
        date: activity.occurred_at ?? activity.recorded_at,
      },
    };
  }

  return { description };
}
