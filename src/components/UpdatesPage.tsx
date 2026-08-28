import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ExternalLink,
  FileText,
  MapPin,
  Menu,
} from "lucide-react";
import gapsData from "../data/gaps.json";
import recordsData from "../data/records.json";
import type { EvidenceRecord, GapRecord } from "../types";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";

interface UpdatesPageProps {
  onNavigate: (page: PublicRoute) => void;
  onOpenGap: (slug: string) => void;
}

const gaps = gapsData as GapRecord[];
const records = recordsData as EvidenceRecord[];
const logoDark = "/images/logo_dark.png";
const logoLight = "/images/logo_light.png";

export function UpdatesPage({ onNavigate, onOpenGap }: UpdatesPageProps) {
  const updateRecords = updateRecordsFromGaps();
  const lastUpdated = latestCheckedDate(updateRecords);

  return (
    <main className="gap-updates-page gap-refined-page">
      <PublicNav onNavigate={onNavigate} />

      <section className="gap-history-header">
        <button className="gap-history-back" type="button" onClick={() => onNavigate("home")}>
          <ArrowLeft size={16} /> Back to home
        </button>
        <span className="gap-history-kicker">Updates</span>
        <h1>The Latest</h1>
        <p>A running view of what Crossover Stockton is learning, what local organizations are doing, and where the gaps are moving.</p>
        <div className="gap-history-meta">
          {lastUpdated && <span><FileText size={16} /> Last updated {formatDate(lastUpdated)}</span>}
        </div>
      </section>

      <section className="gap-history-timeline" aria-label="Crossover update history">
        {updateRecords.map((record) => {
          const relatedGaps = gaps.filter((gap) => record.gap_ids.includes(gap.id));
          const primaryGap = relatedGaps[0];
          return (
            <article className={`gap-history-item is-${record.record_type}`} key={record.id}>
              <time>{formatDate(record.published_at || record.checked_at)}</time>
              <div>
                <span>{relatedGaps.map((gap) => gap.title).join(" / ") || formatRecordType(record.record_type)}</span>
                <h2>{record.title}</h2>
                <p>{record.summary}</p>
                <div className="gap-history-actions">
                  {record.source.url && (
                    <a
                      href={record.source.url}
                      target={record.source.url.startsWith("/") ? undefined : "_blank"}
                      rel={record.source.url.startsWith("/") ? undefined : "noreferrer"}
                    >
                      View source <ExternalLink size={15} />
                    </a>
                  )}
                  {primaryGap && (
                    <button type="button" onClick={() => onOpenGap(primaryGap.slug)}>
                      Current state <ArrowRight size={15} />
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <footer className="public-footer">
        <div className="footer-logo" aria-label="Crossover">
          <img src={logoDark} alt="" decoding="async" />
          <span>Crossover</span>
        </div>
        <span>© 2026 Crossover Stockton</span>
        <p>Reality. Connection. Action.</p>
        <button type="button" onClick={() => onNavigate("about")}>About</button>
        <button type="button" onClick={() => onNavigate("action")}>Action</button>
        <a href="https://www.linkedin.com/in/jeff-kolyer-53003a21/" target="_blank" rel="noreferrer">Contact</a>
      </footer>
    </main>
  );
}

function updateRecordsFromGaps() {
  const recordMap = new Map<string, EvidenceRecord>();

  gaps
    .filter((gap) => gap.active)
    .flatMap((gap) => latestUpdates(gap, recordsForGap(gap)))
    .forEach((record) => {
      if (!recordMap.has(record.id)) recordMap.set(record.id, record);
    });

  return Array.from(recordMap.values()).sort((a, b) => recordTime(b) - recordTime(a));
}

function PublicNav({ onNavigate }: { onNavigate: (page: PublicRoute) => void }) {
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
        <button type="button" onClick={() => onNavigate("reality")}>Needs</button>
        <button type="button" onClick={() => onNavigate("connection")}>Stories</button>
        <button type="button" onClick={() => onNavigate("action")}>Action</button>
        <button type="button" className="is-active" onClick={() => onNavigate("updates")}>Updates</button>
        <button type="button" onClick={() => onNavigate("organizations")}>Organizations</button>
        <button type="button" onClick={() => onNavigate("about")}>About</button>
      </nav>
      <button className="location-pill" type="button" onClick={() => onNavigate("home")}>
        <MapPin size={16} />
        Stockton, CA
        <ChevronDown size={15} />
      </button>
    </header>
  );
}

function latestCheckedDate(recordsForUpdates: EvidenceRecord[]) {
  return recordsForUpdates
    .map((record) => record.checked_at || record.published_at)
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => dateValue(b) - dateValue(a))[0];
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

function recordTime(record: EvidenceRecord) {
  const time = dateValue(record.published_at || record.checked_at);
  return Number.isNaN(time) ? 0 : time;
}

function formatRecordType(type: EvidenceRecord["record_type"]) {
  return type.replace(/_/g, " ");
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
