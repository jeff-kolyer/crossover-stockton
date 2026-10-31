import "../styles/home.css";
import { PublicPrimaryAction } from "./PublicPrimaryAction";
import gapsData from "../data/gaps.json";
import storiesData from "../data/stories.json";
import { latestGapActivity } from "../lib/gapActivity";
import { investigationStatusLabel } from "../lib/gapInvestigationStatus";
import { navigateInternalLink } from "../lib/internalLink";
import { PublicSiteNav } from "./PublicSiteNav";
import { PublicFooter } from "./PublicFooter";
import { HomeLanding } from "./HomeLanding";
import type { GapRecord, StoryRecord } from "../types";

interface HomePageProps {
  page: "home" | "reality" | "connection";
  onNavigate: (page: "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations") => void;
  onOpenAbout: () => void;
  onOpenGap: (slug: string) => void;
  onOpenGapSection: (slug: string, section: "our-findings") => void;
  onOpenWork: (workId: string) => void;
  onOpenStory: (slug: string) => void;
  onOpenTasks: () => void;
}

const gaps = gapsData as GapRecord[];
const stories = storiesData as StoryRecord[];
const connectionHeroImage = "/images/connection/connection_banner.jpg";
const heroImage = "/images/home/home-hero-wide.jpg";
const realityHeroImage = "/images/reality/reality_banner.jpg";

const pageCopy = {
  home: {
    eyebrow: "",
    title: "See clearly. Act locally.",
    text: "Crossover investigates where emerging AI, robotics, and human participation could help meet real-world needs in Stockton.",
  },
  reality: {
    eyebrow: "Reality",
    title: "Needs in Stockton",
    text: "AI surfaced these possibilities through public information. Crossover is investigating street dog care first; the assumptions and severity of the other needs have not been independently established.",
  },
  connection: {
    eyebrow: "Connection",
    title: "Signs of Being",
    text: "Documented stories of people making a difference. These are not presented as outcomes of Crossover's technology investigations.",
  },
};

const heroImageItems = [
  { page: "home", src: heroImage },
  { page: "reality", src: realityHeroImage },
  { page: "connection", src: connectionHeroImage },
] as const;

const activeGaps = gaps.filter((gap) => gap.active).sort((a, b) => a.rank - b.rank);
const activeStories = stories
  .filter((story) => story.active)
  .sort((a, b) => dateTime(b.published_at) - dateTime(a.published_at));
export function HomePage({ page, onNavigate, onOpenAbout, onOpenGap, onOpenGapSection, onOpenWork, onOpenStory, onOpenTasks }: HomePageProps) {
  const isHome = page === "home";
  const copy = pageCopy[page];
  const visibleGaps = activeGaps;
  const visibleStories = activeStories;
  const currentHeroImage = heroImageItems.find((item) => item.page === page)?.src ?? heroImage;
  const navigation = <PublicSiteNav active={page} onNavigate={onNavigate} onOpenAbout={onOpenAbout} variant={isHome ? "dark" : "overlay"} />;

  return (
    <main className={`public-site public-home ${isHome ? "crossover-home is-home-page" : "is-section-page"} is-${page}-page`}>
      {isHome && navigation}
      <section className={`public-hero ${isHome ? "" : "is-compact"}`}>
        {isHome ? (
          <picture className="public-hero-picture">
            <source media="(max-width: 820px)" srcSet="/images/home/home-hero.jpg" />
            <img className="public-hero-image is-active" src={heroImage} alt="" aria-hidden="true" loading="eager" decoding="sync" fetchPriority="high" />
          </picture>
        ) : (
          <img className="public-hero-image is-active" src={currentHeroImage} alt="" aria-hidden="true" loading="eager" decoding="sync" fetchPriority="high" />
        )}
        <div className="public-hero-shade" />
        {!isHome && navigation}

        <div className="public-hero-copy">
          <h1>{isHome ? <>See clearly.<br className="home-hero-title-break" /> Act locally.</> : copy.title}</h1>
          <p>{copy.text}</p>
          {isHome && (
            <div className="hero-action-row">
              <PublicPrimaryAction href="/action/" onClick={(event) => navigateInternalLink(event, () => onNavigate("action"))}>See what we're doing</PublicPrimaryAction>
            </div>
          )}
        </div>
      </section>

      {isHome && <HomeLanding onNavigate={onNavigate} onOpenGap={onOpenGap} onOpenGapSection={onOpenGapSection} onOpenWork={onOpenWork} onOpenStory={onOpenStory} onOpenTasks={onOpenTasks} />}

      {page === "reality" && <section id="reality" className="public-band public-gap-band">
        <div className="section-intro">
          <small className="gap-status-guide"><span> Investigating: active Crossover work.</span><span> Identified: not yet investigated by Crossover.</span></small>
        </div>
        <div className="gap-card-grid">
          {visibleGaps.map((gap, index) => {
            const latestActivity = latestGapActivity(gap);
            const thumbnailImage = gap.thumbnail_image || gap.artwork;
            const organizationCount = gap.responder_roles?.length || gap.organization_ids.length;
            return (
            <a className={`gap-card is-${gap.investigation_status}`} key={gap.id} href={`/reality/${gap.slug}/`} onClick={(event) => navigateInternalLink(event, () => onOpenGap(gap.slug))}>
              {thumbnailImage && (
                <span className="gap-card-image-frame" aria-hidden="true">
                  <img
                    src={thumbnailImage}
                    alt=""
                    loading={index < 4 ? "eager" : "lazy"}
                    fetchPriority={index < 4 ? "high" : "auto"}
                    decoding="sync"
                    onError={(event) => {
                      if (gap.artwork && event.currentTarget.src !== new URL(gap.artwork, window.location.origin).href) {
                        event.currentTarget.src = gap.artwork;
                      }
                    }}
                  />
                </span>
              )}
              <span className="gap-level investigation-status-pill"> {investigationStatusLabel(gap.investigation_status)}</span>
              <span className="gap-card-body">
                <span className="gap-card-copy">
                  <h3>{gap.title}</h3>
                  <p>{gap.summary}</p>
                </span>
              </span>
              <span className="gap-card-meta">
                <span> {organizationCount} {organizationCount === 1 ? "organization" : "organizations"} responding</span>
                {latestActivity && <span> {latestActivity.kind === "work" ? "Work updated" : "Assessment updated"} {formatShortDate(latestActivity.date)}</span>}
              </span>
            </a>
            );
          })}
        </div>
        <p className="public-back-link"><a href="/" onClick={(event) => navigateInternalLink(event, () => onNavigate("home"))}>Back to home</a></p>
      </section>}

      {page === "connection" && <section id="connection" className="public-band public-story-band">
        <div className="story-grid">
          {visibleStories.map((story, index) => (
            <a className="story-card" key={story.id} href={`/stories/${story.slug}/`} onClick={(event) => navigateInternalLink(event, () => onOpenStory(story.slug))}>
              <img src={story.image || connectionHeroImage} alt="" aria-hidden="true" loading={page === "connection" && index < 3 ? "eager" : "lazy"} decoding="sync" />
              <div>
                <h3>{story.title}</h3>
                <p>{story.summary}</p>
                <small>{formatDate(story.published_at) || "Story"}</small>
              </div>
            </a>
          ))}
        </div>
        <p className="public-back-link"><a href="/" onClick={(event) => navigateInternalLink(event, () => onNavigate("home"))}>Back to home</a></p>
      </section>}

      <PublicFooter active={page} onNavigate={onNavigate} onOpenAbout={onOpenAbout} />
    </main>
  );
}

function formatDate(value?: string) {
  if (!value) return "";
  const date = parseDisplayDate(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function formatShortDate(value?: string) {
  if (!value) return "";
  const date = parseDisplayDate(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function parseDisplayDate(value: string) {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
  }

  return new Date(value);
}

function dateTime(value?: string) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}
