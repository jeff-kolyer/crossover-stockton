import uiCopy from "../data/pages/updates.json";
import { siteModel } from "../model";

import { sourceLinkLabel } from "../lib/sourceLinks";
import { updateTypeLabel } from "../lib/updatePresentation";
import { navigateInternalLink } from "../lib/internalLink";
import { ActivityRecord, HeadingGroup, RecordList } from "./layout";
import { publicUpdateDestination } from "../controller/routes";

const uiText = uiCopy.UpdatesPage;

interface UpdatesPageProps {
  onOpenGap: (slug: string) => void;
}

const updateRecords = siteModel.getPublicUpdates();

export function UpdatesPage({ onOpenGap }: UpdatesPageProps) {
  return (
    <main className="gap-updates-page gap-page">

      <HeadingGroup as="section" className="gap-history-header public-document">
        <h1>{uiText.updates}</h1>
        <p>{uiText.publicReportsLocalDevelopmentsAndNewInformation}</p>
      </HeadingGroup>

      <section className="gap-history-timeline public-document" aria-label={uiText.crossoverUpdateHistory}>
          <RecordList separated className="gap-history-feed-list">
            {updateRecords.map((update) => {
              const { record, date, relatedNeeds } = update;
              const destination = publicUpdateDestination(update);
              return (
                <ActivityRecord className={`gap-history-item is-${record.record_type}`} key={record.id}>
                  <div className="gap-history-feed-meta">
                    <time dateTime={date.value ?? undefined}>{date.meaning === "reviewed" ? `${uiText.reviewed} ${formatDate(date.value)}` : date.meaning === "invalid" ? uiText.invalidDate : formatDate(date.value, record.record_type === "activity")}</time>
                    {" · "}
                    <span>{updateTypeLabel(record)}</span>
                  </div>
                  <HeadingGroup><h2>{record.title}</h2>
                    <p>{record.summary}</p></HeadingGroup>
                  {relatedNeeds.length > 0 && (
                    <div className="gap-history-related-gaps">
                      <strong>{uiText.relatedGaps}</strong>
                      {relatedNeeds.map((gap) => (
                        <a key={gap.id} href={`/reality/${gap.slug}/`} onClick={(event) => navigateInternalLink(event, () => onOpenGap(gap.slug))}>
                          {shortGapTitle(gap.title)}
                        </a>
                      ))}
                    </div>
                  )}
                  <div className="gap-history-actions">
                    <a href={destination.href}>{destination.kind === "activity" ? uiText.viewActivity : uiText.viewRecord}</a>
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

function formatDate(value?: string | null, short = false) {
  if (!value) return uiText.undated;
  const date = parseDisplayDate(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { month: short ? "short" : "long", day: "numeric", year: "numeric" }).format(date);
}

function parseDisplayDate(value: string) {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
  }

  return new Date(value);
}
