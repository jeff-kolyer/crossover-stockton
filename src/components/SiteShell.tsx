import type { ReactNode } from "react";
import { PublicFooter } from "./PublicFooter";
import { SiteHeader } from "./SiteHeader";
import type { PublicRoute } from "./PublicMobileMenu";

export type PageMode = "standard" | "flush" | "hero";

export function PageShell({ mode, children }: { mode: PageMode; children: ReactNode }) {
  return <div className={`page-shell page-shell--${mode}`} data-page-origin={mode}>{children}</div>;
}

export function SiteShell({ active, mode, onNavigate, children }: {
  active: PublicRoute;
  mode: PageMode;
  onNavigate: (page: PublicRoute) => void;
  children: ReactNode;
}) {
  return <div className={`site-shell public-site${mode === "flush" ? " site-shell--workspace" : ""}`}>
    <SiteHeader active={active} onNavigate={onNavigate} />
    <PageShell mode={mode}>{children}</PageShell>
    {mode !== "flush" && <PublicFooter active={active} onNavigate={onNavigate} />}
  </div>;
}
