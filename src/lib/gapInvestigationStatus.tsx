import { Search, Sparkles } from "lucide-react";
import type { GapInvestigationStatus } from "../types";

export function investigationStatusLabel(status: GapInvestigationStatus) {
  return status === "investigating" ? "Investigating" : "Identified";
}

export function InvestigationStatusIcon({ status, size = 18 }: { status: GapInvestigationStatus; size?: number }) {
  const Icon = status === "investigating" ? Search : Sparkles;
  return <Icon size={size} aria-hidden="true" />;
}
