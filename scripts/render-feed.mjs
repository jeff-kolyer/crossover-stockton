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
const recordUrl = record => record.schema === "gap" ? "/" : `/record/${encodeURIComponent(record.id)}/`;
const matchGap = record => record.fields.gap_id === gap.id || record.fields.gap_ids?.includes(gap.id) || record.fields.related_gap_ids?.includes(gap.id) || gap.fields.organization_ids?.includes(record.id);
const selected = passage => (passage.feedRecords ?? passage.records)?.map(resolve) || (passage.select ? Object.values(records).filter(record => record.schema === passage.select.schema && (!passage.select.gap || matchGap(record))).sort((a, b) => (b.dateForSort?.value ?? "").localeCompare(a.dateForSort?.value ?? "") || a.id.localeCompare(b.id)) : []);

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
  for (const record of selected(passage)) { const summary = recordSummary(record); const line = summary && summary.replace(/[.\s]+$/, "") !== record.title.replace(/[.\s]+$/, "") ? `${record.title}. ${summary}` : record.title; lines.push(/[.!?]$/.test(line) ? line : `${line}.`); }
  return lines.join("\n\n");
}
const feedText = story.silent.reading.map(path => {
  const passage = section(path);
  if (passage.id === "introduction") return `${passage.title} ${passage.text} ${passage.method}`;
  if (passage.id === "situation") return `Our first gap is ${gap.title}. ${passage.text}`;
  if (passage.id === "key-figures") return `Here are the key figures, which describe different things and do not count dogs currently living on the streets. ${passageText(passage).replaceAll("\n\n", " ")}`;
  if (passage.id === "focus") return `Current work: ${passage.currentWork || passage.text}`;
  if (passage.id === "developments") return `Recent developments: ${passageText(passage).replaceAll("\n\n", " ")}`;
  if (passage.id === "current-work") return `The work underway: ${passageText(passage).replaceAll("\n\n", " ")}`;
  if (passage.id === "improvements") return `Proposed and active improvements: ${passageText(passage).replaceAll("\n\n", " ")}`;
  if (passage.id === "findings") return `What the evidence supports so far: ${passageText(passage).replaceAll("\n\n", " ")}`;
  return passageText(passage).replaceAll("\n\n", " ");
}).join("\n\n");

function renderPassage(passage) {
  const heading = passage.id === "situation" ? "" : passage.title || passage.headline || (passage.id === "purpose" ? identity.fields.slogan : passage.id === "founder" ? `Founded by ${resolve(passage.record).title}` : "");
  const intro = passage.text ? `<p>${escape(passage.text)}</p>` : "";
  const figures = passage.figures ? `<ul class="figure-list">${passage.figures.map(figure => { const record = resolve(figure.record); const value = record.schema === "measurement" ? record.fields.value.toLocaleString("en-US") : record.fields.reportedValue; const href = figure.more?.chapter ? `/${encodeURIComponent(gap.fields.slug)}/${figure.more.chapter.slice(4)}/` : recordUrl(resolve(figure.more?.record ?? figure.record)); return `<li><a href="${href}"><strong>${escape(value)}</strong> ${escape(figure.label)}</a><span>${escape(figure.context)}</span></li>`; }).join("")}</ul>` : "";
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
    if (root === "introduction" && item.method) full.push(`<p class="lead">${escape(item.method)}</p>`);
    if (item.tagline) full.push(`<p class="lead">${escape(item.tagline)}</p>`);
    if (root === "introduction") full.push(`<section class="passage"><h3>Current gap</h3><h4>${escape(gap.title)}</h4><p>${escape(chapter("gap").text)}</p><p><a href="/">Read the overview</a></p></section>`);
    if (path === root) continue;
  }
  if (root === "gap" && ["overview", "activity"].includes(group) && group !== activeGroup) {
    closeGroup();
    activeGroup = group;
    full.push(`<section id="${escape(group)}" class="story-part"><h3>${escape(section(`gap.${group}`).title)}</h3>`);
  } else if (root === "gap" && !["overview", "activity"].includes(group)) closeGroup();
  const item = section(path);
  if (item.id === "situation") full.push(`<section class="passage"><p>${escape(item.text)}</p></section>`);
  else if (item.id === "sources") full.push(`<section id="sources" class="story-part"><h3>Sources</h3><p>${escape(item.text)}</p><p><a href="/${encodeURIComponent(gap.fields.slug)}/sources/">Browse the supporting sources</a></p></section>`);
  else if (root === "gap" && !activeGroup) full.push(`<section id="${escape(item.id)}" class="story-part"><h3>${escape(item.title)}</h3>${item.text ? `<p>${escape(item.text)}</p>` : ""}${selected(item).length ? `<div class="record-list">${selected(item).map(record => `<article><h4><a href="${recordUrl(record)}">${escape(record.title)}</a></h4><p>${escape(recordSummary(record))}</p></article>`).join("")}</div>` : ""}</section>`);
  else full.push(renderPassage(item));
  }
  closeRoot();
  return full.join("\n");
}
const chapters = renderReading(story.silent.reading);
await writeFile("public/feed-content.html", `${chapters}\n`);
await writeFile("public/feed.txt", `${feedText}\n`);
console.log('Rendered one curated feed in HTML and text from public/feed.json');
