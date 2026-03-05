// public/app/core/selectionModal.js
export function createSelectionModal({
    // DOM IDs
    openId,
    modalId,
    gridId,
    clearId,
    applyId,
    summaryId,

    // State / persistence
    storageKey,
    eventName,

    // Renderer: function(container, selectedSet, ctx)
    // ctx: { onToggle, screen, setScreen }
    renderList,
    getContext,
}) {
    const state = { selected: new Set() };

    // UI state that should NOT persist across open/close
    const ui = { screen: null };

    function load() {
        if (!storageKey) return;
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return;
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) {
                state.selected = new Set(arr.filter((v) => typeof v === "string"));
            }
        } catch {
            /* ignore */
        }
    }

    function save() {
        if (!storageKey) return;
        localStorage.setItem(storageKey, JSON.stringify([...state.selected]));
    }

    function dispatch() {
        if (!eventName) return;
        document.dispatchEvent(new CustomEvent(eventName, { detail: [...state.selected] }));
    }

    const el = {
        open: document.getElementById(openId),
        modal: document.getElementById(modalId),
        grid: document.getElementById(gridId),
        clear: document.getElementById(clearId),
        apply: document.getElementById(applyId),
        summary: document.getElementById(summaryId),
    };

    if (!el.open || !el.modal || !el.grid) return null;

    // Back button lives in the modal header (optional)
    // Expect: <button ... data-back hidden>←</button>
    const backBtn = el.modal.querySelector("[data-back]");

    function syncCounts() {
        const n = state.selected.size;
        if (el.summary) {
            el.summary.textContent = n > 0 ? `${n} selected` : "";
        }
    }

    function syncBack() {
        if (!backBtn) return;
        // show back when in any drilldown screen
        backBtn.hidden = !ui.screen;
    }

    // screen setter that re-renders when screen changes
    function setScreen(next) {
        ui.screen = next || null;
        syncBack();
        render();
    }

    function render() {
        if (typeof renderList !== "function") return;

        const extraCtx = typeof getContext === "function" ? getContext({ rerender: render }) : {};

        renderList(el.grid, state.selected, {
            ...extraCtx,
            screen: ui.screen,
            setScreen,
            onToggle: (key, checked) => {
                if (checked) state.selected.add(key);
                else state.selected.delete(key);
                syncCounts();
                dispatch(); // live update
            },
        });

        syncBack();
    }

    function focusFirstInteractive() {
        const first = el.grid.querySelector(
            'input[type="checkbox"], button, [href], [tabindex]:not([tabindex="-1"])'
        );
        if (first) first.focus();
    }

    function open() {
        load();

        // reset drilldown every time you open
        ui.screen = null;

        render();
        el.modal.setAttribute("aria-hidden", "false");
        focusFirstInteractive();
        document.addEventListener("keydown", onKeyDown);
    }

    function close() {
        el.modal.setAttribute("aria-hidden", "true");

        // reset drilldown on close too
        ui.screen = null;
        syncBack();

        el.open.focus();
        document.removeEventListener("keydown", onKeyDown);
    }

    function onKeyDown(e) {
        if (e.key === "Escape") close();
    }

    // Open button
    el.open.addEventListener("click", open);

    // Close buttons / backdrop (icon-safe via closest())
    el.modal.addEventListener("click", (e) => {
        const closeEl = e.target?.closest?.("[data-close]");
        if (closeEl) close();
    });

    // Header back button (optional)
    if (backBtn) {
        backBtn.addEventListener("click", () => setScreen(null));
    }

    // Clear selections (NOT back)
    if (el.clear) {
        el.clear.addEventListener("click", () => {
            state.selected.clear();
            render();
            syncCounts();
            dispatch();
        });
    }

    // Apply (persist + close)
    if (el.apply) {
        el.apply.addEventListener("click", () => {
            save();
            close();
            dispatch();
        });
    }

    // initial state
    load();
    syncCounts();
    syncBack();
    render(); // ✅ populate immediately (fixes "must click Clear all")

    return { state, open, close, setScreen };
}