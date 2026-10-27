import { navigateInternalLink } from "../lib/internalLink";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";

export function PublicFooter({ active, onNavigate, onOpenAbout }: {
  active: PublicRoute;
  onNavigate: (page: PublicRoute) => void;
  onOpenAbout?: () => void;
}) {
  const open = (page: PublicRoute) => page === "about" && onOpenAbout ? onOpenAbout() : onNavigate(page);
  const links: { page: PublicRoute; label: string; href: string }[] = [
    { page: "home", label: "Home", href: "/" },
    { page: "reality", label: "Needs", href: "/reality/" },
    { page: "connection", label: "Stories", href: "/connection/" },
    { page: "action", label: "Action", href: "/action/" },
    { page: "about", label: "About", href: "/about/" },
  ];
  return <>
    <footer className="public-footer">
      <a className="footer-logo" href="/" aria-label="Crossover home" onClick={(event) => navigateInternalLink(event, () => open("home"))}>
        <img src="/images/logo_light.webp" alt="" decoding="async" />
        <span>Crossover</span>
      </a>
      <span>© 2026 Crossover Stockton</span>
      <p>Reality. Connection. Action.</p>
      <nav aria-label="Footer">
        {links.filter(({ page }) => page === "reality" || page === "action" || page === "about").map(({ page, label, href }) =>
          <a key={page} href={href} aria-current={active === page ? "page" : undefined} onClick={(event) => navigateInternalLink(event, () => open(page))}>{label}</a>)}
      </nav>
    </footer>
    <nav className="public-bottom-nav" aria-label="Mobile primary">
      {links.map(({ page, label, href }) => <a key={page} href={href} aria-current={active === page ? "page" : undefined} onClick={(event) => navigateInternalLink(event, () => open(page))}>{label}</a>)}
    </nav>
  </>;
}
