import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { calculateDogCareScenario, defaultDogCareSettings, dogCareFactors, type DogCareFactor, type DogCareSettings } from "../lib/dogCareScenario";

const previewFactors = dogCareFactors.filter((factor) => ["shelter", "foster", "response"].includes(factor.key));

export function DogCarePreview() {
  const [settings, setSettings] = useState<DogCareSettings>({ ...defaultDogCareSettings });
  const result = calculateDogCareScenario(settings);

  const changeFactor = (factor: DogCareFactor, value: number) => setSettings((current) => ({ ...current, [factor]: value }));

  return <div className="dog-preview-model">
    <div className="dog-preview-controls">
      <div className="dog-preview-controls-heading"><h3>Adjust three factors</h3><button type="button" onClick={() => setSettings({ ...defaultDogCareSettings })}><RotateCcw size={15} aria-hidden="true" /> Reset</button></div>
      {previewFactors.map((factor) => <label className="dog-preview-factor" key={factor.key}>
        <span><strong>{factor.label}</strong><output>{settings[factor.key]} / 100</output></span>
        <small>{factor.description}</small>
        <input type="range" min="0" max="100" step="5" value={settings[factor.key]} aria-label={`${factor.label}, illustrative level`} aria-valuetext={`${settings[factor.key]} out of 100`} onChange={(event) => changeFactor(factor.key, Number(event.target.value))} />
      </label>)}
    </div>
    <div className="dog-preview-outcome" aria-live="polite">
      <h3>What happens in this scenario</h3>
      <p>A hypothetical group of 100 dogs at risk of inadequate care.</p>
      <div className="dog-preview-totals"><div><strong>{result.withoutAdequateCare}</strong><span>Without adequate care</span></div><div><strong>{result.receivingCare}</strong><span>Receiving care or safely supported</span></div></div>
      <div className="dog-preview-dots" role="img" aria-label={`${result.withoutAdequateCare} without adequate care; ${result.receivingCare} receiving care or safely supported`}>
        {Array.from({ length: result.cohort }, (_, index) => <i key={index} className={index < result.withoutAdequateCare ? "is-without" : "is-receiving"} />)}
      </div>
      <div className="dog-preview-legend"><span><i className="is-without" /> Without adequate care</span><span><i className="is-receiving" /> Receiving care or safely supported</span></div>
    </div>
  </div>;
}
