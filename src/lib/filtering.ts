import { DEFAULT_FILTER_FAMILIES } from "../constants";
import type { FeedRecord, RecordKind, TagDefinition, TagFamily } from "../types";
import { textMatchesRecord } from "./utils";

export function filterRecords(
  records: FeedRecord[],
  tagsById: Map<string, TagDefinition>,
  options: {
    kinds?: RecordKind[];
    selectedTagIds: string[];
    contextualTagIds: string[];
    query: string;
    includeStale: boolean;
  },
) {
  const selected = [...options.selectedTagIds, ...options.contextualTagIds];
  const kinds = new Set(options.kinds ?? []);
  return records.filter((record) => {
    if (kinds.size && !kinds.has(record.record_kind)) return false;
    if (!options.includeStale && !record.current_relevance.is_currently_relevant) return false;
    if (selected.some((id) => !record.tag_ids.includes(id))) return false;
    return textMatchesRecord(record, options.query, tagsById);
  });
}

export function getModeCounts(
  records: FeedRecord[],
  tagsById: Map<string, TagDefinition>,
  selectedTagIds: string[],
  query: string,
  includeStale: boolean,
) {
  const base = filterRecords(records, tagsById, {
    selectedTagIds,
    contextualTagIds: [],
    query,
    includeStale,
  });
  return base.reduce<Record<string, number>>((counts, record) => {
    counts[record.record_kind] = (counts[record.record_kind] ?? 0) + 1;
    return counts;
  }, {});
}

export function getTagCounts(
  records: FeedRecord[],
  tagsById: Map<string, TagDefinition>,
  selectedRecordKinds: RecordKind[],
  selectedTagIds: string[],
  query: string,
  includeStale: boolean,
) {
  const base = filterRecords(records, tagsById, {
    kinds: selectedRecordKinds,
    selectedTagIds,
    contextualTagIds: [],
    query,
    includeStale,
  });
  return base.reduce<Record<string, number>>((counts, record) => {
    record.tag_ids.forEach((id) => {
      counts[id] = (counts[id] ?? 0) + 1;
    });
    return counts;
  }, {});
}

export function contextualFilters(
  records: FeedRecord[],
  tagsById: Map<string, TagDefinition>,
  kind: RecordKind,
) {
  const families = DEFAULT_FILTER_FAMILIES[kind];
  const presentTagIds = new Set(records.flatMap((record) => record.tag_ids));
  return families
    .map((family) => ({
      family,
      tags: [...presentTagIds]
        .map((id) => tagsById.get(id))
        .filter((tag): tag is TagDefinition => Boolean(tag))
        .filter((tag) => tag.family === family && tag.filterable && tag.applies_to_record_kinds.includes(kind))
        .sort((a, b) => a.display_priority - b.display_priority || a.label.localeCompare(b.label)),
    }))
    .filter((group): group is { family: TagFamily; tags: TagDefinition[] } => group.tags.length > 0);
}
