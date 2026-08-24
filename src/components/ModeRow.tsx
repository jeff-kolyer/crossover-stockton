import { MODES } from "../constants";
import type { ModeId } from "../types";
import { cn } from "../lib/utils";

interface ModeRowProps {
  activeMode: ModeId;
  counts: Record<string, number>;
  onModeChange: (mode: ModeId) => void;
  variant?: "row" | "rail";
}

export function ModeRow({ activeMode, counts, onModeChange, variant = "row" }: ModeRowProps) {
  return (
    <div className={cn("mode-row", variant === "rail" && "mode-row-rail")} role="tablist" aria-label="Record modes">
      {MODES.map((mode) => {
        const Icon = mode.icon;
        return (
          <button
            key={mode.id}
            className={cn("mode-button", activeMode === mode.id && "is-active")}
            onClick={() => onModeChange(mode.id)}
            type="button"
          >
            <Icon size={16} />
            <span>{mode.label}</span>
            <strong>{counts[mode.kind] ?? 0}</strong>
          </button>
        );
      })}
    </div>
  );
}
