import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { createServer } from "vite";
import { buildExplorerSnapshot } from "./explorer-snapshot.mjs";
import { loadExplorerRoots } from "./explorer-roots.mjs";

const policy = JSON.parse(await readFile("src/model/explorer-publication.json", "utf8"));
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
    needs: siteModel.getNeeds(),
    investigations: siteModel.getInvestigations(),
    objectives: siteModel.getAllObjectives(),
    tasks: siteModel.getAllTasks(),
    activities: siteModel.getAllActivities(),
    findings: siteModel.getAllFindings(),
    locations: siteModel.getAllLocations(),
    evidence: siteModel.getAllEvidence(),
    claims: siteModel.getAllClaims(),
    measurements: siteModel.getMeasurements(),
    stories: siteModel.getStories(),
    projects: siteModel.getProjects(),
    articles: siteModel.getArticles(),
  };
  const { snapshot, diagnostics } = buildExplorerSnapshot(policy, schemas, collections, roots);
  const output = `${JSON.stringify(snapshot, null, 2)}\n`;
  if (/"(?:visit_notes|checklist|coordinates|contact_questions|instructions|source_notes)"\s*:/.test(output)) throw new Error("A non-public field entered the Explorer payload");
  await mkdir("src/generated", { recursive: true });
  const path = "src/generated/explorer-public.json";
  let old = "";
  try { old = await readFile(path, "utf8"); } catch { /* First generation. */ }
  if (old !== output) await writeFile(path, output);
  await mkdir("public/data", { recursive: true });
  const publicPath = "public/data/records.json";
  const feed = `${JSON.stringify({ records: snapshot.records, fieldInfo: snapshot.fieldInfo, visualGuidance: snapshot.visualGuidance, browseGuidance: snapshot.browseGuidance }, null, 2)}\n`;
  let oldPublic = "";
  try { oldPublic = await readFile(publicPath, "utf8"); } catch { /* First generation. */ }
  if (oldPublic !== feed) await writeFile(publicPath, feed);
  console.log(`Explorer publication: ${Object.keys(snapshot.records).length} unique records in ${snapshot.collections.length} collections; ${diagnostics.length} unavailable references disclosed as such.`);
  if (snapshot.unsupportedTypes.length) console.log(`Schema types without a public collection: ${snapshot.unsupportedTypes.join(", ")}`);
} finally {
  await vite.close();
}
