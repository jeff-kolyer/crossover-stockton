import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  ExternalLink,
  FileText,
  HandHeart,
  Heart,
  Home,
  MapPin,
  Menu,
  PawPrint,
  Search,
  Sprout,
  Sun,
  UserRound,
} from "lucide-react";
import storiesData from "../data/stories.json";
import type { StoryEvidence, StoryRecord } from "../types";

type PublicRoute = "home" | "reality" | "connection" | "action" | "about" | "organizations";

interface StoryDetailPageProps {
  slug?: string;
  onNavigate: (page: PublicRoute) => void;
}

const stories = storiesData as StoryRecord[];
const logoDark = "/images/logo_dark.png";
const logoLight = "/images/logo_light.png";
const fallbackImage = "/images/connection/connection_banner.jpg";

export function StoryDetailPage({ slug, onNavigate }: StoryDetailPageProps) {
  const story = stories.find((item) => item.slug === slug && item.active);

  if (!story) {
    return (
      <main className="story-detail-page public-home">
        <PublicStoryNav onNavigate={onNavigate} />
        <section className="story-detail-shell story-not-found">
          <button className="story-back-link" type="button" onClick={() => onNavigate("connection")}>
            <ArrowLeft size={16} /> Back to stories
          </button>
          <p className="story-kicker">Signs of Being</p>
          <h1>We could not find that story.</h1>
          <p>This story may have moved, been retired, or not been added to the public data yet.</p>
        </section>
      </main>
    );
  }

  const evidence = resolvedEvidence(story);
  const image = story.image || fallbackImage;

  return (
    <main className="story-detail-page public-home">
      <PublicStoryNav onNavigate={onNavigate} />

      <article className="story-detail-shell">
        <section className="story-opening">
          <div className="story-opening-copy">
            <p className="story-kicker">Signs of Being</p>
            <h1>{story.title}</h1>
            <p className="story-summary">{story.summary}</p>
            {story.sign_of_being && <p className="story-sign-line">{story.sign_of_being}</p>}
            <button className="story-back-link" type="button" onClick={() => onNavigate("connection")}>
              <ArrowLeft size={16} /> Back to stories
            </button>
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
              <h2><Sprout size={34} /> The fruit</h2>
              <ul>
                {story.fruit.map((item) => (
                  <li key={item}><CheckCircle2 size={17} /> {item}</li>
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
                    <Heart size={28} />
                    <strong>{moment.title}</strong>
                    <p>{moment.text}</p>
                    {moment.source_url && (
                      <a href={moment.source_url} target="_blank" rel="noreferrer">
                        {moment.source_label || "Source"} <ExternalLink size={14} />
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
                    <FileText size={18} />
                    <span>
                      <strong>{source.label}</strong>
                      {source.published_at && <small>{formatDate(source.published_at)}</small>}
                    </span>
                    <ExternalLink size={15} />
                  </a>
                ))}
              </div>
            </section>
          )}
        </section>

        <section className="story-action-band">
          <span><HandHeart size={42} /></span>
          <div>
            <h2>Small acts of care can cross unlikely boundaries.</h2>
            <p>Your attention, time, and support help real work keep moving forward.</p>
          </div>
          <button type="button" onClick={() => onNavigate("action")}>
            Take a real step <ArrowRight size={18} />
          </button>
        </section>
      </article>

      <footer className="public-footer">
        <div className="footer-logo" aria-label="Crossover">
          <img src={logoDark} alt="" decoding="async" />
          <span>Crossover</span>
        </div>
        <span>© 2026 Crossover Stockton</span>
        <p>Reality. Connection. Action.</p>
        <button type="button" onClick={() => onNavigate("about")}>About</button>
        <button type="button" onClick={() => onNavigate("action")}>Action</button>
      </footer>

      <nav className="public-bottom-nav" aria-label="Mobile primary">
        <button type="button" onClick={() => onNavigate("home")}><Home size={21} /><span>Home</span></button>
        <button type="button" className="is-active" onClick={() => onNavigate("connection")}><MapPin size={21} /><span>Stories</span></button>
        <button type="button" onClick={() => onNavigate("reality")}><Search size={21} /><span>Needs</span></button>
        <button type="button" onClick={() => onNavigate("organizations")}><Building2 size={21} /><span>Orgs</span></button>
        <button type="button" onClick={() => onNavigate("about")}><CircleAlert size={21} /><span>About</span></button>
      </nav>
    </main>
  );
}

function PublicStoryNav({ onNavigate }: { onNavigate: (page: PublicRoute) => void }) {
  return (
    <header className="public-nav story-detail-nav">
      <button className="public-mobile-menu" type="button" aria-label="Open navigation">
        <Menu size={24} />
      </button>
      <button className="public-logo" type="button" aria-label="Crossover home" onClick={() => onNavigate("home")}>
        <img src={logoLight} alt="" decoding="async" />
        <span>Crossover</span>
      </button>
      <nav aria-label="Primary">
        <button type="button" onClick={() => onNavigate("reality")}>Needs</button>
        <button type="button" className="is-active" onClick={() => onNavigate("connection")}>Stories</button>
        <button type="button" onClick={() => onNavigate("action")}>Action</button>
        <button type="button" onClick={() => onNavigate("organizations")}>Organizations</button>
        <button type="button" onClick={() => onNavigate("about")}>About</button>
      </nav>
      <button className="location-pill" type="button" onClick={() => onNavigate("reality")}>
        <MapPin size={16} />
        Stockton, CA
        <ChevronDown size={15} />
      </button>
      <button className="sun-button" type="button" aria-label="Theme">
        <Sun size={18} />
      </button>
    </header>
  );
}

function ConnectionFlow({ items }: { items: string[] }) {
  return (
    <ol className="story-connection-flow">
      {items.map((item, index) => {
        const Icon = connectionIcon(index);
        return (
          <li key={`${item}-${index}`}>
            <span><Icon size={28} /></span>
            <strong>{item}</strong>
          </li>
        );
      })}
    </ol>
  );
}

function connectionIcon(index: number) {
  return [UserRound, PawPrint, Heart, HandHeart][index % 4];
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
