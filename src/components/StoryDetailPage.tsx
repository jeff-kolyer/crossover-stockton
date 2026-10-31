
import gapsData from "../data/gaps.json";
import storiesData from "../data/stories.json";
import { navigateInternalLink } from "../lib/internalLink";
import { PublicSiteNav } from "./PublicSiteNav";
import { PublicFooter } from "./PublicFooter";
import { PublicPrimaryAction } from "./PublicPrimaryAction";
import type { GapRecord, StoryEvidence, StoryRecord } from "../types";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";

interface StoryDetailPageProps {
  slug?: string;
  onNavigate: (page: PublicRoute) => void;
  onOpenGap: (slug: string) => void;
}

const stories = storiesData as StoryRecord[];
const gaps = gapsData as GapRecord[];
const fallbackImage = "/images/connection/connection_banner.jpg";

export function StoryDetailPage({ slug, onNavigate, onOpenGap }: StoryDetailPageProps) {
  const story = stories.find((item) => item.slug === slug && item.active);

  if (!story) {
    return (
      <main className="public-site story-detail-page public-home">
        <PublicStoryNav onNavigate={onNavigate} />
        <section className="story-detail-shell story-not-found public-document">
          <h1>We could not find that story.</h1>
          <p>This story may have moved, been retired, or not been added to the public data yet.</p>
        </section>
        <PublicFooter active="connection" onNavigate={onNavigate} />
      </main>
    );
  }

  const evidence = resolvedEvidence(story);
  const image = story.image || fallbackImage;
  const relatedGap = story.gap_ids.map((id) => gaps.find((gap) => gap.id === id && gap.active)).find((gap): gap is GapRecord => Boolean(gap));

  return (
    <main className="public-site story-detail-page public-home">
      <PublicStoryNav onNavigate={onNavigate} />

      <article className="story-detail-shell public-document">
        <section className="story-opening">
          <div className="story-opening-copy">
            <h1>{story.title}</h1>
            <p className="story-summary">{story.summary}</p>
            {story.sign_of_being && <p className="story-sign-line">{story.sign_of_being}</p>}
          </div>
          <img src={image} alt="" aria-hidden="true" loading="eager" decoding="sync" fetchPriority="high" />
        </section>

        {(story.body || (story.connection && story.connection.length > 1)) && (
          <div className="story-meaning-row">
            {story.body && (
              <section className="story-body-block">
                <h2>What is happening here</h2>
                <p>{story.body}</p>
              </section>
            )}

            {story.connection && story.connection.length > 1 && (
              <section className="story-connection-block">
                <h2>The connection</h2>
                <ConnectionFlow items={story.connection} />
              </section>
            )}
          </div>
        )}

        <div className="story-lower-grid">
          {story.fruit && story.fruit.length > 0 && (
            <section className="story-panel story-fruit-panel">
              <h2>The fruit</h2>
              <ul>
                {story.fruit.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {story.moments && story.moments.length > 0 && (
            <section className="story-panel story-moments-panel">
              <h2>Moments</h2>
              <div className="story-moment-grid">
                {story.moments.map((moment) => (
                  <article className="story-moment-card" key={`${moment.title}-${moment.source_url ?? ""}`}>
                    <h3>{moment.title}</h3>
                    <p>{moment.text}</p>
                    {moment.source_url && (
                      <a href={moment.source_url} target="_blank" rel="noreferrer">
                        {moment.source_label || "Source"}
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {evidence.length > 0 && (
            <section className="story-panel story-sources-panel">
              <h2>Sources</h2>
              <ul className="story-source-list">
                {evidence.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noreferrer">{source.label}</a>
                    {source.published_at && <> <small>{formatDate(source.published_at)}</small></>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {relatedGap && <p>
          <PublicPrimaryAction href={`/reality/${relatedGap.slug}/`} onClick={(event) => navigateInternalLink(event, () => onOpenGap(relatedGap.slug))}>Explore the related gap</PublicPrimaryAction>
        </p>}
      </article>

      <PublicFooter active="connection" onNavigate={onNavigate} />
    </main>
  );
}

function PublicStoryNav({ onNavigate }: { onNavigate: (page: PublicRoute) => void }) {
  return <PublicSiteNav active="connection" onNavigate={onNavigate} variant="story" />;
}

function ConnectionFlow({ items }: { items: string[] }) {
  return (
    <ol className="story-connection-flow">
      {items.map((item, index) => {
        return (
          <li key={`${item}-${index}`}>
            <strong>{item}</strong>
          </li>
        );
      })}
    </ol>
  );
}

function resolvedEvidence(story: StoryRecord): StoryEvidence[] {
  const candidates = story.evidence?.length
    ? story.evidence
    : story.source_url
      ? [{ label: story.source_label || "Source", url: story.source_url, published_at: story.source_published_at }]
      : [];
  const byUrl = new Map<string, StoryEvidence>();
  candidates.forEach((source) => {
    if (!source.url || byUrl.has(source.url)) return;
    byUrl.set(source.url, source);
  });
  return Array.from(byUrl.values());
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}
