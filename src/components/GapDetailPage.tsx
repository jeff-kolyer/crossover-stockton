import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Building2,
  BedSingle,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Dog,
  DoorClosed,
  DoorOpen,
  ExternalLink,
  FileText,
  Gauge,
  Heart,
  HeartHandshake,
  Home,
  House,
  KeyRound,
  MapPin,
  PackageOpen,
  PawPrint,
  Plus,
  Refrigerator,
  Route,
  ShieldCheck,
  Stethoscope,
  Truck,
  Users,
} from "lucide-react";
import actionsData from "../data/actions.json";
import gapsData from "../data/gaps.json";
import orgsData from "../data/orgs.json";
import recordsData from "../data/records.json";
import storiesData from "../data/stories.json";
import workData from "../data/work.json";
import type { LucideIcon } from "lucide-react";
import { getActionIcon } from "../lib/actionIcons";
import { sourceLinkLabel } from "../lib/sourceLinks";
import { updateIcon, updateTypeLabel } from "../lib/updatePresentation";
import { PublicMobileMenu } from "./PublicMobileMenu";
import type { EvidenceRecord, GapRecord, OrgRecord, PublicActionRecord, StoryRecord, WorkRecord } from "../types";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";

interface GapDetailPageProps {
  slug?: string;
  onNavigate: (page: PublicRoute) => void;
  onOpenAbout: () => void;
  onOpenGap: (slug: string) => void;
  onOpenUpdates: (slug: string) => void;
  onOpenSources: (slug: string) => void;
  onOpenStory: (slug: string) => void;
  onOpenAction: (action: PublicActionRecord) => void;
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
const stateIcons = [BarChart3, Stethoscope, Users];
const whyIconRegistry: Record<NonNullable<GapRecord["why_icons"]>[number], LucideIcon> = {
  Dog,
  Stethoscope,
  House,
  HeartHandshake,
  PawPrint,
  DoorClosed,
  ClipboardList,
  PackageOpen,
  Refrigerator,
  Truck,
  DoorOpen,
  Users,
  BedSingle,
  Route,
  KeyRound,
};

export function GapDetailPage({ slug, onNavigate, onOpenAbout, onOpenGap, onOpenUpdates, onOpenSources, onOpenStory, onOpenAction }: GapDetailPageProps) {
  const gap = gaps.find((item) => item.slug === slug);

  if (!gap) {
    return (
      <main className="gap-detail-page gap-page">
        <section className="gap-refined-hero">
          <PublicNav onNavigate={onNavigate} onOpenAbout={onOpenAbout} />
          <div className="gap-detail-copy gap-refined-copy">
            <p className="gap-severity"><AlertCircle size={18} /> Gap not found</p>
            <h1>We could not find that gap.</h1>
            <p>This record may have moved, been retired, or not been added to the public data yet.</p>
            <button className="gap-back-link" type="button" onClick={() => onNavigate("reality")}>
              <ArrowLeft size={16} /> Back to all gaps
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
  const recentUpdates = latestUpdates(gap, relatedRecords).slice(0, 5);
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

  return (
    <main className={`gap-detail-page gap-page is-${gap.status}`}>
      <section className="gap-refined-hero">
        <PublicNav onNavigate={onNavigate} onOpenAbout={onOpenAbout} />
        <GapPageToolbar
          onNavigate={onNavigate}
          onOpenGap={onOpenGap}
          currentIndex={gapIndex}
          total={activeGaps.length}
          previousGap={previousGap}
          nextGap={nextGap}
        />
        <div className="gap-refined-hero-grid">
          <div className="gap-refined-hero-intro">
            <div className="gap-detail-copy gap-refined-copy">
              <section className="gap-hero-summary-card" aria-label="Gap summary">
                <span className="gap-level">{renderStatusIcon(gap.status)} {formatStatus(gap.status)} gap</span>
                <h1>{gap.title}</h1>
                <p className="gap-mobile-body">{gap.summary}</p>
                <div className="gap-detail-meta" aria-label="Gap record metadata">
                  <span><FileText size={17} /> {gap.sources.length} sources</span>
                  <button type="button" onClick={() => onOpenSources(gap.slug)}><ExternalLink size={16} /> View sources</button>
                  <span><Users size={18} /> {relatedOrgs.length} organizations</span>
                  <span><ShieldCheck size={18} /> Confidence: <strong>{gap.most_useful_now?.confidence ?? "High"}</strong></span>
                  {gap.updated_at && <span><CheckCircle2 size={18} /> Last updated <strong>{formatDate(gap.updated_at)}</strong></span>}
                </div>
              </section>
            </div>
            <div className="gap-refined-photo">
              {gap.artwork && <img src={gap.artwork} alt="" aria-hidden="true" loading="eager" decoding="sync" fetchPriority="high" />}
            </div>
          </div>

          <div className="gap-refined-left-column">
            <div className="gap-refined-main-column">
              <GapFlowSection gap={gap} />
              {workItems.length > 0 && <WorkSection items={workItems} gap={gap} />}
            </div>

            {relatedOrgs.length > 0 && (
              <section className="gap-refined-card gap-responding-rail">
                <div className="gap-card-heading">
                  <div>
                    <h2>Who's responding</h2>
                    <p className="gap-mobile-body">Organizations working on this gap.</p>
                  </div>
                  <button className="gap-card-link gap-info-card-link" type="button" onClick={() => onNavigate("organizations")}>See all <ArrowRight size={14} /></button>
                </div>
                <div className="gap-refined-org-list">
                  {relatedOrgs.map((org, index) => {
                    const Icon = getOrgIcon(index);
                    const href = org.website || org.source_url;
                    const responderRole = roleForOrg(gap, org.id);
                    return (
                      <a className="gap-refined-org-row gap-info-card" href={href || undefined} target={href ? "_blank" : undefined} rel={href ? "noreferrer" : undefined} key={org.id}>
                        <Icon size={28} />
                        <span>
                          <strong>{org.name}</strong>
                          <span className="gap-mobile-body">{responderRole?.label || org.summary}</span>
                          <em className="gap-info-card-link">Visit their website <ArrowRight size={14} /></em>
                        </span>
                      </a>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

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
                  {recentUpdates.map((record) => {
                    const Icon = updateIcon(record);
                    const dateLabel = recordDateLabel(record);
                    return (
                      <RecentUpdateItem record={record} Icon={Icon} dateLabel={dateLabel} key={record.id} />
                    );
                  })}
                </div>
                <button className="gap-card-link gap-updates-footer-link" type="button" onClick={() => onOpenUpdates(gap.slug)}>View all updates <ArrowRight size={15} /></button>
              </section>
            )}

          </aside>
        </div>
      </section>

      <section className="gap-refined-content">
        <div className="gap-refined-lower-columns">
          {orderedActionCards.length > 0 && (
            <section className="gap-refined-column gap-refined-action-band">
              <div className="gap-refined-section-heading">
                <h2>What can I do right now?</h2>
                <p className="gap-mobile-body">Here are the most useful ways to help right now.</p>
              </div>
              <div className="gap-refined-action-grid">
                <FeaturedActionCard action={orderedActionCards[0]} gap={gap} onOpenAction={onOpenAction} />
                <div className="gap-refined-secondary-actions">
                  {orderedActionCards.slice(1, 4).map((action) => <ActionCard action={action} onOpenAction={onOpenAction} key={action.id} />)}
                </div>
              </div>
            </section>
          )}

          {relatedStories.length > 0 && (
            <section className="gap-refined-column gap-change-column">
              <div className="gap-refined-section-heading">
                <h2>Signs of change</h2>
                <p className="gap-mobile-body">Recent updates show where things are improving.</p>
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
            </section>
          )}
        </div>

        {representativeSources.length > 0 && (
          <section className="gap-refined-sources" id="gap-sources">
            <div className="gap-refined-section-heading">
              <h2>Sources &amp; evidence</h2>
            </div>
            <div className="gap-refined-sources-main">
              <FileText size={30} aria-hidden="true" />
              <span>
                <strong>Sources and evidence</strong>
                <span className="gap-mobile-body">{gap.sources.length} sources inform this gap, including local reports, organizational updates, and news coverage.</span>
              </span>
            </div>
            <button className="gap-card-link" type="button" onClick={() => onOpenSources(gap.slug)}>View all sources <ArrowRight size={15} /></button>
          </section>
        )}
      </section>

      <div className="page-bottom-back-row">
        <button className="page-bottom-back" type="button" onClick={() => onNavigate("reality")}>
          <ArrowLeft size={16} /> Back to gaps
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
  record,
  Icon,
  dateLabel,
}: {
  record: EvidenceRecord;
  Icon: typeof AlertCircle;
  dateLabel: { context?: string; date: string };
}) {
  const sourceAction = record.source.url ? (
    <a
      className="gap-update-source-link"
      href={record.source.url}
      target={record.source.url.startsWith("/") ? undefined : "_blank"}
      rel={record.source.url.startsWith("/") ? undefined : "noreferrer"}
    >
      <small>{sourceLinkLabel(record.source)} <ExternalLink size={14} /></small>
    </a>
  ) : (
    <small>Current state</small>
  );

  const content = (
    <>
      <span className="gap-update-meta">
        <time className="gap-update-date">{dateLabel.date}</time>
        <span className="gap-update-kicker">
          <Icon className="gap-update-type-icon" size={22} />
          <em>{updateTypeLabel(record)}</em>
        </span>
      </span>
      <span className="gap-update-card-body">
        <strong>{record.title}</strong>
                      <p className="gap-mobile-body">{record.summary}</p>
        {sourceAction}
      </span>
    </>
  );

  return <div className={`gap-update-compact is-${record.record_type}`}>{content}</div>;
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
          <ArrowLeft size={15} /> Back to all gaps
        </button>
        <div className="gap-page-selector" aria-label="Gap navigation">
          <span>Gap {currentIndex >= 0 ? currentIndex + 1 : "—"} of {total}</span>
          <button type="button" aria-label="Previous gap" disabled={!previousGap} onClick={() => previousGap && onOpenGap(previousGap.slug)}>
            <ArrowLeft size={16} />
          </button>
          <button type="button" aria-label="Next gap" disabled={!nextGap} onClick={() => nextGap && onOpenGap(nextGap.slug)}>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PublicNav({ onNavigate, onOpenAbout }: Pick<GapDetailPageProps, "onNavigate" | "onOpenAbout">) {
  return (
    <header className="public-nav gap-detail-nav">
      <PublicMobileMenu active="reality" onNavigate={onNavigate} onOpenAbout={onOpenAbout} />
      <button className="public-logo" type="button" aria-label="Crossover home" onClick={() => onNavigate("home")}>
        <img src={logoLight} alt="" decoding="async" />
        <span>Crossover</span>
      </button>
      <nav aria-label="Primary">
        <button type="button" className="is-active" onClick={() => onNavigate("reality")}>Needs</button>
        <button type="button" onClick={() => onNavigate("connection")}>Stories</button>
        <button type="button" onClick={() => onNavigate("action")}>Action</button>
        <button type="button" onClick={() => onNavigate("updates")}>Updates</button>
        <button type="button" onClick={() => onNavigate("organizations")}>Organizations</button>
        <button type="button" onClick={onOpenAbout}>About</button>
      </nav>
      <button className="location-pill" type="button" onClick={() => onNavigate("home")}>
        <MapPin size={16} />
        Stockton, CA
        <ChevronDown size={15} />
      </button>
    </header>
  );
}

function ActionCard({ action, onOpenAction }: { action: PublicActionRecord; onOpenAction: (action: PublicActionRecord) => void }) {
  const Icon = getActionIcon(action);
  return (
    <button className="gap-refined-action-card gap-info-card action-card" type="button" onClick={() => onOpenAction(action)}>
      <Icon size={32} />
      <strong>{shortActionTitle(action.title)}</strong>
      <span className="gap-mobile-body">{action.summary}</span>
      <small className="gap-info-card-link">{action.source_url ? actionLinkLabel(action) : "Source not verified" } <ArrowRight size={14} /></small>
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
        <span className="gap-mobile-body">{action.summary} Fostering gives a dog a safe place to be while they wait for a permanent home.</span>
        <em>{shortActionTitle(action.title)} <ArrowRight size={15} /></em>
      </span>
    </button>
  );
}

function WorkSection({ items, gap }: { items: WorkRecord[]; gap: GapRecord }) {
  return (
    <section className="gap-work-section">
      <div className="gap-work-heading">
        <span>Crossover's work</span>
        <h2>What we're doing</h2>
        <p className="gap-mobile-body">We're researching the causes, listening to local experts, and identifying practical ways to help close this gap.</p>
      </div>
      <div className="gap-work-list">
        {items.map((item, index) => {
          const Icon = workIcon(item.type);
          return (
            <article className="gap-work-item" key={item.id}>
              <span className="gap-work-icon"><Icon size={22} /></span>
              <div>
                <strong>{item.title}</strong>
                <p className="gap-mobile-body">{item.summary}</p>
              </div>
              <span className={`gap-work-status is-${item.status}`}>{workStatusLabel(item.status)}</span>
              <span className="gap-work-index" aria-hidden="true">{index + 1}</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function workIcon(type: WorkRecord["type"]) {
  if (type === "investigation") return MapPin;
  if (type === "field_work") return Users;
  return FileText;
}

function workStatusLabel(status: WorkRecord["status"]) {
  if (status === "in_progress") return "In progress";
  if (status === "next") return "Next";
  return "Completed";
}

function HowGapGetsStuck({ gap }: { gap: GapRecord }) {
  const icons = [Home, Stethoscope, PawPrint, Heart];
  const steps = gap.what_we_are_seeing.slice(0, 4).map((point, index) => {
    const parts = point.split(/,\s+|:\s+/);
    const label = parts.length > 1 ? `${parts[0]}.` : compactInsightTitle(point);
    const text = parts.length > 1 ? parts.slice(1).join(", ") : point;
    return { icon: icons[index] ?? Heart, label, text };
  });

  return (
    <section className="gap-stuck-section">
      <div className="gap-card-heading">
        <span>What we're seeing</span>
      </div>
      <div className="gap-stuck-flow">
        {steps.map((step, index) => (
          <article className="gap-stuck-card" key={step.label}>
            <step.icon size={32} aria-hidden="true" />
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
  const fallbackIcons = ["Dog", "Stethoscope", "HeartHandshake"] as const;
  const steps = [
    {
      icon: whyIconRegistry[gap.why_icons?.[0] ?? fallbackIcons[0]],
      label: gap.id === "dogs-safe-placement" ? "More dogs keep arriving" : "Need keeps entering the system",
      text: gap.what_we_are_seeing[0] || gap.current_state || gap.summary,
      evidence: gap.current_state_items?.[0],
    },
    {
      icon: whyIconRegistry[gap.why_icons?.[1] ?? fallbackIcons[1]],
      label: gap.id === "dogs-safe-placement" ? "Care and foster space are limited" : "Available pathways narrow",
      text: factors.length
        ? `${factors.map(compactFactor).join(". ")}.`
        : gap.what_we_are_seeing[1] || gap.summary,
      factors,
    },
    {
      icon: whyIconRegistry[gap.why_icons?.[2] ?? fallbackIcons[2]],
      label: gap.id === "dogs-safe-placement" ? "Safe placements cannot keep up" : "The gap persists",
      text: gap.what_we_are_seeing[1] || gap.current_state || gap.summary,
      evidence: gap.current_state_items?.[2] || gap.current_state_items?.[1],
    },
  ];

  return (
    <section className="gap-flow-section">
      <div className="gap-flow-heading">
        <span>{gap.id === "dogs-safe-placement" ? "Why dogs get stuck" : "Why this gap gets stuck"}</span>
      </div>
      <div className="gap-flow-steps">
        {steps.map((step) => (
          <article key={step.label}>
            <step.icon className="gap-flow-icon" size={30} aria-hidden="true" />
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
  const primaryIds = new Set(gap.most_useful_now?.action_ids ?? []);
  const primary = relatedActions.filter((action) => primaryIds.has(action.id));
  const supporting = relatedActions.filter((action) => !primaryIds.has(action.id) && action.currentness !== "unverified" && action.featured);
  return [...primary, ...supporting].slice(0, 4);
}

function orderActionsForBottom(actionCards: PublicActionRecord[], gap: GapRecord) {
  if (gap.id !== "dogs-safe-placement") return actionCards;
  const preferredOrder = ["foster-a-dog", "doggie-day-out", "adopt-a-dog", "donate-dog-supplies"];
  return [...actionCards].sort((a, b) => preferredOrder.indexOf(a.id) - preferredOrder.indexOf(b.id));
}

function roleForOrg(gap: GapRecord, organizationId: string): ResponderRole | undefined {
  return gap.responder_roles?.find((role) => role.organization_id === organizationId);
}

function latestUpdates(gap: GapRecord, recordsForCurrentGap: EvidenceRecord[]) {
  return [...recordsForCurrentGap].sort((a, b) => recordTime(b) - recordTime(a));
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

function renderStatusIcon(status: GapRecord["status"]) {
  if (status === "improving") return <CheckCircle2 size={18} />;
  if (status === "high_priority") return <AlertTriangle size={18} />;
  if (status === "monitored") return <ShieldCheck size={18} />;
  return <AlertCircle size={18} />;
}

function getOrgIcon(index: number) {
  return [PawPrint, Heart, Building2, PawPrint][index % 4];
}

function factorIcon(index: number) {
  return [PawPrint, Home, BarChart3, Stethoscope, MapPin, Gauge][index % 6];
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

function recordTime(record: EvidenceRecord) {
  const time = dateValue(record.published_at || record.checked_at);
  return Number.isNaN(time) ? 0 : time;
}

function recordDateLabel(record: EvidenceRecord) {
  if (record.published_at) return { date: formatDate(record.published_at) };
  if (record.checked_at) return { context: "Checked", date: formatDate(record.checked_at) };
  return { date: "Undated" };
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
