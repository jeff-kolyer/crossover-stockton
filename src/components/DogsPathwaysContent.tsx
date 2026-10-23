import { ArrowRight } from "lucide-react";
import type { WorkRecord } from "../types";
import { DogsInvestigationContent } from "./DogsInvestigationContent";

const pathways = [
  {
    id: "pathways-reporting", title: "Report a dog and get a response", factor: "Observation and reporting · Response to reports",
    evaluation: "Records requested; analysis pending", performance: "Current response and resolution rates unknown",
    purpose: "Help a dog become visible to someone who can assess and respond.",
    known: "Public reporting routes and Animal Services field response exist. Their reach and outcomes for dogs reported on Stockton streets are not yet measured here.",
    tested: "We requested Animal Services field-call records on October 20, 2026; a response and outcome analysis are pending.",
    unknown: "How many reports lead to contact, care, reunification, or a documented resolution?",
    next: "Review the requested call records, then compare reported locations and outcomes with firsthand observations.",
    links: [{ label: "See request activity", href: "/work/dogs-direct-field-work/#crossover-2026-10-20-sas-field-call-records-request" }, { label: "Open locations map", href: "/work/dogs-locations-map/#field-observation-map" }],
  },
  {
    id: "pathways-shelter", title: "Enter shelter care", factor: "Shelter capacity",
    evaluation: "First visit documented", performance: "Current available capacity unknown",
    purpose: "Provide assessment, safe temporary care, and a route to another outcome.",
    known: "The official 2024 kennel report documents dog intakes and dispositions across the Animal Services service area.",
    tested: "A Crossover visit to Stockton Animal Services documented the public facility and a conversation with staff; it did not establish current available capacity.",
    unknown: "What space, eligibility, and staffing are available when a dog needs care now?",
    next: "Verify current intake requirements, occupancy, and the result of a complete help attempt.",
    links: [{ label: "See shelter evidence", href: "/work/dogs-public-source-review/#research-system" }, { label: "See visit activity", href: "/work/dogs-direct-field-work/" }],
  },
  {
    id: "pathways-rescue", title: "Reach a foster or rescue partner", factor: "Foster and rescue capacity",
    evaluation: "Public routes under review", performance: "Current placement availability unknown",
    purpose: "Find safe temporary placement when a shelter or community member needs a partner.",
    known: "Rescue transfers were the largest reported 2024 dog disposition category in the official kennel report. A transfer is not proof of final adoption.",
    tested: "We are reviewing public routes and contact requirements; no completed placement through this pathway has been verified by Crossover.",
    unknown: "Which partners can take a dog, under what conditions, and how quickly?",
    next: "Contact partners about referral steps and document a real response and outcome.",
    links: [{ label: "See disposition evidence", href: "/work/dogs-public-source-review/#research-system" }],
  },
  {
    id: "pathways-volunteering", title: "Volunteer or join Doggie Day Out", factor: "Human participation · Temporary support",
    evaluation: "Applications and inquiries submitted; no later outcome in the available records", performance: "Onboarding capacity and completed participation unknown",
    purpose: "Let a willing person help dogs already in care.",
    known: "Publicly advertised participation routes exist, but an advertised route does not establish that a person can complete it or that a dog receives care.",
    tested: "Stockton Street Dogs application submitted October 7; no later response is confirmed in the available record. Doggie Day Out inquiry sent October 12; response unconfirmed. A shelter volunteer application was delivered October 14. None establishes completed participation.",
    unknown: "Where do applicants get stuck, and what happens after approval?",
    next: "Follow up on the submitted attempts and document each response and completed step.",
    links: [{ label: "Street Dogs application", href: "/work/dogs-direct-field-work/#crossover-2026-10-07-street-dogs-volunteer-application" }, { label: "Doggie Day Out inquiry", href: "/work/dogs-direct-field-work/#crossover-2026-10-12-doggie-day-out-inquiry" }, { label: "Full activity log", href: "/work/dogs-direct-field-work/" }],
  },
  {
    id: "pathways-adoption", title: "Adoption or reunification", factor: "Adoption and reunification",
    evaluation: "Historical outcomes reviewed", performance: "Current access and individual outcomes unknown",
    purpose: "Move a dog in care to a lasting home or back to its person.",
    known: "The kennel report counts adoptions and returns to owners during 2024. Those annual totals do not show the time or barriers for an individual dog.",
    tested: "Crossover has not verified a complete adoption or reunion journey firsthand.",
    unknown: "Which steps, delays, and requirements determine whether a dog reaches a lasting home?",
    next: "Trace an actual public pathway from first inquiry through the documented outcome.",
    links: [{ label: "See reported outcomes", href: "/work/dogs-public-source-review/#research-system" }],
  },
  {
    id: "pathways-support", title: "Street care, supplies, or transport", factor: "Access to care · Community response",
    evaluation: "Public reports under review", performance: "Current availability and effect unknown",
    purpose: "Help a dog or caregiver reach immediate support while a safe care route is identified.",
    known: "Public reports describe community responses. Their availability and effect for a specific dog have not been established here.",
    tested: "No complete Crossover help journey through supplies or transport has been verified.",
    unknown: "Who can provide safe support, and when does it lead to veterinary care or placement?",
    next: "Identify an actual request route, contact a provider, and document the outcome.",
    links: [{ label: "Open locations map", href: "/work/dogs-locations-map/#field-observation-map" }],
  },
  {
    id: "pathways-verification", title: "Veterinary care and prevention", factor: "Prevention and spay/neuter support",
    evaluation: "Public service information under review", performance: "Current access and delivered results unknown",
    purpose: "Address health needs and reduce the chance of future placement loss.",
    known: "The kennel report includes spay/neuter service events. Project plans also describe possible future support; delivery and effect remain separate questions.",
    tested: "Crossover has not verified access or an outcome for a specific dog through this route.",
    unknown: "Can people reach affordable, timely services, and do those services change the need for placement?",
    next: "Check current service eligibility, scheduling, and completed access before assessing effects.",
    links: [{ label: "See proposed improvements", href: "/work/dogs-solutions/#solutions-improvements" }],
  },
] as const;

export function DogsPathwaysContent({ item, onOpenReport }: { item: WorkRecord; onOpenReport: (id: string) => void }) {
  return <div className="work-page-content pathways-content">
    <section id="pathways-overview" className="research-section work-content-section gap-refined-card is-card">
      <div className="research-section-heading work-content-heading"><h2>How care is reached</h2></div>
      <p className="gap-mobile-body">These are routes a dog or a willing person might take. We separate a published option from a tested pathway, and a tested pathway from a confirmed result.</p>
      <p className="gap-mobile-body">The <a href="/reality/too-many-dogs-still-lack-safe-placement/#gap-overview">Equation of Care</a> shows how factors may interact. It is an illustrative model, not a measurement of Stockton's dog population.</p>
    </section>
    <div className="pathways-list">{pathways.map((pathway) => <section className="pathway-card research-section work-content-section gap-refined-card is-card" id={pathway.id} key={pathway.id}>
      <div className="research-section-heading work-content-heading"><h2>{pathway.title}</h2></div>
      <p className="pathway-factor">Model factor: {pathway.factor}</p>
      <p className="pathway-status"><strong>Evaluation:</strong> {pathway.evaluation} · <strong>Pathway performance:</strong> {pathway.performance}</p>
      <p className="gap-mobile-body"><strong>Purpose.</strong> {pathway.purpose}</p>
      <p className="gap-mobile-body"><strong>What we know.</strong> {pathway.known}</p>
      <p className="gap-mobile-body"><strong>What we've tested.</strong> {pathway.tested}</p>
      <p className="gap-mobile-body"><strong>Still unknown.</strong> {pathway.unknown}</p>
      <p className="gap-mobile-body"><strong>Next verification.</strong> {pathway.next}</p>
      <div className="pathway-links">{pathway.links.map((link) => <a href={link.href} key={link.href}>{link.label} <ArrowRight size={15} aria-hidden="true" /></a>)}</div>
    </section>)}</div>
    <section id="pathways-detail" className="research-section work-content-section gap-refined-card is-card">
      <div className="research-section-heading work-content-heading"><h2>Investigation detail</h2></div>
      <p className="gap-mobile-body">The original contact plan, fieldwork method, records request, findings, and archive remain available below.</p>
      <details className="pathways-archive" open={Boolean(typeof window !== "undefined" && /^#(?:investigation-|field-observation-procedure)/.test(window.location.hash))}>
        <summary>Read the full investigation record</summary>
        <DogsInvestigationContent item={item} onOpenReport={onOpenReport} includeMap={false} />
      </details>
      <p className="gap-mobile-body"><a href="/work/dogs-direct-field-work/">Journey / Activity Log <ArrowRight size={15} aria-hidden="true" /></a> · <a href="/work/dogs-locations-map/#field-observation-map">Locations map <ArrowRight size={15} aria-hidden="true" /></a></p>
    </section>
  </div>;
}
