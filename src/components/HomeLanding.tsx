import { ArrowRight, ChevronRight, FileText, Heart, MapPin } from "lucide-react";
import actionsData from "../data/actions.json";
import gapsData from "../data/gaps.json";
import orgsData from "../data/orgs.json";
import storiesData from "../data/stories.json";
import { gapUpdates, gapUpdateHref } from "../lib/gapUpdates";
import { InvestigationStatusIcon, investigationStatusLabel } from "../lib/gapInvestigationStatus";
import { navigateInternalLink } from "../lib/internalLink";
import type { GapRecord, OrgRecord, PublicActionRecord, StoryRecord } from "../types";
import "./HomeLanding.css";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";

interface HomeLandingProps {
  onNavigate: (page: PublicRoute) => void;
  onOpenGap: (slug: string) => void;
  onOpenGapSection: (slug: string, section: "our-findings" | "ways-to-help") => void;
  onOpenWork: (workId: string) => void;
  onOpenStory: (slug: string) => void;
  onOpenAction: (action: PublicActionRecord) => void;
}

const gaps = (gapsData as GapRecord[]).filter((gap) => gap.active).sort((a, b) => a.rank - b.rank);
const needs = gaps.filter((gap) => gap.status !== "monitored").slice(0, 4);
const dogGap = gaps.find((gap) => gap.id === "dogs-safe-placement");
const stories = (storiesData as StoryRecord[]).filter((story) => story.active && story.featured).sort((a, b) => Date.parse(b.published_at ?? "") - Date.parse(a.published_at ?? "")).slice(0, 3);
const actions = actionsData as PublicActionRecord[];
const actionIds = ["report-a-stray-dog", "foster-a-dog", "doggie-day-out", "document-dog-response-attempt"];
const featuredActions = actionIds.map((id) => actions.find((action) => action.id === id && action.active)).filter((action): action is PublicActionRecord => Boolean(action));
const organizations = (dogGap?.organization_ids ?? []).map((id) => (orgsData as OrgRecord[]).find((org) => org.id === id && org.active)).filter((org): org is OrgRecord => Boolean(org)).slice(0, 3);
const updates = [...new Map(gaps.flatMap((gap) => gapUpdates(gap)).map((update) => [update.id, update])).values()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
const formatDate = (value: string) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(value.length === 10 ? `${value}T12:00:00` : value));

export function HomeLanding({ onNavigate, onOpenGap, onOpenGapSection, onOpenWork, onOpenStory, onOpenAction }: HomeLandingProps) {
  return <div className="home-landing">
    <section className="home-landing-section" aria-labelledby="home-needs-title">
      <div className="home-landing-section-heading"><div><p>Explore the gaps</p><h2 id="home-needs-title">Key needs in Stockton</h2></div><a href="/reality/" onClick={(event) => navigateInternalLink(event, () => onNavigate("reality"))}>Explore all needs <ArrowRight size={16} aria-hidden="true" /></a></div>
      <div className="home-landing-needs">{needs.map((gap) => <a className="home-landing-need" key={gap.id} href={`/reality/${gap.slug}/`} onClick={(event) => navigateInternalLink(event, () => onOpenGap(gap.slug))}>
        <span className="home-landing-need-image">{(gap.thumbnail_image || gap.artwork) && <img src={gap.thumbnail_image || gap.artwork} alt="" loading="lazy" />}</span>
        <span className="home-landing-need-body"><span className="home-landing-status"><InvestigationStatusIcon status={gap.investigation_status} size={13} />{investigationStatusLabel(gap.investigation_status)}</span><strong>{gap.title}</strong><span className="home-landing-need-summary">{gap.summary}</span></span>
        <ChevronRight className="home-landing-need-arrow" size={18} aria-hidden="true" />
      </a>)}</div>
    </section>

    {dogGap && <section className="home-landing-investigation" aria-labelledby="home-investigation-title">
      <img src={dogGap.artwork} alt="" loading="lazy" />
      <div className="home-landing-investigation-copy"><p>Dogs in Stockton · In progress</p><h2 id="home-investigation-title">Why do so many dogs struggle to reach care?</h2><span>Stockton's animal shelter reports regular overcrowding. We're examining what happens when someone finds a dog and tries to help.</span><a className="home-landing-primary" href={`/reality/${dogGap.slug}/`} onClick={(event) => navigateInternalLink(event, () => onOpenGap(dogGap.slug))}>Explore what we're learning <ArrowRight size={17} aria-hidden="true" /></a></div>
      <nav className="home-landing-investigation-links" aria-label="Explore the investigation">
        <a href={`/reality/${dogGap.slug}/our-findings/`} onClick={(event) => navigateInternalLink(event, () => onOpenGapSection(dogGap.slug, "our-findings"))}><FileText size={20} aria-hidden="true" /><span>Explore our findings<small>What the evidence shows</small></span><ChevronRight size={17} aria-hidden="true" /></a>
        <a href={`/reality/${dogGap.slug}/dogs-locations-map/`} onClick={(event) => navigateInternalLink(event, () => onOpenWork("dogs-locations-map"))}><MapPin size={20} aria-hidden="true" /><span>View the map<small>Where dogs have been reported</small></span><ChevronRight size={17} aria-hidden="true" /></a>
        <a href={`/reality/${dogGap.slug}/ways-to-help/`} onClick={(event) => navigateInternalLink(event, () => onOpenGapSection(dogGap.slug, "ways-to-help"))}><Heart size={20} aria-hidden="true" /><span>See ways to help<small>What you can do now</small></span><ChevronRight size={17} aria-hidden="true" /></a>
      </nav>
    </section>}

    <section className="home-landing-section" aria-labelledby="home-stories-title"><div className="home-landing-section-heading"><div><h2 id="home-stories-title">Stories of connection</h2></div><a href="/connection/" onClick={(event) => navigateInternalLink(event, () => onNavigate("connection"))}>See all stories <ArrowRight size={16} aria-hidden="true" /></a></div><div className="home-landing-stories">{stories.map((story) => <button type="button" key={story.id} onClick={() => onOpenStory(story.slug)}><img src={story.image || "/images/connection/connection_banner.jpg"} alt="" loading="lazy" /><span><strong>{story.title}</strong><small>{story.summary}</small></span><ChevronRight size={18} aria-hidden="true" /></button>)}</div></section>

    <div className="home-landing-bottom-grid">
      <section className="home-landing-section" aria-labelledby="home-actions-title"><div className="home-landing-section-heading"><div><h2 id="home-actions-title">Take a real step</h2></div></div><div className="home-landing-rows">{featuredActions.map((action) => <button type="button" key={action.id} onClick={() => onOpenAction(action)}><span><strong>{action.title}</strong>{action.availability_status && <small>{action.availability_status}</small>}</span><ChevronRight size={17} aria-hidden="true" /></button>)}</div><a className="home-landing-more" href="/action/" onClick={(event) => navigateInternalLink(event, () => onNavigate("action"))}>See more ways to help <ArrowRight size={16} aria-hidden="true" /></a></section>
      <section className="home-landing-section" aria-labelledby="home-updates-title"><div className="home-landing-section-heading"><div><h2 id="home-updates-title">Latest updates</h2></div></div><div className="home-landing-rows home-landing-updates">{updates.map((update) => { const href = gapUpdateHref(update.destination); return href ? <a key={update.id} href={href} target={update.destination?.kind === "external" ? "_blank" : undefined} rel={update.destination?.kind === "external" ? "noreferrer" : undefined}><time dateTime={update.date}>{formatDate(update.date)}</time><span>{update.title}</span><ChevronRight size={17} aria-hidden="true" /></a> : <div key={update.id}><time dateTime={update.date}>{formatDate(update.date)}</time><span>{update.title}</span></div>; })}</div><a className="home-landing-more" href="/updates/" onClick={(event) => navigateInternalLink(event, () => onNavigate("updates"))}>See all updates <ArrowRight size={16} aria-hidden="true" /></a></section>
      <section className="home-landing-section" aria-labelledby="home-organizations-title"><div className="home-landing-section-heading"><div><h2 id="home-organizations-title">Organizations</h2></div></div><div className="home-landing-rows">{organizations.map((org) => <button type="button" key={org.id} onClick={() => onNavigate("organizations")}><span><strong>{org.name}</strong><small>{org.summary}</small></span><ChevronRight size={17} aria-hidden="true" /></button>)}</div><a className="home-landing-more" href="/organizations/" onClick={(event) => navigateInternalLink(event, () => onNavigate("organizations"))}>See all organizations <ArrowRight size={16} aria-hidden="true" /></a></section>
    </div>
  </div>;
}
