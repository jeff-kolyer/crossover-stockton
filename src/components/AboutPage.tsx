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
const linkedInUrl = "https://www.linkedin.com/in/jeff-kolyer";
const aboutNavItems: WorkSectionNavItem[] = [
  { id: "welcome", label: "Welcome", icon: FileText },
  { id: "what-we-do", label: "What we do", icon: Search },
  { id: "how-it-works", label: "How it works", icon: Settings },
  { id: "from-working-to-being", label: "From working to being", icon: Sprout },
  { id: "why-ai", label: "Why AI?", icon: Sparkles },
  { id: "founder", label: "About the founder", icon: Users },
  { id: "connect", label: "Get involved", icon: ArrowRight },
];

interface AboutPageProps {
  onNavigate: (page: PublicRoute) => void;
  onPrimaryAction: () => void;
  onOpenWork: (workId: string) => void;
}

export function AboutPage({ onNavigate, onPrimaryAction, onOpenWork }: AboutPageProps) {
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
              <h1>Before we can change reality with technology, we must first understand it.</h1>
              <p>AI, robotics, and emerging post-scarcity capabilities are expanding what's possible. Crossover investigates real-world needs to discover where those capabilities—and willing people—could make a difference.</p>
            </div>
            <div className="about-welcome-photo"><img src={aboutHeroImage} alt="AI-generated illustration of a waterfront promenade and downtown skyline at sunset" loading="eager" decoding="async" fetchPriority="high" /></div>
          </section>

          <section className="about-content-section about-what" id="what-we-do">
            <div>
              <h2>What we do</h2>
              <p><strong>We investigate problems so we can engineer solutions.</strong></p>
              <p>Crossover uses AI, public information, firsthand investigation, and human participation to understand unmet needs and the barriers preventing them from being addressed.</p>
              <p>By making those barriers visible and verifiable, we can develop practical solutions, test whether they work, and improve them until real needs are met.</p>
              <p><strong>Consider Stockton's street dogs.</strong></p>
              <ul className="about-question-list">
                <li>If we had unlimited resources to help, would we know which dogs need care and where they are?</li>
                <li>If that information exists, who has it, and can willing people use it?</li>
                <li>If it doesn't exist, what's preventing us from finding out?</li>
              </ul>
              <p><strong>Either way, the investigation produces valuable knowledge.</strong> Our own attempts to help become part of the evidence, revealing what works, what remains unknown, and where care may break down.</p>
            </div>
            <aside className="about-needs-panel">
              <Sprout size={28} aria-hidden="true" />
              <div>
                <h3>Real people. Real needs.</h3>
                <p>We're starting in Stockton by investigating street dogs and access to care—examining reported conditions, existing responses, and what prevents people from helping.</p>
                <a className="about-needs-link" href="/work/dogs-map-placement-barriers/" onClick={(event) => navigateInternalLink(event, () => onOpenWork("dogs-map-placement-barriers"))}>Explore the investigation <ArrowRight size={16} aria-hidden="true" /></a>
              </div>
            </aside>
          </section>

          <section className="about-content-section about-method" id="how-it-works">
            <h2>How Crossover works</h2>
            <p>We follow a simple process to move from public information to real-world understanding.</p>
            <ol className="about-step-grid">
              <li><span className="about-step-number">1</span><div><Eye size={28} aria-hidden="true" /><h3>Observe</h3><p>Examine public reports, listen to people, and observe firsthand conditions.</p></div></li>
              <li><span className="about-step-number">2</span><div><Search size={28} aria-hidden="true" /><h3>Verify</h3><p>Question assumptions, check evidence, and distinguish what's known from what remains uncertain.</p></div></li>
              <li><span className="about-step-number">3</span><div><Users size={28} aria-hidden="true" /><h3>Respond</h3><p>Try ways to help, investigate barriers, and explore how willing people and emerging technology could make a difference.</p></div></li>
              <li><span className="about-step-number">4</span><div><ChartNoAxesColumnIncreasing size={28} aria-hidden="true" /><h3>Confirm</h3><p>Document what happened, what worked, what didn't, and what still needs attention.</p></div></li>
            </ol>
          </section>

          <div className="about-philosophy-grid">
            <section className="about-content-section" id="from-working-to-being">
              <h2>From working to being</h2>
              <p>As AI and robotics take on more necessary work, people may gain greater freedom to pursue meaningful vocations rather than working primarily to earn a living.</p>
              <p>That could mean more time for caring for animals, helping neighbors, restoring the environment, creating, and connecting with the world around us.</p>
              <p>Crossover explores how the shift from compulsory work to meaningful participation could help meet real needs—by removing the barriers between people who want to care and those who need care.</p>
            </section>
            <section className="about-content-section" id="why-ai">
              <h2>Why AI?</h2>
              <p>AI helps us research public information, examine evidence, identify possible needs, and ask better questions.</p>
              <p>Emerging agents, robotics, and automation may eventually help us act on what we discover.</p>
              <p>But <strong>AI-generated answers aren't the same as firsthand knowledge.</strong> That's why we investigate, test responses, and publish what we learn.</p>
              <p className="about-ai-conclusion">Observe. Verify. Respond. Confirm.</p>
            </section>
          </div>

          <section className="about-founder" id="founder">
            <span className="about-founder-mark" aria-hidden="true"><img src={logoDark} alt="" /></span>
            <div className="about-founder-content">
              <p className="about-eyebrow">About the founder</p>
              <h2>Jeff Kolyer</h2>
              <p className="about-founder-role">Founder, Crossover Stockton</p>
              <p>A former Silicon Valley technology founder, Jeff is exploring how AI, robotics, and emerging post-scarcity capabilities could address real-world problems.</p>
              <p>Rather than starting another technology company, Jeff is investigating those problems firsthand—testing ways to help and documenting what actually happens.</p>
              <p className="about-founder-principle">Examine reality before assuming we know what needs to be done.</p>
              <a className="linkedin-button" href={linkedInUrl} target="_blank" rel="noreferrer"><Linkedin size={17} aria-hidden="true" /><span>Connect on LinkedIn</span></a>
            </div>
          </section>

          <section className="about-connect" id="connect">
            <Users size={28} aria-hidden="true" />
            <div className="about-connect-copy">
              <h2>Get involved</h2>
              <p>Explore what we're investigating, follow our findings, or help establish what's actually happening.</p>
            </div>
            <div className="about-connect-actions">
              <a className="about-connect-primary" href="/reality/" onClick={(event) => navigateInternalLink(event, () => onNavigate("reality"))}>Explore all needs <ArrowRight size={17} aria-hidden="true" /></a>
              <a className="about-connect-secondary" href="/action/" onClick={(event) => navigateInternalLink(event, onPrimaryAction)}>Take a real step <ArrowRight size={17} aria-hidden="true" /></a>
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
