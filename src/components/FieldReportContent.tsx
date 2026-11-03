import uiCopy from "../data/pages/investigations/dogs/activity.json";
import { siteModel } from "../model";
import { navigateInternalLink } from "../lib/internalLink";
import { organizationActivityHref } from "../lib/organizationActivity";
import type { EvidenceRecord, GapRecord, OrgRecord } from "../types";
import { Figure, HeadingGroup, ProseStack, Section, Stack } from "./layout";

const uiText = uiCopy.FieldReportContent;

const gaps = siteModel.getNeeds();
const orgs = siteModel.getOrganizations();
const work = siteModel.getAllLegacyWork();

export function formatReportDate(value?: string) {
  if (!value) return uiText.undated;
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
    {report.image && <Figure className="report-figure" image={<div className="report-image-frame"><img src={report.image} alt={report.image_alt ?? ""} /></div>} caption={report.image_caption} />}
    {report.sections?.length ? <Section className="report-body" aria-label={uiText.reportNarrative}>
      {report.sections?.map((section) => <Stack as="section" key={section.title}><HeadingGroup><h2>{section.title}</h2><p>{section.body.split("\n\n")[0]}</p></HeadingGroup><ProseStack>{section.body.split("\n\n").slice(1).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</ProseStack></Stack>)}
    </Section> : null}
    {Boolean(report.visit_notes?.length) && <Section aria-labelledby="report-visit-title">
      <HeadingGroup><h2 id="report-visit-title">{uiText.visiting}{relatedOrgs.length === 1 ? relatedOrgs[0].name : report.location?.split(",")[0] ?? uiText.thisLocation}</h2>
        {report.location && <p>{report.location}</p>}</HeadingGroup>
      {report.visit_notes?.map((note) => <HeadingGroup as="section" key={note.title}><h3>{note.title}</h3><p>{note.body}</p></HeadingGroup>)}
    </Section>}
    {(report.map_url || visitWebsite) && <Section aria-labelledby="report-location-resources-title">
      <h2 id="report-location-resources-title">{uiText.locationResources}</h2>
      <ul>
        {report.map_url && <li><a href={report.map_url} target="_blank" rel="noreferrer">{uiText.openstreetmapLocation}</a></li>}
        {visitWebsite && <li><a href={visitWebsite} target="_blank" rel="noreferrer">{relatedOrgs[0].name} {uiText.website}</a></li>}
      </ul>
    </Section>}
    {hasConnectedRecords && <Section aria-labelledby="report-related-title">
      <h2 id="report-related-title">{uiText.connectedRecords}</h2>
      <ul>
        {relatedOrgs.map((org) => <li key={org.id}><strong>{uiText.organization}</strong> <a href={organizationActivityHref(org.slug)}>{org.name}</a></li>)}
        {relatedGaps.map((gap) => <li key={gap.id}><strong>{uiText.need}</strong> <a href={`/reality/${gap.slug}/`} onClick={publicNavigation ? (event) => navigateInternalLink(event, () => publicNavigation.onOpenGap(gap.slug)) : undefined}>{gap.title}</a></li>)}
        {relatedWork && <li><strong>{uiText.activity}</strong> <a href="/work/dogs/activity/" onClick={publicNavigation ? (event) => navigateInternalLink(event, () => publicNavigation.onOpenWork(relatedWork.id)) : undefined}>{uiText.investigationActivity}</a></li>}
      </ul>
    </Section>}
    <Section aria-labelledby="report-sources-title">
      <HeadingGroup><h2 id="report-sources-title">{uiText.sourcesAndNotes}</h2>
        <p>{uiText.source}{report.source.publisher ?? uiText.crossoverStockton} · {report.evidence_status?.replace(/_/g, " ") ?? report.source.type?.replace(/_/g, " ") ?? uiText.sourceFallback}.</p></HeadingGroup>
      {report.visit_notes_attribution && <p>{report.visit_notes_attribution} · {formatReportDate(report.occurred_at)}.</p>}
      {report.source_notes?.map((note) => <p key={note}>{note}</p>)}
      {report.context_sources?.filter((source) => source.url).map((source) => <p key={source.url}>{uiText.additionalContext}<a href={source.url} target="_blank" rel="noreferrer">{source.title ?? source.publisher ?? uiText.supportingSource}</a>.</p>)}
    </Section>
  </>;
}
