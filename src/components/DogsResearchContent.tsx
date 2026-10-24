import { ArrowRight, ChartNoAxesColumnIncreasing, FileText, Network, PawPrint, Search, Sparkles } from "lucide-react";
import researchData from "../data/dogs-research.json";
import recordsData from "../data/records.json";
import type { EvidenceRecord, WorkRecord } from "../types";
import type { MouseEvent, ReactNode } from "react";
import { navigateToWorkSection } from "./WorkSectionNav";

const research = researchData;
const records = recordsData as EvidenceRecord[];
const recordById = new Map(records.map((record) => [record.id, record]));
const number = new Intl.NumberFormat("en-US");

const intakeCategories = [
  { measure: "stray_intake", label: "Stray" },
  { measure: "confiscated_intake", label: "Confiscated" },
  { measure: "owner_surrender_intake", label: "Owner surrendered" },
  { measure: "other_intake_categories_combined", label: "Other intake categories" },
  { measure: "spay_neuter_service_intake", label: "Spay/neuter service" },
];
const outcomeCategories = [
  { measure: "rescue_or_transfer", label: "Rescue transfers" },
  { measure: "adoption", label: "Adopted" },
  { measure: "return_to_owner", label: "Returned to owner" },
  { measure: "euthanasia", label: "Euthanized" },
  { measure: "other_disposition_categories_combined", label: "Other" },
  { measure: "missing", label: "Missing" },
  { measure: "died", label: "Died" },
];

function measurement(measure: string) {
  return research.measurements.find((entry) => entry.measure === measure && entry.species === "dog");
}

function sourceForRecord(id: string) {
  const record = recordById.get(id);
  return record?.source.url ? { url: record.source.url, label: record.source.publisher || record.title } : null;
}

function formatDate(value?: string | null) {
  if (!value) return "Date unknown";
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(date);
}

function Section({ id, title, icon, children, card = false }: { id?: string; title: string; icon?: ReactNode; children: ReactNode; card?: boolean }) {
  return <section id={id} className={`research-section${card ? " work-content-section gap-refined-card is-card" : ""}`}><div className={`research-section-heading${card ? " work-content-heading" : ""}`}>{icon}<h2>{title}</h2></div>{children}</section>;
}

function SourceLink({ recordId, label }: { recordId: string; label?: string }) {
  const source = sourceForRecord(recordId);
  return source ? <a className="research-source" href={source.url} target="_blank" rel="noreferrer">{label || source.label} <ArrowRight size={14} aria-hidden="true" /></a> : null;
}

function MetricSummary({ items, compact = false }: { items: Array<{ label: string; value: number | undefined }>; compact?: boolean }) {
  return <div className={`research-metrics${compact ? " is-compact" : ""}`}>{items.map(({ label, value }) => <div className="research-metric" key={label}><strong>{value === undefined ? "Unknown" : number.format(value)}</strong><span>{label}</span></div>)}</div>;
}

function HorizontalChart({ title, categories }: { title: string; categories: Array<{ label: string; value: number }> }) {
  const max = Math.max(...categories.map((category) => category.value), 1);
  return <figure className="research-chart" aria-label={title}><figcaption>{title}</figcaption><ul>{categories.map(({ label, value }) => <li key={label}><span className="research-chart-label">{label}</span><div className="research-chart-track" aria-hidden="true"><div className="research-chart-bar" style={{ width: `${(value / max) * 100}%` }} /></div><strong>{number.format(value)}</strong></li>)}</ul></figure>;
}

export function DogsResearchContent({ item }: { item: WorkRecord; onOpenReport: (id: string) => void }) {
  if (item.research_data_id !== research.id) return <div className="work-page-content"><p className="work-empty">Research data is not available for this work item.</p></div>;

  const intakeTotal = measurement("all_reported_intakes");
  const stray = measurement("stray_intake");
  const outcomeTotal = measurement("all_reported_dispositions");
  const intake = intakeCategories.map(({ measure, label }) => ({ label, value: measurement(measure)?.value })).filter((entry): entry is { label: string; value: number } => entry.value !== undefined);
  const outcomes = outcomeCategories.map(({ measure, label }) => ({ label, value: measurement(measure)?.value })).filter((entry): entry is { label: string; value: number } => entry.value !== undefined);
  const signal = research.reported_signals[0];
  const coverage = intakeTotal && research.coverage[intakeTotal.coverage_id as keyof typeof research.coverage];
  const period = intakeTotal ? `Calendar year ${intakeTotal.period_start.slice(0, 4)}` : "Reporting period unknown";
  const publisher = intakeTotal ? recordById.get(intakeTotal.source_record_id)?.source.publisher : undefined;
  const recordsRequest = recordById.get("crossover-2026-10-20-sas-field-call-records-request");
  const reviewRecords = (item.record_ids ?? []).map((id) => recordById.get(id)).filter((record): record is EvidenceRecord => Boolean(record)).sort((a, b) => (b.checked_at || b.recorded_at || b.published_at || "").localeCompare(a.checked_at || a.recorded_at || a.published_at || ""));

  const intakeMetrics = [{ label: "Total dog intake events", value: intakeTotal?.value }, { label: "Stray intake events", value: stray?.value }, { label: "Owner-surrender events", value: measurement("owner_surrender_intake")?.value }];
  const outcomeMetrics = [{ label: "Rescue transfers", value: measurement("rescue_or_transfer")?.value }, { label: "Adoptions", value: measurement("adoption")?.value }, { label: "Returns to owners", value: measurement("return_to_owner")?.value }];
  const jump = (event: MouseEvent<HTMLAnchorElement>, id: string) => { event.preventDefault(); navigateToWorkSection(id); };

  return <div className="work-page-content research-content">
    <Section id="research-at-a-glance" title="At a glance" icon={<ChartNoAxesColumnIncreasing size={20} aria-hidden="true" />} card>
      <p className="research-section-intro gap-mobile-body">We're investigating how emerging technology could help Stockton's street dogs. First, we're examining reported conditions, the current response, and what remains uncertain.</p>
      <div className="research-glance-grid">
        <a className="research-glance-panel is-problem" href="#research-need" onClick={(event) => jump(event, "research-need")}>
          <div className="research-glance-heading"><PawPrint size={29} aria-hidden="true" /><h3>What public sources report</h3></div>
          <p className="research-glance-description">Most documented intake events were classified as stray; the current street population is unknown.</p>
          <MetricSummary items={intakeMetrics} compact />
          <span className="research-glance-link">Explore the need <ArrowRight size={15} aria-hidden="true" /></span>
        </a>
        <a className="research-glance-panel is-system" href="#research-system" onClick={(event) => jump(event, "research-system")}>
          <div className="research-glance-heading"><Network size={29} aria-hidden="true" /><h3>The current system</h3></div>
          <p className="research-glance-description">Many dogs are transferred or adopted, while significant numbers have other outcomes.</p>
          <MetricSummary items={outcomeMetrics} compact />
          <span className="research-glance-link">Explore outcomes <ArrowRight size={15} aria-hidden="true" /></span>
        </a>
        <a className="research-glance-panel is-improvements" href="#research-factors" onClick={(event) => jump(event, "research-factors")}>
          <div className="research-glance-heading"><Search size={29} aria-hidden="true" /><h3>What remains unknown</h3></div>
          <p className="research-glance-description">Public figures establish some intake and outcome counts. They do not measure the current street population or show where each help route gets stuck.</p>
          <span className="research-glance-link">Explore missing measurements <ArrowRight size={15} aria-hidden="true" /></span>
        </a>
      </div>
      <p className="research-glance-scope">Figures are {period.toLowerCase()} events and dispositions across the Stockton Animal Services multi-jurisdiction service area.</p>
    </Section>

    <Section id="research-whats-new" title="What's New" icon={<Sparkles size={20} aria-hidden="true" />} card>
      <p className="research-section-intro gap-mobile-body">New findings and meaningful changes in what we know.</p>
      {research.latest_findings.length ? <div className="research-findings">{research.latest_findings.map((finding) => <article id={finding.id} key={finding.id}><div className="research-finding-meta">Identified in review · {formatDate(finding.discovered_at)}</div><h3>{finding.finding}</h3><p className="gap-mobile-body">{finding.what_changed}</p><p className="research-finding-why">{finding.why_it_matters}</p><div className="research-sources">{finding.evidence_record_ids.map((id) => <SourceLink key={id} recordId={id} label="View supporting source" />)}</div></article>)}</div> : <p className="gap-mobile-body">No significant changes were found in the latest review.</p>}
    </Section>

    <Section id="research-need" title="The Need in Detail" icon={<ChartNoAxesColumnIncreasing size={20} aria-hidden="true" />} card>
      <p className="research-section-intro gap-mobile-body">The shelter's annual intake report shows the scale and mix of dogs entering its care.</p>
      <aside className="research-signal research-measurement">
        <h3>Can we measure the need?</h3>
        <MetricSummary items={[{ label: "2024 stray intake events · SAS multi-jurisdiction service area", value: stray?.value }, { label: "Dogs currently on Stockton streets · no verified population estimate", value: undefined }]} />
        <p className="gap-mobile-body">Shelter intake events are not a Stockton-city-only count or an estimate of dogs currently on the streets.</p>
        <p className="gap-mobile-body"><strong>What we're trying to establish:</strong> Can Animal Services field calls, rescue records, and repeated firsthand observations show where dogs need care and how often requests are resolved?</p>
        {recordsRequest && <p className="gap-mobile-body">Field-call records requested {formatDate(recordsRequest.occurred_at)}. {recordsRequest.outcome?.summary}</p>}
        <div className="research-sources">
          {stray && <SourceLink recordId={stray.source_record_id} label="Official 2024 kennel report" />}
          {recordsRequest?.work_id && <a className="research-source" href="/reality/too-many-dogs-still-lack-safe-placement/our-findings/#investigation-records-request">View request activity <ArrowRight size={14} aria-hidden="true" /></a>}
          <a className="research-source" href="/reality/too-many-dogs-still-lack-safe-placement/our-findings/#investigation-questions">Explore the investigation <ArrowRight size={14} aria-hidden="true" /></a>
        </div>
      </aside>
      <div className="research-detail-grid"><div className="research-detail-copy">
        <p className="research-scope">{publisher || "Stockton Animal Services"} · {period} · Multi-jurisdiction service area</p>
        <MetricSummary items={intakeMetrics} />
        {intakeTotal && stray && <p className="research-interpretation gap-mobile-body">About {Math.round((stray.value / intakeTotal.value) * 100)}% of recorded intake events were classified as strays. That does not tell us how many dogs were abandoned or are currently roaming Stockton.</p>}
        {coverage && <p className="research-coverage">Geographic coverage: {coverage}</p>}
        {intakeTotal && <SourceLink recordId={intakeTotal.source_record_id} label="Official kennel report" />}
      </div><HorizontalChart title="Dog intake by reported category" categories={intake} /></div>
      {signal && <aside className="research-signal"><h3>More recent demand signal</h3><p className="gap-mobile-body">In {signal.reporting_period}, Stockton Streetdogs reported approximately {signal.current_range[0]}–{signal.current_range[1]} dumped-dog encounters per week, compared with roughly {signal.comparison_value_approximate} per week {signal.comparison_period}. This is an organizational report, not a citywide count, and is separate from shelter intake.</p><SourceLink recordId={signal.source_record_id} label="View Stockton Streetdogs report" /></aside>}
    </Section>

    <Section id="research-system" title="The Current System" icon={<Network size={20} aria-hidden="true" />} card>
      <p className="research-section-intro gap-mobile-body">Reported dispositions show what happened to dogs leaving shelter care during the year.</p>
      <div className="research-detail-grid"><div className="research-detail-copy">
        <p className="research-scope">{publisher || "Stockton Animal Services"} · {period} · Multi-jurisdiction service area</p>
        <MetricSummary items={outcomeMetrics} />
        <p className="research-interpretation gap-mobile-body">Rescue transfers were the largest documented outcome category. Receiving rescues are therefore an important part of the care system, but transfer does not necessarily mean final adoption. Dogs leaving care during a calendar year need not be the same dogs who entered that year. The difference between annual intake and disposition totals cannot measure how many dogs remained in care.</p>
        {outcomeTotal && <SourceLink recordId={outcomeTotal.source_record_id} label="Official kennel report" />}
        <p className="research-limitation gap-mobile-body">Latest comparable 2025–2026 results, current shelter occupancy, and broader rescue-network outcomes have not yet been verified.</p>
      </div><HorizontalChart title={`Reported dog dispositions · ${outcomeTotal ? number.format(outcomeTotal.value) : "total unknown"} total`} categories={outcomes} /></div>
    </Section>

    <Section id="research-factors" title="What the evidence cannot yet tell us" icon={<ChartNoAxesColumnIncreasing size={20} aria-hidden="true" />} card>
      <div className="research-factor-list">
        <p className="gap-mobile-body"><strong>Dogs entering street need.</strong> The 2024 report counts stray intake events across a multi-jurisdiction area; a current Stockton street population is unknown.</p>
        <p className="gap-mobile-body"><strong>Observation and reporting.</strong> Published reports describe sightings and encounters; the share of dogs identified and reported is unknown. <a href="/reality/too-many-dogs-still-lack-safe-placement/dogs-locations-map/">Review the historical map</a>.</p>
        <p className="gap-mobile-body"><strong>Response to reports.</strong> Field-call records have been requested. The number of reports that lead to a response or resolved need is unknown.</p>
        <p className="gap-mobile-body"><strong>Shelter capacity.</strong> Annual intakes and dispositions establish past throughput; current open places, staffing, and time waiting are unknown.</p>
        <p className="gap-mobile-body"><strong>Foster and rescue capacity.</strong> The report records rescue transfers, but current available places and outcomes after transfer are unknown.</p>
        <p className="gap-mobile-body"><strong>Adoption and reunification.</strong> Historical adoption and return counts are available; current access, delays, and outcomes for individual dogs are unknown.</p>
        <p className="gap-mobile-body"><strong>Prevention.</strong> Spay/neuter service events are reported, but current access and any effect on future placement need are unknown.</p>
      </div>
      <p className="gap-mobile-body"><a className="research-source" href="/reality/too-many-dogs-still-lack-safe-placement/ways-to-help/">See pathway evaluations <ArrowRight size={14} aria-hidden="true" /></a></p>
    </Section>

    <Section id="research-improvements" title="Improvements under review" card>
      <p className="gap-mobile-body">The full inventory of facilities, contracts, and programs is now tracked in <a href="/reality/too-many-dogs-still-lack-safe-placement/improvements/#solutions-improvements">Improvements <ArrowRight size={14} aria-hidden="true" /></a>. Project stages do not establish delivered care.</p>
    </Section>

    <Section id="research-sources" title="Research & Sources" icon={<FileText size={20} aria-hidden="true" />}>
      <p className="research-section-intro gap-mobile-body">Source reviews are retained here, newest first. The original review remains part of the record.</p>
      <div className="research-review-list">{reviewRecords.map((record) => <article key={record.id}><time>{formatDate(record.published_at || record.recorded_at || record.checked_at)}</time><h3>{record.title}</h3><p className="gap-mobile-body">{record.summary}</p>{record.source.url ? <SourceLink recordId={record.id} label="View source" /> : <span>{record.source.publisher || "Internal record"}</span>}</article>)}</div>
    </Section>
  </div>;
}
