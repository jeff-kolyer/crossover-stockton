export function validateFeed(story, records) {
  const errors = [];
  const gap = Object.values(records).find(record => record.schema === "gap" && record.fields.default);
  const identity = records["crossover-stockton"];
  if (!gap || !identity) errors.push("Story needs a published Identity and default Gap");
  const resolve = id => id === "$gap" ? gap : id === "$founder" ? records[identity?.fields.founderPersonId] : records[id];
  const paths = new Map();
  const checkRef = (id, at) => { if (!resolve(id)) errors.push(`${at}: missing record ${id}`); };
  const pendingMore = [];
  function walk(node, path) {
    if (!node?.id || paths.has(path)) errors.push(`Duplicate or missing chapter path ${path}`);
    paths.set(path, node);
    if (node.record) checkRef(node.record, path);
    if (node.statusRecord) checkRef(node.statusRecord, path);
    for (const id of [...(node.references ?? []), ...(node.records ?? []), ...(node.feedRecords ?? [])]) checkRef(id, path);
    for (const [index, entry] of (node.entries ?? []).entries()) {
      if (!entry.record || !entry.narration?.trim()) errors.push(`${path}: entry ${index + 1} needs a record and narration`);
      if (entry.record) checkRef(entry.record, path);
    }
    for (const [index, question] of (node.questions ?? []).entries()) {
      if (!Number.isInteger(question.index) || !gap?.fields?.unknown_questions?.[question.index]) errors.push(`${path}: question ${index + 1} needs an existing gap question`);
      if (!question.record) errors.push(`${path}: question ${index + 1} needs a linked record`);
      else checkRef(question.record, path);
    }
    if (node.feedRecords?.some(id => !node.records?.includes(id))) errors.push(`${path}: feed records must be in the passage`);
    if (node.select && !Object.values(records).some(record => record.schema === node.select.schema && (!node.select.gap || record.fields.gap_id === gap?.id || record.fields.gap_ids?.includes(gap?.id) || record.fields.related_gap_ids?.includes(gap?.id) || gap?.fields.organization_ids?.includes(record.id)))) errors.push(`${path}: selector has no published records`);
    if (node.more) pendingMore.push([node.more, path]);
    for (const figure of node.figures ?? []) {
      checkRef(figure.record, path);
      if (!["claim", "measurement"].includes(resolve(figure.record)?.schema) || !figure.label || !figure.context) errors.push(`${path}: invalid key figure ${figure.record}`);
      if (figure.more) pendingMore.push([figure.more, `${path}.${figure.record}`]);
    }
    const children = [...(node.chapters ?? []), ...(node.sections ?? [])];
    const ids = new Set();
    for (const child of children) {
      if (!child.id || ids.has(child.id)) errors.push(`${path}: duplicate or missing child ID ${child.id}`);
      ids.add(child.id);
      walk(child, `${path}.${child.id}`);
    }
  }
  const top = story.chapters ?? [];
  if (top.map(item => item.id).join(",") !== "introduction,gap,briefing,about") errors.push("Chapters must read Introduction, Gap, Briefing, About");
  for (const item of top) walk(item, item.id);
  const gapChapters = paths.get("gap")?.chapters ?? [];
  if (gapChapters.map(item => item.id).join(",") !== "overview,activity,tasks,metrics,places,organizations,improvements,events,findings,sources") errors.push("Gap chapters must keep Findings immediately before Sources");
  const menu = story.silent?.menu ?? [];
  const index = story.silent?.homePage;
  if (!index?.label || !index.image || !index.imageAlt || !index.actionLabel || index.icon !== "index") errors.push("Gap homepage needs its label, image, action, and index icon");
  if (!gap?.fields?.central_question || !gap.fields.purpose || !gap.fields.hero?.eyebrow || !gap.fields.hero.headline || !gap.fields.hero.subtitle) errors.push("Default gap needs its question, purpose, and hero copy");
  if (menu.map(item => item.page).join(",") !== "overview,activity,tasks,metrics,findings,organizations,improvements,places,events,sources") errors.push("Gap menu is incomplete or out of order");
  for (const item of menu) if (!paths.has(item.chapter) || !item.label || !item.description || !item.homeDescription || !item.icon) errors.push(`Invalid menu item ${item.page}`);
  for (const [more, at] of pendingMore) {
    if (!more.label || Boolean(more.chapter) === Boolean(more.record)) errors.push(`${at}: more needs a label and exactly one chapter or record`);
    if (more.chapter && !paths.has(more.chapter)) errors.push(`${at}: more references missing chapter ${more.chapter}`);
    if (more.record) checkRef(more.record, at);
  }
  for (const item of story.silent?.entryPoints ?? []) if (!item.label || !paths.has(item.chapter)) errors.push(`Invalid entry point ${item.chapter}`);
  for (const id of story.silent?.homeLinks ?? []) if (!gapChapters.some(item => item.id === id)) errors.push(`Home links to missing gap chapter ${id}`);
  if (!Array.isArray(story.silent?.reading) || !story.silent.reading.length) errors.push("Feed needs a curated reading order");
  for (const path of Array.isArray(story.silent?.reading) ? story.silent.reading : []) if (!paths.has(path)) errors.push(`Feed references missing passage ${path}`);
  if (story.silent?.reading?.[0] !== "introduction" || story.silent?.reading?.slice(1).some(path => !path.startsWith("briefing."))) errors.push("Feed reading must select the introduction and editorial briefing sections");
  for (const path of story.silent?.reading?.slice(1) ?? []) {
    const item = paths.get(path);
    if (!item?.title || !item.text || !item.entries?.length) errors.push(`${path}: feed section needs a title, narrative, and curated record entries`);
  }
  const focus = paths.get("gap.overview.focus");
  const overview = paths.get("gap.overview");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(overview?.updatedAt ?? "")) errors.push("Overview needs an editorial update date");
  const account = overview?.livingAccount?.paragraphs;
  if (!Array.isArray(account) || !account.length) errors.push("Overview needs Living Account paragraphs");
  for (const [index, paragraph] of (account ?? []).entries()) {
    const at = `gap.overview.livingAccount paragraph ${index + 1}`;
    const text = paragraph.text || '';
    if (!text.trim() || !paragraph.links?.length) errors.push(`${at}: text and source links are required`);
    const spans = [];
    for (const link of paragraph.links ?? []) {
      const start = text.indexOf(link.label);
      if (!link.label || start < 0 || text.indexOf(link.label, start + 1) >= 0) errors.push(`${at}: link label must occur exactly once in the paragraph`);
      if (link.record) checkRef(link.record, at);
      else errors.push(`${at}: link needs a record`);
      if (start >= 0 && link.label) spans.push([start, start + link.label.length]);
    }
    spans.sort((a, b) => a[0] - b[0]);
    if (spans.some((span, i) => i > 0 && span[0] < spans[i - 1][1])) errors.push(`${at}: source link labels overlap`);
  }
  for (const id of ["situation", "care", "improvement-account"]) {
    const part = paths.get(`gap.overview.${id}`);
    if (!part?.title || !part.text || !part.sections?.length) errors.push(`Overview ${id} needs a title, introduction, and sourced sections`);
    for (const item of part?.sections ?? []) {
      if ((!item.title && !item.record) || !item.text || !item.references?.length) errors.push(`Overview ${id}.${item.id} needs a heading, narrative, and source records`);
      if (id === "improvement-account" && resolve(item.record)?.schema !== "initiative") errors.push(`Overview ${id}.${item.id} must link to an improvement`);
    }
  }
  if (paths.get("gap.overview.open-questions")?.questions?.length !== 5) errors.push("Overview needs five linked open questions");
  if (!focus?.headline || !focus.text || !focus.currentWork || !focus.nextStep) errors.push("Current focus needs a headline and three account paragraphs");
  if (focus?.statusRecord && (resolve(focus.statusRecord)?.schema !== "task" || !resolve(focus.statusRecord)?.fields?.started_at)) errors.push("Current focus status needs a dated task record");
  if (!paths.get("introduction")?.title || !paths.get("introduction")?.text || !paths.get("introduction")?.method) errors.push("Introduction needs its guiding idea, purpose, and method");
  if (!paths.get("gap")?.text) errors.push("Gap chapter needs a current summary");
  for (const record of Object.values(records)) for (const field of ["statements", "homeSummary", "aboutSummary", "overviewSummary", "homeImage", "overviewLabel", "overviewNote", "current_focus"]) if (field in record.fields) errors.push(`${record.id}: page-specific field ${field} remains in the record`);
  if (errors.length) throw new Error(`Invalid story:\n${errors.join("\n")}`);
}
