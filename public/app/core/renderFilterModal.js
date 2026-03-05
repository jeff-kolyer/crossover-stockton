// public/app/core/renderFilterModal.js
import { renderServicesList } from "./renderServicesList.js";
import { renderFacetsList } from "./renderFacetsList.js";

export function renderFilterModal(container, selectedSet, ctx = {}) {
    if (!container) return;

    container.innerHTML = "";

    const titleEl = document.getElementById("filtersTitle");
    const isShowAll = ctx?.screen?.type === "showAll";
    if (titleEl) titleEl.textContent = isShowAll ? "All filters" : "Filters";

    if (isShowAll) {
        if (ctx.screen.kind === "service") {
            renderServicesList(container, selectedSet, ctx);
            return;
        }
        if (ctx.screen.kind === "facet") {
            renderFacetsList(container, selectedSet, ctx);
            return;
        }
    }

    renderServicesList(container, selectedSet, ctx);
    renderFacetsList(container, selectedSet, ctx);
}