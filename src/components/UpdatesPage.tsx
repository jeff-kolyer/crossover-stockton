import uiCopy from "../data/pages/updates.json";
import { siteModel } from "../model";

import { sourceLinkLabel } from "../lib/sourceLinks";
import { updateTypeLabel } from "../lib/updatePresentation";
import { navigateInternalLink } from "../lib/internalLink";
import { ActivityRecord, HeadingGroup, RecordList } from "./layout";
import type { EvidenceRecord, GapRecord } from "../types";

const uiText = uiCopy.UpdatesPage;

interface UpdatesPageProps {
  onOpenGap: (slug: string) => void;
}

const gaps = siteModel.getNeeds();
const records = siteModel.getAllEvidence();

export function UpdatesPage({ onOpenGap }: UpdatesPageProps) {
  const updateRecords = updateRecordsFromGaps();

  return (
    <main className="gap-updates-page gap-page">

      <HeadingGroup as="section" className="gap-history-header public-document">
        <h1>{uiText.updates}</h1>
        <p>{uiText.publicReportsLocalDevelopmentsAndNewInformation}</p>
      </HeadingGroup>

      <section className="gap-history-timeline public-document" aria-label={uiText.crossoverUpdateHistory}>
          <RecordList separated className="gap-history-feed-list">
            {updateRecords.map((record) => {
              const relatedGaps = gaps.filter((gap) => record.gap_ids.includes(gap.id));
              return (
                <ActivityRecord className={`gap-history-item is-${record.record_type}`} key={record.id}>
                  <div className="gap-history-feed-meta">
                    <time>{formatDate(record.published_at || record.checked_at)}</time>
                    {" · "}
                    <span>{updateTypeLabel(record)}</span>
                  </div>
                  <HeadingGroup><h2>{record.title}</h2>
                    <p>{record.summary}</p></HeadingGroup>
                  {relatedGaps.length > 0 && (
                    <div className="gap-history-related-gaps">
                      <strong>{uiText.relatedGaps}</strong>
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
                </ActivityRecord>
              );
            })}
          </RecordList>
      </section>

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
  if (!value) return uiText.undated;
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
