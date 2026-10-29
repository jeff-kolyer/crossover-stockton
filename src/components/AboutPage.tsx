import { navigateInternalLink } from "../lib/internalLink";
import { PublicPrimaryAction } from "./PublicPrimaryAction";
import { PublicSiteNav } from "./PublicSiteNav";
import { PublicFooter } from "./PublicFooter";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";

interface AboutPageProps {
  onNavigate: (page: PublicRoute) => void;
  onPrimaryAction: () => void;
  onOpenWork: (workId: string) => void;
  onOpenGap: (slug: string) => void;
  onOpenResearch: () => void;
  onOpenFindings: () => void;
}

const ideas = [
  { title: "Technology", description: "Machines can take on more necessary work, giving people greater freedom and new ways to meet real needs.", image: "/images/about/techno.jpg", alt: "Industrial robotic arms working in a modern factory" },
  { title: "Vocation", description: "The crossover from working to make a living toward doing what we feel called to do.", image: "/images/about/guy-dog.jpg", alt: "A man sitting with a dog and looking toward the sunset" },
  { title: "Investigation", description: "Learning what is real by showing up and testing assumptions. We'll bring the dog food.", image: "/images/about/notebook.jpg", alt: "Open field notebook with handwritten observations and a pen" },
  { title: "Compassion", description: "Recognizing our shared unconsciousness and seeing beyond ego, judgment, and division.", image: "/images/about/hands.jpg", alt: "Two hands reaching toward one another in warm sunlight" },
];

const linkedInUrl = "https://www.linkedin.com/in/jeff-kolyer";
export function AboutPage({ onNavigate, onPrimaryAction }: AboutPageProps) {
  return <main className="public-site about-simple">
    <PublicSiteNav active="about" onNavigate={onNavigate} />
    <div className="about-simple-content">
      <section className="about-simple-section about-simple-purpose" aria-labelledby="about-purpose-title">
        <h1 id="about-purpose-title">How can post-scarcity technology solve real problems?</h1>
        <p>Self-driving vehicles are operating today. AI can tackle increasingly complex problems. Robots are beginning to perform useful physical work.</p>
        <p>As technology takes on more necessary labor, we may gain something extraordinary: the freedom to spend more of our lives doing what matters to us.</p>
        <p><strong>Crossover is about that transition—from work to vocation.</strong></p>
      </section>

      <section className="about-simple-section about-simple-stockton" aria-labelledby="about-stockton-title">
        <img className="about-simple-wide-image about-simple-hero-image" src="/images/about/about-crossover-hero.jpg" alt="Stockton waterfront promenade and skyline at sunset" width="1672" height="941" fetchPriority="high" decoding="async" />
        <h2 id="about-stockton-title">Starting with the stray dogs in Stockton</h2>
        <p>What if people who love animals could spend their days caring for them, rather than struggling with paperwork, logistics, and limited resources? Technology could handle more of the necessary work while people devote themselves to rescuing, fostering, training, and rehabilitating dogs.</p>
        <p>But first, we need to understand what actually happens. We're examining public reports, checking conditions firsthand, and testing pathways to care to discover where the difficulties are—and what could genuinely help.</p>
        <p><a href="/work/dogs/">Open the dog investigation</a></p>
      </section>

      <section className="about-simple-section" aria-labelledby="about-ideas-title">
        <h2 id="about-ideas-title">The ideas behind Crossover</h2>
        <div className="about-simple-ideas">
          {ideas.map((idea) => <article className="public-entry" key={idea.title}>
            <img src={idea.image} alt={idea.alt} width="760" height="304" loading="lazy" decoding="async" />
            <div><h3>{idea.title}</h3><p>{idea.description}</p></div>
          </article>)}
        </div>
      </section>

      <section className="about-simple-section about-simple-philosophy" aria-labelledby="about-reality-title">
        <h2 id="about-reality-title">We have to connect with reality.</h2>
        <div className="public-entry">
          <div><p>Freedom means little if we remain disconnected from the world around us. We can't discover our vocation simply by thinking about what might give our lives meaning.</p>
            <p>We have to show up. Encounter people, animals, and circumstances firsthand. Try to help, discover what gets in the way, and learn from what actually happens. Sometimes the experience changes our understanding. Sometimes it changes us.</p></div>
          <img className="about-simple-wide-image" src="/images/about/growing.jpg" alt="Watercolor seedling with visible roots beside the Stockton waterfront" width="1774" height="887" loading="lazy" decoding="async" />
        </div>
      </section>

      <section className="about-simple-section about-simple-founder" aria-labelledby="about-founder-title">
        <h2 id="about-founder-title">Jeff Kolyer</h2>
        <p className="about-simple-meta">Founder · Stockton, California</p>
        <div className="public-entry">
          <img className="about-simple-founder-image" src="/images/about/about-the-founder.jpg" alt="Jeff Kolyer by a waterfront promenade" width="1535" height="1024" loading="lazy" decoding="async" />
          <div><p>Crossover Stockton began with Jeff Kolyer, a former Silicon Valley technology founder exploring the transition from compulsory work to meaningful vocation.</p>
            <p>After decades building technology, the question became something more personal: If machines can increasingly do the work, what are we free to become—and what will we do with that freedom?</p>
            <a className="about-simple-text-link" href={linkedInUrl} target="_blank" rel="noreferrer">Connect on LinkedIn</a></div>
        </div>
      </section>

      <section className="about-simple-section about-simple-next" aria-labelledby="about-next-title">
        <h2 id="about-next-title">Take a real step.</h2>
        <p>There's no need to wait for the future to begin participating.</p>
        <div className="about-simple-actions">
          <PublicPrimaryAction href="/action/" onClick={(event) => navigateInternalLink(event, onPrimaryAction)}>Find out how you can help</PublicPrimaryAction>
          <a className="about-simple-text-link" href="/reality/" onClick={(event) => navigateInternalLink(event, () => onNavigate("reality"))}>Explore all needs</a>
        </div>
      </section>
    </div>
    <PublicFooter active="about" onNavigate={onNavigate} />
  </main>;
}
