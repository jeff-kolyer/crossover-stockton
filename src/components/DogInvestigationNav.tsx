import { ArrowLeft, BarChart3, Bell, ChevronDown, FileText, House, MapPin, Wrench, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { dogGapBase, dogMapPath } from "../lib/dogGapLegacy";
import { navigateInternalLink } from "../lib/internalLink";

export type DogInvestigationPage = "overview" | "key-factors" | "improvements" | "our-findings" | "locations-map" | "research" | "updates";

const investigation = { title: "Dogs on the street", location: "Stockton, California", thumbnail: "/images/reality/dog-thumb.jpg" };
const pages: { id: DogInvestigationPage; label: string; Icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", Icon: House },
  { id: "key-factors", label: "Key Factors", Icon: BarChart3 },
  { id: "improvements", label: "Improvements", Icon: Wrench },
  { id: "our-findings", label: "Our Findings", Icon: FileText },
  { id: "locations-map", label: "Locations Map", Icon: MapPin },
  { id: "research", label: "Sources", Icon: FileText },
  { id: "updates", label: "Updates", Icon: Bell },
];
const pageHref = (id: DogInvestigationPage) => id === "locations-map" ? dogMapPath : `${dogGapBase}${id === "overview" ? "" : `${id}/`}`;

export function DogInvestigationMobileNav({ active, onSelect }: { active?: DogInvestigationPage; onSelect: (page: DogInvestigationPage) => void }) {
  const [open, setOpen] = useState(false);
  return <div className="dog-gap-mobile-identity">
    <div className="dog-gap-identity-menu"><button type="button" aria-expanded={open} aria-controls="dog-gap-identity-links" onClick={() => setOpen((value) => !value)}>
      <img src={investigation.thumbnail} alt="" width="48" height="48" />
      <span><small>Investigation · {investigation.location.split(",")[0]}</small><strong>{investigation.title}</strong></span>
      <ChevronDown size={20} aria-hidden="true" />
    </button>
      <nav id="dog-gap-identity-links" aria-label={`Explore ${investigation.title}`} hidden={!open}>{pages.map((page) => <a key={page.id} href={pageHref(page.id)} aria-current={active === page.id ? "page" : undefined} onClick={(event) => navigateInternalLink(event, () => { setOpen(false); onSelect(page.id); })}>{page.label}</a>)}</nav>
    </div>
  </div>;
}

export function DogInvestigationSidebar({ active, onSelect, onNeeds }: { active?: DogInvestigationPage; onSelect: (page: DogInvestigationPage) => void; onNeeds: () => void }) {
  return <aside className="dog-gap-sidebar dog-gap-section-sidebar" aria-label={`${investigation.title} pages`}>
    <a className="dog-gap-sidebar-back" href="/reality/" onClick={(event) => navigateInternalLink(event, onNeeds)}><ArrowLeft size={17} aria-hidden="true" /> All needs</a>
    <div className="dog-gap-investigation-identity"><span>Investigation</span><div><img src={investigation.thumbnail} alt="" width="56" height="56" /><div><strong>{investigation.title}</strong><small>{investigation.location}</small></div></div></div>
    <nav>{pages.map((page) => <a key={page.id} href={pageHref(page.id)} aria-current={active === page.id ? "page" : undefined} onClick={(event) => navigateInternalLink(event, () => onSelect(page.id))}><page.Icon size={18} strokeWidth={1.9} aria-hidden="true" />{page.label}</a>)}</nav>
  </aside>;
}
