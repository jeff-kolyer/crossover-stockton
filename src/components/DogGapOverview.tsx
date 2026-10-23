import { ArrowRight, ClipboardList, MapPin, Route, Wrench } from "lucide-react";
import dogsResearch from "../data/dogs-research.json";
import locationsData from "../data/investigation-locations.json";
import projectsData from "../data/projects.json";
import { navigateInternalLink } from "../lib/internalLink";
import { DogCareScenario } from "./DogCareScenario";
import "./DogGapOverview.css";

interface DogGapOverviewProps {
  onOpenWork: (workId: string, anchor?: string) => void;
  onOpenSources: () => void;
}

const researchHref = "/work/dogs-public-source-review/";
const investigationHref = "/work/dogs-map-placement-barriers/";
const solutionsHref = "/work/dogs-solutions/";
const mapHref = "/work/dogs-locations-map/";
const fieldworkHref = "/work/dogs-direct-field-work/";
const measurements = dogsResearch.measurements;
const measure = (id: string) => measurements.find((item) => item.id === id)?.value.toLocaleString() ?? "—";
const projects = projectsData.filter((project) => project.gap_ids.includes("dogs-safe-placement"));
const project = (id: string) => projects.find((item) => item.id === id);

const mappedLocations = locationsData.filter((location): location is typeof location & { coordinates: [number, number] } => Array.isArray(location.coordinates) && location.coordinates.length === 2);
const latitudes = mappedLocations.map((location) => location.coordinates[0]);
const longitudes = mappedLocations.map((location) => location.coordinates[1]);
const minLat = Math.min(...latitudes);
const maxLat = Math.max(...latitudes);
const minLon = Math.min(...longitudes);
const maxLon = Math.max(...longitudes);

function PreviewMap() {
  return <div className="dog-equation-map">
    <svg viewBox="0 0 300 130" role="img" aria-label={`Schematic of ${mappedLocations.length} generalized evidence areas near Stockton`}>
      <path d="M15 110 75 85 130 96 180 64 285 28M25 34 105 52 155 28 230 76 285 101M68 5 96 124M185 5 174 125M260 8 224 124" fill="none" stroke="#d5e0da" strokeWidth="2" />
      {mappedLocations.map((location) => {
        const x = 20 + (location.coordinates[1] - minLon) / Math.max(.001, maxLon - minLon) * 260;
        const y = 115 - (location.coordinates[0] - minLat) / Math.max(.001, maxLat - minLat) * 100;
        return <circle key={location.id} cx={x} cy={y} r="4" fill={location.status === "exploratory" ? "#88968f" : "#1f6b4a"} stroke="white" strokeWidth="1.5" />;
      })}
      <text x="10" y="18" fill="#60746a" fontSize="10">N ↑</text>
    </svg>
    <small>Generalized references · current conditions unknown</small>
  </div>;
}

export function DogGapOverview({ onOpenWork, onOpenSources }: DogGapOverviewProps) {
  return <div className="dog-equation-content">
      <DogCareScenario />

      <div className="dog-equation-previews">
        <section className="dog-equation-preview" id="dog-evidence">
          <div className="dog-equation-preview-heading"><ClipboardList size={21} aria-hidden="true" /><h2>Evidence &amp; claims</h2></div>
          <p>The official 2024 report records <strong>{measure("sas-2024-dog-intake-stray")} stray intake events</strong> across Stockton Animal Services' multi-jurisdiction service area.</p>
          <p>It also records {measure("sas-2024-dog-outcome-rescue-transfer")} rescue transfers, {measure("sas-2024-dog-outcome-adopted")} adoptions, and {measure("sas-2024-dog-outcome-return-owner")} returns to owners. These event counts are not a current street-dog census.</p>
          <a href={researchHref} onClick={(event) => navigateInternalLink(event, () => onOpenWork("dogs-public-source-review"))}>See the research <ArrowRight size={15} aria-hidden="true" /></a>
          <button type="button" onClick={onOpenSources}>View source index <ArrowRight size={15} aria-hidden="true" /></button>
        </section>

        <section className="dog-equation-preview" id="dog-pathways">
          <div className="dog-equation-preview-heading"><Route size={21} aria-hidden="true" /><h2>Pathways we're testing</h2></div>
          <ul className="dog-equation-pathways">
            <li><strong>Shelter volunteering</strong><span>Application and visit documented; participation unconfirmed</span></li>
            <li><strong>Doggie Day Out</strong><span>Inquiry sent; response and access unconfirmed</span></li>
            <li><strong>Foster or adoption</strong><span>Publicly advertised; current availability to verify</span></li>
          </ul>
          <a href={investigationHref} onClick={(event) => navigateInternalLink(event, () => onOpenWork("dogs-map-placement-barriers"))}>Explore the pathways <ArrowRight size={15} aria-hidden="true" /></a>
        </section>

        <section className="dog-equation-preview" id="dog-solutions">
          <div className="dog-equation-preview-heading"><Wrench size={21} aria-hidden="true" /><h2>What could change the equation</h2></div>
          <ul className="dog-equation-projects">
            <li><strong>{project("stockton-animal-shelter-renovation")?.title ?? "Shelter expansion"}</strong><span>Construction observed; net usable capacity unknown</span></li>
            <li><strong>{project("canine-campus")?.title ?? "Canine Campus"}</strong><span>Proposed; no operating capacity verified</span></li>
            <li><strong>Spay-neuter and veterinary access</strong><span>Plans and contracts documented; delivered output unverified</span></li>
          </ul>
          <a href={solutionsHref} onClick={(event) => navigateInternalLink(event, () => onOpenWork("dogs-solutions"))}>Explore documented improvements <ArrowRight size={15} aria-hidden="true" /></a>
        </section>

        <section className="dog-equation-preview" id="dog-locations">
          <div className="dog-equation-preview-heading"><MapPin size={21} aria-hidden="true" /><h2>Locations map</h2></div>
          <p>Review generalized areas from dated public reports. Pins are not live sightings or verified current needs.</p>
          <PreviewMap />
          <a href={mapHref} onClick={(event) => navigateInternalLink(event, () => onOpenWork("dogs-locations-map"))}>Open the full map <ArrowRight size={15} aria-hidden="true" /></a>
        </section>
      </div>

      <section className="dog-equation-journey" id="dog-journey">
        <div><p className="dog-equation-eyebrow">The investigation journey</p><h2>What happens when we try to help?</h2><p>Follow recorded inquiries, visits, observations, and what remains unanswered. An attempt is not the same as a confirmed result.</p></div>
        <div className="dog-equation-journey-links"><a href={investigationHref} onClick={(event) => navigateInternalLink(event, () => onOpenWork("dogs-map-placement-barriers"))}>Explore the investigation <ArrowRight size={16} aria-hidden="true" /></a><a href={fieldworkHref} onClick={(event) => navigateInternalLink(event, () => onOpenWork("dogs-direct-field-work"))}>View activity and journey log <ArrowRight size={16} aria-hidden="true" /></a></div>
      </section>
      <div className="dog-equation-closing"><strong>What variable could we change today?</strong><span>Find the constraint. Test a real pathway. Confirm what changed.</span></div>
  </div>;
}
