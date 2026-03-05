// public/app/core/renderRealityRail.js
import { renderIconById, hydrateLucide } from "../ui/renderIcon.js";
import { enableRailDrag } from "../ui/enableRailDrag.js";

/**
 * Reality Rail (Tiles only)
 * - No header/title rendering (keep that in HTML, not scripted)
 * - Selection uses aria-pressed="true"
 * - Strength bar uses --pct (open/total)
 */
export function renderRealityRail({
  container,
  resources = [],
  selectedServices = new Set(),
  serviceCatalog = [],
  onServiceToggle,

  // How to decide "open now" for a resource (optional)
  // If omitted, open counts will equal total counts.
  isOpenResource = null, // (resource) => boolean

  // Which services to render (default: SERVICE_CATALOG order)
  services = null, // array of service keys OR catalog objects; if null uses SERVICE_CATALOG

  // Optional "More" tile handling
  showMoreTile = false,
  moreLabel = "More",
  moreCountText = "",
  onMore,

  // Count label style
  countMode = "ratio", // "ratio" => "2 / 6", "open_total" => "2 open / 6 total"
} = {}) {
  if (!container) return;

  const { totalByService, openByService } = countByService(resources, isOpenResource);
  const list = normalizeServicesList(services, serviceCatalog);

  const tilesHtml = list
    .map((s) => {
      const total = totalByService.get(s.id) || 0;
      const open = openByService.get(s.id) || 0;

      const active = selectedServices.has(s.id);
      const pct = total > 0 ? Math.round((open / total) * 100) : 0;

      const isEmpty = total === 0;
      const isLive = open > 0;

      return renderTile({
        id: s.id,
        label: s.label,
        active,
        total,
        open,
        pct,
        isEmpty,
        isLive,
        countMode,
      });
    })
    .join("");

  const moreHtml = showMoreTile ? renderMoreTile({ label: moreLabel, countText: moreCountText }) : "";

  // IMPORTANT: tiles only, no header
  container.innerHTML = `
    <div class="realityTiles" role="group" aria-label="Service tiles">
      ${tilesHtml}
      ${moreHtml}
    </div>
  `;

  container.querySelectorAll(".realityTile[data-service]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-service");
      if (!id) return;
      const nextChecked = !selectedServices.has(id);
      onServiceToggle?.(id, nextChecked);
    });
  });

  const moreBtn = container.querySelector(".realityTile--more");
  if (moreBtn) moreBtn.addEventListener("click", () => onMore?.());

  hydrateLucide(container);

  // ✅ enable drag-scroll on the existing rail wrapper in HTML
  const rail = container.closest(".rail");
  if (rail) enableRailDrag(rail);
}

/* ---------------- helpers ---------------- */

function countByService(resources, isOpenResource) {
  const totalByService = new Map();
  const openByService = new Map();

  for (const r of resources || []) {
    const services = Array.isArray(r.services) ? r.services : [];
    const isOpen = typeof isOpenResource === "function" ? !!isOpenResource(r) : null;

    for (const id of services) {
      totalByService.set(id, (totalByService.get(id) || 0) + 1);

      // If we don't know open/closed, treat as "available" so bar isn't misleading.
      if (isOpen === null) {
        openByService.set(id, (openByService.get(id) || 0) + 1);
      } else if (isOpen) {
        openByService.set(id, (openByService.get(id) || 0) + 1);
      }
    }
  }

  return { totalByService, openByService };
}

function normalizeServicesList(services, serviceCatalog) {
  // Default: full catalog order
  if (!services) return serviceCatalog.map(({ id, label }) => ({ id, label }));

  // If user passed keys, map them to labels from catalog
  if (Array.isArray(services) && typeof services[0] === "string") {
    const byKey = new Map(serviceCatalog.map((s) => [s.id, s]));
    return services
      .map((k) => byKey.get(k))
      .filter(Boolean)
      .map(({ id, label }) => ({ id, label }));
  }

  // If user passed catalog-like objects
  return (services || [])
    .map((s) => ({ id: s.id, label: s.label || s.title || s.id }))
    .filter((s) => !!s.id);
}

function renderTile({ id, label, active, total, open, pct, isEmpty, isLive, countMode }) {
  const classes = ["realityTile", isEmpty ? "is-empty" : "", isLive ? "is-live" : ""]
    .filter(Boolean)
    .join(" ");

  const countText = countMode === "open_total" ? `${open} open / ${total} total` : `${open} / ${total}`;

  return `
    <button
      type="button"
      class="${classes}"
      data-service="${escapeAttr(id)}"
      aria-pressed="${active ? "true" : "false"}"
      title="${escapeAttr(label)}"
      aria-label="${escapeAttr(label)}"
      style="--pct:${pct}%"
    >
      <span class="realityTileIcon">
        ${renderIconById(id)}
      </span>

      <span class="realityTileLabel">${escapeHtml(label)}</span>

      <span class="realityTileBottom">
        <span class="realityStrength" aria-hidden="true"><span></span></span>
        <span class="realityTileCount">${escapeHtml(countText)}</span>
      </span>
    </button>
  `;
}

function renderMoreTile({ label, countText }) {
  return `
    <button
      type="button"
      class="realityTile realityTile--more"
      aria-label="${escapeAttr(label)}"
      title="${escapeAttr(label)}"
    >
      <span class="realityTileIcon">…</span>
      <span class="realityTileLabel">${escapeHtml(label)}</span>

      <span class="realityTileBottom">
        <span class="realityStrength" aria-hidden="true"><span></span></span>
        <span class="realityTileCount">${escapeHtml(countText || "")}</span>
      </span>
    </button>
  `;
}




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