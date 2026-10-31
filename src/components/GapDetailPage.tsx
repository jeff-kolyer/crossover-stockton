
import actionsData from "../data/actions.json";
import gapsData from "../data/gaps.json";
import orgsData from "../data/orgs.json";
import recordsData from "../data/records.json";
import storiesData from "../data/stories.json";
import workData from "../data/work.json";
import { gapWorkSummary } from "../lib/gapWorkSummary";
import { gapUpdateHref, gapUpdates, type GapUpdateEntry } from "../lib/gapUpdates";
import { investigationStatusLabel } from "../lib/gapInvestigationStatus";
import { navigateInternalLink } from "../lib/internalLink";
import { PublicSiteNav } from "./PublicSiteNav";
import { DogGapOverview } from "./DogGapOverview";
import { DogGapExperience } from "./DogGapExperience";
import { WorkSectionNav, type WorkSectionNavItem } from "./WorkSectionNav";
import type { EvidenceRecord, GapRecord, OrgRecord, PublicActionRecord, StoryRecord, WorkRecord } from "../types";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";

interface GapDetailPageProps {
  workspaceBasePath?: string;
  articlePath?: string;
  onOpenArticle?: (path: string) => void;
  slug?: string;
  section?: "overview" | "tasks" | "activity" | "reports" | "map" | "findings" | "more" | "key-factors" | "ways-to-help" | "improvements" | "our-findings" | "research" | "updates";
  onOpenSection?: (slug: string, section: NonNullable<GapDetailPageProps["section"]>, anchor?: string) => void;
  onNavigate: (page: PublicRoute) => void;
  onOpenAbout: () => void;
  onOpenGap: (slug: string) => void;
  onOpenUpdates: (slug: string) => void;
  onOpenSources: (slug: string) => void;
  onOpenWork: (workId: string, anchor?: string) => void;
  onOpenReport: (reportId: string) => void;
  onOpenStory: (slug: string) => void;
  onOpenAction: (action: PublicActionRecord) => void;
  onOpenActionDetail: () => void;
}

interface SourceLike {
  title?: string;
  publisher?: string;
  url?: string;
  published_at?: string | null;
  checked_at?: string;
  type?: string;
}

interface ResponderRole {
  organization_id: string;
  label: string;
  current_role: string;
  basis_record_ids?: string[];
  updated_at?: string;
}

const gaps = gapsData as GapRecord[];
const orgs = orgsData as OrgRecord[];
const actions = actionsData as PublicActionRecord[];
const records = recordsData as EvidenceRecord[];
const stories = storiesData as StoryRecord[];
const work = workData as WorkRecord[];
const activeGaps = gaps.filter((item) => item.active).sort((a, b) => a.rank - b.rank);
const logoDark = "/images/logo_dark.webp";
const logoLight = "/images/logo_light.webp";
const dogGapNavItems: WorkSectionNavItem[] = [
  { id: "gap-overview", label: "Overview" },
  { id: "system-model", label: "System model" },
  { id: "dog-evidence", label: "Evidence" },
  { id: "dog-pathways", label: "Pathways" },
  { id: "dog-solutions", label: "Solutions" },
  { id: "dog-locations", label: "Locations map" },
  { id: "dog-journey", label: "Journey" },
  { id: "recent-updates", label: "Updates" },
];

export function GapDetailPage({ slug, section = "overview", workspaceBasePath, articlePath, onOpenArticle, onOpenSection, onNavigate, onOpenAbout, onOpenGap, onOpenUpdates, onOpenSources, onOpenWork, onOpenReport, onOpenStory, onOpenAction, onOpenActionDetail }: GapDetailPageProps) {
  const gap = gaps.find((item) => item.slug === slug);

  if (!gap) {
    return (
      <main className="gap-detail-page gap-page">
        <section className="gap-refined-hero">
          <PublicSiteNav active="reality" onNavigate={onNavigate} onOpenAbout={onOpenAbout} variant="dark" />
          <div className="gap-detail-copy gap-refined-copy">
            <p className="gap-severity"> Gap not found</p>
            <h1>We could not find that gap.</h1>
            <p>This record may have moved, been retired, or not been added to the public data yet.</p>
            <button className="gap-back-link" type="button" onClick={() => onNavigate("reality")}>
               Back to all gaps
            </button>
          </div>
        </section>
      </main>
    );
  }

  const organizationIds = gap.responder_roles?.length
    ? gap.responder_roles.map((role) => role.organization_id)
    : gap.organization_ids;
  const relatedOrgs = organizationIds
    .map((id) => orgs.find((org) => org.id === id))
    .filter((org): org is OrgRecord => Boolean(org));
  const relatedRecords = recordsForGap(gap);
  const sourceList = uniqueSources(gap.sources as SourceLike[], relatedRecords);
  const stateItems = gap.current_state_items ?? [];
  const currentAsOf = latestCheckedDate(relatedRecords) || gap.updated_at;
  const recentUpdates = gapUpdates(gap).slice(0, gap.id === "dogs-safe-placement" ? 5 : 8);
  const actionCards = visibleActions(gap);
  const orderedActionCards = orderActionsForBottom(actionCards, gap);
  const stateReport = stateReportCopy(gap);
  const workItems = (gap.work_ids ?? [])
    .map((id) => work.find((item) => item.id === id))
    .filter((item): item is WorkRecord => Boolean(item));
  const relatedStories = gap.story_ids
    .map((id) => stories.find((story) => story.id === id && story.active))
    .filter((story): story is StoryRecord => Boolean(story))
    .slice(0, 3);
  const representativeSources = representativeSourcesForGap(gap, sourceList, relatedRecords);
  const gapIndex = activeGaps.findIndex((item) => item.id === gap.id);
  const previousGap = gapIndex > 0 ? activeGaps[gapIndex - 1] : undefined;
  const nextGap = gapIndex >= 0 && gapIndex < activeGaps.length - 1 ? activeGaps[gapIndex + 1] : undefined;
  const isDogGap = gap.id === "dogs-safe-placement";

  if (onOpenSection) return <main className={`gap-page dog-gap-page is-${gap.investigation_status}${isDogGap && workspaceBasePath ? " crossover-workspace-app" : ""}`}>
    {!isDogGap && <PublicSiteNav active="reality" onNavigate={onNavigate} onOpenAbout={onOpenAbout} variant="dark" />}
    <DogGapExperience gap={gap} section={section} workspaceBasePath={workspaceBasePath} articlePath={articlePath} onOpenArticle={onOpenArticle} onOpenSection={(next, anchor) => onOpenSection(gap.slug, next, anchor)} onOpenGap={onOpenGap} onNavigate={onNavigate} onOpenWork={onOpenWork} onOpenReport={onOpenReport} onOpenAction={onOpenAction} onOpenActionDetail={onOpenActionDetail} />
    {!isDogGap && <footer className="public-footer"><div className="footer-logo" aria-label="Crossover"><picture><source media="(max-width: 760px)" srcSet={logoDark} /><img src={logoLight} alt="" /></picture><span>Crossover</span></div><span>© 2026 Crossover Stockton</span><p>Reality. Connection. Action.</p><button type="button" onClick={() => onNavigate("reality")}>Needs</button><button type="button" onClick={() => onNavigate("action")}>Action</button><button type="button" onClick={onOpenAbout}>About</button></footer>}
  </main>;

  return (
    <main className={`gap-detail-page gap-page is-${gap.investigation_status}${isDogGap ? " dog-equation-page" : ""}`}>
      <section className="gap-refined-hero">
        <PublicSiteNav active="reality" onNavigate={onNavigate} onOpenAbout={onOpenAbout} variant="dark" />
        <GapPageToolbar
          onNavigate={onNavigate}
          onOpenGap={onOpenGap}
          currentIndex={gapIndex}
          total={activeGaps.length}
          previousGap={previousGap}
          nextGap={nextGap}
        />
        <div className={isDogGap ? "work-page-grid dog-page-grid" : "gap-detail-grid-wrap"}>
          {isDogGap && <WorkSectionNav items={dogGapNavItems} />}
        <div className="gap-refined-hero-grid">
          <div className="gap-refined-hero-intro">
            <div className="gap-detail-copy gap-refined-copy">
              <section className="gap-hero-summary-card" id={isDogGap ? "gap-overview" : undefined} aria-label="Gap summary">
                <span className="gap-level"> {investigationStatusLabel(gap.investigation_status)}</span>
                <h1>{gap.title}</h1>
                <p className="gap-mobile-body">{gap.summary}</p>
                <div className="gap-detail-meta" aria-label="Gap record metadata">
                  <span> {gap.sources.length} sources</span>
                  <button type="button" onClick={() => onOpenSources(gap.slug)}> View sources</button>
                  <span> {relatedOrgs.length} organizations</span>
                  {gap.updated_at && <span> Record updated <strong>{formatDate(gap.updated_at)}</strong></span>}
                </div>
              </section>
            </div>
            <div className="gap-refined-photo">
              {gap.artwork && <img src={gap.artwork} alt="" aria-hidden="true" loading="eager" decoding="sync" fetchPriority="high" />}
            </div>
          </div>

          {isDogGap ? (
            <div className="gap-refined-left-column"><DogGapOverview onOpenWork={onOpenWork} onOpenSources={() => onOpenSources(gap.slug)} /></div>
          ) : <div className="gap-refined-left-column">
            <div className="gap-refined-main-column">
              <GapFlowSection gap={gap} />
              {workItems.length > 0 && <WorkSection items={workItems} gap={gap} onOpenWork={onOpenWork} />}
            </div>

            {relatedOrgs.length > 0 && (
              <section className="gap-refined-card gap-responding-rail">
                <div className="gap-card-heading">
                  <div>
                    <h2>Who's responding</h2>
                    <p className="gap-mobile-body">Organizations identified in public sources or Crossover's work.</p>
                  </div>
                  <button className="gap-card-link gap-info-card-link" type="button" onClick={() => onNavigate("organizations")}>See all </button>
                </div>
                <div className="gap-refined-org-list">
                  {relatedOrgs.map((org) => {
                    const href = org.website || org.source_url;
                    const responderRole = roleForOrg(gap, org.id);
                    return (
                      <a className="gap-refined-org-row gap-info-card" href={href || undefined} target={href ? "_blank" : undefined} rel={href ? "noreferrer" : undefined} key={org.id}>
                        
                        <span>
                          <strong>{org.name}</strong>
                          <span className="gap-mobile-body">{responderRole?.label || org.summary}</span>
                          <em className="gap-info-card-link">Visit their website </em>
                        </span>
                      </a>
                    );
                  })}
                </div>
              </section>
            )}
          </div>}

          <aside className="gap-refined-side-column">
            {recentUpdates.length > 0 && (
              <section className="gap-refined-card gap-learning-card" id="recent-updates">
                <div className="gap-card-heading">
                  <div>
                    <h2>Latest updates</h2>
                    <p className="gap-mobile-body">What’s happening now</p>
                    <span>New evidence, activity, and changes around this gap.</span>
                  </div>
                </div>
                <div className="gap-update-list">
                  {recentUpdates.map((update) => <RecentUpdateItem update={update} onOpenWork={onOpenWork} onOpenReport={onOpenReport} key={update.id} />)}
                </div>
                <button className="gap-card-link gap-updates-footer-link" type="button" onClick={() => onOpenUpdates(gap.slug)}>View all updates </button>
              </section>
            )}

          </aside>
        </div>
        </div>
      </section>

      {!isDogGap && <section className="gap-refined-content">
        <div className="gap-refined-lower-columns">
          {orderedActionCards.length > 0 && (
            <section className="gap-refined-column gap-refined-action-band">
              <div className="gap-refined-section-heading">
                <h2>What can I do right now?</h2>
                <p className="gap-mobile-body">Possible ways to help or learn more. Check current availability with the provider; Crossover is documenting what happens.</p>
              </div>
              <div className="gap-refined-action-grid">
                <FeaturedActionCard action={orderedActionCards[0]} gap={gap} onOpenAction={onOpenAction} />
                <div className="gap-refined-secondary-actions">
                  {orderedActionCards.slice(1, 4).map((action) => <ActionCard action={action} onOpenAction={onOpenAction} key={action.id} />)}
                </div>
              </div>
              <button className="gap-card-link gap-info-card-link" type="button" onClick={() => onNavigate("action")}>See all actions </button>
            </section>
          )}

          {relatedStories.length > 0 && (
            <section className="gap-refined-column gap-change-column">
              <div className="gap-refined-section-heading">
                <h2>Signs of change</h2>
                <p className="gap-mobile-body">Reported developments related to this need.</p>
              </div>
              <div className="gap-refined-story-row">
                {relatedStories.map((story) => (
                  <button className={`gap-refined-story-card ${story.image ? "" : "has-no-image"}`} type="button" onClick={() => onOpenStory(story.slug)} key={story.id}>
                    {story.image && <img src={story.image} alt="" aria-hidden="true" loading="lazy" decoding="async" />}
                    <span>
                      <strong>{story.title}</strong>
                      <span className="gap-mobile-body">{story.summary}</span>
                      <em>{formatDate(story.published_at)} · {story.source_label || "Source"}</em>
                    </span>
                  </button>
                ))}
              </div>
              <button className="gap-card-link gap-info-card-link" type="button" onClick={() => onNavigate("connection")}>See all </button>
            </section>
          )}
        </div>

        {representativeSources.length > 0 && (
          <section className="gap-refined-sources" id="gap-sources">
            <div className="gap-refined-section-heading">
              <h2>Sources &amp; evidence</h2>
            </div>
            <div className="gap-refined-sources-main">
              
              <span>
                <strong>Sources and evidence</strong>
                <span className="gap-mobile-body">{gap.sources.length} sources inform this gap, including local reports, organizational updates, and news coverage.</span>
              </span>
            </div>
            <button className="gap-card-link" type="button" onClick={() => onOpenSources(gap.slug)}>View all sources </button>
          </section>
        )}
      </section>}

      <div className="page-bottom-back-row">
        <button className="page-bottom-back" type="button" onClick={() => onNavigate("reality")}>
           Back to gaps
        </button>
      </div>

      <footer className="public-footer">
        <div className="footer-logo" aria-label="Crossover">
          <picture>
            <source media="(max-width: 760px)" srcSet={logoDark} />
            <img src={logoLight} alt="" decoding="async" />
          </picture>
          <span>Crossover</span>
        </div>
        <span>© 2026 Crossover Stockton</span>
        <p>Reality. Connection. Action.</p>
        <button type="button" className="is-active" onClick={() => onNavigate("reality")}>Needs</button>
        <button type="button" onClick={() => onNavigate("action")}>Action</button>
        <button type="button" onClick={onOpenAbout}>About</button>
      </footer>
    </main>
  );
}

function RecentUpdateItem({
  update,
  onOpenWork,
  onOpenReport,
}: {
  update: GapUpdateEntry;
  onOpenWork: (workId: string, anchor?: string) => void;
  onOpenReport: (reportId: string) => void;
}) {
  const destination = update.destination;
  const href = gapUpdateHref(destination);
  const sourceAction = href ? (
    <a
      className="gap-update-source-link"
      href={href}
      target={destination?.kind === "external" && !href.startsWith("/") ? "_blank" : undefined}
      rel={destination?.kind === "external" && !href.startsWith("/") ? "noreferrer" : undefined}
      onClick={destination?.kind === "report"
        ? (event) => navigateInternalLink(event, () => onOpenReport(destination.id))
        : destination?.kind === "work"
          ? (event) => navigateInternalLink(event, () => onOpenWork(destination.id, destination.anchor))
          : undefined}
    >
      <small>{update.linkLabel} </small>
    </a>
  ) : null;

  const content = (
    <>
      <span className="gap-update-meta">
        <time className="gap-update-date" dateTime={update.date}>{update.dateContext ? `${update.dateContext} ` : ""}{formatDate(update.date)}</time>
        <span className="gap-update-kicker">
          <em>{update.typeLabel}</em>
        </span>
      </span>
      <span className="gap-update-card-body">
        <strong>{update.title}</strong>
        <p className="gap-mobile-body">{update.summary}</p>
        {sourceAction}
      </span>
    </>
  );

  return <div className={`gap-update-compact${update.crossover ? " is-crossover" : ""}`}>{content}</div>;
}

function GapPageToolbar({
  onNavigate,
  onOpenGap,
  currentIndex,
  total,
  previousGap,
  nextGap,
}: {
  onNavigate: (page: PublicRoute) => void;
  onOpenGap: (slug: string) => void;
  currentIndex: number;
  total: number;
  previousGap?: GapRecord;
  nextGap?: GapRecord;
}) {
  return (
    <div className="gap-page-toolbar">
      <div className="gap-page-toolbar-inner">
        <button className="gap-page-back" type="button" onClick={() => onNavigate("reality")}>
           Back to all gaps
        </button>
        <div className="gap-page-selector" aria-label="Gap navigation">
          <span>Gap {currentIndex >= 0 ? currentIndex + 1 : "—"} of {total}</span>
          <button type="button" aria-label="Previous gap" disabled={!previousGap} onClick={() => previousGap && onOpenGap(previousGap.slug)}>Previous gap</button>
          <button type="button" aria-label="Next gap" disabled={!nextGap} onClick={() => nextGap && onOpenGap(nextGap.slug)}>Next gap</button>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ action, onOpenAction }: { action: PublicActionRecord; onOpenAction: (action: PublicActionRecord) => void }) {
  return (
    <button className="gap-refined-action-card gap-info-card action-card" type="button" onClick={() => onOpenAction(action)}>
      
      <strong>{shortActionTitle(action.title)}</strong>
      <span className="gap-mobile-body">{action.summary}</span>
      <small className="gap-info-card-link">{action.source_url ? actionLinkLabel(action) : "Source not verified" } </small>
    </button>
  );
}

function FeaturedActionCard({
  action,
  gap,
  onOpenAction,
}: {
  action: PublicActionRecord;
  gap: GapRecord;
  onOpenAction: (action: PublicActionRecord) => void;
}) {
  return (
    <button className="gap-refined-featured-action" type="button" onClick={() => onOpenAction(action)}>
      <img src={gap.thumbnail_image || gap.artwork} alt="" aria-hidden="true" loading="lazy" decoding="async" />
      <span className="gap-refined-featured-action-copy">
        <small>Featured action</small>
        <strong>{shortActionTitle(action.title)}</strong>
        <span className="gap-mobile-body">{action.summary}</span>
        <em>{shortActionTitle(action.title)} </em>
      </span>
    </button>
  );
}

function WorkSection({ items, gap, onOpenWork }: { items: WorkRecord[]; gap: GapRecord; onOpenWork: (workId: string) => void }) {
  return (
    <section className="gap-work-section">
      <div className="gap-work-heading">
        <span>Crossover's work</span>
        <h2>What we're doing</h2>
        <p className="gap-mobile-body">We're reviewing evidence, investigating unmet needs, and documenting what happens when we take action.</p>
      </div>
      <div className="gap-work-list">
        {items.map((item, index) => {
          const { description, progress } = gapWorkSummary(item);
          return (
            <a className="gap-work-item" href={`/work/${item.id}/`} key={item.id} onClick={(event) => navigateInternalLink(event, () => onOpenWork(item.id))}>
              <div>
                <strong>{item.title}</strong>
                <p className="gap-mobile-body">{description}</p>
                {progress && <small className="gap-work-progress"><span className="gap-work-progress-label">{progress.label}:</span> {progress.text}{progress.date && <> · {formatDate(progress.date)}</>}</small>}
              </div>
              <span className={`gap-work-status is-${item.status}`}>{item.page_kind === "research" && item.status === "in_progress" ? "Ongoing" : workStatusLabel(item.status)}</span>
              <span className="gap-work-index" aria-hidden="true">{index + 1}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

function workStatusLabel(status: WorkRecord["status"]) {
  if (status === "in_progress") return "In progress";
  if (status === "next") return "Next";
  return "Completed";
}

function HowGapGetsStuck({ gap }: { gap: GapRecord }) {
  const steps = gap.what_we_are_seeing.slice(0, 4).map((point, index) => {
    const parts = point.split(/,\s+|:\s+/);
    const label = parts.length > 1 ? `${parts[0]}.` : compactInsightTitle(point);
    const text = parts.length > 1 ? parts.slice(1).join(", ") : point;
    return { label, text };
  });

  return (
    <section className="gap-stuck-section">
      <div className="gap-card-heading">
        <span>What we're seeing</span>
      </div>
      <div className="gap-stuck-flow">
        {steps.map((step) => (
          <article className="gap-stuck-card" key={step.label}>
            
            <div className="gap-stuck-main">
              <h3>{step.label}</h3>
              <p className="gap-mobile-body">{step.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function GapFlowSection({ gap }: { gap: GapRecord }) {
  const factors = gap.contributing_factors;
  const steps = gap.id === "dogs-safe-placement" ? [
    {
      label: "Are dogs reaching the right responders?",
      text: "Public reports describe stray and abandoned dogs in Stockton. We're checking what happens after a dog is reported and whether care is reached.",
    },
    {
      label: "Where does care capacity narrow?",
      text: "City records report shelter intake pressure. We're investigating how shelter space, veterinary care, and foster options affect individual dogs.",
    },
    {
      label: "What helps dogs reach safe placement?",
      text: "Public sources describe foster, adoption, and rescue pathways. We're checking their current availability and what happens when people try to use them.",
    },
  ] : [
    {
      label: "What public sources report",
      text: gap.what_we_are_seeing[0] || gap.current_state || gap.summary,
      evidence: gap.current_state_items?.[0],
    },
    {
      label: "Possible limits on access",
      text: factors.length
        ? `${factors.map(compactFactor).join(". ")}.`
        : gap.what_we_are_seeing[1] || gap.summary,
      factors,
    },
    {
      label: "What remains to be checked",
      text: gap.what_we_are_seeing[1] || gap.current_state || gap.summary,
      evidence: gap.current_state_items?.[2] || gap.current_state_items?.[1],
    },
  ];

  return (
    <section className="gap-flow-section">
      <div className="gap-flow-heading">
        <span>Possible barriers to care</span>
      </div>
      <p className="gap-flow-intro gap-mobile-body">{gap.investigation_status === "investigating"
        ? "AI identified these possible barriers through public information. We're investigating which ones affect dogs in Stockton, how they operate, and what actually helps."
        : "AI identified these possible barriers through public information. Crossover has not yet investigated how they operate locally or which responses help."}</p>
      <div className="gap-flow-steps">
        {steps.map((step) => (
          <article key={step.label}>
            
            <div>
              <strong>{step.label}</strong>
              <p className="gap-mobile-body">{step.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function compactInsightTitle(text: string) {
  const words = text.replace(/[.!?]+$/, "").split(/\s+/);
  if (words.length <= 7) return text.replace(/[.!?]+$/, "");
  return `${words.slice(0, 7).join(" ")}…`;
}

function stateReportCopy(gap: GapRecord) {
  const subject = statusSubject(gap);
  const status = formatStatus(gap.status).toLowerCase();
  const criteria = stateCriteriaPhrase(gap.current_state_items ?? []);
  const impact = statusImpactPhrase(gap);

  return {
    headline: `A ${status} situation exists for ${subject}.`,
    summary: `${sentenceCase(criteria)} ${impact}.`,
  };
}

function statusSubject(gap: GapRecord) {
  if (gap.id === "dogs-safe-placement") return "dogs already waiting in care";
  if (gap.title.toLowerCase().includes("pet")) return "people and pets trying to reach safety";
  return "the people and organizations closest to this gap";
}

function stateCriteriaPhrase(items: NonNullable<GapRecord["current_state_items"]>) {
  if (!items.length) return "current indicators show limited capacity";

  const labels = items.slice(0, 3).map((item) => {
    const label = item.label.toLowerCase();
    if (label.includes("shelter capacity")) return "limited shelter space";
    if (label.includes("spay") || label.includes("neuter")) return label;
    if (label.includes("placement capacity")) return "limited placement options";
    if (item.value.toLowerCase().includes("constrain")) return `constrained ${label}`;
    if (item.value.toLowerCase().includes("exceed")) return `${label} exceeds capacity`;
    return label;
  });

  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
}

function sentenceCase(value: string) {
  return value ? value[0].toUpperCase() + value.slice(1) : value;
}

function statusImpactPhrase(gap: GapRecord) {
  if (gap.id === "dogs-safe-placement") {
    return "are keeping pressure high across Stockton's animal-welfare system";
  }

  if (gap.status === "improving") {
    return "show progress while remaining needs still require attention";
  }

  if (gap.status === "monitored") {
    return "keep this issue on the local watch list";
  }

  return "limit the system's ability to respond quickly and safely";
}

function recordsForGap(gap: GapRecord) {
  if (gap.record_ids?.length) {
    return gap.record_ids
      .map((id) => records.find((record) => record.id === id))
      .filter((record): record is EvidenceRecord => Boolean(record));
  }
  return records.filter((record) => record.gap_ids.includes(gap.id));
}

function visibleActions(gap: GapRecord) {
  const relatedActions = gap.action_ids
    .map((id) => actions.find((action) => action.id === id && action.active))
    .filter((action): action is PublicActionRecord => Boolean(action));
  if (gap.id === "dogs-safe-placement") return relatedActions.filter((action) => ["check-reported-stray-dog-area", "doggie-day-out", "foster-a-dog", "adopt-a-dog"].includes(action.id));
  const primaryIds = new Set(gap.most_useful_now?.action_ids ?? []);
  const primary = relatedActions.filter((action) => primaryIds.has(action.id));
  const supporting = relatedActions.filter((action) =>
    !primaryIds.has(action.id) &&
    action.currentness !== "unverified" &&
    action.featured &&
    (gap.id !== "dogs-safe-placement" || ["doggie-day-out", "donate-dog-supplies"].includes(action.id))
  );
  return [...primary, ...supporting].slice(0, 4);
}

function orderActionsForBottom(actionCards: PublicActionRecord[], gap: GapRecord) {
  if (gap.id !== "dogs-safe-placement") return actionCards;
  const preferredOrder = ["check-reported-stray-dog-area", "report-a-stray-dog", "doggie-day-out", "foster-a-dog", "adopt-a-dog", "donate-dog-supplies"];
  const rank = (id: string) => { const index = preferredOrder.indexOf(id); return index === -1 ? preferredOrder.length : index; };
  return [...actionCards].sort((a, b) => rank(a.id) - rank(b.id));
}

function roleForOrg(gap: GapRecord, organizationId: string): ResponderRole | undefined {
  return gap.responder_roles?.find((role) => role.organization_id === organizationId);
}

function representativeSourcesForGap(gap: GapRecord, sourceList: SourceLike[], recordsForCurrentGap: EvidenceRecord[]) {
  const preferredByGap: Record<string, string[]> = {
    "pet-inclusive-shelter": [
      "sjc-2024-pit-pet-ownership",
      "stockton-2026-05-15-pit-pet-question",
      "smcs-standing-pathways-pet-inclusive",
      "ssd-2026-06-08-safe-grounds",
    ],
  };
  const preferredRecords = (preferredByGap[gap.id] ?? [])
    .map((id) => recordsForCurrentGap.find((record) => record.id === id))
    .filter((record): record is EvidenceRecord => Boolean(record))
    .map((record) => ({
      title: record.title,
      publisher: record.source.publisher,
      url: record.source.url,
      published_at: record.published_at,
      checked_at: record.checked_at,
      type: record.source.type,
    }));
  const combined = uniqueSources(preferredRecords, recordsForCurrentGap);
  const preferredLimit = gap.id === "pet-inclusive-shelter" ? 4 : 3;
  return (preferredRecords.length ? combined : sourceList).slice(0, preferredLimit);
}

function uniqueSources(gapSources: SourceLike[], evidenceRecords: EvidenceRecord[]) {
  const sourceMap = new Map<string, SourceLike>();
  [...gapSources, ...evidenceRecords.map((record) => ({
    title: record.title,
    publisher: record.source.publisher,
    url: record.source.url,
    published_at: record.published_at,
    checked_at: record.checked_at,
    type: record.source.type,
  }))].forEach((source) => {
    if (!source.url) return;
    if (!sourceMap.has(source.url)) sourceMap.set(source.url, source);
  });
  return Array.from(sourceMap.values());
}

function latestCheckedDate(recordsForCurrentGap: EvidenceRecord[]) {
  const latest = recordsForCurrentGap
    .map((record) => record.checked_at)
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => dateValue(b) - dateValue(a))[0];
  return latest;
}

function openExternal(url?: string) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

function formatStatus(status: GapRecord["status"]) {
  if (status === "high_priority") return "High Priority";
  if (status === "monitored") return "Monitored";
  return status[0].toUpperCase() + status.slice(1);
}

function compactFactor(value: string) {
  return value
    .replace("Animal overpopulation and unplanned litters", "Limited foster homes")
    .replace("Shelter and placement capacity pressure", "Shelter space constraints")
    .replace("Abandonment and stray intake", "High community intake")
    .replace("Limited access to affordable and timely veterinary care", "Medical capacity limits")
    .replace("Insufficient foster, rescue, and permanent placement", "Low-cost vet access gaps")
    .replace("Limited spay and neuter capacity", "Spay/neuter bottlenecks");
}

function shortActionTitle(title: string) {
  return title.replace("Take a shelter dog out", "Doggie Day Out").replace("Donate dog supplies", "Donate supplies");
}

function actionLinkLabel(action: PublicActionRecord) {
  if (action.id.includes("adopt")) return "See adoptable dogs";
  if (action.id.includes("doggie")) return "Sign up";
  if (action.id.includes("donate")) return "See needs list";
  return "Learn how";
}

function formatSourceDate(source: SourceLike) {
  if (source.published_at) return formatDate(source.published_at);
  if (source.checked_at) return `checked ${formatDate(source.checked_at)}`;
  return source.type || "source";
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = parseDisplayDate(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function formatShortDate(value?: string | null) {
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

function dateValue(value?: string | null) {
  if (!value) return 0;
  return parseDisplayDate(value).getTime();
}
