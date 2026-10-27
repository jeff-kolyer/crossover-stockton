
import "./DogGapOverviewLanding.layout.css";
import type { ReactNode } from "react";
import { activeCrossoverActions, dogStreetActionId } from "../data/crossoverActions";
import investigationsData from "../data/dogs-investigations.json";
import researchData from "../data/dogs-research.json";
import projectsData from "../data/projects.json";
import recordsData from "../data/records.json";
import workData from "../data/work.json";
import { navigateInternalLink } from "../lib/internalLink";
import type { CapacityProject, DogsInvestigationData, EvidenceRecord, GapRecord, WorkRecord } from "../types";
import { DogCarePreview } from "./DogCarePreview";

type Section = "overview" | "tasks" | "activity" | "findings" | "key-factors" | "ways-to-help" | "improvements" | "our-findings" | "research" | "updates";
type Props = {
  gap: GapRecord;
  map: ReactNode;
  onOpenSection: (section: Section, anchor?: string) => void;
  onOpenWork: (id: string) => void;
  onOpenActionDetail: () => void;
  onOpenActionIndex: () => void;
};

const research = researchData;
const investigation = investigationsData as DogsInvestigationData;
const records = recordsData as EvidenceRecord[];
const work = (workData as WorkRecord[]).find((item) => item.id === "dogs-direct-field-work");
const activity = (work?.activity_record_ids ?? [])
  .map((id) => records.find((record) => record.id === id))
  .filter((record): record is EvidenceRecord => Boolean(record))
  .sort((a, b) => (b.recorded_at || b.occurred_at || "").localeCompare(a.recorded_at || a.occurred_at || ""))
  .slice(0, 3);
const capacityProjectIds = ["stockton-animal-shelter-renovation", "canine-campus"];
const capacityProjects = (projectsData as CapacityProject[]).filter((project) => capacityProjectIds.includes(project.id) && project.gap_ids.includes("dogs-safe-placement"));
const measure = (id: string) => research.measurements.find((item) => item.id === id)?.value;
const strayIntakes = measure("sas-2024-dog-intake-stray");
const allIntakes = measure("sas-2024-dog-intake-total");
const strayShare = strayIntakes !== undefined && allIntakes ? Math.round(strayIntakes / allIntakes * 100) : undefined;
const formatDate = (value?: string | null) => value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value.length === 10 ? `${value}T12:00:00` : value)) : "Date not recorded";

export function DogGapOverviewLanding({ gap, map, onOpenSection, onOpenWork, onOpenActionDetail, onOpenActionIndex }: Props) {
  const sectionLink = (section: Section, label: string, anchor?: string, className?: string) => <a className={className} href={section === "overview" ? `/reality/${gap.slug}/` : ["tasks", "activity", "findings"].includes(section) ? `/work/dogs/${section}/${anchor ? `#${anchor}` : ""}` : `/reality/${gap.slug}/${section}/${anchor ? `#${anchor}` : ""}`} onClick={(event) => navigateInternalLink(event, () => onOpenSection(section, anchor))}>{label}</a>;
  const mapLink = <a href="/work/dogs/map/" onClick={(event) => navigateInternalLink(event, () => onOpenWork("dogs-locations-map"))}>Open full map </a>;

  return <div className="dog-landing">
    <section className="dog-landing-section dog-landing-evidence" id="summary" aria-labelledby="dog-evidence-title">
      <div className="dog-landing-heading"><div><h2 id="dog-evidence-title">What is happening in Stockton?</h2><p>Public records establish substantial stray-dog intake, but do not tell us how many dogs currently need care, where they are, or what prevents them from reaching it.</p><p><a href="/work/dogs/" onClick={(event) => navigateInternalLink(event, () => onOpenSection("tasks"))}>Open the investigation workspace</a></p></div></div>
      <div className="dog-landing-stats">
        <div className="is-danger"><strong>{strayIntakes?.toLocaleString() ?? "Unknown"}</strong><span>Stray intake events</span><small>2024 · Animal Services multi-jurisdiction service area</small></div>
        <div className="is-caution"><strong>Unknown</strong><span>Dogs on the streets now</span><small>No verified current census</small></div>
        <div className="is-info"><strong>{capacityProjects.length}</strong><span>Capacity projects</span><small>Shelter expansion and proposed Canine Campus; different stages</small></div>
        <div className="is-danger"><strong>{strayShare === undefined ? "Unknown" : `${strayShare}%`}</strong><span>Approximate stray intake share</span><small>Of 2024 dog intake in the same service area</small></div>
      </div>
      <p className="dog-landing-source-note">Intake figures describe events across Animal Services’ service area, not the number of dogs currently on Stockton streets. {sectionLink("research", "See sources", "research-at-a-glance")}</p>
    </section>

    <section className="dog-landing-section dog-landing-model" id="system-model" aria-labelledby="dog-model-title">
      <div className="dog-landing-heading"><div><h2 id="dog-model-title">Understanding the issue</h2><p>Care depends on several key factors working together. Adjust three of them to explore an illustrative outcome.</p></div></div>
      <DogCarePreview />
      <div className="dog-landing-model-footer"><span>Illustrative scenario — not measured Stockton outcomes.</span>{sectionLink("key-factors", "See all key factors")}</div>
    </section>

    <div className="dog-landing-grid">
      <section className="dog-landing-section dog-landing-map" id="reported-locations" aria-labelledby="dog-map-title">
        <div className="dog-landing-heading"><div><h2 id="dog-map-title">Where dogs are being reported</h2><p>Generalized, dated report areas. Pins do not show dogs currently at these locations.</p></div></div>
        <div className="dog-landing-map-frame">{map}</div>
        {mapLink}
      </section>

      <section className="dog-landing-section" id="findings-preview" aria-labelledby="dog-findings-title">
        <div className="dog-landing-heading"><div><h2 id="dog-findings-title">What we're finding</h2><p>Published evidence, firsthand checks, and questions still under investigation.</p></div></div>
        <div className="dog-landing-rows">
          {investigation.established_findings.slice(0, 1).map((finding) => <a key={finding.id} href="/work/dogs/findings/#investigation-findings" onClick={(event) => navigateInternalLink(event, () => onOpenSection("findings", "investigation-findings"))}><span><small>Crossover firsthand check</small><strong>{finding.title}</strong></span></a>)}
          {research.latest_findings.filter((finding) => ["dogs-2026-10-19-kcra-stray-dog-report", "dogs-2026-10-15-official-2024-baseline"].includes(finding.id)).map((finding) => <a key={finding.id} href={`/reality/${gap.slug}/research/#research-whats-new`} onClick={(event) => navigateInternalLink(event, () => onOpenSection("research", "research-whats-new"))}><span><small>{finding.id.includes("kcra") ? "Organization report in published coverage" : "Official public data"}</small><strong>{finding.finding}</strong></span></a>)}
        </div>
        {sectionLink("findings", "See all findings", undefined, "dog-landing-more")}
      </section>

      <section className="dog-landing-section dog-landing-participation" id="ways-preview" aria-labelledby="dog-ways-title">
        <div className="dog-landing-heading"><div><h2 id="dog-ways-title">Take a real step</h2><p>Help us investigate what happens when we look for dogs on Stockton's streets.</p></div></div>
        <div className="dog-landing-rows">{activeCrossoverActions.filter((action) => action.id === dogStreetActionId).map((action) => <a key={action.id} href={action.href} onClick={(event) => navigateInternalLink(event, onOpenActionDetail)}><span><strong>{action.title}</strong><small>{action.overviewSummary}</small></span></a>)}</div>
        <a className="dog-landing-more" href="/action/" onClick={(event) => navigateInternalLink(event, onOpenActionIndex)}>See Crossover actions </a>
      </section>

      <section className="dog-landing-section" id="activity-preview" aria-labelledby="dog-activity-title">
        <div className="dog-landing-heading"><div><h2 id="dog-activity-title">Latest activity</h2><p>Recorded investigation work and planned next steps.</p></div></div>
        <div className="dog-landing-rows dog-landing-activity">{activity.map((record) => {
          const planned = Boolean(record.planned_for || record.outcome?.status === "planned");
          const target = planned ? "/work/dogs/tasks/#dogs-check-louis-park" : `/work/dogs/activity/#${record.id}`;
          return <a key={record.id} href={target} onClick={(event) => navigateInternalLink(event, () => onOpenSection(planned ? "tasks" : "activity", planned ? "dogs-check-louis-park" : record.id))}><span><strong>{record.title}</strong><small>{planned ? "Plan recorded · not completed" : record.outcome?.summary || record.summary}</small></span><time dateTime={record.recorded_at || record.occurred_at || undefined}>{formatDate(record.recorded_at || record.occurred_at)}</time></a>;
        })}</div>
        {sectionLink("activity", "See all activity", undefined, "dog-landing-more")}
      </section>
    </div>
    <nav className="dog-landing-related" aria-label="More about this investigation"><span>Explore more</span>{sectionLink("improvements", "Improvements")}{sectionLink("research", "Sources")}{sectionLink("updates", "Updates")}</nav>
  </div>;
}
