import {
  ArrowRight,
  Building2,
  ChevronDown,
  CircleAlert,
  HandHeart,
  Home,
  MapPin,
  Menu,
  PawPrint,
  Search,
  ShieldCheck,
} from "lucide-react";
import orgsData from "../data/orgs.json";
import type { OrgRecord } from "../types";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";

interface OrganizationsPageProps {
  onNavigate: (page: PublicRoute) => void;
}

const orgs = orgsData as OrgRecord[];
const trackedOrgs = orgs.filter((org) => org.active && org.tracked !== false);
const heroImage = "/images/organizations/organizations-we-follow-hero.jpg";
const logoDark = "/images/logo_dark.png";
const logoLight = "/images/logo_light.png";

export function OrganizationsPage({ onNavigate }: OrganizationsPageProps) {
  return (
    <main className="public-home organizations-page is-section-page">
      <section className="public-hero is-compact">
        <img className="public-hero-image is-active" src={heroImage} alt="" aria-hidden="true" loading="eager" decoding="sync" fetchPriority="high" />
        <div className="public-hero-shade" />
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
            <button type="button" onClick={() => onNavigate("updates")}>Updates</button>
            <button type="button" className="is-active">Organizations</button>
            <button type="button" onClick={() => onNavigate("about")}>About</button>
          </nav>
          <button className="location-pill" type="button" onClick={() => onNavigate("home")}>
            <MapPin size={16} />
            Stockton, CA
            <ChevronDown size={15} />
          </button>
        </header>

        <div className="public-hero-copy">
          <span className="public-page-eyebrow">Organizations</span>
          <h1>Who Crossover follows.</h1>
          <p>We track a limited set of organizations closely so Crossover can keep a current picture of what's real.</p>
          <button className="section-back-link" type="button" onClick={() => onNavigate("home")}>
            <ArrowRight size={16} /> Back to home
          </button>
        </div>
      </section>

      <section className="organizations-band">
        <div className="organizations-intro">
          <p>Tracked Organizations</p>
          <h2>{trackedOrgs.length} Stockton organizations</h2>
          <span>These are the public sources Crossover is using for the first MVP picture.</span>
        </div>
        <div className="organizations-grid">
          {trackedOrgs.map((org, index) => {
            const Icon = getOrgIcon(index);
            const href = org.website || org.source_url;
            return (
              <article className="organization-card" key={org.id}>
                <Icon size={34} />
                <div>
                  <h3>{org.name}</h3>
                  <p>{org.summary}</p>
                  {href && (
                    <a href={href} target="_blank" rel="noreferrer">
                      Visit their website <ArrowRight size={15} />
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="public-footer">
        <div className="footer-logo" aria-label="Crossover">
          <img src={logoDark} alt="" decoding="async" />
          <span>Crossover</span>
        </div>
        <span>© 2026 Crossover Stockton</span>
        <p>Reality. Connection. Action.</p>
        <button type="button" onClick={() => onNavigate("about")}>About</button>
        <button type="button" onClick={() => onNavigate("action")}>Action</button>
      </footer>

      <nav className="public-bottom-nav" aria-label="Mobile primary">
        <button type="button" onClick={() => onNavigate("home")}><Home size={21} /><span>Home</span></button>
        <button type="button" onClick={() => onNavigate("connection")}><MapPin size={21} /><span>Stories</span></button>
        <button type="button" onClick={() => onNavigate("reality")}><Search size={21} /><span>Reality</span></button>
        <button type="button" className="is-active"><Building2 size={21} /><span>Orgs</span></button>
        <button type="button" onClick={() => onNavigate("about")}><CircleAlert size={21} /><span>About</span></button>
      </nav>
    </main>
  );
}

function getOrgIcon(index: number) {
  return [PawPrint, HandHeart, ShieldCheck, Home, Building2][index % 5];
}
