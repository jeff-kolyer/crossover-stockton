
import { activeCrossoverActions, dogStreetActionId } from "../data/crossoverActions";
import { navigateInternalLink } from "../lib/internalLink";
import { PublicSiteNav } from "./PublicSiteNav";
import { PublicFooter } from "./PublicFooter";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";

interface ActionIndexPageProps {
  onNavigate: (page: PublicRoute) => void;
  onOpenActionDetail: () => void;
}

export function ActionIndexPage({ onNavigate, onOpenActionDetail }: ActionIndexPageProps) {
  return (
    <main className="public-site public-home action-index-page">
      <PublicSiteNav active="action" onNavigate={onNavigate} variant="dark" />

      <div className="action-index-canvas">
        <section className="action-index-intro" aria-labelledby="action-index-title">
          <h1 id="action-index-title">Taking action. Learning from reality.</h1>
          <p>We're investigating real problems in Stockton by showing up, testing what works, and documenting what happens. Here's what we're doing now.</p>
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
              <dl className="action-index-status" aria-label="Action status">
                {action.status.map(({ value, label }) => (
                  <div className="action-index-status-item" key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <p><a href={action.href} onClick={(event) => navigateInternalLink(event, onOpenActionDetail)}>{action.buttonLabel}</a></p>
            </div>
          </article>)}
        </section>
      </div>

      <PublicFooter active="action" onNavigate={onNavigate} />
    </main>
  );
}
