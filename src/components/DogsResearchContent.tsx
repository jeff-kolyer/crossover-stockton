import { ArrowRight, FileText, Sparkles } from "lucide-react";
import researchData from "../data/dogs-research.json";
import projectsData from "../data/projects.json";
import recordsData from "../data/records.json";
import type { CapacityProject, EvidenceRecord, WorkRecord } from "../types";
import type { ReactNode } from "react";

const research = researchData;
const projects = projectsData as CapacityProject[];
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

function Section({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return <section className="research-section"><div className="research-section-heading">{icon}<h2>{title}</h2></div>{children}</section>;
}

function SourceLink({ recordId, label }: { recordId: string; label?: string }) {
  const source = sourceForRecord(recordId);
  return source ? <a className="research-source" href={source.url} target="_blank" rel="noreferrer">{label || source.label} <ArrowRight size={14} aria-hidden="true" /></a> : null;
}

function MetricSummary({ items }: { items: Array<{ label: string; value: number | undefined }> }) {
  return <div className="research-metrics">{items.map(({ label, value }) => <div className="research-metric" key={label}><strong>{value === undefined ? "Unknown" : number.format(value)}</strong><span>{label}</span></div>)}</div>;
}

function HorizontalChart({ title, categories }: { title: string; categories: Array<{ label: string; value: number }> }) {
  const max = Math.max(...categories.map((category) => category.value), 1);
  return <figure className="research-chart" aria-label={title}><figcaption>{title}</figcaption><ul>{categories.map(({ label, value }) => <li key={label}><div className="research-chart-line"><span>{label}</span><strong>{number.format(value)}</strong></div><div className="research-chart-track" aria-hidden="true"><div className="research-chart-bar" style={{ width: `${(value / max) * 100}%` }} /></div></li>)}</ul></figure>;
}

function ProjectStatus({ project }: { project: CapacityProject }) {
  const stage = project.development_stage.replace(/_/g, " ");
  if (project.development_stage === "operational" && project.operational_status === "operational") return <span className="research-project-status">Operational</span>;
  const operation = project.operational_status === "unknown" ? "Services unverified" : project.operational_status === "not_operational" ? "Not operational" : project.operational_status === "partially_operational" ? "Partly operational" : "Operational";
  return <span className="research-project-status">{stage} · {operation}</span>;
}

function ProjectSources({ project, onOpenReport }: { project: CapacityProject; onOpenReport: (id: string) => void }) {
  const seen = new Set<string>();
  const links: Array<{ url: string; label: string; reportId?: string }> = [];
  for (const id of project.evidence_record_ids) {
    const record = recordById.get(id);
    if (!record) continue;
    const url = record.record_type === "field_report" ? `/reports/${id}/` : record.source.url;
    if (url && !seen.has(url)) { links.push({ url, label: record.record_type === "field_report" ? "Crossover field report" : record.source.publisher || "Source", reportId: record.record_type === "field_report" ? id : undefined }); seen.add(url); }
  }
  const additionalUrls = project.development_stage === "completed" ? [...(project.source_urls ?? [])].reverse() : [...(project.source_urls ?? []), ...(project.funding_source_urls ?? [])];
  for (const url of additionalUrls) {
    if (!seen.has(url)) { links.push({ url, label: new URL(url).hostname.replace(/^www\./, ""), }); seen.add(url); }
  }
  return <div className="research-project-sources">{links.slice(0, 2).map((link) => <a key={link.url} href={link.url} target={link.reportId ? undefined : "_blank"} rel={link.reportId ? undefined : "noreferrer"} onClick={link.reportId ? (event) => { event.preventDefault(); onOpenReport(link.reportId!); } : undefined}>{link.label} <ArrowRight size={13} aria-hidden="true" /></a>)}</div>;
}

function ProjectRow({ project, onOpenReport }: { project: CapacityProject; onOpenReport: (id: string) => void }) {
  const milestone = [...project.milestones].filter((entry) => entry.date).sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))[0];
  const benefitLabel = project.development_stage === "funded" ? "Authorized target" : project.expected_capacity_or_benefit?.status === "proposed" ? "Proposed benefit" : "Reported benefit";
  return <article className="research-project"><div className="research-project-top"><h3>{project.title}</h3><ProjectStatus project={project} /></div>{project.expected_capacity_or_benefit && <p className="research-project-quantity"><span>{benefitLabel}</span>{project.expected_capacity_or_benefit.description}</p>}<p className="gap-mobile-body">{project.demand_contribution || project.intended_outcome}</p>{milestone && <p className="research-project-milestone"><strong>Latest milestone · {formatDate(milestone.date)}:</strong> {milestone.description}</p>}<p className="research-project-actual"><strong>Delivered capacity:</strong> {project.actual_additional_capacity?.description || "Additional capacity or service output has not been verified."}</p><ProjectSources project={project} onOpenReport={onOpenReport} /></article>;
}

export function DogsResearchContent({ item, onOpenReport }: { item: WorkRecord; onOpenReport: (id: string) => void }) {
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
  const reviewRecords = (item.record_ids ?? []).map((id) => recordById.get(id)).filter((record): record is EvidenceRecord => Boolean(record)).sort((a, b) => (b.checked_at || b.recorded_at || b.published_at || "").localeCompare(a.checked_at || a.recorded_at || a.published_at || ""));
  const selectedProjects = research.planned_improvements.project_ids.map((id) => projects.find((project) => project.id === id)).filter((project): project is CapacityProject => Boolean(project));

  return <div className="work-page-content research-content">
    <Section title="What's New" icon={<Sparkles size={21} aria-hidden="true" />}>
      <p className="research-section-intro gap-mobile-body">Meaningful changes found in the latest research review.</p>
      {research.latest_findings.length ? <div className="research-findings">{research.latest_findings.map((finding) => <article key={finding.id}><div className="research-finding-meta">Discovered {formatDate(finding.discovered_at)}</div><h3>{finding.finding}</h3><p className="gap-mobile-body">{finding.what_changed}</p><p className="research-finding-why">{finding.why_it_matters}</p><div className="research-sources">{finding.evidence_record_ids.map((id) => <SourceLink key={id} recordId={id} label="View supporting source" />)}</div></article>)}</div> : <p className="gap-mobile-body">No significant changes were found in the latest review.</p>}
    </Section>

    <Section title="The Need in Detail">
      <p className="research-section-intro gap-mobile-body">The shelter's annual intake report shows the scale and mix of dogs entering its care.</p>
      <p className="research-scope">{publisher || "Stockton Animal Services"} · {period} · Multi-jurisdiction service area</p>
      <MetricSummary items={[{ label: "Total dog intake events", value: intakeTotal?.value }, { label: "Stray intake events", value: stray?.value }, { label: "Owner-surrender events", value: measurement("owner_surrender_intake")?.value }]} />
      <HorizontalChart title="Dog intake by reported category" categories={intake} />
      {intakeTotal && stray && <p className="research-interpretation gap-mobile-body">About {Math.round((stray.value / intakeTotal.value) * 100)}% of recorded intake events were classified as strays. That does not tell us how many dogs were abandoned or are currently roaming Stockton.</p>}
      {coverage && <p className="research-coverage">Geographic coverage: {coverage}</p>}
      {intakeTotal && <SourceLink recordId={intakeTotal.source_record_id} label="Official kennel report" />}
      {signal && <aside className="research-signal"><h3>More recent demand signal</h3><p className="gap-mobile-body">In {signal.reporting_period}, Stockton Streetdogs reported approximately {signal.current_range[0]}–{signal.current_range[1]} dumped-dog encounters per week, compared with roughly {signal.comparison_value_approximate} per week {signal.comparison_period}. This is an organizational report, not a citywide count, and is separate from shelter intake.</p><SourceLink recordId={signal.source_record_id} label="View Stockton Streetdogs report" /></aside>}
    </Section>

    <Section title="The Current System">
      <p className="research-section-intro gap-mobile-body">Reported dispositions show what happened to dogs leaving shelter care during the year.</p>
      <p className="research-scope">{publisher || "Stockton Animal Services"} · {period} · Multi-jurisdiction service area</p>
      <MetricSummary items={[{ label: "Rescue transfers", value: measurement("rescue_or_transfer")?.value }, { label: "Adoptions", value: measurement("adoption")?.value }, { label: "Returns to owners", value: measurement("return_to_owner")?.value }]} />
      <HorizontalChart title={`Reported dog dispositions · ${outcomeTotal ? number.format(outcomeTotal.value) : "total unknown"} total`} categories={outcomes} />
      <p className="research-interpretation gap-mobile-body">Rescue transfers were the largest documented outcome category. Receiving rescues are therefore an important part of the care system, but transfer does not necessarily mean final adoption. Dogs leaving care during a calendar year need not be the same dogs who entered that year. The difference between annual intake and disposition totals cannot measure how many dogs remained in care.</p>
      {outcomeTotal && <SourceLink recordId={outcomeTotal.source_record_id} label="Official kennel report" />}
      <p className="research-limitation gap-mobile-body">Latest comparable 2025–2026 results, current shelter occupancy, and broader rescue-network outcomes have not yet been verified.</p>
    </Section>

    <Section title="Improvements Underway">
      <p className="research-section-intro gap-mobile-body">These facilities and programs could increase care or prevent dogs from losing placement. Their stages and delivered results remain distinct.</p>
      <div className="research-project-list">{selectedProjects.map((project) => <ProjectRow key={project.id} project={project} onOpenReport={onOpenReport} />)}</div>
    </Section>

    <Section title="Research & Sources" icon={<FileText size={20} aria-hidden="true" />}>
      <p className="research-section-intro gap-mobile-body">Source reviews are retained here, newest first. The original review remains part of the record.</p>
      <div className="research-review-list">{reviewRecords.map((record) => <article key={record.id}><time>{formatDate(record.published_at || record.recorded_at || record.checked_at)}</time><h3>{record.title}</h3><p className="gap-mobile-body">{record.summary}</p>{record.source.url ? <SourceLink recordId={record.id} label="View source" /> : <span>{record.source.publisher || "Internal record"}</span>}</article>)}</div>
    </Section>
  </div>;
}
