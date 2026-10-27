
import projectsData from "../data/projects.json";
import recordsData from "../data/records.json";
import type { CapacityProject, EvidenceRecord, WorkRecord } from "../types";

const projects = projectsData as CapacityProject[];
const records = recordsData as EvidenceRecord[];
const recordById = new Map(records.map((record) => [record.id, record]));
const factors: Record<string, string> = {
  "canine-campus": "Shelter capacity and veterinary care",
  "stockton-animal-shelter-renovation": "Shelter capacity and access to care",
  "stockton-pet-wellness-adoption-center": "Veterinary care, prevention, and adoption",
  "animal-balance-spay-neuter-contract-2026": "Prevention and placement readiness",
  "hard-luck-veterinary-staffing-2026": "Veterinary response and care capacity",
  "pathways-neighborhood": "Housing stability; pet access remains unverified",
};
const successMeasures: Record<string, string> = {
  "canine-campus": "Verify operating dog-care places, dogs admitted, and subsequent care or placement outcomes after opening.",
  "stockton-animal-shelter-renovation": "Verify net usable dog-care places and compare care access and outcomes after opening with the pre-opening baseline.",
  "stockton-pet-wellness-adoption-center": "Verify dog-specific veterinary services and off-site adoptions actually delivered after opening.",
  "animal-balance-spay-neuter-contract-2026": "Reconcile completed dog and cat procedures with the contract target and verify whether sterilization delays changed.",
  "hard-luck-veterinary-staffing-2026": "Verify positions filled and additional veterinary or animal-care services delivered.",
  "pathways-neighborhood": "First verify that dogs can be admitted; then measure actual pet-inclusive placements and housing outcomes.",
};

function stage(project: CapacityProject) {
  if (project.operational_status === "operational") return "Operating";
  if (project.development_stage === "completed") return "Completed; service delivery unverified";
  if (project.development_stage === "under_development") return "Under construction";
  if (project.development_stage === "funded") return "Funded or authorized; delivery unverified";
  if (project.development_stage === "proposed") return "Proposed";
  return "Stage unknown";
}

function ProjectSources({ project, onOpenReport }: { project: CapacityProject; onOpenReport: (id: string) => void }) {
  const sources = project.evidence_record_ids.map((id) => recordById.get(id)).filter((record): record is EvidenceRecord => Boolean(record));
  const extraUrls = [...new Set([...(project.source_urls ?? []), ...(project.funding_source_urls ?? [])])].filter((url) => !sources.some((record) => record.source.url === url));
  return <div className="research-project-sources">{sources.map((record) => record.record_type === "field_report" ? <a href={`/reports/${record.id}/`} key={record.id} onClick={(event) => { event.preventDefault(); onOpenReport(record.id); }}>{record.title} </a> : record.source.url ? <a href={record.source.url} target="_blank" rel="noreferrer" key={record.id}>{record.source.publisher || record.title} </a> : null)}{extraUrls.map((url) => <a href={url} target="_blank" rel="noreferrer" key={url}>{new URL(url).hostname.replace(/^www\./, "")} </a>)}</div>;
}

export function DogsSolutionsContent({ item, onOpenReport }: { item: WorkRecord; onOpenReport: (id: string) => void }) {
  const selected = (item.project_ids ?? []).map((id) => projects.find((project) => project.id === id)).filter((project): project is CapacityProject => Boolean(project));
  return <div className="work-page-content solutions-content">
    <section id="solutions-overview" className="research-section work-content-section gap-refined-card is-card">
      <div className="research-section-heading work-content-heading"><h2>What could change the outcome?</h2></div>
      <p className="gap-mobile-body">The projects below are proposed, underway, or operating. A project stage is not evidence that more dogs have received care. We track the intended effect separately from delivered results.</p>
      <p className="gap-mobile-body"><a href="/reality/too-many-dogs-still-lack-safe-placement/#gap-overview">Explore the Equation of Care </a> to see how capacity, response, and prevention may interact in an illustrative scenario.</p>
    </section>
    <section id="solutions-improvements" className="research-section work-content-section gap-refined-card is-card">
      <div className="research-section-heading work-content-heading"><h2>Tracked improvements</h2></div>
      <div className="research-project-list">{selected.map((project) => {
        const milestone = [...project.milestones].filter((entry) => entry.date).sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))[0];
        return <details className="research-project solution-project" key={project.id} id={project.id}>
          <summary><span className="research-project-top"><strong>{project.title}</strong><span className="research-project-status is-neutral">{stage(project)}</span></span><span className="research-project-headline">{project.capacity_summary.headline}</span></summary>
          <dl className="solution-facts">
            <div><dt>What is changing</dt><dd>{project.description}</dd></div>
            <div><dt>Factor affected</dt><dd>{factors[project.id] || "Care access"}</dd></div>
            <div><dt>Expected effect</dt><dd>{project.intended_outcome}</dd></div>
            <div><dt>How it may help</dt><dd>{project.capacity_summary.how_it_helps}</dd></div>
            <div><dt>Current stage</dt><dd>{stage(project)}</dd></div>
            <div><dt>Latest documented milestone</dt><dd>{milestone?.date ? `${milestone.date}: ${milestone.description}` : "Date not verified"}</dd></div>
            <div><dt>Still unverified</dt><dd>{project.capacity_summary.not_yet_verified}</dd></div>
            <div><dt>Success measure</dt><dd>{successMeasures[project.id] || "A delivered change in care access or outcomes needs to be verified."}</dd></div>
            <div><dt>Next verification</dt><dd>{project.next_verification_step}</dd></div>
          </dl>
          <ProjectSources project={project} onOpenReport={onOpenReport} />
        </details>;
      })}</div>
    </section>
    <section id="solutions-ideas" className="research-section work-content-section gap-refined-card is-card">
      <div className="research-section-heading work-content-heading"><h2>Ideas to test</h2></div>
      <p className="gap-mobile-body">These are hypotheses, not operating programs or demonstrated solutions. Pathway testing will show which barriers need a response.</p>
      <ul className="solution-ideas"><li><strong>Make a help route easier to follow.</strong> If volunteer inquiries stall, clearer requirements and response tracking may help. First verify where the current route breaks.</li><li><strong>Make report outcomes visible.</strong> If field-call records show unresolved handoffs, a documented status trail may help people coordinate. First verify what the records establish.</li></ul>
      <p className="gap-mobile-body"><a href="/reality/too-many-dogs-still-lack-safe-placement/ways-to-help/">See pathway evaluations </a></p>
    </section>
  </div>;
}
