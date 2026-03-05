// public/app/core/renderSituationMenu.js

import { renderIconById, hydrateLucide } from "../ui/renderIcon.js"; // CDN version

function countByService(resources) {
  const map = new Map(); // serviceKey -> count of resources offering it

  for (const r of resources || []) {
    const services = Array.isArray(r.services) ? r.services : [];
    for (const id of services) {
      map.set(id, (map.get(id) || 0) + 1);
    }
  }
  return map;
}

function countByType(resources, serviceCatalog, serviceGroups) {
  // typeKey -> unique count of resources that have ANY service in that type
  const typeToServiceSet = new Map(); // typeKey -> Set(serviceKey)

  for (const s of serviceCatalog) {
    if (!typeToServiceSet.has(s.group)) typeToServiceSet.set(s.group, new Set());
    typeToServiceSet.get(s.group).add(s.id);
  }

  const typeCounts = new Map();
  for (const t of serviceGroups) typeCounts.set(t.id, 0);

  for (const t of serviceGroups) {
    const serviceSet = typeToServiceSet.get(t.id) || new Set();
    let n = 0;

    for (const r of resources || []) {
      const services = Array.isArray(r.services) ? r.services : [];
      if (services.some((k) => serviceSet.has(k))) n++;
    }

    typeCounts.set(t.id, n);
  }

  return typeCounts;
}

function buildTypeToServiceSet(serviceCatalog) {
  const map = new Map(); // typeKey -> Set(serviceKey)
  for (const s of serviceCatalog) {
    if (!map.has(s.group)) map.set(s.group, new Set());
    map.get(s.group).add(s.id);
  }
  return map;
}

function countSelectedByType(selectedServices, typeToServiceSet, serviceGroups) {
  const selectedCount = new Map(); // typeKey -> number selected in that type
  for (const t of serviceGroups) selectedCount.set(t.id, 0);

  for (const t of serviceGroups) {
    const set = typeToServiceSet.get(t.id) || new Set();
    let n = 0;
    for (const id of selectedServices || []) {
      if (set.has(id)) n++;
    }
    selectedCount.set(t.id, n);
  }

  return selectedCount;
}

/**
 * Renders the top category tabs + service chips.
 *
 * Modes:
 * - mode: "interactive" (default)
 *     - Type tabs switch the service row (no filtering)
 *     - Service chips toggle selection + call onServiceToggle
 *
 * - mode: "overview"
 *     - Shows ALL service chips, grouped by type (not conditional)
 *     - Informational: no click handlers, no toggling
 */
export function renderSituationMenu({
  typeContainer,
  serviceContainer,
  resources = [],
  selectedTypeKey = "urgent_needs",
  selectedServices = new Set(),
  onTypeChange,
  onServiceToggle,
  serviceCatalog = [],
  serviceGroups = [],

  mode = "overview",       // "interactive" | "overview"
  interactive = false,         // overridden to false when mode === "overview"
} = {}) {
  if (!typeContainer || !serviceContainer) return;

  const isOverview = mode === "overview";
  const isInteractive = isOverview ? false : !!interactive;

  const byService = countByService(resources);
  const byType = countByType(resources, serviceCatalog, serviceGroups);

  // For "group has something selected" awareness (only meaningful in interactive mode)
  const typeToServiceSet = buildTypeToServiceSet(serviceCatalog);
  const selectedByType = countSelectedByType(selectedServices, typeToServiceSet, serviceGroups);

  // --- TOP TYPE TABS ---
  typeContainer.innerHTML = `
    <div class="typeMenuInner">
      ${serviceGroups.map((t) => {
    const active = t.id === selectedTypeKey;
    const count = byType.get(t.id) || 0;

    const selectedCount = selectedByType.get(t.id) || 0;
    const hasSelected = selectedCount > 0;

    const hoverTitle = t.title;

    // In overview mode, tabs are informational only (no "active" semantics needed)
    const tabActiveClass = isOverview ? "" : (active ? "is-active" : "");
    const ariaSelected = isOverview ? "false" : (active ? "true" : "false");

    return `
          <button
            type="button"
            class="typeTab ${tabActiveClass} ${hasSelected ? "has-selected" : ""}"
            role="tab"
            aria-selected="${ariaSelected}"
            data-type="${t.id}"
            title="${escapeAttr(hoverTitle)}"
            aria-label="${escapeAttr(t.title)}"
            data-has-selected="${hasSelected ? "true" : "false"}"
            ${isInteractive ? "" : "disabled"}
          >
            <span class="typeTabIcon">${renderIconById(t.id, { className: "typeIcon" })}</span>
            <span class="typeTabText">${escapeHtml(t.title)}</span>

            ${!isOverview && hasSelected && !active
        ? `<span class="typeTabDot" aria-hidden="true"></span>`
        : ""
      }

            <span class="typeTabCount">${count}</span>
          </button>
        `;
  }).join("")}
    </div>
  `;

  // attach type click handlers (interactive mode only)
  if (isInteractive) {
    typeContainer.querySelectorAll("[data-type]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = btn.getAttribute("data-type");
        if (!next || next === selectedTypeKey) return;
        onTypeChange?.(next);
      });
    });
  }

  // --- SERVICE CHIPS ---
  if (!isOverview) {
    // Current behavior: only services in selected type
    const servicesInType = serviceCatalog.filter((s) => s.group === selectedTypeKey);

    serviceContainer.innerHTML = `
      <div class="serviceMenuInner">
        ${servicesInType.map((s) => renderServiceChip(s, byService, selectedServices, isInteractive)).join("")}
      </div>
    `;

    // attach service click handlers (interactive only)
    if (isInteractive) {
      serviceContainer.querySelectorAll("[data-service]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-service");
          if (!id) return;
          const nextChecked = !selectedServices.has(id);
          onServiceToggle?.(id, nextChecked);
        });
      });
    }
  } else {
    // Overview behavior: show ALL services, grouped by type (no conditional)
    serviceContainer.innerHTML = `
      <div class="serviceMenuInner serviceMenuInner--overview">
        ${serviceGroups.map((t) => {
      const groupServices = serviceCatalog.filter((s) => s.group === t.id);

      return `
            <div class="serviceGroup" data-group="${escapeAttr(t.id)}">
              <div class="serviceGroupHeader">
                <span class="serviceGroupTitle">${escapeHtml(t.title)}</span>
              </div>
              <div class="serviceGroupBody">
                ${groupServices.map((s) => renderServiceChip(s, byService, selectedServices, false)).join("")}
              </div>
            </div>
          `;
    }).join("")}
      </div>
    `;
  }

  // hydrate Lucide after DOM updates (do this after we inject icons)
  hydrateLucide(typeContainer);
  hydrateLucide(serviceContainer);
}

function renderServiceChip(s, byService, selectedServices, isInteractive) {
  const active = selectedServices.has(s.id);
  const count = byService.get(s.id) || 0;

  const hoverTitle = s.label;

  // In overview mode (non-interactive), still render the exact chip look,
  // but as a disabled button so it won't feel like navigation.
  const disabledAttr = isInteractive ? "" : "disabled";
  const pressedAttr = isInteractive ? `aria-pressed="${active ? "true" : "false"}"` : `aria-disabled="true"`;

  return `
    <button
      type="button"
      class="serviceChip ${active && isInteractive ? "is-active" : ""}"
      data-service="${escapeAttr(s.id)}"
      ${pressedAttr}
      title="${escapeAttr(hoverTitle)}"
      aria-label="${escapeAttr(hoverTitle)}"
      ${disabledAttr}
    >
      <span class="serviceChipIcon">${renderIconById(s.id, { className: "chipIcon" })}</span>
      <span class="serviceChipText">${escapeHtml(s.label)}</span>
      <span class="serviceChipCount">${count}</span>
    </button>
  `;
}

/* ---------------- helpers (tiny + safe) ---------------- */

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(str) {
  return escapeHtml(str);
}
