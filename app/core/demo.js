import { loadDataset, filterResources } from "./resources.js";
import { routeIntake } from "./routing.js";

const { resources } = loadDataset();

// Example intake (pretend user taps “I’m in a vehicle & working”)
const intake = {
  housing: "vehicular",
  working: true,
  has_pet: false,
  has_rv: true,
  needs_medical: false
};

const { track, filters } = routeIntake(intake);

const results = filterResources(resources, { track, ...filters });

console.log(`Track chosen: ${track}`);
console.log("Filters:", filters);
console.log(`\nFound ${results.length} resources:\n`);
for (const r of results) console.log(`- ${r.name} [tracks: ${r.tracks.join(",")}]`);
