import type { CrossoverAction } from "../data/crossoverActions";
import { ActionMetrics } from "./layout";

interface ActionProgressStatsProps {
  status: CrossoverAction["status"];
}

export function ActionProgressStats({ status }: ActionProgressStatsProps) {
  return <ActionMetrics className="action-index-status" aria-label="Action progress">
    {status.map(({ value, label }) => <div className="action-index-status-item" key={label}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>)}
  </ActionMetrics>;
}
