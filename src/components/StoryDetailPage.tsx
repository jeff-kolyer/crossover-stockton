
import storiesData from "../data/stories.json";
import { navigateInternalLink } from "../lib/internalLink";
import { PublicSiteNav } from "./PublicSiteNav";
import { PublicFooter } from "./PublicFooter";
import { PublicPrimaryAction } from "./PublicPrimaryAction";
import type { StoryEvidence, StoryRecord } from "../types";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";

interface StoryDetailPageProps {
  slug?: string;
  onNavigate: (page: PublicRoute) => void;
}

const stories = storiesData as StoryRecord[];
const fallbackImage = "/images/connection/connection_banner.jpg";

export function StoryDetailPage({ slug, onNavigate }: StoryDetailPageProps) {
  const story = stories.find((item) => item.slug === slug && item.active);

  if (!story) {
    return (
      <main className="public-site story-detail-page public-home">
        <PublicStoryNav onNavigate={onNavigate} />
        <section className="story-detail-shell story-not-found">
          <h1>We could not find that story.</h1>
          <p>This story may have moved, been retired, or not been added to the public data yet.</p>
        </section>
        <PublicFooter active="connection" onNavigate={onNavigate} />
      </main>
    );
  }

  const evidence = resolvedEvidence(story);
  const image = story.image || fallbackImage;

  return (
    <main className="public-site story-detail-page public-home">
      <PublicStoryNav onNavigate={onNavigate} />

      <article className="story-detail-shell">
        <section className="story-opening">
          <div className="story-opening-copy">
            <h1>{story.title}</h1>
            <p className="story-summary">{story.summary}</p>
            {story.sign_of_being && <p className="story-sign-line">{story.sign_of_being}</p>}
          </div>
          <img src={image} alt="" aria-hidden="true" loading="eager" decoding="sync" fetchPriority="high" />
        </section>

        {(story.body || (story.connection && story.connection.length > 1)) && (
          <section className="story-meaning-row">
            {story.body && (
              <div className="story-body-block">
                <h2>What is happening here</h2>
                <p>{story.body}</p>
              </div>
            )}

            {story.connection && story.connection.length > 1 && (
              <div className="story-connection-block">
                <h2>The connection</h2>
                <ConnectionFlow items={story.connection} />
              </div>
            )}
          </section>
        )}

        <section className="story-lower-grid">
          {story.fruit && story.fruit.length > 0 && (
            <section className="story-panel story-fruit-panel">
              <h2> The fruit</h2>
              <ul>
                {story.fruit.map((item) => (
                  <li key={item}> {item}</li>
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
                    
                    <strong>{moment.title}</strong>
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
              <div className="story-source-list">
                {evidence.map((source) => (
                  <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>
                    
                    <span>
                      <strong>{source.label}</strong>
                      {source.published_at && <small>{formatDate(source.published_at)}</small>}
                    </span>
                    
                  </a>
                ))}
              </div>
            </section>
          )}
        </section>

        <section className="story-action-band">
          <div>
            <h2>Small acts of care can cross unlikely boundaries.</h2>
            <p>Your attention, time, and support help real work keep moving forward.</p>
          </div>
          <PublicPrimaryAction href="/action/" onClick={(event) => navigateInternalLink(event, () => onNavigate("action"))}>Take a real step</PublicPrimaryAction>
        </section>
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
