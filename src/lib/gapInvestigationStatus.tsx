
import uiCopy from "../ui/shared.json";
import type { GapInvestigationStatus } from "../types";

export function investigationStatusLabel(status: GapInvestigationStatus) {
  return uiCopy.gapInvestigationStatus[status];
}

