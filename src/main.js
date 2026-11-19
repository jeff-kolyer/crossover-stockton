import './tracker.css';
import trackerConfig from './data/tracker-config.json';
import initialPathways from './data/pathways.json';
import catalogSource from './data/catalog-source.json';
import ledgerData from './data/record-id-ledger.json';
import { PRIMARY_RECORDS } from './generated/records.js';

const STAGES = trackerConfig.stages;
const CONTRIBUTIONS = trackerConfig.contributions;
const CONFIDENCE_CRITERIA = trackerConfig.confidenceCriteria;

let pathways = structuredClone(initialPathways);

const DISPLAY_ID_BY_SOURCE_ID = new Map(
  (ledgerData.entries || []).map(e => [e.sourceId, e.displayId])
);
const TASK_CATALOG_MAP = new Map(
  (catalogSource.tasks || []).map(t => [DISPLAY_ID_BY_SOURCE_ID.get(t.id) || t.id, t])
);
const RECORD_BY_ID = new Map(PRIMARY_RECORDS.map(r => [r.id, r]));

function classifyEvidenceType(rec) {
  if (rec.id.startsWith('WORK-')) return 'Tasks';
  if (rec.id.startsWith('FLD-') || rec.id.startsWith('CPRA-') || rec.id.startsWith('PLAN-') || rec.id.startsWith('EDT-')) {
    return 'Activities';
  }
  return 'Records';
}

function buildEvidenceSearchText(rec, type, linkedPathway) {
  const parts = [
    rec.id,
    rec.originalId,
    type,
    rec.title,
    rec.summary,
    rec.sourceAgency,
    rec.sourceLabel,
    rec.sourceUrl,
    rec.limitations,
    rec.tier,
    rec.status,
    rec.statusLabel,
    rec.categoryLabel,
    rec.dateAcquired,
    rec.spatialPrecision,
    linkedPathway
  ];
  for (const it of rec.checklistItems || []) {
    parts.push(it.item, it.note, it.time, it.status);
  }
  for (const c of rec.custodyChain || []) {
    parts.push(c.date, c.actor, c.action);
  }
  for (const ar of rec.agencyResponses || []) {
    parts.push(ar.date, ar.agency, ar.statement);
  }
  return parts.filter(Boolean).join(' ').toLowerCase();
}

const EVIDENCE_RECORDS = PRIMARY_RECORDS.map(rec => {
  const linked = pathways.find(p => (p.linkedEvidence || []).includes(rec.id));
  const type = classifyEvidenceType(rec);
  const linkedPathway = linked ? linked.id : null;
  return {
    id: rec.id,
    type,
    title: rec.title,
    date: rec.dateAcquired || '',
    sourceAgency: rec.sourceAgency || '',
    linkedPathway,
    summary: rec.summary || '',
    searchText: buildEvidenceSearchText(rec, type, linkedPathway),
    raw: rec
  };
});

let state = {
  activeView: 'help',            // 'help' | 'board' | 'tasks' | 'evidence'
  helpLayout: window.innerWidth < 768 ? 'list' : 'board',
  boardLayout: window.innerWidth < 640 ? 'list' : 'kanban',
  tasksSubLayout: 'list',        // 'list' | 'kanban'
  helpFilter: 'All',
  contributionFilter: 'All',
  stageFilter: 'All',
  checklistStatusFilter: 'all',  // 'all' | 'open' | 'waiting' | 'done'
  evidenceFilter: 'All',         // 'All' | 'Activities' | 'Tasks' | 'Records'
  evidenceSearch: '',
  evidenceTab: 'source',         // 'source' | 'custody' | 'json'
  searchQuery: '',
  activePathwayId: null,
  activeEvidenceIdx: 0,
  calcState: { completed: false, confirmed: true, steps: true, recent: false, corroborated: false }
};

function initEvidenceResizer() {
  const container = document.getElementById('evidence-split-container');
  const resizer = document.getElementById('evidence-resizer');
  if (!container || !resizer) return;

  const STORAGE_KEY = 'cs-evidence-split-px';
  const saved = Number(localStorage.getItem(STORAGE_KEY));
  if (saved >= 260 && saved <= 760) {
    container.style.setProperty('--evidence-pane-width', `${saved}px`);
  }

  let dragging = false;

  resizer.addEventListener('pointerdown', (e) => {
    dragging = true;
    resizer.setPointerCapture(e.pointerId);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  });

  resizer.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const rect = container.getBoundingClientRect();
    const maxW = Math.min(760, Math.max(320, rect.width - 360));
    const nextW = Math.round(Math.min(maxW, Math.max(260, e.clientX - rect.left)));
    container.style.setProperty('--evidence-pane-width', `${nextW}px`);
    localStorage.setItem(STORAGE_KEY, String(nextW));
  });

  const stopDrag = () => {
    if (!dragging) return;
    dragging = false;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  };

  resizer.addEventListener('pointerup', stopDrag);
  resizer.addEventListener('pointercancel', stopDrag);
  resizer.addEventListener('dblclick', () => {
    container.style.setProperty('--evidence-pane-width', '400px');
    localStorage.removeItem(STORAGE_KEY);
  });
}

function initTracker() {
  syncLayoutButtons();
  initEvidenceResizer();
  renderAll();

  // Keyboard shortcuts: '/' to search, 'Escape' to close drawers/modals
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      const searchEl = document.getElementById('global-search');
      if (searchEl) searchEl.focus();
    }
    if (e.key === 'Escape') {
      closePathwayDrawer();
      closeTaskDrawer();
      closeAboutDrawer();
      closeNewPathwayModal();
      const chMenu = document.getElementById('chapter-menu');
      if (chMenu) chMenu.classList.add('hidden');
    }
  });

  document.addEventListener('click', (e) => {
    const chMenu = document.getElementById('chapter-menu');
    const chBtn = document.getElementById('chapter-btn');
    if (chMenu && chBtn && !chMenu.contains(e.target) && !chBtn.contains(e.target)) {
      chMenu.classList.add('hidden');
      chBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTracker);
} else {
  initTracker();
}

// =========================================================================
// 3. CORE HELPERS & TELEMETRY
// =========================================================================
function getAllPathways() {
  return [...pathways];
}

function getEstablishedPathways() {
  return getAllPathways()
    .filter(p => p.stage === 'Established')
    .sort((a, b) => {
      const minsDiff = (a.freshMins ?? 999999) - (b.freshMins ?? 999999);
      if (minsDiff !== 0) return minsDiff;
      return computeScore(b.criteriaMet) - computeScore(a.criteriaMet);
    });
}

function getFilteredPathways() {
  const q = state.searchQuery.trim().toLowerCase();
  return getAllPathways().filter(p => {
    const matchesContrib = state.contributionFilter === 'All' || p.contributions.includes(state.contributionFilter);
    const matchesStage = state.stageFilter === 'All' || p.stage === state.stageFilter;
    const matchesQuery = !q || [
      p.id,
      p.title,
      p.org,
      p.stage,
      p.condition,
      p.freshLabel,
      ...(p.contributions || []),
      ...(p.linkedEvidence || []),
      ...(p.actionDetails ? Object.values(p.actionDetails) : []),
      ...(p.checklist || []).flatMap(t => [t.taskId, t.text]),
      ...(p.logs || []).flatMap(l => [l.author, l.note])
    ].filter(Boolean).join(' ').toLowerCase().includes(q);
    return matchesContrib && matchesStage && matchesQuery;
  });
}

function getStageMeta(stageId) {
  return STAGES.find(s => s.id === stageId) || STAGES[0];
}

function computeScore(criteriaMet = {}) {
  return CONFIDENCE_CRITERIA.reduce((sum, c) => sum + (criteriaMet[c.key] ? c.points : 0), 0);
}

function scoreTier(score) {
  if (score >= 75) return 'Strong evidence';
  if (score >= 50) return 'Moderate evidence';
  if (score >= 25) return 'Limited evidence';
  return 'Early / unverified';
}

let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast-el');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('opacity-0');
  el.classList.add('opacity-100');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('opacity-100');
    el.classList.add('opacity-0');
  }, 2200);
}

function copyText(text, label = 'Copied to clipboard') {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast(label);
  } catch (err) {
    showToast('Unable to copy');
  }
}

function getCurrentTimestamp() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function renderAll() {
  renderTelemetry();
  renderHelpView();
  renderBoardAndList();
  renderTasksWorkspace();
  renderEvidenceView();
  renderCalcWidget();
  if (state.activePathwayId) {
    renderPathwayDrawer(state.activePathwayId);
  }
}

// =========================================================================
// 4. TELEMETRY & SIDEBAR COUNTS
// =========================================================================
function renderTelemetry() {
  const all = getAllPathways();
  const exploringCount = all.filter(p => p.stage === 'Exploring').length;
  const blockedCount = all.filter(p => p.stage === 'Blocked').length;
  const enablingCount = all.filter(p => p.stage === 'Enabling').length;
  const establishedCount = all.filter(p => p.stage === 'Established').length;

  let openTasksCount = 0;
  all.forEach(p => {
    p.checklist.forEach(t => {
      if (!t.done) openTasksCount++;
    });
  });

  // Top bar clickable counts (desktop + mobile)
  document.getElementById('stat-established').textContent = establishedCount;
  document.getElementById('stat-enabling').textContent = enablingCount;
  document.getElementById('stat-blocked').textContent = blockedCount;
  document.getElementById('stat-open-tasks').textContent = openTasksCount;

  const mobEst = document.getElementById('mob-stat-established');
  const mobEnb = document.getElementById('mob-stat-enabling');
  const mobBlk = document.getElementById('mob-stat-blocked');
  const mobTsk = document.getElementById('mob-stat-open-tasks');
  if (mobEst) mobEst.textContent = establishedCount;
  if (mobEnb) mobEnb.textContent = enablingCount;
  if (mobBlk) mobBlk.textContent = blockedCount;
  if (mobTsk) mobTsk.textContent = openTasksCount;

  // Pathways view header pills
  const pwExp = document.getElementById('pw-pill-exploring');
  const pwBlk = document.getElementById('pw-pill-blocked');
  const pwEnb = document.getElementById('pw-pill-enabling');
  const pwEst = document.getElementById('pw-pill-established');
  if (pwExp) pwExp.textContent = exploringCount;
  if (pwBlk) pwBlk.textContent = blockedCount;
  if (pwEnb) pwEnb.textContent = enablingCount;
  if (pwEst) pwEst.textContent = establishedCount;

  // Desktop & mobile nav counts
  document.getElementById('nav-count-help').textContent = establishedCount;
  document.getElementById('nav-count-pathways').textContent = all.length;
  document.getElementById('nav-count-tasks').textContent = `${openTasksCount} open`;
  document.getElementById('nav-count-evidence').textContent = EVIDENCE_RECORDS.length;

  document.getElementById('mob-nav-help').textContent = establishedCount;
  document.getElementById('mob-nav-pathways').textContent = all.length;
  document.getElementById('mob-nav-tasks').textContent = `${openTasksCount} open`;
  document.getElementById('mob-nav-evidence').textContent = EVIDENCE_RECORDS.length;

  // Sidebar Contribution filters
  const contribEl = document.getElementById('sidebar-contributions');
  if (contribEl) {
    contribEl.innerHTML = CONTRIBUTIONS.map(c => {
      const count = c === 'All' ? all.length : all.filter(p => p.contributions.includes(c)).length;
      const active = state.contributionFilter === c;
      return `
        <button onclick="setContributionFilter('${c}'); if (state.activeView !== 'board' && state.activeView !== 'tasks') switchMainView('board');" class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${active ? 'bg-elevated text-textPrimary font-medium' : 'text-textMuted hover:text-textPrimary hover:bg-elevated/40'
        }">
          <span>${c === 'All' ? 'All Contributions' : c}</span>
          <span class="font-mono text-[11px] tabular-nums text-textDim">${count}</span>
        </button>
      `;
    }).join('');
  }

  // Sidebar Stage Pipeline counts
  const stageEl = document.getElementById('sidebar-stage-counts');
  if (stageEl) {
    stageEl.innerHTML = STAGES.map(st => {
      const count = all.filter(p => p.stage === st.id).length;
      return `
        <button onclick="jumpToStage('${st.id}')" class="w-full flex items-center justify-between text-textMuted hover:text-textPrimary transition-colors">
          <span class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full ${st.dotColor} shrink-0"></span>
            <span>${st.num} ${st.label}</span>
          </span>
          <span class="text-textPrimary font-semibold">${count}</span>
        </button>
      `;
    }).join('');
  }
}

// =========================================================================
// 5. VIEW 1: HELP TODAY (ESTABLISHED PATHWAYS ONLY)
// =========================================================================
function setHelpLayout(layout) {
  state.helpLayout = layout;
  syncLayoutButtons();
  renderHelpView();
}

function setHelpFilter(contrib) {
  state.helpFilter = contrib;
  const sel = document.getElementById('help-filter-contribution');
  if (sel) sel.value = contrib;
  renderHelpView();
}

function renderHelpView() {
  const established = getEstablishedPathways();
  const filtered = state.helpFilter === 'All'
    ? established
    : established.filter(p => p.contributions.includes(state.helpFilter));

  const freshCount = established.filter(p => p.freshness !== 'aging').length;
  const agingCount = established.filter(p => p.freshness === 'aging').length;

  const freshPill = document.getElementById('help-pill-fresh');
  const agingPill = document.getElementById('help-pill-aging');
  if (freshPill) freshPill.textContent = freshCount;
  if (agingPill) agingPill.textContent = agingCount;

  // Header status dot & text
  const dotEl = document.getElementById('help-status-dot');
  const textEl = document.getElementById('help-status-text');
  const hasFresh = freshCount > 0;
  const hasAny = established.length > 0;

  dotEl.className = `w-2 h-2 rounded-full shrink-0 ${hasFresh ? 'bg-statusEmerald' : (hasAny ? 'bg-statusAmber' : 'bg-statusSlate')
    }`;
  textEl.textContent = `${established.length} established · Updated 18m ago`;

  // Toggle Board vs List containers
  document.getElementById('help-board-container').classList.toggle('hidden', state.helpLayout !== 'board');
  document.getElementById('help-list-container').classList.toggle('hidden', state.helpLayout !== 'list');

  // -----------------------------------------------------------------------
  // A. RENDER MOBILE SIMPLE DOT LIST & DESKTOP STRUCTURED TABLE
  // -----------------------------------------------------------------------
  const listInner = document.getElementById('help-list-inner');
  if (established.length === 0) {
    listInner.innerHTML = `
      <div class="p-5 sm:p-6 space-y-3 border-b sm:border sm:border-borderHairline sm:rounded-lg sm:bg-surface">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-statusSlate"></span>
          <h2 class="text-sm font-semibold text-textPrimary">No established pathways today.</h2>
        </div>
        <p class="text-xs text-textMuted leading-relaxed">
          We only publish routes after confirming they are actually open and repeatable. See what we are currently exploring, unblocking, or enabling in the Pathways Board.
        </p>
        <div class="flex flex-wrap gap-2 pt-1">
          <button onclick="switchMainView('board')" class="h-8 px-3 rounded-md bg-elevated hover:bg-elevatedHover border border-borderStrong text-xs font-medium text-textPrimary">
            Open Pathways Board (${pathways.length})
          </button>
        </div>
      </div>
    `;
  } else if (filtered.length === 0) {
    listInner.innerHTML = `<div class="p-6 text-xs font-mono text-textDim sm:rounded-lg sm:border sm:border-borderHairline sm:bg-surface">No established pathways matching "${state.helpFilter}".</div>`;
  } else {
    listInner.innerHTML = `
      <!-- Mobile Simple Flat Dot List (< 640px) -->
      <div class="sm:hidden divide-y divide-borderHairline border-b border-borderHairline">
        ${filtered.map(p => {
      const dotClass = p.freshness === 'aging' ? 'bg-statusAmber' : 'bg-statusEmerald';
      const score = computeScore(p.criteriaMet);
      return `
            <button onclick="openPathwayDrawer('${p.id}')" class="w-full text-left px-4 py-3.5 bg-canvas hover:bg-surface/80 transition-colors flex items-start gap-3">
              <span class="w-2 h-2 rounded-full ${dotClass} mt-1.5 shrink-0"></span>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-textPrimary truncate">${p.title}</div>
                <div class="text-xs text-textMuted truncate mt-0.5"><span class="font-mono text-statusCyan mr-1">${p.id}</span>${p.org} · ${p.freshLabel} · ${score}/100</div>
              </div>
              <svg class="w-4 h-4 text-textDim mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          `;
    }).join('')}
      </div>

      <!-- Desktop Structured Table (>= 640px — Matches Pathways & Tasks Lists) -->
      <div class="hidden sm:block rounded-lg border border-borderHairline bg-surface overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-borderHairline bg-elevated/60 font-mono text-[11px] uppercase tracking-wider text-textMuted">
              <th class="py-2.5 px-3.5">ID</th>
              <th class="py-2.5 px-3.5">Freshness</th>
              <th class="py-2.5 px-3.5">Pathway</th>
              <th class="py-2.5 px-3.5">Contributions</th>
              <th class="py-2.5 px-3.5">Confidence</th>
              <th class="py-2.5 px-3.5">When</th>
              <th class="py-2.5 px-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-borderHairline text-xs">
            ${filtered.map(p => {
      const isAging = p.freshness === 'aging';
      const dotClass = isAging ? 'bg-statusAmber' : 'bg-statusEmerald';
      const badgeText = isAging ? 'text-statusAmber' : 'text-statusEmerald';
      const shortFresh = p.freshLabel.replace(/^[^·]+·\s*/, '');
      const score = computeScore(p.criteriaMet);
      const telHref = 'tel:' + (p.actionDetails.phone || '').replace(/[^\d+]/g, '');

      return `
                <tr onclick="openPathwayDrawer('${p.id}')" class="hover:bg-elevated/60 cursor-pointer transition-colors">
                  <td class="py-3 px-3.5 font-mono font-semibold text-statusCyan tabular-nums whitespace-nowrap">${p.id}</td>
                  <td class="py-3 px-3.5 whitespace-nowrap">
                    <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-canvas border border-borderHairline font-mono text-[10px] ${badgeText}">
                      <span class="w-1.5 h-1.5 rounded-full ${dotClass}"></span>
                      <span>${shortFresh}</span>
                    </span>
                  </td>
                  <td class="py-3 px-3.5 min-w-[240px]">
                    <div class="font-medium text-textPrimary">${p.title}</div>
                    <div class="text-[11px] text-textDim">${p.org}</div>
                  </td>
                  <td class="py-3 px-3.5 whitespace-nowrap font-mono text-[11px] text-textMuted">${p.contributions.join(', ')}</td>
                  <td class="py-3 px-3.5 whitespace-nowrap font-mono text-[11px] text-textPrimary tabular-nums">${score}/100</td>
                  <td class="py-3 px-3.5 whitespace-nowrap font-mono text-[11px] text-textMuted">${p.actionDetails.when}</td>
                  <td class="py-3 px-3.5 whitespace-nowrap text-right">
                    ${p.actionDetails.phone ? `
                      <a href="${telHref}" onclick="event.stopPropagation();" class="inline-flex items-center px-2.5 py-1 rounded bg-statusEmerald/15 hover:bg-statusEmerald/25 text-statusEmerald border border-statusEmerald/30 font-mono text-[10px] transition-colors">
                        Call
                      </a>
                    ` : `<span class="font-mono text-[10px] text-textDim">Details &rarr;</span>`}
                  </td>
                </tr>
              `;
    }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // -----------------------------------------------------------------------
  // B. RENDER DESKTOP BOARD VIEW (ORDERED BY FRESHNESS & CONFIDENCE)
  // -----------------------------------------------------------------------
  const boardContainer = document.getElementById('help-board-container');

  if (established.length === 0) {
    boardContainer.innerHTML = `
      <div class="max-w-3xl rounded-lg bg-surface border border-borderHairline p-5 sm:p-6 space-y-3">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-statusSlate"></span>
          <h2 class="text-sm sm:text-base font-semibold text-textPrimary">No established pathways today.</h2>
        </div>
        <p class="text-xs sm:text-sm text-textMuted leading-relaxed">
          Help Today only shows directly confirmed, repeatable routes ordered by freshness and evidence confidence. Pathways currently being explored, unblocked, or enabled live in the <strong class="text-textPrimary font-medium">Pathways Board</strong>.
        </p>
        <div class="flex flex-wrap items-center gap-2 pt-1">
          <button onclick="switchMainView('board')" class="h-8 px-3.5 rounded-md bg-elevated hover:bg-elevatedHover border border-borderStrong text-xs font-medium text-textPrimary transition-colors">
            Open Pathways Board (${pathways.length})
          </button>
        </div>
      </div>
    `;
  } else if (filtered.length === 0) {
    boardContainer.innerHTML = `
      <div class="p-6 text-xs font-mono text-textDim">
        No established pathways matching "${state.helpFilter}".
      </div>
    `;
  } else {
    boardContainer.innerHTML = `
      <div class="flex items-center justify-between font-mono text-[11px] text-textDim px-0.5 shrink-0">
        <span>ORDERED BY FRESHNESS &amp; CONFIDENCE · NEWEST FIRST</span>
        <span>${filtered.length} ${filtered.length === 1 ? 'pathway' : 'pathways'}</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 overflow-y-auto pb-2">
        ${filtered.map(p => {
      const isAging = p.freshness === 'aging';
      const freshDot = isAging ? 'bg-statusAmber' : 'bg-statusEmerald';
      const freshText = isAging ? 'text-statusAmber' : 'text-statusEmerald';
      const score = computeScore(p.criteriaMet);
      const telHref = 'tel:' + (p.actionDetails.phone || '').replace(/[^\d+]/g, '');

      return `
            <article onclick="openPathwayDrawer('${p.id}')" class="group cursor-pointer rounded-lg bg-surface hover:bg-elevated border border-borderHairline hover:border-borderStrong p-4 transition-all shadow-sm flex flex-col justify-between gap-3">
              <div class="space-y-2">
                <div class="flex items-center justify-between gap-2">
                  <span class="inline-flex items-center gap-1.5 font-mono text-[11px] ${freshText}">
                    <span class="w-2 h-2 rounded-full ${freshDot}"></span>
                    <span>${p.freshLabel}</span>
                  </span>
                  <span class="px-2 py-0.5 rounded bg-canvas border border-borderHairline font-mono text-[10px] text-textPrimary tabular-nums shrink-0" title="${scoreTier(score)}">
                    ${score}/100
                  </span>
                </div>

                <div>
                  <h3 class="text-sm font-semibold text-textPrimary leading-snug group-hover:text-white">
                    ${p.title}
                  </h3>
                  <div class="text-xs text-textDim mt-0.5 truncate">${p.org}</div>
                </div>

                <p class="text-xs text-textMuted leading-relaxed line-clamp-2">
                  ${p.actionDetails.whatNeeded}
                </p>
              </div>

              <div class="space-y-2.5">
                <div class="flex flex-wrap items-center gap-1">
                  ${p.contributions.map(c => `
                    <span class="px-1.5 py-0.5 rounded bg-canvas border border-borderHairline font-mono text-[10px] text-textMuted">${c}</span>
                  `).join('')}
                </div>

                <div class="pt-2.5 border-t border-borderHairline flex items-center justify-between gap-2 font-mono text-[11px]">
                  <span class="text-textMuted truncate">${p.actionDetails.when}</span>
                  <a href="${telHref}" onclick="event.stopPropagation();" class="px-2.5 py-1 rounded bg-statusEmerald/15 hover:bg-statusEmerald/25 text-statusEmerald border border-statusEmerald/30 shrink-0 transition-colors">
                    Call
                  </a>
                </div>
              </div>
            </article>
          `;
    }).join('')}
      </div>
    `;
  }
}

// =========================================================================
// 6. VIEW 2: PATHWAYS DEVELOPMENT BOARD & LIST
// =========================================================================
function renderBoardAndList() {
  const filtered = getFilteredPathways();
  const all = getAllPathways();

  const countEl = document.getElementById('visible-pathway-count');
  if (countEl) countEl.textContent = `${filtered.length} of ${all.length} pathways`;

  const resetBtn = document.getElementById('reset-filters-btn');
  const hasFilter = state.contributionFilter !== 'All' || state.stageFilter !== 'All' || state.searchQuery.trim() !== '';
  if (resetBtn) resetBtn.classList.toggle('hidden', !hasFilter);

  // 1. 4-Column Kanban Board
  const kanbanCols = document.getElementById('kanban-columns');
  kanbanCols.innerHTML = STAGES.map(st => {
    const colItems = filtered.filter(p => p.stage === st.id);
    return `
      <div class="flex flex-col rounded-lg bg-surface border border-borderHairline xl:h-full overflow-hidden">
        <div class="px-3 py-2.5 border-b border-borderHairline bg-elevated/40 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2 min-w-0">
            <span class="w-2 h-2 rounded-full ${st.dotColor} shrink-0"></span>
            <span class="font-mono text-[10px] text-textDim">${st.num}</span>
            <h2 class="font-mono text-xs font-semibold text-textPrimary truncate">${st.label}</h2>
          </div>
          <span class="font-mono text-xs tabular-nums px-1.5 py-0.5 rounded bg-canvas border border-borderHairline text-textMuted">${colItems.length}</span>
        </div>

        <div class="p-2.5 space-y-2.5 overflow-y-auto flex-1">
          ${colItems.length === 0 ? `
            <div class="h-20 rounded-md border border-dashed border-borderHairline flex items-center justify-center font-mono text-[11px] text-textDim">
              No pathways in ${st.label}
            </div>
          ` : colItems.map(p => {
      const doneCount = p.checklist.filter(t => t.done).length;
      const waitCount = p.checklist.filter(t => !t.done && t.waiting).length;
      const score = computeScore(p.criteriaMet);
      return `
              <article onclick="openPathwayDrawer('${p.id}')" class="group cursor-pointer rounded-lg bg-elevated hover:bg-elevatedHover border border-borderHairline hover:border-borderStrong p-3 transition-all shadow-sm space-y-2">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-mono text-[11px] font-semibold text-statusCyan group-hover:underline">${p.id}</span>
                  <span class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-canvas border border-borderHairline text-textMuted tabular-nums">${score}/100</span>
                </div>

                <div>
                  <h3 class="text-[13px] font-medium text-textPrimary leading-snug group-hover:text-white">${p.title}</h3>
                  <div class="text-[11px] text-textDim mt-0.5 truncate">${p.org}</div>
                </div>

                <p class="text-[11px] text-textMuted leading-relaxed line-clamp-2">${p.condition}</p>

                <div class="flex flex-wrap items-center gap-1 pt-0.5">
                  ${p.contributions.map(c => `
                    <span class="px-1.5 py-0.5 rounded bg-canvas border border-borderHairline font-mono text-[10px] text-textMuted">${c}</span>
                  `).join('')}
                </div>

                <div class="pt-2 border-t border-borderHairline/80 flex items-center justify-between font-mono text-[10px] text-textDim tabular-nums">
                  <span>${p.updatedAt}</span>
                  <div class="flex items-center gap-2">
                    ${waitCount > 0 ? `<span class="text-statusAmber">⏸ ${waitCount}</span>` : ''}
                    <span class="text-textMuted">${doneCount}/${p.checklist.length} tasks</span>
                  </div>
                </div>
              </article>
            `;
    }).join('')}
        </div>
      </div>
    `;
  }).join('');

  // 2. Mobile Flat Dot List
  const mobList = document.getElementById('mobile-pathway-list');
  mobList.innerHTML = filtered.length === 0
    ? `<div class="p-6 text-xs font-mono text-textDim">No pathways match the current filters.</div>`
    : filtered.map(p => {
      const st = getStageMeta(p.stage);
      return `
          <button onclick="openPathwayDrawer('${p.id}')" class="w-full text-left px-4 py-3.5 bg-canvas hover:bg-surface/80 transition-colors flex items-start gap-3">
            <span class="w-2 h-2 rounded-full ${st.dotColor} mt-1.5 shrink-0"></span>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-textPrimary truncate">${p.title}</div>
              <div class="text-xs text-textMuted truncate mt-0.5">${p.org} · ${st.label} · ${p.updatedAt}</div>
            </div>
            <svg class="w-4 h-4 text-textDim mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        `;
    }).join('');

  // 3. Desktop Table List
  const tableBody = document.getElementById('list-table-body');
  tableBody.innerHTML = filtered.length === 0
    ? `<tr><td colspan="7" class="py-8 px-4 text-center font-mono text-xs text-textDim">No pathways match the current filters.</td></tr>`
    : filtered.map(p => {
      const st = getStageMeta(p.stage);
      const doneCount = p.checklist.filter(t => t.done).length;
      const score = computeScore(p.criteriaMet);
      return `
          <tr onclick="openPathwayDrawer('${p.id}')" class="hover:bg-elevated/60 cursor-pointer transition-colors">
            <td class="py-3 px-3.5 font-mono font-semibold text-statusCyan whitespace-nowrap">${p.id}</td>
            <td class="py-3 px-3.5 whitespace-nowrap">
              <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-canvas border border-borderHairline font-mono text-[10px] ${st.textColor}">
                <span class="w-1.5 h-1.5 rounded-full ${st.dotColor}"></span>
                <span>${st.label}</span>
              </span>
            </td>
            <td class="py-3 px-3.5 min-w-[240px]">
              <div class="font-medium text-textPrimary">${p.title}</div>
              <div class="text-[11px] text-textDim">${p.org}</div>
            </td>
            <td class="py-3 px-3.5 whitespace-nowrap font-mono text-[11px] text-textMuted">${p.contributions.join(', ')}</td>
            <td class="py-3 px-3.5 whitespace-nowrap font-mono text-[11px] text-textPrimary tabular-nums">${score}/100</td>
            <td class="py-3 px-3.5 whitespace-nowrap font-mono text-[11px] text-textMuted tabular-nums">${doneCount}/${p.checklist.length}</td>
            <td class="py-3 px-3.5 whitespace-nowrap font-mono text-[11px] text-textDim">${p.updatedAt}</td>
          </tr>
        `;
    }).join('');
}

// =========================================================================
// 7. VIEW 3: TASKS & CHECKLISTS WORKSPACE
// =========================================================================
function openTasksWorkspace(filter = 'all') {
  switchMainView('tasks');
  setChecklistStatusFilter(filter);
}

function setTasksSubLayout(subLayout) {
  state.tasksSubLayout = subLayout;
  document.getElementById('tasks-list-container').classList.toggle('hidden', subLayout !== 'list');
  document.getElementById('tasks-kanban-container').classList.toggle('hidden', subLayout !== 'kanban');

  const btnList = document.getElementById('btn-tasks-list');
  const btnKanban = document.getElementById('btn-tasks-kanban');
  btnList.className = subLayout === 'list'
    ? 'px-2.5 py-1 rounded text-xs font-medium bg-elevated text-textPrimary flex items-center gap-1.5'
    : 'px-2.5 py-1 rounded text-xs font-medium text-textMuted hover:text-textPrimary flex items-center gap-1.5';
  btnKanban.className = subLayout === 'kanban'
    ? 'px-2.5 py-1 rounded text-xs font-medium bg-elevated text-textPrimary flex items-center gap-1.5'
    : 'px-2.5 py-1 rounded text-xs font-medium text-textMuted hover:text-textPrimary flex items-center gap-1.5';

  renderTasksWorkspace();
}

function setChecklistStatusFilter(filter) {
  state.checklistStatusFilter = filter;
  ['all', 'open', 'waiting', 'done'].forEach(f => {
    const btn = document.getElementById(`btn-cl-${f}`);
    if (!btn) return;
    btn.className = f === filter
      ? 'px-2 py-1 rounded text-xs font-medium bg-elevated text-textPrimary'
      : 'px-2 py-1 rounded text-xs font-medium text-textMuted hover:text-textPrimary';
  });
  renderTasksWorkspace();
}

function getTaskStatusBadge(tState) {
  if (tState === 'done') {
    return `
      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-canvas border border-borderHairline font-mono text-[10px] text-statusEmerald">
        <span class="w-1.5 h-1.5 rounded-full bg-statusEmerald"></span>
        <span>Done</span>
      </span>
    `;
  }
  if (tState === 'waiting') {
    return `
      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-canvas border border-borderHairline font-mono text-[10px] text-statusAmber">
        <span class="w-1.5 h-1.5 rounded-full bg-statusAmber"></span>
        <span>Waiting</span>
      </span>
    `;
  }
  return `
    <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-canvas border border-borderHairline font-mono text-[10px] text-statusBlue">
      <span class="w-1.5 h-1.5 rounded-full bg-statusBlue"></span>
      <span>Open</span>
    </span>
  `;
}

function renderTasksWorkspace() {
  const tableBody = document.getElementById('tasks-table-body');
  const mobileList = document.getElementById('mobile-tasks-list');
  const kanbanColsEl = document.getElementById('tasks-kanban-columns');
  const quickSelect = document.getElementById('quick-task-pathway');
  if (!tableBody || !mobileList || !kanbanColsEl) return;

  const list = getFilteredPathways();

  if (quickSelect) {
    const prevVal = quickSelect.value;
    const allP = getAllPathways();
    quickSelect.innerHTML = allP.map(p => `<option value="${p.id}">${p.id} · ${p.title}</option>`).join('');
    if (prevVal && allP.some(p => p.id === prevVal)) {
      quickSelect.value = prevVal;
    }
  }

  let open = 0, waiting = 0, done = 0, total = 0;
  const flat = [];

  list.forEach(p => {
    p.checklist.forEach((task, idx) => {
      total++;
      const tState = task.done ? 'done' : (task.waiting ? 'waiting' : 'open');
      if (tState === 'done') done++;
      else if (tState === 'waiting') waiting++;
      else open++;

      if (state.checklistStatusFilter === 'all' || state.checklistStatusFilter === tState) {
        flat.push({ p, task, idx, tState });
      }
    });
  });

  document.getElementById('tasks-pill-open').textContent = open;
  document.getElementById('tasks-pill-waiting').textContent = waiting;
  document.getElementById('tasks-pill-done').textContent = done;

  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  document.getElementById('checklists-progress-bar').style.width = `${pct}%`;
  document.getElementById('checklists-summary-text').textContent = `${done} of ${total} completed`;

  // 1. Desktop Table List (Matches Pathways List Table)
  if (flat.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="py-8 px-4 text-center font-mono text-xs text-textDim">
          No tasks match the current filter.
        </td>
      </tr>
    `;
  } else {
    tableBody.innerHTML = flat.map(({ p, task, idx, tState }) => `
      <tr onclick="openTaskDrawer('${p.id}', ${idx})" class="hover:bg-elevated/60 transition-colors group cursor-pointer">
        <td class="py-3 px-3.5 whitespace-nowrap align-middle">
          ${getTaskStatusBadge(tState)}
        </td>
        <td class="py-3 px-3.5 min-w-[260px] align-middle">
          ${task.taskId ? `<span class="font-mono text-[10px] text-statusCyan mr-1.5">${task.taskId}</span>` : ''}
          <span class="text-xs leading-relaxed ${task.done ? 'line-through text-textDim' : 'text-textPrimary font-medium group-hover:text-white'}">${task.text}</span>
        </td>
        <td class="py-3 px-3.5 align-middle">
          <button onclick="event.stopPropagation(); openPathwayDrawer('${p.id}');" class="text-left group/pw">
            <span class="font-mono text-[11px] font-semibold text-statusCyan group-hover/pw:underline mr-1.5">${p.id}</span>
            <span class="text-xs text-textMuted group-hover/pw:text-textPrimary">${p.title}</span>
          </button>
        </td>
        <td class="py-3 px-3.5 font-mono text-[11px] text-textDim whitespace-nowrap align-middle">
          ${p.org}
        </td>
        <td class="py-3 px-3.5 whitespace-nowrap text-right align-middle font-mono text-[11px] text-textDim group-hover:text-statusCyan">
          Details &rarr;
        </td>
      </tr>
    `).join('');
  }

  // 2. Mobile Flat Dot List
  mobileList.innerHTML = flat.length === 0
    ? `<div class="p-6 text-xs font-mono text-textDim">No tasks match the current filter.</div>`
    : flat.map(({ p, task, idx, tState }) => {
      const dotClass = tState === 'done' ? 'bg-statusEmerald' : (tState === 'waiting' ? 'bg-statusAmber' : 'bg-statusBlue');
      return `
          <button onclick="openTaskDrawer('${p.id}', ${idx})" class="w-full text-left px-4 py-3 flex items-start justify-between gap-3 bg-canvas hover:bg-surface/80 transition-colors">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full ${dotClass} shrink-0"></span>
                ${task.taskId ? `<span class="font-mono text-[10px] text-statusCyan shrink-0">${task.taskId}</span>` : ''}
                <span class="text-xs font-medium leading-snug ${task.done ? 'line-through text-textDim' : 'text-textPrimary'} truncate">${task.text}</span>
              </div>
              <div class="mt-1 text-[11px] text-textMuted truncate">
                <span class="font-mono text-statusCyan mr-1">${p.id}</span>${p.org}
              </div>
            </div>
            <span class="font-mono text-xs text-textDim shrink-0 mt-0.5">&rsaquo;</span>
          </button>
        `;
    }).join('');

  // 3. 3-Column Task Board
  const taskCols = [
    { id: 'open', label: 'Open / In Progress', dot: 'bg-statusBlue' },
    { id: 'waiting', label: 'Waiting on Reply', dot: 'bg-statusAmber' },
    { id: 'done', label: 'Completed', dot: 'bg-statusEmerald' }
  ];

  kanbanColsEl.innerHTML = taskCols.map(col => {
    const colTasks = flat.filter(x => x.tState === col.id);
    return `
      <div class="flex flex-col rounded-lg bg-surface border border-borderHairline md:h-full overflow-hidden">
        <div class="px-3 py-2.5 border-b border-borderHairline bg-elevated/40 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full ${col.dot}"></span>
            <h2 class="font-mono text-xs font-semibold text-textPrimary">${col.label}</h2>
          </div>
          <span class="font-mono text-xs tabular-nums px-1.5 py-0.5 rounded bg-canvas border border-borderHairline text-textMuted">${colTasks.length}</span>
        </div>
        <div class="p-2.5 space-y-2 overflow-y-auto flex-1">
          ${colTasks.length === 0
        ? `<div class="h-20 rounded-md border border-dashed border-borderHairline flex items-center justify-center font-mono text-[11px] text-textDim">No tasks</div>`
        : colTasks.map(({ p, task, idx }) => `
                <div onclick="openTaskDrawer('${p.id}', ${idx})" class="cursor-pointer rounded-lg bg-elevated hover:bg-elevatedHover border border-borderHairline hover:border-borderStrong p-3 space-y-2 transition-colors">
                  <div class="flex items-center justify-between gap-2">
                    <span class="font-mono text-[11px] font-semibold text-statusCyan">${task.taskId || p.id}</span>
                    <span class="font-mono text-[10px] text-textDim truncate">${p.id} · ${p.org}</span>
                  </div>
                  <p class="text-xs leading-relaxed ${task.done ? 'line-through text-textDim' : 'text-textPrimary'}">${task.text}</p>
                </div>
              `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// =========================================================================
// 8. VIEW 4: EVIDENCE & RECORDS INSPECTOR
// =========================================================================
function setEvidenceFilter(type) {
  state.evidenceFilter = type;
  renderEvidenceView();
}

function setEvidenceSearch(val) {
  state.evidenceSearch = val;
  renderEvidenceView();
}

function setEvidenceTab(tab) {
  state.evidenceTab = tab;
  renderEvidenceView();
}

function selectEvidenceRecord(idx) {
  state.activeEvidenceIdx = idx;
  renderEvidenceView();
}

function copyActiveEvidenceJson() {
  const rec = EVIDENCE_RECORDS[state.activeEvidenceIdx];
  if (!rec) return;
  copyText(JSON.stringify(rec.raw, null, 2), `Copied ${rec.id} JSON`);
}

function copyActiveCitation() {
  const rec = EVIDENCE_RECORDS[state.activeEvidenceIdx];
  if (!rec) return;
  const r = rec.raw;
  const parts = [
    `${rec.id}: ${rec.title}`,
    r.sourceAgency ? `Source: ${r.sourceAgency}` : '',
    rec.date ? `Date: ${rec.date}` : '',
    r.sourceUrl ? `URL: ${r.sourceUrl}` : ''
  ].filter(Boolean);
  copyText(parts.join(' · '), `Copied ${rec.id} citation`);
}

function getEvidenceStatusTone(status) {
  if (status === 'VERIFIED' || status === 'FIRSTHAND') return 'text-statusEmerald border-statusEmerald/30 bg-statusEmerald/10';
  if (status === 'REPORTED') return 'text-statusAmber border-statusAmber/30 bg-statusAmber/10';
  if (status === 'WAITING') return 'text-statusAmber border-statusAmber/30 bg-statusAmber/10';
  return 'text-statusCyan border-statusCyan/30 bg-statusCyan/10';
}

function renderEvidenceView() {
  const pillsEl = document.getElementById('evidence-type-pills');
  const gridEl = document.getElementById('evidence-grid');
  const inspectorEl = document.getElementById('evidence-inspector');
  if (!pillsEl || !gridEl || !inspectorEl) return;

  const tasksCount = EVIDENCE_RECORDS.filter(r => r.type === 'Tasks').length;
  const activitiesCount = EVIDENCE_RECORDS.filter(r => r.type === 'Activities').length;
  const recordsCount = EVIDENCE_RECORDS.filter(r => r.type === 'Records').length;
  const evTasks = document.getElementById('ev-pill-tasks');
  const evActivities = document.getElementById('ev-pill-activities');
  const evRecords = document.getElementById('ev-pill-records');
  if (evTasks) evTasks.textContent = tasksCount;
  if (evActivities) evActivities.textContent = activitiesCount;
  if (evRecords) evRecords.textContent = recordsCount;

  const types = ['All', 'Records', 'Activities', 'Tasks'];
  pillsEl.innerHTML = types.map(t => {
    const count = t === 'All' ? EVIDENCE_RECORDS.length : EVIDENCE_RECORDS.filter(r => r.type === t).length;
    const active = state.evidenceFilter === t;
    return `
      <button onclick="setEvidenceFilter('${t}')" class="h-7 px-3 rounded-full text-xs font-medium border transition-colors ${active ? 'bg-textPrimary text-canvas border-textPrimary' : 'bg-elevated text-textMuted hover:text-textPrimary border-borderHairline'
      }">
        ${t} <span class="font-mono text-[10px] opacity-75 ml-0.5">${count}</span>
      </button>
    `;
  }).join('');

  const q = (state.evidenceSearch || '').trim().toLowerCase();
  const filtered = EVIDENCE_RECORDS.filter(rec => {
    const matchesType = state.evidenceFilter === 'All' || rec.type === state.evidenceFilter;
    const matchesQuery = !q || rec.searchText.includes(q);
    return matchesType && matchesQuery;
  });

  const countEl = document.getElementById('evidence-index-count');
  if (countEl) countEl.textContent = filtered.length;

  if (filtered.length === 0) {
    gridEl.innerHTML = `<div class="p-6 text-xs font-mono text-textDim">No records match "${state.evidenceSearch || state.evidenceFilter}".</div>`;
  } else {
    gridEl.innerHTML = filtered.map(rec => {
      const origIdx = EVIDENCE_RECORDS.indexOf(rec);
      const isSelected = state.activeEvidenceIdx === origIdx;
      const r = rec.raw;
      return `
        <button onclick="selectEvidenceRecord(${origIdx})" class="w-full text-left p-3.5 transition-colors block ${isSelected ? 'bg-elevated/90 border-l-2 border-l-statusCyan' : 'hover:bg-elevated/40'
        }">
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="font-mono text-[11px] font-semibold text-statusCyan">${rec.id}</span>
            <span class="px-1.5 py-0.5 rounded border font-mono text-[9px] uppercase ${getEvidenceStatusTone(r.status)}">${r.statusLabel || r.status}</span>
          </div>
          <div class="text-xs font-semibold text-textPrimary leading-snug mb-1">${rec.title}</div>
          <div class="flex items-center justify-between gap-2 font-mono text-[10px] text-textDim">
            <span class="truncate">${r.tier || rec.type}</span>
            <span class="shrink-0">${rec.linkedPathway || rec.date}</span>
          </div>
        </button>
      `;
    }).join('');
  }

  const activeRec = EVIDENCE_RECORDS[state.activeEvidenceIdx] || filtered[0] || EVIDENCE_RECORDS[0];
  if (!activeRec) {
    inspectorEl.innerHTML = `<div class="p-6 text-xs font-mono text-textDim">No record selected.</div>`;
    return;
  }

  const r = activeRec.raw;
  const items = r.checklistItems || [];
  const custody = r.custodyChain || [];
  const responses = r.agencyResponses || [];

  let tabBody = '';
  if (state.evidenceTab === 'custody') {
    tabBody = `
      <div class="space-y-3">
        ${custody.length === 0 && responses.length === 0
        ? `<div class="text-xs font-mono text-textDim">No custody entries recorded.</div>`
        : `
            <div class="space-y-2">
              ${custody.map(c => `
                <div class="p-3 rounded-md bg-surface border border-borderHairline flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 text-xs">
                  <span class="font-mono text-[11px] text-statusAmber shrink-0">${c.date || ''}</span>
                  <div class="min-w-0">
                    <span class="font-semibold text-textPrimary mr-1.5">${c.actor || ''}</span>
                    <span class="text-textMuted">${c.action || ''}</span>
                  </div>
                </div>
              `).join('')}
            </div>
            ${responses.length > 0 ? `
              <div class="pt-2 space-y-2">
                <div class="font-mono text-[10px] uppercase tracking-wider text-textDim">Agency / Org Notes</div>
                ${responses.map(ar => `
                  <div class="p-3 rounded-md bg-canvas border border-borderHairline text-xs">
                    <div class="font-mono text-[10px] text-statusCyan mb-0.5">${ar.date || ''} · ${ar.agency || ''}</div>
                    <div class="text-textMuted">${ar.statement || ''}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          `}
      </div>
    `;
  } else if (state.evidenceTab === 'json') {
    tabBody = `
      <div class="p-3.5 rounded-md bg-canvas border border-borderHairline overflow-x-auto">
        <pre id="evidence-json-preview" class="font-mono text-xs leading-relaxed text-textMuted">${JSON.stringify(r, null, 2).replace(/</g, '&lt;')}</pre>
      </div>
    `;
  } else {
    tabBody = `
      <div class="space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div class="p-3 rounded-md bg-surface border border-borderHairline">
            <span class="font-mono text-[10px] uppercase tracking-wider text-textDim block mb-0.5">Source / Agency</span>
            <span class="text-textPrimary">${r.sourceAgency || 'Crossover Stockton'}</span>
          </div>
          <div class="p-3 rounded-md bg-surface border border-borderHairline">
            <span class="font-mono text-[10px] uppercase tracking-wider text-textDim block mb-0.5">Primary Artifact</span>
            ${r.sourceUrl
        ? `<a href="${r.sourceUrl}" target="_blank" rel="noopener noreferrer" class="text-statusCyan hover:underline break-all">${r.sourceLabel || r.sourceUrl} &nearr;</a>`
        : `<span class="text-textMuted">${r.sourceLabel || 'Internal / no public URL'}</span>`
      }
          </div>
        </div>
        ${items.length > 0 ? `
          <div class="space-y-2">
            <div class="font-mono text-[10px] uppercase tracking-wider text-textDim">Extracted Facts &amp; Notes (${items.length})</div>
            ${items.map(it => `
              <div class="p-3 rounded-md bg-surface border border-borderHairline space-y-1 text-xs">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-semibold text-textPrimary">${it.item || 'Note'}</span>
                  <span class="font-mono text-[10px] text-textDim shrink-0">${it.time || ''} · ${it.status || ''}</span>
                </div>
                <p class="text-textMuted leading-relaxed">${it.note || ''}</p>
              </div>
            `).join('')}
          </div>
        ` : `<div class="text-xs font-mono text-textDim">No extracted items attached.</div>`}
      </div>
    `;
  }

  inspectorEl.innerHTML = `
    <div class="p-4 sm:p-6 border-b border-borderHairline bg-surface/50 space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
          <span class="font-semibold text-statusCyan">${activeRec.id}</span>
          <span class="px-1.5 py-0.5 rounded border text-[10px] uppercase ${getEvidenceStatusTone(r.status)}">${r.statusLabel || r.status}</span>
          ${r.spatialPrecision ? `<span class="px-1.5 py-0.5 rounded bg-canvas border border-borderHairline text-[10px] text-textDim">${r.spatialPrecision}</span>` : ''}
        </div>
        <span class="font-mono text-[11px] text-textDim">${activeRec.date ? `Recorded ${activeRec.date}` : ''}</span>
      </div>

      <div>
        <h2 class="text-base font-semibold text-textPrimary leading-snug">${activeRec.title}</h2>
        <p class="text-xs text-textMuted leading-relaxed mt-1">${activeRec.summary}</p>
      </div>

      <div class="flex flex-wrap items-center gap-2 pt-1">
        ${r.sourceUrl ? `
          <a href="${r.sourceUrl}" target="_blank" rel="noopener noreferrer" class="h-7 px-3 rounded-md bg-statusCyan/15 hover:bg-statusCyan/25 border border-statusCyan/40 text-xs font-medium text-statusCyan inline-flex items-center gap-1.5 transition-colors">
            <span>Open Source</span>
            <span>&nearr;</span>
          </a>
        ` : ''}
        ${activeRec.linkedPathway ? `
          <button onclick="openPathwayDrawer('${activeRec.linkedPathway}')" class="h-7 px-3 rounded-md bg-statusEmerald/15 hover:bg-statusEmerald/25 border border-statusEmerald/40 text-xs font-medium text-statusEmerald">
            Pathway: ${activeRec.linkedPathway} &rarr;
          </button>
        ` : ''}
        <button onclick="copyActiveCitation()" class="h-7 px-3 rounded-md bg-canvas hover:bg-elevated border border-borderHairline font-mono text-[11px] text-textPrimary">
          Copy Citation
        </button>
        <button onclick="copyActiveEvidenceJson()" class="h-7 px-3 rounded-md bg-canvas hover:bg-elevated border border-borderHairline font-mono text-[11px] text-textMuted hover:text-textPrimary">
          Copy JSON
        </button>
      </div>
    </div>

    <div class="p-4 sm:p-6 space-y-4">
      ${r.limitations ? `
        <div class="p-3.5 rounded-md bg-surface border border-borderHairline space-y-1">
          <div class="flex items-center justify-between gap-2">
            <span class="font-mono text-[10px] uppercase tracking-wider text-statusAmber">Scope &amp; Limits</span>
            <span class="font-mono text-[10px] text-textDim">${r.severityBasis?.level || r.status || ''}</span>
          </div>
          <p class="text-xs text-textMuted leading-relaxed">${r.limitations}</p>
        </div>
      ` : ''}

      <div class="flex items-center gap-4 border-b border-borderHairline text-xs">
        <button onclick="setEvidenceTab('source')" class="pb-2 font-medium border-b-2 transition-colors ${state.evidenceTab === 'source' ? 'border-statusAmber text-textPrimary' : 'border-transparent text-textMuted hover:text-textPrimary'}">
          1. Source &amp; Facts (${items.length})
        </button>
        <button onclick="setEvidenceTab('custody')" class="pb-2 font-medium border-b-2 transition-colors ${state.evidenceTab === 'custody' ? 'border-statusAmber text-textPrimary' : 'border-transparent text-textMuted hover:text-textPrimary'}">
          2. Custody &amp; Agency Log (${custody.length})
        </button>
        <button onclick="setEvidenceTab('json')" class="pb-2 font-medium border-b-2 transition-colors ${state.evidenceTab === 'json' ? 'border-statusAmber text-textPrimary' : 'border-transparent text-textMuted hover:text-textPrimary'}">
          3. Raw JSON
        </button>
      </div>

      ${tabBody}
    </div>
  `;
}

// =========================================================================
// 9. PATHWAY INSPECTOR DRAWER & MUTATIONS
// =========================================================================
function openPathwayDrawer(pathwayId) {
  const p = getAllPathways().find(x => x.id === pathwayId);
  if (!p) return;
  state.activePathwayId = pathwayId;
  document.getElementById('drawer-pathway-id').textContent = p.id;
  document.getElementById('drawer-pathway-org').textContent = p.org;
  renderPathwayDrawer(pathwayId);
  document.getElementById('pathway-drawer-backdrop').classList.remove('hidden');
  const drawer = document.getElementById('pathway-drawer');
  drawer.classList.remove('hidden');
  drawer.classList.add('flex');
}

function closePathwayDrawer() {
  state.activePathwayId = null;
  document.getElementById('pathway-drawer-backdrop').classList.add('hidden');
  const drawer = document.getElementById('pathway-drawer');
  drawer.classList.add('hidden');
  drawer.classList.remove('flex');
}

function renderPathwayDrawer(pathwayId) {
  const p = getAllPathways().find(x => x.id === pathwayId);
  if (!p) return;

  const score = computeScore(p.criteriaMet);
  const st = getStageMeta(p.stage);
  const telHref = 'tel:' + (p.actionDetails.phone || '').replace(/[^\d+]/g, '');
  const mapsHref = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(p.actionDetails.where || 'Stockton, CA');
  const linkedEvs = EVIDENCE_RECORDS.filter(ev => (p.linkedEvidence || []).includes(ev.id));

  document.getElementById('drawer-content').innerHTML = `
    <div class="space-y-3">
      <div class="flex flex-wrap items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-canvas border border-borderHairline font-mono text-[11px] ${st.textColor}">
          <span class="w-2 h-2 rounded-full ${st.dotColor}"></span>
          <span>${st.num} ${st.label}</span>
        </span>
        <span class="font-mono text-[11px] text-textMuted">${p.freshLabel}</span>
      </div>

      <h2 class="text-lg sm:text-xl font-semibold text-textPrimary leading-snug">${p.title}</h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg bg-canvas border border-borderHairline">
        <div>
          <label class="block font-mono text-[10px] uppercase tracking-wider text-textDim mb-1">Pathway Stage</label>
          <select onchange="updatePathwayStage('${p.id}', this.value)" class="w-full h-8 px-2 rounded bg-elevated border border-borderStrong text-xs text-textPrimary focus:outline-none focus:border-statusCyan">
            ${STAGES.map(s => `<option value="${s.id}" ${p.stage === s.id ? 'selected' : ''}>${s.num} ${s.label}</option>`).join('')}
          </select>
        </div>
        <div>
          <span class="block font-mono text-[10px] uppercase tracking-wider text-textDim mb-1">Evidence Confidence</span>
          <div class="h-8 px-2.5 rounded bg-elevated/60 border border-borderHairline flex items-center justify-between font-mono text-xs">
            <span class="text-textPrimary font-semibold">${score}/100</span>
            <span class="text-[10px] text-textMuted">${scoreTier(score)}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Condition / Bottleneck -->
    <div class="space-y-1.5">
      <h3 class="font-mono text-[10px] uppercase tracking-wider text-textDim">Current Reality / Condition</h3>
      <p class="text-xs sm:text-sm text-textPrimary leading-relaxed bg-elevated/40 p-3.5 rounded-lg border border-borderHairline">${p.condition}</p>
    </div>

    <!-- Action Details (Especially relevant for Established pathways) -->
    <div class="space-y-2.5 p-4 rounded-lg bg-canvas border border-borderHairline text-xs">
      <div class="font-mono text-[10px] uppercase tracking-wider text-statusEmerald">Action Details</div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><span class="text-textDim block font-mono text-[10px]">WHAT IS NEEDED</span><span class="text-textPrimary">${p.actionDetails.whatNeeded}</span></div>
        <div><span class="text-textDim block font-mono text-[10px]">HOW TO HELP</span><span class="text-textPrimary">${p.actionDetails.howToHelp}</span></div>
        <div><span class="text-textDim block font-mono text-[10px]">WHEN</span><span class="text-textPrimary">${p.actionDetails.when}</span></div>
        <div><span class="text-textDim block font-mono text-[10px]">WHERE</span><span class="text-textPrimary">${p.actionDetails.where}</span></div>
        <div><span class="text-textDim block font-mono text-[10px]">BRING</span><span class="text-textPrimary">${p.actionDetails.bring}</span></div>
        <div><span class="text-textDim block font-mono text-[10px]">CONTACT</span><span class="text-textPrimary font-mono">${p.actionDetails.phone || 'Pending'}</span></div>
      </div>

      <div class="pt-2 flex flex-wrap gap-2">
        ${p.actionDetails.phone ? `
          <a href="${telHref}" class="h-8 px-3.5 rounded-md bg-statusEmerald text-canvas hover:opacity-90 font-semibold text-xs inline-flex items-center gap-1.5">
            <span>Call to confirm</span>
          </a>
        ` : ''}
        <a href="${mapsHref}" target="_blank" rel="noopener noreferrer" class="h-8 px-3 rounded-md bg-elevated hover:bg-elevatedHover border border-borderStrong text-xs font-medium text-textPrimary inline-flex items-center">
          Get directions
        </a>
        <button type="button" onclick="copyPathwaySummary('${p.id}')" class="h-8 px-3 rounded-md bg-elevated hover:bg-elevatedHover border border-borderHairline text-xs font-medium text-textMuted hover:text-textPrimary">
          Copy details
        </button>
      </div>
    </div>

    <!-- Evidence Confidence Criteria Checklist -->
    <div class="space-y-2">
      <h3 class="font-mono text-[10px] uppercase tracking-wider text-textDim">Evidence Criteria (${score}/100)</h3>
      <div class="space-y-1.5">
        ${CONFIDENCE_CRITERIA.map(c => `
          <label class="flex items-center justify-between gap-2 p-2.5 rounded-md bg-canvas border border-borderHairline cursor-pointer hover:bg-elevated/40 text-xs">
            <span class="flex items-center gap-2.5">
              <input type="checkbox" ${p.criteriaMet[c.key] ? 'checked' : ''} onchange="togglePathwayCriterion('${p.id}', '${c.key}')" class="rounded border-borderStrong bg-elevated text-statusEmerald focus:ring-0" />
              <span class="${p.criteriaMet[c.key] ? 'text-textPrimary' : 'text-textMuted'}">${c.label}</span>
            </span>
            <span class="font-mono text-[10px] text-textDim">+${c.points}</span>
          </label>
        `).join('')}
      </div>
    </div>

    <!-- Concrete Work Tasks -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <h3 class="font-mono text-[10px] uppercase tracking-wider text-textDim">Concrete Work Tasks</h3>
        <span class="font-mono text-[11px] text-textMuted">${p.checklist.length} tasks</span>
      </div>
      <div class="space-y-1.5">
        ${p.checklist.map((task, idx) => {
    const tState = task.done ? 'done' : (task.waiting ? 'waiting' : 'open');
    return `
            <button onclick="openTaskDrawer('${p.id}', ${idx})" class="w-full text-left flex items-center justify-between gap-2 p-2.5 rounded-md bg-canvas hover:bg-elevated/50 border border-borderHairline text-xs transition-colors">
              <span class="min-w-0 truncate ${task.done ? 'line-through text-textDim' : 'text-textPrimary'}">${task.taskId ? `<span class="font-mono text-[10px] text-statusCyan mr-1.5">${task.taskId}</span>` : ''}${task.text}</span>
              <span class="flex items-center gap-2 shrink-0">
                ${getTaskStatusBadge(tState)}
                <span class="font-mono text-[10px] text-textDim">&rarr;</span>
              </span>
            </button>
          `;
  }).join('')}
      </div>
    </div>

    <!-- Linked Evidence -->
    <div class="space-y-2">
      <h3 class="font-mono text-[10px] uppercase tracking-wider text-textDim">Linked Evidence (${linkedEvs.length})</h3>
      ${linkedEvs.length === 0
      ? `<div class="text-xs font-mono text-textDim">No linked evidence records yet.</div>`
      : `<div class="space-y-1.5">
            ${linkedEvs.map(ev => `
              <button onclick="openEvidenceFromDrawer('${ev.id}')" class="w-full text-left p-2.5 rounded-md bg-canvas hover:bg-elevated/50 border border-borderHairline flex items-center justify-between gap-2 text-xs">
                <span class="truncate"><strong class="font-mono text-statusCyan mr-1.5">${ev.id}</strong><span class="text-textPrimary">${ev.title}</span></span>
                <span class="font-mono text-[10px] text-textDim shrink-0">Inspect &rarr;</span>
              </button>
            `).join('')}
          </div>`
    }
    </div>

    <!-- Activity Log -->
    ${p.logs.length > 0 ? `
      <div class="space-y-2.5 pt-2 border-t border-borderHairline">
        <h3 class="font-mono text-[10px] uppercase tracking-wider text-textDim">Field Notes &amp; History</h3>
        <div class="space-y-1.5">
          ${p.logs.map(entry => `
            <div class="p-2.5 rounded-md bg-canvas border border-borderHairline text-xs space-y-0.5">
              <div class="flex items-center justify-between font-mono text-[10px] text-textDim">
                <span class="text-statusCyan">@${entry.author}</span>
                <span>${entry.timestamp}</span>
              </div>
              <p class="text-textMuted">${entry.note}</p>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;
}

function openTaskDrawer(pathwayId, taskIdx) {
  const p = getAllPathways().find(x => x.id === pathwayId);
  if (!p) return;
  const task = p.checklist[taskIdx];
  if (!task) return;

  closePathwayDrawer();

  const taskId = task.taskId || 'TASK';
  const cat = task.taskId ? TASK_CATALOG_MAP.get(task.taskId) : null;
  const rec = task.taskId ? RECORD_BY_ID.get(task.taskId) : null;
  const tState = task.done ? 'done' : (task.waiting ? 'waiting' : 'open');

  document.getElementById('task-drawer-id').textContent = taskId;
  document.getElementById('task-drawer-org').textContent = `${p.id} · ${p.org}`;

  const basisIds = (cat?.basis_record_ids || []).map(srcId => DISPLAY_ID_BY_SOURCE_ID.get(srcId)).filter(Boolean);
  const activityIds = (cat?.activity_record_ids || []).map(srcId => DISPLAY_ID_BY_SOURCE_ID.get(srcId)).filter(Boolean);
  const relatedRecords = [...new Set([...basisIds, ...activityIds])]
    .map(id => RECORD_BY_ID.get(id))
    .filter(Boolean);

  const checklistItems = cat?.checklist || [];

  document.getElementById('task-drawer-content').innerHTML = `
    <div class="space-y-3">
      <div class="flex flex-wrap items-center gap-2">
        ${getTaskStatusBadge(tState)}
        ${cat?.type ? `<span class="px-2 py-0.5 rounded bg-canvas border border-borderHairline font-mono text-[10px] text-textMuted uppercase">${cat.type.replace(/_/g, ' ')}</span>` : ''}
        ${cat?.list_date_label ? `<span class="font-mono text-[11px] text-textDim">${cat.list_date_label}</span>` : ''}
      </div>

      <h2 class="text-lg sm:text-xl font-semibold text-textPrimary leading-snug">${cat?.title || task.text}</h2>
      ${cat?.list_context ? `<p class="text-xs sm:text-sm text-textMuted">${cat.list_context}</p>` : ''}
    </div>

    ${cat?.instructions || rec?.summary ? `
      <div class="space-y-1.5">
        <h3 class="font-mono text-[10px] uppercase tracking-wider text-textDim">Objective &amp; Instructions</h3>
        <p class="text-xs sm:text-sm text-textPrimary leading-relaxed bg-elevated/40 p-3.5 rounded-lg border border-borderHairline">${cat?.instructions || rec?.summary}</p>
      </div>
    ` : ''}

    ${checklistItems.length > 0 ? `
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <h3 class="font-mono text-[10px] uppercase tracking-wider text-textDim">Questions &amp; Verification Steps</h3>
          <span class="font-mono text-[11px] text-textMuted">${checklistItems.length} items</span>
        </div>
        <ul class="space-y-1.5">
          ${checklistItems.map((line, i) => `
            <li class="p-2.5 rounded-md bg-canvas border border-borderHairline text-xs text-textPrimary flex items-start gap-2.5 leading-relaxed">
              <span class="font-mono text-[10px] text-statusCyan shrink-0 mt-0.5">${String(i + 1).padStart(2, '0')}</span>
              <span>${line}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    ` : ''}

    ${rec?.limitations ? `
      <div class="p-3.5 rounded-md bg-canvas border border-borderHairline space-y-1">
        <span class="font-mono text-[10px] uppercase tracking-wider text-statusAmber block">Scope &amp; Limits</span>
        <p class="text-xs text-textMuted leading-relaxed">${rec.limitations}</p>
      </div>
    ` : ''}

    <div class="space-y-2">
      <h3 class="font-mono text-[10px] uppercase tracking-wider text-textDim">Linked Pathway</h3>
      <button onclick="closeTaskDrawer(); openPathwayDrawer('${p.id}');" class="w-full text-left p-3 rounded-md bg-canvas hover:bg-elevated/50 border border-borderHairline flex items-center justify-between gap-2 text-xs">
        <span class="truncate"><strong class="font-mono text-statusEmerald mr-1.5">${p.id}</strong><span class="text-textPrimary font-medium">${p.title}</span></span>
        <span class="font-mono text-[10px] text-textDim shrink-0">Open pathway &rarr;</span>
      </button>
    </div>

    ${relatedRecords.length > 0 ? `
      <div class="space-y-2">
        <h3 class="font-mono text-[10px] uppercase tracking-wider text-textDim">Basis &amp; Supporting Records (${relatedRecords.length})</h3>
        <div class="space-y-1.5">
          ${relatedRecords.map(sr => `
            <button onclick="closeTaskDrawer(); openEvidenceFromDrawer('${sr.id}');" class="w-full text-left p-2.5 rounded-md bg-canvas hover:bg-elevated/50 border border-borderHairline flex items-center justify-between gap-2 text-xs">
              <span class="truncate"><strong class="font-mono text-statusCyan mr-1.5">${sr.id}</strong><span class="text-textPrimary">${sr.title}</span></span>
              <span class="font-mono text-[10px] text-textDim shrink-0">Inspect &rarr;</span>
            </button>
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${rec ? `
      <div class="pt-2 border-t border-borderHairline flex justify-end">
        <button onclick="closeTaskDrawer(); openEvidenceFromDrawer('${rec.id}');" class="h-8 px-3 rounded-md bg-statusCyan/15 hover:bg-statusCyan/25 border border-statusCyan/40 text-xs font-medium text-statusCyan">
          Open ${rec.id} in Evidence &amp; Records &rarr;
        </button>
      </div>
    ` : ''}
  `;

  document.getElementById('task-drawer-backdrop').classList.remove('hidden');
  const drawer = document.getElementById('task-drawer');
  drawer.classList.remove('hidden');
  drawer.classList.add('flex');
}

function closeTaskDrawer() {
  const backdrop = document.getElementById('task-drawer-backdrop');
  const drawer = document.getElementById('task-drawer');
  if (backdrop) backdrop.classList.add('hidden');
  if (drawer) {
    drawer.classList.add('hidden');
    drawer.classList.remove('flex');
  }
}

function copyPathwaySummary(pathwayId) {
  const p = getAllPathways().find(x => x.id === pathwayId);
  if (!p) return;
  const summary = `${p.title} (${p.org})\nStage: ${p.stage} | ${p.freshLabel}\nWhen: ${p.actionDetails.when}\nWhere: ${p.actionDetails.where}\nPhone: ${p.actionDetails.phone || 'N/A'}\nHow: ${p.actionDetails.howToHelp}`;
  copyText(summary, 'Copied pathway details');
}

function openEvidenceFromDrawer(evId) {
  const idx = EVIDENCE_RECORDS.findIndex(e => e.id === evId);
  if (idx !== -1) state.activeEvidenceIdx = idx;
  closePathwayDrawer();
  switchMainView('evidence');
}

function updatePathwayStage(pathwayId, newStage) {
  const p = getAllPathways().find(x => x.id === pathwayId);
  if (!p) return;
  p.stage = newStage;
  p.updatedAt = 'Just now';
  if (newStage === 'Established') {
    p.freshness = 'fresh';
    p.freshMins = 0;
    p.freshLabel = 'Fresh · Confirmed just now';
  }
  p.logs.unshift({
    timestamp: getCurrentTimestamp(),
    author: 'civic-ops',
    note: `Updated pathway stage to "${newStage}".`
  });
  showToast(`${p.id} moved to ${newStage}`);
  renderAll();
}

function togglePathwayCriterion(pathwayId, key) {
  const p = getAllPathways().find(x => x.id === pathwayId);
  if (!p) return;
  p.criteriaMet[key] = !p.criteriaMet[key];
  renderAll();
}

function toggleTaskDone(pathwayId, idx) {
  const p = getAllPathways().find(x => x.id === pathwayId);
  if (!p || !p.checklist[idx]) return;
  p.checklist[idx].done = !p.checklist[idx].done;
  if (p.checklist[idx].done) p.checklist[idx].waiting = false;
  p.updatedAt = 'Just now';
  renderAll();
}

function toggleTaskWaiting(pathwayId, idx) {
  const p = getAllPathways().find(x => x.id === pathwayId);
  if (!p || !p.checklist[idx]) return;
  p.checklist[idx].waiting = !p.checklist[idx].waiting;
  if (p.checklist[idx].waiting) p.checklist[idx].done = false;
  p.updatedAt = 'Just now';
  renderAll();
}

function removeTask(pathwayId, idx) {
  const p = getAllPathways().find(x => x.id === pathwayId);
  if (!p || !p.checklist[idx]) return;
  p.checklist.splice(idx, 1);
  p.updatedAt = 'Just now';
  renderAll();
}

function addTaskFromDrawer(e, pathwayId) {
  e.preventDefault();
  const input = document.getElementById('drawer-new-task-input');
  const text = input ? input.value.trim() : '';
  if (!text) return;
  const p = getAllPathways().find(x => x.id === pathwayId);
  if (!p) return;
  p.checklist.push({ text, done: false, waiting: false });
  p.updatedAt = 'Just now';
  input.value = '';
  renderAll();
}

function addTaskFromToolbar(e) {
  e.preventDefault();
  const select = document.getElementById('quick-task-pathway');
  const input = document.getElementById('quick-task-input');
  const pathwayId = select ? select.value : '';
  const text = input ? input.value.trim() : '';
  if (!pathwayId || !text) return;
  const p = getAllPathways().find(x => x.id === pathwayId);
  if (!p) return;
  p.checklist.push({ text, done: false, waiting: false });
  p.updatedAt = 'Just now';
  input.value = '';
  showToast(`Task added to ${p.id}`);
  renderAll();
}

function addPathwayLog(e, pathwayId) {
  e.preventDefault();
  const input = document.getElementById('new-log-input');
  const text = input ? input.value.trim() : '';
  if (!text) return;
  const p = getAllPathways().find(x => x.id === pathwayId);
  if (!p) return;
  p.logs.unshift({
    timestamp: getCurrentTimestamp(),
    author: 'civic-ops',
    note: text
  });
  p.updatedAt = 'Just now';
  input.value = '';
  renderAll();
}

// =========================================================================
// 10. ABOUT DRAWER, CONFIDENCE CALCULATOR & NEW PATHWAY MODAL
// =========================================================================
function openAboutDrawer() {
  document.getElementById('about-drawer-backdrop').classList.remove('hidden');
  const d = document.getElementById('about-drawer');
  d.classList.remove('hidden');
  d.classList.add('flex');
  renderCalcWidget();
}

function closeAboutDrawer() {
  document.getElementById('about-drawer-backdrop').classList.add('hidden');
  const d = document.getElementById('about-drawer');
  d.classList.add('hidden');
  d.classList.remove('flex');
}

function toggleCalcCriterion(key) {
  state.calcState[key] = !state.calcState[key];
  renderCalcWidget();
}

function resetCalc() {
  state.calcState = { completed: false, confirmed: true, steps: true, recent: false, corroborated: false };
  renderCalcWidget();
}

function renderCalcWidget() {
  const listEl = document.getElementById('calc-criteria-list');
  if (!listEl) return;
  const score = computeScore(state.calcState);
  document.getElementById('calc-score').textContent = `${score}/100`;
  document.getElementById('calc-tier').textContent = scoreTier(score);

  listEl.innerHTML = CONFIDENCE_CRITERIA.map(c => `
    <label class="flex items-center justify-between gap-2 py-1 cursor-pointer text-[11px]">
      <span class="flex items-center gap-2">
        <input type="checkbox" ${state.calcState[c.key] ? 'checked' : ''} onchange="toggleCalcCriterion('${c.key}')" class="rounded border-borderStrong bg-elevated text-statusEmerald focus:ring-0" />
        <span class="${state.calcState[c.key] ? 'text-textPrimary' : 'text-textMuted'}">${c.label}</span>
      </span>
      <span class="font-mono text-[10px] text-textDim">+${c.points}</span>
    </label>
  `).join('');
}

function openNewPathwayModal() {
  const nextNum = String(pathways.length + 1).padStart(2, '0');
  document.getElementById('new-id').value = `PW-${nextNum}`;
  const modal = document.getElementById('new-pathway-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeNewPathwayModal() {
  const modal = document.getElementById('new-pathway-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function submitNewPathway(e) {
  e.preventDefault();
  const id = document.getElementById('new-id').value.trim() || `PW-${pathways.length + 1}`;
  const stage = document.getElementById('new-stage').value;
  const title = document.getElementById('new-title').value.trim();
  const org = document.getElementById('new-org').value.trim();
  const contribution = document.getElementById('new-contribution').value;
  const condition = document.getElementById('new-condition').value.trim();

  pathways.unshift({
    id,
    title,
    org,
    stage,
    contributions: [contribution],
    freshness: stage === 'Established' ? 'fresh' : 'n/a',
    freshMins: stage === 'Established' ? 0 : 999999,
    freshLabel: stage === 'Established' ? 'Fresh · Confirmed just now' : `${stage} · Just added`,
    updatedAt: 'Just now',
    condition,
    criteriaMet: { completed: false, confirmed: stage === 'Established', steps: false, recent: true, corroborated: false },
    linkedEvidence: [],
    actionDetails: {
      whatNeeded: condition,
      howToHelp: 'Document exact steps once verified.',
      when: 'Pending confirmation',
      where: `${org}, Stockton, CA`,
      bring: 'TBD',
      phone: ''
    },
    checklist: [
      { text: `Contact ${org} to confirm current availability`, done: false, waiting: false }
    ],
    logs: [
      { timestamp: getCurrentTimestamp(), author: 'civic-ops', note: `Created pathway ${id} in ${stage}.` }
    ]
  });

  document.getElementById('new-pathway-form').reset();
  closeNewPathwayModal();
  switchMainView(stage === 'Established' ? 'help' : 'board');
  renderAll();
  openPathwayDrawer(id);
}

// =========================================================================
// 11. NAVIGATION, MODE & FILTER HANDLERS
// =========================================================================
function goHome() {
  switchMainView('help');
}

function jumpToHelp() {
  switchMainView('help');
}

function jumpToStage(stageId) {
  state.stageFilter = stageId;
  const sel = document.getElementById('filter-stage');
  if (sel) sel.value = stageId;
  switchMainView('board');
  renderAll();
}

function switchMainView(viewName) {
  state.activeView = viewName;
  ['help', 'board', 'tasks', 'evidence'].forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (!el) return;
    if (v === viewName) {
      el.classList.remove('hidden');
      el.classList.add('flex');
    } else {
      el.classList.add('hidden');
      el.classList.remove('flex');
    }
  });

  // Desktop sidebar active state
  document.querySelectorAll('.sidebar-btn').forEach(btn => {
    const active = btn.dataset.viewBtn === viewName;
    btn.classList.toggle('bg-elevated', active);
    btn.classList.toggle('text-textPrimary', active);
    btn.classList.toggle('border-borderHairline', active);
    btn.classList.toggle('text-textMuted', !active);
    btn.classList.toggle('border-transparent', !active);
  });

  // Mobile bottom tab active state
  document.querySelectorAll('.mob-tab').forEach(btn => {
    const active = btn.dataset.mobTab === viewName;
    btn.classList.toggle('text-statusEmerald', active);
    btn.classList.toggle('font-semibold', active);
    btn.classList.toggle('text-textPrimary/75', !active);
    btn.classList.toggle('font-medium', !active);
  });
}

function syncLayoutButtons() {
  // Help layout buttons
  const btnHB = document.getElementById('btn-help-board');
  const btnHL = document.getElementById('btn-help-list');
  if (btnHB && btnHL) {
    btnHB.className = state.helpLayout === 'board'
      ? 'px-2.5 py-1 rounded text-xs font-medium bg-elevated text-textPrimary flex items-center gap-1.5'
      : 'px-2.5 py-1 rounded text-xs font-medium text-textMuted hover:text-textPrimary flex items-center gap-1.5';
    btnHL.className = state.helpLayout === 'list'
      ? 'px-2.5 py-1 rounded text-xs font-medium bg-elevated text-textPrimary flex items-center gap-1.5'
      : 'px-2.5 py-1 rounded text-xs font-medium text-textMuted hover:text-textPrimary flex items-center gap-1.5';
  }

  // Pathways board/list buttons
  const kanbanEl = document.getElementById('kanban-container');
  const listEl = document.getElementById('list-container');
  const btnK = document.getElementById('btn-layout-kanban');
  const btnL = document.getElementById('btn-layout-list');
  if (kanbanEl && listEl && btnK && btnL) {
    kanbanEl.classList.toggle('hidden', state.boardLayout !== 'kanban');
    listEl.classList.toggle('hidden', state.boardLayout !== 'list');
    btnK.className = state.boardLayout === 'kanban'
      ? 'px-2.5 py-1 rounded text-xs font-medium bg-elevated text-textPrimary flex items-center gap-1.5'
      : 'px-2.5 py-1 rounded text-xs font-medium text-textMuted hover:text-textPrimary flex items-center gap-1.5';
    btnL.className = state.boardLayout === 'list'
      ? 'px-2.5 py-1 rounded text-xs font-medium bg-elevated text-textPrimary flex items-center gap-1.5'
      : 'px-2.5 py-1 rounded text-xs font-medium text-textMuted hover:text-textPrimary flex items-center gap-1.5';
  }
}

function setBoardLayout(layout) {
  state.boardLayout = layout;
  syncLayoutButtons();
}

function setContributionFilter(val) {
  state.contributionFilter = val;
  const sel = document.getElementById('filter-contribution');
  if (sel) sel.value = val;
  renderAll();
}

function setStageFilter(val) {
  state.stageFilter = val;
  const sel = document.getElementById('filter-stage');
  if (sel) sel.value = val;
  renderAll();
}

function handleSearch(val) {
  state.searchQuery = val;
  state.evidenceSearch = val;
  const gs = document.getElementById('global-search');
  const ms = document.getElementById('mobile-board-search');
  const es = document.getElementById('evidence-search');
  if (gs && gs.value !== val) gs.value = val;
  if (ms && ms.value !== val) ms.value = val;
  if (es && es.value !== val) es.value = val;
  renderHelpView();
  renderBoardAndList();
  renderTasksWorkspace();
  renderEvidenceView();
}

function resetFilters() {
  state.contributionFilter = 'All';
  state.stageFilter = 'All';
  state.checklistStatusFilter = 'all';
  state.searchQuery = '';
  state.evidenceSearch = '';
  const fc = document.getElementById('filter-contribution');
  const fs = document.getElementById('filter-stage');
  const gs = document.getElementById('global-search');
  const ms = document.getElementById('mobile-board-search');
  const es = document.getElementById('evidence-search');
  if (fc) fc.value = 'All';
  if (fs) fs.value = 'All';
  if (gs) gs.value = '';
  if (ms) ms.value = '';
  if (es) es.value = '';
  setChecklistStatusFilter('all');
  renderAll();
}

function toggleChapterMenu(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById('chapter-menu');
  const btn = document.getElementById('chapter-btn');
  if (!menu || !btn) return;
  const hidden = menu.classList.toggle('hidden');
  btn.setAttribute('aria-expanded', String(!hidden));
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById('mobile-sidebar');
  const backdrop = document.getElementById('mobile-sidebar-backdrop');
  sidebar.classList.toggle('hidden');
  sidebar.classList.toggle('flex');
  backdrop.classList.toggle('hidden');
}

// Expose handlers for inline HTML event attributes
Object.assign(window, {
  getAllPathways,
  getEstablishedPathways,
  getFilteredPathways,
  getStageMeta,
  computeScore,
  scoreTier,
  showToast,
  copyText,
  getCurrentTimestamp,
  renderAll,
  renderTelemetry,
  setHelpLayout,
  setHelpFilter,
  renderHelpView,
  renderBoardAndList,
  openTasksWorkspace,
  setTasksSubLayout,
  setChecklistStatusFilter,
  getTaskStatusBadge,
  renderTasksWorkspace,
  setEvidenceFilter,
  setEvidenceSearch,
  setEvidenceTab,
  selectEvidenceRecord,
  copyActiveCitation,
  copyActiveEvidenceJson,
  renderEvidenceView,
  openPathwayDrawer,
  closePathwayDrawer,
  renderPathwayDrawer,
  openTaskDrawer,
  closeTaskDrawer,
  copyPathwaySummary,
  openEvidenceFromDrawer,
  updatePathwayStage,
  togglePathwayCriterion,
  toggleTaskDone,
  toggleTaskWaiting,
  removeTask,
  addTaskFromDrawer,
  addTaskFromToolbar,
  addPathwayLog,
  openAboutDrawer,
  closeAboutDrawer,
  toggleCalcCriterion,
  resetCalc,
  renderCalcWidget,
  openNewPathwayModal,
  closeNewPathwayModal,
  submitNewPathway,
  goHome,
  jumpToHelp,
  jumpToStage,
  switchMainView,
  syncLayoutButtons,
  setBoardLayout,
  setContributionFilter,
  setStageFilter,
  handleSearch,
  resetFilters,
  toggleChapterMenu,
  toggleMobileSidebar
});
