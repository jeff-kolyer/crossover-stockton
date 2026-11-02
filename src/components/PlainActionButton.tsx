import type { MouseEventHandler, ReactNode, Ref } from "react";

interface PlainActionButtonProps {
  children: ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  compact?: boolean;
  ariaLabel?: string;
  pressed?: boolean;
  variant?: "default" | "selection" | "applied-filter";
  tone?: "navy" | "light-blue";
  buttonRef?: Ref<HTMLButtonElement>;
}

export function PlainActionButton({ children, onClick, disabled, compact = false, ariaLabel, pressed, variant = "default", tone = "navy", buttonRef }: PlainActionButtonProps) {
  return <button ref={buttonRef} type="button" className={`plain-action-button${compact ? " is-compact" : ""}${variant !== "default" ? ` is-pill is-${variant}` : ""}${variant === "selection" && tone === "light-blue" ? " is-light-blue" : ""}`} aria-label={ariaLabel} aria-pressed={pressed} onClick={onClick} disabled={disabled}>{variant !== "default" ? <span>{children}</span> : children}</button>;
}

export function CloseDetailButton({ label, onClick }: { label: string; onClick: MouseEventHandler<HTMLButtonElement> }) {
  return <PlainActionButton compact ariaLabel={`Close ${label} details`} onClick={onClick}>×</PlainActionButton>;
}
