import { readFile, writeFile } from "node:fs/promises";

const feed = JSON.parse(await readFile("public/data/records.json", "utf8"));
const story = JSON.parse(await readFile("public/feed.json", "utf8"));
const records = feed.records;
const chapter = id => story.chapters.find(item => item.id === id);
const section = path => path.split(".").slice(1).reduce((node, id) => [...(node.chapters ?? []), ...(node.sections ?? [])].find(item => item.id === id), chapter(path.split(".")[0]));
const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const resolve = id => records[id];
const recordUrl = record => record.schema === "gap" ? "/" : `/record/${encodeURIComponent(record.id)}/`;
// Every spoken paragraph is the same editorial text shown in the HTML reading.
// Record links are supporting metadata; changing this selection never edits a record.
const reading = story.silent.reading.map(path => ({ path, passage: section(path) }));
const paragraphs = ({ path, passage }) => path === "introduction"
  ? [passage.title, passage.text, passage.method]
  : [passage.title, passage.text, passage.note, ...(passage.entries ?? []).map(entry => entry.narration)].filter(Boolean);
const feedText = reading.map(item => paragraphs(item).join("\n\n")).join("\n\n");

function renderReading() {
  return reading.map(item => {
    const { path, passage } = item;
    const spoken = paragraphs(item);
    if (path === "introduction") return `<section id="introduction" class="chapter"><h2>${escape(spoken[0])}</h2>${spoken.slice(1).map(line => `<p class="lead">${escape(line)}</p>`).join("")}</section>`;
    const entries = passage.entries ?? [];
    const sources = entries.length ? `<p class="feed-sources"><strong>Explore the records:</strong> ${entries.map(entry => `<a class="text-link" href="${recordUrl(resolve(entry.record))}">${escape(resolve(entry.record).title)}</a>`).join(" · ")}</p>` : "";
    return `<section id="${escape(passage.id)}" class="chapter"><h2>${escape(spoken[0])}</h2>${spoken.slice(1).map((line, index) => `<p${passage.note && index === 1 ? ' class="editorial-note"' : ""}>${escape(line)}</p>`).join("")}${sources}</section>`;
  }).join("\n");
}
const chapters = renderReading();
await writeFile("public/feed-content.html", `${chapters}\n`);
await writeFile("public/feed.txt", `${feedText}\n`);
console.log('Rendered one curated feed in HTML and text from public/feed.json');
