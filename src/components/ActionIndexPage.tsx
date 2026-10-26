import { AlertTriangle, ArrowRight, Home as HomeIcon, MapPin, Search, Sparkles } from "lucide-react";
import { activeCrossoverActions, dogStreetActionId } from "../data/crossoverActions";
import { navigateInternalLink } from "../lib/internalLink";
import { PublicSiteNav } from "./PublicSiteNav";
import "./ActionIndexPage.css";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";

interface ActionIndexPageProps {
  onNavigate: (page: PublicRoute) => void;
  onOpenActionDetail: () => void;
}

export function ActionIndexPage({ onNavigate, onOpenActionDetail }: ActionIndexPageProps) {
  return (
    <main className="public-home action-index-page">
      <PublicSiteNav active="action" onNavigate={onNavigate} variant="dark" />

      <div className="action-index-canvas">
        <section className="action-index-intro" aria-labelledby="action-index-title">
          <p className="action-index-eyebrow">Crossover actions</p>
          <h1 id="action-index-title">Take a real step.</h1>
          <p>We're investigating real problems in Stockton by showing up, testing what works, and documenting what happens. Here's how you can participate.</p>
        </section>

        <section className="action-index-current" aria-labelledby="action-index-current-title">
          <h2 id="action-index-current-title">Current actions</h2>
          {activeCrossoverActions.map((action) => <article className="action-index-feature" key={action.id}>
            <img
              className="action-index-image"
              src={action.image.src}
              alt={action.image.alt}
              width={action.image.width}
              height={action.image.height}
              fetchPriority={action.id === dogStreetActionId ? "high" : undefined}
              decoding="async"
            />
            <div className="action-index-feature-copy">
              <div>
                <h3>{action.title}</h3>
                <p>{action.summary}</p>
              </div>
              <dl className="action-index-status" aria-label="Fieldwork status">
                {action.status.map(({ value, label }) => (
                  <div className="action-index-status-item" key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <a className="action-index-button" href={action.href} onClick={action.id === dogStreetActionId ? (event) => navigateInternalLink(event, onOpenActionDetail) : undefined}>
                {action.buttonLabel} <ArrowRight size={19} aria-hidden="true" />
              </a>
            </div>
          </article>)}
        </section>
      </div>

      <footer className="public-footer">
        <div className="footer-logo" aria-label="Crossover">
          <picture><source media="(max-width: 760px)" srcSet="/images/logo_dark.webp" /><img src="/images/logo_light.webp" alt="" decoding="async" /></picture>
          <span>Crossover</span>
        </div>
        <span>© 2026 Crossover Stockton</span>
        <p>Reality. Connection. Action.</p>
        <button type="button" onClick={() => onNavigate("reality")}>Needs</button>
        <button type="button" className="is-active" aria-current="page">Action</button>
        <button type="button" onClick={() => onNavigate("about")}>About</button>
      </footer>

      <nav className="public-bottom-nav" aria-label="Mobile primary">
        <button type="button" onClick={() => onNavigate("home")}><HomeIcon size={21} /><span>Home</span></button>
        <button type="button" onClick={() => onNavigate("connection")}><MapPin size={21} /><span>Stories</span></button>
        <button type="button" onClick={() => onNavigate("reality")}><Search size={21} /><span>Needs</span></button>
        <button type="button" className="is-active" aria-current="page"><AlertTriangle size={21} /><span>Action</span></button>
        <button type="button" onClick={() => onNavigate("about")}><Sparkles size={21} /><span>About</span></button>
      </nav>
    </main>
  );
}
