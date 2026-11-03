
import uiCopy from "../data/pages/needs.json";
import type { GapInvestigationStatus } from "../types";

export function investigationStatusLabel(status: GapInvestigationStatus) {
  return uiCopy.gapInvestigationStatus[status];
}

