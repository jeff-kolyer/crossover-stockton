import { AlertTriangle, ArrowRight, Home as HomeIcon, Linkedin, MapPin, Search, Sparkles } from "lucide-react";
import { navigateInternalLink } from "../lib/internalLink";
import { PublicSiteNav } from "./PublicSiteNav";
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
const logoDark = "/images/logo_dark.webp";
const logoLight = "/images/logo_light.webp";

export function AboutPage({ onNavigate, onPrimaryAction }: AboutPageProps) {
  return (
    <main className="public-home about-page about-redesign">
      <PublicSiteNav active="about" onNavigate={onNavigate} variant="dark" />

      <div className="about-redesign-canvas">
        <section className="about-redesign-hero" aria-labelledby="about-redesign-title">
          <div className="about-redesign-hero-copy">
            <p className="about-redesign-eyebrow">About Crossover Stockton</p>
            <h1 id="about-redesign-title">How can emerging post-scarcity technology solve real problems?</h1>
            <p>Self-driving vehicles are operating today. AI can tackle increasingly complex problems. Robots are beginning to perform useful physical work.</p>
            <p>As these technologies advance, they could free people from more compulsory labor and create extraordinary new possibilities.</p>
            <p><strong>But what will we do with that freedom?</strong></p>
          </div>
          <img className="about-redesign-hero-image" src="/images/about/about-crossover-hero.jpg" alt="Stockton waterfront promenade and skyline at sunset" width="1672" height="941" fetchPriority="high" decoding="async" />
        </section>

        <section className="about-redesign-ideas" aria-labelledby="about-redesign-ideas-title">
          <h2 id="about-redesign-ideas-title">The ideas behind Crossover</h2>
          <div className="about-redesign-ideas-grid">
            {ideas.map((idea) => <article className="about-redesign-idea" key={idea.title}>
              <img src={idea.image} alt={idea.alt} width="760" height="304" loading="lazy" decoding="async" />
              <div><h3>{idea.title}</h3><p>{idea.description}</p></div>
            </article>)}
          </div>
        </section>

        <section className="about-redesign-reality" aria-labelledby="about-redesign-reality-title">
          <img src="/images/about/growing.jpg" alt="Watercolor seedling with visible roots beside the Stockton waterfront" width="1774" height="887" loading="lazy" decoding="async" />
          <div>
            <h2 id="about-redesign-reality-title">We have to connect with reality.</h2>
            <p>Not just read about problems. Not assume we know the solutions. Actually encounter the people, animals, and circumstances that need our attention.</p>
            <p>That means showing up. Trying to help. Discovering the barriers. Sometimes finding that what seemed simple is surprisingly difficult. And sometimes being changed by the experience.</p>
            <p><strong>That's what Crossover is exploring. We're starting in Stockton.</strong></p>
          </div>
        </section>

        <section className="about-redesign-founder" aria-labelledby="about-redesign-founder-title">
          <div className="about-redesign-founder-copy">
            <p className="about-redesign-eyebrow">About the founder</p>
            <div className="about-redesign-founder-name">
              <h2 id="about-redesign-founder-title">Jeff Kolyer</h2>
              <p className="about-redesign-founder-meta">Founder · Stockton, California</p>
            </div>
            <p>Crossover Stockton began with Jeff Kolyer, a former Silicon Valley technology founder exploring how emerging technology can help people live more meaningful lives.</p>
            <p>After decades working in technology, the question is no longer simply what we can build, but what kind of lives those capabilities can help us live.</p>
            <a className="about-redesign-linkedin" href={linkedInUrl} target="_blank" rel="noreferrer"><Linkedin size={18} aria-hidden="true" /> Connect on LinkedIn</a>
          </div>
          <img src="/images/about/about-the-founder.jpg" alt="Jeff Kolyer by a waterfront promenade" width="1535" height="1024" loading="lazy" decoding="async" />
        </section>

        <section className="about-redesign-cta" aria-labelledby="about-redesign-cta-title">
          <div><h2 id="about-redesign-cta-title">Take a real step.</h2><p>There's no need to wait for the future to begin participating.</p></div>
          <div className="about-redesign-cta-actions">
            <a className="about-redesign-cta-primary" href="/action/" onClick={(event) => navigateInternalLink(event, onPrimaryAction)}>Find out how you can help <ArrowRight size={17} aria-hidden="true" /></a>
            <a className="about-redesign-cta-secondary" href="/reality/" onClick={(event) => navigateInternalLink(event, () => onNavigate("reality"))}>Explore all needs <ArrowRight size={17} aria-hidden="true" /></a>
          </div>
        </section>
      </div>

      <footer className="public-footer">
        <div className="footer-logo" aria-label="Crossover">
          <picture><source media="(max-width: 760px)" srcSet={logoDark} /><img src={logoLight} alt="" decoding="async" /></picture>
          <span>Crossover</span>
        </div>
        <span>© 2026 Crossover Stockton</span>
        <p>Reality. Connection. Action.</p>
        <button type="button" onClick={() => onNavigate("reality")}>Needs</button>
        <button type="button" onClick={onPrimaryAction}>Action</button>
        <button type="button" className="is-active">About</button>
      </footer>

      <nav className="public-bottom-nav" aria-label="Mobile primary">
        <button type="button" onClick={() => onNavigate("home")}><HomeIcon size={21} /><span>Home</span></button>
        <button type="button" onClick={() => onNavigate("connection")}><MapPin size={21} /><span>Stories</span></button>
        <button type="button" onClick={() => onNavigate("reality")}><Search size={21} /><span>Needs</span></button>
        <button type="button" onClick={() => onNavigate("action")}><AlertTriangle size={21} /><span>Action</span></button>
        <button type="button" className="is-active"><Sparkles size={21} /><span>About</span></button>
      </nav>
    </main>
  );
}
