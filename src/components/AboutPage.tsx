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
  { title: "Technology", description: "New capabilities can help meet real needs. But they still need us to steer them toward what matters.", image: "/images/about/techno.jpg", alt: "Industrial robotic arms working in a modern factory" },
  { title: "Vocation", description: "Post-scarcity technology could free us to discover our true purpose, and give us the tools to pursue it.", image: "/images/about/guy-dog.jpg", alt: "A man sitting with a dog and looking toward the sunset" },
  { title: "Investigation", description: "Learning what is real by showing up and testing assumptions. We'll bring the dog food.", image: "/images/about/notebook.jpg", alt: "Open field notebook with handwritten observations and a pen" },
  { title: "Compassion", description: "Recognizing our shared unconsciousness and seeing beyond ego, judgment, and division.", image: "/images/about/hands.jpg", alt: "Two hands reaching toward one another in warm sunlight" },
];

const linkedInUrl = "https://www.linkedin.com/in/jeff-kolyer";
export function AboutPage({ onNavigate, onPrimaryAction }: AboutPageProps) {
  return <main className="public-site about-simple">
    <PublicSiteNav active="about" onNavigate={onNavigate} />
    <div className="about-simple-content">
      <section className="about-simple-section about-simple-purpose" aria-labelledby="about-purpose-title">
        <h1 id="about-purpose-title">Bringing post-scarcity thinking into the real world.</h1>
        <p>AI, robotics, and automation are changing what people can accomplish. Work that once required entire organizations can increasingly be done by individuals with powerful tools.</p>
        <p>As technology takes on more necessary work, we have an opportunity to rethink how we use our time, resources, and abilities.</p>
        <p><strong>What if we used that freedom to meet real needs?</strong></p>
      </section>

      <section className="about-simple-section about-simple-stockton" aria-labelledby="about-stockton-title">
        <img className="about-simple-wide-image about-simple-hero-image" src="/images/about/about-crossover-hero.jpg" alt="Stockton waterfront promenade and skyline at sunset" width="1672" height="941" fetchPriority="high" decoding="async" />
        <h2 id="about-stockton-title">Starting in Stockton with the stray dogs epidemic</h2>
        <p>As AI and automation take over administrative drudgery, animal welfare shifts from underpaid bureaucratic labor to <strong>human vocation</strong>—where people could spend 100% of their time calming, training, fostering, and rehabilitating animals while tech handles the logistics.</p>
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
          <div><p>Not just read about problems. Not assume we know the solutions. Actually encounter the people, animals, and circumstances that need our attention.</p>
            <p>That means showing up. Trying to help. Discovering the barriers. Sometimes finding that what seemed simple is surprisingly difficult. And sometimes being changed by the experience.</p></div>
          <img className="about-simple-wide-image" src="/images/about/growing.jpg" alt="Watercolor seedling with visible roots beside the Stockton waterfront" width="1774" height="887" loading="lazy" decoding="async" />
        </div>
      </section>

      <section className="about-simple-section about-simple-founder" aria-labelledby="about-founder-title">
        <h2 id="about-founder-title">Jeff Kolyer</h2>
        <p className="about-simple-meta">Founder · Stockton, California</p>
        <div className="public-entry">
          <img className="about-simple-founder-image" src="/images/about/about-the-founder.jpg" alt="Jeff Kolyer by a waterfront promenade" width="1535" height="1024" loading="lazy" decoding="async" />
          <div><p>Crossover Stockton began with Jeff Kolyer, a former Silicon Valley technology founder exploring how emerging technology can help people live more meaningful lives.</p>
            <p>After decades working in technology, the question is no longer simply what we can build, but what kind of lives those capabilities can help us live.</p>
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
