import { ChevronDown, MapPin } from "lucide-react";
import { PublicMobileMenu } from "./PublicMobileMenu";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";
interface PublicSiteNavProps {
  active: PublicRoute;
  onNavigate: (page: PublicRoute) => void;
  onOpenAbout?: () => void;
  variant?: "overlay" | "dark" | "history" | "story";
}

const variantClass = { overlay: "", dark: "gap-detail-nav", history: "gap-history-nav", story: "story-detail-nav" };

export function PublicSiteNav({ active, onNavigate, onOpenAbout, variant = "overlay" }: PublicSiteNavProps) {
  const openAbout = onOpenAbout ?? (() => onNavigate("about"));
  return (
    <header className={`public-nav${variantClass[variant] ? ` ${variantClass[variant]}` : ""}`}>
      <PublicMobileMenu active={active} onNavigate={onNavigate} onOpenAbout={openAbout} />
      <button className="public-logo" type="button" aria-label="Crossover home" onClick={() => onNavigate("home")}>
        <img src="/images/logo_light.webp" alt="" decoding="async" />
        <span>Crossover</span>
      </button>
      <nav aria-label="Primary">
        <button type="button" className={active === "reality" ? "is-active" : ""} onClick={() => onNavigate("reality")}>Needs</button>
        <button type="button" className={active === "connection" ? "is-active" : ""} onClick={() => onNavigate("connection")}>Stories</button>
        <button type="button" className={active === "action" ? "is-active" : ""} onClick={() => onNavigate("action")}>Action</button>
        <button type="button" className={active === "updates" ? "is-active" : ""} onClick={() => onNavigate("updates")}>Updates</button>
        <button type="button" className={active === "organizations" ? "is-active" : ""} onClick={() => onNavigate("organizations")}>Organizations</button>
        <button type="button" className={active === "about" ? "is-active" : ""} aria-current={active === "about" ? "page" : undefined} onClick={openAbout}>About</button>
      </nav>
      <button className="location-pill" type="button" onClick={() => onNavigate("home")}>
        <MapPin size={16} />
        Stockton, CA
        <ChevronDown size={15} />
      </button>
    </header>
  );
}
