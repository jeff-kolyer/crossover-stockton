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

interface GapSourcesPageProps {
  slug?: string;
  onNavigate: (page: PublicRoute) => void;
  onOpenAbout: () => void;
  onOpenGap: (slug: string) => void;
}

const gaps = gapsData as GapRecord[];
const records = recordsData as EvidenceRecord[];
const logoDark = "/images/logo_dark.png";
const logoLight = "/images/logo_light.png";

export function GapSourcesPage({ slug, onNavigate, onOpenAbout, onOpenGap }: GapSourcesPageProps) {
  const gap = gaps.find((item) => item.slug === slug);

  if (!gap) {
    return (
      <main className="gap-updates-page gap-refined-page">
        <PublicNav onNavigate={onNavigate} onOpenAbout={onOpenAbout} />
        <section className="gap-history-header">
          <button className="gap-history-back" type="button" onClick={() => onNavigate("reality")}>
            <ArrowLeft size={16} /> Back to needs
          </button>
          <h1>Sources</h1>
          <p>This gap record may have moved, been retired, or not been added to the public data yet.</p>
        </section>
      </main>
    );
  }

  const relatedRecords = sourceRecordsForGap(gap);
  const currentAsOf = latestCheckedDate(relatedRecords) || gap.updated_at;

  return (
    <main className={`gap-updates-page gap-refined-page is-${gap.status}`}>
      <PublicNav onNavigate={onNavigate} onOpenAbout={onOpenAbout} />

      <section className="gap-history-header">
        <button className="gap-history-back" type="button" onClick={() => onOpenGap(gap.slug)}>
          <ArrowLeft size={16} /> {gap.title}
        </button>
        <span className="gap-history-kicker">Sources</span>
        <h1>Evidence & Sources</h1>
        <p>The records and public sources Crossover is using to understand the current state of this gap.</p>
        <div className="gap-history-meta">
          <span>{renderStatusIcon(gap.status)} {formatStatus(gap.status)} gap</span>
          {currentAsOf && <span><CheckCircle2 size={16} /> Last checked {formatDate(currentAsOf)}</span>}
          <button type="button" onClick={() => onOpenGap(gap.slug)}>Current state <ArrowRight size={15} /></button>
        </div>
      </section>

      <section className="gap-history-timeline gap-sources-timeline" aria-label={`Sources for ${gap.title}`}>
        {relatedRecords.map((record) => (
          <article className={`gap-history-item gap-source-history-item is-${record.record_type}`} key={record.id}>
            <time>{formatDate(record.published_at || record.checked_at)}</time>
            <div>
              <span>{formatRecordType(record.record_type)}</span>
              <h2>{record.title}</h2>
              <p>{record.summary}</p>
              <dl className="gap-source-facts">
                <div>
                  <dt>Publisher</dt>
                  <dd>{record.source.publisher || "Public source"}</dd>
                </div>
                <div>
                  <dt>Published</dt>
                  <dd>{formatDate(record.published_at)}</dd>
                </div>
                <div>
                  <dt>Checked</dt>
                  <dd>{formatDate(record.checked_at)}</dd>
                </div>
                <div>
                  <dt>Trust</dt>
                  <dd>{formatRecordType(record.trust)}</dd>
                </div>
              </dl>
              {record.source.url ? (
                <a href={record.source.url} target={record.source.url.startsWith("/") ? undefined : "_blank"} rel={record.source.url.startsWith("/") ? undefined : "noreferrer"}>
                  View source <ExternalLink size={15} />
                </a>
              ) : (
                <small><FileText size={15} /> {record.source.type || "Source"}</small>
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
        <button type="button" onClick={onOpenAbout}>About</button>
        <button type="button" onClick={() => onNavigate("action")}>Action</button>
      </footer>
    </main>
  );
}

function PublicNav({ onNavigate, onOpenAbout }: Pick<GapSourcesPageProps, "onNavigate" | "onOpenAbout">) {
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

function sourceRecordsForGap(gap: GapRecord) {
  const relatedRecords = gap.record_ids?.length
    ? gap.record_ids
      .map((id) => records.find((record) => record.id === id))
      .filter((record): record is EvidenceRecord => Boolean(record))
    : records.filter((record) => record.gap_ids.includes(gap.id));

  return relatedRecords.sort((a, b) => recordTime(b) - recordTime(a));
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

function formatRecordType(value: string) {
  return value.replace(/_/g, " ");
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
  if (!value) return "Not listed";
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
