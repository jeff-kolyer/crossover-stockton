import type { MouseEventHandler, ReactNode } from "react";

interface PlainActionButtonProps {
  children: ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  compact?: boolean;
  ariaLabel?: string;
  pressed?: boolean;
  variant?: "default" | "filter";
}

export function PlainActionButton({ children, onClick, disabled, compact = false, ariaLabel, pressed, variant = "default" }: PlainActionButtonProps) {
  return <button type="button" className={`plain-action-button${compact ? " is-compact" : ""}${variant === "filter" ? " is-filter" : ""}`} aria-label={ariaLabel} aria-pressed={pressed} onClick={onClick} disabled={disabled}>{children}</button>;
}

export function CloseDetailButton({ label, onClick }: { label: string; onClick: MouseEventHandler<HTMLButtonElement> }) {
  return <PlainActionButton compact ariaLabel={`Close ${label} details`} onClick={onClick}>×</PlainActionButton>;
}
