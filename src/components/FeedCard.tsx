import { motion } from "motion/react";
import { Bookmark, MoreHorizontal } from "lucide-react";
import type { FeedRecord, TagDefinition } from "../types";
import { cn, formatTimeLabel, getRecordTags } from "../lib/utils";

interface FeedCardProps {
  record: FeedRecord;
  rank?: number;
  tagsById: Map<string, TagDefinition>;
  selected: boolean;
  onSelect: (record: FeedRecord) => void;
}

export function FeedCard({ record, rank, tagsById, selected, onSelect }: FeedCardProps) {
  const tags = getRecordTags(record, tagsById);
  const primaryTags = tags
    .filter((tag) => tag.show_on_card !== false)
    .sort((a, b) => a.display_priority - b.display_priority)
    .slice(0, 4);
  const primaryMeta = primaryTags.map((tag) => tag.label);
  const place = record.location?.label ?? record.location?.address;
  const trust = `${Math.round((record.trust.confidence ?? 0) * 100)}% trust`;
  const rankTone = getRankTone(record);

  return (
    <motion.button
      className={`feed-card ${selected ? "is-selected" : ""}`}
      type="button"
      onClick={() => onSelect(record)}
      initial={{ opacity: 0.96 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
    >
      {rank && <span className={cn("feed-rank-badge", `is-${rankTone}`)}>{rank}</span>}
      <div className="card-topline">
        <span>{formatTimeLabel(record)}</span>
        <span>{trust}</span>
      </div>
      <h3>{record.title}</h3>
      <p>{record.summary}</p>
      <div className="card-meta-line">
        {primaryMeta.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <div className="feed-item-footer">
        {place && <div className="location-line">{place}</div>}
        <span className="feed-item-actions" aria-hidden="true">
          <Bookmark size={18} />
          <MoreHorizontal size={20} />
        </span>
      </div>
    </motion.button>
  );
}

function getRankTone(record: FeedRecord) {
  const tags = new Set(record.tag_ids);
  if (record.record_kind === "gap") {
    if (tags.has("critical") || tags.has("high")) return "red";
    if (tags.has("moderate")) return "gold";
    return "blue";
  }
  if (record.record_kind === "service" || record.record_kind === "signal") {
    return tags.has("open_now") ? "green" : "blue";
  }
  if (record.record_kind === "work") {
    if (tags.has("in_progress")) return "green";
    if (tags.has("blocked")) return "gold";
    return "blue";
  }
  return "navy";
}
