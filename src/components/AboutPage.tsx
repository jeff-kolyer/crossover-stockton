import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Ban,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Hand,
  Heart,
  Home as HomeIcon,
  Linkedin,
  MapPin,
  Search,
  Stars,
  Sprout,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { PublicMobileMenu } from "./PublicMobileMenu";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";

const aboutHeroImage = "/images/about/about-crossover-hero.jpg";
const awarenessConnectionImage = "/images/about/awareness-connection-hero.jpg";
const logoDark = "/images/logo_dark.webp";
const logoLight = "/images/logo_light.webp";
const linkedInUrl = "http://www.linkedin.com/in/jeff-kolyer";

interface AboutPageProps {
  onNavigate: (page: PublicRoute) => void;
  onPrimaryAction: () => void;
}

export function AboutPage({ onNavigate, onPrimaryAction }: AboutPageProps) {
  return (
    <main className="public-home about-page">
      <section className="about-hero">
        <img className="about-hero-image" src={aboutHeroImage} alt="" aria-hidden="true" loading="eager" decoding="sync" fetchPriority="high" />
        <div className="about-hero-shade" />
        <header className="public-nav">
          <PublicMobileMenu active="about" onNavigate={onNavigate} />
          <button className="public-logo" type="button" aria-label="Crossover home" onClick={() => onNavigate("home")}>
            <img src={logoLight} alt="" decoding="async" />
            <span>Crossover</span>
          </button>
          <nav aria-label="Primary">
            <button type="button" onClick={() => onNavigate("reality")}>Needs</button>
            <button type="button" onClick={() => onNavigate("connection")}>Stories</button>
            <button type="button" onClick={() => onNavigate("action")}>Action</button>
            <button type="button" onClick={() => onNavigate("updates")}>Updates</button>
            <button type="button" onClick={() => onNavigate("organizations")}>Organizations</button>
            <button type="button" className="is-active">About</button>
          </nav>
          <button className="location-pill" type="button" onClick={() => onNavigate("home")}>
            <MapPin size={16} />
            Stockton, CA
            <ChevronDown size={15} />
          </button>
        </header>

        <div className="about-hero-copy">
          <h1>About Crossover</h1>
          <h2>Building a ground-up infrastructure of care.</h2>
          <p>We investigate unmet needs, check what help actually reaches people and animals, and make room for neighbors to respond.</p>
        </div>
      </section>

      <section className="about-main">
        <section className="about-product-row" aria-label="Crossover sections">
          <button type="button" className="is-needs" onClick={() => onNavigate("reality")}>
            <Heart size={34} />
            <span><strong>Needs</strong> show where reality is asking something of us.</span>
          </button>
          <button type="button" className="is-being" onClick={() => onNavigate("connection")}>
            <Sprout size={34} />
            <span><strong>Signs of Being</strong> show what happens when people respond.</span>
          </button>
          <button type="button" className="is-actions" onClick={onPrimaryAction}>
            <Hand size={34} />
            <span><strong>Actions</strong> give us a way to participate in what really matters.</span>
          </button>
        </section>

        <section className="about-what-we-do">
          <div className="about-section-heading">
            <h2>What we do</h2>
            <p>We use AI and firsthand investigation to discover unmet needs, verify what actually works, and find practical ways to help.</p>
            <p>We don't assume a service is effective simply because it exists. We investigate what is happening, what's missing, and what can be done.</p>
          </div>
          <div className="about-question-grid">
            <article>
              <Stars size={34} />
              <h3>What needs attention?</h3>
              <p>We identify and investigate unmet needs.</p>
            </article>
            <article>
              <TrendingUp size={34} />
              <h3>What is changing?</h3>
              <p>We verify what is working and what remains unresolved.</p>
            </article>
            <article>
              <UserRound size={34} />
              <h3>What can I do?</h3>
              <p>We help people investigate, respond, and build what's missing.</p>
            </article>
          </div>
          <div className="about-process-row">
            <h3>How Crossover works</h3>
            <p>We start with reality, not assumptions. Every action is an opportunity to learn what actually works.</p>
            <ol>
              <li><span aria-hidden="true">1</span>Observe</li>
              <li><span aria-hidden="true">2</span>Verify</li>
              <li><span aria-hidden="true">3</span>Respond</li>
              <li><span aria-hidden="true">4</span>Confirm</li>
            </ol>
          </div>
        </section>

        <section className="about-editorial-grid">
          <article className="about-editorial-panel">
            <h2>From thinking to being.</h2>
            <p>We spend much of our lives absorbed in thought - our plans, identities, worries, wants, and distractions.</p>
            <p>Meanwhile, reality is right here.</p>
            <p><strong>The deeper problem is unconsciousness: not seeing what is in front of us, or what it asks of us.</strong></p>
            <p>As AI and robots take on more necessary work, we have an opportunity to move from compulsory employment toward meaningful vocation.</p>
            <p>Instead of organizing our lives around working, we can increasingly organize them around being: caring, creating, investigating, and connecting with reality.</p>
            <p>Crossover is one small attempt to pay attention, test what works, and act on what is missing.</p>
            <blockquote>What would happen if we saw clearly - and then did the next real thing?</blockquote>
            <div className="about-small-truths">
              <span><UserRound size={26} /> No identity is required.</span>
              <span><Ban size={26} /> No ideology is required.</span>
              <span><Heart size={26} /> The fruit is what matters.</span>
            </div>
          </article>

          <article className="about-editorial-panel about-ai-panel">
            <h2>Why AI?</h2>
            <p>There is already more public information than any person could reasonably follow. AI gives us unprecedented ability to investigate needs, analyze evidence, connect people and resources, and reduce the friction between a problem and its solution.</p>
            <p>Technology can help build a seamless infrastructure of care.</p>
            <ul>
              <li><CheckCircle2 size={17} /> It follows public sources.</li>
              <li><CheckCircle2 size={17} /> It helps investigate changes.</li>
              <li><CheckCircle2 size={17} /> It connects evidence, people, and resources.</li>
              <li><CheckCircle2 size={17} /> It helps turn findings into practical action.</li>
            </ul>
            <div className="about-human-card">
              <Heart size={22} />
              <strong>But the human part remains essential.</strong>
              <p>To notice. To care. To verify. To show up.</p>
            </div>
          </article>
        </section>

        <section className="about-closing-banner">
          <img src={awarenessConnectionImage} alt="" aria-hidden="true" loading="lazy" decoding="async" />
          <div>
            <h2>Awareness.<br />Connection.<br />Care.<br />Action.</h2>
            <strong>That's the Crossover.</strong>
          </div>
          <div className="about-closing-copy">
            <p className="about-closing-thought">As technology takes on more work, human participation can become more like vocation than compulsory employment. Results in reality matter more than promises or activity.</p>
            <em>We are here to serve what is real.</em>
            <p className="about-closing-network">Want to join the network? Connect with us on LinkedIn.</p>
            <a className="linkedin-button about-closing-linkedin" href={linkedInUrl} target="_blank" rel="noreferrer">
              <Linkedin size={17} aria-hidden="true" />
              <span>Connect on LinkedIn</span>
            </a>
          </div>
        </section>

      </section>

      <div className="page-bottom-back-row">
        <button className="page-bottom-back" type="button" onClick={() => onNavigate("home")}>
          <ArrowLeft size={16} /> Back to home
        </button>
      </div>

      <footer className="public-footer">
        <div className="footer-logo" aria-label="Crossover">
          <picture>
            <source media="(max-width: 760px)" srcSet={logoDark} />
            <img src={logoLight} alt="" decoding="async" />
          </picture>
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
        <button type="button" className="is-active"><CircleAlert size={21} /><span>About</span></button>
      </nav>
    </main>
  );
}
