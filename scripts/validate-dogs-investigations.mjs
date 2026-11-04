import { readFileSync } from "node:fs";

const data = (name) => JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url), "utf8"));
const investigations = data("investigations").records;
const objectives = data("objectives");
const locations = data("locations");
const maintenance = JSON.parse(readFileSync(new URL("../src/pages/map.json", import.meta.url), "utf8")).maintenance;
const gapIds = new Set(data("needs").records.map((gap) => gap.id));
const allRecords = [...data("evidence"), ...data("activities")];
const recordIds = new Set(allRecords.map((record) => record.id));
const recordById = new Map(allRecords.map((record) => [record.id, record]));
const findingIds = new Set(data("findings").map((finding) => finding.id));
const errors = [];

function references(owner, values, known, label) {
  for (const id of values ?? []) if (!known.has(id)) errors.push(`${owner}: unknown ${label} ${id}`);
}

if (new Set(investigations.map((item) => item.id)).size !== investigations.length) errors.push("Duplicate investigation ID");

for (const investigation of investigations) {
  if (!gapIds.has(investigation.gap_id)) errors.push(`${investigation.id}: unknown need`);
  if (!["preparing_fieldwork", "in_progress", "completed"].includes(investigation.status)) errors.push(`${investigation.id}: invalid status`);
  if (!investigation.last_updated_at) errors.push(`${investigation.id}: missing update date`);
  if (!objectives.some((objective) => objective.investigation_id === investigation.id)) errors.push(`${investigation.id}: no linked objectives`);
  references(investigation.id, investigation.evidence_record_ids, recordIds, "evidence record");
  references(investigation.id, investigation.verified_finding_ids, findingIds, "finding");
}
const investigationIds = new Set(investigations.map((item) => item.id));
if (new Set(locations.map((location) => location.id)).size !== locations.length) errors.push("Duplicate investigation location ID");
for (const location of locations) {
  if (!investigationIds.has(location.investigation_id)) errors.push(`${location.id}: unknown investigation ${location.investigation_id}`);
  if (!location.name?.trim() || !location.area?.trim() || !location.description?.trim() || !location.unknown?.trim() || !location.coordinate_note?.trim()) errors.push(`${location.id}: missing description, area, unknown, or coordinate note`);
  if (location.coordinates === null) {
    if (location.coordinate_reference_url !== null || !/no (?:point|map pin)/i.test(location.coordinate_note)) errors.push(`${location.id}: unpinned corridor needs a clear note and no coordinate reference`);
  } else if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2 || !location.coordinates.every(Number.isFinite)) errors.push(`${location.id}: invalid coordinates`);
  else {
    const [lat, lng] = location.coordinates;
    if (lat < 37.85 || lat > 38.1 || lng < -121.45 || lng > -121.2) errors.push(`${location.id}: coordinates outside Stockton region`);
    if (location.coordinates.some((value) => String(value).split(".")[1]?.length > 3)) errors.push(`${location.id}: coordinates are too precise for public reference markers`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(location.evidence_date) || Number.isNaN(Date.parse(location.evidence_date))) errors.push(`${location.id}: invalid evidence date`);
  if (!["Occurred", "Reported occurrence", "Report published", "Source reviewed"].includes(location.date_label)) errors.push(`${location.id}: missing date meaning`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(location.source_reviewed_at ?? "") && location.source_reviewed_at !== null) errors.push(`${location.id}: invalid source review date`);
  if (!location.source_reviewed_at) errors.push(`${location.id}: missing source review date`);
  if (!location.verification_status?.trim() || !location.last_known_outcome?.trim()) errors.push(`${location.id}: missing verification or outcome`);
  if (!["historical_published_report", "recent_public_report", "official_location_record", "crossover_firsthand"].includes(location.category)) errors.push(`${location.id}: invalid category`);
  const markerKinds = ["reported_sighting", "historical_sighting", "major_reported_concern", "firsthand_observation", "organization", "animal_shelter"];
  if (location.coordinates === null && (location.marker_kind !== null || location.map_label !== null)) errors.push(`${location.id}: unpinned report cannot have marker presentation`);
  if (location.coordinates !== null && (!markerKinds.includes(location.marker_kind) || !location.map_label?.place?.trim() || !location.map_label?.report?.trim())) errors.push(`${location.id}: mapped report needs a supported marker and concise label`);
  if (location.marker_kind === "firsthand_observation" && location.category !== "crossover_firsthand") errors.push(`${location.id}: firsthand marker needs firsthand evidence`);
  if (location.marker_kind === "reported_sighting" && location.category !== "recent_public_report") errors.push(`${location.id}: recent sighting marker needs a recent public report`);
  if (location.marker_kind === "historical_sighting" && location.category !== "historical_published_report") errors.push(`${location.id}: historical sighting marker needs a historical report`);
  if (location.category === "recent_public_report" && !location.source_reviewed_at) errors.push(`${location.id}: recent public report lacks review date`);
  if (!["reported", "exploratory"].includes(location.status)) errors.push(`${location.id}: invalid status`);
  if (!location.evidence_type?.trim()) errors.push(`${location.id}: missing evidence type`);
  try { if (new URL(location.source_url).protocol !== "https:") throw new Error(); } catch { errors.push(`${location.id}: invalid source URL`); }
  if (location.coordinate_reference_url !== null) try { if (new URL(location.coordinate_reference_url).protocol !== "https:") throw new Error(); } catch { errors.push(`${location.id}: invalid coordinate reference URL`); }
  if (location.evidence_record_id && recordById.get(location.evidence_record_id)?.source?.url !== location.source_url) errors.push(`${location.id}: evidence record URL mismatch`);
  if (location.field_report_id && recordById.get(location.field_report_id)?.record_type !== "field_report") errors.push(`${location.id}: field report reference does not resolve`);
}

if (!maintenance) errors.push("Investigation map maintenance is missing");
else {
  for (const field of ["last_sources_checked", "last_map_updated", "next_scheduled_review"]) {
    if (maintenance[field] !== null && (!/^\d{4}-\d{2}-\d{2}$/.test(maintenance[field] ?? "") || Number.isNaN(Date.parse(maintenance[field])))) errors.push(`Map maintenance: invalid ${field}`);
  }
  if (!maintenance.review_policy?.trim()) errors.push("Map maintenance: missing review policy");
  if (maintenance.last_sources_checked && locations.some((location) => location.source_reviewed_at && location.source_reviewed_at > maintenance.last_sources_checked)) errors.push("Map maintenance: source check predates a map record review");
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${investigations.length} investigation, ${locations.length} locations, and their references.`);
}
