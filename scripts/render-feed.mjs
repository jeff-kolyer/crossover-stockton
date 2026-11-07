import { mkdir, readFile, writeFile } from "node:fs/promises";

const feed = JSON.parse(await readFile("public/data/records.json", "utf8"));
const story = JSON.parse(await readFile("public/feed.json", "utf8"));
const records = feed.records;
const gap = Object.values(records).find(record => record.schema === "gap" && record.fields.default);
const identity = records["crossover-stockton"];
const chapter = id => story.chapters.find(item => item.id === id);
const section = path => path.split(".").slice(1).reduce((node, id) => [...(node.chapters ?? []), ...(node.sections ?? [])].find(item => item.id === id), chapter(path.split(".")[0]));
const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const externalArrow = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"/></svg>';
const resolve = id => id === "$gap" ? gap : id === "$founder" ? records[identity.fields.founderPersonId] : records[id];
const recordUrl = record => record.schema === "gap" ? `/${encodeURIComponent(record.fields.slug)}/overview/` : `/record/${encodeURIComponent(record.id)}/`;
const matchGap = record => record.fields.gap_id === gap.id || record.fields.gap_ids?.includes(gap.id) || record.fields.related_gap_ids?.includes(gap.id) || gap.fields.organization_ids?.includes(record.id);
const selected = (passage, daily = false) => (daily && passage.dailyRecords ? passage.dailyRecords : passage.records)?.map(resolve) || (passage.select ? Object.values(records).filter(record => record.schema === passage.select.schema && (!passage.select.gap || matchGap(record))).sort((a, b) => (b.dateForSort?.value ?? "").localeCompare(a.dateForSort?.value ?? "") || a.id.localeCompare(b.id)) : []);

function recordSummary(record) {
  const f = record.fields;
  if (record.schema === "finding") return [f.statement, f.limitations ? `Limit: ${f.limitations}` : ""].filter(Boolean).join(" ");
  if (record.schema === "measurement") return [f.value?.toLocaleString("en-US"), f.unit, f.note].filter(Boolean).join(" · ");
  if (record.schema === "claim") return [f.reportedValue, f.limitations].filter(Boolean).join(" · ");
  if (record.schema === "principle" || record.schema === "method") return f.statement;
  if (record.schema === "person") return f.biography?.[0] || "";
  return f.summary || f.list_context || f.statement || f.description || record.description || "";
}
function passageText(passage, chapterId) {
  const lines = [];
  if (passage.headline) lines.push(passage.headline);
  if (passage.text) lines.push(passage.text);
  if (passage.tagline) lines.push(passage.tagline);
  if (passage.id === "discovery") lines.push(resolve(passage.record).fields.statement);
  if (passage.id === "key-figures") for (const figure of passage.figures) {
    const record = resolve(figure.record);
    const value = record.schema === "measurement" ? record.fields.value.toLocaleString("en-US") : record.fields.reportedValue;
    lines.push(`${figure.label}: ${String(value).replace("–", " to ").replace("/week", " per week").toLowerCase()}. ${figure.context.replace(" · ", ", ")}.`);
  }
  if (passage.id === "founder") lines.push(resolve(passage.record).title);
  for (const record of selected(passage, true)) { const summary = recordSummary(record); lines.push(summary && summary.replace(/[.\s]+$/, "") !== record.title.replace(/[.\s]+$/, "") ? `${record.title}. ${summary}` : record.title); }
  return lines.join("\n\n");
}
const daily = story.silent.reading.daily.map(path => {
  const passage = section(path);
  return [passage.id === "situation" ? gap.title : passage.title, passageText(passage, path.split(".")[0])].filter(Boolean).join("\n\n");
}).join("\n\n");

function renderPassage(passage) {
  const heading = passage.id === "situation" ? "" : passage.title || passage.headline || (passage.id === "purpose" ? identity.fields.slogan : passage.id === "founder" ? `Founded by ${resolve(passage.record).title}` : "");
  const intro = passage.text ? `<p>${escape(passage.text)}</p>` : "";
  const figures = passage.figures ? `<ul class="figure-list">${passage.figures.map(figure => { const record = resolve(figure.record); const value = record.schema === "measurement" ? record.fields.value.toLocaleString("en-US") : record.fields.reportedValue; const href = figure.more?.chapter ? `/gaps/${encodeURIComponent(gap.fields.slug)}/${figure.more.chapter.slice(4)}/` : recordUrl(resolve(figure.more?.record ?? figure.record)); return `<li><a href="${href}"><strong>${escape(value)}</strong> ${escape(figure.label)}</a><span>${escape(figure.context)}</span></li>`; }).join("")}</ul>` : "";
  const items = selected(passage);
  const list = items.length ? `<div class="record-list">${items.map(record => `<article><h4><a href="${recordUrl(record)}">${escape(record.title)}</a></h4><p>${escape(recordSummary(record))}</p></article>`).join("")}</div>` : "";
  const discovery = passage.id === "discovery" ? `<p>${escape(resolve(passage.record).fields.statement)}</p>` : "";
  const more = passage.more?.chapter ? `<p><a href="/${encodeURIComponent(gap.fields.slug)}/${escape(passage.more.chapter.slice(4))}/">${escape(passage.more.label)}</a></p>` : "";
  const founder = passage.id === "founder" ? `<p><a href="${escape(resolve(passage.record).fields.profileUrl)}">Connect on LinkedIn ${externalArrow}</a></p>` : "";
  return `<section id="${escape(passage.id)}" class="passage">${heading ? `<h3>${escape(heading)}</h3>` : ""}${intro}${discovery}${figures}${list}${more}${founder}</section>`;
}
function renderReading(paths) {
  const full = [];
  let activeRoot = "";
  let activeGroup = "";
  const closeGroup = () => { if (activeGroup) { full.push("</section>"); activeGroup = ""; } };
  const closeRoot = () => { closeGroup(); if (activeRoot) full.push("</section>"); };
  for (const path of paths) {
  const [root, group] = path.split(".");
  if (root !== activeRoot) {
    closeRoot();
    activeRoot = root;
    const item = chapter(root);
    full.push(`<section id="${escape(root)}" class="chapter"><h2>${escape(root === "gap" ? "Gap overview" : item.title)}</h2>`);
    if (item.text && root !== "gap") full.push(`<p class="lead">${escape(item.text)}</p>`);
    if (item.tagline) full.push(`<p class="lead">${escape(item.tagline)}</p>`);
    if (root === "introduction") full.push(`<section class="passage"><h3>Current gap</h3><h4>${escape(gap.title)}</h4><p>${escape(chapter("gap").text)}</p><p><a href="/${encodeURIComponent(gap.fields.slug)}/overview/">Read the overview</a></p></section>`);
    if (path === root) continue;
  }
  if (root === "gap" && ["overview", "activity"].includes(group) && group !== activeGroup) {
    closeGroup();
    activeGroup = group;
    full.push(`<section id="${escape(group)}" class="story-part"><h3>${escape(section(`gap.${group}`).title)}</h3>`);
  } else if (root === "gap" && !["overview", "activity"].includes(group)) closeGroup();
  const item = section(path);
  if (item.id === "situation") full.push(`<section class="passage"><p>${escape(item.text)}</p></section>`);
  else if (item.id === "sources") full.push(`<section id="sources" class="story-part"><h3>Sources</h3><p>${escape(item.text)}</p><p><a href="/gaps/${encodeURIComponent(gap.fields.slug)}/sources/">Browse the supporting sources</a></p></section>`);
  else if (root === "gap" && !activeGroup) full.push(`<section id="${escape(item.id)}" class="story-part"><h3>${escape(item.title)}</h3>${item.text ? `<p>${escape(item.text)}</p>` : ""}${selected(item).length ? `<div class="record-list">${selected(item).map(record => `<article><h4><a href="${recordUrl(record)}">${escape(record.title)}</a></h4><p>${escape(recordSummary(record))}</p></article>`).join("")}</div>` : ""}</section>`);
  else full.push(renderPassage(item));
  }
  closeRoot();
  return full.join("\n");
}
const chapters = renderReading(story.silent.reading.full);
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="Crossover Stockton's current feed, grounded in its public records."><link rel="canonical" href="https://crossoverstockton.org/feed/"><link rel="stylesheet" href="/fonts/ibm-plex.css"><title>Read the feed · Crossover Stockton</title><style>
:root{font-family:"IBM Plex Sans",sans-serif;color:#172132;background:#f2f5f9}*{box-sizing:border-box}body{margin:0}a{color:#087d8c}a:focus-visible{outline:2px solid #087d8c;outline-offset:3px}.skip{position:absolute;top:-80px;left:10px;background:#fff;padding:8px 12px;z-index:10}.skip:focus{top:8px}header{background:#fff;border-bottom:1px solid #dce5eb}.header-inner{max-width:1120px;margin:auto;padding:24px;display:flex;justify-content:space-between;align-items:center;gap:20px}.brand{font-weight:700;color:#172132;text-decoration:none}.actions{display:flex;flex-wrap:wrap;gap:12px 24px}.actions a{display:inline-flex;align-items:center;gap:5px}main{max-width:920px;margin:auto;padding:48px 24px 100px}h1{font-size:clamp(2.2rem,5vw,3.5rem);line-height:1.1;margin:10px 0 15px}h2{font-size:2rem;margin:0 0 12px}h3{font-size:1.4rem;margin:34px 0 12px}h4{font-size:1.06rem;margin:0 0 5px}.lead{font-size:1.15rem;line-height:1.55;color:#263f50}.chapter{border-top:2px solid #b8cdd3;margin-top:65px;padding-top:28px}.chapter>p,.passage>p{line-height:1.6}.passage{margin-top:32px}.passage h3{margin-bottom:9px}.record-list article{background:#fff;border:1px solid #dce5eb;border-radius:10px;padding:17px 20px;margin:10px 0}.record-list p{line-height:1.55;margin:0}.figure-list{padding:0;list-style:none;display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px}.figure-list li{background:#fff;border:1px solid #dce5eb;border-radius:10px;padding:18px}.figure-list li span{display:block;color:#536b7a;font-size:.9rem;margin-top:6px}footer{border-top:1px solid #dce5eb;padding:26px 24px;text-align:center;color:#687b8b}@media(max-width:600px){.header-inner{align-items:flex-start;flex-direction:column}main{padding-top:30px}}
</style></head><body><a class="skip" href="#content">Skip to content</a><header><div class="header-inner"><a class="brand" href="/">${escape(identity.fields.name)}</a><nav class="actions" aria-label="Feed links"><a href="/">Home</a><a href="/feed/daily.txt">Daily reading</a><a href="/feed.json">Read feed JSON ${externalArrow}</a><a href="/data/records.json">Read records JSON ${externalArrow}</a></nav></div></header><main id="content"><h1>${escape(story.title)}</h1><p>${escape(story.description)}</p>${chapters}</main><footer>Feed passages link to the underlying public records · <a href="/explore/">Explore all ${Object.keys(records).length} records</a></footer></body></html>\n`;

await mkdir("public/feed", { recursive: true });
await writeFile("public/feed/index.html", html);
await writeFile("public/feed/daily.txt", `${story.title}\n\n${daily}\n`);
console.log(`Rendered ${story.chapters.length} feed chapters and a daily reading from public/feed.json`);
