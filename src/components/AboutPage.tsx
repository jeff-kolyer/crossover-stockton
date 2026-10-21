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
              <h1>Connecting emerging technology to real-world needs.</h1>
              <p>AI agents, self-driving vehicles, and robotics are transforming work. Crossover investigates where these emerging capabilities — and the freedom they may create for people — could help meet real needs.</p>
            </div>
            <div className="about-welcome-photo"><img src={aboutHeroImage} alt="AI-generated illustration of a waterfront promenade and downtown skyline at sunset" loading="eager" decoding="async" fetchPriority="high" /></div>
          </section>

          <section className="about-content-section about-what" id="what-we-do">
            <div>
              <h2>What we do</h2>
              <p>We investigate real-world needs to discover where emerging technology and willing people could make a difference.</p>
              <p>Before proposing solutions, we examine available evidence, question assumptions, and investigate what is actually happening and what prevents needs from being met.</p>
              <p>Our own attempts to help can reveal barriers in the systems meant to provide care.</p>
            </div>
            <aside className="about-needs-panel">
              <Sprout size={28} aria-hidden="true" />
              <div>
                <h3>Real people. Real needs.</h3>
                <p>We begin with real situations in Stockton, starting with dogs on the street, to discover what intelligence, technology, and human care could accomplish.</p>
              </div>
            </aside>
          </section>

          <section className="about-content-section about-method" id="how-it-works">
            <h2>How Crossover works</h2>
            <p>We follow a simple process to understand a problem, identify constraints, and explore what new capabilities could change.</p>
            <ol className="about-step-grid">
              <li><span className="about-step-number">1</span><div><Eye size={28} aria-hidden="true" /><h3>Observe</h3><p>Examine reports and firsthand conditions to understand what's actually happening.</p></div></li>
              <li><span className="about-step-number">2</span><div><Search size={28} aria-hidden="true" /><h3>Verify</h3><p>Check sources, investigate claims, and establish which needs remain unmet.</p></div></li>
              <li><span className="about-step-number">3</span><div><Users size={28} aria-hidden="true" /><h3>Respond</h3><p>Explore how technology, resources, and willing people could address a verified need.</p></div></li>
              <li><span className="about-step-number">4</span><div><ChartNoAxesColumnIncreasing size={28} aria-hidden="true" /><h3>Confirm</h3><p>Test possible responses, document outcomes, and learn what actually improves.</p></div></li>
            </ol>
          </section>

          <div className="about-philosophy-grid">
            <section className="about-content-section" id="from-working-to-being">
              <h2>From working to being</h2>
              <p>As AI and robotics perform more necessary work, people may gain greater freedom from compulsory employment and more opportunities to pursue meaningful vocations.</p>
              <p>That freedom could mean more time for caring, creating, restoring the environment, helping animals, and connecting with the world around us.</p>
              <p>Crossover explores how this technological transition could connect people and new capabilities to needs that remain unmet today.</p>
            </section>
            <section className="about-content-section" id="why-ai">
              <h2>Why AI?</h2>
              <p>AI already helps us research and analyze complex problems. Emerging agents, autonomous vehicles, and robotics could eventually help us act on what we discover.</p>
              <ul>
                <li>Surface possible needs for investigation.</li>
                <li>Analyze evidence.</li>
                <li>Connect people and resources.</li>
                <li>Reduce the friction between a problem and its solution.</li>
              </ul>
              <p className="about-ai-conclusion">Understand the need. Explore the technology. Test what works.</p>
            </section>
          </div>

          <section className="about-connect" id="connect">
            <Users size={28} aria-hidden="true" />
            <div className="about-connect-copy">
              <h2>Get involved</h2>
              <p>Explore our current investigation, help establish what's real, or connect with Crossover to share firsthand knowledge.</p>
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
