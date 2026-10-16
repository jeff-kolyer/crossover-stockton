import { Archive, ArrowRight, CheckCircle2, CircleHelp, FileSearch, HeartPulse, Route, Search, Users, Utensils } from "lucide-react";
import investigationsData from "../data/dogs-investigations.json";
import projectsData from "../data/projects.json";
import recordsData from "../data/records.json";
import type { ActiveInvestigation, CapacityProject, DogsInvestigationData, EvidenceRecord, WorkRecord } from "../types";
import type { ReactNode } from "react";

const data = investigationsData as DogsInvestigationData;
const records = recordsData as EvidenceRecord[];
const projects = projectsData as CapacityProject[];
const recordById = new Map(records.map((record) => [record.id, record]));
const projectById = new Map(projects.map((project) => [project.id, project]));
const questionIcons = { HeartPulse, Utensils, Users };

function InvestigationSection({ title, icon, children, card = false }: { title: string; icon: ReactNode; children: ReactNode; card?: boolean }) {
  return <section className={`investigation-section${card ? " work-content-section gap-refined-card is-card" : ""}`}><div className={`investigation-section-heading${card ? " work-content-heading" : ""}`}>{icon}<h2>{title}</h2></div>{children}</section>;
}

function EvidenceLink({ recordId, onOpenReport, label }: { recordId: string; onOpenReport: (id: string) => void; label?: string }) {
  const record = recordById.get(recordId);
  if (!record) return null;
  if (record.record_type === "field_report") return <a className="investigation-source" href={`/reports/${recordId}/`} onClick={(event) => { event.preventDefault(); onOpenReport(recordId); }}>{label || "Read Crossover field report"} <ArrowRight size={14} aria-hidden="true" /></a>;
  if (record.source.url) return <a className="investigation-source" href={record.source.url} target="_blank" rel="noreferrer">{label || `View source: ${record.source.publisher || record.title}`} <ArrowRight size={14} aria-hidden="true" /></a>;
  return <span className="investigation-source-note">Source: {record.source.publisher || "Internal Crossover record"}</span>;
}

function RecordReferences({ ids, onOpenReport }: { ids: string[]; onOpenReport: (id: string) => void }) {
  const selected = ids.map((id) => recordById.get(id)).filter((record): record is EvidenceRecord => Boolean(record));
  return selected.length ? <div className="investigation-record-references">{selected.map((record) => <article key={record.id}><h4>{record.title}</h4><p className="gap-mobile-body">{record.summary}</p><EvidenceLink recordId={record.id} onOpenReport={onOpenReport} /></article>)}</div> : null;
}

function ActiveInvestigationView({ investigation, onOpenReport }: { investigation: ActiveInvestigation; onOpenReport: (id: string) => void }) {
  const statusLabel = investigation.status === "preparing_fieldwork" ? "Preparing fieldwork" : investigation.status === "in_progress" ? "In progress" : "Completed";
  return <article className="investigation-active">
    <div className="investigation-active-top"><h3>{investigation.title}</h3><span className={`investigation-status ${investigation.status === "completed" ? "is-completed" : "is-in-progress"}`}>{statusLabel}</span></div>
    <p className="investigation-intro gap-mobile-body">{investigation.introduction}</p>
    <p className="investigation-purpose gap-mobile-body"><strong>Why this matters.</strong> {investigation.purpose}</p>

    <div className="investigation-question-grid">{investigation.questions.map((question) => {
      const Icon = questionIcons[question.icon];
      return <div className="investigation-question" key={question.id}><div className="investigation-question-heading"><Icon size={20} aria-hidden="true" /><h4>{question.title}</h4></div><p className="gap-mobile-body">{question.description}</p></div>;
    })}</div>

    <div className="investigation-subsection"><div className="investigation-subheading"><Search size={20} aria-hidden="true" /><h4>How we'll investigate</h4></div><p className="gap-mobile-body">{investigation.method_summary}</p><ul className="investigation-methods">{investigation.methods.map((method) => <li key={method}>{method}</li>)}</ul><p className="investigation-safeguards gap-mobile-body">{investigation.safeguards.join(" ")}</p></div>

    <div className="investigation-subsection"><div className="investigation-subheading"><FileSearch size={20} aria-hidden="true" /><h4>What we know so far</h4></div><p className="gap-mobile-body">{investigation.known_so_far}</p><div className="investigation-evidence-context">{investigation.evidence_context.map((entry) => <div key={entry.label}><strong>{entry.label}</strong><span>{entry.summary}</span>{entry.record_id && <EvidenceLink recordId={entry.record_id} onOpenReport={onOpenReport} />}</div>)}</div><p className="investigation-unresolved gap-mobile-body"><strong>Still unresolved:</strong> {investigation.uncertainties.join(" ")}</p></div>

    <div className="investigation-subsection"><div className="investigation-subheading"><Route size={20} aria-hidden="true" /><h4>What this could lead to</h4></div><p className="gap-mobile-body">The answer could point to one or more of these outcomes:</p><ul className="investigation-outcomes">{investigation.possible_outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul><div className="investigation-example"><span>Illustrative outcome</span><strong>{investigation.illustrative_outcome.title}</strong><p className="gap-mobile-body">{investigation.illustrative_outcome.description}</p></div><p className="investigation-opportunity-rule gap-mobile-body">{investigation.opportunity_rule}</p></div>
  </article>;
}

export function DogsInvestigationContent({ item, onOpenReport }: { item: WorkRecord; onOpenReport: (id: string) => void }) {
  if (item.investigation_data_id !== data.id) return <div className="work-page-content"><p className="work-empty">Investigation data is not available for this work item.</p></div>;
  const threadRecordIds = new Set((item.threads ?? []).flatMap((thread) => thread.record_ids));
  const findingRecordIds = new Set(data.established_findings.flatMap((finding) => finding.evidence_record_ids));
  const additionalRecordIds = [...new Set([...(item.record_ids ?? []), ...(item.learning_record_ids ?? []), ...(item.report_record_ids ?? [])])].filter((id) => !threadRecordIds.has(id) && !findingRecordIds.has(id));

  return <div className="work-page-content investigation-content">
    <InvestigationSection title="What we're investigating" icon={<CircleHelp size={20} aria-hidden="true" />} card>
      {data.active_investigations.map((investigation) => <ActiveInvestigationView key={investigation.id} investigation={investigation} onOpenReport={onOpenReport} />)}
    </InvestigationSection>

    <InvestigationSection title="What we've established" icon={<CheckCircle2 size={20} aria-hidden="true" />} card>
      <div className="investigation-findings">{data.established_findings.map((finding) => <article key={finding.id}><span className="investigation-finding-kind">{finding.evidence_kind === "crossover_firsthand" ? "Crossover firsthand observation" : finding.evidence_kind.replace(/_/g, " ")}</span><h3>{finding.title}</h3><p className="gap-mobile-body">{finding.summary}</p><div className="investigation-source-links">{finding.evidence_record_ids.map((id) => <EvidenceLink key={id} recordId={id} onOpenReport={onOpenReport} />)}</div></article>)}</div>
    </InvestigationSection>

    <InvestigationSection title="Investigation records" icon={<Archive size={20} aria-hidden="true" />}>
      <p className="investigation-records-intro gap-mobile-body">Earlier barrier threads and evidence remain available for deeper review.</p>
      <div className="investigation-thread-list">{(item.threads ?? []).map((thread) => <details key={thread.id}><summary>{thread.title}</summary><div className="investigation-thread-body"><p className="gap-mobile-body">{thread.summary}</p>{thread.open_questions?.length ? <div className="investigation-thread-questions"><h4>Open questions</h4><ul>{thread.open_questions.map((question) => <li key={question}>{question}</li>)}</ul></div> : null}{thread.project_ids?.length ? <p className="investigation-related-projects">Related projects: {thread.project_ids.map((id) => projectById.get(id)?.title || id).join(", ")}.</p> : null}<RecordReferences ids={thread.record_ids} onOpenReport={onOpenReport} /></div></details>)}</div>
      <details className="investigation-earlier-records"><summary>Earlier framing and cross-cutting questions</summary><div className="investigation-thread-body">{item.initial_map?.summary && <p className="gap-mobile-body">{item.initial_map.summary}</p>}{item.open_questions?.length ? <div className="investigation-thread-questions"><h4>Open questions</h4><ul>{item.open_questions.map((question) => <li key={question}>{question}</li>)}</ul></div> : null}<RecordReferences ids={additionalRecordIds} onOpenReport={onOpenReport} /></div></details>
    </InvestigationSection>
  </div>;
}
