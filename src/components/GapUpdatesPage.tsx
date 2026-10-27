
import gapsData from "../data/gaps.json";
import { gapUpdateHref, gapUpdates } from "../lib/gapUpdates";
import { navigateInternalLink } from "../lib/internalLink";
import { PublicSiteNav } from "./PublicSiteNav";
import type { GapRecord } from "../types";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";

interface GapUpdatesPageProps {
  slug?: string;
  onNavigate: (page: PublicRoute) => void;
  onOpenAbout: () => void;
  onOpenGap: (slug: string) => void;
  onOpenWork: (workId: string, anchor?: string) => void;
  onOpenReport: (reportId: string) => void;
}

const gaps = gapsData as GapRecord[];
const logoDark = "/images/logo_dark.webp";
const logoLight = "/images/logo_light.webp";

export function GapUpdatesPage({ slug, onNavigate, onOpenAbout, onOpenGap, onOpenWork, onOpenReport }: GapUpdatesPageProps) {
  const gap = gaps.find((item) => item.slug === slug);

  if (!gap) {
    return (
      <main className="gap-updates-page gap-page">
        <PublicNav onNavigate={onNavigate} onOpenAbout={onOpenAbout} />
        <section className="gap-history-header">
          <button className="gap-history-back" type="button" onClick={() => onNavigate("reality")}>
             Back to needs
          </button>
          <h1>Updates</h1>
          <p>This gap record may have moved, been retired, or not been added to the public data yet.</p>
        </section>
      </main>
    );
  }

  const relatedUpdates = gapUpdates(gap);
  return (
    <main className={`gap-updates-page gap-page is-${gap.investigation_status}`}>
      <PublicNav onNavigate={onNavigate} onOpenAbout={onOpenAbout} />

      <section className="gap-history-header gap-specific-history-header">
        <button className="gap-history-back" type="button" onClick={() => onOpenGap(gap.slug)}>
           Back to gap
        </button>
        <h1>{gap.title}</h1>
        <p>Reported developments, Crossover activity where available, and what remains to be checked about this potential need.</p>
      </section>

      <section className="gap-history-timeline gap-specific-history-timeline" aria-label={`Update history for ${gap.title}`}>
        <div className="gap-history-feed-card">
          <div className="gap-history-feed-heading">
            <h2>All updates</h2>
            <span>Newest first</span>
          </div>
          <div className="gap-history-feed-list">
            {relatedUpdates.map((update) => {
              const destination = update.destination;
              const href = gapUpdateHref(destination);
              return <article className={`gap-history-item${update.crossover ? " is-crossover" : ""}`} key={update.id}>
                <div className="gap-history-feed-meta">
                  <time dateTime={update.date}>{update.dateContext ? `${update.dateContext} ` : ""}{formatDate(update.date)}</time>
                  <span>{update.typeLabel}</span>
                </div>
                <h3>{update.title}</h3>
                <p>{update.summary}</p>
                {href ? (
                  <a href={href}
                    target={destination?.kind === "external" && !href.startsWith("/") ? "_blank" : undefined}
                    rel={destination?.kind === "external" && !href.startsWith("/") ? "noreferrer" : undefined}
                    onClick={destination?.kind === "report"
                      ? (event) => navigateInternalLink(event, () => onOpenReport(destination.id))
                      : destination?.kind === "work"
                        ? (event) => navigateInternalLink(event, () => onOpenWork(destination.id, destination.anchor))
                        : undefined}
                  >
                    {update.linkLabel} 
                  </a>
                ) : (
                  <small> Source link unavailable</small>
                )}
              </article>;
            })}
          </div>
        </div>
      </section>

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

function PublicNav({ onNavigate, onOpenAbout }: Pick<GapUpdatesPageProps, "onNavigate" | "onOpenAbout">) {
  return <PublicSiteNav active="updates" onNavigate={onNavigate} onOpenAbout={onOpenAbout} variant="history" />;
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
