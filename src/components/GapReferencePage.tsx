import gapsData from "../data/gaps.json";
import recordsData from "../data/records.json";
import orgsData from "../data/orgs.json";
import projectsData from "../data/projects.json";
import dogResearchData from "../data/dogs-research.json";
import questionsData from "../data/investigation-questions.json";
import { navigateInternalLink } from "../lib/internalLink";
import { PublicSiteNav } from "./PublicSiteNav";
import { PublicFooter } from "./PublicFooter";
import type { CapacityProject, DogsResearchBaseline, EvidenceRecord, GapRecord, OrgRecord } from "../types";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";
type SourceEntry = { url: string; title: string; publisher?: string; publishedAt?: string | null; checkedAt?: string };
type ExtendedGapSource = { url?: string; title?: string; label?: string; publisher?: string; published_at?: string | null; checked_at?: string };
type GapQuestion = { investigation_id: string; title: string };
type Fact = { label: string; value: string; detail: string; record?: EvidenceRecord; source?: SourceEntry };

const gaps = (gapsData as GapRecord[]).filter((gap) => gap.active).sort((a, b) => a.rank - b.rank);
const records = recordsData as EvidenceRecord[];
const organizations = orgsData as OrgRecord[];
const projects = projectsData as CapacityProject[];
const dogResearch = dogResearchData as DogsResearchBaseline;
const questions = questionsData as GapQuestion[];
const factIndices: Record<string, number[]> = {
  "pet-inclusive-shelter": [0, 1],
  "food-distribution-capacity": [0, 1, 2],
  "low-barrier-housing-pathways": [0],
};

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(date);
}

function gapRecords(gap: GapRecord) {
  return records.filter((record) => record.gap_ids.includes(gap.id));
}

function researchDate(gap: GapRecord, related: EvidenceRecord[]) {
  const dates = [gap.updated_at, ...(gap.id === "dogs-safe-placement" ? [dogResearch.last_reviewed_at] : []), ...related.filter((record) => record.record_type !== "activity" && record.record_type !== "field_report").map((record) => record.checked_at || record.published_at)].filter((value): value is string => Boolean(value));
  return dates.sort((a, b) => Date.parse(b) - Date.parse(a))[0];
}

function keyFacts(gap: GapRecord): Fact[] {
  if (gap.id === "dogs-safe-placement") {
    return ["sas-2024-dog-intake-stray", "sas-2024-dog-intake-total"].map((id) => dogResearch.measurements.find((measurement) => measurement.id === id)).filter((measurement): measurement is NonNullable<typeof measurement> => Boolean(measurement)).map((measurement) => ({
      label: measurement.id === "sas-2024-dog-intake-stray" ? "Stray dog intake" : "All dog intake",
      value: measurement.value.toLocaleString(),
      detail: `${measurement.unit} reported by Stockton Animal Services in 2024. ${dogResearch.coverage[measurement.coverage_id]}${measurement.note ? ` ${measurement.note}` : ""}`,
      record: records.find((record) => record.id === measurement.source_record_id),
    }));
  }
  return (factIndices[gap.id] ?? []).map((index) => gap.current_state_items?.[index]).filter((item): item is NonNullable<typeof item> => Boolean(item)).map((item) => ({
    label: item.label,
    value: item.value,
    detail: item.detail,
    record: records.find((record) => record.id === item.record_ids?.[0]),
    source: gap.id === "pet-inclusive-shelter" && item.record_ids?.[0] === "sjc-2024-pit-pet-ownership"
      ? (() => { const source = (gap.sources as ExtendedGapSource[]).find((entry) => entry.title?.includes("2024 San Joaquin County Point-In-Time Count Report")); return source?.url ? { url: source.url, title: source.title || "2024 San Joaquin County Point-In-Time Count Report", publishedAt: source.published_at } : undefined; })()
      : undefined,
  }));
}

function sourceEntries(gap: GapRecord, related: EvidenceRecord[]): SourceEntry[] {
  const byUrl = new Map<string, SourceEntry>();
  for (const source of gap.sources as ExtendedGapSource[]) {
    if (!source.url) continue;
    byUrl.set(source.url, { url: source.url, title: source.title || source.label || source.publisher || source.url, publisher: source.publisher, publishedAt: source.published_at, checkedAt: source.checked_at });
  }
  for (const record of related) {
    if (!record.source.url || byUrl.has(record.source.url)) continue;
    byUrl.set(record.source.url, { url: record.source.url, title: record.title, publisher: record.source.publisher, publishedAt: record.published_at, checkedAt: record.checked_at });
  }
  return [...byUrl.values()];
}

export function GapReferencePage({ slug, onNavigate, onOpenGap }: { slug?: string; onNavigate: (page: PublicRoute) => void; onOpenGap: (slug: string) => void }) {
  const gap = gaps.find((item) => item.slug === slug);
  if (!gap) return <main className="crossover-index-body"><h1>Gap not found</h1><p>This reference page is unavailable.</p><a href="/reality/" onClick={(event) => navigateInternalLink(event, () => onNavigate("reality"))}>Back to needs</a></main>;

  const position = gaps.indexOf(gap);
  const previous = gaps[position - 1];
  const next = gaps[position + 1];
  const related = gapRecords(gap);
  const facts = keyFacts(gap);
  const relatedProjects = projects.filter((project) => project.gap_ids.includes(gap.id));
  const roles = (gap.responder_roles?.length ? gap.responder_roles : gap.organization_ids.map((organization_id) => ({ organization_id, label: "", current_role: "" }))).map((role) => ({ role, organization: organizations.find((organization) => organization.id === role.organization_id) })).filter((entry): entry is { role: typeof entry.role; organization: OrgRecord } => Boolean(entry.organization));
  const sources = sourceEntries(gap, related);
  const reports = related.filter((record) => record.record_type === "field_report");
  const dogQuestions = gap.id === "dogs-safe-placement" ? questions.filter((question) => question.investigation_id === "street-dog-immediate-welfare").slice(0, 4) : [];
  const firsthand = gap.id === "dogs-safe-placement" ? records.find((record) => record.id === "crossover-2026-10-14-sas-first-visit") : undefined;

  return <main className="public-site gap-reference-page">
    <PublicSiteNav active="reality" onNavigate={onNavigate} />
    <article className="gap-reference-article">
      <p><a href="/reality/" onClick={(event) => navigateInternalLink(event, () => onNavigate("reality"))}>← Back to needs</a></p>
      <nav aria-label="Previous and next gaps">
        {previous && <a href={`/reality/${previous.slug}/`} onClick={(event) => navigateInternalLink(event, () => onOpenGap(previous.slug))}>Previous gap: {previous.title}</a>}
        {previous && next && " · "}
        {next && <a href={`/reality/${next.slug}/`} onClick={(event) => navigateInternalLink(event, () => onOpenGap(next.slug))}>Next gap: {next.title}</a>}
      </nav>
      <div className="public-entry gap-reference-lead">
        {gap.artwork && <img src={gap.artwork} alt="" loading="eager" />}
        <div><h1>{gap.title}</h1>
          <p>{gap.investigation_status === "investigating" ? "INVESTIGATING" : "IDENTIFIED"} · Research updated {formatDate(researchDate(gap, related))}</p>
          <p>{gap.summary}</p></div>
      </div>

      <section aria-labelledby="gap-happening"><h2 id="gap-happening">What's happening?</h2><p>{gap.what_we_are_seeing[0] || gap.current_state || gap.summary}</p></section>

      {facts.length > 0 && <section aria-labelledby="gap-facts"><h2 id="gap-facts">Key facts</h2><ul>{facts.map((fact) => <li key={fact.label}><strong>{fact.value} — {fact.label}.</strong> {fact.detail}{fact.record && <> Evidence: {fact.record.source.url ? <a href={fact.record.source.url} target="_blank" rel="noreferrer">{fact.record.title}</a> : fact.record.title}{fact.record.published_at && ` (${formatDate(fact.record.published_at)})`}.</>}{!fact.record && fact.source && <> Evidence: <a href={fact.source.url} target="_blank" rel="noreferrer">{fact.source.title}</a>{fact.source.publishedAt && ` (${formatDate(fact.source.publishedAt)})`}.</>}</li>)}</ul></section>}

      <section aria-labelledby="gap-known"><h2 id="gap-known">What's documented?</h2><p>{gap.investigation_status === "identified" ? "The following points come from published and provider sources. Crossover has not independently checked their current outcomes." : "Published and provider sources describe the following. Crossover's direct observations are identified separately."}</p><ul>{gap.what_we_are_seeing.slice(1, 4).map((point) => <li key={point}>{point}</li>)}</ul>{firsthand && <p><strong>Crossover firsthand record ({formatDate(firsthand.occurred_at || firsthand.recorded_at)}):</strong> {firsthand.summary}</p>}{relatedProjects.length > 0 && <><h3>Projects and proposed changes</h3><ul>{relatedProjects.map((project) => <li key={project.id}><strong>{project.title}.</strong> {project.capacity_summary.headline} Development: {project.development_stage.replaceAll("_", " ")}; operating status: {project.operational_status.replaceAll("_", " ")}. {project.capacity_summary.not_yet_verified}</li>)}</ul></>}</section>

      <section aria-labelledby="gap-unknown"><h2 id="gap-unknown">What remains unknown?</h2>{gap.investigation_status === "identified" && <p>Crossover has not independently investigated which reported conditions currently limit access. These are possible factors to verify, not established findings.</p>}<ul>{dogQuestions.length ? dogQuestions.map((question) => <li key={question.title}>{question.title}</li>) : gap.contributing_factors.slice(0, 3).map((factor) => <li key={factor}>{factor}</li>)}</ul></section>

      <section aria-labelledby="gap-responders"><h2 id="gap-responders">Who's responding?</h2><p>These roles are described in public and provider records. Listing an organization does not imply direct Crossover involvement.</p><ul>{roles.map(({ role, organization }) => <li key={organization.id}><strong>{organization.name}.</strong> {role.label || organization.summary}{organization.website && <> <a href={organization.website} target="_blank" rel="noreferrer">Organization website</a></>}</li>)}</ul></section>

      <section aria-labelledby="gap-sources"><h2 id="gap-sources">Sources</h2><ul>{sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a>{source.publisher && ` — ${source.publisher}`}{(source.publishedAt || source.checkedAt) && ` · ${source.publishedAt ? `Published ${formatDate(source.publishedAt)}` : `Reviewed ${formatDate(source.checkedAt)}`}`}</li>)}{reports.map((report) => <li key={report.id}><a href={`/reports/${encodeURIComponent(report.id)}/`}>{report.title}</a> — Crossover field report{report.occurred_at && ` · ${formatDate(report.occurred_at)}`}</li>)}</ul></section>

      {gap.id === "dogs-safe-placement" && <section aria-labelledby="gap-investigation"><h2 id="gap-investigation">Related investigation</h2><p><a href="/work/dogs/">Open investigation →</a></p></section>}
    </article>
    <PublicFooter active="reality" onNavigate={onNavigate} />
  </main>;
}
