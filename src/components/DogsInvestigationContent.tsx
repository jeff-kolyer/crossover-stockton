import { Archive, ArrowRight, CheckCircle2, CircleHelp, ClipboardList, FileSearch, HeartPulse, MapPin, Package, Route, Search, Users } from "lucide-react";
import investigationsData from "../data/dogs-investigations.json";
import locationsData from "../data/investigation-locations.json";
import projectsData from "../data/projects.json";
import recordsData from "../data/records.json";
import type { ActiveInvestigation, CapacityProject, DogsInvestigationData, EvidenceRecord, WorkRecord } from "../types";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { InvestigationLocations } from "./InvestigationLocations";

const data = investigationsData as DogsInvestigationData;
const records = recordsData as EvidenceRecord[];
const projects = projectsData as CapacityProject[];
const recordById = new Map(records.map((record) => [record.id, record]));
const projectById = new Map(projects.map((project) => [project.id, project]));
const mapSourceById = new Map(locationsData.map((location) => [location.id, location.source_url]));
const questionIcons = { ClipboardList, HeartPulse, MapPin, Package, Users };
const evidenceLabels: Record<string, string> = {
  "Organization report": "Organization reports",
  "Published local report": "Published reporting",
  "Official public data": "Official data",
  "Crossover firsthand": "Our observations",
};

function InvestigationSection({ id, title, icon, children }: { id?: string; title: string; icon: ReactNode; children: ReactNode }) {
  return <section id={id} className="investigation-section"><div className="investigation-section-heading">{icon}<h2>{title}</h2></div>{children}</section>;
}

function EvidenceLink({ recordId, onOpenReport, label }: { recordId: string; onOpenReport: (id: string) => void; label?: string }) {
  const record = recordById.get(recordId);
  if (!record) return null;
  if (record.record_type === "field_report") return <a className="investigation-source" href={`/reports/${recordId}/`} onClick={(event) => { event.preventDefault(); onOpenReport(recordId); }}>{label || "Read Crossover field report"} <ArrowRight size={14} aria-hidden="true" /></a>;
  if (record.record_type === "activity" && record.work_id) return <a className="investigation-source" href={`/work/${record.work_id}/#${recordId}`}>{label || `Activity: ${record.title}`} <ArrowRight size={14} aria-hidden="true" /></a>;
  if (record.source.url) return <a className="investigation-source" href={record.source.url} target="_blank" rel="noreferrer">{label || `View source: ${record.source.publisher || record.title}`} <ArrowRight size={14} aria-hidden="true" /></a>;
  return <span className="investigation-source-note">Source: {record.source.publisher || "Internal Crossover record"}</span>;
}

function RecordReferences({ ids, onOpenReport }: { ids: string[]; onOpenReport: (id: string) => void }) {
  const selected = ids.map((id) => recordById.get(id)).filter((record): record is EvidenceRecord => Boolean(record));
  return selected.length ? <div className="investigation-record-references">{selected.map((record) => <article key={record.id}><h4>{record.title}</h4><p className="gap-mobile-body">{record.summary}</p><EvidenceLink recordId={record.id} onOpenReport={onOpenReport} /></article>)}</div> : null;
}

function ActiveInvestigationView({ investigation, onOpenReport, showMap }: { investigation: ActiveInvestigation; onOpenReport: (id: string) => void; showMap: boolean }) {
  const statusLabel = investigation.status === "preparing_fieldwork" ? "Preparing fieldwork" : investigation.status === "in_progress" ? "In progress" : "Completed";
  return <>
    <InvestigationSection id="investigation-questions" title="What we're investigating" icon={<CircleHelp size={20} aria-hidden="true" />}>
      <div className="investigation-active-top"><h3>{investigation.title}</h3><span className={`investigation-status ${investigation.status === "completed" ? "is-completed" : "is-in-progress"}`}>{statusLabel}</span></div>
      <p className="investigation-intro gap-mobile-body">{investigation.introduction}</p>
      <div className="investigation-question-grid">{investigation.questions.map((question) => {
        const Icon = questionIcons[question.icon];
        return <div className="investigation-question" key={question.id}><div className="investigation-question-heading"><Icon size={20} aria-hidden="true" /><h4>{question.title}</h4></div><p className="gap-mobile-body">{question.description}</p></div>;
      })}</div>
    </InvestigationSection>

    <InvestigationSection id="investigation-methods" title="How we'll verify the need" icon={<Search size={20} aria-hidden="true" />}>
      <p className="gap-mobile-body">These four avenues complement one another. A planned visit, contact attempt, or public report is not a verified finding.</p>
      <ol className="investigation-verification-avenues">{investigation.verification_avenues.map((avenue) => <li key={avenue.title}><h3>{avenue.title}</h3><p className="gap-mobile-body">{avenue.description}</p></li>)}</ol>
    </InvestigationSection>

    {investigation.fieldwork_plan && (() => {
      const plan = recordById.get(investigation.fieldwork_plan.activity_record_id);
      return <InvestigationSection id="field-observation-procedure" title="Field verification plan" icon={<Route size={20} aria-hidden="true" />}>
        <p className="gap-mobile-body"><strong>{plan?.planned_for ? `Planned for ${plan.planned_for}.` : "Visit date to be confirmed."}</strong> The plan was recorded October 20, 2026. No completed visit or firsthand street-condition finding has been documented.</p>
        {plan?.planned_sites?.length ? <ol className="investigation-field-sites">{plan.planned_sites.map((site) => <li key={site.label}><strong>{site.label}</strong><p className="gap-mobile-body">{site.reason} {site.condition}</p>{site.location_id && mapSourceById.get(site.location_id) && <a className="investigation-source" href={mapSourceById.get(site.location_id)} target="_blank" rel="noreferrer">View original report <ArrowRight size={14} aria-hidden="true" /></a>}</li>)}</ol> : null}
        <details className="investigation-field-template"><summary>Observation record template</summary><p className="gap-mobile-body">Record one visit at a time. Do not treat a dog outdoors as stray, abandoned, or neglected based on location alone.</p><ul>{investigation.fieldwork_plan.observation_fields.map((field) => <li key={field}>{field}</li>)}</ul><h3>Supported results</h3><ul>{investigation.fieldwork_plan.result_options.map((result) => <li key={result}>{result}</li>)}</ul><p className="gap-mobile-body">{investigation.fieldwork_plan.report_outline}</p></details>
        <p className="investigation-approach gap-mobile-body"><strong>Safety and privacy.</strong> {investigation.public_approach}</p>
      </InvestigationSection>;
    })()}

    {investigation.contact_plan && <InvestigationSection id="investigation-contacts" title="Contact and evidence plan" icon={<Users size={20} aria-hidden="true" />}>
      <p className="gap-mobile-body">{investigation.contact_plan.intro}</p>
      <p className="gap-mobile-body"><strong>Participation question:</strong> {investigation.care_coordination?.central_question}</p>
      <div className="investigation-contact-list">{investigation.contact_plan.organizations.map((organization) => <details key={organization.name}>
        <summary><strong>{organization.name}</strong><span><b>Documented status:</b> {organization.status}</span></summary>
        <ul>{organization.questions.map((question) => <li key={question}>{question}</li>)}</ul>
        <div className="investigation-source-links">{organization.record_ids.map((id) => <EvidenceLink key={id} recordId={id} onOpenReport={onOpenReport} />)}{organization.source_links.map((source) => <a className="investigation-source" key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} <ArrowRight size={14} aria-hidden="true" /></a>)}</div>
      </details>)}</div>
      <details className="investigation-contact-checks"><summary>What we'll check in each conversation</summary><ul>{investigation.contact_plan.shared_checks.map((check) => <li key={check}>{check}</li>)}</ul></details>
      {investigation.care_coordination && <p className="investigation-approach gap-mobile-body"><strong>Public pages checked {investigation.care_coordination.public_source_review.checked_at}.</strong> {investigation.care_coordination.public_source_review.summary}</p>}
    </InvestigationSection>}

    {investigation.records_request && <InvestigationSection id="investigation-records-request" title="Animal Services records request" icon={<FileSearch size={20} aria-hidden="true" />}>
      <p className="gap-mobile-body"><strong>{investigation.records_request.status}</strong> · {investigation.records_request.submitted_at}</p>
      <p className="gap-mobile-body">{investigation.records_request.summary}</p>
      <p className="gap-mobile-body"><strong>Next: Review Animal Services field-call records.</strong> Awaiting response. {investigation.records_request.review_plan}</p>
      {recordById.get(investigation.records_request.activity_record_id) && <a className="investigation-source" href={`/work/dogs-direct-field-work/#${investigation.records_request.activity_record_id}`}>View records request activity <ArrowRight size={14} aria-hidden="true" /></a>}
    </InvestigationSection>}

    {showMap && <InvestigationLocations investigationId={investigation.id} onOpenReport={onOpenReport} />}

    <InvestigationSection id="investigation-knowledge" title="Evidence so far" icon={<FileSearch size={20} aria-hidden="true" />}>
      <p className="gap-mobile-body">{investigation.known_so_far}</p>
      <div className="investigation-evidence-context">{investigation.evidence_context.map((entry) => <article key={entry.label}><h3>{evidenceLabels[entry.label] ?? entry.label}</h3><p className="gap-mobile-body">{entry.summary}</p>{entry.record_id && <EvidenceLink recordId={entry.record_id} onOpenReport={onOpenReport} />}</article>)}</div>
      <div className="investigation-unresolved"><h3>Still to establish</h3><ul>{investigation.uncertainties.map((uncertainty) => <li key={uncertainty}>{uncertainty}</li>)}</ul></div>
      <p className="gap-mobile-body"><strong>Track the result:</strong> A report submitted, a sighting checked, a request made, a response received, an animal given care, a reunion, and a resolved need are distinct findings. Where the outcome is unknown, we say so.</p>
    </InvestigationSection>

  </>;
}

function PotentialResponses({ investigation }: { investigation: ActiveInvestigation }) {
  const coordination = investigation.care_coordination;
  return <InvestigationSection id="investigation-outcomes" title="Potential responses" icon={<Route size={20} aria-hidden="true" />}>
    <p className="gap-mobile-body">These are possibilities to test once needs, safe pathways, and responsible partners are confirmed. They are not proven solutions or operating Crossover services.</p>
    <p className="gap-mobile-body"><strong>Why care matters.</strong> {investigation.purpose}</p>
    <ul className="investigation-outcomes">{investigation.possible_outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
    {coordination && <details className="investigation-response-detail"><summary>Care coordination workflow — concept only</summary>
      <p className="gap-mobile-body">{coordination.participation_scope}</p>
      <ol>{coordination.decentralized_protocol_concept.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      <p className="gap-mobile-body">{coordination.decentralized_protocol_concept.note}</p>
      {coordination.potential_capabilities?.length ? <><h3>Capabilities to investigate</h3><ul>{coordination.potential_capabilities.map((capability) => <li key={capability}>{capability}</li>)}</ul><p className="gap-mobile-body">{coordination.capability_note}</p></> : null}
      <p className="gap-mobile-body"><strong>Possible outcome:</strong> {coordination.potential_outcome}</p>
    </details>}
    {investigation.participation_roles?.length ? <details className="investigation-response-detail"><summary>Ways people might participate — statuses vary</summary>
      <p className="gap-mobile-body">Available means a public action route exists. Investigating means requirements or coordination are being checked. Proposed means no working role has been established. An available action does not confirm that a dog received care.</p>
      <ul>{investigation.participation_roles.map((role) => <li key={role.name}><strong>{role.name} · {role.state[0].toUpperCase() + role.state.slice(1)}</strong> — {role.purpose}{role.action_id ? <> · <a href="/action/">See actions</a></> : null}</li>)}</ul>
    </details> : null}
    <div className="investigation-example"><span>Illustrative outcome</span><strong>{investigation.illustrative_outcome.title}</strong><p className="gap-mobile-body">{investigation.illustrative_outcome.description}</p></div>
    <p className="investigation-opportunity-rule gap-mobile-body">{investigation.opportunity_rule}</p>
  </InvestigationSection>;
}

export function DogsInvestigationContent({ item, onOpenReport, includeMap = true }: { item: WorkRecord; onOpenReport: (id: string) => void; includeMap?: boolean }) {
  useEffect(() => {
    if (window.location.hash !== "#field-observation-procedure") return;
    const frame = window.requestAnimationFrame(() => document.getElementById("field-observation-procedure")?.scrollIntoView());
    return () => window.cancelAnimationFrame(frame);
  }, [item.id]);
  if (item.investigation_data_id !== data.id) return <div className="work-page-content"><p className="work-empty">Investigation data is not available for this work item.</p></div>;
  const threadRecordIds = new Set((item.threads ?? []).flatMap((thread) => thread.record_ids));
  const findingRecordIds = new Set(data.established_findings.flatMap((finding) => finding.evidence_record_ids));
  const additionalRecordIds = [...new Set([...(item.record_ids ?? []), ...(item.learning_record_ids ?? []), ...(item.report_record_ids ?? [])])].filter((id) => !threadRecordIds.has(id) && !findingRecordIds.has(id));

  return <div className="work-page-content investigation-content">
    {data.active_investigations.map((investigation, index) => <ActiveInvestigationView key={investigation.id} investigation={investigation} onOpenReport={onOpenReport} showMap={includeMap && index === 0} />)}

    <InvestigationSection id="investigation-findings" title="What we've established" icon={<CheckCircle2 size={20} aria-hidden="true" />}>
      <div className="investigation-findings">{data.established_findings.map((finding) => <article key={finding.id}><span className="investigation-finding-kind">{finding.evidence_kind === "crossover_firsthand" ? "Crossover firsthand observation" : finding.evidence_kind.replace(/_/g, " ")}</span><h3>{finding.title}</h3><p className="gap-mobile-body">{finding.summary}</p><div className="investigation-source-links">{finding.evidence_record_ids.map((id) => <EvidenceLink key={id} recordId={id} onOpenReport={onOpenReport} />)}</div></article>)}</div>
    </InvestigationSection>

    {data.active_investigations.map((investigation) => <PotentialResponses key={investigation.id} investigation={investigation} />)}

    <InvestigationSection id="investigation-records" title="Investigation records" icon={<Archive size={20} aria-hidden="true" />}>
      <p className="investigation-records-intro gap-mobile-body">Earlier barrier threads and evidence remain available for deeper review.</p>
      <div className="investigation-thread-list">{(item.threads ?? []).map((thread) => <details key={thread.id}><summary>{thread.title}</summary><div className="investigation-thread-body"><p className="gap-mobile-body">{thread.summary}</p>{thread.open_questions?.length ? <div className="investigation-thread-questions"><h4>Open questions</h4><ul>{thread.open_questions.map((question) => <li key={question}>{question}</li>)}</ul></div> : null}{thread.project_ids?.length ? <p className="investigation-related-projects">Related projects: {thread.project_ids.map((id) => projectById.get(id)?.title || id).join(", ")}.</p> : null}<RecordReferences ids={thread.record_ids} onOpenReport={onOpenReport} /></div></details>)}</div>
      <details className="investigation-earlier-records"><summary>Earlier framing and cross-cutting questions</summary><div className="investigation-thread-body">{item.initial_map?.summary && <p className="gap-mobile-body">{item.initial_map.summary}</p>}{item.open_questions?.length ? <div className="investigation-thread-questions"><h4>Open questions</h4><ul>{item.open_questions.map((question) => <li key={question}>{question}</li>)}</ul></div> : null}<RecordReferences ids={additionalRecordIds} onOpenReport={onOpenReport} /></div></details>
    </InvestigationSection>
  </div>;
}
