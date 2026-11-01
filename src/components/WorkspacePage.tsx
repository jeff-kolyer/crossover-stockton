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
  const Heading = article ? "h1" : "h2";

  return <Element className="workspace-page">
    {backLink && <p className="workspace-back">{backLink}</p>}
    <header><Heading id={headingId}>{title}</Heading>{subtitle && <p>{subtitle}</p>}</header>
    {children}
  </Element>;
}

export function WorkspaceSection({ title, subtitle, headingId, children }: {
  title: string;
  subtitle?: ReactNode;
  headingId?: string;
  children: ReactNode;
}) {
  return <section className="workspace-section" aria-labelledby={headingId}>
    <header><h2 id={headingId}>{title}</h2>{subtitle && <p>{subtitle}</p>}</header>
    {children}
  </section>;
}
