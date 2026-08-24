import {
  AlertTriangle,
  ArrowRight,
  Ban,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Hand,
  Heart,
  Home as HomeIcon,
  MapPin,
  Menu,
  Search,
  Sprout,
  Sun,
  TrendingUp,
  UserRound,
} from "lucide-react";

type PublicRoute = "home" | "reality" | "connection" | "action" | "about" | "organizations";

const aboutHeroImage = "/images/about/about-crossover-hero.jpg";
const awarenessConnectionImage = "/images/about/awareness-connection-hero.jpg";
const logoDark = "/images/logo_dark.png";
const logoLight = "/images/logo_light.png";

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
          <button className="public-mobile-menu" type="button" aria-label="Open navigation">
            <Menu size={24} />
          </button>
          <button className="public-logo" type="button" aria-label="Crossover home" onClick={() => onNavigate("home")}>
            <img src={logoLight} alt="" decoding="async" />
            <span>Crossover</span>
          </button>
          <nav aria-label="Primary">
            <button type="button" onClick={() => onNavigate("reality")}>Needs</button>
            <button type="button" onClick={() => onNavigate("connection")}>Stories</button>
            <button type="button" onClick={() => onNavigate("action")}>Action</button>
            <button type="button" onClick={() => onNavigate("organizations")}>Organizations</button>
            <button type="button" className="is-active">About</button>
          </nav>
          <button className="location-pill" type="button" onClick={() => onNavigate("reality")}>
            <MapPin size={16} />
            Stockton, CA
            <ChevronDown size={15} />
          </button>
          <button className="sun-button" type="button" aria-label="Theme">
            <Sun size={18} />
          </button>
        </header>

        <div className="about-hero-copy">
          <h1>About Crossover</h1>
          <h2>Pay attention to what is real.</h2>
          <p>Crossover uses AI to help us see what our community needs, what is getting better, and where we can actually help.</p>
          <button className="section-back-link about-hero-back" type="button" onClick={() => onNavigate("home")}>
            <ArrowRight size={16} /> Back to home
          </button>
        </div>
      </section>

      <section className="about-main">
        <section className="about-what-we-do">
          <div className="about-section-heading">
            <h2>What we do</h2>
            <p>We use AI to follow a limited set of local organizations and public sources, looking for a simple picture of reality.</p>
            <span className="about-see-note">It helps us see <ArrowRight size={26} /></span>
          </div>
          <div className="about-question-grid">
            <article>
              <Search size={34} />
              <h3>What needs attention?</h3>
              <p>We surface important unmet needs.</p>
            </article>
            <article>
              <TrendingUp size={34} />
              <h3>What is changing?</h3>
              <p>We follow real progress and the people making it happen.</p>
            </article>
            <article>
              <UserRound size={34} />
              <h3>What can I do?</h3>
              <p>We point to practical ways to respond.</p>
            </article>
          </div>
        </section>

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

        <section className="about-editorial-grid">
          <article className="about-editorial-panel">
            <h2>From thinking to being.</h2>
            <p>We spend much of our lives absorbed in thought - our plans, identities, worries, wants, and distractions.</p>
            <p>Meanwhile, reality is right here.</p>
            <p><strong>The deeper problem is unconsciousness: not seeing what is in front of us, or what it asks of us.</strong></p>
            <p>Crossover is one small attempt to pay attention.</p>
            <blockquote>What would happen if we saw clearly - and then did the next real thing?</blockquote>
            <div className="about-small-truths">
              <span><UserRound size={26} /> No identity is required.</span>
              <span><Ban size={26} /> No ideology is required.</span>
              <span><Heart size={26} /> The fruit is what matters.</span>
            </div>
          </article>

          <article className="about-editorial-panel about-ai-panel">
            <h2>Why AI?</h2>
            <p>There is already more public information than any person could reasonably follow. AI can help watch it, connect it, and keep a current picture of what is happening locally.</p>
            <ul>
              <li><CheckCircle2 size={17} /> It watches public sources.</li>
              <li><CheckCircle2 size={17} /> It notices changes.</li>
              <li><CheckCircle2 size={17} /> It connects scattered information.</li>
              <li><CheckCircle2 size={17} /> It helps maintain a current picture of local need.</li>
            </ul>
            <div className="about-human-card">
              <Heart size={22} />
              <strong>Then the human part begins.</strong>
              <p>To notice. To care. To verify. To show up.</p>
            </div>
          </article>
        </section>

        <section className="about-closing-banner">
          <img src={awarenessConnectionImage} alt="" aria-hidden="true" loading="lazy" decoding="async" />
          <div>
            <h2>Awareness.<br />Connection.<br />Care.<br />Action.</h2>
            <strong>That's the crossover.</strong>
          </div>
          <div className="about-closing-copy">
            <p>As technology takes on more of the work machines can do, we have more opportunity to do the work only people can do.</p>
            <em>We are here to serve what is real.</em>
          </div>
        </section>
      </section>

      <footer className="public-footer">
        <div className="footer-logo" aria-label="Crossover">
          <img src={logoDark} alt="" decoding="async" />
          <span>Crossover</span>
        </div>
        <span>© 2026 Crossover Stockton</span>
        <p>Reality. Connection. Action.</p>
        <button type="button" className="is-active">About</button>
        <button type="button" onClick={onPrimaryAction}>Action</button>
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
