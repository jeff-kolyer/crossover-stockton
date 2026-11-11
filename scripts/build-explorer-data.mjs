import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { createServer } from "vite";
import { buildExplorerSnapshot } from "./explorer-snapshot.mjs";
import { loadExplorerRoots } from "./explorer-roots.mjs";
import { validateFeed } from "./validate-feed.mjs";
import { validatePublication } from "./validate-publication.mjs";

const policy = JSON.parse(await readFile("src/model/explorer-publication.json", "utf8"));
const story = JSON.parse(await readFile("src/feed.json", "utf8"));
const publication = JSON.parse(await readFile("src/publication.json", "utf8"));
const roots = await loadExplorerRoots(policy);
const schemaNames = (await readdir("src/schemas")).filter((name) => name.endsWith(".schema.json"));
const schemas = Object.fromEntries(await Promise.all(schemaNames.map(async (name) => [name.replace(".schema.json", ""), JSON.parse(await readFile(`src/schemas/${name}`, "utf8"))])));
const vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
try {
  const { siteModel } = await vite.ssrLoadModule("/src/model/index.ts");
  const collections = {
    identity: [siteModel.getIdentity()],
    principles: siteModel.getPrinciples(),
    methods: siteModel.getMethods(),
    people: siteModel.getPeople(),
    organizations: siteModel.getOrganizations(),
    gaps: siteModel.getGaps(),
    tasks: siteModel.getAllTasks(),
    activities: siteModel.getAllActivities(),
    findings: siteModel.getAllFindings(),
    locations: siteModel.getAllLocations(),
    evidence: siteModel.getAllEvidence(),
    claims: siteModel.getAllClaims(),
    measurements: siteModel.getMeasurements(),
    initiatives: siteModel.getInitiatives(),
  };
  const { snapshot, diagnostics } = buildExplorerSnapshot(policy, schemas, collections, roots);
  validateFeed(story, snapshot.records);
  validatePublication(publication, snapshot.records);
  const gaps = siteModel.getGaps();
  if (gaps.length < 1 || gaps.filter((gap) => gap.default).length !== 1) throw new Error("Gaps need exactly one default entry");
  if (new Set(gaps.map((gap) => gap.slug)).size !== gaps.length) throw new Error("Gap slugs must be unique");
  for (const gap of gaps) if (!/^[a-z0-9-]+$/.test(gap.slug) || !gap.title?.trim() || snapshot.records[gap.id]?.schema !== "gap") throw new Error(`Invalid public gap ${gap.id}`);
  const output = `${JSON.stringify(snapshot, null, 2)}\n`;
  if (/"(?:visit_notes|checklist|coordinates|contact_questions|source_notes)"\s*:/.test(output)) throw new Error("A non-public field entered the Explorer payload");
  await mkdir("src/generated", { recursive: true });
  const path = "src/generated/explorer-public.json";
  let old = "";
  try { old = await readFile(path, "utf8"); } catch { /* First generation. */ }
  if (old !== output) await writeFile(path, output);
  await mkdir("public/data", { recursive: true });
  const publicPath = "public/data/records.json";
  const feed = `${JSON.stringify({ records: snapshot.records, fieldInfo: snapshot.fieldInfo, visualGuidance: snapshot.visualGuidance, browseGuidance: snapshot.browseGuidance, locationGuidance: snapshot.locationGuidance }, null, 2)}\n`;
  let oldPublic = "";
  try { oldPublic = await readFile(publicPath, "utf8"); } catch { /* First generation. */ }
  if (oldPublic !== feed) await writeFile(publicPath, feed);
  const storyPath = "public/feed.json";
  const publishedStory = `${JSON.stringify(story, null, 2)}\n`;
  let oldStory = "";
  try { oldStory = await readFile(storyPath, "utf8"); } catch { /* First generation. */ }
  if (oldStory !== publishedStory) await writeFile(storyPath, publishedStory);
  const publicationPath = "public/publication.json";
  const publishedPublication = `${JSON.stringify(publication, null, 2)}\n`;
  if (await readFile(publicationPath, "utf8").catch(() => "") !== publishedPublication) await writeFile(publicationPath, publishedPublication);
  console.log(`Explorer publication: ${Object.keys(snapshot.records).length} unique records in ${snapshot.collections.length} collections; ${diagnostics.length} unavailable references disclosed as such.`);
  if (snapshot.unsupportedTypes.length) console.log(`Schema types without a public collection: ${snapshot.unsupportedTypes.join(", ")}`);
} finally {
  await vite.close();
}
