import { FAMILY_LABELS } from "../constants";
import type { TagDefinition, TagFamily } from "../types";

interface ContextualFiltersProps {
  groups: Array<{ family: TagFamily; tags: TagDefinition[] }>;
  selectedTagIds: string[];
  onToggleTag: (tagId: string) => void;
}

export function ContextualFilters({ groups, selectedTagIds, onToggleTag }: ContextualFiltersProps) {
  return (
    <div className="context-filters" aria-label="Contextual filters">
      {groups.map((group) => {
        const selected = group.tags.filter((tag) => selectedTagIds.includes(tag.id));
        return (
          <select
            key={group.family}
            value={selected[0]?.id ?? ""}
            onChange={(event) => event.target.value && onToggleTag(event.target.value)}
            aria-label={FAMILY_LABELS[group.family]}
          >
            <option value="">{FAMILY_LABELS[group.family]}</option>
            {group.tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {selectedTagIds.includes(tag.id) ? "✓ " : ""}
                {tag.label}
              </option>
            ))}
          </select>
        );
      })}
    </div>
  );
}
