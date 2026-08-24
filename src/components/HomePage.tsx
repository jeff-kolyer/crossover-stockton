import {
  AlertTriangle,
  Apple,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  HandHeart,
  Home,
  MapPin,
  Menu,
  PawPrint,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBasket,
  Sun,
  Truck,
} from "lucide-react";
import actionsData from "../data/actions.json";
import gapsData from "../data/gaps.json";
import orgsData from "../data/orgs.json";
import storiesData from "../data/stories.json";
import type { GapRecord, OrgRecord, PublicActionRecord, StoryRecord } from "../types";

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

export function HomePage({ page, onNavigate, onOpenAbout, onOpenGap, onOpenStory, onOpenAction }: HomePageProps) {
  const isHome = page === "home";
  const copy = pageCopy[page];
  const visibleActions = isHome ? featuredActions.slice(0, 4) : featuredActions;
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
          <button className="location-pill" type="button" onClick={() => onNavigate("reality")}>
            <MapPin size={16} />
            Stockton, CA
            <ChevronDown size={15} />
          </button>
          <button className="sun-button" type="button" aria-label="Theme">
            <Sun size={18} />
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
          {activeGaps.map((gap) => {
            const Icon = getGapIcon(gap.status);
            const organizations = orgNames(gap.organization_ids);
            const useful = actionTitles(gap.action_ids);
            return (
            <button className={`gap-card is-${gap.status}`} key={gap.id} type="button" onClick={() => onOpenGap(gap.slug)}>
              <span className="gap-level"><Icon size={17} /> {formatStatus(gap.status)}</span>
              <h3>{gap.title}</h3>
              <p>{gap.summary}</p>
              <small>Who's responding</small>
              <p>{organizations || "Local responders"}</p>
              <small>Useful now</small>
              <p>{useful || "Learn what would help now."}</p>
            </button>
            );
          })}
        </div>
        <button className="center-link" type="button" onClick={() => onNavigate("reality")}>
          {page === "home" ? "Explore all needs" : "Back to needs"} <ArrowRight size={16} />
        </button>
      </section>}

      {(page === "home" || page === "connection") && <section id="connection" className="public-band public-story-band">
        <div className="section-intro">
          <p>What Reality Looks Like</p>
          <h2>Signs of Being</h2>
          <span>Fruit is the evidence. These are real changes happening in Stockton.</span>
          <button type="button" onClick={() => onNavigate("connection")}>
            {page === "home" ? "See more stories" : "Back to stories"} <ArrowRight size={16} />
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
          <h2>Take a real step.</h2>
          <span>Start somewhere with something real you can do today.</span>
        </div>
        <div className="action-grid">
          {visibleActions.map((action) => {
            const Icon = getActionIcon(action);
            return (
            <button className="action-card" key={action.id} type="button" onClick={() => onOpenAction(action)}>
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
        <button className="center-link" type="button" onClick={() => onNavigate("action")}>
          {page === "home" ? "See more ways to help" : "Back to action"} <ArrowRight size={16} />
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

function getActionIcon(action: PublicActionRecord) {
  const text = `${action.id} ${action.title}`.toLowerCase();
  if (text.includes("transport")) return Truck;
  if (text.includes("donate") || text.includes("suppl")) return ShoppingBasket;
  if (text.includes("call")) return Phone;
  return PawPrint;
}

function getOrgIcon(index: number) {
  return [PawPrint, HandHeart, ShieldCheck, Home, Building2][index % 5];
}

function orgNames(ids: string[]) {
  return ids
    .map((id) => orgs.find((org) => org.id === id)?.name)
    .filter((name): name is string => Boolean(name))
    .join(", ");
}

function actionTitles(ids: string[]) {
  return ids
    .map((id) => actions.find((action) => action.id === id)?.title)
    .filter((title): title is string => Boolean(title))
    .join(". ");
}

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function dateTime(value?: string) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}
