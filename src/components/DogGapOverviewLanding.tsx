import { ArrowRight, Building2, ChartNoAxesColumnIncreasing, ChevronRight, CircleHelp, FileText, MapPin, PawPrint } from "lucide-react";
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

type Section = "overview" | "key-factors" | "ways-to-help" | "improvements" | "our-findings" | "research" | "updates";
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
  const sectionLink = (section: Section, label: string, anchor?: string, className?: string) => <a className={className} href={`/reality/${gap.slug}/${section === "overview" ? "" : `${section}/`}${anchor ? `#${anchor}` : ""}`} onClick={(event) => navigateInternalLink(event, () => onOpenSection(section, anchor))}>{label}<ArrowRight size={17} aria-hidden="true" /></a>;
  const mapLink = <a href={`/reality/${gap.slug}/dogs-locations-map/`} onClick={(event) => navigateInternalLink(event, () => onOpenWork("dogs-locations-map"))}>Open full map <ArrowRight size={16} aria-hidden="true" /></a>;

  return <div className="dog-landing">
    <section className="dog-landing-section dog-landing-evidence" id="summary" aria-labelledby="dog-evidence-title">
      <div className="dog-landing-heading"><div><h2 id="dog-evidence-title">What is happening in Stockton?</h2><p>Public records establish substantial stray-dog intake, but do not tell us how many dogs currently need care, where they are, or what prevents them from reaching it.</p></div></div>
      <div className="dog-landing-stats">
        <div className="is-danger"><PawPrint aria-hidden="true" /><strong>{strayIntakes?.toLocaleString() ?? "Unknown"}</strong><span>Stray intake events</span><small>2024 · Animal Services multi-jurisdiction service area</small></div>
        <div className="is-caution"><CircleHelp aria-hidden="true" /><strong>Unknown</strong><span>Dogs on the streets now</span><small>No verified current census</small></div>
        <div className="is-info"><Building2 aria-hidden="true" /><strong>{capacityProjects.length}</strong><span>Capacity projects</span><small>Shelter expansion and proposed Canine Campus; different stages</small></div>
        <div className="is-danger"><ChartNoAxesColumnIncreasing aria-hidden="true" /><strong>{strayShare === undefined ? "Unknown" : `${strayShare}%`}</strong><span>Approximate stray intake share</span><small>Of 2024 dog intake in the same service area</small></div>
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
          {investigation.established_findings.slice(0, 1).map((finding) => <a key={finding.id} href={`/reality/${gap.slug}/our-findings/#investigation-findings`} onClick={(event) => navigateInternalLink(event, () => onOpenSection("our-findings", "investigation-findings"))}><FileText size={18} aria-hidden="true" /><span><small>Crossover firsthand check</small><strong>{finding.title}</strong></span><ChevronRight size={17} aria-hidden="true" /></a>)}
          {research.latest_findings.filter((finding) => ["dogs-2026-10-19-kcra-stray-dog-report", "dogs-2026-10-15-official-2024-baseline"].includes(finding.id)).map((finding) => <a key={finding.id} href={`/reality/${gap.slug}/research/#research-whats-new`} onClick={(event) => navigateInternalLink(event, () => onOpenSection("research", "research-whats-new"))}><FileText size={18} aria-hidden="true" /><span><small>{finding.id.includes("kcra") ? "Organization report in published coverage" : "Official public data"}</small><strong>{finding.finding}</strong></span><ChevronRight size={17} aria-hidden="true" /></a>)}
        </div>
        {sectionLink("our-findings", "See all findings", undefined, "dog-landing-more")}
      </section>

      <section className="dog-landing-section dog-landing-participation" id="ways-preview" aria-labelledby="dog-ways-title">
        <div className="dog-landing-heading"><div><h2 id="dog-ways-title">Take a real step</h2><p>Help us investigate what happens when we look for dogs on Stockton's streets.</p></div></div>
        <div className="dog-landing-rows">{activeCrossoverActions.filter((action) => action.id === dogStreetActionId).map((action) => <a key={action.id} href={action.href} onClick={(event) => navigateInternalLink(event, onOpenActionDetail)}><MapPin size={18} aria-hidden="true" /><span><strong>{action.title}</strong><small>{action.overviewSummary}</small></span><ChevronRight size={17} aria-hidden="true" /></a>)}</div>
        <a className="dog-landing-more" href="/action/" onClick={(event) => navigateInternalLink(event, onOpenActionIndex)}>See Crossover actions <ArrowRight size={17} aria-hidden="true" /></a>
      </section>

      <section className="dog-landing-section" id="activity-preview" aria-labelledby="dog-activity-title">
        <div className="dog-landing-heading"><div><h2 id="dog-activity-title">Latest activity</h2><p>Recorded investigation work and planned next steps.</p></div></div>
        <div className="dog-landing-rows dog-landing-activity">{activity.map((record) => <a key={record.id} href={`/reality/${gap.slug}/our-findings/#${record.id}`} onClick={(event) => navigateInternalLink(event, () => onOpenSection("our-findings", record.id))}><FileText size={18} aria-hidden="true" /><span><strong>{record.title}</strong><small>{record.planned_for || record.outcome?.status === "planned" ? "Plan recorded · not completed" : record.outcome?.summary || record.summary}</small></span><time dateTime={record.recorded_at || record.occurred_at || undefined}>{formatDate(record.recorded_at || record.occurred_at)}</time><ChevronRight size={17} aria-hidden="true" /></a>)}</div>
        {sectionLink("our-findings", "See all activity", "activity-log", "dog-landing-more")}
      </section>
    </div>
    <nav className="dog-landing-related" aria-label="More about this investigation"><span>Explore more</span>{sectionLink("improvements", "Improvements")}{sectionLink("research", "Sources")}{sectionLink("updates", "Updates")}</nav>
  </div>;
}
