import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  FileText,
  Gauge,
  Heart,
  Home,
  MapPin,
  Menu,
  PawPrint,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import actionsData from "../data/actions.json";
import gapsData from "../data/gaps.json";
import orgsData from "../data/orgs.json";
import recordsData from "../data/records.json";
import storiesData from "../data/stories.json";
import { getActionIcon } from "../lib/actionIcons";
import type { EvidenceRecord, GapRecord, OrgRecord, PublicActionRecord, StoryRecord } from "../types";

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
const logoDark = "/images/logo_dark.png";
const logoLight = "/images/logo_light.png";
const stateIcons = [AlertCircle, BarChart3, Home];
const updateIcons = [AlertCircle, Gauge, CheckCircle2];

export function GapDetailPage({ slug, onNavigate, onOpenAbout, onOpenUpdates, onOpenSources, onOpenStory, onOpenAction }: GapDetailPageProps) {
  const gap = gaps.find((item) => item.slug === slug);

  if (!gap) {
    return (
      <main className="gap-detail-page gap-refined-page">
        <section className="gap-refined-hero">
          <PublicNav onNavigate={onNavigate} onOpenAbout={onOpenAbout} />
          <div className="gap-detail-copy gap-refined-copy">
            <button className="gap-back-link" type="button" onClick={() => onNavigate("reality")}>
              <ArrowLeft size={16} /> Back to all gaps
            </button>
            <p className="gap-severity"><AlertCircle size={18} /> Gap not found</p>
            <h1>We could not find that gap.</h1>
            <p>This record may have moved, been retired, or not been added to the public data yet.</p>
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
  const recentUpdates = latestUpdates(gap, relatedRecords).slice(0, 3);
  const actionCards = visibleActions(gap);
  const relatedStories = gap.story_ids
    .map((id) => stories.find((story) => story.id === id && story.active))
    .filter((story): story is StoryRecord => Boolean(story))
    .slice(0, 3);
  const representativeSources = representativeSourcesForGap(gap, sourceList, relatedRecords);

  return (
    <main className={`gap-detail-page gap-refined-page is-${gap.status}`}>
      <section className="gap-refined-hero">
        <PublicNav onNavigate={onNavigate} onOpenAbout={onOpenAbout} />
        <div className="gap-refined-hero-grid">
          <div className="gap-detail-copy gap-refined-copy">
            <p className="gap-severity">{renderStatusIcon(gap.status)} {formatStatus(gap.status)} gap</p>
            <h1>{gap.title}</h1>
            <p>{gap.summary}</p>
            <div className="gap-detail-meta" aria-label="Gap record metadata">
              <span><FileText size={17} /> {gap.sources.length} sources</span>
              <button type="button" onClick={() => onOpenSources(gap.slug)}><ExternalLink size={16} /> View sources</button>
              <span><Users size={18} /> {relatedOrgs.length} organizations</span>
              <span><ShieldCheck size={18} /> Confidence: <strong>{gap.most_useful_now?.confidence ?? "High"}</strong></span>
              {gap.updated_at && <span><CheckCircle2 size={18} /> Last updated <strong>{formatDate(gap.updated_at)}</strong></span>}
            </div>
            <button className="gap-back-link" type="button" onClick={() => onNavigate("reality")}>
              <ArrowLeft size={16} /> Back to all gaps
            </button>
          </div>
          <div className="gap-refined-photo">
            {gap.artwork && <img src={gap.artwork} alt="" aria-hidden="true" loading="eager" decoding="sync" fetchPriority="high" />}
          </div>
        </div>
      </section>

      <section className="gap-refined-content">
        <div className="gap-refined-top-row">
          {stateItems.length > 0 && (
            <section className="gap-refined-card gap-state-card">
              <h2>Current state</h2>
              <div className="gap-state-list">
                {stateItems.map((item, index) => {
                  const Icon = stateIcons[index % stateIcons.length];
                  return (
                    <article className="gap-state-item" key={item.label}>
                      <Icon size={24} />
                      <span>
                        <strong>{item.label}</strong>
                        <small>{item.detail}</small>
                      </span>
                      <b>{item.value}</b>
                    </article>
                  );
                })}
              </div>
              {currentAsOf && <small className="gap-card-date">Data current as of {formatDate(currentAsOf)}</small>}
            </section>
          )}

          {relatedOrgs.length > 0 && (
            <section className="gap-refined-card">
              <h2>Who's responding</h2>
              <div className="gap-refined-org-list">
                {relatedOrgs.map((org, index) => {
                  const Icon = getOrgIcon(index);
                  const href = org.website || org.source_url;
                  const responderRole = roleForOrg(gap, org.id);
                  return (
                    <button className="gap-refined-org-row" type="button" key={org.id} onClick={() => openExternal(href)}>
                      <Icon size={30} />
                      <span>
                        <strong>{org.name}</strong>
                        <small>{responderRole?.label || org.summary}</small>
                        {responderRole?.current_role && (
                          <small className="gap-responder-current-role">
                            <b>Current role:</b> {responderRole.current_role}
                          </small>
                        )}
                      </span>
                      <div className="gap-refined-org-link">
                        <em>Visit their website</em>
                        <ArrowRight size={15} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {recentUpdates.length > 0 && (
            <section className="gap-refined-card" id="recent-updates">
              <h2>Recent updates</h2>
              <div className="gap-update-list">
                {recentUpdates.map((record, index) => {
                  const Icon = updateIcons[index % updateIcons.length];
                  const dateLabel = recordDateLabel(record);
                  return (
                    <RecentUpdateItem record={record} Icon={Icon} dateLabel={dateLabel} key={record.id} />
                  );
                })}
              </div>
              <button className="gap-card-link" type="button" onClick={() => onOpenUpdates(gap.slug)}>View update history <ArrowRight size={15} /></button>
            </section>
          )}
        </div>

        {actionCards.length > 0 && (
          <section className="gap-refined-action-band">
            <div className="gap-refined-action-copy">
              <h2>What can I do right now?</h2>
              {gap.most_useful_now ? (
                <p>Most useful right now: <strong>{gap.most_useful_now.label}</strong></p>
              ) : (
                <p>Use the strongest currently supported actions from public sources.</p>
              )}
            </div>
            <div className="gap-refined-action-grid">
              {actionCards.map((action) => <ActionCard action={action} onOpenAction={onOpenAction} key={action.id} />)}
            </div>
          </section>
        )}

        <div className="gap-refined-lower-row">
          {gap.contributing_factors.length > 0 && (
            <section className="gap-card-section">
              <h2>What seems to be contributing</h2>
              <ul className="gap-factor-pills">
                {gap.contributing_factors.slice(0, 6).map((item, index) => {
                  const Icon = factorIcon(index);
                  return (
                    <li key={item}><Icon size={17} /> {compactFactor(item)}</li>
                  );
                })}
              </ul>
            </section>
          )}

          {relatedStories.length > 0 && (
            <section className="gap-card-section">
              <h2>Signs of change</h2>
              <div className="gap-refined-story-row">
                {relatedStories.map((story) => (
                  <button className={`gap-refined-story-card ${story.image ? "" : "has-no-image"}`} type="button" onClick={() => onOpenStory(story.slug)} key={story.id}>
                    {story.image && <img src={story.image} alt="" aria-hidden="true" loading="lazy" decoding="async" />}
                    <span>
                      <strong>{story.title}</strong>
                      <small>{story.summary}</small>
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
            <h2>Evidence & sources</h2>
            <div className="gap-refined-source-row">
              {representativeSources.map((source) => (
                <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>
                  <FileText size={28} />
                  <span>
                    <strong>{source.title || source.publisher || "Source"}</strong>
                    <small>{formatSourceDate(source)} · {source.publisher || "Public source"}</small>
                  </span>
                </a>
              ))}
            </div>
            <button className="gap-card-link" type="button" onClick={() => onOpenSources(gap.slug)}>View all sources <ArrowRight size={15} /></button>
          </section>
        )}
      </section>

      <footer className="public-footer">
        <div className="footer-logo" aria-label="Crossover">
          <img src={logoDark} alt="" decoding="async" />
          <span>Crossover</span>
        </div>
        <span>© 2026 Crossover Stockton</span>
        <p>Reality. Connection. Action.</p>
        <button type="button" onClick={onOpenAbout}>About</button>
        <button type="button" onClick={() => onNavigate("action")}>Action</button>
        <a href="http://www.linkedin.com/in/jeff-kolyer" target="_blank" rel="noreferrer">Contact</a>
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
  const content = (
    <>
      <Icon size={22} />
      <strong>{record.title}</strong>
      <span>
        {dateLabel.context && <small>{dateLabel.context}</small>}
        <time>{dateLabel.date}</time>
      </span>
    </>
  );

  if (record.source.url) {
    const isInternalUrl = record.source.url.startsWith("/");
    return (
      <a
        className={`gap-update-compact is-${record.record_type}`}
        href={record.source.url}
        target={isInternalUrl ? undefined : "_blank"}
        rel={isInternalUrl ? undefined : "noreferrer"}
      >
        {content}
      </a>
    );
  }

  return <div className={`gap-update-compact is-${record.record_type}`}>{content}</div>;
}

function PublicNav({ onNavigate, onOpenAbout }: Pick<GapDetailPageProps, "onNavigate" | "onOpenAbout">) {
  return (
    <header className="public-nav gap-detail-nav">
      <button className="public-mobile-menu" type="button" aria-label="Open navigation">
        <Menu size={24} />
      </button>
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
    <button className="gap-refined-action-card" type="button" onClick={() => onOpenAction(action)}>
      <Icon size={32} />
      <strong>{shortActionTitle(action.title)}</strong>
      <span>{action.summary}</span>
      <small>{action.source_url ? actionLinkLabel(action) : "Source not verified" } <ArrowRight size={14} /></small>
    </button>
  );
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

function roleForOrg(gap: GapRecord, organizationId: string): ResponderRole | undefined {
  return gap.responder_roles?.find((role) => role.organization_id === organizationId);
}

function latestUpdates(gap: GapRecord, recordsForCurrentGap: EvidenceRecord[]) {
  const preferredByGap: Record<string, string[]> = {
    "dogs-safe-placement": ["sas-standing-doggie-day-out", "ssd-standing-foster-adopt"],
    "pet-inclusive-shelter": ["ssd-2026-06-08-safe-grounds", "stockton-2026-05-15-pit-pet-question"],
  };
  const preferredIds = [gap.latest_change?.record_id, ...(preferredByGap[gap.id] ?? [])].filter((id): id is string => Boolean(id));
  const preferred = new Set(preferredIds);
  const picked = preferredIds
    .map((id) => recordsForCurrentGap.find((record) => record.id === id))
    .filter((record): record is EvidenceRecord => Boolean(record));
  const remaining = recordsForCurrentGap
    .filter((record) => !preferred.has(record.id))
    .sort((a, b) => recordTime(b) - recordTime(a));
  return [...picked, ...remaining].filter((record, index, all) => all.findIndex((item) => item.id === record.id) === index);
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
  if (status === "watch") return "Watch";
  return status[0].toUpperCase() + status.slice(1);
}

function renderStatusIcon(status: GapRecord["status"]) {
  if (status === "improving") return <CheckCircle2 size={18} />;
  if (status === "high") return <AlertTriangle size={18} />;
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
  if (record.published_at) return { date: formatShortDate(record.published_at) };
  if (record.checked_at) return { context: "Checked", date: formatShortDate(record.checked_at) };
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
