import gapsData from "../data/gaps.json";
import orgsData from "../data/orgs.json";
import workData from "../data/work.json";
import { navigateInternalLink } from "../lib/internalLink";
import type { EvidenceRecord, GapRecord, OrgRecord } from "../types";

const gaps = gapsData as GapRecord[];
const orgs = orgsData as OrgRecord[];
const work = workData as Array<{ id: string; title: string }>;

export function formatReportDate(value?: string) {
  if (!value) return "Undated";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(year, month - 1, day));
}

export function FieldReportContent({ report, publicNavigation }: {
  report: EvidenceRecord;
  publicNavigation?: {
    onOpenGap: (slug: string) => void;
    onOpenWork: (id: string) => void;
  };
}) {
  const relatedGaps = [...new Set(report.gap_ids)].map((id) => gaps.find((gap) => gap.id === id)).filter((gap): gap is GapRecord => Boolean(gap));
  const relatedOrgs = [...new Set(report.organization_ids)].map((id) => orgs.find((org) => org.id === id)).filter((org): org is OrgRecord => Boolean(org));
  const relatedWork = report.work_id ? work.find((item) => item.id === report.work_id) : undefined;
  const visitWebsite = relatedOrgs.length === 1 ? relatedOrgs[0].website : undefined;
  const hasConnectedRecords = relatedOrgs.length > 0 || relatedGaps.length > 0 || Boolean(relatedWork);

  return <>
    {report.image && <figure className="report-figure"><div className="report-image-frame"><img src={report.image} alt={report.image_alt ?? ""} /></div>{report.image_caption && <figcaption>{report.image_caption}</figcaption>}</figure>}
    {report.sections?.length ? <section className="report-body" aria-label="Report narrative">
      {report.sections?.map((section) => <section key={section.title}><h2>{section.title}</h2>{section.body.split("\n\n").map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}
    </section> : null}
    {Boolean(report.visit_notes?.length) && <section aria-labelledby="report-visit-title">
      <h2 id="report-visit-title">Visiting {relatedOrgs.length === 1 ? relatedOrgs[0].name : report.location?.split(",")[0] ?? "this location"}</h2>
      {report.location && <p>{report.location}</p>}
      {report.visit_notes?.map((note) => <section key={note.title}><h3>{note.title}</h3><p>{note.body}</p></section>)}
    </section>}
    {(report.map_url || visitWebsite) && <section aria-labelledby="report-location-resources-title">
      <h2 id="report-location-resources-title">Location resources</h2>
      <ul>
        {report.map_url && <li><a href={report.map_url} target="_blank" rel="noreferrer">View location in OpenStreetMap</a></li>}
        {visitWebsite && <li><a href={visitWebsite} target="_blank" rel="noreferrer">{relatedOrgs[0].name} website</a></li>}
      </ul>
    </section>}
    {hasConnectedRecords && <section aria-labelledby="report-related-title">
      <h2 id="report-related-title">Connected records</h2>
      <ul>
        {relatedOrgs.map((org) => <li key={org.id}><strong>Organization:</strong> <a href={`/organizations/${org.slug}/`}>{org.name}</a></li>)}
        {relatedGaps.map((gap) => <li key={gap.id}><strong>Need:</strong> <a href={`/reality/${gap.slug}/`} onClick={publicNavigation ? (event) => navigateInternalLink(event, () => publicNavigation.onOpenGap(gap.slug)) : undefined}>{gap.title}</a></li>)}
        {relatedWork && <li><strong>Activity:</strong> <a href="/work/dogs/activity/" onClick={publicNavigation ? (event) => navigateInternalLink(event, () => publicNavigation.onOpenWork(relatedWork.id)) : undefined}>{relatedWork.title}</a></li>}
      </ul>
    </section>}
    <section aria-labelledby="report-sources-title">
      <h2 id="report-sources-title">Sources and notes</h2>
      <p>Source: {report.source.publisher ?? "Crossover Stockton"} · {report.evidence_status?.replace(/_/g, " ") ?? report.source.type?.replace(/_/g, " ") ?? "source"}.</p>
      {report.visit_notes_attribution && <p>{report.visit_notes_attribution} · {formatReportDate(report.occurred_at)}.</p>}
      {report.source_notes?.map((note) => <p key={note}>{note}</p>)}
      {report.context_sources?.filter((source) => source.url).map((source) => <p key={source.url}>Additional context: <a href={source.url} target="_blank" rel="noreferrer">{source.title ?? source.publisher ?? "Supporting source"}</a>.</p>)}
    </section>
  </>;
}
