import uiCopy from "../ui/action.json";
import type { CrossoverAction } from "../view/crossoverActions";
import { ActionMetrics } from "./layout";

const uiText = uiCopy.ActionProgressStats;

interface ActionProgressStatsProps {
  status: CrossoverAction["status"];
}

export function ActionProgressStats({ status }: ActionProgressStatsProps) {
  return <ActionMetrics className="action-index-status" aria-label={uiText.actionProgress}>
    {status.map(({ value, label }) => <div className="action-index-status-item" key={label}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>)}
  </ActionMetrics>;
}
