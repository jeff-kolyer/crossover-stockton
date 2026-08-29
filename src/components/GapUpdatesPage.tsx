import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  FileText,
  MapPin,
  Menu,
  ShieldCheck,
} from "lucide-react";
import gapsData from "../data/gaps.json";
import recordsData from "../data/records.json";
import type { EvidenceRecord, GapRecord } from "../types";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";

interface GapUpdatesPageProps {
  slug?: string;
  onNavigate: (page: PublicRoute) => void;
  onOpenAbout: () => void;
  onOpenGap: (slug: string) => void;
}

const gaps = gapsData as GapRecord[];
const records = recordsData as EvidenceRecord[];
const logoDark = "/images/logo_dark.png";
const logoLight = "/images/logo_light.png";

export function GapUpdatesPage({ slug, onNavigate, onOpenAbout, onOpenGap }: GapUpdatesPageProps) {
  const gap = gaps.find((item) => item.slug === slug);

  if (!gap) {
    return (
      <main className="gap-updates-page gap-refined-page">
        <PublicNav onNavigate={onNavigate} onOpenAbout={onOpenAbout} />
        <section className="gap-history-header">
          <button className="gap-history-back" type="button" onClick={() => onNavigate("reality")}>
            <ArrowLeft size={16} /> Back to needs
          </button>
          <h1>Updates</h1>
          <p>This gap record may have moved, been retired, or not been added to the public data yet.</p>
        </section>
      </main>
    );
  }

  const relatedRecords = latestUpdates(gap, recordsForGap(gap));
  const currentAsOf = latestCheckedDate(relatedRecords) || gap.updated_at;

  return (
    <main className={`gap-updates-page gap-refined-page is-${gap.status}`}>
      <PublicNav onNavigate={onNavigate} onOpenAbout={onOpenAbout} />

      <section className="gap-history-header">
        <button className="gap-history-back" type="button" onClick={() => onOpenGap(gap.slug)}>
          <ArrowLeft size={16} /> {gap.title}
        </button>
        <span className="gap-history-kicker">Updates</span>
        <h1>The Latest</h1>
        <p>A running history of what changed, what we learned, and what happened around this gap.</p>
        <div className="gap-history-meta">
          <span>{renderStatusIcon(gap.status)} {formatStatus(gap.status)} gap</span>
          {currentAsOf && <span><CheckCircle2 size={16} /> Last updated {formatDate(currentAsOf)}</span>}
          <button type="button" onClick={() => onOpenGap(gap.slug)}>Current state <ArrowRight size={15} /></button>
        </div>
      </section>

      <section className="gap-history-timeline" aria-label={`Update history for ${gap.title}`}>
        {relatedRecords.map((record) => (
          <article className={`gap-history-item is-${record.record_type}`} key={record.id}>
            <time>{formatDate(record.published_at || record.checked_at)}</time>
            <div>
              <span>{formatRecordType(record.record_type)}</span>
              <h2>{record.title}</h2>
              <p>{record.summary}</p>
              {record.source.url ? (
                <a href={record.source.url} target="_blank" rel="noreferrer">
                  View source <ExternalLink size={15} />
                </a>
              ) : (
                <small><FileText size={15} /> {record.source.publisher || "Field note"}</small>
              )}
            </div>
          </article>
        ))}
      </section>

      <footer className="public-footer">
        <div className="footer-logo" aria-label="Crossover">
          <img src={logoDark} alt="" decoding="async" />
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

function PublicNav({ onNavigate, onOpenAbout }: Pick<GapUpdatesPageProps, "onNavigate" | "onOpenAbout">) {
  return (
    <header className="public-nav gap-history-nav">
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

function recordsForGap(gap: GapRecord) {
  if (gap.record_ids?.length) {
    return gap.record_ids
      .map((id) => records.find((record) => record.id === id))
      .filter((record): record is EvidenceRecord => Boolean(record));
  }

  return records.filter((record) => record.gap_ids.includes(gap.id));
}

function latestUpdates(gap: GapRecord, recordsForCurrentGap: EvidenceRecord[]) {
  const preferredIds = [gap.latest_change?.record_id].filter((id): id is string => Boolean(id));
  const preferred = new Set(preferredIds);
  const picked = preferredIds
    .map((id) => recordsForCurrentGap.find((record) => record.id === id))
    .filter((record): record is EvidenceRecord => Boolean(record));
  const remaining = recordsForCurrentGap
    .filter((record) => !preferred.has(record.id))
    .sort((a, b) => recordTime(b) - recordTime(a));

  return [...picked, ...remaining].filter((record, index, all) => all.findIndex((item) => item.id === record.id) === index);
}

function latestCheckedDate(recordsForCurrentGap: EvidenceRecord[]) {
  return recordsForCurrentGap
    .map((record) => record.checked_at)
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => dateValue(b) - dateValue(a))[0];
}

function recordTime(record: EvidenceRecord) {
  const time = dateValue(record.published_at || record.checked_at);
  return Number.isNaN(time) ? 0 : time;
}

function formatRecordType(type: EvidenceRecord["record_type"]) {
  return type.replace(/_/g, " ");
}

function formatStatus(status: GapRecord["status"]) {
  if (status === "watch") return "Watch";
  return status[0].toUpperCase() + status.slice(1);
}

function renderStatusIcon(status: GapRecord["status"]) {
  if (status === "improving") return <CheckCircle2 size={18} />;
  if (status === "high") return <AlertTriangle size={18} />;
  if (status === "watch") return <ShieldCheck size={18} />;
  return <AlertCircle size={18} />;
}

function formatDate(value?: string | null) {
  if (!value) return "Undated";
  const date = parseDisplayDate(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
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
