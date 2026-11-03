import type { CrossoverAction } from "../data/crossoverActions";

interface ActionProgressStatsProps {
  status: CrossoverAction["status"];
}

export function ActionProgressStats({ status }: ActionProgressStatsProps) {
  return <dl className="action-index-status" aria-label="Action progress">
    {status.map(({ value, label }) => <div className="action-index-status-item" key={label}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>)}
  </dl>;
}
