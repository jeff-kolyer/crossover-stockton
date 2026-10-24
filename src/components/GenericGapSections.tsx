import { ArrowRight, BarChart3, FileText, HeartHandshake, Users } from "lucide-react";
import actionsData from "../data/actions.json";
import orgsData from "../data/orgs.json";
import projectsData from "../data/projects.json";
import workData from "../data/work.json";
import { navigateInternalLink } from "../lib/internalLink";
import type { CapacityProject, GapRecord, OrgRecord, PublicActionRecord, WorkRecord } from "../types";

const actions = actionsData as PublicActionRecord[];
const orgs = orgsData as OrgRecord[];
const projects = projectsData as CapacityProject[];
const work = workData as WorkRecord[];

export function GenericGapOverview({ gap, onOpenWork }: { gap: GapRecord; onOpenWork: (id: string) => void }) {
  const state = gap.current_state_items ?? [];
  return <div className="dog-gap-overview">
    <section className="dog-gap-summary dog-gap-card" id="summary">
      <div><p className="dog-gap-eyebrow">Overview</p><h2>What is happening in Stockton?</h2><p>{gap.current_state || gap.summary}</p></div>
      {state.length > 0 && <div className="dog-gap-kpis">{state.map((item) => <div key={item.label}><strong>{item.value}</strong><b>{item.label}</b><small>{item.detail}</small></div>)}</div>}
    </section>
    <section className="dog-gap-card generic-gap-system" id="system-model">
      <p className="dog-gap-eyebrow">The system behind the need</p><h2>Understand the issue</h2>
      <p>These reported conditions and possible barriers show where further investigation could focus.</p>
      <div className="generic-gap-two-columns">
        <div><h3><BarChart3 size={19} /> What public sources report</h3><ul>{gap.what_we_are_seeing.map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div><h3><FileText size={19} /> Barriers to examine</h3><ul>{gap.contributing_factors.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </div>
    </section>
    <section className="dog-gap-card generic-gap-evidence" id="reported-evidence">
      <p className="dog-gap-eyebrow">Evidence so far</p><h2>What is documented?</h2>
      <p>These points come from published sources and organization reports. Crossover has identified this need but has not established independent findings about its current extent or outcomes.</p>
      <ul>{gap.what_we_are_seeing.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul>
    </section>
    {(gap.work_ids ?? []).length > 0 && <section className="dog-gap-related dog-gap-card" id="related-records"><p className="dog-gap-eyebrow">Detailed records</p><div>{(gap.work_ids ?? []).map((id) => { const item = work.find((entry) => entry.id === id); return item && <a href={`/work/${id}/`} key={id} onClick={(event) => navigateInternalLink(event, () => onOpenWork(id))}>{item.title} <ArrowRight size={15} /></a>; })}</div></section>}
  </div>;
}

export function GenericGapWaysToHelp({ gap, onOpenAction }: { gap: GapRecord; onOpenAction: (action: PublicActionRecord) => void }) {
  const relevantActions = gap.action_ids.map((id) => actions.find((item) => item.id === id && item.active)).filter((item): item is PublicActionRecord => Boolean(item));
  const relevantOrgs = gap.organization_ids.map((id) => orgs.find((item) => item.id === id)).filter((item): item is OrgRecord => Boolean(item));
  return <div className="dog-gap-tab-content">
    <div className="dog-gap-tab-heading" id="ways-intro"><p className="dog-gap-eyebrow">Ways to help</p><h2>Take a real step</h2><p>These opportunities are described by the organizations involved. Check current details with each provider before you act.</p></div>
    <section className="dog-gap-card" id="ways-actions"><p className="dog-gap-eyebrow">Current options</p><h2>Ways to participate</h2><div className="generic-gap-item-grid">{relevantActions.map((action) => <article className="generic-gap-item" key={action.id}><span>{action.when_label || "Current option"}</span><h3>{action.title}</h3><p>{action.summary}</p><button type="button" onClick={() => onOpenAction(action)}>Explore this action <ArrowRight size={16} /></button></article>)}</div></section>
    <section className="dog-gap-card" id="ways-organizations"><p className="dog-gap-eyebrow">Local response</p><h2>Organizations involved</h2><div className="generic-gap-item-grid">{relevantOrgs.map((org) => <article className="generic-gap-item" key={org.id}><Users size={20} aria-hidden="true" /><h3>{org.name}</h3><p>{org.summary}</p>{(org.website || org.source_url) && <a href={org.website || org.source_url} target="_blank" rel="noreferrer">Visit organization <ArrowRight size={16} /></a>}</article>)}</div></section>
  </div>;
}

export function GenericGapImprovements({ gap }: { gap: GapRecord }) {
  const relatedProjects = projects.filter((project) => project.gap_ids.includes(gap.id));
  return <div className="dog-gap-tab-content">
    <div className="dog-gap-tab-heading" id="improvements-intro"><p className="dog-gap-eyebrow">Improvements</p><h2>What could improve the outcome?</h2><p>Existing efforts and possible capacity needs are shown separately. A reported or proposed improvement is not evidence of a measured result.</p></div>
    {relatedProjects.length > 0 && <section className="dog-gap-card" id="improvements-projects"><p className="dog-gap-eyebrow">Tracked projects</p><h2>Work underway</h2><div className="generic-gap-item-grid">{relatedProjects.map((project) => <article className="generic-gap-item" key={project.id}><span>{project.development_stage.replace(/_/g, " ")}</span><h3>{project.title}</h3><p>{project.capacity_summary.how_it_helps || project.description}</p><small>{project.capacity_summary.not_yet_verified}</small></article>)}</div></section>}
    <section className="dog-gap-card" id="improvements-barriers"><p className="dog-gap-eyebrow">Where better capacity may help</p><h2>Barriers to address</h2><p>These are factors surfaced in the public record. Their relative impact has not been independently measured.</p><ul className="generic-gap-factor-list">{gap.contributing_factors.map((factor) => <li key={factor}><HeartHandshake size={18} aria-hidden="true" />{factor}</li>)}</ul></section>
  </div>;
}

export function GenericGapResearchIntro({ gap }: { gap: GapRecord }) {
  return <section className="dog-gap-card" id="research-intro"><p className="dog-gap-eyebrow">Research</p><h2>What the public record tells us</h2><p>{gap.summary}</p><p className="generic-gap-research-note">This need is identified from public information. Crossover has not yet conducted an independent investigation or published findings for it. Source dates and limitations remain attached to each record below.</p></section>;
}
