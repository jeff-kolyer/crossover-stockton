import { useState } from "react";
import {
  AlertTriangle,
  Apple,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  HandHeart,
  Home,
  MapPin,
  Menu,
  PawPrint,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import actionsData from "../data/actions.json";
import gapsData from "../data/gaps.json";
import orgsData from "../data/orgs.json";
import storiesData from "../data/stories.json";
import { getActionIcon } from "../lib/actionIcons";
import type { ActionTag, GapRecord, OrgRecord, PublicActionRecord, StoryRecord } from "../types";

interface HomePageProps {
  page: "home" | "reality" | "connection" | "action";
  onNavigate: (page: "home" | "reality" | "connection" | "action" | "about" | "organizations") => void;
  onOpenAbout: () => void;
  onOpenGap: (slug: string) => void;
  onOpenStory: (slug: string) => void;
  onOpenAction: (action: PublicActionRecord) => void;
}

const gaps = gapsData as GapRecord[];
const stories = storiesData as StoryRecord[];
const actions = actionsData as PublicActionRecord[];
const orgs = orgsData as OrgRecord[];

const actionHeroImage = "/images/action/action_banner.jpg";
const connectionHeroImage = "/images/connection/connection_banner.jpg";
const heroImage = "/images/home/background_home.jpg";
const realityHeroImage = "/images/reality/reality_banner.jpg";
const logoDark = "/images/logo_dark.png";
const logoLight = "/images/logo_light.png";

const pageCopy = {
  home: {
    eyebrow: "",
    title: "See clearly. Act locally.",
    text: "Crossover follows selected Stockton organizations to show what reality needs, who is responding, and how you can help today.",
  },
  reality: {
    eyebrow: "Reality",
    title: "Current gaps",
    text: "What reality needs now: the unmet local needs Crossover is tracking from selected Stockton organizations.",
  },
  connection: {
    eyebrow: "Connection",
    title: "Signs of being",
    text: "Fruit is the evidence. These are changes, signals, and stories showing where people are responding.",
  },
  action: {
    eyebrow: "Action",
    title: "Take a real step",
    text: "Practical ways to help today, from calls and rides to supplies, delivery, and steady local support.",
  },
};

const heroImageItems = [
  { page: "home", src: heroImage },
  { page: "reality", src: realityHeroImage },
  { page: "connection", src: connectionHeroImage },
  { page: "action", src: actionHeroImage },
] as const;

const activeGaps = gaps.filter((gap) => gap.active).sort((a, b) => a.rank - b.rank);
const activeStories = stories
  .filter((story) => story.active)
  .sort((a, b) => dateTime(b.published_at) - dateTime(a.published_at));
const featuredStories = stories
  .filter((story) => story.active && story.featured)
  .sort((a, b) => dateTime(b.published_at) - dateTime(a.published_at));
const featuredActions = actions.filter((action) => action.active && action.featured);
const activeOrgs = orgs.filter((org) => org.active).slice(0, 5);
const actionTagOrder: ActionTag[] = ["dogs", "today", "volunteer", "donate", "food", "housing", "reentry", "foster-adopt"];
const actionTagLabels: Record<ActionTag, string> = {
  dogs: "Dogs",
  today: "Today",
  volunteer: "Volunteer",
  donate: "Donate",
  food: "Food",
  housing: "Housing",
  reentry: "Reentry",
  "foster-adopt": "Foster / Adopt",
};

export function HomePage({ page, onNavigate, onOpenAbout, onOpenGap, onOpenStory, onOpenAction }: HomePageProps) {
  const [selectedActionTag, setSelectedActionTag] = useState<ActionTag | null>(null);
  const isHome = page === "home";
  const copy = pageCopy[page];
  const visibleActions = isHome ? featuredActions.slice(0, 4) : featuredActions;
  const availableActionTags = actionTagOrder.filter((tag) => visibleActions.some((action) => action.tags?.includes(tag)));
  const filteredActions = page === "action" && selectedActionTag
    ? visibleActions.filter((action) => action.tags?.includes(selectedActionTag))
    : visibleActions;
  const visibleGaps = isHome ? activeGaps.filter((gap) => gap.status !== "watch").slice(0, 4) : activeGaps;
  const visibleStories = isHome ? featuredStories.slice(0, 3) : activeStories;
  const currentHeroImage = heroImageItems.find((item) => item.page === page)?.src ?? heroImage;

  return (
    <main className={`public-home ${isHome ? "is-home-page" : "is-section-page"}`}>
      <section className={`public-hero ${isHome ? "" : "is-compact"}`}>
        <img
          className="public-hero-image is-active"
          src={currentHeroImage}
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="sync"
          fetchPriority="high"
        />
        <div className="public-hero-shade" />
        <header className="public-nav">
          <button className="public-mobile-menu" type="button" aria-label="Open navigation">
            <Menu size={24} />
          </button>
          <button className="public-logo" type="button" aria-label="Crossover home" onClick={() => onNavigate("home")}>
            <img src={logoLight} alt="" />
            <span>Crossover</span>
          </button>
          <nav aria-label="Primary">
            <button type="button" className={page === "reality" ? "is-active" : ""} onClick={() => onNavigate("reality")}>Needs</button>
            <button type="button" className={page === "connection" ? "is-active" : ""} onClick={() => onNavigate("connection")}>Stories</button>
            <button type="button" className={page === "action" ? "is-active" : ""} onClick={() => onNavigate("action")}>Action</button>
            <button type="button" onClick={() => onNavigate("organizations")}>Organizations</button>
            <button type="button" onClick={onOpenAbout}>About</button>
          </nav>
          <button className="location-pill" type="button" onClick={() => onNavigate("home")}>
            <MapPin size={16} />
            Stockton, CA
            <ChevronDown size={15} />
          </button>
        </header>

        <div className="public-hero-copy">
          {!isHome && <span className="public-page-eyebrow">{copy.eyebrow}</span>}
          <h1>{isHome ? <>See clearly.<br />Act locally.</> : copy.title}</h1>
          <p>{copy.text}</p>
          {isHome ? (
            <>
              <button className="hero-search" type="button" onClick={() => onNavigate("action")}>
                <Search size={22} />
                <span>What can I do today?</span>
                <strong>
                  <ArrowRight size={23} />
                </strong>
              </button>
              <div className="hero-link-row">
                <span>Genuine connection bears visible fruit.</span>
                <button type="button" onClick={() => onNavigate("connection")}>See the fruit <ArrowRight size={16} /></button>
              </div>
            </>
          ) : (
            <button className="section-back-link" type="button" onClick={() => onNavigate("home")}>
              <ArrowRight size={16} /> Back to home
            </button>
          )}
        </div>
      </section>

      {(page === "home" || page === "reality") && <section id="reality" className="public-band public-gap-band">
        <div className="section-intro">
          <p>What Reality Needs Now</p>
          <h2>Current Gaps</h2>
          <span>These are today's unmet needs, real problems with real consequences.</span>
          <small><CheckCircle2 size={16} /> Updated from public records and organizations we follow.</small>
        </div>
        <div className="gap-card-grid">
          {visibleGaps.map((gap) => {
            const Icon = getGapIcon(gap.status);
            const useful = actionTitles(gap.action_ids);
            const thumbnailImage = gap.thumbnail_image || gap.artwork;
            const thumbnailSrc = thumbnailImage ? `${thumbnailImage}?v=${encodeURIComponent(gap.updated_at || gap.id)}` : "";
            const organizationCount = gap.responder_roles?.length || gap.organization_ids.length;
            return (
            <button className={`gap-card is-${gap.status}`} key={gap.id} type="button" onClick={() => onOpenGap(gap.slug)}>
              {thumbnailImage && (
                <span className="gap-card-image-frame" aria-hidden="true">
                  <img
                    src={thumbnailSrc}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onError={(event) => {
                      if (gap.artwork && event.currentTarget.src !== new URL(gap.artwork, window.location.origin).href) {
                        event.currentTarget.src = gap.artwork;
                      }
                    }}
                  />
                </span>
              )}
              <h3>{gap.title}</h3>
              <span className="gap-level"><Icon size={17} /> {formatStatus(gap.status)}</span>
              <p>{gap.summary}</p>
              <span className="gap-card-meta">
                <span><Users size={15} /> {organizationCount} {organizationCount === 1 ? "organization" : "organizations"}</span>
                {gap.updated_at && <span><CalendarDays size={14} /> Updated {formatShortDate(gap.updated_at)}</span>}
              </span>
              <span className="gap-card-action">
                <span>
                  <small>USEFUL NOW</small>
                  <strong>{compactUsefulNow(gap, useful)}</strong>
                </span>
                <ArrowRight size={18} />
              </span>
            </button>
            );
          })}
        </div>
        <button className="center-link" type="button" onClick={() => onNavigate(page === "home" ? "reality" : "home")}>
          {page === "home" ? "Explore all needs" : "Back to home"} <ArrowRight size={16} />
        </button>
      </section>}

      {(page === "home" || page === "connection") && <section id="connection" className="public-band public-story-band">
        <div className="section-intro">
          <p>What Reality Looks Like</p>
          <h2>Signs of Being</h2>
          <span>Fruit is the evidence. These are real changes happening in Stockton.</span>
          <button type="button" onClick={() => onNavigate(page === "home" ? "connection" : "action")}>
            {page === "home" ? "See more stories" : "Take an action"} <ArrowRight size={16} />
          </button>
        </div>
        <div className="story-grid">
          {visibleStories.map((story) => (
            <button className="story-card" key={story.id} type="button" onClick={() => onOpenStory(story.slug)}>
              <img src={story.image || connectionHeroImage} alt="" aria-hidden="true" loading="lazy" decoding="async" />
              <span>Fruit</span>
              <div>
                <h3>{story.title}</h3>
                <p>{story.summary}</p>
                <small>{formatDate(story.published_at) || "Story"}</small>
              </div>
            </button>
          ))}
        </div>
      </section>}

      {(page === "home" || page === "action") && <section id="action" className="public-band public-action-band">
        <div className="section-intro">
          <p>How Can I Help Today?</p>
          <h2>Find your way in.</h2>
          <span>Start somewhere with something real you can do today.</span>
        </div>
        <div className="action-browser">
          {page === "action" && (
            <div className="action-filter-row" aria-label="Action filters">
              <button
                className={selectedActionTag === null ? "is-active" : ""}
                type="button"
                onClick={() => setSelectedActionTag(null)}
              >
                All
              </button>
              {availableActionTags.map((tag) => (
                <button
                  className={selectedActionTag === tag ? "is-active" : ""}
                  type="button"
                  onClick={() => setSelectedActionTag(tag)}
                  key={tag}
                >
                  {actionTagLabels[tag]}
                </button>
              ))}
            </div>
          )}
          <div className="action-grid">
            {filteredActions.map((action) => {
              const Icon = getActionIcon(action);
              return (
              <button
                className="action-card"
                key={action.id}
                type="button"
                onClick={() => onOpenAction(action)}
              >
                <Icon size={24} />
                <strong>{action.title}</strong>
                <p>{action.summary}</p>
                <span className="action-meta">
                  {[action.when_label, action.location_label].filter(Boolean).map((line) => <span key={line}>{line}</span>)}
                </span>
                <ArrowRight size={17} />
              </button>
              );
            })}
          </div>
        </div>
        <button className="center-link" type="button" onClick={() => onNavigate(page === "home" ? "action" : "home")}>
          {page === "home" ? "See more ways to help" : "Back to home"} <ArrowRight size={16} />
        </button>
      </section>}

      {isHome && <section className="public-band public-org-band">
        <div className="section-intro">
          <p>Who We Follow</p>
          <h2>We follow a limited set of crossover-ish organizations.</h2>
          <button type="button" onClick={onOpenAbout}>Why these? <ArrowRight size={16} /></button>
        </div>
        <div className="org-grid">
          {activeOrgs.map((org, index) => {
            const Icon = getOrgIcon(index);
            return (
            <button className="org-card" key={org.id} type="button" onClick={onOpenAbout}>
              <Icon size={34} />
              <strong>{org.name}</strong>
              <span>{org.summary}</span>
              <ChevronRight size={18} />
            </button>
            );
          })}
        </div>
        <div className="org-note">
          <span>We track these organizations closely. Our AI keeps the picture current so you can act on what's real.</span>
          <button type="button" onClick={() => onNavigate("organizations")}>See all organizations <ArrowRight size={15} /></button>
        </div>
      </section>}

      {isHome && <section className="public-quote">
        <div className="quote-main">
          <span aria-hidden="true">“</span>
          <blockquote>Awareness is the greatest agent for change.</blockquote>
          <cite>
            <a href="https://www.goodreads.com/work/quotes/2567181-a-new-earth-awakening-to-your-life-s-purpose?page=1" target="_blank" rel="noreferrer">
              - Eckhart Tolle, A New Earth
            </a>
          </cite>
        </div>
        <div className="quote-fruit">
          <p>Not identity.<br />Not belief.<br />Show me the fruit.</p>
          <Apple size={34} aria-hidden="true" />
        </div>
        <span><span className="quote-definition-lead">From thinking to being.</span><strong>From egoic identity toward connection with reality.</strong></span>
      </section>}

      <footer className="public-footer">
        <div className="footer-logo" aria-label="Crossover">
          <img src={logoDark} alt="" />
          <span>Crossover</span>
        </div>
        <span>© 2026 Crossover Stockton</span>
        <p>Reality. Connection. Action.</p>
        <button type="button" onClick={onOpenAbout}>About</button>
        <button type="button" onClick={() => onNavigate("action")}>Action</button>
      </footer>

      <nav className="public-bottom-nav" aria-label="Mobile primary">
        <button type="button" className={page === "home" ? "is-active" : ""} onClick={() => onNavigate("home")}><Home size={21} /><span>Home</span></button>
        <button type="button" className={page === "connection" ? "is-active" : ""} onClick={() => onNavigate("connection")}><MapPin size={21} /><span>Stories</span></button>
        <button type="button" className={page === "reality" ? "is-active" : ""} onClick={() => onNavigate("reality")}><Search size={21} /><span>Reality</span></button>
        <button type="button" className={page === "action" ? "is-active" : ""} onClick={() => onNavigate("action")}><AlertTriangle size={21} /><span>Action</span></button>
        <button type="button" onClick={onOpenAbout}><CircleAlert size={21} /><span>About</span></button>
      </nav>
    </main>
  );
}

function formatStatus(status: GapRecord["status"]) {
  if (status === "watch") return "Watch";
  return status[0].toUpperCase() + status.slice(1);
}

function getGapIcon(status: GapRecord["status"]) {
  if (status === "critical") return CircleAlert;
  if (status === "improving") return CheckCircle2;
  if (status === "watch") return ShieldCheck;
  return AlertTriangle;
}

function getOrgIcon(index: number) {
  return [PawPrint, HandHeart, ShieldCheck, Home, Building2][index % 5];
}

function actionTitles(ids: string[]) {
  return ids
    .map((id) => actions.find((action) => action.id === id)?.title)
    .filter((title): title is string => Boolean(title))
    .join(". ");
}

function compactUsefulNow(gap: GapRecord, fallback: string) {
  const label = gap.most_useful_now?.label || fallback || "Learn what would help now.";
  return label
    .replace("Create placement capacity by fostering or adopting.", "Foster. Adopt. Take a shelter dog out.")
    .replace("Help people stay with their pets while they move toward housing.", "Support pet-inclusive shelter.")
    .replace("Help people stay with their pets while they move toward stable housing.", "Support pet-inclusive shelter.")
    .replace("Help expand the capacity to store and move donated food while it is available.", "Donate food or supplies.")
    .replace("Support cold storage and food movement.", "Donate food or supplies.")
    .replace("Foster, adopt, or take a shelter dog out.", "Foster. Adopt. Take a shelter dog out.")
    .replace("Support the local pathways that move people from shelter toward stable housing.", "Support St. Mary's housing work.")
    .replace("Support low-barrier paths from homelessness to housing.", "Support St. Mary's housing work.");
}

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function formatShortDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function dateTime(value?: string) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}
