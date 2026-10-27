import { navigateInternalLink } from "../lib/internalLink";
import { PlainActionButton } from "./PlainActionButton";
import "./AboutPage.css";

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
const dogGapSlug = "too-many-dogs-still-lack-safe-placement";

export function AboutPage({ onNavigate, onPrimaryAction, onOpenGap }: AboutPageProps) {
  return <main className="about-simple">
    <header className="crossover-investigation-header">
      <div className="crossover-brand-row">
        <a href="/" onClick={(event) => navigateInternalLink(event, () => onNavigate("home"))}>CROSSOVER</a>
        <a href={"/reality/" + dogGapSlug + "/"} onClick={(event) => navigateInternalLink(event, () => onOpenGap(dogGapSlug))}>Investigation</a>
      </div>
      <h1>About Crossover Stockton</h1>
      <p>Technology, vocation, and direct investigation in Stockton.</p>
    </header>

    <div className="about-simple-content">
      <section className="about-simple-section" aria-labelledby="about-purpose-title">
        <h2 id="about-purpose-title">How can emerging post-scarcity technology solve real problems?</h2>
        <p>Self-driving vehicles are operating today. AI can tackle increasingly complex problems. Robots are beginning to perform useful physical work.</p>
        <p>As these technologies advance, they could free people from more compulsory labor and create extraordinary new possibilities.</p>
        <p><strong>But what will we do with that freedom?</strong></p>
        <img className="about-simple-wide-image" src="/images/about/about-crossover-hero.jpg" alt="Stockton waterfront promenade and skyline at sunset" width="1672" height="941" fetchPriority="high" decoding="async" />
      </section>

      <section className="about-simple-section" aria-labelledby="about-stockton-title">
        <h2 id="about-stockton-title">Starting in Stockton with the stray dogs epidemic</h2>
        <p>As AI and automation take over administrative drudgery, animal welfare shifts from underpaid bureaucratic labor to <strong>human vocation</strong>—where people spend 100% of their time calming, training, fostering, and rehabilitating animals while tech handles the logistics.</p>
      </section>

      <section className="about-simple-section" aria-labelledby="about-ideas-title">
        <h2 id="about-ideas-title">The ideas behind Crossover</h2>
        <div className="about-simple-ideas">
          {ideas.map((idea) => <article key={idea.title}>
            <img src={idea.image} alt={idea.alt} width="760" height="304" loading="lazy" decoding="async" />
            <h3>{idea.title}</h3><p>{idea.description}</p>
          </article>)}
        </div>
      </section>

      <section className="about-simple-section" aria-labelledby="about-reality-title">
        <h2 id="about-reality-title">We have to connect with reality.</h2>
        <img className="about-simple-wide-image" src="/images/about/growing.jpg" alt="Watercolor seedling with visible roots beside the Stockton waterfront" width="1774" height="887" loading="lazy" decoding="async" />
        <p>Not just read about problems. Not assume we know the solutions. Actually encounter the people, animals, and circumstances that need our attention.</p>
        <p>That means showing up. Trying to help. Discovering the barriers. Sometimes finding that what seemed simple is surprisingly difficult. And sometimes being changed by the experience.</p>
        <p><strong>That's what Crossover is exploring. We're starting in Stockton.</strong></p>
      </section>

      <section className="about-simple-section" aria-labelledby="about-founder-title">
        <h2 id="about-founder-title">Jeff Kolyer</h2>
        <p className="about-simple-meta">Founder · Stockton, California</p>
        <img className="about-simple-founder-image" src="/images/about/about-the-founder.jpg" alt="Jeff Kolyer by a waterfront promenade" width="1535" height="1024" loading="lazy" decoding="async" />
        <p>Crossover Stockton began with Jeff Kolyer, a former Silicon Valley technology founder exploring how emerging technology can help people live more meaningful lives.</p>
        <p>After decades working in technology, the question is no longer simply what we can build, but what kind of lives those capabilities can help us live.</p>
        <a className="about-simple-text-link" href={linkedInUrl} target="_blank" rel="noreferrer">Connect on LinkedIn</a>
      </section>

      <section className="about-simple-section about-simple-next" aria-labelledby="about-next-title">
        <h2 id="about-next-title">Take a real step.</h2>
        <p>There's no need to wait for the future to begin participating.</p>
        <div className="about-simple-actions">
          <PlainActionButton onClick={onPrimaryAction}>Find out how you can help</PlainActionButton>
          <a className="about-simple-text-link" href="/reality/" onClick={(event) => navigateInternalLink(event, () => onNavigate("reality"))}>Explore all needs</a>
        </div>
      </section>
    </div>
  </main>;
}
