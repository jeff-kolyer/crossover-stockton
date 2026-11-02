import type { ComponentProps } from "react";

export function ArrowTextLink({ children, className, ...props }: ComponentProps<"a">) {
  return <a {...props} className={`arrow-text-link${className ? ` ${className}` : ""}`}>
    <span className="arrow-text-link-label">{children}</span>
    <svg className="arrow-text-link-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  </a>;
}
