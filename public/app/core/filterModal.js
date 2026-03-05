// public/app/core/filterModal.js

import { createSelectionModal } from "./selectionModal.js";
import { renderFilterModal } from "./renderFilterModal.js";

export function initFilterModal({ serviceCatalog = [], serviceGroups = [], facetCatalog = {}, facetGroups = [] } = {}) {
    const ui = { screen: null };

    const modalApi = createSelectionModal({
        openId: "openFilters",
        modalId: "filtersModal",
        gridId: "filtersGrid",
        clearId: "clearFilters",
        applyId: "applyFilters",
        summaryId: "selectedSummary",

        storageKey: "selectedServices",
        eventName: "servicesFilter:changed",

        renderList: renderFilterModal,

        getContext: ({ rerender }) => ({
            serviceCatalog,
            serviceGroups,
            facetCatalog,
            facetGroups,
            screen: ui.screen,
            setScreen: (next) => {
                ui.screen = next;
                rerender();
            },
        }),
    });

    // Modal-only: ensure overlay starts closed on boot
    const modalEl = document.getElementById("filtersModal");
    if (modalEl) modalEl.setAttribute("aria-hidden", "true");

    // Nudge once so counts/summary render immediately
    queueMicrotask(() => {
        modalApi?.rerender?.();
    });

    return modalApi;
}