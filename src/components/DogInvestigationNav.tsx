
import { useState } from "react";
import { dogGapBase, dogMapPath } from "../lib/dogGapLegacy";
import { navigateInternalLink } from "../lib/internalLink";

export type DogInvestigationPage = "overview" | "key-factors" | "improvements" | "our-findings" | "locations-map" | "research" | "updates";

const investigation = { title: "Dogs on the street", location: "Stockton, California", thumbnail: "/images/reality/dog-thumb.jpg" };
const pages: { id: DogInvestigationPage; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "key-factors", label: "Key Factors" },
  { id: "improvements", label: "Improvements" },
  { id: "our-findings", label: "Our Findings" },
  { id: "locations-map", label: "Locations Map" },
  { id: "research", label: "Sources" },
  { id: "updates", label: "Updates" },
];
const pageHref = (id: DogInvestigationPage) => id === "locations-map" ? dogMapPath : `${dogGapBase}${id === "overview" ? "" : `${id}/`}`;

export function DogInvestigationMobileNav({ active, onSelect }: { active?: DogInvestigationPage; onSelect: (page: DogInvestigationPage) => void }) {
  const [open, setOpen] = useState(false);
  return <div className="dog-gap-mobile-identity">
    <div className="dog-gap-identity-menu"><button type="button" aria-expanded={open} aria-controls="dog-gap-identity-links" onClick={() => setOpen((value) => !value)}>
      <img src={investigation.thumbnail} alt="" width="48" height="48" />
      <span><small>Investigation · {investigation.location.split(",")[0]}</small><strong>{investigation.title}</strong></span>
      
    </button>
      <nav id="dog-gap-identity-links" aria-label={`Explore ${investigation.title}`} hidden={!open}>{pages.map((page) => <a key={page.id} href={pageHref(page.id)} aria-current={active === page.id ? "page" : undefined} onClick={(event) => navigateInternalLink(event, () => { setOpen(false); onSelect(page.id); })}>{page.label}</a>)}</nav>
    </div>
  </div>;
}

export function DogInvestigationSidebar({ active, onSelect, onNeeds }: { active?: DogInvestigationPage; onSelect: (page: DogInvestigationPage) => void; onNeeds: () => void }) {
  return <aside className="dog-gap-sidebar dog-gap-section-sidebar" aria-label={`${investigation.title} pages`}>
    <a className="dog-gap-sidebar-back" href="/reality/" onClick={(event) => navigateInternalLink(event, onNeeds)}> All needs</a>
    <div className="dog-gap-investigation-identity"><span>Investigation</span><div><img src={investigation.thumbnail} alt="" width="56" height="56" /><div><strong>{investigation.title}</strong><small>{investigation.location}</small></div></div></div>
    <nav>{pages.map((page) => <a key={page.id} href={pageHref(page.id)} aria-current={active === page.id ? "page" : undefined} onClick={(event) => navigateInternalLink(event, () => onSelect(page.id))}>{page.label}</a>)}</nav>
  </aside>;
}
