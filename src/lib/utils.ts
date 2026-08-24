import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MODES } from "../constants";
import type { FeedRecord, ModeId, RecordKind, TagDefinition } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function modeToKind(mode: ModeId): RecordKind {
  return MODES.find((item) => item.id === mode)!.kind;
}

export function tagMap(tags: TagDefinition[]) {
  return new Map(tags.map((tag) => [tag.id, tag]));
}

export function getRecordTags(record: FeedRecord, tagsById: Map<string, TagDefinition>) {
  return record.tag_ids.map((id) => tagsById.get(id)).filter((tag): tag is TagDefinition => Boolean(tag));
}

export function formatTimeLabel(record: FeedRecord) {
  const time = record.time;
  const pairs: Array<[string, string | undefined]> = [
    ["Reported", time.reported_at],
    ["Observed", time.observed_at ?? time.last_observed_at],
    ["Checked", time.source_checked_at],
    ["Changed", time.state_updated_at],
    ["Valid until", time.valid_until],
    ["Expires", time.expires_at],
  ];
  const found = pairs.find(([, value]) => value);
  if (!found) return "Time not specified";
  return `${found[0]} ${formatRelative(found[1]!)}`;
}

export function formatFeedFreshness(value: string) {
  return `Refreshed ${formatRelative(value)}`;
}

function formatRelative(value: string) {
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return value;
  const now = new Date("2026-05-04T13:00:00-07:00").getTime();
  const minutes = Math.round((now - then) / 60000);
  if (minutes < 0) return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value));
}

export function textMatchesRecord(record: FeedRecord, query: string, tagsById: Map<string, TagDefinition>) {
  if (!query.trim()) return true;
  const needle = query.trim().toLowerCase();
  const tagText = getRecordTags(record, tagsById)
    .map((tag) => `${tag.id} ${tag.label} ${tag.description ?? ""}`)
    .join(" ");
  return [record.title, record.summary, record.id, record.location?.label, record.location?.address, tagText, record.sources.join(" ")]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

export function sortRecords(records: FeedRecord[]) {
  const score = (record: FeedRecord) => {
    const tags = new Set(record.tag_ids);
    let value = record.current_relevance.is_currently_relevant ? 1000 : 0;
    if (tags.has("critical")) value += 90;
    if (tags.has("high")) value += 70;
    if (tags.has("open_now")) value += 55;
    if (tags.has("in_progress")) value += 45;
    if (tags.has("blocked")) value += 35;
    if (tags.has("tonight") || tags.has("today")) value += 30;
    value += Math.round((record.trust.confidence ?? 0) * 25);
    return value;
  };
  return [...records].sort((a, b) => score(b) - score(a));
}
