import './tracker.css';
import { icon } from './icons.js';
import { repo, stageNames, stages, statuses, taskIcons, typeNames, sections, recordType, typeIcon, presentation, ready, checkedTime, freshWindow, score, prettyDate, newest, normalizeTasks, validSnapshot, checkRepository } from './model.js';
import initialPathways from './data/pathways.json';
import trackerConfig from './data/tracker-config.json';
import catalogSource from './data/catalog-source.json';
import ledgerData from './data/record-id-ledger.json';
import { STREETWATCH_RECORDS } from './generated/records.js';

const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const segment = value => encodeURIComponent(value);
const cleanURL = url => { try { const u = new URL(url); return ['https:', 'http:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };
const join = items => items.join('');
const plural = (n, word) => n + ' ' + word + (n === 1 ? '' : 's');
const displayKind = kind => String(kind || 'Record').replaceAll('_', ' ').replace(/^./, s => s.toUpperCase());
const external = (url, label, cls = 'text-link') => cleanURL(url) ? '<a class="' + cls + '" href="' + esc(cleanURL(url)) + '" target="_blank" rel="noopener noreferrer">' + esc(label) + '</a>' : '';
const inLink = (path, html, cls = '', attrs = '') => '<a class="' + cls + '" href="#' + esc(path) + '" ' + attrs + '>' + html + '</a>';
const button = (html, attr, cls = 'btn') => '<button type="button" class="' + cls + '" ' + attr + '>' + html + '</button>';
const badge = stage => '<span class="stage-badge ' + (stageNames.includes(stage) ? stage.toLowerCase() : 'exploring') + '"><i></i>' + esc(stage) + '</span>';
const statusBadge = status => '<span class="task-status ' + esc(status) + '">' + icon(taskIcons[status] || 'circle', 15) + esc(statuses[status] || 'Open') + '</span>';
const safeGet = key => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } };
function save(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }
const editKey = 'crossover-field-work-1', cachedKey = 'crossover-field-source-1', prefKey = 'crossover-field-prefs-1';
function readEdits() { const x = safeGet(editKey) || {}; return { candidates: Array.isArray(x.candidates) ? x.candidates : [], status: x.status || {}, notes: x.notes || {}, pathEdits: x.pathEdits || {}, newTasks: Array.isArray(x.newTasks) ? x.newTasks : [] }; }
let edits = readEdits(), prefs = safeGet(prefKey) || {}, seed, db, records, pathways, tasks;
let route, renderedSection = '', dirty = true, lastRoute = '', opener, sectionScroll = 0, noticeTimer, freshnessTimer, syncState = '', sourceBusy = false;
const sectionHistory = [];
let suppressSectionPush = false;
const filter = { stage: 'All', contrib: 'All', text: '' };
let taskFilter = 'all', taskQuery = '', evidenceFilter = 'All', evidenceQuery = '', searchQuery = '', boardStage = 'Exploring';
const panelScroll = new Map();
let showingDetail = false, openerHref = '';
const views = { cards: 'Cards', list: 'List', board: 'Board' };
const viewIcons = { cards: 'grid', list: 'list', board: 'board' };
const getView = () => Object.hasOwn(views, prefs.view) ? prefs.view : 'list';
document.documentElement.dataset.theme = 'light';
function message(s) { const n = $('#notice'); n.textContent = s; n.classList.add('on'); clearTimeout(noticeTimer); noticeTimer = setTimeout(() => n.classList.remove('on'), 3200); }
function reindex() {
  const original = new Set(db.pathways.map(p => p.id));
  const combined = [...db.pathways, ...edits.candidates.filter(p => p?.id && p.title && !original.has(p.id))];
  pathways = combined.map(p => {
    const patch = edits.pathEdits[p.id] || {}, added = edits.newTasks.filter(t => t.pathway === p.id);
    return {
      ...p, ...patch, criteriaMet: { ...p.criteriaMet, ...patch.criteriaMet }, actionDetails: { ...p.actionDetails, ...patch.actionDetails },
      linkedEvidence: [...new Set([...(p.linkedEvidence || []), ...(patch.evidenceIds || [])])],
      checklist: [...(p.checklist || []), ...added.map(t => ({ taskId: t.id, text: t.title }))]
    };
  });
  clearTimeout(freshnessTimer);
  let nextExpiry = Infinity;
  for (const p of pathways) {
    const checked = checkedTime(p, db.asOf);
    if (!Number.isFinite(checked)) continue;
    const expiry = checked + freshWindow;
    p.criteriaMet.recent = Date.now() >= checked && Date.now() < expiry;
    if (p.criteriaMet.recent) nextExpiry = Math.min(nextExpiry, expiry);
  }
  if (Number.isFinite(nextExpiry)) freshnessTimer = setTimeout(() => { reindex(); refresh(); }, Math.max(1, nextExpiry - Date.now() + 10));
  records = new Map(db.records.map(r => [r.id, r]));
  tasks = [...db.tasks, ...edits.newTasks.filter(t => t?.id && t.title && pBy(t.pathway))].map(t => ({ ...t, status: Object.hasOwn(statuses, edits.status[t.id]) ? edits.status[t.id] : Object.hasOwn(statuses, t.status) ? t.status : t.status === 'completed' ? 'done' : 'open' }));
}
const pBy = id => pathways.find(p => p.id === id);
const tBy = id => tasks.find(t => t.id === id);
const pathTasks = p => (p.checklist || []).map(c => tBy(c.taskId)).filter(Boolean);
const pathRecords = p => (p.linkedEvidence || []).map(id => records.get(id)).filter(r => r && recordType(r) !== 'Tasks');
const related = (id) => pathways.filter(p => (p.linkedEvidence || []).includes(id) || (p.checklist || []).some(t => t.taskId === id));
const pathText = p => [p.id, p.title, p.org, p.condition, p.stage, presentation(p, seed).title, ...(p.contributions || [])].join(' ').toLowerCase();
const recordText = r => [r.id, r.originalId, r.title, r.publisher, r.summary, r.kind, r.status, ...(r.tags || [])].join(' ').toLowerCase();
const taskText = t => [t.id, t.title, t.type, t.summary, t.instructions, ...related(t.id).map(p => p.title)].join(' ').toLowerCase();
const openTasks = () => tasks.filter(t => t.status !== 'done');
const readyPaths = () => pathways.filter(p => ready(p, db.asOf));
function counts() { return { help: readyPaths().length, pathways: pathways.length, tasks: openTasks().length, evidence: records.size }; }
function parseRoute() {
  const rawHash = location.hash && location.hash !== '#main' ? location.hash.slice(1) : '';
  const sourcePath = rawHash || location.pathname;
  const tokens = sourcePath.split('/').filter(Boolean).map(s => { try { return decodeURIComponent(s); } catch { return ''; } });
  const head = tokens[0] === 'evidence-room' ? 'evidence' : tokens[0];
  const section = ['pathways', 'tasks', 'evidence'].includes(head) ? head : 'pathways';
  const stack = [];
  for (let i = 1; i < tokens.length; i++) {
    const kind = tokens[i];
    if (['p', 't', 'r'].includes(kind)) { if (!tokens[i + 1]) break; stack.push({ kind, id: tokens[++i] }); }
    else if (['about', 'menu', 'chapter', 'search', 'filters', 'views', 'new', 'update', 'addtask'].includes(kind)) { stack.push({ kind }); }
    else break;
  }
  const toPath = s => section + s.map(x => '/' + x.kind + (x.id ? '/' + segment(x.id) : '')).join('');
  return { section, stack, top: stack.at(-1), hash: toPath(stack), parent: toPath(stack.slice(0, -1)) };
}
function child(kind, id) { return route.hash + '/' + kind + (id ? '/' + segment(id) : ''); }
function go(path, { replace = false } = {}) {
  const nextPath = path.replace(/^\/+/, '');
  if (nextPath === route?.hash && !location.hash) return;
  const current = route?.hash || 'pathways';
  const parentDistance = route?.top ? history.state?.closeDistance : 0;
  const enteringPanel = nextPath.startsWith(route.section + '/');
  const closeDistance = enteringPanel && Number.isInteger(parentDistance) ? parentDistance + (replace ? 0 : 1) : null;
  history[replace ? 'replaceState' : 'pushState']({ crossPrev: replace ? history.state?.crossPrev : current, closeDistance }, '', '/workspace.html#' + nextPath);
  render();
}
function popPanel() {
  if (!route.top) return;
  if (history.state?.crossPrev === route.parent) history.back();
  else go(route.parent, { replace: true });
}
function refresh() { dirty = true; render(); }
function navHTML() {
  const countsMap = counts();
  const labels = { pathways: 'Pathways', tasks: 'Tasks', evidence: 'Evidence' };
  return join(['pathways', 'tasks', 'evidence'].map(key => inLink(key, esc(labels[key]) + ' <span>' + esc(countsMap[key]) + '</span>', 'work-tab ' + (route.section === key ? 'selected' : ''), (route.section === key ? 'aria-current="page"' : ''))));
}
function hero() {
  return '<section class="hero" aria-labelledby="workspace-title"><div class="hero-image"></div><div class="hero-grid" aria-hidden="true"></div><div class="hero-inner"><span class="focus-line">SEE CLEARLY. ACT LOCALLY.</span><h1 id="workspace-title" tabindex="-1">Pathway tracker</h1><p>How Crossover develops pathways to meet needs in Stockton.</p></div><div class="city-caption">' + icon('focus', 14) + 'Stockton skyline</div></section>';
}
function groupTitle(text, actions = '') { return '<div class="group-title"><h2>' + esc(text) + '</h2>' + actions + '</div>'; }
function layoutTools() {
  const v = getView();
  const n = Number(filter.stage !== 'All') + Number(filter.contrib !== 'All') + Number(!!filter.text);
  const options = join(Object.entries(views).map(([id, name]) => button(icon(viewIcons[id], 17) + '<span>' + name + '</span>', 'data-view="' + id + '" aria-label="' + name + ' view" title="' + name + ' view" aria-pressed="' + (v === id) + '"', 'layout-choice ' + (v === id ? 'chosen' : ''))));
  return '<details class="advanced-tools"><summary>Filters and layout' + (n ? ' (' + n + ')' : '') + '</summary><div class="layout-tools">' + button(icon('filter', 17) + '<span>Filter investigations</span>', 'data-overlay="filters" aria-label="Filter investigations"', 'btn filter-btn ' + (n ? 'applied' : '')) + '<div class="view-switch" role="group" aria-label="Investigation layout">' + options + '</div>' + button(icon(viewIcons[v], 19) + '<span>Change layout</span>', 'data-overlay="views" aria-label="Change layout"', 'btn mobile-view') + button(icon('plus', 18) + '<span>New investigation</span>', 'data-overlay="new" aria-label="New investigation"', 'btn add-btn') + '</div></details>';
}
function nextCheckHTML(p) {
  const steps = p.actionDetails?.howToHelp?.trim();
  if (p.stage === 'Established' && steps) return '<p class="pc-next"><span class="pc-next-label">Recorded steps</span>' + esc(steps) + '</p>';
  if (steps) return '<p class="pc-next"><span class="pc-next-label">Next check</span>' + esc(steps) + '</p>';
  return '<p class="pc-next"><span class="pc-next-label">Current condition</span>' + esc(p.condition || 'No field check recorded yet.') + '</p>';
}
function pathCard(p, variant = 'card') {
  const c = presentation(p, seed), tasksCount = pathTasks(p).length, evidenceCount = pathRecords(p).length;
  const pic = c.image ? '<img src="/assets/' + c.image + '.webp" alt="" loading="lazy" class="img-' + c.image + '">' : '<div class="unknown-photo">' + icon('route', 38) + '</div>';
  const meta = '<span>' + icon('clipboard', 15) + plural(tasksCount, 'task') + '</span><span>' + icon('files', 15) + plural(evidenceCount, 'record') + '</span>';
  const url = child('p', p.id);
  const nextLine = (variant === 'list-card' || variant === 'mini') ? nextCheckHTML(p) : '';
  return inLink(url, '<div class="pc-photo">' + pic + '</div><div class="pc-content"><div class="pc-kicker">' + badge(p.stage) + '<span class="id">' + esc(p.id) + '</span></div><h3>' + esc(c.title) + '</h3><div class="pc-org">' + esc(p.org) + '</div><p class="pc-summary">' + esc(c.summary) + '</p>' + nextLine + '</div><div class="pc-foot"><div class="pc-meta">' + meta + '</div><span class="chevron">' + icon('right', 17) + '</span></div>', 'path-card ' + variant, 'aria-label="' + esc(c.title + ', ' + p.stage + ', ' + plural(tasksCount, 'task') + ', ' + plural(evidenceCount, 'record')) + '"');
}
function empty(iconName, title, copy, action = '') {
  return '<div class="empty"><span class="empty-symbol">' + icon(iconName, 25) + '</span><h3>' + esc(title) + '</h3><p>' + esc(copy) + '</p>' + action + '</div>';
}
function boardHTML(filtered) {
  const tabs = '<div class="board-stage-picker"><label for="board-stage">Board stage</label><div class="select-wrap"><select id="board-stage">' + join(stageNames.map(s => '<option ' + (s === boardStage ? 'selected' : '') + ' value="' + s + '">' + s + ' · ' + filtered.filter(p => p.stage === s).length + '</option>')) + '</select>' + icon('down', 16) + '</div></div>';
  const cols = stageNames.map(s => {
    const matches = filtered.filter(p => p.stage === s);
    return '<section class="board-col ' + (s === boardStage ? 'mobile-on' : '') + '"><div class="col-head">' + badge(s) + '<span>' + matches.length + '</span></div>' + (matches.length ? join(matches.map(p => pathCard(p, 'mini'))) : '<div class="col-empty">No ' + s.toLowerCase() + ' pathways</div>') + '</section>';
  });
  return '<div class="board-area">' + tabs + '<div class="kanban">' + join(cols) + '</div></div>';
}
function filterTags() {
  const active = [filter.stage !== 'All' ? filter.stage : '', filter.contrib !== 'All' ? filter.contrib : '', filter.text ? '“' + filter.text + '”' : ''].filter(Boolean);
  return active.length ? '<div class="active-filters"><span>Filtered by</span>' + join(active.map(x => '<b>' + esc(x) + '</b>')) + button('Clear', 'data-action="clear-filters"', 'link-button') + '</div>' : '';
}
function taskRow(t, compact = false) {
  const p = related(t.id)[0];
  return inLink(child('t', t.id), '<span class="row-icon task-icon ' + esc(t.status) + '">' + icon(taskIcons[t.status], 20) + '</span><span class="row-body"><strong>' + esc(t.title) + '</strong><small>' + esc(compact ? (typeNames[t.type] || displayKind(t.type)) : (p?.org || 'Crossover Stockton')) + '</small></span>' + (compact ? '' : '<span class="row-extra">' + statusBadge(t.status) + '</span>') + icon('right', 16), 'data-row');
}
function recordRow(r, compact = false) {
  const category = recordType(r), date = prettyDate(r.date, compact);
  return inLink(child('r', r.id), '<span class="row-icon record-icon">' + icon(typeIcon(category), 19) + '</span><span class="row-body"><strong>' + esc(r.title) + '</strong><small>' + esc(compact ? r.publisher : r.id + ' · ' + r.publisher) + '</small></span><span class="row-date">' + esc(date) + '</span>' + icon('right', 16), 'data-row');
}
function secondaryPanels() {
  const tt = openTasks().sort((a, b) => (a.status === 'in_progress' ? -1 : 0) - (b.status === 'in_progress' ? -1 : 0)).slice(0, 3);
  const rr = newest(db.records.filter(r => recordType(r) !== 'Tasks')).slice(0, 3);
  return '<div class="secondary-grid"><section class="work-panel">' + groupTitle('Open tasks', inLink('tasks', 'View tasks', 'panel-link')) + (tt.length ? join(tt.map(t => taskRow(t, true))) : '<p class="panel-empty">All tasks are complete.</p>') + '</section><section class="work-panel">' + groupTitle('Latest evidence', inLink('evidence', 'View evidence', 'panel-link')) + (rr.length ? join(rr.map(r => recordRow(r, true))) : '<p class="panel-empty">No records yet.</p>') + '</section></div>';
}
function renderPathways() {
  const list = pathways.map(p => {
    const c = presentation(p, seed), tasksCount = pathTasks(p).length, evidenceCount = pathRecords(p).length;
    return inLink(child('p', p.id),
      '<div class="pc-content"><div class="pc-kicker">' + badge(p.stage) + '<span class="id">' + esc(p.id) + '</span></div><h3>' + esc(c.title) + '</h3><div class="pc-org">' + esc(p.org) + '</div><p class="pc-summary">' + esc(c.summary) + '</p>' + nextCheckHTML(p) + '</div><div class="pc-foot"><div class="pc-meta"><span>' + icon('clipboard', 15) + plural(tasksCount, 'task') + '</span><span>' + icon('files', 15) + plural(evidenceCount, 'record') + '</span></div><span class="chevron">' + icon('right', 17) + '</span></div>',
      'path-card');
  });
  return sectionHead('Stockton', 'Pathways', 'Ways to make a difference we are checking in Stockton. Tap a pathway to see what we’ve tried, what’s next, and the evidence behind it.', 'route') +
    '<section class="path-section" aria-labelledby="track-title"><h2 id="track-title" class="sr">Tracked pathways</h2><div class="simple-list">' + join(list) + '</div>' +
    '<div class="simple-link-group">' +
      inLink('tasks', 'Tasks <span>(' + openTasks().length + ')</span> →', 'simple-link') +
      inLink('evidence', 'Evidence <span>(' + records.size + ')</span> →', 'simple-link') +
    '</div></section>';
}
function sectionHead(over, title, desc, iconName) {
  return '<div class="section-head"><div class="section-symbol">' + icon(iconName, 24) + '</div><div><p class="section-over">' + esc(over) + '</p><h1 tabindex="-1">' + esc(title) + '</h1><p class="lead">' + esc(desc) + '</p></div></div>';
}
function searchField(id, value, label) {
  return '<label class="search-field">' + icon('search', 18) + '<input id="' + id + '" type="search" value="' + esc(value) + '" placeholder="' + esc(label) + '" aria-label="' + esc(label) + '"></label>';
}
function selectBox(id, label, entries, value) {
  return '<label class="select-wrap"><span class="sr">' + esc(label) + '</span><select id="' + id + '" aria-label="' + esc(label) + '">' + join(entries.map(([k, l]) => '<option value="' + esc(k) + '" ' + (k === value ? 'selected' : '') + '>' + esc(l) + '</option>')) + '</select>' + icon('down', 16) + '</label>';
}
function taskResults() {
  const tt = tasks.filter(t => (taskFilter === 'all' || t.status === taskFilter) && taskText(t).includes(taskQuery.trim().toLowerCase())).sort((a, b) => (a.status === 'in_progress' ? -1 : 0) - (b.status === 'in_progress' ? -1 : 0));
  return '<p class="result-label">' + plural(tt.length, 'task') + '</p>' + (tt.length ? '<div class="table-list">' + join(tt.map(t => taskRow(t))) + '</div>' : empty('tasks', 'No matching tasks', 'Try a different status or search term.', button('Clear search and status', 'data-action="clear-task"')));
}
function tasksPage() {
  return sectionHead('The next checks', 'Tasks', 'Simple calls, visits, and record checks still needed to learn whether a pathway works.', 'clipboard') +
    '<div class="data-tools">' + searchField('task-q', taskQuery, 'Search tasks') + '</div>' +
    '<div id="task-results">' + taskResults() + '</div>' +
    '<div class="simple-link-group">' +
      inLink('pathways', 'Pathways <span>(' + pathways.length + ')</span> →', 'simple-link') +
      inLink('evidence', 'Evidence <span>(' + records.size + ')</span> →', 'simple-link') +
    '</div>';
}
function recordResults() {
  const rr = newest(db.records.filter(r => (evidenceFilter === 'All' || recordType(r) === evidenceFilter) && recordText(r).includes(evidenceQuery.trim().toLowerCase())));
  return '<p class="result-label">' + plural(rr.length, 'record') + '</p>' + (rr.length ? '<div class="table-list">' + join(rr.map(r => recordRow(r))) + '</div>' : empty('files', 'No matching evidence', 'Try a different record type, agency, or keyword.', button('Clear search and type', 'data-action="clear-record"')));
}
function evidencePage() {
  return sectionHead('How we know', 'Evidence', 'Public documents, observations, and work plans behind our pathways.', 'files') +
    '<div class="data-tools">' + searchField('record-q', evidenceQuery, 'Search by title, agency, or record ID') + selectBox('record-filter', 'Filter records by type', [['All', 'All types'], ['Records', 'Records'], ['Activities', 'Activities'], ['Tasks', 'Tasks']], evidenceFilter) + '</div>' +
    '<div id="record-results">' + recordResults() + '</div>' +
    '<div class="simple-link-group">' +
      inLink('pathways', 'Pathways <span>(' + pathways.length + ')</span> →', 'simple-link') +
      inLink('tasks', 'Tasks <span>(' + openTasks().length + ')</span> →', 'simple-link') +
    '</div>';
}
function panelTop(eyebrow, title, subtitle = '') {
  return '<div class="panel-top"><span class="overline">' + esc(eyebrow) + '</span><h2 id="panel-title" tabindex="-1">' + esc(title) + '</h2>' + (subtitle ? '<p>' + esc(subtitle) + '</p>' : '') + '</div>';
}
const block = (title, inside) => '<section class="detail-block"><h3>' + esc(title) + '</h3>' + inside + '</section>';
const para = s => '<p>' + esc(s) + '</p>';
function facts(pairs) {
  const rows = pairs.filter(([, v]) => v && v !== 'To be confirmed' && v !== 'Not yet confirmed');
  return rows.length ? '<dl class="facts">' + join(rows.map(([k, v]) => '<div><dt>' + esc(k) + '</dt><dd>' + esc(v) + '</dd></div>')) + '</dl>' : '';
}
function detailPath(p) {
  const c = presentation(p, seed), rr = pathRecords(p), tt = pathTasks(p), a = p.actionDetails || {};
  const official = records.get(c.official)?.sourceUrl;
  const notes = edits.notes[p.id] || [];
  const logs = (p.logs || []).map(l => '<div class="field-note"><small>' + esc([l.timestamp, l.author].filter(Boolean).join(' · ')) + '</small>' + para(l.note) + '</div>');
  const criteria = db.config.confidenceCriteria;
  const sc = score(p, db.config);
  return panelTop('Pathway · ' + p.id, p.title, p.org) +
    '<div class="detail-tags">' + badge(p.stage) + join((p.contributions || []).map(x => '<span class="plain-tag">' + esc(x) + '</span>')) + '</div>' +
    '<div class="path-actions">' + inLink(child('update'), 'Update pathway', 'btn') + inLink(child('addtask'), icon('plus', 15) + 'Add task', 'btn') + '</div>' +
    block('Current condition', para(p.condition || 'No field check recorded yet.')) +
    (a.howToHelp ? block(p.stage === 'Established' ? 'How to help' : 'Next step', para(a.howToHelp)) : '') +
    facts([['Location', a.where], ['When', a.when], ['Bring', a.bring], ['Contact', a.phone], ['Availability checked', p.availabilityCheckedAt ? prettyDate(p.availabilityCheckedAt) : '']]) +
    (official ? external(official, 'Official organization page') : '') +
    block('Tasks · ' + tt.length, tt.length ? '<div class="inset-list">' + join(tt.map(t => taskRow(t))) + '</div>' : para('No tasks are linked to this pathway.')) +
    block('Evidence · ' + rr.length, rr.length ? '<div class="inset-list">' + join(rr.map(r => recordRow(r, true))) + '</div>' : para('No evidence is linked yet.')) +
    '<details class="detail-fold"><summary>Evidence confidence <b>' + sc + '/100</b></summary><div class="fold-content"><p>The score reflects the checks recorded for this pathway.</p>' + join(criteria.map(x => '<div class="criterion">' + icon(p.criteriaMet?.[x.key] ? 'checkcircle' : 'circle', 18) + '<span>' + esc(x.label) + '</span><b>' + (p.criteriaMet?.[x.key] ? x.points : 0) + '/' + x.points + '</b></div>')) + '</div></details>' +
    block('Field notes', join(logs) + '<p class="subtle">Your notes are saved in this browser.</p>' + join(notes.map(n => '<div class="field-note"><small>' + esc(prettyDate(n.date)) + '</small>' + para(n.text) + '</div>')) + '<form id="note-form"><label class="sr" for="field-note">Field note</label><textarea id="field-note" name="note" required maxlength="2000" rows="2" placeholder="Record an observation or follow-up…"></textarea><button class="btn" type="submit">Save note</button></form>');
}
function detailTask(t) {
  const pp = related(t.id), rr = t.basis.map(id => records.get(id)).filter(Boolean);
  return panelTop('Task · ' + t.id, t.title, typeNames[t.type] || displayKind(t.type)) +
    '<div class="task-editor"><div><label for="task-state">Task status</label><small>Changes are saved in this browser.</small></div>' + selectBox('task-state', 'Task status', Object.entries(statuses), t.status) + '</div>' +
    (t.summary ? block('Context', para(t.summary)) : '') + (t.instructions ? block('What to do', para(t.instructions)) : '') +
    (t.started ? facts([['Started', prettyDate(t.started)]]) : '') +
    (pp.length ? block('Linked pathways', '<div class="inset-list">' + join(pp.map(p => miniPath(p))) + '</div>') : '') +
    (rr.length ? block('Supporting evidence', '<div class="inset-list">' + join(rr.map(r => recordRow(r, true))) + '</div>') : '') +
    (records.has(t.id) ? inLink(child('r', t.id), 'Open task record', 'text-link') : '');
}
function miniPath(p) {
  return inLink(child('p', p.id), '<span class="row-icon">' + icon('route', 19) + '</span><span class="row-body"><strong>' + esc(presentation(p, seed).title) + '</strong><small>' + esc(p.org) + '</small></span>' + badge(p.stage) + icon('right', 15), 'data-row');
}
function detailRecord(r) {
  const pp = related(r.id), t = tBy(r.id);
  const rows = (r.rows || []).filter(x => x.value !== r.summary);
  return panelTop(recordType(r) + ' · ' + r.id, r.title, r.publisher) +
    '<div class="detail-tags"><span class="plain-tag">' + esc(displayKind(r.kind)) + '</span><span class="plain-tag">' + esc(displayKind(r.status)) + '</span></div>' +
    facts([['Record date', prettyDate(r.date)], ['Last checked', prettyDate(r.checked)], ['Artifact', r.artifact]]) +
    block('What the record says', para(r.summary)) +
    (r.limits ? block('Limits of this evidence', para(r.limits)) : '') +
    (cleanURL(r.sourceUrl) ? external(r.sourceUrl, r.sourceLabel || 'Open original source', 'btn source-btn') : '') +
    (rows.length ? '<details class="detail-fold"><summary>Record details <b>' + rows.length + '</b></summary><div class="fold-content">' + join(rows.map(x => '<div class="record-field"><h4>' + esc(x.label) + '</h4>' + para(String(x.value ?? '') + (x.unit ? ' ' + x.unit : '')) + (x.note ? '<small>' + esc(x.note) + '</small>' : '') + '</div>')) + '</div></details>' : '') +
    (r.custody?.length ? '<details class="detail-fold"><summary>Source history</summary><ul>' + join(r.custody.map(s => '<li>' + esc(typeof s === 'string' ? s : s.action || '') + '</li>')) + '</ul></details>' : '') +
    (pp.length ? block('Linked pathways', '<div class="inset-list">' + join(pp.map(p => miniPath(p))) + '</div>') : '') +
    (t ? block('Related task', taskRow(t)) : '');
}
function choices(name, legend, values, selected) {
  return '<fieldset class="radio-set"><legend>' + esc(legend) + '</legend>' + join(values.map(v => '<label><input type="radio" name="' + name + '" value="' + esc(v) + '" ' + (selected === v ? 'checked' : '') + '><span>' + esc(v) + '</span></label>')) + '</fieldset>';
}
function filterPanel() {
  const contrib = [...new Set([...(db.config.contributions || []), ...pathways.flatMap(p => p.contributions || [])])].filter(v => v !== 'All');
  return panelTop('Pathways', 'Filter pathways') + '<form id="filters-form">' + searchField('path-filter-q', filter.text, 'Search pathways') + choices('stage', 'Pathway stage', ['All', ...stageNames], filter.stage) + choices('contrib', 'Contribution', ['All', ...contrib], filter.contrib) + '<div class="form-actions"><button type="button" class="btn" data-action="clear-filters">Clear filters</button><button type="submit" class="btn primary">Apply filters</button></div></form>';
}
function parentPath() {
  const x = route.stack.slice(0, -1).reverse().find(x => x.kind === 'p'); return x ? pBy(x.id) : null;
}
function updatePanel() {
  const p = parentPath();
  if (!p) return panelTop('Pathways', 'Pathway unavailable');
  const checked = (p.linkedEvidence || []).filter(id => records.has(id) && recordType(records.get(id)) !== 'Tasks');
  const checks = join(db.config.confidenceCriteria.filter(c => c.key !== 'recent').map(c => '<label><input type="checkbox" name="criterion" value="' + esc(c.key) + '" ' + (p.criteriaMet?.[c.key] ? 'checked' : '') + '><span>' + esc(c.label) + '</span></label>'));
  return panelTop(p.id, 'Update pathway', 'Record what you have learned. Changes are saved in this browser.') + '<form id="update-form" class="stack-form">' +
    '<label for="edit-stage">Pathway stage</label>' + selectBox('edit-stage', 'Pathway stage', stageNames.map(s => [s, s]), p.stage) +
    '<label>Current condition<textarea required name="condition" rows="3" maxlength="2500">' + esc(p.condition) + '</textarea></label>' +
    '<label>Participation steps or next check<textarea name="steps" rows="3" maxlength="2500">' + esc(p.actionDetails?.howToHelp) + '</textarea></label>' +
    '<fieldset class="check-set"><legend>Evidence checks</legend>' + checks +
    '<label><input type="checkbox" name="checkedNow"><span>I checked availability now</span></label></fieldset>' +
    (p.availabilityCheckedAt ? '<p class="subtle">Last availability check · ' + esc(prettyDate(p.availabilityCheckedAt)) + '</p>' : '') +
    '<label for="edit-evidence">Link an evidence record</label>' + selectBox('edit-evidence', 'Link an evidence record', [['', 'Choose a record (optional)'], ...newest(db.records.filter(r => recordType(r) !== 'Tasks' && !checked.includes(r.id))).map(r => [r.id, r.title])], '') +
    '<p class="form-hint">Help today requires a recent availability check, clear steps, and firsthand completion or organization confirmation.</p>' +
    '<p id="update-error" class="form-error" role="alert" tabindex="-1"></p><div class="form-actions"><button type="button" class="btn" data-action="back">Cancel</button><button class="btn primary" type="submit">Save update</button></div></form>';
}
function addTaskPanel() {
  const p = parentPath();
  return panelTop('Fieldwork', 'New task', 'Give the next check a pathway to report back to. It will be saved in this browser.') +
    '<form id="new-task-form" class="stack-form"><label>Task title<input name="title" maxlength="160" required placeholder="What needs to be checked?"></label><label for="task-path">Pathway</label>' + selectBox('task-path', 'Pathway', pathways.map(x => [x.id, presentation(x, seed).title]), p?.id || pathways[0]?.id) +
    '<label for="task-type">Type</label>' + selectBox('task-type', 'Task type', Object.entries(typeNames), 'follow_up') +
    '<label>Notes or instructions<textarea name="details" rows="3" maxlength="2000"></textarea></label><div class="form-actions"><button type="button" class="btn" data-action="back">Cancel</button><button class="btn primary" type="submit">Create task</button></div></form>';
}
function viewPanel() {
  return panelTop('Pathways', 'Choose a layout') + '<div class="inset-list">' + join(Object.entries(views).map(([id, name]) => button('<span class="row-icon">' + icon(viewIcons[id], 20) + '</span><span class="row-body"><strong>' + name + '</strong><small>' + ({ cards: 'Photographs and pathway summaries', list: 'A compact row for each pathway', board: 'Pathways grouped by stage' }[id]) + '</small></span>' + (getView() === id ? icon('check', 19) : ''), 'data-view="' + id + '" aria-pressed="' + (getView() === id) + '"', 'data-row'))) + '</div>';
}
function newPanel() {
  return panelTop('Pathways', 'New pathway', 'Add a candidate to explore. It will be saved in this browser.') + '<form id="candidate-form" class="stack-form"><label>Pathway title<input name="title" required maxlength="120" placeholder="What could someone do?"></label><label>Organization or area<input name="org" required maxlength="90" placeholder="Who or where?"></label><label for="new-contrib">Contribution</label>' + selectBox('new-contrib', 'Contribution', (db.config.contributions || []).filter(c => c !== 'All').map(c => [c, c]), (db.config.contributions || [])[1]) + '<label>What needs checking?<textarea name="condition" required rows="3" maxlength="1500" placeholder="Describe the lead and the next check."></textarea></label><div class="new-stage"><span>Initial stage</span>' + badge('Exploring') + '</div><div class="form-actions"><button type="button" class="btn" data-action="back">Cancel</button><button type="submit" class="btn primary">Create pathway</button></div></form>';
}
function searchHits() {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return '<h3 class="search-group-title">Tracked pathways</h3>' + join(pathways.slice(0, 6).map(miniPath));
  const pp = pathways.filter(p => pathText(p).includes(q));
  const tt = tasks.filter(t => taskText(t).includes(q));
  const rr = newest(db.records.filter(r => recordText(r).includes(q)));
  if (!pp.length && !tt.length && !rr.length) return empty('search', 'No results', 'Try a pathway, organization, task, or record ID.');
  return join([['Pathways', pp, miniPath], ['Tasks', tt, t => taskRow(t, true)], ['Evidence', rr, r => recordRow(r, true)]].filter(([, arr]) => arr.length).map(([label, arr, fn]) => '<h3 class="search-group-title">' + label + ' <span>' + arr.length + '</span></h3>' + join(arr.map(fn))));
}
function searchPanel() { return panelTop('Workspace', 'Search Crossover') + searchField('global-q', searchQuery, 'Pathway, task, agency, or record ID') + '<div id="search-hits" aria-live="polite">' + searchHits() + '</div>'; }
function menuPanel() {
  return panelTop('Crossover Stockton', 'Menu', 'Navigation & links') +
    block('More', '<div class="inset-list">' +
      inLink(child('about'), '<span class="row-icon">' + icon('book', 18) + '</span><span class="row-body"><strong>About &amp; methodology</strong><small>How Crossover verifies pathways</small></span>' + icon('right', 16), 'data-row') +
      '<a class="data-row" href="https://www.linkedin.com/in/jeff-kolyer" target="_blank" rel="noopener noreferrer"><span class="row-icon">' + icon('link', 18) + '</span><span class="row-body"><strong>Connect on LinkedIn</strong><small>linkedin.com/in/jeff-kolyer</small></span>' + icon('right', 16) + '</a>' +
    '</div>');
}
function chapterPanel() {
  return panelTop('Location', 'Stockton, California', 'Active Crossover chapter') + '<div class="chapter-active"><span class="row-icon">' + icon('pin', 21) + '</span><div><strong>Stockton, CA</strong><small>Investigating unmet needs &amp; ways to help</small></div>' + icon('checkcircle', 19) + '</div>';
}
function aboutPanel() {
  return panelTop('Crossover Stockton', 'About & methodology') +
    para('This is Crossover’s working board for Stockton. Each pathway is a practical way to meet a need. We record what we’ve tried, what the evidence supports, and what to check next.') +
    block('Pathway stages', '<div class="stage-guide">' + join(stageNames.map(s => '<div>' + badge(s) + para(stages[s]) + '</div>')) + '</div>') +
    block('Help Today', para('A route appears in Help Today when it is established, has clear instructions, and has been confirmed by the organization or completed firsthand. Availability must have been checked within the last 48 hours.')) +
    block('Evidence confidence', '<div class="criteria-list">' + join(db.config.confidenceCriteria.map(c => '<div><span>' + esc(c.label) + '</span><b>' + c.points + ' points</b></div>')) + '</div>') +
    block('Tracker source', para('Pathways, tasks, and evidence come from the Crossover Stockton repository. Pathway updates, tasks, and field notes you add are kept in this browser.') + '<div class="source-line">' + external(repo, 'Source repository') + external(repo + '/tree/' + db.sha, 'Source revision ' + db.sha.slice(0, 7)) + '<span>' + esc(prettyDate(db.asOf)) + '</span></div>' + button(sourceBusy ? 'Checking…' : 'Refresh from GitHub', 'data-action="source-refresh" ' + (sourceBusy ? 'disabled' : ''), 'btn') + '<p id="source-status" role="status" class="subtle">' + esc(syncState) + '</p>') +
    block('LinkedIn', para('Follow field updates and get in touch on LinkedIn.') + external('https://www.linkedin.com/in/jeff-kolyer', 'Connect on LinkedIn')) +
    block('Images', para('The banner uses a cropped, color-treated Stockton skyline photograph by Quintin Soloviev. Pathway photographs are illustrations from the Crossover repository.') + '<div class="credit-links">' + external('https://commons.wikimedia.org/wiki/File:Stockton,_CA.jpg', 'Stockton, CA.jpg') + external('https://creativecommons.org/licenses/by/4.0/', 'CC BY 4.0') + '</div>');
}
function panelBody() {
  const { kind, id } = route.top;
  if (kind === 'p' && pBy(id)) return detailPath(pBy(id));
  if (kind === 't' && tBy(id)) return detailTask(tBy(id));
  if (kind === 'r' && records.has(id)) return detailRecord(records.get(id));
  const fn = { about: aboutPanel, menu: menuPanel, chapter: chapterPanel, search: searchPanel, filters: filterPanel, views: viewPanel, new: newPanel, update: updatePanel, addtask: addTaskPanel }[kind];
  return fn ? fn() : panelTop('Workspace', 'Item unavailable', 'This item does not appear in the current source records.') + button('Return to workspace', 'data-action="close"');
}
function showPanel() {
  if (!showingDetail) {
    openerHref = document.activeElement?.getAttribute?.('href') || '';
    sectionScroll = window.scrollY;
    showingDetail = true;
  }
  const kind = route.top.kind;
  const back = button(icon('back', 16) + '<span>Back</span>', 'data-action="back"', 'panel-back');
  const close = button(icon('close', 20), 'data-action="close" aria-label="Close" title="Close"', 'icon-button');
  $('#page').innerHTML = '<article id="panel" class="detail-page"><div class="dialog-bar">' + back + close + '</div><div class="dialog-body">' + panelBody() + '</div></article>';
  const target = kind === 'search' ? $('#global-q') : $('#panel-title');
  target?.focus({ preventScroll: true });
  const nextY = panelScroll.get(route.hash) || 0;
  window.scrollTo(0, nextY);
}
function render() {
  if (!db) return;
  const next = parseRoute();
  if (showingDetail && lastRoute !== next.hash) panelScroll.set(lastRoute, window.scrollY);
  const change = next.section !== renderedSection;
  route = next;
  if (change || dirty || showingDetail !== Boolean(route.top)) {
    $('#work-tabs').innerHTML = navHTML();
  }
  if (route.top) {
    showPanel();
    renderedSection = route.section; dirty = false;
  } else {
    const returning = showingDetail;
    if (change || dirty || returning) {
      $('#page').innerHTML = ({ pathways: renderPathways, tasks: tasksPage, evidence: evidencePage }[route.section])();
      renderedSection = route.section; dirty = false;
    }
    if (returning) {
      showingDetail = false;
      window.scrollTo(0, sectionScroll);
      requestAnimationFrame(() => window.scrollTo(0, sectionScroll));
      setTimeout(() => window.scrollTo(0, sectionScroll), 0);
      const openerEl = openerHref ? $('#page a[href="' + CSS.escape(openerHref) + '"]') : null;
      if (openerEl) openerEl.focus({ preventScroll: true });
      else ($('#page h1, #page h2') || $('#main')).focus({ preventScroll: true });
      panelScroll.clear();
    } else if (change) {
      window.scrollTo(0, 0);
    }
  }
  document.title = (route.top && $('#panel-title') ? $('#panel-title').textContent : sections[route.section]) + ' · Crossover Stockton';
  lastRoute = route.hash;
}
function storeWork(update) {
  const current = safeGet(editKey) ? readEdits() : edits;
  update(current);
  edits = current;
  const saved = save(editKey, edits);
  reindex(); dirty = true;
  return saved;
}
function clearFilters() { filter.stage = 'All'; filter.contrib = 'All'; filter.text = ''; }
function selectView(v) {
  if (!Object.hasOwn(views, v)) return;
  prefs.view = v; save(prefKey, prefs);
  if (v === 'board' && filter.stage !== 'All') boardStage = filter.stage;
  dirty = true;
  if (route.top?.kind === 'views') popPanel(); else render();
}
async function refreshSource() {
  if (sourceBusy) return;
  sourceBusy = true; syncState = 'Checking the source repository…';
  render();
  const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const next = await checkRepository(db, controller.signal);
    if (next.sha === db.sha) syncState = 'The tracker matches the latest repository revision.';
    else {
      db = next; const cached = save(cachedKey, db); reindex(); dirty = true;
      syncState = cached ? 'Loaded the latest revision and saved a copy in this browser.' : 'Loaded the latest revision for this session.';
    }
  } catch { syncState = 'The repository could not be reached. The loaded records are available.'; }
  finally { clearTimeout(timeout); sourceBusy = false; render(); }
}
document.addEventListener('click', e => {
  const menuBtn = e.target instanceof Element ? e.target.closest('.menu-button') : null;
  if (menuBtn) {
    const nav = $('.public-nav');
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    return;
  }
  if (!db || !(e.target instanceof Element)) return;
  const el = e.target.closest('button,a');
  if (!el) return;
  if (el.id === 'find') { searchQuery = ''; go(child('search')); return; }
  if (el.id === 'menu') { go(child('menu')); return; }
  if (el.id === 'chapter') { go(child('chapter')); return; }
  if (el.dataset.overlay) { if (el.dataset.overlay === 'search') searchQuery = ''; go(child(el.dataset.overlay)); return; }
  if (el.dataset.view) { selectView(el.dataset.view); return; }
  const a = el.dataset.action;
  if (a === 'back') { popPanel(); return; }
  if (a === 'close') {
    if (Number.isInteger(history.state?.closeDistance) && history.state.closeDistance > 0) history.go(-history.state.closeDistance); else if (route.stack.length === 1) popPanel(); else go(route.section, { replace: true }); return;
  }
  if (a === 'clear-filters') { clearFilters(); dirty = true; if (route.top?.kind === 'filters') popPanel(); else render(); return; }
  if (a === 'clear-task') { taskQuery = ''; taskFilter = 'all'; refresh(); return; }
  if (a === 'clear-record') { evidenceQuery = ''; evidenceFilter = 'All'; refresh(); return; }
  if (a === 'source-refresh') { void refreshSource(); return; }
  if (el.matches('a[href="#main"]') && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
    e.preventDefault(); $('#main').focus(); return;
  }
  if (el.matches('a[href^="#"]') && !el.target && !el.hasAttribute('download') && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
    const dest = el.getAttribute('href').replace(/^[#/]+/, '');
    e.preventDefault(); go(dest);
  }
});
document.addEventListener('input', e => {
  const el = e.target;
  if (el.id === 'task-q') { taskQuery = el.value; $('#task-results').innerHTML = taskResults(); }
  if (el.id === 'record-q') { evidenceQuery = el.value; $('#record-results').innerHTML = recordResults(); }
  if (el.id === 'global-q') { searchQuery = el.value; $('#search-hits').innerHTML = searchHits(); }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.id === 'task-filter') { taskFilter = el.value; $('#task-results').innerHTML = taskResults(); }
  if (el.id === 'record-filter') { evidenceFilter = el.value; $('#record-results').innerHTML = recordResults(); }
  if (el.id === 'board-stage') { boardStage = el.value; document.querySelectorAll('.board-col').forEach((col, i) => col.classList.toggle('mobile-on', stageNames[i] === boardStage)); }
  if (el.id === 'task-state' && tBy(route.top?.id) && Object.hasOwn(statuses, el.value)) {
    const saved = storeWork(v => { v.status[route.top.id] = el.value; });
    render(); message(saved ? 'Task status saved' : 'Task status updated for this session');
  }
});
document.addEventListener('submit', e => {
  const form = e.target;
  if (!['filters-form', 'note-form', 'candidate-form', 'update-form', 'new-task-form'].includes(form.id)) return;
  e.preventDefault(); const fields = new FormData(form);
  if (form.id === 'filters-form') {
    filter.stage = String(fields.get('stage') || 'All'); filter.contrib = String(fields.get('contrib') || 'All'); filter.text = $('#path-filter-q').value.trim();
    if (filter.stage !== 'All') boardStage = filter.stage;
    dirty = true; popPanel(); return;
  }
  if (form.id === 'note-form') {
    const note = String(fields.get('note') || '').trim().slice(0, 2000);
    if (!note) { $('#field-note').focus(); return; }
    const id = route.top.id;
    const saved = storeWork(v => { v.notes[id] = [...(v.notes[id] || []), { date: new Date().toISOString(), text: note }]; });
    panelScroll.set(route.hash, window.scrollY); render(); message(saved ? 'Field note saved' : 'Field note added for this session'); return;
  }
  if (form.id === 'update-form') {
    const p = parentPath(); if (!p) return;
    const stage = $('#edit-stage').value, condition = String(fields.get('condition') || '').trim(), howToHelp = String(fields.get('steps') || '').trim();
    if (!condition) { message('Enter the current condition.'); return; }
    const selected = new Set(fields.getAll('criterion')), now = new Date().toISOString();
    const criteriaMet = Object.fromEntries(db.config.confidenceCriteria.filter(c => c.key !== 'recent').map(c => [c.key, selected.has(c.key)]));
    const stamp = fields.has('checkedNow') ? now : p.availabilityCheckedAt;
    if (stage === 'Established' && p.stage !== 'Established' && !ready({ ...p, stage, criteriaMet: { ...p.criteriaMet, ...criteriaMet }, availabilityCheckedAt: stamp, actionDetails: { ...p.actionDetails, howToHelp } }, db.asOf)) {
      const error = $('#update-error'); error.textContent = 'To establish this route, record its steps, confirm completion or organization verification, and check current availability.'; error.focus(); return;
    }
    if (fields.has('checkedNow')) criteriaMet.recent = true;
    const evidenceId = $('#edit-evidence').value;
    const saved = storeWork(v => {
      const prev = v.pathEdits[p.id] || {};
      v.pathEdits[p.id] = {
        ...prev, stage, condition, criteriaMet: { ...prev.criteriaMet, ...criteriaMet }, actionDetails: { ...prev.actionDetails, howToHelp },
        ...(stamp ? { availabilityCheckedAt: stamp } : {}), evidenceIds: [...new Set([...(prev.evidenceIds || []), ...(evidenceId ? [evidenceId] : [])])]
      };
    });
    popPanel(); message(saved ? 'Pathway update saved' : 'Pathway updated for this session'); return;
  }
  if (form.id === 'new-task-form') {
    const title = String(fields.get('title') || '').trim(), pathway = $('#task-path').value;
    if (!title || !pBy(pathway)) { message('Enter a task title and choose a pathway.'); return; }
    const t = { id: 'TASK-' + crypto.randomUUID().slice(0, 8).toUpperCase(), title, pathway, type: $('#task-type').value, status: 'open', basis: [], summary: '', instructions: String(fields.get('details') || '').trim() };
    const saved = storeWork(v => v.newTasks.push(t));
    if (parentPath()) popPanel(); else { taskFilter = 'all'; taskQuery = ''; go('tasks/t/' + segment(t.id), { replace: true }); }
    message(saved ? 'Task saved in this browser' : 'Task added for this session'); return;
  }
  const title = String(fields.get('title') || '').trim(), org = String(fields.get('org') || '').trim(), condition = String(fields.get('condition') || '').trim();
  if (!title || !org || !condition) { message('Enter a title, organization or area, and a next check.'); return; }
  const id = 'LOCAL-' + crypto.randomUUID().slice(0, 8).toUpperCase();
  const candidate = { id, title, org, condition, stage: 'Exploring', contributions: [$('#new-contrib').value], criteriaMet: {}, linkedEvidence: [], checklist: [], actionDetails: {} };
  const saved = storeWork(v => v.candidates.push(candidate));
  clearFilters(); boardStage = 'Exploring';
  go('pathways/p/' + segment(id), { replace: true }); message(saved ? 'Pathway saved in this browser' : 'Pathway added for this session');
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && route?.top) { e.preventDefault(); popPanel(); return; }
  if (!db || e.key !== '/' || e.ctrlKey || e.altKey || e.metaKey || /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
  e.preventDefault(); if (route.top?.kind === 'search') $('#global-q').focus(); else { searchQuery = ''; go(child('search')); }
});
window.addEventListener('popstate', render);
window.addEventListener('hashchange', render);
window.addEventListener('storage', e => { if (!db) return; if (e.key === editKey) { edits = readEdits(); reindex(); refresh(); } });
function start() {
  try {
    seed = {
      sha: '3ca68291fcb95e91afcb0bebde506934f6805750',
      asOf: '2026-11-20',
      pathways: structuredClone(initialPathways),
      config: structuredClone(trackerConfig),
      tasks: normalizeTasks(catalogSource, ledgerData),
      records: structuredClone(STREETWATCH_RECORDS)
    };
    if (!validSnapshot(seed)) throw new Error('Invalid snapshot');
    const cached = safeGet(cachedKey);
    db = validSnapshot(cached) && Date.parse(cached.asOf) >= Date.parse(seed.asOf) ? cached : seed;
    reindex(); render();
  } catch {
    $('#page').innerHTML = '<h1>Pathway tracker</h1><p>The tracker data could not be loaded.</p><button id="retry" class="btn primary">Try again</button>';
    $('#retry').onclick = start;
  }
}
start();
