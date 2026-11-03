import uiCopy from "../data/pages/needs.json";
import { siteModel } from "../model";
import { useEffect, useState } from "react";
import { articlesForGap } from "../lib/articles";
import dogResearchData from "../data/dogs-research.json";
import { navigateInternalLink } from "../lib/internalLink";
import { HeadingGroup, Stack } from "./layout";
import type { CapacityProject, DogsResearchBaseline, EvidenceRecord, GapRecord, OrgRecord } from "../types";

const uiText = uiCopy.GapReferencePage;

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "investigation";
type SourceEntry = { url: string; title: string; publisher?: string; publishedAt?: string | null; checkedAt?: string };
type ExtendedGapSource = { url?: string; title?: string; label?: string; publisher?: string; published_at?: string | null; checked_at?: string };
type GapQuestion = { id: string; investigation_id: string; title: string };
type Fact = { label: string; value: string; detail: string; record?: EvidenceRecord; source?: SourceEntry };

const gaps = siteModel.getNeeds().filter((gap) => gap.active).sort((a, b) => a.rank - b.rank);
const records = siteModel.getAllEvidence();
const organizations = siteModel.getOrganizations();
const projects = siteModel.getProjects() as CapacityProject[];
const dogResearch = dogResearchData as DogsResearchBaseline;
const questions = siteModel.getAllQuestions() as GapQuestion[];
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
    return siteModel.getClaims(gap.id).map((claim) => ({
      value: claim.reportedValue,
      label: claim.statement,
      detail: claim.limitations,
      record: claim.sourceRecordIds.length ? siteModel.getEvidenceRecord(claim.sourceRecordIds[0]) : undefined,
    }));
  }
  return (factIndices[gap.id] ?? []).map((index) => gap.current_state_items?.[index]).filter((item): item is NonNullable<typeof item> => Boolean(item)).map((item) => ({
    label: item.label,
    value: item.value,
    detail: item.detail,
    record: records.find((record) => record.id === item.record_ids?.[0]),
    source: gap.id === "pet-inclusive-shelter" && item.record_ids?.[0] === "sjc-2024-pit-pet-ownership"
      ? (() => { const source = (gap.sources as ExtendedGapSource[]).find((entry) => entry.title?.includes(uiText.countyCountReport)); return source?.url ? { url: source.url, title: source.title || uiText.countyCountReport, publishedAt: source.published_at } : undefined; })()
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

export function GapReferencePage({ slug, onNavigate, onOpenGap, onOpenArticle, onOpenFindings }: { slug?: string; onNavigate: (page: PublicRoute) => void; onOpenGap: (slug: string) => void; onOpenArticle: (path: string) => void; onOpenFindings: () => void }) {
  const [showAllSources, setShowAllSources] = useState(false);
  const [expandedImprovementGapId, setExpandedImprovementGapId] = useState<string | null>(null);
  useEffect(() => { setExpandedImprovementGapId(null); }, [slug]);
  const gap = gaps.find((item) => item.slug === slug);
  if (!gap) return <main className="crossover-index-body"><h1>{uiText.gapNotFound}</h1><p>{uiText.thisReferencePageIsUnavailable}</p><a href="/reality/" onClick={(event) => navigateInternalLink(event, () => onNavigate("reality"))}>{uiText.backToNeeds}</a></main>;

  const position = gaps.indexOf(gap);
  const previous = gaps[position - 1];
  const next = gaps[position + 1];
  const related = gapRecords(gap);
  const facts = keyFacts(gap);
  const relatedProjects = projects.filter((project) => project.gap_ids.includes(gap.id));
  const showAllImprovements = expandedImprovementGapId === gap.id;
  const visibleProjects = showAllImprovements ? relatedProjects : relatedProjects.slice(0, 2);
  const roles = (gap.responder_roles?.length ? gap.responder_roles : gap.organization_ids.map((organization_id) => ({ organization_id, label: "", current_role: "" }))).map((role) => ({ role, organization: organizations.find((organization) => organization.id === role.organization_id) })).filter((entry): entry is { role: typeof entry.role; organization: OrgRecord } => Boolean(entry.organization));
  const sources = sourceEntries(gap, related);
  const reports = related.filter((record) => record.record_type === "field_report");
  const dogQuestions = gap.id === "dogs-safe-placement" ? (gap.unknown_questions ?? questions.filter((question) => question.investigation_id === "street-dog-immediate-welfare").slice(0, 4).map((question) => question.title)) : [];
  const streetDogQuestion = gap.id === "dogs-safe-placement" ? questions.find((question) => question.id === "where-dogs-need-help") : undefined;
  const firsthand = gap.id === "dogs-safe-placement" ? records.find((record) => record.id === "crossover-2026-10-14-sas-first-visit") : undefined;
  const sourceLimit = gap.id === "dogs-safe-placement" ? 5 : Number.POSITIVE_INFINITY;
  const visibleSources = showAllSources ? sources : sources.slice(0, sourceLimit);
  const visibleReports = showAllSources || sourceLimit === Number.POSITIVE_INFINITY ? reports : reports.slice(0, Math.max(0, sourceLimit - sources.length));
  const hiddenSourceCount = Math.max(0, sources.length + reports.length - sourceLimit);
  const stocktoniaReport = gap.id === "dogs-safe-placement" ? records.find((record) => record.id === "stocktonia-2026-10-20-animal-control-proposals") : undefined;
  const relatedArticles = articlesForGap(gap.id);

  return <main className="gap-reference-page">
    <article className="gap-reference-article public-document">
      <p><a href="/reality/" onClick={(event) => navigateInternalLink(event, () => onNavigate("reality"))}>{uiText.backToNeeds2}</a></p>
      <nav aria-label={uiText.previousAndNextGaps}>
        {previous && <a href={`/reality/${previous.slug}/`} onClick={(event) => navigateInternalLink(event, () => onOpenGap(previous.slug))}>{uiText.previousGap}{previous.title}</a>}
        {previous && next && " · "}
        {next && <a href={`/reality/${next.slug}/`} onClick={(event) => navigateInternalLink(event, () => onOpenGap(next.slug))}>{uiText.nextGap}{next.title}</a>}
      </nav>
      <div className="public-entry gap-reference-lead">
        {gap.artwork && <img src={gap.artwork} alt="" loading="eager" />}
        <HeadingGroup><h1>{gap.title}</h1>
          <p>{gap.investigation_status === "investigating" ? uiText.investigatingStatus : uiText.identifiedStatus} {uiText.researchUpdated}{formatDate(researchDate(gap, related))}</p>
          <p>{gap.summary}</p></HeadingGroup>
      </div>

      <HeadingGroup as="section" aria-labelledby="gap-happening"><h2 id="gap-happening">{uiText.whatSHappening}</h2><p>{gap.what_we_are_seeing[0] || gap.current_state || gap.summary}</p></HeadingGroup>

      {facts.length > 0 && <Stack as="section" aria-labelledby="gap-facts"><h2 id="gap-facts">{uiText.keyFacts}</h2><ul>{facts.map((fact) => <li key={fact.label}><strong>{fact.value} — {fact.label}.</strong> {fact.detail}{fact.record && <> {uiText.evidence}{fact.record.source.url ? <a href={fact.record.source.url} target="_blank" rel="noreferrer">{fact.record.title}</a> : fact.record.title}{fact.record.published_at && ` (${formatDate(fact.record.published_at)})`}.</>}{!fact.record && fact.source && <> {uiText.evidence}<a href={fact.source.url} target="_blank" rel="noreferrer">{fact.source.title}</a>{fact.source.publishedAt && ` (${formatDate(fact.source.publishedAt)})`}.</>}</li>)}</ul></Stack>}

      <Stack as="section" aria-labelledby="gap-known"><HeadingGroup><h2 id="gap-known">{uiText.whatSDocumented}</h2><p>{gap.investigation_status === "identified" ? uiText.identifiedEvidenceIntro : uiText.investigatingEvidenceIntro}</p></HeadingGroup><ul>{gap.what_we_are_seeing.slice(1, gap.id === "dogs-safe-placement" ? undefined : 4).map((point) => <li key={point}>{point}</li>)}</ul>{stocktoniaReport?.source.url && <p><a href={stocktoniaReport.source.url} target="_blank" rel="noreferrer">{uiText.readStocktoniaSOctober20Report}</a> {uiText.onShelterCapacityAndTheProposedOrdinance}</p>}{firsthand && <HeadingGroup><h3>{uiText.crossoverFirsthandRecord}{formatDate(firsthand.occurred_at || firsthand.recorded_at)}):</h3><p>{firsthand.summary}</p></HeadingGroup>}</Stack>

      {relatedProjects.length > 0 && <Stack as="section" className="gap-reference-entities gap-reference-projects" aria-labelledby="gap-projects"><h2 id="gap-projects">{uiText.projectsAndProposedChanges}</h2>{visibleProjects.map((project) => <HeadingGroup as="article" key={project.id}><h3>{project.title}.</h3><p>{project.capacity_summary.headline} {uiText.development}{project.development_stage.replaceAll("_", " ")}{uiText.operatingStatus}{project.operational_status.replaceAll("_", " ")}. {project.capacity_summary.not_yet_verified}</p></HeadingGroup>)}{relatedProjects.length > 2 && <button type="button" aria-expanded={showAllImprovements} onClick={() => setExpandedImprovementGapId(showAllImprovements ? null : gap.id)}>{showAllImprovements ? uiText.showFewerImprovements : `${uiText.showAllImprovements} (${relatedProjects.length})`}</button>}</Stack>}

      <Stack as="section" aria-labelledby="gap-unknown"><HeadingGroup><h2 id="gap-unknown">{uiText.whatRemainsUnknown}</h2>{gap.investigation_status === "identified" && <p>{uiText.crossoverHasNotIndependentlyInvestigatedWhichReported}</p>}</HeadingGroup><ul>{dogQuestions.length ? dogQuestions.map((question) => <li key={question}>{question}</li>) : gap.contributing_factors.slice(0, 3).map((factor) => <li key={factor}>{factor}</li>)}</ul>{streetDogQuestion && <p id={`question-${streetDogQuestion.id}`}>{uiText.investigationQuestion}{streetDogQuestion.title}</p>}</Stack>

      <Stack as="section" className="gap-reference-entities" aria-labelledby="gap-responders"><HeadingGroup><h2 id="gap-responders">{uiText.whoSResponding}</h2><p>{uiText.theseRolesAreDescribedInPublicAnd}</p></HeadingGroup>{roles.map(({ role, organization }) => <HeadingGroup as="article" key={organization.id}><h3>{organization.name}.</h3><p>{role.label || organization.summary}{organization.website && <> <a href={organization.website} target="_blank" rel="noreferrer">{uiText.organizationWebsite}</a></>}</p></HeadingGroup>)}</Stack>

      <Stack as="section" aria-labelledby="gap-sources"><h2 id="gap-sources">{uiText.sources}</h2><ul id="gap-source-list">{visibleSources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a>{source.publisher && ` — ${source.publisher}`}{(source.publishedAt || source.checkedAt) && ` · ${source.publishedAt ? `${uiText.published} ${formatDate(source.publishedAt)}` : `${uiText.reviewedStatus} ${formatDate(source.checkedAt)}`}`}</li>)}{visibleReports.map((report) => <li key={report.id}><a href={`/reports/${encodeURIComponent(report.id)}/`}>{report.title}</a> {uiText.crossoverFieldReport}{report.occurred_at && ` · ${formatDate(report.occurred_at)}`}</li>)}</ul>{hiddenSourceCount > 0 && <button type="button" aria-expanded={showAllSources} aria-controls="gap-source-list" onClick={() => setShowAllSources((value) => !value)}>{showAllSources ? uiText.showFewerSources : `${uiText.showAllSources} (${hiddenSourceCount})`}</button>}</Stack>

      {gap.id === "dogs-safe-placement" && <HeadingGroup as="section" aria-labelledby="gap-investigation"><h2 id="gap-investigation">{uiText.relatedInvestigation}</h2><p><a href="/work/dogs/findings/" onClick={(event) => navigateInternalLink(event, onOpenFindings)}>{uiText.seeOurFindings}</a></p></HeadingGroup>}

      {relatedArticles.length > 0 && <Stack as="section" aria-labelledby="gap-articles"><h2 id="gap-articles">{uiText.articles}</h2><ul>{relatedArticles.map((article) => <li key={article.id}><a href={article.path} onClick={(event) => navigateInternalLink(event, () => onOpenArticle(article.path))}>{article.title}</a></li>)}</ul></Stack>}
    </article>
  </main>;
}
