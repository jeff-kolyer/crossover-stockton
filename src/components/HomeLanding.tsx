import uiCopy from "../ui/shared.json";
import { siteModel } from "../model";
import type { GapRecord, StoryRecord } from "../types";
import { investigationStatusLabel } from "../lib/gapInvestigationStatus";
import { navigateInternalLink } from "../lib/internalLink";
import { DeclarativeSections, type RegisteredSectionRenderer } from "../view/DeclarativeSections";
import { PublicPrimaryAction } from "./PublicPrimaryAction";
import { ArrowTextLink } from "./ArrowTextLink";
import { HeadingGroup, Stack } from "./layout";

const uiText = uiCopy.HomeLanding;
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

const homeGapImages: Record<string, string> = {
  "dogs-safe-placement": "/images/home/dog-on-street.jpg",
  "pet-inclusive-shelter": "/images/home/pets-shelter.jpg",
  "food-distribution-capacity": "/images/home/food-dist.jpg",
  "low-barrier-housing-pathways": "/images/home/housing.jpg",
};
const homeStoryImages: Record<string, string> = { "floyd-henley-apartment": "/images/home/getting-keys.jpg" };
export function HomeLanding(props: HomeLandingProps) {
  return <div className="home-landing"><DeclarativeSections pageId="home" region="body" renderers={sectionRenderers} context={props} /></div>;
}

// Existing presentation is registered by method; page data controls selection and sequence.
const sectionRenderers: Record<string, RegisteredSectionRenderer<HomeLandingProps>> = {
  "home-needs": { method: "media-list", render: (items, { onNavigate, onOpenGap, onOpenOverview }) => {
    const needs = items as unknown as GapRecord[];
    return <section className="home-landing-section" aria-labelledby="home-needs-title">
      <div className="home-landing-section-heading"><h2 id="home-needs-title">{uiText.gapsToInvestigate}</h2></div>
      <div className="home-landing-needs">{needs.map((gap) => <article className="home-landing-need" key={gap.id}>
        <span className="home-landing-need-image"><img src={homeGapImages[gap.id] || gap.thumbnail_image || gap.preferred_image} alt="" loading="lazy" /></span>
        <div className="home-landing-need-body"><Stack className="home-landing-need-heading" space="related">
          <span className="home-landing-status" data-status={gap.investigation_status}>{investigationStatusLabel(gap.investigation_status)}</span>
          <h3><a className="home-landing-need-main-link" href={`/reality/${gap.slug}/`} onClick={(event) => navigateInternalLink(event, () => onOpenGap(gap.slug))}>{gap.title}</a></h3>
        </Stack><Stack className="home-landing-need-details" space="content"><p className="home-landing-need-summary">{gap.summary}</p>
          {gap.investigation_status === "investigating" && <ArrowTextLink className="home-landing-need-more arrow-text-link--green" href="/work/dogs/activity/#overview" onClick={(event) => navigateInternalLink(event, onOpenOverview)}>{uiText.findOutMore}</ArrowTextLink>}
        </Stack></div>
      </article>)}</div>
      <ArrowTextLink className="home-landing-section-link arrow-text-link--green" href="/reality/" onClick={(event) => navigateInternalLink(event, () => onNavigate("reality"))}>{uiText.exploreAllNeeds}</ArrowTextLink>
    </section>;
  } },
  "home-investigation": { method: "collection-index", render: (items, { onOpenGapSection, onOpenWork, onOpenTasks }) => {
    const investigation = items[0];
    if (!investigation) return null;
    const gap = siteModel.getNeed(String(investigation.gap_id));
    if (!gap) return null;
    return <section className="home-landing-investigation" aria-labelledby="home-investigation-title">
      <img src="/images/home/dog-shelter.jpg" alt="" loading="lazy" />
      <Stack className="home-landing-investigation-copy" space="content"><p>{uiText.investigationStockton}</p><HeadingGroup><h2 id="home-investigation-title">{String(investigation.publicQuestion)}</h2><p>{String(investigation.publicSummary)}</p></HeadingGroup><div><PublicPrimaryAction href="/work/dogs/findings/" onClick={(event) => navigateInternalLink(event, () => onOpenGapSection(gap.slug, "our-findings"))}>{uiText.exploreWhatWeReLearning}</PublicPrimaryAction></div></Stack>
      <nav className="home-landing-investigation-links" aria-label={uiText.exploreTheInvestigation}>
        <a href="/work/dogs/findings/" onClick={(event) => navigateInternalLink(event, () => onOpenGapSection(gap.slug, "our-findings"))}><div><h3>{uiText.exploreOurFindings}</h3><p>{uiText.whatWeReLearningFromTheEvidence}</p></div></a>
        <a href="/work/dogs/map/" onClick={(event) => navigateInternalLink(event, () => onOpenWork("dogs-locations-map"))}><div><h3>{uiText.exploreTheMap}</h3><p>{uiText.placesReportsAndFirsthandObservations}</p></div></a>
        <a href="/work/dogs/" onClick={(event) => navigateInternalLink(event, onOpenTasks)}><div><h3>{uiText.seeWhatSUnderway}</h3><p>{uiText.ourCurrentTasksAndNextSteps}</p></div></a>
      </nav>
    </section>;
  } },
  "home-stories": { method: "media-list", render: (items, { onNavigate, onOpenStory }) => {
    const stories = items as unknown as StoryRecord[];
    return <section className="home-landing-section" aria-labelledby="home-stories-title">
      <div className="home-landing-section-heading"><h2 id="home-stories-title">{uiText.storiesOfConnection}</h2></div>
      <div className="home-landing-stories">{stories.map((story) => <a key={story.id} href={`/stories/${story.slug}/`} onClick={(event) => navigateInternalLink(event, () => onOpenStory(story.slug))}><h3>{story.title}</h3><img src={homeStoryImages[story.id] || story.preferred_image || "/images/connection/connection_banner.jpg"} alt="" loading="lazy" /><p>{story.summary}</p></a>)}</div>
      <ArrowTextLink className="home-landing-section-link arrow-text-link--green" href="/connection/" onClick={(event) => navigateInternalLink(event, () => onNavigate("connection"))}>{uiText.seeAllStories}</ArrowTextLink>
    </section>;
  } },
  "home-navigation": { method: "collection-index", render: (items, { onNavigate }) => {
    return <nav className="home-landing-destinations" aria-label={uiText.moreWaysToExploreCrossover}>
      {items.map((item) => <a key={item.id} href={String(item.href)} onClick={item.page ? (event) => navigateInternalLink(event, () => onNavigate(item.page as PublicRoute)) : undefined}><div className="home-landing-destination-copy"><h3>{String(item.title)}</h3><p>{String(item.description)}</p></div></a>)}
    </nav>;
  } },
};
