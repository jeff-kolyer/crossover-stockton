
import gapsData from "../data/gaps.json";
import storiesData from "../data/stories.json";
import { investigationStatusLabel } from "../lib/gapInvestigationStatus";
import { navigateInternalLink } from "../lib/internalLink";
import { PublicPrimaryAction } from "./PublicPrimaryAction";
import { ArrowTextLink } from "./ArrowTextLink";
import { HeadingGroup, Stack } from "./layout";
import type { GapRecord, StoryRecord } from "../types";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "investigation";

interface HomeLandingProps {
  onNavigate: (page: PublicRoute) => void;
  onOpenGap: (slug: string) => void;
  onOpenOverview: () => void;
  onOpenGapSection: (slug: string, section: "our-findings") => void;
  onOpenWork: (workId: string) => void;
  onOpenStory: (slug: string) => void;
  onOpenTasks: () => void;
}

const gaps = (gapsData as GapRecord[]).filter((gap) => gap.active).sort((a, b) => a.rank - b.rank);
const needs = [...gaps.filter((gap) => gap.status !== "monitored"), ...gaps.filter((gap) => gap.status === "monitored")].slice(0, 3);
const dogGap = gaps.find((gap) => gap.id === "dogs-safe-placement");
const homeGapImages: Record<string, string> = {
  "dogs-safe-placement": "/images/home/dog-on-street.jpg",
  "pet-inclusive-shelter": "/images/home/pets-shelter.jpg",
  "food-distribution-capacity": "/images/home/food-dist.jpg",
  "low-barrier-housing-pathways": "/images/home/housing.jpg",
};
const homeStoryImages: Record<string, string> = {
  "floyd-henley-apartment": "/images/home/getting-keys.jpg",
};
const stories = (storiesData as StoryRecord[]).filter((story) => story.active && story.featured).sort((a, b) => Date.parse(b.published_at ?? "") - Date.parse(a.published_at ?? "")).slice(0, 3);

export function HomeLanding({ onNavigate, onOpenGap, onOpenOverview, onOpenGapSection, onOpenWork, onOpenStory, onOpenTasks }: HomeLandingProps) {
  return <div className="home-landing">
    <section className="home-landing-section" aria-labelledby="home-needs-title">
      <div className="home-landing-section-heading"><h2 id="home-needs-title">Gaps to investigate</h2></div>
      <div className="home-landing-needs">{needs.map((gap) => <article className="home-landing-need" key={gap.id}>
        <span className="home-landing-need-image"><img src={homeGapImages[gap.id] || gap.thumbnail_image || gap.artwork} alt="" loading="lazy" /></span>
        <div className="home-landing-need-body">
          <Stack className="home-landing-need-heading" space="related">
            <span className="home-landing-status" data-status={gap.investigation_status}>{investigationStatusLabel(gap.investigation_status)}</span>
            <h3><a className="home-landing-need-main-link" href={`/reality/${gap.slug}/`} onClick={(event) => navigateInternalLink(event, () => onOpenGap(gap.slug))}>{gap.title}</a></h3>
          </Stack>
          <Stack className="home-landing-need-details" space="content">
            <p className="home-landing-need-summary">{gap.summary}</p>
            {gap.id === "dogs-safe-placement" && <ArrowTextLink className="home-landing-need-more arrow-text-link--green" href="/work/dogs/activity/#overview" onClick={(event) => navigateInternalLink(event, onOpenOverview)}>Find out more</ArrowTextLink>}
          </Stack>
        </div>
      </article>)}</div>
      <ArrowTextLink className="home-landing-section-link arrow-text-link--green" href="/reality/" onClick={(event) => navigateInternalLink(event, () => onNavigate("reality"))}>Explore all needs</ArrowTextLink>
    </section>

    {dogGap && <section className="home-landing-investigation" aria-labelledby="home-investigation-title">
      <img src="/images/home/dog-shelter.jpg" alt="" loading="lazy" />
      <Stack className="home-landing-investigation-copy" space="content"><p>Investigation · Stockton</p><HeadingGroup><h2 id="home-investigation-title">Why do so many dogs struggle to reach care?</h2><p>Stockton's animal shelter reports regular overcrowding. We're examining what happens when someone finds a dog and tries to help.</p></HeadingGroup><div><PublicPrimaryAction href="/work/dogs/findings/" onClick={(event) => navigateInternalLink(event, () => onOpenGapSection(dogGap.slug, "our-findings"))}>Explore what we're learning</PublicPrimaryAction></div></Stack>
      <nav className="home-landing-investigation-links" aria-label="Explore the investigation">
        <a href="/work/dogs/findings/" onClick={(event) => navigateInternalLink(event, () => onOpenGapSection(dogGap.slug, "our-findings"))}><div><h3>Explore our findings</h3><p>What we're learning from the evidence</p></div></a>
        <a href="/work/dogs/map/" onClick={(event) => navigateInternalLink(event, () => onOpenWork("dogs-locations-map"))}><div><h3>Explore the map</h3><p>Places, reports, and firsthand observations</p></div></a>
        <a href="/work/dogs/" onClick={(event) => navigateInternalLink(event, onOpenTasks)}><div><h3>See what's underway</h3><p>Our current tasks and next steps</p></div></a>
      </nav>
    </section>}

    <section className="home-landing-section" aria-labelledby="home-stories-title">
      <div className="home-landing-section-heading"><h2 id="home-stories-title">Stories of connection</h2></div>
      <div className="home-landing-stories">{stories.map((story) => <a key={story.id} href={`/stories/${story.slug}/`} onClick={(event) => navigateInternalLink(event, () => onOpenStory(story.slug))}><h3>{story.title}</h3><img src={homeStoryImages[story.id] || story.image || "/images/connection/connection_banner.jpg"} alt="" loading="lazy" /><p>{story.summary}</p></a>)}</div>
      <ArrowTextLink className="home-landing-section-link arrow-text-link--green" href="/connection/" onClick={(event) => navigateInternalLink(event, () => onNavigate("connection"))}>See all stories</ArrowTextLink>
    </section>

    {dogGap && <nav className="home-landing-destinations" aria-label="More ways to explore Crossover">
      <a href="/about/" onClick={(event) => navigateInternalLink(event, () => onNavigate("about"))}><div className="home-landing-destination-copy"><h3>Learn about Crossover</h3><p>Our approach, our mission, and why we're starting here.</p></div></a>
      <a href="/reality/" onClick={(event) => navigateInternalLink(event, () => onNavigate("reality"))}><div className="home-landing-destination-copy"><h3>Needs in Stockton</h3><p>Problems we've identified for investigation.</p></div></a>
      <a href="/work/dogs/findings/" onClick={(event) => navigateInternalLink(event, () => onOpenGapSection(dogGap.slug, "our-findings"))}><div className="home-landing-destination-copy"><h3>Explore our findings</h3><p>What we know, what's unverified, and what's next.</p></div></a>
      <a href="/work/dogs/map/" onClick={(event) => navigateInternalLink(event, () => onOpenWork("dogs-locations-map"))}><div className="home-landing-destination-copy"><h3>See what's happening</h3><p>Maps, data, and the latest field reports.</p></div></a>
    </nav>}

  </div>;
}
