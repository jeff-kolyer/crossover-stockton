import type { MouseEventHandler, ReactNode } from "react";
import "./PlainActionButton.css";

interface PlainActionButtonProps {
  children: ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

export function PlainActionButton({ children, onClick, disabled }: PlainActionButtonProps) {
  return <button type="button" className="plain-action-button" onClick={onClick} disabled={disabled}>{children}</button>;
}
