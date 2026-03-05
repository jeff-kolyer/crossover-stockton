// /public/app/core/openNowToggle.js

const STORAGE_KEY = "openNow";

function dispatchChanged(on) {
    document.dispatchEvent(new CustomEvent("openNow:changed", { detail: on }));
}

function loadOpenNow() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw == null) return false;
        return raw === "true";
    } catch {
        return false;
    }
}

function saveOpenNow(on) {
    try {
        localStorage.setItem(STORAGE_KEY, on ? "true" : "false");
    } catch { }
}

export function initOpenNowToggle() {
    const btn = document.getElementById("openNowToggle");
    if (!btn) return;

    // initial state
    const initial = loadOpenNow();
    btn.setAttribute("aria-pressed", initial ? "true" : "false");
    dispatchChanged(initial);

    btn.addEventListener("click", () => {
        const isOn = btn.getAttribute("aria-pressed") === "true";
        const next = !isOn;

        btn.setAttribute("aria-pressed", next ? "true" : "false");
        saveOpenNow(next);
        dispatchChanged(next);
    });
}
