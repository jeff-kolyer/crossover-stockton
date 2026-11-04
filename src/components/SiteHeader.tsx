import uiCopy from "../ui/shared.json";
import { siteModel } from "../model";
import { PublicMobileMenu, type PublicRoute } from "./PublicMobileMenu";
import { navigateInternalLink } from "../lib/internalLink";

const uiText = uiCopy.SiteHeader;

export function SiteHeader({ active, onNavigate }: { active: PublicRoute; onNavigate: (page: PublicRoute) => void }) {
  return <header className="public-nav site-header">
    <PublicMobileMenu active={active} onNavigate={onNavigate} onOpenAbout={() => onNavigate("about")} />
    <a className="public-logo" href="/" aria-label={uiText.crossoverHome} onClick={(event) => navigateInternalLink(event, () => onNavigate("home"))}>
      <img src={siteModel.getIdentity().preferred_logo || "/images/logo_light.webp"} alt="" decoding="async" />
      <span>{uiText.crossover}</span>
    </a>
    <nav aria-label={uiText.primary}>
      <button type="button" className={active === "reality" ? "is-active" : ""} onClick={() => onNavigate("reality")}>{uiText.needs}</button>
      <button type="button" className={active === "action" ? "is-active" : ""} onClick={() => onNavigate("action")}>{uiText.action}</button>
      <button type="button" className={active === "connection" ? "is-active" : ""} onClick={() => onNavigate("connection")}>{uiText.stories}</button>
      <button type="button" className={active === "updates" ? "is-active" : ""} onClick={() => onNavigate("updates")}>{uiText.updates}</button>
      <button type="button" className={active === "data" ? "is-active" : ""} aria-current={active === "data" ? "page" : undefined} onClick={() => onNavigate("data")}>{uiText.data}</button>
      <button type="button" className={active === "about" ? "is-active" : ""} aria-current={active === "about" ? "page" : undefined} onClick={() => onNavigate("about")}>{uiText.about}</button>
    </nav>
    <button className="location-pill" type="button" onClick={() => onNavigate("home")}>{uiText.stocktonCa}</button>
  </header>;
}
