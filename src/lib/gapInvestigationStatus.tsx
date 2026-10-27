
import type { GapInvestigationStatus } from "../types";

export function investigationStatusLabel(status: GapInvestigationStatus) {
  return status === "investigating" ? "Investigating" : "Identified";
}

