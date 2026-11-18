import './tracker.css';
import trackerConfig from './data/tracker-config.json';
import initialPathways from './data/pathways.json';
import { PRIMARY_RECORDS } from './generated/records.js';

const STAGES = trackerConfig.stages;
const CONTRIBUTIONS = trackerConfig.contributions;
const CONFIDENCE_CRITERIA = trackerConfig.confidenceCriteria;

let pathways = structuredClone(initialPathways);

function classifyEvidenceType(rec) {
  if (rec.id.startsWith('WORK-')) return 'Tasks';
  if (rec.id.startsWith('FLD-') || rec.id.startsWith('CPRA-') || rec.id.startsWith('PLAN-') || rec.id.startsWith('EDT-')) {
    return 'Activities';
  }
  return 'Records';
}

const EVIDENCE_RECORDS = PRIMARY_RECORDS.map(rec => {
  const linked = pathways.find(p => (p.linkedEvidence || []).includes(rec.id));
  return {
    id: rec.id,
    type: classifyEvidenceType(rec),
    title: rec.title,
    date: rec.dateAcquired || '',
    sourceAgency: rec.sourceAgency || '',
    linkedPathway: linked ? linked.id : null,
    summary: rec.summary || '',
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
  evidenceFilter: 'All',         // 'All' | 'Visits' | 'Calls' | 'Records'
  searchQuery: '',
  activePathwayId: null,
  activeEvidenceIdx: 0,
  calcState: { completed: false, confirmed: true, steps: true, recent: false, corroborated: false }
};

document.addEventListener('DOMContentLoaded', () => {
  syncLayoutButtons();
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
      closeAboutDrawer();
      closeNewPathwayModal();
    }
  });
});

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
    const matchesQuery = !q ||
      p.id.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.org.toLowerCase().includes(q) ||
      p.condition.toLowerCase().includes(q) ||
      p.contributions.some(c => c.toLowerCase().includes(q)) ||
      p.checklist.some(t => t.text.toLowerCase().includes(q));
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

  // Top bar clickable counts
  document.getElementById('stat-established').textContent = establishedCount;
  document.getElementById('stat-enabling').textContent = enablingCount;
  document.getElementById('stat-blocked').textContent = blockedCount;
  document.getElementById('stat-open-tasks').textContent = openTasksCount;

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
        <button onclick="setContributionFilter('${c}'); if (state.activeView !== 'board' && state.activeView !== 'tasks') switchMainView('board');" class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors ${
          active ? 'bg-elevated text-textPrimary font-medium' : 'text-textMuted hover:text-textPrimary hover:bg-elevated/40'
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

  dotEl.className = `w-2 h-2 rounded-full shrink-0 ${
    hasFresh ? 'bg-statusEmerald' : (hasAny ? 'bg-statusAmber' : 'bg-statusSlate')
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
        <td colspan="6" class="py-8 px-4 text-center font-mono text-xs text-textDim">
          No tasks match the current filter.
        </td>
      </tr>
    `;
  } else {
    tableBody.innerHTML = flat.map(({ p, task, idx, tState }) => `
      <tr class="hover:bg-elevated/60 transition-colors group">
        <td class="py-3 px-3.5 align-middle">
          <input
            type="checkbox"
            ${task.done ? 'checked' : ''}
            onchange="toggleTaskDone('${p.id}', ${idx})"
            class="rounded border-borderStrong bg-elevated text-statusEmerald focus:ring-0 cursor-pointer"
            aria-label="Mark task complete"
          />
        </td>
        <td class="py-3 px-3.5 whitespace-nowrap align-middle">
          ${getTaskStatusBadge(tState)}
        </td>
        <td class="py-3 px-3.5 min-w-[260px] align-middle">
          ${task.taskId ? `<span class="font-mono text-[10px] text-statusCyan mr-1.5">${task.taskId}</span>` : ''}
          <span class="text-xs leading-relaxed ${task.done ? 'line-through text-textDim' : 'text-textPrimary font-medium'}">${task.text}</span>
        </td>
        <td class="py-3 px-3.5 align-middle">
          <button onclick="openPathwayDrawer('${p.id}')" class="text-left group/pw">
            <span class="font-mono text-[11px] font-semibold text-statusCyan group-hover/pw:underline mr-1.5">${p.id}</span>
            <span class="text-xs text-textMuted group-hover/pw:text-textPrimary">${p.title}</span>
          </button>
        </td>
        <td class="py-3 px-3.5 font-mono text-[11px] text-textDim whitespace-nowrap align-middle">
          ${p.org}
        </td>
        <td class="py-3 px-3.5 whitespace-nowrap text-right align-middle">
          <div class="inline-flex items-center gap-1.5">
            ${!task.done ? `
              <button type="button" onclick="toggleTaskWaiting('${p.id}', ${idx})" class="px-2 py-0.5 rounded font-mono text-[10px] border transition-colors ${
                task.waiting
                  ? 'bg-statusAmber/15 text-statusAmber border-statusAmber/30 hover:bg-statusAmber/25'
                  : 'bg-canvas text-textMuted border-borderHairline hover:text-textPrimary'
              }">${task.waiting ? 'Resume' : 'Waiting'}</button>
            ` : ''}
            <button type="button" onclick="removeTask('${p.id}', ${idx})" class="opacity-40 group-hover:opacity-100 text-textDim hover:text-statusRose font-mono text-xs px-1.5 py-0.5 rounded transition-opacity" title="Remove task">✕</button>
          </div>
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
          <div class="px-4 py-3 flex items-start gap-3 bg-canvas hover:bg-surface/80 transition-colors">
            <input
              type="checkbox"
              ${task.done ? 'checked' : ''}
              onchange="toggleTaskDone('${p.id}', ${idx})"
              class="mt-1 rounded border-borderStrong bg-elevated text-statusEmerald focus:ring-0 shrink-0"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full ${dotClass} shrink-0"></span>
                <span class="text-xs font-medium leading-snug ${task.done ? 'line-through text-textDim' : 'text-textPrimary'}">${task.text}</span>
              </div>
              <button onclick="openPathwayDrawer('${p.id}')" class="mt-1 block text-[11px] text-textMuted truncate text-left">
                <span class="font-mono text-statusCyan mr-1">${p.id}</span>${p.org}
              </button>
            </div>
            ${!task.done ? `
              <button type="button" onclick="toggleTaskWaiting('${p.id}', ${idx})" class="px-2 py-0.5 rounded font-mono text-[10px] border shrink-0 ${
                task.waiting ? 'bg-statusAmber/15 text-statusAmber border-statusAmber/30' : 'bg-elevated text-textDim border-borderHairline'
              }">${task.waiting ? '⏸' : 'Wait'}</button>
            ` : ''}
          </div>
        `;
      }).join('');

  // 3. 3-Column Task Board
  const taskCols = [
    { id: 'open',    label: 'Open / In Progress', dot: 'bg-statusBlue' },
    { id: 'waiting', label: 'Waiting on Reply',   dot: 'bg-statusAmber' },
    { id: 'done',    label: 'Completed',          dot: 'bg-statusEmerald' }
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
                <div class="rounded-lg bg-elevated border border-borderHairline p-3 space-y-2">
                  <div class="flex items-center justify-between gap-2">
                    <button onclick="openPathwayDrawer('${p.id}')" class="font-mono text-[11px] font-semibold text-statusCyan hover:underline">${p.id}</button>
                    <span class="font-mono text-[10px] text-textDim truncate">${p.org}</span>
                  </div>
                  <label class="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" ${task.done ? 'checked' : ''} onchange="toggleTaskDone('${p.id}', ${idx})" class="mt-0.5 rounded border-borderStrong bg-canvas text-statusEmerald focus:ring-0" />
                    <span class="text-xs leading-relaxed ${task.done ? 'line-through text-textDim' : 'text-textPrimary'}">${task.text}</span>
                  </label>
                  ${!task.done ? `
                    <div class="pt-1.5 border-t border-borderHairline/70 flex justify-end">
                      <button onclick="toggleTaskWaiting('${p.id}', ${idx})" class="px-2 py-0.5 rounded font-mono text-[10px] border ${
                        task.waiting ? 'bg-statusAmber/15 text-statusAmber border-statusAmber/30' : 'bg-canvas text-textMuted border-borderHairline hover:text-textPrimary'
                      }">${task.waiting ? 'Resume Open' : 'Mark Waiting'}</button>
                    </div>
                  ` : ''}
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

function selectEvidenceRecord(idx) {
  state.activeEvidenceIdx = idx;
  renderEvidenceView();
}

function copyActiveEvidenceJson() {
  const rec = EVIDENCE_RECORDS[state.activeEvidenceIdx];
  if (!rec) return;
  copyText(JSON.stringify(rec.raw, null, 2), `Copied ${rec.id} JSON`);
}

function renderEvidenceView() {
  const pillsEl = document.getElementById('evidence-type-pills');
  const gridEl = document.getElementById('evidence-grid');
  if (!pillsEl || !gridEl) return;

  const tasksCount = EVIDENCE_RECORDS.filter(r => r.type === 'Tasks').length;
  const activitiesCount = EVIDENCE_RECORDS.filter(r => r.type === 'Activities').length;
  const recordsCount = EVIDENCE_RECORDS.filter(r => r.type === 'Records').length;
  const evTasks = document.getElementById('ev-pill-tasks');
  const evActivities = document.getElementById('ev-pill-activities');
  const evRecords = document.getElementById('ev-pill-records');
  if (evTasks) evTasks.textContent = tasksCount;
  if (evActivities) evActivities.textContent = activitiesCount;
  if (evRecords) evRecords.textContent = recordsCount;

  const types = ['All', 'Activities', 'Tasks', 'Records'];
  pillsEl.innerHTML = types.map(t => {
    const count = t === 'All' ? EVIDENCE_RECORDS.length : EVIDENCE_RECORDS.filter(r => r.type === t).length;
    const active = state.evidenceFilter === t;
    return `
      <button onclick="setEvidenceFilter('${t}')" class="h-7 px-3 rounded-full text-xs font-medium border transition-colors ${
        active ? 'bg-textPrimary text-canvas border-textPrimary' : 'bg-elevated text-textMuted hover:text-textPrimary border-borderHairline'
      }">
        ${t} <span class="font-mono text-[10px] opacity-75 ml-0.5">${count}</span>
      </button>
    `;
  }).join('');

  const filtered = state.evidenceFilter === 'All'
    ? EVIDENCE_RECORDS
    : EVIDENCE_RECORDS.filter(r => r.type === state.evidenceFilter);

  if (filtered.length === 0) {
    gridEl.innerHTML = `<div class="col-span-full p-6 text-xs font-mono text-textDim rounded-lg border border-borderHairline bg-surface">No records in this category.</div>`;
  } else {
    gridEl.innerHTML = filtered.map(rec => {
      const origIdx = EVIDENCE_RECORDS.indexOf(rec);
      const isSelected = state.activeEvidenceIdx === origIdx;
      return `
        <div onclick="selectEvidenceRecord(${origIdx})" class="cursor-pointer rounded-lg bg-surface hover:bg-elevated/70 border ${
          isSelected ? 'border-statusCyan' : 'border-borderHairline'
        } p-4 transition-all space-y-2">
          <div class="flex items-center justify-between gap-2">
            <span class="font-mono text-xs font-semibold text-statusCyan">${rec.id} · ${rec.type}</span>
            <span class="font-mono text-[10px] text-textDim">${rec.date}</span>
          </div>
          <h3 class="text-sm font-semibold text-textPrimary leading-snug">${rec.title}</h3>
          <p class="text-xs text-textMuted leading-relaxed">${rec.summary}</p>
          <div class="pt-1 flex items-center justify-between font-mono text-[10px]">
            ${rec.linkedPathway
              ? `<button onclick="event.stopPropagation(); openPathwayDrawer('${rec.linkedPathway}');" class="text-statusEmerald hover:underline">Linked: ${rec.linkedPathway} &rarr;</button>`
              : `<span class="text-textDim truncate">${rec.sourceAgency || 'Authoritative record'}</span>`
            }
            <span class="text-textDim shrink-0">${isSelected ? 'Inspecting below' : 'Click to inspect'}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  const activeRec = EVIDENCE_RECORDS[state.activeEvidenceIdx] || EVIDENCE_RECORDS[0];
  const titleEl = document.getElementById('active-evidence-title');
  const previewEl = document.getElementById('evidence-json-preview');
  if (activeRec && titleEl && previewEl) {
    titleEl.textContent = `${activeRec.id} — ${activeRec.title}`;
    previewEl.textContent = JSON.stringify(activeRec.raw, null, 2);
  } else if (titleEl && previewEl) {
    titleEl.textContent = 'No record selected';
    previewEl.textContent = '{}';
  }
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
        <span class="font-mono text-[11px] text-textMuted">${p.checklist.filter(t => t.done).length}/${p.checklist.length} done</span>
      </div>
      <div class="space-y-1.5">
        ${p.checklist.map((task, idx) => `
          <div class="flex items-center justify-between gap-2 p-2.5 rounded-md bg-canvas border border-borderHairline text-xs">
            <label class="flex items-start gap-2.5 cursor-pointer flex-1 min-w-0">
              <input type="checkbox" ${task.done ? 'checked' : ''} onchange="toggleTaskDone('${p.id}', ${idx})" class="mt-0.5 rounded border-borderStrong bg-elevated text-statusEmerald focus:ring-0" />
              <span class="${task.done ? 'line-through text-textDim' : 'text-textPrimary'}">${task.taskId ? `<span class="font-mono text-[10px] text-statusCyan mr-1.5">${task.taskId}</span>` : ''}${task.text}</span>
            </label>
            <div class="flex items-center gap-1.5 shrink-0">
              ${!task.done ? `
                <button type="button" onclick="toggleTaskWaiting('${p.id}', ${idx})" class="px-2 py-0.5 rounded font-mono text-[10px] border ${
                  task.waiting ? 'bg-statusAmber/15 text-statusAmber border-statusAmber/30' : 'bg-elevated text-textDim border-borderHairline'
                }">${task.waiting ? 'WAITING' : 'OPEN'}</button>
              ` : ''}
              <button type="button" onclick="removeTask('${p.id}', ${idx})" class="text-textDim hover:text-statusRose font-mono px-1">✕</button>
            </div>
          </div>
        `).join('')}
      </div>
      <form onsubmit="addTaskFromDrawer(event, '${p.id}')" class="flex gap-2 pt-1">
        <input type="text" id="drawer-new-task-input" required placeholder="+ Add doable next task..." class="flex-1 h-8 px-3 rounded-md bg-canvas border border-borderHairline focus:border-statusCyan focus:outline-none text-xs text-textPrimary placeholder-textDim" />
        <button type="submit" class="h-8 px-3 rounded-md bg-elevated hover:bg-elevatedHover border border-borderStrong text-xs font-medium text-textPrimary">Add</button>
      </form>
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
    <div class="space-y-2.5 pt-2 border-t border-borderHairline">
      <h3 class="font-mono text-[10px] uppercase tracking-wider text-textDim">Field Notes &amp; History</h3>
      <form onsubmit="addPathwayLog(event, '${p.id}')" class="flex gap-2">
        <input type="text" id="new-log-input" required placeholder="Append timestamped observation..." class="flex-1 h-8 px-3 rounded-md bg-canvas border border-borderHairline focus:border-statusCyan focus:outline-none text-xs text-textPrimary placeholder-textDim" />
        <button type="submit" class="h-8 px-3 rounded-md bg-elevated hover:bg-elevatedHover border border-borderStrong text-xs font-medium text-textPrimary">Post</button>
      </form>
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
  `;
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
    btn.classList.toggle('text-textDim', !active);
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
  renderBoardAndList();
  renderTasksWorkspace();
}

function resetFilters() {
  state.contributionFilter = 'All';
  state.stageFilter = 'All';
  state.checklistStatusFilter = 'all';
  state.searchQuery = '';
  const fc = document.getElementById('filter-contribution');
  const fs = document.getElementById('filter-stage');
  const gs = document.getElementById('global-search');
  const ms = document.getElementById('mobile-board-search');
  if (fc) fc.value = 'All';
  if (fs) fs.value = 'All';
  if (gs) gs.value = '';
  if (ms) ms.value = '';
  setChecklistStatusFilter('all');
  renderAll();
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
  selectEvidenceRecord,
  copyActiveEvidenceJson,
  renderEvidenceView,
  openPathwayDrawer,
  closePathwayDrawer,
  renderPathwayDrawer,
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
  toggleMobileSidebar
});
