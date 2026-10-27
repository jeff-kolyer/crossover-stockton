import { useEffect, type ReactNode } from "react";
import research from "../data/dogs-research.json";
import { dogCareFactors, type DogCareFactor } from "../lib/dogCareScenario";
import { navigateInternalLink } from "../lib/internalLink";
import type { GapRecord } from "../types";
import { InvestigationPageHeader } from "./InvestigationPageHeader";

type Destination = "research" | "improvements" | "ways-to-help" | "our-findings";
type FactorDetail = { means: string; evidence: string; unknown: string; change: string; links: Destination[]; map?: boolean };

const measurement = (id: string) => research.measurements.find((item) => item.id === id)?.value.toLocaleString("en-US") ?? "Unknown";
const dogDetails: Record<DogCareFactor, FactorDetail> = {
  shelter: {
    means: "Usable shelter space and the ability to hold dogs safely while they receive care or wait for placement.",
    evidence: `Stockton Animal Services reported ${measurement("sas-2024-dog-intake-total")} dog intake events in 2024 across its multi-jurisdiction service area, including ${measurement("sas-2024-dog-intake-stray")} stray intakes. Annual intake is a flow, not a count of occupied kennels or dogs currently on the street.`,
    unknown: "Current usable dog kennels, occupancy, length of stay, and how many dogs could not enter shelter care have not been verified.",
    change: "Shelter renovation and the proposed Canine Campus could affect capacity. Their delivered space and effect on access need verification.",
    links: ["research", "improvements"],
  },
  foster: {
    means: "Temporary homes, rescue partners, and veterinary support can make room for dogs that need care before a lasting placement is available.",
    evidence: `The same Animal Services report lists ${measurement("sas-2024-dog-outcome-rescue-transfer")} rescue or transfer dispositions in 2024 across its service area. A receiving rescue may later count the same dog in its own outcomes, so those totals cannot be added together.`,
    unknown: "Current foster openings, unique dogs served across organizations, and veterinary bottlenecks have not been established.",
    change: "Foster participation, rescue coordination, and treatment access may increase options for individual dogs; actual availability must be confirmed with providers.",
    links: ["research", "improvements", "ways-to-help"],
  },
  response: {
    means: "A report has to be received, assessed, assigned, followed up, and connected to an outcome. Each step can affect whether a dog reaches care.",
    evidence: "Published intake counts show dogs entered Animal Services care in 2024, but they do not trace individual reports through dispatch, contact, and resolution.",
    unknown: "Report volume, response times, unsuccessful contacts, and outcomes linked to each report remain unmeasured here.",
    change: "A report-to-outcome trace and firsthand pathway checks could show where handoffs fail and what changes help.",
    links: ["research", "our-findings", "ways-to-help"],
  },
  reporting: {
    means: "Someone must notice a dog needing help and pass usable information to a person or organization able to respond.",
    evidence: "Dated public reports and historical references identify generalized areas for follow-up. They do not show a dog's current location or measure how many dogs remain outside care.",
    unknown: "The share of dogs noticed, reported, and connected to a response is unknown. Reports may repeat the same dog or miss others entirely.",
    change: "Clear reporting routes and careful follow-up could make observations more useful while protecting against false precision.",
    links: ["research", "our-findings", "ways-to-help"], map: true,
  },
  prevention: {
    means: "Spay/neuter access, veterinary care, and support for people keeping pets can reduce future need for new placement.",
    evidence: "A 2026 City contract describes a target of approximately 200 pets across three spay/neuter clinic events. The completed number and dog-only share are not yet known. The 2024 Animal Services intake report also lists 76 dog spay/neuter service intakes; that category does not prove 76 surgeries were completed.",
    unknown: "Completed procedures, appointment waits, species split, and whether local access meets demand remain unverified.",
    change: "Documented clinic capacity and retention support may help, but delivered output and effects need to be measured.",
    links: ["research", "improvements", "ways-to-help"],
  },
  placement: {
    means: "After entering care, a dog may be adopted, reunited with an owner, transferred to a rescue, or reach another recorded outcome.",
    evidence: `Animal Services reported ${measurement("sas-2024-dog-outcome-adopted")} adoptions, ${measurement("sas-2024-dog-outcome-return-owner")} returns to owner, and ${measurement("sas-2024-dog-outcome-rescue-transfer")} rescue or transfer dispositions in 2024 across its service area. These are separate disposition categories, not a count of unique lasting homes across all organizations.`,
    unknown: "Long-term outcomes after transfer, current placement waits, and reasons individual dogs cannot be placed are not established.",
    change: "Adoption, reunification, and rescue pathways can create placements when eligibility, transport, and support align.",
    links: ["research", "improvements", "ways-to-help"],
  },
};

const linkNames: Record<Destination, string> = { research: "Research", improvements: "Improvements", "ways-to-help": "Ways to Help", "our-findings": "Our Findings" };

export function KeyFactorsPage({ gap, onOpenSection, onOpenMap, model }: { gap: GapRecord; onOpenSection: (section: Destination) => void; onOpenMap: () => void; model?: ReactNode }) {
  const dogs = gap.id === "dogs-safe-placement";
  useEffect(() => {
    const reveal = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id.startsWith("factor-")) return;
      const target = document.getElementById(id);
      if (target instanceof HTMLDetailsElement) {
        target.open = true;
        requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
      }
    };
    reveal();
    window.addEventListener("hashchange", reveal);
    return () => window.removeEventListener("hashchange", reveal);
  }, [gap.slug]);

  const sectionLink = (destination: Destination) => <a key={destination} href={`/reality/${gap.slug}/${destination}/`} onClick={(event) => navigateInternalLink(event, () => onOpenSection(destination))}>{linkNames[destination]} </a>;

  return <div className={`dog-gap-tab-content key-factors-page${dogs ? " is-investigation-subpage" : ""}`}>
    {dogs ? <InvestigationPageHeader id="key-factors-intro" title="Key Factors" description="What affects whether dogs reach care? Explore the six parts of the care system, what available evidence tells us about each, and what could improve them." /> : <div className="dog-gap-tab-heading" id="key-factors-intro">
      <p className="dog-gap-eyebrow">Understanding the need</p><h2>Key Factors</h2>
      <p className="key-factors-question">{`What affects ${gap.title.toLowerCase()}?`}</p>
      <p>Explore the barriers named in this need's public record and the questions that still need investigation.</p>
    </div>}
    {dogs && <p className="key-factors-note">The model below is an illustrative scenario. Its slider values are not measurements of Stockton.</p>}
    {model}
    {!dogs && <section className="dog-gap-card key-factors-evidence" aria-labelledby="key-factors-evidence-title"><p className="dog-gap-eyebrow">Public record</p><h2 id="key-factors-evidence-title">What has been reported</h2><ul>{gap.what_we_are_seeing.map((item) => <li key={item}>{item}</li>)}</ul><p>These points provide context for the factors below. They do not measure the effect of any single barrier.</p></section>}
    <div className="key-factors-list" id="key-factors-list">
      {dogs ? dogCareFactors.map((factor) => {
        const detail = dogDetails[factor.key];
        return <details className="dog-gap-card key-factor" id={`factor-${factor.key}`} key={factor.key}>
          <summary><span className="key-factor-main"><span className="key-factor-copy"><strong>{factor.label}</strong><small>{factor.description}</small></span></span></summary>
          <div className="key-factor-details">
            <div><h3>What it means</h3><p>{detail.means}</p></div>
            <div><h3>What the evidence shows</h3><p>{detail.evidence}</p></div>
            <div><h3>What we don't know</h3><p>{detail.unknown}</p></div>
            <div><h3>What could change it</h3><p>{detail.change}</p></div>
            <nav aria-label={`Related pages for ${factor.label}`}>{detail.links.map(sectionLink)}{detail.map && <a href="/work/dogs/map/" onClick={(event) => navigateInternalLink(event, onOpenMap)}>Reported locations map </a>}</nav>
          </div>
        </details>;
      }) : gap.contributing_factors.map((factor, index) => <details className="dog-gap-card key-factor" id={`factor-${index + 1}`} key={factor}>
        <summary><span className="key-factor-main"><span className="key-factor-copy"><strong>{factor}</strong><small>A reported barrier to examine</small></span></span></summary>
        <div className="key-factor-details">
          <div><h3>What it means</h3><p>This factor is named in the current need record as something that may affect access or outcomes.</p></div>
          <div><h3>What the evidence shows</h3><p>The public record identifies this possible barrier. The Research page keeps the underlying sources and their dates together.</p></div>
          <div><h3>What we don't know</h3><p>Its current extent and relative effect on this need have not been independently measured by Crossover.</p></div>
          <div><h3>What could change it</h3><p>Examine the existing participation options and tracked improvements for this need; a measured outcome has not been established.</p></div>
          <nav aria-label={`Related pages for ${factor}`}>{(["research", "improvements", "ways-to-help"] as Destination[]).map(sectionLink)}</nav>
        </div>
      </details>)}
    </div>
  </div>;
}
