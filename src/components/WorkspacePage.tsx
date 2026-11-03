import type { ReactNode } from "react";
import { HeadingGroup, Stack } from "./layout";

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

  return <Stack as={Element} className="workspace-page" space="content">
    {backLink && <p className="workspace-back">{backLink}</p>}
    <HeadingGroup as="header"><Heading id={headingId}>{title}</Heading>{subtitle && <p>{subtitle}</p>}</HeadingGroup>
    {children}
  </Stack>;
}

export function WorkspaceSection({ title, subtitle, headingId, children }: {
  title: string;
  subtitle?: ReactNode;
  headingId?: string;
  children: ReactNode;
}) {
  return <Stack as="section" className="workspace-section" aria-labelledby={headingId} space="content">
    <HeadingGroup as="header"><h2 id={headingId}>{title}</h2>{subtitle && <p>{subtitle}</p>}</HeadingGroup>
    {children}
  </Stack>;
}
