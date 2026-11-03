import uiCopy from "../data/ui-copy.json";
import { navigateInternalLink } from "../lib/internalLink";

const uiText = uiCopy.PublicFooter;

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "data" | "investigation";

export function PublicFooter({ active, onNavigate, onOpenAbout }: {
  active: PublicRoute;
  onNavigate: (page: PublicRoute) => void;
  onOpenAbout?: () => void;
}) {
  const open = (page: PublicRoute) => page === "about" && onOpenAbout ? onOpenAbout() : onNavigate(page);
  const links = uiCopy.navigation.filter(({ page }) => page !== "updates" && page !== "data") as { page: PublicRoute; label: string; href: string }[];
  return <>
    <footer className="public-footer">
      <a className="footer-logo" href="/" aria-label={uiText.crossoverHome} onClick={(event) => navigateInternalLink(event, () => open("home"))}>
        <img src="/images/logo_light.webp" alt="" decoding="async" />
        <span>{uiText.crossover}</span>
      </a>
      <span>{uiText.text2026CrossoverStockton}</span>
      <p>{uiText.realityConnectionAction}</p>
      <nav aria-label={uiText.footer}>
        {links.filter(({ page }) => page === "reality" || page === "action" || page === "about").map(({ page, label, href }) =>
          <a key={page} href={href} aria-current={active === page ? "page" : undefined} onClick={(event) => navigateInternalLink(event, () => open(page))}>{label}</a>)}
      </nav>
    </footer>
    <nav className="public-bottom-nav" aria-label={uiText.mobilePrimary}>
      {links.map(({ page, label, href }) => <a key={page} href={href} aria-current={active === page ? "page" : undefined} onClick={(event) => navigateInternalLink(event, () => open(page))}>{label}</a>)}
    </nav>
  </>;
}
