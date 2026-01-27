import { loadDataset, filterResources } from "./resources.js";
import { routeIntake } from "./routing.js";
import { getPreset } from "./presets.js";

const { resources } = loadDataset();

// Change this to: "emergency" | "stabilizing" | "outside" | "medical"
const preset = getPreset("stabilizing");

const { track, filters } = routeIntake(preset.intake);
const results = filterResources(resources, { track, ...filters });

console.log(`Preset: ${preset.label}`);
console.log(`Track chosen: ${track}`);
console.log("Filters:", filters);
console.log(`\nFound ${results.length} resources:\n`);
for (const r of results) console.log(`- ${r.name} [tracks: ${r.tracks.join(",")}]`);

