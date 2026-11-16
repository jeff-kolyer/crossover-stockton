import 'leaflet/dist/leaflet.css';
import './style.css';
import { PRIMARY_RECORDS } from './generated/records.js';
import { createGroundTruthMap } from './ground-truth-map.js';

// -------------------------------------------------------------------------
    // 1. PRIMARY RECORDS DATABASE (Git-as-a-Database Archival Manifest)
    // -------------------------------------------------------------------------


    // Only published facility addresses receive markers. The other records use
    // approximate area or citywide context without claiming a precise location.
    const MAP_PINS = [
      { id: 'shelter', type: 'shelter', recordId: 'GOV-2026-003', latLng: [37.9352382, -121.2933142], title: 'Stockton Animal Services', address: '1575 S Lincoln St', phone: '(209) 937-7445', icon: 'warehouse' },
      { id: 'apl', type: 'clinic', recordId: 'CARE-2026-001', latLng: [37.9555460, -121.3114714], title: 'Animal Protection League', address: '1409 W Oak St', phone: '(209) 420-4776', icon: 'stethoscope' }
    ];
    const FIELD_ZONES = [
      { recordId: 'WORK-2026-002', center: [37.9475040, -121.2972333], radius: 700, name: "St. Mary's vicinity" },
      { recordId: 'WORK-2026-003', center: [37.916, -121.294], radius: 2500, name: 'South Stockton' }
    ];

    const CARE_RESOURCES = [{"name":"Animal Protection League","tags":["Spay/Neuter"],"eligibility":"Dog and cat spay/neuter advertised; confirm current eligibility.","waitTime":"Current openings not published in the checked source.","location":"1409 W Oak St, Stockton · (209) 420-4776","notes":"https://apl209.org/"},{"name":"Stockton Animal Services","tags":["Vaccines","Spay/Neuter"],"eligibility":"Low-cost vaccines and microchips; City dog spay/neuter is not listed.","waitTime":"Call for current schedule.","location":"1575 S Lincoln St · (209) 937-7445","notes":"https://www.stocktonca.gov/services/animal_services/"},{"name":"Found-pet drop-off guidance","tags":["Found Pet"],"eligibility":"For pets found in Stockton or unincorporated San Joaquin County.","waitTime":"Call for a drop-off appointment; same-day access is not guaranteed.","location":"Stockton Animal Services · (209) 937-7445","notes":"https://www.stocktonca.gov/services/animal_services/lost___found_pets.php"},{"name":"Animal complaint reporting","tags":["Found Pet"],"eligibility":"City lists injured or sick strays, animals at large, and abandonment.","waitTime":"No response-time guarantee in the checked source.","location":"City online reporting","notes":"https://www.stocktonca.gov/services/animal_services/animal_related_complaints.php"},{"name":"Animal Balance Stockton clinic","tags":["Spay/Neuter","Scheduled"],"eligibility":"Scheduled February 26–28, 2027; eligibility and venue not confirmed.","waitTime":"Future event; check provider schedule.","location":"Stockton venue to confirm","notes":"https://animalbalance.org/event/stockton-ca-2/"}];

    // -------------------------------------------------------------------------
    // 2. NAVIGATION & DEEP-LINKING CONTROLLER
    // -------------------------------------------------------------------------
    function switchTab(tabId) {
      if (!document.getElementById(`tab-${tabId}`)) tabId = 'overview';
      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.add('hidden');
      });
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
      });

      const targetPanel = document.getElementById(`tab-${tabId}`);
      const desktopNav = document.getElementById(`nav-${tabId}`);
      const mobileNav = document.getElementById(`mnav-${tabId}`);

      if (targetPanel) targetPanel.classList.remove('hidden');
      if (desktopNav) desktopNav.classList.add('active');
      if (mobileNav) {
        mobileNav.classList.add('active');
        if (mobileNav.offsetParent) mobileNav.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }

      // Update URL query param safely without reload
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tabId);
        window.history.replaceState({}, '', url);
      } catch (e) {}

      if (tabId === 'ground-truth') requestAnimationFrame(() => {
        groundTruthMap?.invalidateSize();
        if (!groundMapHasExplicitSelection) groundTruthMap?.showOverview();
      });
      lucide.createIcons();
    }

    function openRecord(recordId, subTab = 'artifact') {
      activeRecordId = PRIMARY_RECORDS.find(r => r.id === recordId || r.originalId === recordId)?.id || recordId;
      activeDossierSubTab = subTab;
      switchTab('evidence-room');
      renderEvidenceDrawer();
      renderDossierInspector();

      // Update URL param
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', 'evidence-room');
        url.searchParams.set('record', activeRecordId);
        window.history.replaceState({}, '', url);
      } catch (e) {}

      // On mobile/tablet stacked view, smoothly scroll to the opened dossier
      if (window.innerWidth < 1024) {
        setTimeout(() => {
          const inspector = document.getElementById('evidence-inspector-pane');
          if (inspector) inspector.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      }
    }

    function scrollToDrawer() {
      const drawer = document.getElementById('evidence-drawer-pane');
      if (drawer) drawer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function scrollToTipForm() {
      setTimeout(() => {
        const el = document.getElementById('tip-form-card');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }

    function showToast(msg) {
      const banner = document.getElementById('toast-banner');
      const text = document.getElementById('toast-message');
      if (!banner || !text) return;
      text.textContent = msg;
      banner.classList.remove('hidden');
      lucide.createIcons();
      clearTimeout(window.__toastTimer);
      window.__toastTimer = setTimeout(() => {
        banner.classList.add('hidden');
      }, 3200);
    }

    // -------------------------------------------------------------------------
    // 3. EVIDENCE ROOM STATE & RENDERER
    // -------------------------------------------------------------------------
    let activeRecordId = 'SHEL-2024-001';
    let activeEvidenceFilter = 'ALL';
    let activeDossierSubTab = 'artifact';
    let highlightAnomalies = true;
    let showCalcAudit = false;
    let showRedactionBasis = false;

    function setEvidenceFilter(status, btnEl) {
      activeEvidenceFilter = status;
      document.querySelectorAll('.ev-filter-btn').forEach(btn => {
        btn.classList.remove('bg-amber-500', 'text-slate-950');
        btn.classList.add('bg-slate-800', 'text-stone-300', 'hover:bg-slate-700');
      });
      if (btnEl) {
        btnEl.classList.remove('bg-slate-800', 'text-stone-300', 'hover:bg-slate-700');
        btnEl.classList.add('bg-amber-500', 'text-slate-950');
      }
      renderEvidenceDrawer();
    }

    function jumpToEvidenceFilter(status) {
      if (status === 'CHECKED') status = 'VERIFIED';
      const statuses = ['ALL', 'VERIFIED', 'REPORTED', 'FIRSTHAND', 'OPEN', 'WAITING'];
      const filterButton = document.querySelectorAll('.ev-filter-btn')[statuses.indexOf(status)];
      if (!filterButton) return;
      switchTab('evidence-room');
      setEvidenceFilter(status, filterButton);
      requestAnimationFrame(scrollToDrawer);
    }

    function matchesCatalogFilter(record, status) {
      return status === 'ALL' || (record.status === status && (status !== 'OPEN' || record.category === 'WORK_ITEM'));
    }

    function renderEvidenceDrawer() {
      const container = document.getElementById('evidence-list-container');
      const searchInput = document.getElementById('evidence-search');
      if (!container) return;

      const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

      const filtered = PRIMARY_RECORDS.filter(rec => {
        const matchesStatus = matchesCatalogFilter(rec, activeEvidenceFilter);
        const matchesQuery = !query ||
          rec.id.toLowerCase().includes(query) ||
          rec.originalId.toLowerCase().includes(query) ||
          rec.title.toLowerCase().includes(query) ||
          rec.sourceAgency.toLowerCase().includes(query) ||
          rec.summary.toLowerCase().includes(query);
        return matchesStatus && matchesQuery;
      });

      const statusStyles = {
        VERIFIED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        WAITING_CPRA: 'bg-amber-100 text-amber-800 border-amber-200',
        OPEN_INVESTIGATION: 'bg-blue-100 text-blue-800 border-blue-200', REPORTED: 'bg-amber-100 text-amber-800 border-amber-200', FIRSTHAND: 'bg-sky-100 text-sky-800 border-sky-200', OPEN: 'bg-sky-100 text-sky-800 border-sky-200', WAITING: 'bg-amber-100 text-amber-800 border-amber-200'
      };

      if (filtered.length === 0) {
        container.innerHTML = `<div class="p-6 text-center text-xs text-stone-500">No matching entries found.</div>`;
        return;
      }

      container.innerHTML = filtered.map(rec => {
        const isSelected = rec.id === activeRecordId;
        return `
          <button onclick="openRecord('${rec.id}')" class="w-full text-left p-4 transition-colors block focus:outline-none ${isSelected ? 'bg-amber-50/90 border-l-4 border-l-amber-500' : 'hover:bg-stone-50'}">
            <div class="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
              <span class="font-mono text-xs font-bold text-slate-900">${rec.id}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border whitespace-nowrap ${statusStyles[rec.status]}">
                ${rec.statusLabel.toUpperCase()}
              </span>
            </div>
            <div class="font-semibold text-xs text-slate-900 leading-snug mb-1.5">${rec.title}</div>
            <div class="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-stone-500">
              <span>${rec.tier}</span>
              <span>${rec.category === 'WORK_ITEM' ? 'Work item' : rec.categoryLabel}</span>
            </div>
          </button>
        `;
      }).join('');
    }

    function setDossierSubTab(subTab) {
      activeDossierSubTab = subTab;
      renderDossierInspector();
    }

    function toggleArtifactFlag(flagName) {
      if (flagName === 'anomalies') highlightAnomalies = !highlightAnomalies;
      if (flagName === 'calc') showCalcAudit = !showCalcAudit;
      if (flagName === 'redaction') showRedactionBasis = !showRedactionBasis;
      renderDossierInspector();
    }

    function copyFormalCitation(recordId) {
      const rec = PRIMARY_RECORDS.find(r => r.id === recordId);
      if (!rec) return;
      const citation = `Crossover Stockton care and action record. Entry [${rec.id}]: "${rec.title}." Source: ${rec.sourceAgency}${rec.sourceUrl ? `, ${rec.sourceUrl}` : ''} (recorded or checked ${rec.dateAcquired}).`;

      // Fallback-safe copy for iFrame environments
      const textarea = document.createElement('textarea');
      textarea.value = citation;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        showToast(`Copied citation for ${rec.id}`);
      } catch (err) {
        showToast(`Citation ready: ${rec.id}`);
      }
      document.body.removeChild(textarea);
    }

    function downloadCleanedCsv(recordId) {
      const rec = PRIMARY_RECORDS.find(r => r.id === recordId);
      if (!rec) return;
      let csvContent = `Record_ID,Title,Source_Agency,Date_Acquired,Spatial_Precision\n"${rec.id}","${rec.title}","${rec.sourceAgency}","${rec.dateAcquired}","${rec.spatialPrecision}"\n`;

      if (rec.csvHeaders && rec.csvRows) {
        csvContent += `\n${rec.csvHeaders.join(',')}\n`;
        rec.csvRows.forEach(row => {
          csvContent += rec.csvHeaders.map(h => `"${row[h]}"`).join(',') + '\n';
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${rec.id}_entry.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`Downloaded ${rec.id}_entry.csv`);
    }

    function renderDossierInspector() {
      const container = document.getElementById('dossier-content');
      const mobileBadge = document.getElementById('mobile-active-rec-id');
      const rec = PRIMARY_RECORDS.find(r => r.id === activeRecordId) || PRIMARY_RECORDS[0];

      if (mobileBadge) mobileBadge.textContent = rec.id;

      const statusBadge = {
        VERIFIED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        WAITING_CPRA: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        OPEN_INVESTIGATION: 'bg-sky-500/20 text-sky-300 border-sky-500/40', REPORTED: 'bg-amber-500/20 text-amber-300 border-amber-500/40', FIRSTHAND: 'bg-sky-500/20 text-sky-300 border-sky-500/40', OPEN: 'bg-sky-500/20 text-sky-300 border-sky-500/40', WAITING: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      }[rec.status];

      const severityBadge = {
        CRITICAL: 'bg-rose-100 text-rose-800 border-rose-200',
        HIGH: 'bg-amber-100 text-amber-800 border-amber-200',
        'PENDING VERIFICATION': 'bg-slate-200 text-slate-800 border-slate-300'
      }[rec.severityBasis.level] || 'bg-stone-100 text-stone-800 border-stone-200';

      // Build Sub-Tab 1: Primary Source Artifact HTML
      let artifactHtml = '';
      if (rec.artifactType === 'DISPATCH_TABLE') {
        artifactHtml = `
          <div class="space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <div class="text-xs text-stone-600 font-mono">Showing representative sample of 7,183 scrubbed CAD rows</div>
              <button onclick="toggleArtifactFlag('anomalies')" class="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition ${highlightAnomalies ? 'bg-amber-500 text-slate-950 border-amber-600' : 'bg-white text-slate-700 border-stone-300'}">
                ${highlightAnomalies ? '✓ Highlighting GOA Delays' : 'Highlight Delays / GOA'}
              </button>
            </div>
            <div class="overflow-x-auto border border-stone-200 rounded-xl">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-slate-900 text-stone-200 font-mono text-[11px]">
                    ${rec.csvHeaders.map(h => `<th class="py-2.5 px-3.5 whitespace-nowrap">${h}</th>`).join('')}
                  </tr>
                </thead>
                <tbody class="divide-y divide-stone-200 font-mono">
                  ${rec.csvRows.map(row => `
                    <tr class="${highlightAnomalies && row.anomaly ? 'bg-amber-50/90 text-amber-950' : 'bg-white text-stone-700'}">
                      <td class="py-2.5 px-3.5 font-semibold whitespace-nowrap">${row.Call_ID}</td>
                      <td class="py-2.5 px-3.5 whitespace-nowrap">${row.Block_Location}</td>
                      <td class="py-2.5 px-3.5 whitespace-nowrap">${row.Priority}</td>
                      <td class="py-2.5 px-3.5 whitespace-nowrap ${highlightAnomalies && row.anomaly ? 'font-bold text-rose-700' : ''}">${row.Response_Min} min</td>
                      <td class="py-2.5 px-3.5 whitespace-nowrap">${row.Disposition}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      } else if (rec.artifactType === 'SHELTER_LEDGER') {
        artifactHtml = `
          <div class="space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <div class="text-xs text-stone-600 font-mono">FY 2025 Canine Intake Breakdown (N = 3,106)</div>
              <button onclick="toggleArtifactFlag('calc')" class="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition ${showCalcAudit ? 'bg-slate-900 text-amber-400 border-slate-900' : 'bg-white text-slate-700 border-stone-300'}">
                ${showCalcAudit ? '✓ Calculation Audit Visible' : 'Show Calculation Audit'}
              </button>
            </div>
            <div class="overflow-x-auto border border-stone-200 rounded-xl">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-slate-900 text-stone-200 font-mono text-[11px]">
                    <th class="py-2.5 px-3.5">Intake Category</th>
                    <th class="py-2.5 px-3.5">Count</th>
                    <th class="py-2.5 px-3.5">Share</th>
                    ${showCalcAudit ? '<th class="py-2.5 px-3.5 text-amber-300">Audit Formula</th>' : ''}
                  </tr>
                </thead>
                <tbody class="divide-y divide-stone-200">
                  ${rec.ledgerSummary.map((row, idx) => `
                    <tr class="${idx === rec.ledgerSummary.length - 1 ? 'bg-stone-100 font-bold text-slate-900' : 'bg-white text-stone-700'}">
                      <td class="py-2.5 px-3.5">${row.type}</td>
                      <td class="py-2.5 px-3.5 font-mono">${row.count.toLocaleString()}</td>
                      <td class="py-2.5 px-3.5 font-mono">${row.pct}</td>
                      ${showCalcAudit ? `<td class="py-2.5 px-3.5 font-mono text-[11px] text-emerald-800 bg-emerald-50/60">${row.formula}</td>` : ''}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      } else if (rec.artifactType === 'FIELD_CHECKLIST') {
        artifactHtml = `
          <div class="space-y-3">
            ${rec.sourceUrl ? `<a href="${rec.sourceUrl}" target="_blank" rel="noopener noreferrer" class="text-xs font-bold text-amber-800 underline">Open original source ↗</a>` : `<p class="text-xs text-stone-500">Original artifact is not attached to this preview.</p>`}
            ${rec.checklistItems.map(item => `
              <div class="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-1.5">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <span class="font-mono text-xs font-bold text-slate-900">${item.item}</span>
                  <span class="px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">${item.status}</span>
                </div>
                <p class="text-xs text-stone-700 leading-relaxed">${item.note}</p>
              </div>
            `).join('')}
          </div>
        `;
      } else if (rec.artifactType === 'CLINIC_MATRIX') {
        artifactHtml = `
          <div class="overflow-x-auto border border-stone-200 rounded-xl">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-900 text-stone-200 font-mono text-[11px]">
                  <th class="py-2.5 px-3.5">Provider</th>
                  <th class="py-2.5 px-3.5">Distance from 95206</th>
                  <th class="py-2.5 px-3.5">Waitlist</th>
                  <th class="py-2.5 px-3.5">Transit Barrier</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-200">
                ${rec.clinicRows.map(r => `
                  <tr class="bg-white text-stone-700">
                    <td class="py-2.5 px-3.5 font-semibold text-slate-900">${r.provider}</td>
                    <td class="py-2.5 px-3.5 font-mono">${r.distFromSouth}</td>
                    <td class="py-2.5 px-3.5 font-mono font-bold ${r.waitlistDays > 60 ? 'text-rose-700' : 'text-slate-800'}">${r.waitlistDays} days</td>
                    <td class="py-2.5 px-3.5">${r.transitAccess}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      } else if (rec.artifactType === 'CPRA_FILING') {
        artifactHtml = `
          <div class="space-y-4">
            <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-2">
              <div class="text-xs text-amber-950">
                <span class="font-mono font-bold block">STATUTORY CLOCK ACTIVE</span>
                <span>Target Release Date: <strong>${rec.statutoryDeadline}</strong></span>
              </div>
              <button onclick="toggleArtifactFlag('redaction')" class="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-900 text-amber-400 transition">
                ${showRedactionBasis ? 'Hide Legal Basis' : 'Inspect Redaction / Extension Basis'}
              </button>
            </div>
            ${showRedactionBasis ? `
              <div class="p-3.5 rounded-xl bg-slate-900 text-stone-200 text-xs font-mono border border-slate-700">
                STATUTORY CITATION: ${rec.redactionBasis}
              </div>
            ` : ''}
            <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 font-mono text-xs text-stone-700 leading-relaxed">
              <div class="text-[10px] uppercase text-stone-400 font-bold mb-1.5">Submitted Request Text Excerpt</div>
              "${rec.filingExcerpt}"
            </div>
          </div>
        `;
      } else if (rec.artifactType === 'RAW_SIGHTINGS') {
        artifactHtml = `
          <div class="overflow-x-auto border border-stone-200 rounded-xl">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-900 text-stone-200 font-mono text-[11px]">
                  <th class="py-2.5 px-3.5">Sweep Window</th>
                  <th class="py-2.5 px-3.5">Corridor</th>
                  <th class="py-2.5 px-3.5">Dogs Logged</th>
                  <th class="py-2.5 px-3.5">Field Condition Notes</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-200">
                ${rec.sightingRows.map(s => `
                  <tr class="bg-white text-stone-700">
                    <td class="py-2.5 px-3.5 font-mono whitespace-nowrap">${s.week}</td>
                    <td class="py-2.5 px-3.5 font-semibold text-slate-900">${s.corridor}</td>
                    <td class="py-2.5 px-3.5 font-mono font-bold text-rose-700">${s.dogsLogged}</td>
                    <td class="py-2.5 px-3.5">${s.condition}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }

      // Build Sub-Tab 2: Extracted Claims HTML
      const claimsHtml = `
        <div class="space-y-3">
          <p class="text-xs text-stone-600">Source details recorded for <strong>${rec.id}</strong>:</p>
          ${rec.extractedClaims.length ? rec.extractedClaims.map(c => `
            <div class="p-4 rounded-xl border border-stone-200 bg-stone-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="font-bold text-sm text-slate-900">${c.metric}</div>
                <div class="text-xs text-stone-600">${c.note}</div>
                <div class="font-mono text-[11px] text-stone-500">Published on: ${c.location}</div>
              </div>
              <button onclick="switchTab('${c.tab}')" class="shrink-0 self-start sm:self-center px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-semibold transition flex items-center gap-1.5">
                <span>View on Site</span>
                <i data-lucide="arrow-up-right" class="w-3.5 h-3.5 text-amber-400"></i>
              </button>
            </div>
          `).join('') : '<p class="text-xs text-stone-500">No separate published claim is linked to this entry.</p>'}
        </div>
      `;

      // Build Sub-Tab 3: Chain of Custody & Agency Right-of-Reply HTML
      const custodyHtml = `
        <div class="space-y-6">
          <div>
            <h4 class="font-mono text-xs uppercase text-stone-500 font-bold mb-3">Archival Chain of Custody</h4>
            <div class="space-y-3 border-l-2 border-amber-500 pl-4 ml-2">
              ${rec.custodyChain.map(ev => `
                <div class="space-y-0.5">
                  <div class="font-mono text-[11px] text-amber-800 font-semibold">${ev.date} &bull; ${ev.actor}</div>
                  <p class="text-xs text-stone-700">${ev.action}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="pt-4 border-t border-stone-200">
            <h4 class="font-mono text-xs uppercase text-stone-500 font-bold mb-3">Agency Right-of-Reply &amp; Errata</h4>
            ${rec.agencyResponses && rec.agencyResponses.length > 0 ? rec.agencyResponses.map(resp => `
              <div class="p-4 rounded-xl bg-slate-900 text-stone-200 space-y-1.5">
                <div class="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-amber-400">
                  <span>${resp.agency}</span>
                  <span>${resp.date}</span>
                </div>
                <p class="text-xs leading-relaxed">"${resp.statement}"</p>
              </div>
            `).join('') : `
              <div class="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-500">
                No formal agency clarification or errata has been filed for <strong>${rec.id}</strong>. Agencies may submit verbatim responses for publication alongside any record.
              </div>
            `}
          </div>
        </div>
      `;

      container.innerHTML = `
        <!-- Dossier Header -->
        <div class="p-5 sm:p-6 bg-slate-900 text-stone-100 border-b border-slate-800 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-mono text-xs sm:text-sm font-bold text-amber-400">${rec.id}</span>
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${statusBadge}">
                ${rec.statusLabel.toUpperCase()}
              </span>
              <span class="px-2 py-0.5 rounded bg-slate-800 text-stone-300 font-mono text-[10px] border border-slate-700">
                ${rec.sourceUrl ? 'ORIGINAL SOURCE LINKED' : 'NO PUBLIC ARTIFACT'}
              </span>
            </div>
            <span class="font-mono text-[11px] text-stone-400">Recorded / checked: ${rec.dateAcquired}</span>
          </div>

          <div>
            <h3 class="text-lg sm:text-xl font-bold text-white leading-snug">${rec.title}</h3>
            <p class="text-xs text-stone-300 mt-1.5 leading-relaxed">${rec.summary}</p>
          </div>

          <!-- Archival Export & Citation Actions -->
          <div class="flex flex-wrap items-center gap-2 pt-1">
            <button onclick="downloadCleanedCsv('${rec.id}')" class="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold transition flex items-center gap-1.5">
              <i data-lucide="download" class="w-3.5 h-3.5"></i>
              <span>Export Entry CSV</span>
            </button>
            <button onclick="copyFormalCitation('${rec.id}')" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-stone-100 border border-slate-700 font-mono text-xs font-medium transition flex items-center gap-1.5">
              <i data-lucide="copy" class="w-3.5 h-3.5 text-amber-400"></i>
              <span>Copy Formal Citation</span>
            </button>
          </div>
        </div>

        <!-- Severity Basis Formula Callout -->
        <div class="px-5 sm:px-6 py-3.5 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="space-y-0.5">
            <div class="text-[10px] font-mono uppercase text-stone-500 font-bold">Scope &amp; Limits</div>
            <div class="text-xs font-mono text-slate-900">${rec.severityBasis.formula}</div>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border self-start sm:self-center whitespace-nowrap ${severityBadge}">
            ${rec.severityBasis.level}
          </span>
        </div>

        <!-- Dossier Sub-Navigation Tabs -->
        <div class="px-5 sm:px-6 border-b border-stone-200 flex items-center overflow-x-auto no-scrollbar gap-4 bg-white">
          <button onclick="setDossierSubTab('artifact')" class="py-3 text-xs font-mono font-semibold whitespace-nowrap border-b-2 transition ${activeDossierSubTab === 'artifact' ? 'border-amber-500 text-slate-900' : 'border-transparent text-stone-500 hover:text-slate-800'}">
            1. Primary Source Artifact
          </button>
          <button onclick="setDossierSubTab('claims')" class="py-3 text-xs font-mono font-semibold whitespace-nowrap border-b-2 transition ${activeDossierSubTab === 'claims' ? 'border-amber-500 text-slate-900' : 'border-transparent text-stone-500 hover:text-slate-800'}">
            2. Extracted Claims (${rec.extractedClaims.length})
          </button>
          <button onclick="setDossierSubTab('custody')" class="py-3 text-xs font-mono font-semibold whitespace-nowrap border-b-2 transition ${activeDossierSubTab === 'custody' ? 'border-amber-500 text-slate-900' : 'border-transparent text-stone-500 hover:text-slate-800'}">
            3. Custody &amp; Agency Reply
          </button>
        </div>

        <!-- Active Sub-Tab Body -->
        <div class="p-5 sm:p-6">
          ${activeDossierSubTab === 'artifact' ? artifactHtml : activeDossierSubTab === 'claims' ? claimsHtml : custodyHtml}
        </div>
      `;

      lucide.createIcons();
    }

    // -------------------------------------------------------------------------
    // 4. GROUND TRUTH: INTERACTIVE MAP & RECORDS INDEX TABLE
    // -------------------------------------------------------------------------
    let activeMapLayers = new Set(['grid', 'zones', 'clinic', 'shelter']);
    let groundTruthMap;
    let groundMapHasExplicitSelection = false;
    let selectedGroundRecordId = 'GOV-2026-003';

    const SHELTER_SITE_RECORDS = new Set([
      'GOV-2026-002', 'GOV-2026-003', 'SHEL-2024-002', 'SHEL-2024-003',
      'FLD-2026-001', 'FLD-2026-002', 'NEWS-2026-005', 'NEWS-2026-011', 'GOV-2026-007'
    ]);

    function mapContextForRecord(rec) {
      if (rec.id === 'CARE-2026-001') return {
        kind: 'point', pinId: 'apl', label: 'Animal Protection League · 1409 W Oak St',
        note: 'This marker is the published clinic address, not a measure of current appointment access.'
      };
      if (SHELTER_SITE_RECORDS.has(rec.id)) return {
        kind: 'point', pinId: 'shelter', label: 'Stockton Animal Services · 1575 S Lincoln St',
        note: 'This marker is the documented facility address, not the location of every event described in the record.'
      };
      if (rec.id === 'CARE-2026-002' || rec.id === 'WORK-2026-002') return {
        kind: 'area', center: FIELD_ZONES[0].center, radius: FIELD_ZONES[0].radius,
        label: "St. Mary's vicinity · approximate context",
        note: 'The circle is for orientation near the named service location. It is not a measured dog concentration or verified boundary.'
      };
      if (rec.id === 'WORK-2026-003') return {
        kind: 'area', center: FIELD_ZONES[1].center, radius: FIELD_ZONES[1].radius,
        label: 'South Stockton · broad investigation area',
        note: 'This broad circle only locates the area named by the work item. Specific conditions and boundaries remain unverified.'
      };
      if (rec.id === 'NEWS-2026-001') return {
        kind: 'area', center: [37.9575558, -121.3436509], radius: 900,
        label: 'Louis Park vicinity · one reported place',
        note: 'The report also names other places. This circle is an approximate reference around Louis Park, not a hotspot or incident boundary.'
      };
      return {
        kind: 'city', label: 'Stockton / wider service-area context',
        note: rec.category === 'WORK_ITEM'
          ? 'This is an open work item without a verified site. No pin is shown until a location is checked.'
          : 'This record does not establish one precise location. The map stays on Stockton without assigning it a pin.'
      };
    }

    function mapText(value) {
      return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      })[char]);
    }

    function renderMapPins() {
      if (groundTruthMap) return;
      const element = document.getElementById('ground-truth-map');
      if (!element) return;
      groundTruthMap = createGroundTruthMap(element, MAP_PINS, FIELD_ZONES, selectMapPin, recordId => selectGroundTruthRecord(recordId, false));
      groundTruthMap.focus({ ...mapContextForRecord(PRIMARY_RECORDS.find(rec => rec.id === selectedGroundRecordId)), recordId: selectedGroundRecordId });
      groundTruthMap.showOverview();
    }

    function selectMapPin(pinId) {
      const pin = MAP_PINS.find(item => item.id === pinId);
      if (pin) selectGroundTruthRecord(pin.recordId, false);
    }

    function toggleMapLayer(layerType) {
      if (!['grid', 'zones', 'clinic', 'shelter'].includes(layerType)) return;
      const visible = !activeMapLayers.has(layerType);
      if (visible) activeMapLayers.add(layerType);
      else activeMapLayers.delete(layerType);
      const button = document.getElementById(`layer-btn-${layerType}`);
      button?.setAttribute('aria-pressed', String(visible));
      button?.classList.toggle('opacity-40', !visible);
      groundTruthMap?.setLayerVisible(layerType, visible);
    }

    function renderMapInspector() {
      const container = document.getElementById('map-inspector-content');
      const rec = PRIMARY_RECORDS.find(item => item.id === selectedGroundRecordId);
      if (!container || !rec) return;
      const context = mapContextForRecord(rec);
      const pin = context.kind === 'point' ? MAP_PINS.find(item => item.id === context.pinId) : null;
      const zone = FIELD_ZONES.find(item => item.recordId === rec.id);
      const placeName = pin?.title || zone?.name || (context.kind === 'area' ? context.label.split(' · ')[0] : rec.title);
      const placeDetail = pin?.address || (context.kind === 'area' ? 'APPROXIMATE AREA' : 'NO PRECISE PIN');
      const recordDescription = placeName === rec.title
        ? `${rec.sourceAgency} · ${rec.statusLabel}`
        : pin ? `${pin.type === 'clinic' ? 'Low-cost clinic' : 'City shelter'} · ${rec.title}` : rec.title;
      const metricLabel = pin?.phone ? 'Published contact' : 'Catalog status';
      const metricValue = pin?.phone || rec.statusLabel;
      const contextBadge = context.kind === 'point'
        ? pin?.type === 'clinic' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-sky-100 text-sky-800 border-sky-200'
        : context.kind === 'area'
          ? 'bg-rose-100 text-rose-800 border-rose-200'
          : 'bg-stone-100 text-stone-700 border-stone-200';
      const sourceUrl = (() => {
        try { const url = new URL(rec.sourceUrl); return ['http:', 'https:'].includes(url.protocol) ? url.href : null; }
        catch { return null; }
      })();
      container.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span data-map-record-id class="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold border ${contextBadge}">${mapText(rec.id)}</span>
          <span class="text-[11px] font-mono text-stone-400">${mapText(placeDetail)}</span>
        </div>
        <div>
          <h3 class="text-xl font-bold text-slate-900 leading-snug">${mapText(placeName)}</h3>
          <p class="text-xs text-stone-600 mt-1 leading-relaxed">${mapText(recordDescription)}</p>
        </div>
        <div class="p-3.5 rounded-xl bg-stone-100 border border-stone-200">
          <div class="text-[10px] font-mono uppercase text-stone-500 font-semibold mb-1">${metricLabel}</div>
          <p class="text-sm font-semibold text-slate-900">${mapText(metricValue)}</p>
        </div>
        <div>
          <div class="text-[10px] font-mono uppercase text-stone-500 font-semibold mb-1">Field &amp; spatial notes</div>
          <div class="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <p class="text-xs text-stone-700 leading-relaxed">${mapText(context.note)}</p>
          </div>
        </div>
        <details class="text-xs text-stone-600">
          <summary class="cursor-pointer font-semibold text-amber-800">Record summary &amp; limits</summary>
          <p class="mt-2 leading-relaxed">${mapText(rec.summary)}</p>
          <p class="text-xs text-stone-700 leading-relaxed">${mapText(rec.limitations)}</p>
          ${sourceUrl ? `<a href="${mapText(sourceUrl)}" target="_blank" rel="noopener noreferrer" class="block mt-2 font-semibold text-amber-800 underline underline-offset-2">Open original source ↗</a>` : ''}
        </details>
        <button onclick="openRecord('${rec.id}')" class="w-full py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-mono text-xs font-semibold flex items-center justify-center gap-2 transition">
          <i data-lucide="folder-open" class="w-3.5 h-3.5"></i><span>Open linked record [${mapText(rec.id)}]</span>
        </button>
      `;
      lucide.createIcons();
    }

    function selectGroundTruthRecord(recordId, scrollToMap = true) {
      const rec = PRIMARY_RECORDS.find(item => item.id === recordId || item.originalId === recordId);
      if (!rec) return;
      groundMapHasExplicitSelection = true;
      selectedGroundRecordId = rec.id;
      if (document.getElementById('tab-ground-truth')?.classList.contains('hidden')) switchTab('ground-truth');
      renderMapPins();
      const context = mapContextForRecord(rec);
      if (context.kind === 'point') {
        const pin = MAP_PINS.find(item => item.id === context.pinId);
        if (pin && !activeMapLayers.has(pin.type)) toggleMapLayer(pin.type);
      }
      if (FIELD_ZONES.some(zone => zone.recordId === rec.id) && !activeMapLayers.has('zones')) toggleMapLayer('zones');
      groundTruthMap?.focus({ ...context, recordId: rec.id });
      renderMapInspector();
      document.querySelectorAll('#gt-records-tbody tr, #gt-records-mobile [data-record-id]').forEach(row => {
        const selected = row.dataset.recordId === rec.id;
        row.classList.toggle('bg-amber-50', selected);
        row.setAttribute(row.tagName === 'BUTTON' ? 'aria-pressed' : 'aria-selected', String(selected));
      });
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', 'ground-truth');
        url.searchParams.set('record', rec.id);
        window.history.replaceState({}, '', url);
      } catch (e) {}
      if (scrollToMap) requestAnimationFrame(() => document.getElementById('ground-truth-map-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }

    function filterGroundTruthRecords(statusFilter, btnEl) {
      document.querySelectorAll('.gt-rec-filter').forEach(btn => {
        btn.classList.remove('bg-slate-900', 'text-white');
        btn.classList.add('bg-stone-100', 'text-stone-700');
        btn.setAttribute('aria-pressed', 'false');
      });
      if (btnEl) {
        btnEl.classList.remove('bg-stone-100', 'text-stone-700');
        btnEl.classList.add('bg-slate-900', 'text-white');
        btnEl.setAttribute('aria-pressed', 'true');
      }
      renderGroundTruthTable(statusFilter);
    }

    function renderGroundTruthTable(statusFilter = 'ALL') {
      const tbody = document.getElementById('gt-records-tbody');
      if (!tbody) return;

      const filtered = statusFilter === 'ALL'
        ? PRIMARY_RECORDS
        : PRIMARY_RECORDS.filter(r => matchesCatalogFilter(r, statusFilter));

      const statusBadgeStyles = {
        VERIFIED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        WAITING_CPRA: 'bg-amber-100 text-amber-800 border-amber-200',
        OPEN_INVESTIGATION: 'bg-blue-100 text-blue-800 border-blue-200', REPORTED: 'bg-amber-100 text-amber-800 border-amber-200', FIRSTHAND: 'bg-sky-100 text-sky-800 border-sky-200', OPEN: 'bg-sky-100 text-sky-800 border-sky-200', WAITING: 'bg-amber-100 text-amber-800 border-amber-200'
      };

      tbody.innerHTML = filtered.map(rec => `
        <tr data-record-id="${rec.id}" aria-selected="${rec.id === selectedGroundRecordId}" tabindex="0" onclick="selectGroundTruthRecord('${rec.id}')" onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectGroundTruthRecord('${rec.id}'); }" class="hover:bg-amber-50/60 focus:bg-amber-50 focus:outline-amber-500 cursor-pointer transition-colors ${rec.id === selectedGroundRecordId ? 'bg-amber-50' : ''}">
          <td class="py-3.5 px-4 sm:px-5 font-mono text-xs font-bold text-slate-900 whitespace-nowrap">${rec.id}</td>
          <td class="py-3.5 px-4 sm:px-5 text-xs">
            <div class="font-semibold text-slate-900">${mapText(rec.title)}</div>
            <div class="text-stone-500 text-[11px]">${mapText(rec.sourceAgency)}</div>
          </td>
          <td class="py-3.5 px-4 sm:px-5 text-xs text-stone-700">${mapText(rec.extractedClaims[0] ? rec.extractedClaims[0].metric : rec.summary)}</td>
          <td class="py-3.5 px-4 sm:px-5 whitespace-nowrap">
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${statusBadgeStyles[rec.status]}">
              ${rec.statusLabel.toUpperCase()}
            </span>
          </td>
          <td class="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap">
            <button type="button" data-evidence-id="${rec.id}" onclick="event.stopPropagation(); openRecord('${rec.id}')" onkeydown="event.stopPropagation()" class="font-mono text-xs font-semibold text-amber-800 hover:text-amber-950 hover:underline focus-visible:outline-2 focus-visible:outline-amber-500">Inspect ↗</button>
          </td>
        </tr>
      `).join('');

      const mobileList = document.getElementById('gt-records-mobile');
      if (mobileList) mobileList.innerHTML = filtered.map(rec => `
        <div class="relative">
          <button type="button" data-record-id="${rec.id}" aria-label="Show ${mapText(rec.id)} on map" aria-pressed="${rec.id === selectedGroundRecordId}" onclick="selectGroundTruthRecord('${rec.id}')" class="w-full text-left px-4 py-2.5 hover:bg-amber-50 focus:bg-amber-50 focus:outline-amber-500 ${rec.id === selectedGroundRecordId ? 'bg-amber-50' : ''}">
            <span class="flex items-start justify-between gap-3">
              <span class="font-mono text-[11px] font-bold text-slate-900">${mapText(rec.id)}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border shrink-0 ${statusBadgeStyles[rec.status]}">${mapText(rec.statusLabel.toUpperCase())}</span>
            </span>
            <span class="block mt-1 text-sm font-semibold text-slate-900 leading-snug">${mapText(rec.title)}</span>
            <span class="block pr-16 truncate mt-0.5 text-[11px] text-stone-500">${mapText(rec.sourceAgency)}</span>
          </button>
          <button type="button" data-evidence-id="${rec.id}" onclick="openRecord('${rec.id}')" class="absolute bottom-2.5 right-3 font-mono text-[11px] font-semibold text-amber-800 hover:text-amber-950 hover:underline focus-visible:outline-2 focus-visible:outline-amber-500">Inspect ↗</button>
        </div>
      `).join('');

      lucide.createIcons();
    }

    // -------------------------------------------------------------------------
    // 5. CARE RESOURCES: TRIAGE TOGGLE & DIRECTORY FILTER
    // -------------------------------------------------------------------------
    function setTriageMode(mode) {
      const btnStray = document.getElementById('triage-btn-stray');
      const btnVet = document.getElementById('triage-btn-vet');
      const output = document.getElementById('triage-output');

      if (mode === 'stray') {
        btnStray.className = 'px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-amber-500 text-slate-950 transition shadow-sm';
        btnVet.className = 'px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-stone-300 hover:text-white transition';

        output.innerHTML = `
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-slate-850 border border-slate-700/80 rounded-xl p-4 space-y-2">
              <span class="font-mono text-xs text-amber-400 font-bold">STEP 01 // SAFETY FIRST</span>
              <h4 class="font-bold text-white text-sm">Assess Behavior &amp; Contain</h4>
              <p class="text-xs text-stone-300 leading-relaxed">If injured or aggressive, keep distance and call Municipal Dispatch immediately. If friendly, secure with a slip-lead in a fenced yard or bathroom away from resident pets.</p>
            </div>
            <div class="bg-slate-850 border border-slate-700/80 rounded-xl p-4 space-y-2">
              <span class="font-mono text-xs text-amber-400 font-bold">STEP 02 // CHIP CHECK</span>
              <h4 class="font-bold text-white text-sm">Free Microchip Scan</h4>
              <p class="text-xs text-stone-300 leading-relaxed">Ask the City shelter or a clinic about a microchip scan. Call ahead to confirm availability.</p>
            </div>
            <div class="bg-slate-850 border border-slate-700/80 rounded-xl p-4 space-y-2">
              <span class="font-mono text-xs text-amber-400 font-bold">STEP 03 // LEGAL HOLD</span>
              <h4 class="font-bold text-white text-sm">File a Found-Pet Report</h4>
              <p class="text-xs text-stone-300 leading-relaxed">The City asks finders to call (209) 937-7445 for a shelter drop-off appointment. Follow its current lost-and-found guidance.</p>
            </div>
            <div class="bg-slate-850 border border-slate-700/80 rounded-xl p-4 space-y-2">
              <span class="font-mono text-xs text-amber-400 font-bold">STEP 04 // FOSTER BRIDGE</span>
              <h4 class="font-bold text-white text-sm">Request Finder Support</h4>
              <p class="text-xs text-stone-300 leading-relaxed">Ask the shelter about lawful finder options and local rescue referrals; availability is not guaranteed.</p>
            </div>
          </div>
        `;
      } else {
        btnVet.className = 'px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-amber-500 text-slate-950 transition shadow-sm';
        btnStray.className = 'px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-stone-300 hover:text-white transition';

        output.innerHTML = `
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-slate-850 border border-slate-700/80 rounded-xl p-4 space-y-2">
              <span class="font-mono text-xs text-emerald-400 font-bold">STEP 01 // PREVENTIVE</span>
              <h4 class="font-bold text-white text-sm">Vaccines &amp; Microchipping</h4>
              <p class="text-xs text-stone-300 leading-relaxed">The City advertises low-cost vaccinations and microchips. Call to confirm current dates and costs.</p>
            </div>
            <div class="bg-slate-850 border border-slate-700/80 rounded-xl p-4 space-y-2">
              <span class="font-mono text-xs text-emerald-400 font-bold">STEP 02 // STERILIZATION</span>
              <h4 class="font-bold text-white text-sm">Ask About Spay/Neuter</h4>
              <p class="text-xs text-stone-300 leading-relaxed">APL advertises low-cost dog and cat surgery. Ask about current pricing, eligibility, and appointment openings.</p>
            </div>
            <div class="bg-slate-850 border border-slate-700/80 rounded-xl p-4 space-y-2">
              <span class="font-mono text-xs text-emerald-400 font-bold">STEP 03 // SUPPLIES</span>
              <h4 class="font-bold text-white text-sm">Offset Monthly Food Costs</h4>
              <p class="text-xs text-stone-300 leading-relaxed">Pet-food support listings still need direct verification. Ask local rescue partners about current referrals.</p>
            </div>
            <div class="bg-slate-850 border border-slate-700/80 rounded-xl p-4 space-y-2">
              <span class="font-mono text-xs text-rose-400 font-bold">STEP 04 // URGENT CARE</span>
              <h4 class="font-bold text-white text-sm">Get a Written Vet Estimate</h4>
              <p class="text-xs text-stone-300 leading-relaxed">For an injured or sick stray, contact City Animal Services. For your own pet, call a veterinary clinic for urgent advice and costs.</p>
            </div>
          </div>
        `;
      }
    }

    function filterResources(tagFilter, btnEl) {
      document.querySelectorAll('.res-filter-btn').forEach(btn => {
        btn.classList.remove('active-res-filter', 'bg-slate-900', 'text-white');
        btn.classList.add('bg-white', 'text-stone-700', 'border', 'border-stone-200', 'hover:bg-stone-100');
        btn.setAttribute('aria-pressed', 'false');
      });
      if (btnEl) {
        btnEl.classList.remove('bg-white', 'text-stone-700', 'border', 'border-stone-200', 'hover:bg-stone-100');
        btnEl.classList.add('active-res-filter', 'bg-slate-900', 'text-white');
        btnEl.setAttribute('aria-pressed', 'true');
      }
      renderResourcesGrid(tagFilter);
    }

    function renderResourcesGrid(tagFilter = 'ALL') {
      const grid = document.getElementById('resources-grid');
      if (!grid) return;

      const filtered = tagFilter === 'ALL'
        ? CARE_RESOURCES
        : CARE_RESOURCES.filter(r => r.tags.includes(tagFilter));

      grid.innerHTML = filtered.map(res => `
        <div class="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 flex flex-col justify-between hover:border-stone-300 transition">
          <div class="space-y-3">
            <div class="flex flex-wrap gap-1.5">
              ${res.tags.map(t => `
                <span class="px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  ${t}
                </span>
              `).join('')}
            </div>
            <h4 class="font-bold text-slate-900 text-base">${res.name}</h4>
            <div class="space-y-2 text-xs">
              <div>
                <span class="font-mono text-[10px] uppercase text-stone-400 font-semibold block">Eligibility Rules</span>
                <p class="text-stone-700 leading-relaxed">${res.eligibility}</p>
              </div>
              <div>
                <span class="font-mono text-[10px] uppercase text-stone-400 font-semibold block">Wait-Time Expectation</span>
                <p class="text-stone-700 font-medium">${res.waitTime}</p>
              </div>
              <div>
                <span class="font-mono text-[10px] uppercase text-stone-400 font-semibold block">Location &amp; Notes</span>
                <p class="text-stone-600">${res.location} &mdash; <a href="${res.notes}" target="_blank" rel="noopener noreferrer" class="text-amber-800 underline">Original source ↗</a></p>
              </div>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-emerald-700">
            <span class="flex items-center gap-1"><i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Source-linked listing</span>
            <span class="text-stone-400">Checked Nov 2026</span>
          </div>
        </div>
      `).join('');

      lucide.createIcons();
    }

    // -------------------------------------------------------------------------
    // 6. METHODOLOGY TIP FORM HANDLER
    // -------------------------------------------------------------------------
    function handleTipSubmit(e) {
      e.preventDefault();
      const form = document.getElementById('field-tip-form');
      const confirmation = document.getElementById('tip-confirmation');
      confirmation.classList.remove('hidden');
      localStorage.setItem('streetwatch-tip-draft', JSON.stringify({category:document.getElementById('tip-category').value,location:document.getElementById('tip-location').value,details:document.getElementById('tip-details').value,contact:document.getElementById('tip-contact').value,savedAt:new Date().toISOString()}));
      lucide.createIcons();
    }

    // -------------------------------------------------------------------------
    // INITIALIZE APPLICATION
    // -------------------------------------------------------------------------
    window.addEventListener('DOMContentLoaded', () => {
      renderMapPins();
      renderMapInspector();
      renderGroundTruthTable('ALL');
      renderEvidenceDrawer();
      renderDossierInspector();
      setTriageMode('stray');
      renderResourcesGrid('ALL');

      // Ground Truth record links keep the record on the map; Evidence Room
      // links continue to open the full dossier.
      try {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        const recParam = params.get('record');
        if (tabParam === 'ground-truth' && recParam && PRIMARY_RECORDS.some(r => r.id === recParam || r.originalId === recParam)) {
          switchTab('ground-truth');
          selectGroundTruthRecord(recParam, false);
        } else if (recParam && PRIMARY_RECORDS.some(r => r.id === recParam || r.originalId === recParam)) {
          openRecord(recParam);
        } else if (tabParam) {
          switchTab(tabParam);
        }
      } catch (e) {}

      lucide.createIcons();
    });

Object.assign(window, { switchTab, openRecord, scrollToDrawer, scrollToTipForm, showToast, setEvidenceFilter, jumpToEvidenceFilter, renderEvidenceDrawer, setDossierSubTab, toggleArtifactFlag, copyFormalCitation, downloadCleanedCsv, renderDossierInspector, renderMapPins, selectMapPin, selectGroundTruthRecord, toggleMapLayer, renderMapInspector, filterGroundTruthRecords, renderGroundTruthTable, setTriageMode, filterResources, renderResourcesGrid, handleTipSubmit });
