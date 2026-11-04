import uiCopy from "../ui/about.json";
import { siteModel } from "../model";
import { navigateInternalLink } from "../lib/internalLink";
import { PublicPrimaryAction } from "./PublicPrimaryAction";
import { ArrowTextLink } from "./ArrowTextLink";
import { HeadingGroup, ProseStack, RecordList, SectionHeader } from "./layout";

const uiText = uiCopy.AboutPage;

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "investigation";

interface AboutPageProps {
  onNavigate: (page: PublicRoute) => void;
  onOpenTasks: () => void;
  onOpenWork: (workId: string) => void;
  onOpenGap: (slug: string) => void;
  onOpenResearch: () => void;
  onOpenFindings: () => void;
}

const identity = siteModel.getIdentity();
const founder = siteModel.getPerson(identity.founderPersonId)!;
const statements = identity.statements;
const ideas = uiText.ideas.map((idea) => {
  const concept = idea.source === "principle" ? siteModel.getPrinciple(idea.id) : siteModel.getMethod(idea.id);
  if (!concept) throw new Error(`Missing idea reference: ${idea.id}`);
  return { ...idea, title: concept.title, description: "description" in concept && typeof concept.description === "string" ? concept.description : concept.statement };
});
const documentation = statements.documentationPractice;
const emphasisStart = documentation.indexOf(": ") + 2;
const emphasisEnd = documentation.indexOf(". ", emphasisStart) + 1;

export function AboutPage({ onNavigate, onOpenTasks, onOpenFindings }: AboutPageProps) {
  return <main className="about-simple">
    <div className="about-simple-content public-document">
      <section className="about-simple-section about-simple-purpose" aria-labelledby="about-purpose-title">
        <HeadingGroup><h1 id="about-purpose-title">{statements.missionQuestion}</h1>
          <p>{statements.opportunity}</p></HeadingGroup>
        <ProseStack><p><strong>{siteModel.getPrinciple("work-to-vocation")!.statement}</strong></p>
          <p>{statements.startingApproach}</p></ProseStack>
      </section>

      <section className="about-simple-section about-simple-stockton" aria-labelledby="about-stockton-title">
        <img className="about-simple-wide-image about-simple-hero-image" src="/images/about/about-crossover-hero.jpg" alt={uiText.stocktonWaterfrontPromenadeAndSkylineAtSunset} width="1672" height="941" fetchPriority="high" decoding="async" />
        <HeadingGroup><h2 id="about-stockton-title">{uiText.startingWithTheStrayDogsInStockton}</h2>
          <p>{statements.animalCareVision}</p></HeadingGroup>
        <ProseStack><p>{statements.animalCareInvestigation}</p>
          <p>{statements.learningRule}</p></ProseStack>
        <p><PublicPrimaryAction href="/work/dogs/findings/" onClick={(event) => navigateInternalLink(event, onOpenFindings)}>{uiText.seeOurFindings}</PublicPrimaryAction></p>
      </section>

      <section className="about-simple-section" aria-labelledby="about-ideas-title">
        <SectionHeader><h2 id="about-ideas-title">{uiText.theIdeasBehindCrossover}</h2></SectionHeader>
        <div className="about-simple-ideas">
          {ideas.map((idea) => <article className="public-entry" key={idea.title}>
            <img src={idea.image} alt={idea.alt} width="760" height="304" loading="lazy" decoding="async" />
            <HeadingGroup><h3>{idea.title}</h3><p>{idea.description}</p></HeadingGroup>
          </article>)}
        </div>
      </section>

      <RecordList separated className="about-simple-tail">
      <section className="about-simple-section about-simple-philosophy" aria-labelledby="about-reality-title">
        <SectionHeader><h2 id="about-reality-title">{siteModel.getPrinciple("contact-with-reality")!.title}</h2></SectionHeader>
        <div className="public-entry">
          <img className="about-simple-wide-image" src="/images/about/growing.jpg" alt={uiText.watercolorSeedlingWithVisibleRootsBesideThe} width="1774" height="887" loading="lazy" decoding="async" />
          <ProseStack><p>{siteModel.getPrinciple("contact-with-reality")!.statement}</p>
            <p>{statements.presencePractice}</p>
            <p>{documentation.slice(0, emphasisStart)}<strong>{documentation.slice(emphasisStart, emphasisEnd)}</strong>{documentation.slice(emphasisEnd)}</p>
            <p className="about-simple-philosophy-full">{statements.aiPractice}</p>
            <p><strong>{siteModel.getPrinciple("work-discovers-work")!.statement}</strong></p>
            <p>{statements.experienceChangesUs}</p></ProseStack>
        </div>
      </section>

      <section className="about-simple-section about-simple-founder" aria-labelledby="about-founder-title">
        <HeadingGroup><h2 id="about-founder-title">{founder.name}</h2>
          <p className="about-simple-meta">{`${founder.roles[0].title} · ${founder.roles[0].locality}`}</p></HeadingGroup>
        <div className="public-entry">
          <img className="about-simple-founder-image" src="/images/about/about-the-founder.jpg" alt={uiText.jeffKolyerByAWaterfrontPromenade} width="1535" height="1024" loading="lazy" decoding="async" />
          <ProseStack><p>{founder.biography[0]}</p>
            <p>{founder.biography[1]}</p>
            <p><a className="public-primary-action" href={founder.profileUrl} target="_blank" rel="noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
              <span>{uiText.connectOnLinkedin}</span>
            </a></p></ProseStack>
        </div>
      </section>

      <section className="about-simple-section about-simple-next" aria-labelledby="about-next-title">
        <HeadingGroup><h2 id="about-next-title">{uiText.seeWhatWeReDoing}</h2>
          <p>{statements.publicCommitment}</p></HeadingGroup>
        <div className="about-simple-actions">
          <PublicPrimaryAction href="/work/dogs/tasks/" onClick={(event) => navigateInternalLink(event, onOpenTasks)}>{uiText.viewOurCurrentTasks}</PublicPrimaryAction>
          <ArrowTextLink className="arrow-text-link--green" href="/reality/" onClick={(event) => navigateInternalLink(event, () => onNavigate("reality"))}>{uiText.exploreAllNeeds}</ArrowTextLink>
        </div>
      </section>
      </RecordList>
    </div>
  </main>;
}
