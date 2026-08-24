import { useState, type Dispatch, type SetStateAction } from "react";
import { ChevronDown, Search, Sparkles, X } from "lucide-react";
import { FAMILY_LABELS, MODES } from "../constants";
import type { RecordKind, TagDefinition } from "../types";
import { cn } from "../lib/utils";
import { useScrollReveal } from "../lib/useScrollReveal";

interface TagRailProps {
  tags: TagDefinition[];
  selectedTagIds: string[];
  query: string;
  selectedRecordKinds: RecordKind[];
  modeCounts: Record<string, number>;
  tagCounts: Record<string, number>;
  onQueryChange: (query: string) => void;
  onToggleTag: (tagId: string) => void;
  onToggleRecordKind: (kind: RecordKind) => void;
  onClearFilters: () => void;
}

const FAMILY_ORDER: Record<RecordKind, string[]> = {
  gap: ["support", "service_type", "gap_pattern", "severity", "urgency", "time", "trust", "area", "access", "availability", "population_fit", "related", "source_type", "work_stage", "post_type"],
  service: ["support", "service_type", "availability", "access", "population_fit", "time", "trust", "area", "related", "source_type", "gap_pattern", "severity", "urgency", "work_stage", "post_type"],
  post: ["post_type", "support", "service_type", "area", "related", "time", "trust", "source_type", "availability", "access", "population_fit", "gap_pattern", "severity", "urgency", "work_stage"],
  work: ["work_stage", "support", "service_type", "urgency", "time", "trust", "area", "source_type", "availability", "access", "population_fit", "gap_pattern", "severity", "post_type", "related"],
  signal: ["support", "service_type", "availability", "urgency", "time", "trust", "area", "related", "source_type", "access", "gap_pattern", "severity", "population_fit", "work_stage", "post_type"],
};
const DEFAULT_VISIBLE_TAGS = 6;

export function TagRail({ tags, selectedTagIds, query, selectedRecordKinds, modeCounts, tagCounts, onQueryChange, onToggleTag, onToggleRecordKind, onClearFilters }: TagRailProps) {
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(() => new Set());
  const [collapsedFamilies, setCollapsedFamilies] = useState<Set<string>>(() => new Set());
  const scrollReveal = useScrollReveal();
  const selected = new Set(selectedTagIds);
  const selectedKinds = new Set(selectedRecordKinds);
  const activeKind = selectedRecordKinds[0] ?? "gap";
  const activeTags = selectedTagIds.map((id) => tags.find((tag) => tag.id === id)).filter((tag): tag is TagDefinition => Boolean(tag));
  const activeFilterCount = activeTags.length;
  const filtered = tags
    .filter((tag) => tag.filterable)
    .filter((tag) => tag.applies_to_record_kinds.includes(activeKind))
    .filter((tag) => {
      if (!query.trim()) return true;
      const needle = query.toLowerCase();
      return [tag.label, tag.id, tag.description, tag.family].filter(Boolean).join(" ").toLowerCase().includes(needle);
    })
    .sort((a, b) => tagSortScore(a) - tagSortScore(b) || a.label.localeCompare(b.label));

  const grouped = filtered.reduce<Record<string, TagDefinition[]>>((groups, tag) => {
    groups[tag.family] = [...(groups[tag.family] ?? []), tag];
    return groups;
  }, {});
  const familyOrder = FAMILY_ORDER[activeKind];
  const entries = Object.entries(grouped).sort(([familyA], [familyB]) => orderIndex(familyOrder, familyA) - orderIndex(familyOrder, familyB));

  return (
    <aside className="tag-rail">
      <section className="rail-callout" hidden>
        <div>
          <Sparkles size={18} />
        </div>
        <h2>See what matters now.</h2>
        <p>Use search and tags to filter this AI feed for real-time services, gaps, and active work.</p>
        <button type="button">How AI helps -&gt;</button>
      </section>

      <div className="rail-static">
        <div className="rail-title-row">
          <h2>Explorer</h2>
        </div>

        <section className="tag-family is-view is-static-view" key="view">
          <button className="tag-family-header" type="button" onClick={() => toggleCollapsedFamily("view", setCollapsedFamilies)}>
            <span>View</span>
            <ChevronDown size={16} className={collapsedFamilies.has("view") ? "is-collapsed" : ""} />
          </button>
          {!collapsedFamilies.has("view") && MODES.map((mode) => (
            <button
              className={cn("tag-button is-radio", selectedKinds.has(mode.kind) && "is-selected")}
              key={mode.kind}
              type="button"
              onClick={() => onToggleRecordKind(mode.kind)}
            >
              <span className="filter-check" aria-hidden="true" />
              <span>{mode.label}</span>
              <strong>{modeCounts[mode.kind] ?? 0}</strong>
            </button>
          ))}
        </section>

        <label className="search-box">
          <Search size={16} />
          <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search filters" />
        </label>

        {activeFilterCount > 0 && (
          <section className="active-filters">
            <div className="active-filters-header">
              <h3>Active filters</h3>
              <button type="button" onClick={onClearFilters}>Clear all</button>
            </div>
            <div className="active-filter-list">
              {activeTags.map((tag) => (
                <button type="button" key={tag.id} onClick={() => onToggleTag(tag.id)}>
                  {tag.label}
                  <X size={13} />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className={cn("tag-groups", scrollReveal.isScrolling && "is-scrolling")} onScroll={scrollReveal.onScroll}>
        {entries.map(([family, familyTags]) => {
          const isExpanded = expandedFamilies.has(family);
          const isCollapsed = collapsedFamilies.has(family);
          const visibleTags = isExpanded
            ? familyTags
            : familyTags.filter((tag, index) => index < DEFAULT_VISIBLE_TAGS || selected.has(tag.id));
          const hasOverflow = familyTags.length > DEFAULT_VISIBLE_TAGS;
          const hiddenCount = Math.max(familyTags.length - visibleTags.length, 0);
          return (
            <section className="tag-family" key={family}>
              <button className="tag-family-header" type="button" onClick={() => toggleCollapsedFamily(family, setCollapsedFamilies)}>
                <span>{FAMILY_LABELS[family as keyof typeof FAMILY_LABELS] ?? family}</span>
                <ChevronDown size={16} className={isCollapsed ? "is-collapsed" : ""} />
              </button>
              {!isCollapsed && visibleTags.map((tag) => (
                <button
                  className={cn("tag-button", selected.has(tag.id) && "is-selected")}
                  key={tag.id}
                  type="button"
                  onClick={() => onToggleTag(tag.id)}
                >
                  <span className="filter-check" aria-hidden="true" />
                  <span>{tag.label}</span>
                  <strong>{tagCounts[tag.id] ?? 0}</strong>
                </button>
              ))}
              {!isCollapsed && hasOverflow && (
                <button
                  className="view-more-button"
                  type="button"
                  onClick={() => {
                    setExpandedFamilies((current) => {
                      const next = new Set(current);
                      if (next.has(family)) {
                        next.delete(family);
                      } else {
                        next.add(family);
                      }
                      return next;
                    });
                  }}
                >
                  <ChevronDown size={14} className={isExpanded ? "is-expanded" : ""} />
                  {isExpanded ? "Show less" : `${hiddenCount} more`}
                </button>
              )}
            </section>
          );
        })}
      </div>
    </aside>
  );
}

function tagSortScore(tag: TagDefinition) {
  const defaultOffset = tag.show_in_filter_default === false ? 10000 : 0;
  return defaultOffset + (tag.filter_priority ?? tag.display_priority);
}

function toggleCollapsedFamily(family: string, setCollapsedFamilies: Dispatch<SetStateAction<Set<string>>>) {
  setCollapsedFamilies((current) => {
    const next = new Set(current);
    if (next.has(family)) {
      next.delete(family);
    } else {
      next.add(family);
    }
    return next;
  });
}

function orderIndex(order: string[], family: string) {
  const index = order.indexOf(family);
  return index === -1 ? order.length + 1 : index;
}
