import type { MouseEvent } from "react";
import uiCopy from "../ui/shared.json";
import { siteModel } from "../model";
import { PublicPrimaryAction } from "./PublicPrimaryAction";
import { latestGapActivity } from "../lib/gapActivity";
import { investigationStatusLabel } from "../lib/gapInvestigationStatus";
import { navigateInternalLink } from "../lib/internalLink";
import { HomeLanding } from "./HomeLanding";
import { getPageComposition } from "../view/registry";
import { DeclarativeSections, type RegisteredSectionRenderer } from "../view/DeclarativeSections";
import { HeadingGroup, RecordList } from "./layout";

const uiText = uiCopy.HomePage;

interface HomePageProps {
  page: "home" | "reality" | "connection";
  onNavigate: (page: "home" | "reality" | "connection" | "action" | "updates" | "about" | "investigation") => void;
  onOpenAbout: () => void;
  onOpenGap: (slug: string) => void;
  onOpenOverview: () => void;
  onOpenGapSection: (slug: string, section: "our-findings") => void;
  onOpenWork: (workId: string) => void;
  onOpenStory: (slug: string) => void;
  onOpenTasks: () => void;
}

const gaps = siteModel.getNeeds();
const stories = siteModel.getStories();
const connectionHeroImage = "/images/connection/connection_banner.jpg";
const heroImage = "/images/home/home-hero-wide.jpg";
const realityHeroImage = "/images/reality/reality_banner.jpg";

const pageCopy = uiText.pages;
type HeroNavigate = HomePageProps["onNavigate"];
const heroRenderers: Record<string, RegisteredSectionRenderer<HeroNavigate>> = {
  "hero-slogan": { method: "prose", render: (_items, _navigate, value) => {
    const slogan = String(value ?? "");
    const split = slogan.indexOf(". ") + 1;
    return <p className="home-hero-title">{slogan.slice(0, split)}<br className="home-hero-title-break" /> {slogan.slice(split + 1)}</p>;
  } },
  "hero-purpose": { method: "prose", render: (_items, _navigate, value) => <p className="home-hero-subtitle">{String(value ?? "")}</p> },
  "hero-action": { method: "collection-index", render: (items, navigate) => items.map((item) => <PublicPrimaryAction key={item.id} href={String(item.href)} onClick={item.page ? (event: MouseEvent<HTMLAnchorElement>) => navigateInternalLink(event, () => navigate(item.page as Parameters<HeroNavigate>[0])) : undefined}>{String(item.title)}</PublicPrimaryAction>) },
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
export function HomePage({ page, onNavigate, onOpenAbout, onOpenGap, onOpenOverview, onOpenGapSection, onOpenWork, onOpenStory, onOpenTasks }: HomePageProps) {
  const isHome = page === "home";
  const hasHeroAction = isHome && getPageComposition("home")?.sections.some((section) => section.region === "hero-action");
  const copy = page === "home" ? null : pageCopy[page];
  const visibleGaps = activeGaps;
  const visibleStories = activeStories;
  const currentHeroImage = heroImageItems.find((item) => item.page === page)?.src ?? heroImage;
  return (
    <main className={`public-home ${isHome ? "crossover-home is-home-page" : "is-section-page"} is-${page}-page`}>
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

        <div className="public-hero-copy">
          <HeadingGroup>
            {isHome ? <DeclarativeSections pageId="home" region="hero" renderers={heroRenderers} context={onNavigate} /> : <><h1>{copy?.title}</h1><p>{copy?.text}</p></>}
          </HeadingGroup>
          {hasHeroAction && (
            <div className="hero-action-row">
              <DeclarativeSections pageId="home" region="hero-action" renderers={heroRenderers} context={onNavigate} />
            </div>
          )}
        </div>
      </section>

      {isHome && <HomeLanding onNavigate={onNavigate} onOpenGap={onOpenGap} onOpenOverview={onOpenOverview} onOpenGapSection={onOpenGapSection} onOpenWork={onOpenWork} onOpenStory={onOpenStory} onOpenTasks={onOpenTasks} />}

      {page === "reality" && <section id="reality" className="public-band public-gap-band">
        <div className="section-intro">
          <small className="gap-status-guide"><span> {uiText.investigatingActiveCrossoverWork}</span><span> {uiText.identifiedNotYetInvestigatedByCrossover}</span></small>
        </div>
        <RecordList separated className="gap-card-grid">
          {visibleGaps.map((gap, index) => {
            const latestActivity = latestGapActivity(gap);
            const thumbnailImage = gap.thumbnail_image || gap.preferred_image;
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
                      if (gap.preferred_image && event.currentTarget.src !== new URL(gap.preferred_image, window.location.origin).href) {
                        event.currentTarget.src = gap.preferred_image;
                      }
                    }}
                  />
                </span>
              )}
              <span className="gap-level investigation-status-pill home-landing-status" data-status={gap.investigation_status}>{investigationStatusLabel(gap.investigation_status)}</span>
              <div className="gap-card-body">
                <div className="gap-card-copy">
                  <h3>{gap.title}</h3>
                  <p>{gap.summary}</p>
                </div>
              </div>
              <span className="gap-card-meta">
                <span> {organizationCount} {organizationCount === 1 ? uiText.organizationSingular : uiText.organizationPlural} {uiText.responding}</span>
                {latestActivity && <span> {latestActivity.kind === "work" ? uiText.workUpdated : uiText.assessmentUpdated} {formatShortDate(latestActivity.date)}</span>}
              </span>
            </a>
            );
          })}
        </RecordList>
        <p className="public-back-link"><a href="/" onClick={(event) => navigateInternalLink(event, () => onNavigate("home"))}>{uiText.backToHome}</a></p>
      </section>}

      {page === "connection" && <section id="connection" className="public-band public-story-band">
        <RecordList separated className="story-grid">
          {visibleStories.map((story, index) => (
            <a className="story-card" key={story.id} href={`/stories/${story.slug}/`} onClick={(event) => navigateInternalLink(event, () => onOpenStory(story.slug))}>
              <img src={story.preferred_image || connectionHeroImage} alt="" aria-hidden="true" loading={page === "connection" && index < 3 ? "eager" : "lazy"} decoding="sync" />
              <div>
                <h3>{story.title}</h3>
                <p>{story.summary}</p>
                <small>{formatDate(story.published_at) || uiText.storyFallback}</small>
              </div>
            </a>
          ))}
        </RecordList>
        <p className="public-back-link"><a href="/" onClick={(event) => navigateInternalLink(event, () => onNavigate("home"))}>{uiText.backToHome}</a></p>
      </section>}

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
