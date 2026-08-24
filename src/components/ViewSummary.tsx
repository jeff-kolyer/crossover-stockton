import { Activity, Clock3, MapPin, Sparkles, TrendingUp, Utensils, type LucideIcon } from "lucide-react";
import { MODES } from "../constants";
import { formatFeedFreshness } from "../lib/utils";
import type { FeedRecord, RecordKind, TagDefinition, TagFamily } from "../types";

interface ViewSummaryProps {
  records: FeedRecord[];
  selectedRecordKinds: RecordKind[];
  selectedTagIds: string[];
  tagsById: Map<string, TagDefinition>;
  cityName: string;
  refreshedAt: string;
}

interface SummaryChip {
  label: string;
  tone?: "red" | "blue" | "green" | "gold";
  icon?: "activity" | "clock" | "map" | "trend" | "utensils";
}

const KIND_LABELS: Record<RecordKind, string> = {
  signal: "updates",
  service: "services",
  gap: "gaps",
  work: "work",
  post: "posts",
};

const FAMILY_PRIORITY: TagFamily[] = ["support", "service_type", "gap_pattern", "availability", "access", "urgency", "time", "area"];

export function ViewSummary({ records, selectedRecordKinds, selectedTagIds, tagsById, cityName, refreshedAt }: ViewSummaryProps) {
  const summary = buildViewSummary(records, selectedRecordKinds, selectedTagIds, tagsById, cityName);
  const freshness = formatFeedFreshness(refreshedAt).replace("Refreshed", "Updated");

  return (
    <section className={`view-summary is-${summary.kind}`} aria-label="AI summary of this view">
      <div className="view-summary-content">
        <div className="view-summary-title-row">
          <h2>{summary.headline}</h2>
          <span className="summary-badge">
            AI summary
            <Sparkles size={15} />
          </span>
        </div>
        <p className="summary-meta">AI summary &middot; {freshness}</p>
        <p className="summary-text">{summary.text}</p>
        <div className="summary-chip-row" aria-label="Summary counts">
          {summary.chips.map((chip) => (
            <span className={`summary-chip ${chip.tone ? `is-${chip.tone}` : ""}`} key={chip.label}>
              <SummaryChipIcon icon={chip.icon} tone={chip.tone} />
              {chip.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function buildViewSummary(
  records: FeedRecord[],
  selectedRecordKinds: RecordKind[],
  selectedTagIds: string[],
  tagsById: Map<string, TagDefinition>,
  cityName: string,
) {
  const selectedTags = selectedTagIds.map((id) => tagsById.get(id)).filter((tag): tag is TagDefinition => Boolean(tag));
  const visibleKinds = unique(records.map((record) => record.record_kind));
  const activeKinds = selectedRecordKinds.length ? selectedRecordKinds : visibleKinds;
  const singleKind = activeKinds.length === 1 ? activeKinds[0] : undefined;
  const selectedSupport = selectedTags.find((tag) => tag.family === "support");
  const selectedServiceType = selectedTags.find((tag) => tag.family === "service_type");
  const support = firstSelectedOrTop(records, selectedTags, tagsById, "support");
  const serviceType = firstSelectedOrTop(records, selectedTags, tagsById, "service_type");
  const gapPattern = firstSelectedOrTop(records, selectedTags, tagsById, "gap_pattern");
  const time = firstSelectedOrTop(records, selectedTags, tagsById, "time") ?? firstSelectedOrTop(records, selectedTags, tagsById, "urgency");
  const area = firstSelectedOrTop(records, selectedTags, tagsById, "area");
  const timePhrase = time ? formatTimePhrase(time.label) : "";
  const theme = selectedSupport?.label ?? selectedServiceType?.label;

  const headline = buildHeadline(singleKind, activeKinds, theme, timePhrase, cityName, records.length);
  const text = buildText(singleKind, records, tagsById, {
    cityName,
    support: support?.label,
    serviceType: serviceType?.label,
    gapPattern: gapPattern?.label,
    area: area?.label,
    time: time?.label,
  });
  const chips = buildChips(records, tagsById, singleKind, activeKinds);

  return { headline, text, chips, kind: singleKind ?? "gap" };
}

function buildHeadline(singleKind: RecordKind | undefined, kinds: RecordKind[], theme: string | undefined, timePhrase: string, cityName: string, count: number) {
  if (count === 0) return "No matching records in this view";

  if (singleKind === "gap") {
    return theme ? `Top ${theme.toLowerCase()} gaps affecting ${cityName}${timePhrase}` : `Top gaps affecting ${cityName}${timePhrase || " now"}`;
  }

  if (singleKind === "service") {
    return theme ? `${theme} services currently available in ${cityName}` : `Services currently available in ${cityName}`;
  }

  if (singleKind === "post") return theme ? `Recent community posts about ${theme.toLowerCase()}` : "Recent community posts relevant right now";
  if (singleKind === "work") return theme ? `${theme} work underway across ${cityName}` : `Work underway across ${cityName}`;
  if (singleKind === "signal") return theme ? `${theme} updates changing conditions in ${cityName}` : `Updates changing conditions in ${cityName}`;

  const kindNames = kinds.length ? kinds.map((kind) => KIND_LABELS[kind]) : ["records"];
  return theme ? `${theme} records across ${cityName}` : `Current civic records across ${cityName}`;
}

function buildText(
  singleKind: RecordKind | undefined,
  records: FeedRecord[],
  tagsById: Map<string, TagDefinition>,
  context: { cityName: string; support?: string; serviceType?: string; gapPattern?: string; area?: string; time?: string },
) {
  if (records.length === 0) {
    return "This selection does not match the current demo feed. Try clearing a filter or widening the view to see nearby records.";
  }

  const supports = topLabels(records, tagsById, "support", 2);
  const serviceTypes = topLabels(records, tagsById, "service_type", 2);
  const areas = topLabels(records, tagsById, "area", 1);
  const highCount = countRecordsWithAny(records, ["critical", "high"]);
  const openCount = countRecordsWithAny(records, ["open_now"]);
  const tonightCount = countRecordsWithAny(records, ["tonight"]);

  if (singleKind === "gap") {
    const subject = supports.length ? formatList(supports).toLowerCase() : "civic support";
    const pressure = highCount ? `${highCount} high-priority ${plural("gap", highCount)}` : `${records.length} tracked ${plural("gap", records.length)}`;
    return `${capitalize(subject)} is under pressure in ${context.area ?? areas[0] ?? context.cityName}, with ${pressure}${tonightCount ? " active tonight" : " in the visible set"}.`;
  }

  if (singleKind === "service") {
    const subject = serviceTypes.length ? formatList(serviceTypes).toLowerCase() : "support services";
    return `${capitalize(subject)} are visible in the current feed${openCount ? `, including ${openCount} marked open now` : ""}. Check each record for access details before acting.`;
  }

  if (singleKind === "post") {
    const subject = supports.length ? formatList(supports).toLowerCase() : "community needs";
    return `Recent posts are clustering around ${subject}, giving a quick read on what people are reporting or requesting.`;
  }

  if (singleKind === "work") {
    const subject = serviceTypes.length ? formatList(serviceTypes).toLowerCase() : supports.length ? formatList(supports).toLowerCase() : "civic support";
    return `Active work is focused on ${subject}, including verification, coordination, and setup records in the visible feed.`;
  }

  if (singleKind === "signal") {
    const subject = supports.length ? formatList(supports).toLowerCase() : serviceTypes.length ? formatList(serviceTypes).toLowerCase() : "services and gaps";
    return `Current updates point to changes around ${subject}, with the most relevant records ranked first.`;
  }

  const mix = records.reduce<Record<string, number>>((counts, record) => {
    counts[KIND_LABELS[record.record_kind]] = (counts[KIND_LABELS[record.record_kind]] ?? 0) + 1;
    return counts;
  }, {});
  const mixText = Object.entries(mix)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([label, value]) => `${value} ${label}`);
  return `This view combines ${formatList(mixText)}, showing what is active, changing, or missing in the current civic feed.`;
}

function buildChips(records: FeedRecord[], tagsById: Map<string, TagDefinition>, singleKind: RecordKind | undefined, kinds: RecordKind[]) {
  const chips: SummaryChip[] = [];
  const kindCounts = records.reduce<Record<RecordKind, number>>(
    (counts, record) => ({ ...counts, [record.record_kind]: counts[record.record_kind] + 1 }),
    { signal: 0, service: 0, gap: 0, work: 0, post: 0 },
  );
  const highCount = countRecordsWithAny(records, ["critical", "high"]);
  const tonightCount = countRecordsWithAny(records, ["tonight"]);
  const openCount = countRecordsWithAny(records, ["open_now"]);

  if (singleKind && kindCounts[singleKind]) chips.push({ label: `${kindCounts[singleKind]} ${KIND_LABELS[singleKind]}`, tone: kindChipTone(singleKind), icon: singleKind === "gap" ? "trend" : "activity" });
  if (!singleKind && kinds.length) {
    kinds.slice(0, 2).forEach((kind) => {
      if (kindCounts[kind]) chips.push({ label: `${kindCounts[kind]} ${KIND_LABELS[kind]}` });
    });
  }
  if (highCount) chips.push({ label: `${highCount} high-priority`, tone: "red", icon: "trend" });
  if (openCount) chips.push({ label: `${openCount} open now`, tone: "green", icon: "clock" });
  if (tonightCount) chips.push({ label: `${tonightCount} tonight`, tone: "gold", icon: "clock" });

  for (const family of FAMILY_PRIORITY) {
    const top = topLabels(records, tagsById, family, 1)[0];
    if (!top) continue;
    const count = records.filter((record) => recordHasTagLabel(record, tagsById, top, family)).length;
    const label = `${count} ${top.toLowerCase()}`;
    if (!chips.some((chip) => chip.label.toLowerCase() === label.toLowerCase())) chips.push({ label, tone: family === "area" ? "blue" : undefined, icon: chipIconForTag(family, top) });
    if (chips.length >= 4) break;
  }

  if (!chips.length) chips.push({ label: "0 records" });
  return chips.slice(0, 4);
}

function SummaryChipIcon({ icon, tone }: { icon?: SummaryChip["icon"]; tone?: SummaryChip["tone"] }) {
  const Icon: LucideIcon =
    icon === "clock" ? Clock3 : icon === "map" ? MapPin : icon === "trend" ? TrendingUp : icon === "utensils" ? Utensils : tone === "red" ? TrendingUp : Activity;
  return <Icon size={16} />;
}

function kindChipTone(kind: RecordKind): SummaryChip["tone"] {
  if (kind === "gap") return "red";
  if (kind === "service" || kind === "signal") return "green";
  return "blue";
}

function chipIconForTag(family: TagFamily, label: string): SummaryChip["icon"] {
  const value = label.toLowerCase();
  if (family === "area") return "map";
  if (value.includes("food") || value.includes("meal") || value.includes("pantry")) return "utensils";
  if (value.includes("open") || value.includes("tonight") || value.includes("today")) return "clock";
  return "activity";
}

function firstSelectedOrTop(records: FeedRecord[], selectedTags: TagDefinition[], tagsById: Map<string, TagDefinition>, family: TagFamily) {
  return selectedTags.find((tag) => tag.family === family) ?? topTag(records, tagsById, family);
}

function topTag(records: FeedRecord[], tagsById: Map<string, TagDefinition>, family: TagFamily) {
  const counts = new Map<string, number>();
  records.forEach((record) => {
    record.tag_ids.forEach((id) => {
      const tag = tagsById.get(id);
      if (tag?.family === family) counts.set(id, (counts.get(id) ?? 0) + 1);
    });
  });
  const [id] = [...counts.entries()].sort((a, b) => b[1] - a[1] || (tagsById.get(a[0])?.display_priority ?? 0) - (tagsById.get(b[0])?.display_priority ?? 0))[0] ?? [];
  return id ? tagsById.get(id) : undefined;
}

function topLabels(records: FeedRecord[], tagsById: Map<string, TagDefinition>, family: TagFamily, limit: number) {
  const counts = new Map<string, number>();
  records.forEach((record) => {
    record.tag_ids.forEach((id) => {
      const tag = tagsById.get(id);
      if (tag?.family === family) counts.set(id, (counts.get(id) ?? 0) + 1);
    });
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || (tagsById.get(a[0])?.display_priority ?? 0) - (tagsById.get(b[0])?.display_priority ?? 0))
    .slice(0, limit)
    .map(([id]) => tagsById.get(id)?.label)
    .filter((label): label is string => Boolean(label));
}

function recordHasTagLabel(record: FeedRecord, tagsById: Map<string, TagDefinition>, label: string, family: TagFamily) {
  return record.tag_ids.some((id) => {
    const tag = tagsById.get(id);
    return tag?.family === family && tag.label === label;
  });
}

function countRecordsWithAny(records: FeedRecord[], tagIds: string[]) {
  return records.filter((record) => tagIds.some((id) => record.tag_ids.includes(id))).length;
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function formatList(items: string[]) {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function plural(word: string, count: number) {
  return count === 1 ? word : `${word}s`;
}

function capitalize(value: string) {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;
}

function formatTimePhrase(label: string) {
  const value = label.toLowerCase();
  if (value.includes("tonight") || value.includes("evening") || value.includes("after hours")) return " tonight";
  if (value.includes("today") || value.includes("now")) return " today";
  if (value.includes("weekend")) return " this weekend";
  if (value.includes("week")) return " this week";
  return ` ${value}`;
}
