
import gapsData from "../data/gaps.json";
import storiesData from "../data/stories.json";
import { investigationStatusLabel } from "../lib/gapInvestigationStatus";
import { navigateInternalLink } from "../lib/internalLink";
import { PublicPrimaryAction } from "./PublicPrimaryAction";
import type { GapRecord, StoryRecord } from "../types";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";

interface HomeLandingProps {
  onNavigate: (page: PublicRoute) => void;
  onOpenGap: (slug: string) => void;
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

export function HomeLanding({ onNavigate, onOpenGap, onOpenGapSection, onOpenWork, onOpenStory, onOpenTasks }: HomeLandingProps) {
  return <div className="home-landing">
    <section className="home-landing-section" aria-labelledby="home-needs-title">
      <div className="home-landing-section-heading"><div><p>Explore the gaps</p><h2 id="home-needs-title">Gaps to investigate</h2></div><a href="/reality/" onClick={(event) => navigateInternalLink(event, () => onNavigate("reality"))}>Explore all needs </a></div>
      <div className="home-landing-needs">{needs.map((gap) => <a className="home-landing-need" key={gap.id} href={`/reality/${gap.slug}/`} onClick={(event) => navigateInternalLink(event, () => onOpenGap(gap.slug))}>
        <span className="home-landing-need-image"><img src={homeGapImages[gap.id] || gap.thumbnail_image || gap.artwork} alt="" loading="lazy" /></span>
        <span className="home-landing-need-body"><span className="home-landing-status" data-status={gap.investigation_status}>{investigationStatusLabel(gap.investigation_status)}</span><strong>{gap.title}</strong><span className="home-landing-need-summary">{gap.summary}</span></span>
        
      </a>)}</div>
    </section>

    {dogGap && <section className="home-landing-investigation" aria-labelledby="home-investigation-title">
      <img src="/images/home/dog-shelter.jpg" alt="" loading="lazy" />
      <div className="home-landing-investigation-copy"><p>Investigation · Stockton</p><h2 id="home-investigation-title">Why do so many dogs struggle to reach care?</h2><span>Stockton's animal shelter reports regular overcrowding. We're examining what happens when someone finds a dog and tries to help.</span><PublicPrimaryAction href="/work/dogs/findings/" onClick={(event) => navigateInternalLink(event, () => onOpenGapSection(dogGap.slug, "our-findings"))}>Explore what we're learning</PublicPrimaryAction></div>
      <nav className="home-landing-investigation-links" aria-label="Explore the investigation">
        <a href="/work/dogs/findings/" onClick={(event) => navigateInternalLink(event, () => onOpenGapSection(dogGap.slug, "our-findings"))}><span>Explore our findings<small>What we're learning from the evidence</small></span></a>
        <a href="/work/dogs/map/" onClick={(event) => navigateInternalLink(event, () => onOpenWork("dogs-locations-map"))}><span>Explore the map<small>Places, reports, and firsthand observations</small></span></a>
        <a href="/work/dogs/" onClick={(event) => navigateInternalLink(event, onOpenTasks)}><span>See what's underway<small>Our current tasks and next steps</small></span></a>
      </nav>
    </section>}

    <section className="home-landing-section" aria-labelledby="home-stories-title"><div className="home-landing-section-heading"><div><h2 id="home-stories-title">Stories of connection</h2></div><a href="/connection/" onClick={(event) => navigateInternalLink(event, () => onNavigate("connection"))}>See all stories </a></div><div className="home-landing-stories">{stories.map((story) => <button type="button" key={story.id} onClick={() => onOpenStory(story.slug)}><img src={homeStoryImages[story.id] || story.image || "/images/connection/connection_banner.jpg"} alt="" loading="lazy" /><span><strong>{story.title}</strong><small>{story.summary}</small></span></button>)}</div></section>

    {dogGap && <nav className="home-landing-destinations" aria-label="More ways to explore Crossover">
      <a href="/about/" onClick={(event) => navigateInternalLink(event, () => onNavigate("about"))}><span className="home-landing-destination-copy"><strong>Learn about Crossover</strong><small>Our approach, our mission, and why we're starting here.</small></span></a>
      <a href="/reality/" onClick={(event) => navigateInternalLink(event, () => onNavigate("reality"))}><span className="home-landing-destination-copy"><strong>Needs in Stockton</strong><small>Problems we've identified for investigation.</small></span></a>
      <a href="/work/dogs/findings/" onClick={(event) => navigateInternalLink(event, () => onOpenGapSection(dogGap.slug, "our-findings"))}><span className="home-landing-destination-copy"><strong>Explore our findings</strong><small>What we know, what's unverified, and what's next.</small></span></a>
      <a href="/work/dogs/map/" onClick={(event) => navigateInternalLink(event, () => onOpenWork("dogs-locations-map"))}><span className="home-landing-destination-copy"><strong>See what's happening</strong><small>Maps, data, and the latest field reports.</small></span></a>
    </nav>}

  </div>;
}
