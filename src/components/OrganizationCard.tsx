import { ArrowRight, Building2, HandHeart, Home, PawPrint, ShieldCheck } from "lucide-react";
import orgsData from "../data/orgs.json";
import type { OrgRecord } from "../types";

const trackedOrgs = (orgsData as OrgRecord[]).filter((org) => org.active && org.tracked !== false);
const icons = [PawPrint, HandHeart, ShieldCheck, Home, Building2];

export function OrganizationCard({ org }: { org: OrgRecord }) {
  const index = trackedOrgs.findIndex((item) => item.id === org.id);
  const Icon = icons[Math.max(0, index) % icons.length];
  const href = org.website || org.source_url;

  return (
    <article className="organization-card">
      <Icon size={34} aria-hidden="true" />
      <div>
        <h3>{org.name}</h3>
        <p>{org.summary}</p>
        {href && (
          <a href={href} target="_blank" rel="noreferrer">
            Visit their website <ArrowRight size={15} aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
}
