import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Footprints,
  Home as HomeIcon,
  Linkedin,
  MapPin,
  PawPrint,
  Search,
  Settings,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { navigateInternalLink } from "../lib/internalLink";
import { PublicMobileMenu } from "./PublicMobileMenu";
import { WorkSectionNav, type WorkSectionNavItem } from "./WorkSectionNav";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";

const aboutHeroImage = "/images/about/about-crossover-hero.jpg";
const founderImage = "/images/about/about-the-founder.jpg";
const spotlightDogImage = "/images/reality/dog-thumb.jpg";
const logoDark = "/images/logo_dark.webp";
const logoLight = "/images/logo_light.webp";
const linkedInUrl = "https://www.linkedin.com/in/jeff-kolyer";
const aboutNavItems: WorkSectionNavItem[] = [
  { id: "welcome", label: "Welcome", icon: FileText },
  { id: "how-it-works", label: "How it works", icon: Settings },
  { id: "street-dogs", label: "Street dogs and access to care", icon: PawPrint },
  { id: "what-we-do", label: "Our continuing mission", icon: Search },
  { id: "founder", label: "About the founder", icon: Users },
  { id: "connect", label: "Get involved", icon: ArrowRight },
];

interface AboutPageProps {
  onNavigate: (page: PublicRoute) => void;
  onPrimaryAction: () => void;
  onOpenWork: (workId: string) => void;
  onOpenGap: (slug: string) => void;
}

export function AboutPage({ onNavigate, onPrimaryAction, onOpenWork, onOpenGap }: AboutPageProps) {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

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
              <h1>Before we can change reality, we must understand it.</h1>
              <p>We combine AI research with real-world investigation to discover what works, what doesn't, and what people can actually do to help.</p>
            </div>
            <div className="about-welcome-photo"><img src={aboutHeroImage} alt="AI-generated illustration of a waterfront promenade and downtown skyline at sunset" loading="eager" decoding="async" fetchPriority="high" /></div>
          </section>

          <section className="about-content-section about-method" id="how-it-works">
            <h2>How Crossover works</h2>
            <p>We examine the evidence, test ways to help firsthand, and use what we learn to engineer better solutions, so anyone can take a real step toward helping.</p>
            <ol className="about-step-grid">
              <li>
                <span className="about-step-number">1</span>
                <div>
                  <Search size={28} aria-hidden="true" />
                  <h3>Examine the evidence</h3>
                  <p>We gather public records, news reports, and organizational claims. AI helps us compare sources, question assumptions, and distinguish what we know from what remains uncertain.</p>
                  <div className="about-step-links">
                    <a href="/work/dogs-public-source-review/" onClick={(event) => navigateInternalLink(event, () => onOpenWork("dogs-public-source-review"))}>See research <ArrowRight size={16} aria-hidden="true" /></a>
                    <a href="/work/dogs-locations-map/" onClick={(event) => navigateInternalLink(event, () => onOpenWork("dogs-locations-map"))}>See map &amp; reports <ArrowRight size={16} aria-hidden="true" /></a>
                  </div>
                </div>
              </li>
              <li>
                <span className="about-step-number">2</span>
                <div>
                  <Footprints size={28} aria-hidden="true" />
                  <h3>Test the pathways</h3>
                  <p>We don't just recommend ways to help. <strong>We try them ourselves</strong>—contacting organizations, submitting applications, visiting in person, and documenting what actually happens.</p>
                  <div className="about-step-links">
                    <a href="/work/dogs-map-placement-barriers/" onClick={(event) => navigateInternalLink(event, () => onOpenWork("dogs-map-placement-barriers"))}>See firsthand activity <ArrowRight size={16} aria-hidden="true" /></a>
                  </div>
                </div>
              </li>
              <li>
                <span className="about-step-number">3</span>
                <div>
                  <Wrench size={28} aria-hidden="true" />
                  <h3>Engineer better ways to help</h3>
                  <p>We use what we learn to identify barriers and develop practical solutions that combine emerging technology with human participation.</p>
                  <p>We examine existing improvements, propose new approaches, and test whether they actually work. <strong>Every result helps us improve what we do next.</strong></p>
                </div>
              </li>
            </ol>
          </section>

          <section className="about-spotlight" id="street-dogs">
            <div className="about-spotlight-main">
              <p className="about-eyebrow">Spotlight</p>
              <h2>Street dogs and access to care</h2>
              <p>We're examining reports about Stockton's street dogs and what it actually takes to help. These three questions guide our work as we gather evidence, test existing pathways, and explore practical solutions.</p>
              <div className="about-spotlight-questions">
                <div className="about-spotlight-question">
                  <h3><button type="button" aria-expanded={openQuestion === 1} aria-controls="about-question-1" onClick={() => setOpenQuestion(openQuestion === 1 ? null : 1)}><span className="about-step-number">1</span><span>Are the reported needs real, and what does the evidence establish?</span>{openQuestion === 1 ? <ChevronUp size={18} aria-hidden="true" /> : <ChevronDown size={18} aria-hidden="true" />}</button></h3>
                  <div className="about-spotlight-answer" id="about-question-1" hidden={openQuestion !== 1}>
                    <p>Public records document 3,106 stray-dog intakes in 2024 across the Stockton Animal Services service area. But historical intake figures don't establish how many dogs currently need help on Stockton streets.</p>
                    <p>We're examining public records and local reports to understand what is documented, what remains uncertain, and where assistance may be needed.</p>
                    <div className="about-step-links"><a href="/work/dogs-public-source-review/" onClick={(event) => navigateInternalLink(event, () => onOpenWork("dogs-public-source-review"))}>See the research <ArrowRight size={16} aria-hidden="true" /></a><a href="/work/dogs-locations-map/" onClick={(event) => navigateInternalLink(event, () => onOpenWork("dogs-locations-map"))}>Map &amp; reports <ArrowRight size={16} aria-hidden="true" /></a></div>
                  </div>
                </div>
                <div className="about-spotlight-question">
                  <h3><button type="button" aria-expanded={openQuestion === 2} aria-controls="about-question-2" onClick={() => setOpenQuestion(openQuestion === 2 ? null : 2)}><span className="about-step-number">2</span><span>Can someone who wants to help actually find a working pathway?</span>{openQuestion === 2 ? <ChevronUp size={18} aria-hidden="true" /> : <ChevronDown size={18} aria-hidden="true" />}</button></h3>
                  <div className="about-spotlight-answer" id="about-question-2" hidden={openQuestion !== 2}>
                    <p>We're testing publicly advertised ways to help rather than simply recommending them.</p>
                    <p>We've submitted volunteer inquiries and visited Stockton Animal Services in person. These attempts have produced firsthand observations, but successful volunteer participation has not yet been confirmed.</p>
                    <p>We're documenting what happens so others can make better-informed attempts to help.</p>
                    <div className="about-step-links"><a href="/work/dogs-map-placement-barriers/" onClick={(event) => navigateInternalLink(event, () => onOpenWork("dogs-map-placement-barriers"))}>See firsthand activity <ArrowRight size={16} aria-hidden="true" /></a></div>
                  </div>
                </div>
                <div className="about-spotlight-question">
                  <h3><button type="button" aria-expanded={openQuestion === 3} aria-controls="about-question-3" onClick={() => setOpenQuestion(openQuestion === 3 ? null : 3)}><span className="about-step-number">3</span><span>If we had unlimited resources and technology, would we know how to apply them effectively?</span>{openQuestion === 3 ? <ChevronUp size={18} aria-hidden="true" /> : <ChevronDown size={18} aria-hidden="true" />}</button></h3>
                  <div className="about-spotlight-answer" id="about-question-3" hidden={openQuestion !== 3}>
                    <p>Not yet. We need a clearer understanding of where dogs currently need assistance, what care is already available, and which barriers prevent help from reaching them.</p>
                    <p>We're examining existing improvements and exploring how additional people, better coordination, AI, robotics, and other emerging capabilities could make care more effective.</p>
                    <p>We distinguish promising ideas from solutions that have actually been tested.</p>
                    <div className="about-step-links"><a href="/work/dogs-solutions/" onClick={(event) => navigateInternalLink(event, () => onOpenWork("dogs-solutions"))}>Explore improvements and potential solutions <ArrowRight size={16} aria-hidden="true" /></a></div>
                  </div>
                </div>
              </div>
            </div>
            <img className="about-spotlight-photo" src={spotlightDogImage} alt="Portrait of a dog" loading="lazy" decoding="async" />
            <p className="about-spotlight-closing"><strong>Every attempt adds to what we know.</strong> Whether something works, fails, or raises new questions, the results become evidence we can use to engineer better ways to help.</p>
          </section>

          <section className="about-content-section about-what" id="what-we-do">
            <div>
              <h2>Our continuing mission</h2>
              <p><strong>Turn what we learn about reality into better ways to care for it.</strong></p>
              <p>AI and robotics are creating extraordinary new possibilities. As technology takes on more necessary work, people could have greater freedom to care for animals, help neighbors, and pursue meaningful lives.</p>
              <p>Crossover uses AI, public information, firsthand investigation, and human participation to understand reported needs, determine what's actually happening, and identify the barriers that may prevent people from helping.</p>
              <p>By making those experiences and barriers visible and verifiable, we can develop practical solutions, test whether they work, and continually improve how technology and willing people address real needs.</p>
            </div>
            <aside className="about-needs-panel">
              <p className="about-eyebrow"><MapPin size={18} aria-hidden="true" /> Stockton, CA</p>
              <h3>Real people. Real needs.</h3>
              <p>We're starting in Stockton by investigating street dogs and access to care—examining reported conditions, existing responses, and what prevents people from helping.</p>
              <a className="about-needs-link" href="/work/dogs-map-placement-barriers/" onClick={(event) => navigateInternalLink(event, () => onOpenWork("dogs-map-placement-barriers"))}>Explore the investigation <ArrowRight size={16} aria-hidden="true" /></a>
            </aside>
          </section>

          <section className="about-founder" id="founder">
            <div className="about-founder-copy">
              <p className="about-eyebrow">About the founder</p>
              <h2>Jeff Kolyer</h2>
              <p>Former Silicon Valley technology founder exploring how emerging technology can address real-world problems.</p>
              <p>Starting in Stockton, we're testing ways to help, learning in public, and applying technology to make a real difference for people, animals, and communities.</p>
            </div>
            <div className="about-founder-quote">
              <blockquote>Technology is most meaningful when it helps real people with real problems.</blockquote>
              <a className="linkedin-button" href={linkedInUrl} target="_blank" rel="noreferrer"><Linkedin size={15} aria-hidden="true" /><span>Connect on LinkedIn</span></a>
            </div>
            <img className="about-founder-photo" src={founderImage} alt="Jeff Kolyer by a waterfront promenade" loading="lazy" decoding="async" />
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
