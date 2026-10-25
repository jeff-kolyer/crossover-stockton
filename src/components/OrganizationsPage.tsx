import {
  ArrowLeft,
  Building2,
  CircleAlert,
  Home,
  MapPin,
  Search,
} from "lucide-react";
import orgsData from "../data/orgs.json";
import { PublicSiteNav } from "./PublicSiteNav";
import { OrganizationCard } from "./OrganizationCard";
import type { OrgRecord } from "../types";

type PublicRoute = "home" | "reality" | "connection" | "action" | "updates" | "about" | "organizations";

interface OrganizationsPageProps {
  onNavigate: (page: PublicRoute) => void;
  onOpenReport: (id: string) => void;
}

const orgs = orgsData as OrgRecord[];
const trackedOrgs = orgs.filter((org) => org.active && org.tracked !== false);
const heroImage = "/images/organizations/organizations-we-follow-hero.jpg";
const logoDark = "/images/logo_dark.webp";
const logoLight = "/images/logo_light.webp";

export function OrganizationsPage({ onNavigate, onOpenReport }: OrganizationsPageProps) {
  return (
    <main className="public-home organizations-page is-section-page">
      <section className="public-hero is-compact">
        <img className="public-hero-image is-active" src={heroImage} alt="" aria-hidden="true" loading="eager" decoding="sync" fetchPriority="high" />
        <div className="public-hero-shade" />
        <PublicSiteNav active="organizations" onNavigate={onNavigate} />

        <div className="public-hero-copy">
          <span className="public-page-eyebrow">Organizations</span>
          <h1>Who Crossover follows.</h1>
          <p>We track a limited set of organizations closely so Crossover can keep a current picture of what's real.</p>
        </div>
      </section>

      <section className="organizations-band">
        <div className="organizations-intro">
          <p>Tracked Organizations</p>
          <h2>{trackedOrgs.length} Stockton organizations</h2>
          <span>These are the public sources Crossover is using for the first MVP picture.</span>
        </div>
        <div className="organizations-grid">
          {trackedOrgs.map((org) => <OrganizationCard org={org} key={org.id} onOpenReport={onOpenReport} />)}
        </div>
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
        <button type="button" onClick={() => onNavigate("action")}>Action</button>
        <button type="button" onClick={() => onNavigate("about")}>About</button>
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
