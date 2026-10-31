import type { Article } from "../types/article";
import { navigateInternalLink } from "../lib/internalLink";
import { WorkspacePage, WorkspaceSection } from "./WorkspacePage";

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(year, month - 1, day));
}

export function ArticleContent({ article, onBack }: { article: Article; onBack: () => void }) {
  return <WorkspacePage article title={article.title} subtitle={<><time dateTime={article.date}>{formatDate(article.date)}</time> · {article.type}</>} backLink={<a href="/work/dogs/findings/" onClick={(event) => navigateInternalLink(event, onBack)}>← Findings</a>}>
      <p>{article.content.introduction}</p>
      {article.content.sections.map((section) => <WorkspaceSection key={section.heading} title={section.heading}>
        {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {section.links?.length ? <ul>{section.links.map((link) => <li key={link.url}><a href={link.url}>{link.label}</a></li>)}</ul> : null}
      </WorkspaceSection>)}
  </WorkspacePage>;
}
