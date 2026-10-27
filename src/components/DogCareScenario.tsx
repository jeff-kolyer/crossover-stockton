
import { useState } from "react";
import { navigateInternalLink } from "../lib/internalLink";
import projectsData from "../data/projects.json";
import type { CapacityProject } from "../types";
import { effectiveCareSettings, factorExplanations, improvementAdjustments, modeledImprovements } from "../lib/dogCareImprovements";
import {
  calculateDogCareScenario,
  defaultDogCareSettings,
  dogCareFactors,
  type DogCareFactor,
  type DogCareSettings,
} from "../lib/dogCareScenario";

const projects = projectsData as CapacityProject[];
const projectStage = (project: CapacityProject) => project.development_stage.replace(/_/g, " ").replace(/^./, (letter) => letter.toUpperCase());

export function DogCareScenario({ heading = "What determines how many dogs are on the street without adequate care?", compactHeader = false, factorHref, onOpenFactor, improvementHref, onOpenImprovement }: { heading?: string; compactHeader?: boolean; factorHref?: (key: DogCareFactor) => string; onOpenFactor?: (key: DogCareFactor) => void; improvementHref?: (id: string) => string; onOpenImprovement?: (id: string) => void }) {
  const [manualSettings, setManualSettings] = useState<DogCareSettings>({ ...defaultDogCareSettings });
  const [selectedImprovements, setSelectedImprovements] = useState<string[]>([]);
  const [expandedFactor, setExpandedFactor] = useState<DogCareFactor | null>(null);
  const adjustments = improvementAdjustments(selectedImprovements);
  const settings = effectiveCareSettings(manualSettings, selectedImprovements);
  const result = calculateDogCareScenario(settings);

  const update = (key: DogCareFactor, value: number) => {
    // Keep the user's chosen displayed value while retaining selected improvements.
    setManualSettings((current) => ({ ...current, [key]: value - adjustments[key] }));
  };

  const toggleImprovement = (id: string) => setSelectedImprovements((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const reset = () => { setManualSettings({ ...defaultDogCareSettings }); setSelectedImprovements([]); };

  const stages = [
    { label: "Detected", detail: "of those needing response", value: result.detected },
    { label: "Reached", detail: "by responders", value: result.reached },
    { label: "Entered care", detail: "temporary shelter or foster", value: result.enteredCare },
    { label: "Home / reunited", detail: "lasting placement", value: result.homeOrReunited },
  ];

  return (
    <section className="dog-care-model" id="system-model" aria-labelledby="dog-care-model-title">
      <div className="dog-care-model-heading">
        <div>
          <p className="dog-equation-eyebrow">The Equation of Care</p>
          <h2 id="dog-care-model-title">{heading}</h2>
          {compactHeader ? <>
            <p>Adjust the factors to explore what might improve care.</p>
            <span className="dog-care-model-disclaimer">Illustrative scenario · Not actual Stockton population data</span>
          </> : <>
            <p>We can model the problem as a system of inputs, capacity, flows, and outcomes.</p>
            <p className="dog-care-model-secondary">Change the factors to explore what might improve care—and where help gets stuck.</p>
          </>}
        </div>
        {!compactHeader && <span className="dog-care-model-disclaimer">Illustrative scenario · Not a Stockton population estimate</span>}
      </div>
      <div className="dog-care-model-grid">
        <div className="dog-care-factors">
          <div className="dog-care-column-heading">
            <div>
              <h3>The factors that affect this gap</h3>
              <p>Relative levels, not measured Stockton rates.</p>
            </div>
            <button className="dog-care-reset" type="button" onClick={reset}> Reset</button>
          </div>
          <div className="dog-care-mobile-result" aria-live="polite"><strong>{result.withoutAdequateCare} of 100</strong> without adequate care <span>·</span> <strong>{result.receivingCare} receiving care</strong></div>
          <div className="dog-care-factor-list">
            {dogCareFactors.map((factor) => {
              const expanded = expandedFactor === factor.key;
              const relevant = modeledImprovements.filter((item) => item.adjustments[factor.key] !== undefined);
              const appliedGain = settings[factor.key] - Math.max(0, Math.min(100, manualSettings[factor.key]));
              const hasAppliedImprovement = selectedImprovements.some((id) => relevant.some((item) => item.id === id));
              return <div className="dog-care-factor" key={factor.key}>
                <div className="dog-care-factor-label">
                  <button className="dog-care-factor-title-button" type="button" aria-expanded={expanded} aria-controls={`dog-care-detail-${factor.key}`} aria-label={`${expanded ? "Collapse" : "Expand"} ${factor.label}${relevant.length ? `, ${relevant.length} related improvement${relevant.length === 1 ? "" : "s"}` : ""}`} onClick={() => setExpandedFactor(expanded ? null : factor.key)}>
                    <span className="dog-care-factor-heading"><span className="dog-care-factor-name">{factor.label}</span>{relevant.length > 0 && <span className="dog-care-improvement-count" role="img" aria-label={`${relevant.length} related improvement${relevant.length === 1 ? "" : "s"}`} title={`${relevant.length} related improvement${relevant.length === 1 ? "" : "s"}`}>{relevant.length}</span>}</span>
                    <span className="dog-care-factor-values">{relevant.length > 0 && <span className="dog-care-applied-gain" aria-hidden={!hasAppliedImprovement} data-visible={hasAppliedImprovement}>{hasAppliedImprovement ? `+${appliedGain} applied` : "+100 applied"}</span>}<output htmlFor={`dog-care-${factor.key}`}>{settings[factor.key]} / 100</output></span>
                    
                  </button>
                </div>
                <p>{factor.description}</p>
                <input
                  id={`dog-care-${factor.key}`}
                  aria-label={factor.label}
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={settings[factor.key]}
                  aria-valuetext={`${settings[factor.key]} out of 100, illustrative relative level`}
                  onChange={(event) => update(factor.key, Number(event.target.value))}
                />
                <div className="dog-care-factor-details" id={`dog-care-detail-${factor.key}`} hidden={!expanded}>
                  <p>{factorExplanations[factor.key]}</p>
                  {relevant.length > 0 && <>
                    <h4>Coming and proposed improvements</h4>
                    <div className="dog-care-improvement-list">{relevant.map((improvement) => {
                      const project = projects.find((item) => item.id === improvement.projectId);
                      if (!project) return null;
                      const applied = selectedImprovements.includes(improvement.id);
                      const effect = Object.entries(improvement.adjustments).map(([key, value]) => `+${value} ${dogCareFactors.find((item) => item.key === key)?.label.toLowerCase()}`).join(" · ");
                      return <div className="dog-care-improvement" key={improvement.id}>
                        <div><strong>{project.title}</strong><p>{project.capacity_summary.how_it_helps}</p><small>{projectStage(project)} · Illustrative model effect: {effect}</small>{improvementHref && onOpenImprovement && <a href={improvementHref(project.id)} onClick={(event) => navigateInternalLink(event, () => onOpenImprovement(project.id))}>Project details </a>}</div>
                        <button type="button" aria-pressed={applied} onClick={() => toggleImprovement(improvement.id)}>{applied ? "Applied" : "Apply"}</button>
                      </div>;
                    })}</div>
                    <p className="dog-care-improvement-note">Applying a project changes this illustrative scenario only. These point effects are assumptions, not delivered capacity, measured outcomes, or official projections.</p>
                  </>}
                  {factorHref && onOpenFactor && <a className="dog-care-factor-detail-link" href={factorHref(factor.key)} onClick={(event) => navigateInternalLink(event, () => onOpenFactor(factor.key))}>Explore this key factor </a>}
                </div>
              </div>
            })}
          </div>
        </div>

        <div className="dog-care-outcome">
          <div className="dog-care-column-heading">
            <div>
              <h3>What happens in this scenario</h3>
              <p>A hypothetical cohort of 100 dogs at risk of inadequate care.</p>
            </div>
          </div>
          <div className="dog-care-totals" aria-live="polite">
            <div className="dog-care-total dog-care-total-without"><span>Without adequate care</span><strong>{result.withoutAdequateCare} <small>of 100 dogs</small></strong></div>
            <div className="dog-care-total dog-care-total-receiving"><span>Receiving care or safely supported</span><strong>{result.receivingCare} <small>of 100 dogs</small></strong></div>
          </div>
          <div className="dog-care-dots" role="img" aria-label={`${result.withoutAdequateCare} of 100 dogs without adequate care; ${result.receivingCare} receiving care or safely supported`}>
            {Array.from({ length: result.cohort }, (_, index) => <span key={index} className={index < result.withoutAdequateCare ? "is-without" : "is-receiving"} aria-hidden="true" />)}
          </div>
          <div className="dog-care-dot-legend" aria-hidden="true"><span><i className="is-without" /> Without adequate care</span><span><i className="is-receiving" /> Receiving care or safely supported</span></div>
          <div className="dog-care-flow">
            <h4>Progress through the system <span>(out of 100)</span></h4>
            <p className="dog-care-prevention">{result.supportedBeforeEntry} remain safely supported before needing new placement; {result.needingResponse} need a response.</p>
            <div className="dog-care-flow-stages">
              {stages.map((stage) => <div className="dog-care-stage" key={stage.label}><strong>{stage.label}</strong><small>{stage.detail}</small><b>{stage.value}</b><span className="dog-care-stage-track"><span style={{ width: `${stage.value}%` }} /></span></div>)}
            </div>
            <p className="dog-care-flow-note">{result.inTemporaryCare} are in temporary care and have not reached a lasting home in this scenario.</p>
          </div>
          <div className="dog-care-constraint" aria-live="polite"><span>Largest modeled constraint</span><strong>{result.constraint.label}</strong><p>{result.constraint.explanation}</p></div>
        </div>
      </div>
      <p className="dog-care-assumptions">Model rules: prevention can safely support up to 20 of 100 before new placement is needed; reporting and response act in sequence; shelter and foster levels contribute to a shared limit of up to 90 temporary-care places; adoption/reunification applies only after entry. These are teaching assumptions, not Stockton measurements or a forecast.</p>
    </section>
  );
}
