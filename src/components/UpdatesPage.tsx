
import gapsData from "../data/gaps.json";
import recordsData from "../data/records.json";
import { sourceLinkLabel } from "../lib/sourceLinks";
import { updateTypeLabel } from "../lib/updatePresentation";
import { navigateInternalLink } from "../lib/internalLink";
import { PublicSiteNav } from "./PublicSiteNav";
import { PublicFooter } from "./PublicFooter";
import type { EvidenceRecord, GapRecord } from "../types";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";

interface UpdatesPageProps {
  onNavigate: (page: PublicRoute) => void;
  onOpenGap: (slug: string) => void;
}

const gaps = gapsData as GapRecord[];
const records = recordsData as EvidenceRecord[];

export function UpdatesPage({ onNavigate, onOpenGap }: UpdatesPageProps) {
  const updateRecords = updateRecordsFromGaps();

  return (
    <main className="public-site gap-updates-page gap-page">
      <PublicNav onNavigate={onNavigate} />

      <section className="gap-history-header public-document">
        <h1>Updates</h1>
        <p>Public reports, local developments, and new information about the needs we're tracking in Stockton.</p>
      </section>

      <section className="gap-history-timeline public-document" aria-label="Crossover update history">
          <div className="gap-history-feed-list">
            {updateRecords.map((record) => {
              const relatedGaps = gaps.filter((gap) => record.gap_ids.includes(gap.id));
              return (
                <article className={`gap-history-item is-${record.record_type}`} key={record.id}>
                  <div className="gap-history-feed-meta">
                    <time>{formatDate(record.published_at || record.checked_at)}</time>
                    {" · "}
                    <span>{updateTypeLabel(record)}</span>
                  </div>
                  <h2>{record.title}</h2>
                  <p>{record.summary}</p>
                  {relatedGaps.length > 0 && (
                    <div className="gap-history-related-gaps">
                      <strong>Related gaps:</strong>
                      {relatedGaps.map((gap) => (
                        <a key={gap.id} href={`/reality/${gap.slug}/`} onClick={(event) => navigateInternalLink(event, () => onOpenGap(gap.slug))}>
                          {shortGapTitle(gap.title)}
                        </a>
                      ))}
                    </div>
                  )}
                  <div className="gap-history-actions">
                    {record.source.url && (
                      <a
                        href={record.source.url}
                        target={record.source.url.startsWith("/") ? undefined : "_blank"}
                        rel={record.source.url.startsWith("/") ? undefined : "noreferrer"}
                      >
                        {sourceLinkLabel(record.source)} 
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
      </section>

      <PublicFooter active="updates" onNavigate={onNavigate} />
    </main>
  );
}

function shortGapTitle(title: string) {
  return title.replace(/\.$/, "");
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
  return <PublicSiteNav active="updates" onNavigate={onNavigate} variant="history" />;
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
  return [...recordsForCurrentGap]
    .filter((record) => record.record_type !== "activity" && record.record_type !== "finding")
    .sort((a, b) => recordTime(b) - recordTime(a))
    .filter((record, index, all) => all.findIndex((item) => item.id === record.id) === index);
}

function recordTime(record: EvidenceRecord) {
  const time = dateValue(record.published_at || record.checked_at);
  return Number.isNaN(time) ? 0 : time;
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
