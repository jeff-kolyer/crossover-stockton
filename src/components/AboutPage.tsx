import {
  AlertTriangle,
  ArrowRight,
  ChartNoAxesColumnIncreasing,
  ChevronDown,
  Eye,
  FileText,
  Home as HomeIcon,
  Linkedin,
  MapPin,
  Search,
  Settings,
  Sparkles,
  Sprout,
  Users,
} from "lucide-react";
import { navigateInternalLink } from "../lib/internalLink";
import { PublicMobileMenu } from "./PublicMobileMenu";
import { WorkSectionNav, type WorkSectionNavItem } from "./WorkSectionNav";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";

const aboutHeroImage = "/images/about/about-crossover-hero.jpg";
const logoDark = "/images/logo_dark.webp";
const logoLight = "/images/logo_light.webp";
const linkedInUrl = "http://www.linkedin.com/in/jeff-kolyer";
const aboutNavItems: WorkSectionNavItem[] = [
  { id: "welcome", label: "Welcome", icon: FileText },
  { id: "what-we-do", label: "What we do", icon: Search },
  { id: "how-it-works", label: "How it works", icon: Settings },
  { id: "from-working-to-being", label: "From working to being", icon: Sprout },
  { id: "why-ai", label: "Why AI?", icon: Sparkles },
  { id: "connect", label: "Connect", icon: Users },
];

interface AboutPageProps {
  onNavigate: (page: PublicRoute) => void;
  onPrimaryAction: () => void;
}

export function AboutPage({ onNavigate, onPrimaryAction }: AboutPageProps) {
  return (
    <main className="public-home about-page">
      <header className="public-nav gap-detail-nav">
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
          <button type="button" className="is-active" aria-current="page">About</button>
        </nav>
        <button className="location-pill" type="button" onClick={() => onNavigate("home")}>
          <MapPin size={16} /> Stockton, CA <ChevronDown size={15} />
        </button>
      </header>

      <div className="work-page-grid about-page-grid">
        <WorkSectionNav items={aboutNavItems} />
        <div className="about-content">
          <section className="about-welcome" id="welcome">
            <div className="about-welcome-copy">
              <p className="about-eyebrow">About Crossover Stockton</p>
              <h1>A better way to care for our community.</h1>
              <p>We're starting in Stockton. We use AI, investigation, and human participation to understand what needs attention — and do something about it.</p>
            </div>
            <div className="about-welcome-photo"><img src={aboutHeroImage} alt="AI-generated illustration of a waterfront promenade and downtown skyline at sunset" loading="eager" decoding="async" fetchPriority="high" /></div>
          </section>

          <section className="about-content-section about-what" id="what-we-do">
            <div>
              <h2>What we do</h2>
              <p>We investigate unmet needs, verify what actually works, and find practical ways to help.</p>
              <p>We don't assume a service is effective simply because it exists. We look at what is happening, what's missing, and what can be done.</p>
            </div>
            <aside className="about-needs-panel">
              <Sprout size={28} aria-hidden="true" />
              <div>
                <h3>Real people. Real needs.</h3>
                <p>We focus on real situations in Stockton — people, animals, and neighborhoods — not just policies or plans.</p>
              </div>
            </aside>
          </section>

          <section className="about-content-section about-method" id="how-it-works">
            <h2>How Crossover works</h2>
            <p>We follow a simple, repeatable process to move from understanding to real-world impact.</p>
            <ol className="about-step-grid">
              <li><span className="about-step-number">1</span><div><Eye size={28} aria-hidden="true" /><h3>Observe</h3><p>We look at what is actually happening in people's lives and communities.</p></div></li>
              <li><span className="about-step-number">2</span><div><Search size={28} aria-hidden="true" /><h3>Verify</h3><p>We investigate, check what works, and separate signal from noise.</p></div></li>
              <li><span className="about-step-number">3</span><div><Users size={28} aria-hidden="true" /><h3>Respond</h3><p>We find practical ways to help and connect people with resources.</p></div></li>
              <li><span className="about-step-number">4</span><div><ChartNoAxesColumnIncreasing size={28} aria-hidden="true" /><h3>Confirm</h3><p>We follow up, learn from results, and adjust based on what works.</p></div></li>
            </ol>
          </section>

          <div className="about-philosophy-grid">
            <section className="about-content-section" id="from-working-to-being">
              <h2>From working to being</h2>
              <p>As AI and robotics take on more necessary work, human life can increasingly be about meaningful vocation rather than compulsory employment.</p>
              <p>We have an opportunity to move from a culture of overwork and distraction to one of caring, creating, investigating, and connecting with reality.</p>
              <p>Crossover is one way to practice that shift in real life, starting here at home.</p>
            </section>
            <section className="about-content-section" id="why-ai">
              <h2>Why AI?</h2>
              <p>There is already more public information than any person could reasonably follow. AI gives us an unprecedented ability to:</p>
              <ul>
                <li>Identify what needs attention.</li>
                <li>Analyze evidence.</li>
                <li>Connect people and resources.</li>
                <li>Reduce the friction between a problem and its solution.</li>
              </ul>
              <p className="about-ai-conclusion">AI helps us see. People make it real.</p>
            </section>
          </div>

          <section className="about-connect" id="connect">
            <Users size={28} aria-hidden="true" />
            <div className="about-connect-copy">
              <h2>Get involved</h2>
              <p>See what needs attention, find a meaningful way to help, or connect with Crossover.</p>
            </div>
            <div className="about-connect-actions">
              <a className="about-connect-primary" href="/reality/" onClick={(event) => navigateInternalLink(event, () => onNavigate("reality"))}>Explore all needs <ArrowRight size={17} aria-hidden="true" /></a>
              <a className="about-connect-secondary" href="/action/" onClick={(event) => navigateInternalLink(event, onPrimaryAction)}>Take a real step <ArrowRight size={17} aria-hidden="true" /></a>
              <a className="linkedin-button" href={linkedInUrl} target="_blank" rel="noreferrer"><Linkedin size={17} aria-hidden="true" /><span>Connect on LinkedIn</span></a>
            </div>
          </section>
        </div>
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
