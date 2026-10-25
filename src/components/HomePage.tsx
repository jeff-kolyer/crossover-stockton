import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  Home,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import actionsData from "../data/actions.json";
import gapsData from "../data/gaps.json";
import storiesData from "../data/stories.json";
import { getActionIcon } from "../lib/actionIcons";
import { latestGapActivity } from "../lib/gapActivity";
import { InvestigationStatusIcon, investigationStatusLabel } from "../lib/gapInvestigationStatus";
import { navigateInternalLink } from "../lib/internalLink";
import { PublicSiteNav } from "./PublicSiteNav";
import { HomeLanding } from "./HomeLanding";
import type { ActionTag, GapRecord, PublicActionRecord, StoryRecord } from "../types";

interface HomePageProps {
  page: "home" | "reality" | "connection" | "action";
  onNavigate: (page: "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations") => void;
  onOpenAbout: () => void;
  onOpenGap: (slug: string) => void;
  onOpenGapSection: (slug: string, section: "our-findings" | "ways-to-help") => void;
  onOpenWork: (workId: string) => void;
  onOpenStory: (slug: string) => void;
  onOpenAction: (action: PublicActionRecord) => void;
}

const gaps = gapsData as GapRecord[];
const stories = storiesData as StoryRecord[];
const actions = actionsData as PublicActionRecord[];

const actionHeroImage = "/images/action/action_banner.jpg";
const connectionHeroImage = "/images/connection/connection_banner.jpg";
const heroImage = "/images/home/background_home.jpg";
const realityHeroImage = "/images/reality/reality_banner.jpg";
const logoDark = "/images/logo_dark.webp";
const logoLight = "/images/logo_light.webp";

const pageCopy = {
  home: {
    eyebrow: "",
    title: "See clearly. Act locally.",
    text: "Crossover investigates where emerging AI, robotics, and human participation could help meet real-world needs in Stockton.",
  },
  reality: {
    eyebrow: "Reality",
    title: "Needs we're investigating",
    text: "AI surfaced these possibilities through public information. Crossover is investigating street dog care first; the assumptions and severity of the other needs have not been independently established.",
  },
  connection: {
    eyebrow: "Connection",
    title: "Signs of being",
    text: "Documented stories of people making a difference. These are not presented as outcomes of Crossover's technology investigations.",
  },
  action: {
    eyebrow: "Action",
    title: "Take a real step",
    text: "These are possible ways to help or learn what's needed. We're testing how accessible and effective they are, and documenting what happens.",
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

function dogActionRank(id: string) {
  const immediate = ["check-reported-stray-dog-area", "report-a-stray-dog", "document-dog-response-attempt", "verify-a-dog-care-service", "identify-missing-dog-care-capability", "help-feed-street-dogs"];
  const index = immediate.indexOf(id);
  return index === -1 ? immediate.length : index;
}

export function HomePage({ page, onNavigate, onOpenAbout, onOpenGap, onOpenGapSection, onOpenWork, onOpenStory, onOpenAction }: HomePageProps) {
  const [selectedActionTag, setSelectedActionTag] = useState<ActionTag | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const roleFilterRef = useRef<HTMLDivElement>(null);
  const roleTriggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!roleMenuOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (!roleFilterRef.current?.contains(event.target as Node)) setRoleMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [roleMenuOpen]);
  const isHome = page === "home";
  const copy = pageCopy[page];
  const visibleActions = actions.filter((action) => action.active);
  const availableActionTags = actionTagOrder.filter((tag) => visibleActions.some((action) => action.tags?.includes(tag)));
  const availableRoles = [...new Set(visibleActions.flatMap((action) => action.participation_roles?.map((role) => role.name) ?? []))].sort((a, b) => a.localeCompare(b));
  const filteredActions = page === "action"
    ? visibleActions.filter((action) =>
      (!selectedActionTag || action.tags?.includes(selectedActionTag)) &&
      (!selectedRole || action.participation_roles?.some((role) => role.name === selectedRole)))
    : visibleActions;
  const orderedActions = selectedActionTag === "dogs"
    ? [...filteredActions].sort((a, b) => dogActionRank(a.id) - dogActionRank(b.id))
    : filteredActions;
  const visibleGaps = activeGaps;
  const visibleStories = activeStories;
  const currentHeroImage = heroImageItems.find((item) => item.page === page)?.src ?? heroImage;
  const navigation = <PublicSiteNav active={page} onNavigate={onNavigate} onOpenAbout={onOpenAbout} variant={isHome ? "dark" : "overlay"} />;

  return (
    <main className={`public-home ${isHome ? "is-home-page" : "is-section-page"} is-${page}-page`}>
      {isHome && navigation}
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
        {!isHome && navigation}

        <div className="public-hero-copy">
          {!isHome && <span className="public-page-eyebrow">{copy.eyebrow}</span>}
          <h1>{isHome ? <>See clearly.<br />Act locally.</> : copy.title}</h1>
          <p>{copy.text}</p>
          {isHome && (
            <div className="hero-action-row">
              <a className="hero-investigation-button" href="/action/" onClick={(event) => navigateInternalLink(event, () => onNavigate("action"))}>Find out how you can help <ArrowRight size={18} aria-hidden="true" /></a>
            </div>
          )}
        </div>
      </section>

      {isHome && <HomeLanding onNavigate={onNavigate} onOpenGap={onOpenGap} onOpenGapSection={onOpenGapSection} onOpenWork={onOpenWork} onOpenStory={onOpenStory} onOpenAction={onOpenAction} />}

      {page === "reality" && <section id="reality" className="public-band public-gap-band">
        <div className="section-intro">
          <p>AI surfaced through public information</p>
          <h2>Potential unmet needs</h2>
          <span>AI has surfaced potential unmet needs in Stockton through public information. We have not verified every assumption or determined each need's severity.</span>
          <small className="gap-status-guide"><span><InvestigationStatusIcon status="investigating" size={16} /> Investigating: active Crossover work.</span><span><InvestigationStatusIcon status="identified" size={16} /> Identified: not yet investigated by Crossover.</span></small>
        </div>
        <div className="gap-card-grid">
          {visibleGaps.map((gap, index) => {
            const latestActivity = latestGapActivity(gap);
            const useful = actionTitles(gap.action_ids);
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
              <span className="gap-level investigation-status-pill"><InvestigationStatusIcon status={gap.investigation_status} size={14} /> {investigationStatusLabel(gap.investigation_status)}</span>
              <span className="gap-card-body">
                <span className="gap-card-copy">
                  <h3>{gap.title}</h3>
                  <p>{gap.summary}</p>
                </span>
              </span>
              <span className="gap-card-meta">
                <span><Users size={15} /> {organizationCount} {organizationCount === 1 ? "organization" : "organizations"}</span>
                {latestActivity && <span><CalendarDays size={14} /> {latestActivity.kind === "work" ? "Work updated" : "Assessment updated"} {formatShortDate(latestActivity.date)}</span>}
              </span>
              <span className="gap-card-action">
                <span>
                  <small>{gap.investigation_status === "investigating" ? "CURRENT FOCUS" : "POSSIBLE WAY TO HELP"}</small>
                  <strong>{compactUsefulNow(gap, useful)}</strong>
                </span>
              </span>
            </a>
            );
          })}
        </div>
        <button className="center-link" type="button" onClick={() => onNavigate("home")}>
          <ArrowLeft size={16} /> Back to home
        </button>
      </section>}

      {page === "connection" && <section id="connection" className="public-band public-story-band">
        <div className="section-intro">
          <p>What Reality Looks Like</p>
          <h2>Signs of Being</h2>
          <span>Documented stories of people making a difference. These are not presented as outcomes of Crossover's technology investigations.</span>
          <button type="button" onClick={() => onNavigate("action")}>
            Take an action <ArrowRight size={16} />
          </button>
        </div>
        <div className="story-grid">
          {visibleStories.map((story, index) => (
            <button className="story-card" key={story.id} type="button" onClick={() => onOpenStory(story.slug)}>
              <img src={story.image || connectionHeroImage} alt="" aria-hidden="true" loading={page === "connection" && index < 3 ? "eager" : "lazy"} decoding="sync" />
              <span>Fruit</span>
              <div>
                <h3>{story.title}</h3>
                <p>{story.summary}</p>
                <small>{formatDate(story.published_at) || "Story"}</small>
              </div>
            </button>
          ))}
        </div>
        {page === "connection" && (
          <button className="center-link" type="button" onClick={() => onNavigate("home")}>
            <ArrowLeft size={16} /> Back to home
          </button>
        )}
      </section>}

      {page === "action" && <section id="action" className="public-band public-action-band">
        <div className="section-intro">
          <p>How Can I Help Today?</p>
          <h2>Find your way in.</h2>
          <span>These are possible ways to help or learn what's needed. We're testing how accessible and effective they are, and documenting what happens.</span>
        </div>
        <div className="action-browser">
          {page === "action" && (
            <div className="action-filter-row" aria-label="Action filters">
              <div className="action-topic-filters" aria-label="Topic filters">
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
              <div className="action-role-filter" ref={roleFilterRef} onKeyDown={(event) => {
                if (event.key === "Escape" && roleMenuOpen) {
                  setRoleMenuOpen(false);
                  roleTriggerRef.current?.focus();
                }
              }}>
                <button
                  className="action-role-trigger"
                  type="button"
                  ref={roleTriggerRef}
                  aria-label={`Filter by role: ${selectedRole || "All roles"}`}
                  aria-expanded={roleMenuOpen}
                  aria-controls="action-role-options"
                  onClick={() => setRoleMenuOpen((open) => !open)}
                >
                  <span>{selectedRole || "All roles"}</span>
                  <ChevronDown size={20} aria-hidden="true" />
                </button>
                {roleMenuOpen && <div className="action-role-menu" id="action-role-options" role="group" aria-label="Role options">
                  {["", ...availableRoles].map((role) => (
                    <button
                      type="button"
                      className={selectedRole === role ? "is-active" : ""}
                      aria-pressed={selectedRole === role}
                      key={role || "all"}
                      onClick={() => {
                        setSelectedRole(role);
                        setRoleMenuOpen(false);
                        roleTriggerRef.current?.focus();
                      }}
                    >
                      <Check size={18} aria-hidden="true" />
                      <span>{role || "All roles"}</span>
                    </button>
                  ))}
                </div>}
              </div>
            </div>
          )}
          {page === "action" && orderedActions.length === 0 && (
            <div className="action-empty-state" role="status">
              <strong>No actions match these filters.</strong>
              <p>Try another topic or role to see more ways to help.</p>
              <button type="button" onClick={() => { setSelectedActionTag(null); setSelectedRole(""); }}>Clear filters</button>
            </div>
          )}
          <div className="action-grid">
            {orderedActions.map((action) => {
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
                  <span>{action.action_type === "investigation" ? "Investigation activity" : action.currentness === "unverified" ? "Participation not verified" : action.source_url ? "Published route; confirm availability" : "Check with provider"}</span>
                  {action.participation_roles?.length ? <span>{action.participation_roles.map((role) => `${role.name} · ${role.state}`).join(" / ")}</span> : null}
                  {[action.estimated_time || action.when_label, action.availability_status || action.location_label].filter(Boolean).map((line) => <span key={line}>{line}</span>)}
                </span>
                <ArrowRight size={17} />
              </button>
              );
            })}
          </div>
        </div>
        <button className="center-link" type="button" onClick={() => onNavigate("home")}>
          <ArrowLeft size={16} /> Back to home
        </button>
      </section>}

      <footer className="public-footer">
        <div className="footer-logo" aria-label="Crossover">
          <picture>
            <source media="(max-width: 760px)" srcSet={logoDark} />
            <img src={logoLight} alt="" />
          </picture>
          <span>Crossover</span>
        </div>
        <span>© 2026 Crossover Stockton</span>
        <p>Reality. Connection. Action.</p>
        <button type="button" className={page === "reality" ? "is-active" : ""} onClick={() => onNavigate("reality")}>Needs</button>
        <button type="button" className={page === "action" ? "is-active" : ""} onClick={() => onNavigate("action")}>Action</button>
        <button type="button" onClick={onOpenAbout}>About</button>
      </footer>

      <nav className="public-bottom-nav" aria-label="Mobile primary">
        <button type="button" className={page === "home" ? "is-active" : ""} onClick={() => onNavigate("home")}><Home size={21} /><span>Home</span></button>
        <button type="button" className={page === "reality" ? "is-active" : ""} onClick={() => onNavigate("reality")}><Search size={21} /><span>Needs</span></button>
        <button type="button" className={page === "connection" ? "is-active" : ""} onClick={() => onNavigate("connection")}><MapPin size={21} /><span>Stories</span></button>
        <button type="button" className={page === "action" ? "is-active" : ""} onClick={() => onNavigate("action")}><AlertTriangle size={21} /><span>Action</span></button>
        <button type="button" onClick={onOpenAbout}><CircleAlert size={21} /><span>About</span></button>
      </nav>
    </main>
  );
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
