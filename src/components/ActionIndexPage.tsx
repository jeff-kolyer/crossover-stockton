
import { activeCrossoverActions, dogStreetActionId } from "../data/crossoverActions";
import { navigateInternalLink } from "../lib/internalLink";
import { PublicSiteNav } from "./PublicSiteNav";
import { PublicFooter } from "./PublicFooter";
import { ActionProgressStats } from "./ActionProgressStats";
import { ArrowTextLink } from "./ArrowTextLink";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "investigation";

interface ActionIndexPageProps {
  onNavigate: (page: PublicRoute) => void;
  onOpenTasks: () => void;
  onOpenInvestigation: () => void;
}

export function ActionIndexPage({ onNavigate, onOpenTasks, onOpenInvestigation }: ActionIndexPageProps) {
  return (
    <main className="public-site public-home action-index-page">
      <PublicSiteNav active="action" onNavigate={onNavigate} variant="dark" />

      <div className="action-index-canvas public-document">
        <section className="action-index-intro" aria-labelledby="action-index-title">
          <h1 id="action-index-title">Taking action. Learning from reality.</h1>
          <p>We're investigating real problems in Stockton by showing up, testing what works, and documenting what happens. Here's what we're doing now.</p>
        </section>

        <section className="action-index-investigations" aria-labelledby="action-index-investigations-title">
          <div className="action-index-investigations-intro">
            <h2 id="action-index-investigations-title">Investigations</h2>
            <p>Explore what we are learning in Stockton.</p>
          </div>
          <a className="action-index-investigation-card" href="/work/dogs/activity/#overview" onClick={(event) => navigateInternalLink(event, onOpenInvestigation)}>
            <img src="/images/reality/dog-thumb.jpg" alt="" width="120" height="120" />
            <div className="action-index-investigation-copy">
              <h3>Dogs on the street in Stockton</h3>
              <span className="action-index-investigation-meta"><span className="home-landing-status" data-status="investigating">Investigating</span><small>Stockton, California</small></span>
              <p>Field reports, locations, pathways to care, and current findings.</p>
            </div>
            <svg className="action-index-investigation-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
          </a>
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
              <div className="action-index-feature-description">
                <h3>{action.title}</h3>
                <p>{action.summary}</p>
              </div>
              <ActionProgressStats status={action.status} />
              <p className="action-index-explore"><ArrowTextLink className="arrow-text-link--green" href={action.href} onClick={(event) => navigateInternalLink(event, onOpenTasks)}>{action.buttonLabel}</ArrowTextLink></p>
            </div>
          </article>)}
        </section>
      </div>

      <PublicFooter active="action" onNavigate={onNavigate} />
    </main>
  );
}
