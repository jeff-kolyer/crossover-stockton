import { navigateInternalLink } from "../lib/internalLink";
import { PublicPrimaryAction } from "./PublicPrimaryAction";
import { PublicSiteNav } from "./PublicSiteNav";
import { PublicFooter } from "./PublicFooter";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";

interface AboutPageProps {
  onNavigate: (page: PublicRoute) => void;
  onOpenTasks: () => void;
  onOpenWork: (workId: string) => void;
  onOpenGap: (slug: string) => void;
  onOpenResearch: () => void;
  onOpenFindings: () => void;
}

const ideas = [
  { title: "Technology", description: "Using AI, robotics, and automation to reduce unnecessary work and expand what people can do.", image: "/images/about/techno.jpg", alt: "Industrial robotic arms working in a modern factory" },
  { title: "Vocation", description: "Moving from working to make a living toward doing what we feel called to do.", image: "/images/about/guy-dog.jpg", alt: "A man sitting with a dog and looking toward the sunset" },
  { title: "Investigation", description: "Discovering what is real through evidence, firsthand experience, and practical experiments. We'll bring the dog food.", image: "/images/about/notebook.jpg", alt: "Open field notebook with handwritten observations and a pen" },
  { title: "Compassion", description: "Recognizing our shared unconsciousness and seeing beyond ego, judgment, and division.", image: "/images/about/hands.jpg", alt: "Two hands reaching toward one another in warm sunlight" },
];

const linkedInUrl = "https://www.linkedin.com/in/jeff-kolyer";
export function AboutPage({ onNavigate, onOpenTasks, onOpenFindings }: AboutPageProps) {
  return <main className="public-site about-simple">
    <PublicSiteNav active="about" onNavigate={onNavigate} />
    <div className="about-simple-content public-document">
      <section className="about-simple-section about-simple-purpose" aria-labelledby="about-purpose-title">
        <h1 id="about-purpose-title">How can post-scarcity technology solve real problems?</h1>
        <p>As AI and robotics take on more necessary work, we have an extraordinary opportunity: to spend more of our lives caring for one another, other living beings, and the world around us.</p>
        <p><strong>Crossover explores that transition—from work to vocation.</strong></p>
        <p>We're starting now, investigating real needs in Stockton, taking action, and using what we learn to discover what technology and human participation can make possible.</p>
      </section>

      <section className="about-simple-section about-simple-stockton" aria-labelledby="about-stockton-title">
        <img className="about-simple-wide-image about-simple-hero-image" src="/images/about/about-crossover-hero.jpg" alt="Stockton waterfront promenade and skyline at sunset" width="1672" height="941" fetchPriority="high" decoding="async" />
        <h2 id="about-stockton-title">Starting with the stray dogs in Stockton</h2>
        <p>What if people who love animals could spend their days rescuing, fostering, training, and rehabilitating dogs, while technology handled more of the paperwork, logistics, and coordination?</p>
        <p>We're investigating what happens to dogs on Stockton's streets, how they reach care, and what gets in the way. We examine public records, check reported conditions firsthand, talk to people already helping, and test pathways to care.</p>
        <p>What we discover guides what we do next.</p>
        <p><a href="/work/dogs/findings/" onClick={(event) => navigateInternalLink(event, onOpenFindings)}>See our findings →</a></p>
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
          <img className="about-simple-wide-image" src="/images/about/growing.jpg" alt="Watercolor seedling with visible roots beside the Stockton waterfront" width="1774" height="887" loading="lazy" decoding="async" />
          <p>Freedom means little if we remain disconnected from the world around us. We can't discover our vocation simply by imagining what might give our lives meaning.</p>
          <p>We have to show up. Meet people. Observe conditions. Try to help. Discover what happens.</p>
          <p>Crossover connects those experiences through an investigation app: <strong>Tasks, Activity, Map, and Findings.</strong> We document what we do, examine what we learn, and identify what needs investigating next.</p>
          <p className="about-simple-philosophy-full">AI helps organize the evidence, connect observations, update our findings, and discover new actions. Our articles become a growing body of knowledge that others can use, question, and build upon.</p>
          <p><strong>The work discovers the work.</strong></p>
          <p>And sometimes the experience changes our understanding. Sometimes it changes us.</p>
        </div>
      </section>

      <section className="about-simple-section about-simple-founder" aria-labelledby="about-founder-title">
        <h2 id="about-founder-title">Jeff Kolyer</h2>
        <p className="about-simple-meta">Founder · Stockton, California</p>
        <div className="public-entry">
          <img className="about-simple-founder-image" src="/images/about/about-the-founder.jpg" alt="Jeff Kolyer by a waterfront promenade" width="1535" height="1024" loading="lazy" decoding="async" />
          <div><p>Crossover Stockton began with Jeff Kolyer, a former Silicon Valley technology founder exploring the transition from compulsory work to meaningful vocation.</p>
            <p>After decades building technology, the question became personal: If machines can increasingly do the work, what are we free to become—and what will we do with that freedom?</p>
            <a className="about-simple-text-link" href={linkedInUrl} target="_blank" rel="noreferrer">Connect on LinkedIn</a></div>
        </div>
      </section>

      <section className="about-simple-section about-simple-next" aria-labelledby="about-next-title">
        <h2 id="about-next-title">See what we're doing.</h2>
        <p>We're investigating real needs in Stockton. Our actions, observations, and findings are public—including what we haven't figured out yet.</p>
        <div className="about-simple-actions">
          <PublicPrimaryAction href="/work/dogs/tasks/" onClick={(event) => navigateInternalLink(event, onOpenTasks)}>View our current tasks</PublicPrimaryAction>
          <a className="about-simple-text-link" href="/reality/" onClick={(event) => navigateInternalLink(event, () => onNavigate("reality"))}>Explore all needs</a>
        </div>
      </section>
    </div>
    <PublicFooter active="about" onNavigate={onNavigate} />
  </main>;
}
