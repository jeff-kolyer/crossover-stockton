import uiCopy from "../data/pages/action.json";
import { siteModel } from "../model";
import { resolvePageSection } from "../view/registry";
import { PageSectionRenderer } from "../view/PageSectionRenderer";

import { activeCrossoverActions, dogStreetActionId } from "../data/crossoverActions";
import { navigateInternalLink } from "../lib/internalLink";
import { ActionProgressStats } from "./ActionProgressStats";
import { ArrowTextLink } from "./ArrowTextLink";
import { HeadingGroup, Page } from "./layout";

const uiText = uiCopy.ActionIndexPage;
const investigationId = resolvePageSection("action", "investigations").items[0].id;
const investigation = siteModel.getInvestigation(investigationId)!;

interface ActionIndexPageProps {
  onOpenTasks: () => void;
  onOpenInvestigation: () => void;
}

export function ActionIndexPage({ onOpenTasks, onOpenInvestigation }: ActionIndexPageProps) {
  return (
    <main className="public-home action-index-page">

      <Page width="wide" className="action-index-canvas public-document">
        <HeadingGroup as="section" className="action-index-intro" aria-labelledby="action-index-title">
          <h1 id="action-index-title">{uiText.takingActionLearningFromReality}</h1>
          <p>{uiText.weReInvestigatingRealProblemsInStockton}</p>
        </HeadingGroup>

        <section className="action-index-investigations" aria-labelledby="action-index-investigations-title">
          <HeadingGroup className="action-index-investigations-intro">
            <h2 id="action-index-investigations-title">{uiText.investigations}</h2>
            <p>{uiText.exploreWhatWeAreLearningInStockton}</p>
          </HeadingGroup>
          <a className="action-index-investigation-card" href="/work/dogs/activity/#overview" onClick={(event) => navigateInternalLink(event, onOpenInvestigation)}>
            <img src="/images/reality/dog-thumb.jpg" alt="" width="120" height="120" />
            <div className="action-index-investigation-copy">
              <h3>{investigation.publicName}</h3>
              <span className="action-index-investigation-meta"><span className="home-landing-status" data-status="investigating">{uiText.investigating}</span><small>{siteModel.getIdentity().geographicScope.name}</small></span>
              <p>{investigation.indexSummary}</p>
            </div>
            <svg className="action-index-investigation-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
          </a>
        </section>

        <section className="action-index-current" aria-labelledby="action-index-current-title">
          <h2 id="action-index-current-title">{uiText.currentActions}</h2>
          <PageSectionRenderer pageId="action" sectionId="current-actions" className="action-index-feature-list" renderRecord={({ id }) => {
            const action = activeCrossoverActions.find((item) => item.id === id);
            if (!action) throw new Error(`Missing active action ${id}`);
            return <article className="action-index-feature" key={action.id}>
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
              <HeadingGroup className="action-index-feature-description">
                <h3>{action.title}</h3>
                <p>{action.summary}</p>
              </HeadingGroup>
              <ActionProgressStats status={action.status} />
              <p className="action-index-explore"><ArrowTextLink className="arrow-text-link--green" href={action.href} onClick={(event) => navigateInternalLink(event, onOpenTasks)}>{action.buttonLabel}</ArrowTextLink></p>
            </div>
          </article>;
          }} />
        </section>
      </Page>

    </main>
  );
}
