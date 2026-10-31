import type { ReactNode } from "react";

export function WorkspacePage({ title, subtitle, headingId, backLink, article = false, children }: {
  title: string;
  subtitle?: ReactNode;
  headingId?: string;
  backLink?: ReactNode;
  article?: boolean;
  children: ReactNode;
}) {
  const Element = article ? "article" : "div";

  return <Element className="crossover-workspace-page">
    {backLink && <p className="crossover-workspace-back">{backLink}</p>}
    <h1 className="crossover-workspace-title" id={headingId}>{title}</h1>
    {subtitle && <p className="crossover-workspace-subtitle">{subtitle}</p>}
    {children}
  </Element>;
}

export function WorkspaceSection({ title, subtitle, headingId, children }: {
  title: string;
  subtitle?: ReactNode;
  headingId?: string;
  children: ReactNode;
}) {
  return <section className="crossover-workspace-section" aria-labelledby={headingId}>
    <h2 className="crossover-workspace-section-title" id={headingId}>{title}</h2>
    {subtitle && <p className="crossover-workspace-subtitle">{subtitle}</p>}
    {children}
  </section>;
}
