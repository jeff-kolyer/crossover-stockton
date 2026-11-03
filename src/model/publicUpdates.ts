import type { EvidenceRecord, GapRecord } from "../types";

export type PublicUpdateDate = {
  value: string | null;
  meaning: "occurred" | "published" | "reviewed" | "undated" | "invalid";
};

export type PublicUpdate = {
  record: EvidenceRecord;
  date: PublicUpdateDate;
  relatedNeeds: GapRecord[];
};

function validDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2}))?$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const calendar = new Date(Date.UTC(year, month - 1, day));
  return calendar.getUTCFullYear() === year && calendar.getUTCMonth() + 1 === month
    && calendar.getUTCDate() === day && Number.isFinite(Date.parse(value));
}

/** Each date retains its recorded meaning. Review dates are identified as such. */
export function publicUpdateDate(record: EvidenceRecord): PublicUpdateDate {
  if (record.record_type === "activity") {
    if (!record.occurred_at) return { value: null, meaning: "undated" };
    return validDate(record.occurred_at)
      ? { value: record.occurred_at, meaning: "occurred" }
      : { value: null, meaning: "invalid" };
  }
  if (record.published_at) return validDate(record.published_at)
    ? { value: record.published_at, meaning: "published" }
    : { value: null, meaning: "invalid" };
  // A check is not an event or publication. The View labels this fallback “Reviewed.”
  if (record.checked_at) return validDate(record.checked_at)
    ? { value: record.checked_at, meaning: "reviewed" }
    : { value: null, meaning: "invalid" };
  return { value: null, meaning: "undated" };
}

function dateTime(update: PublicUpdate) {
  const value = update.date.value;
  return value ? Date.parse(value.length === 10 ? `${value}T00:00:00Z` : value) : 0;
}

/** The curated need list authorizes existing developments. Activities need both public
 * visibility and a public-update classification, and must relate to an active need. */
export function selectPublicUpdates(needs: GapRecord[], evidence: EvidenceRecord[]): PublicUpdate[] {
  const activeNeeds = needs.filter((need) => need.active);
  const evidenceById = new Map(evidence.map((record) => [record.id, record]));
  const selected = new Map<string, EvidenceRecord>();

  for (const need of activeNeeds) {
    const candidates = need.record_ids?.length
      ? need.record_ids.map((id) => evidenceById.get(id)).filter((record): record is EvidenceRecord => Boolean(record))
      : evidence.filter((record) => record.gap_ids.includes(need.id));
    for (const record of candidates) {
      if (record.record_type !== "activity" && record.record_type !== "finding"
        && record.visibility !== "internal") selected.set(record.id, record);
    }
  }

  const activeNeedIds = new Set(activeNeeds.map((need) => need.id));
  for (const record of evidence) {
    if (record.record_type === "activity" && record.public_update === true
      && record.visibility === "public" && publicUpdateDate(record).meaning === "occurred"
      && record.gap_ids.some((id) => activeNeedIds.has(id))) selected.set(record.id, record);
  }

  return [...selected.values()].map((record) => ({
    record,
    date: publicUpdateDate(record),
    relatedNeeds: activeNeeds.filter((need) => record.gap_ids.includes(need.id)),
  })).sort((a, b) => dateTime(b) - dateTime(a));
}
