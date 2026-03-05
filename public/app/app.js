// public/app/app.js

import { filterResources } from "./core/engine.js";
import { initFilterModal } from "./core/filterModal.js";
import { initOpenNowToggle } from "./core/openNowToggle.js";

import { renderSituationMenu } from "./core/renderSituationMenu.js";

// NEW: reality rail tiles
import { renderRealityRail } from "./core/renderRealityRail.js";

// NEW: map support
import { convertToGeoJSON, initMap, updateMap, panToMarker } from "./core/map.js";

// NEW: theme toggle
import { initTheme } from "./core/theme.js";

const DATA_URL = "./api/v1/resources.json";
const SERVICES_URL = "./api/v1/servicesCatalog.json";
const FACETS_URL = "./api/v1/facetsCatalog.json";

const SERVICES_STORAGE_KEY = "selectedServices";
const ACCESS_STORAGE_KEY = "selectedAccess";
const OPENNOW_STORAGE_KEY = "openNow";

// Controls how many service labels appear in "Showing: ..." before "+ N more"
const SHOWING_LABEL_LIMIT = 3;

let ALL_RESOURCES = [];
let CURRENT_ACCESS = [];
let OPEN_NOW = false;

// Situation-menu state (top tabs + sub chips)
let SELECTED_TYPE_KEY = "right_now";
let SELECTED_SERVICES_SET = new Set();

let SERVICE_CATALOG = [];
let SERVICE_GROUPS = [];
let FACET_CATALOG = {};
let FACET_GROUPS = [];
let FACET_CATALOG_LIST = []; // flat list for engine
let SERVICE_LABEL = new Map();
let SERVICE_TYPE_BY_KEY = new Map();

const IS_REALITY_MAP = location.pathname.endsWith("/reality-map.html");

/* =========================
   Storage helpers
========================= */
function loadListFromStorage(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return [];
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr)) return [];
        return arr.filter((v) => typeof v === "string");
    } catch {
        return [];
    }
}

function saveListToStorage(key, list) {
    try {
        localStorage.setItem(key, JSON.stringify(Array.from(list)));
    } catch { }
}

function loadSelectedServicesFromStorage() {
    return loadListFromStorage(SERVICES_STORAGE_KEY);
}

function loadSelectedAccessFromStorage() {
    return loadListFromStorage(ACCESS_STORAGE_KEY);
}

function loadBoolFromStorage(key, fallback = false) {
    try {
        const raw = localStorage.getItem(key);
        if (raw == null) return fallback;
        return raw === "true";
    } catch {
        return fallback;
    }
}

/* =========================
   Selection normalization
   - empty selection = All services ([])
========================= */
function getSelectedKeysOrAll() {
    const keys = Array.from(SELECTED_SERVICES_SET || []);
    return keys.length ? keys : [];
}

/* =========================
   Small utils
========================= */
function escapeHtml(str) {
    return String(str ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function normalizePhone(phone) {
    const p = String(phone || "").trim();
    if (!p) return null;
    const tel = p.replace(/[^\d+]/g, "");
    return tel || null;
}

function getMatchedKeys(resource, selectedServiceKeys) {
    const offered = Array.isArray(resource.services) ? resource.services : [];
    if (!selectedServiceKeys.length) return [];
    return selectedServiceKeys.filter((k) => offered.includes(k));
}

function hasEl(id) {
    return !!document.getElementById(id);
}

function pluralize(n, one, many = `${one}s`) {
    return n === 1 ? one : many;
}

/* =========================
   Header/meta
========================= */
function setLastUpdated(date = new Date()) {
    const el = document.getElementById("lastUpdated");
    if (!el) return;

    const mins = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
    el.textContent = mins <= 1 ? "Updated just now" : `Updated ${mins} min ago`;
}

/* =========================
   Results "Showing / Find" bar
========================= */


function setResultsBar(selectedServiceKeys, count) {
    const kickerEl = document.getElementById("resultsKicker");
    const selectionEl = document.getElementById("resultsSelection");
    const countEl = document.getElementById("resultsCount");

    const keys = Array.isArray(selectedServiceKeys) ? selectedServiceKeys : [];
    const labels = keys.map((k) => {
        if (SERVICE_LABEL.has(k)) return SERVICE_LABEL.get(k);
        if (k.startsWith("facet:")) {
            const clean = k.replace("facet:", "").replace(/_/g, " ");
            return clean.charAt(0).toUpperCase() + clean.slice(1);
        }
        return k;
    }).filter(Boolean);

    const safeLimit = Math.max(0, SHOWING_LABEL_LIMIT);
    const shown = labels.slice(0, safeLimit);
    const remaining = labels.length - shown.length;

    // Use dots on desktop, commas on mobile (optional)
    const isDesktop = window.matchMedia && window.matchMedia("(min-width: 900px)").matches;
    const joiner = isDesktop ? " · " : ", ";

    const selectionText =
        labels.length === 0
            ? "All services"
            : `${shown.join(joiner)}${remaining > 0 ? `${joiner}+${remaining}` : ""}`;

    const kickerText = `Showing ${count} ${pluralize(count, "result")}`;

    if (kickerEl) kickerEl.textContent = kickerText;
    if (selectionEl) selectionEl.textContent = selectionText;

    // Keep this if you still want the small count element elsewhere (or blank it)
    if (countEl) countEl.textContent = ""; // or: `${count} ${pluralize(count, "result")}`;

    const h1 = document.getElementById("selectionTitle");
    if (h1) h1.textContent = "";
}

/* =========================
   Results rendering
========================= */
function renderResults(selectedServiceKeys) {
    const host = document.getElementById("results");
    if (!host) return;

    const filtered = filterResources(ALL_RESOURCES, {
        selectedServices: selectedServiceKeys,
        selectedAccess: CURRENT_ACCESS,
        openNow: OPEN_NOW,
        facetCatalogList: FACET_CATALOG_LIST,
    });

    setResultsBar(selectedServiceKeys, filtered.length);

    if (!filtered.length) {
        host.innerHTML = `
      <div class="loading" role="status" aria-live="polite">
        No matching results. Try removing a filter.
      </div>
    `;
        // ensure map is updated if there are no results
        if (hasEl("map")) {
            const geojson = convertToGeoJSON([]);
            updateMap(geojson);
        }
        return;
    }

    host.innerHTML = "";
    const frag = document.createDocumentFragment();

    filtered.forEach((resource) => {
        frag.appendChild(createResourceTile(resource, selectedServiceKeys));
    });

    host.appendChild(frag);

    if (hasEl("map")) {
        const geojson = convertToGeoJSON(filtered);
        updateMap(geojson);
    }
}

function createResourceTile(resource, selectedServiceKeys) {
    const name = escapeHtml(resource?.name || "Unnamed resource");
    const desc = escapeHtml(resource?.description || "");
    const hours = escapeHtml(resource?.hours || "");
    const address = escapeHtml(resource?.location?.address || "");
    const phone = resource?.contact?.phone || null;
    const tel = normalizePhone(phone);
    const website = resource?.contact?.website || null;

    const matched = getMatchedKeys(resource, selectedServiceKeys);
    const matchedLabels = matched.map((k) => SERVICE_LABEL.get(k) || k);

    const whyLine = matchedLabels.length
        ? `Matches: ${escapeHtml(matchedLabels.slice(0, 3).join(", "))}${matchedLabels.length > 3 ? "…" : ""
        }`
        : "";

    const compat = resource?.compatibility || {};
    const access = resource?.access || {};
    const legacy = resource?.access_options || {};

    const attr = [];
    if (compat.pet_friendly || legacy.pet_friendly) attr.push("Pet friendly");
    if (compat.rv_allowed || legacy.rv_allowed) attr.push("RV ok");
    if (compat.low_barrier || legacy.low_barrier) attr.push("Low-barrier");
    if (compat.employment_compatible) attr.push("Employment ok");

    if (access.walk_in || legacy.walk_in) attr.push("Walk-in");
    if (access.documentation_required === "none" || legacy.no_id_required) attr.push("No ID required");
    if (access.sobriety_required === false || legacy.no_sobriety_check) attr.push("No sobriety check");

    const attrLine = attr.length ? escapeHtml(attr.slice(0, 4).join(" • ")) : "";

    const wrap = document.createElement("article");
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", resource?.name || "Resource");
    wrap.className = "tile tile--result";

    wrap.innerHTML = `
    <div class="tileMedia" aria-hidden="true"></div>
    <div class="tileBody">
      <h3 class="tileTitle">${name}</h3>

      ${desc ? `<p class="tileBlurb">${desc}</p>` : ""}
      ${whyLine ? `<p>${whyLine}</p>` : ""}

      ${hours || address
            ? `
        <p>
          ${hours ? `<strong>Hours:</strong> ${hours}${address ? "<br/>" : ""}` : ""}
          ${address ? `<strong>Address:</strong> ${address}` : ""}
        </p>
      `
            : ""
        }

      ${attrLine ? `<p class="tileMeta">${attrLine}</p>` : ""}

      <div class="tileActions">
        ${tel ? `<a href="tel:${tel}" aria-label="Call ${name}">Call</a>` : ""}
        ${website
            ? `<a href="${escapeHtml(website)}" target="_blank" rel="noopener">Website</a>`
            : ""
        }
      </div>
    </div>
  `;

    wrap.addEventListener("click", (e) => {
        // Don't intercept clicks on links/buttons inside the tile
        if (e.target.closest('a') || e.target.closest('button')) return;

        if (hasEl("map")) {
            panToMarker(resource.id);

            // On mobile, if we are in list view, auto-switch to map view so they can see the pin
            if (!document.body.classList.contains("show-map")) {
                const mobileMapToggle = document.getElementById("mobileMapToggle");
                if (mobileMapToggle) {
                    mobileMapToggle.click();
                }
            }
        }
    });

    return wrap;
}



/* =========================
   Top situation menus (tabs + chips)
========================= */
function renderTopMenus() {
    const typeEl = document.getElementById("typeMenu");
    const svcEl = document.getElementById("serviceMenu");
    if (!typeEl || !svcEl) return;

    renderSituationMenu({
        mode: IS_REALITY_MAP ? "overview" : "interactive",

        typeContainer: typeEl,
        serviceContainer: svcEl,
        resources: ALL_RESOURCES,
        selectedTypeKey: SELECTED_TYPE_KEY,
        selectedServices: SELECTED_SERVICES_SET,
        serviceCatalog: SERVICE_CATALOG,
        serviceGroups: SERVICE_GROUPS,

        onTypeChange: (nextTypeKey) => {
            if (IS_REALITY_MAP) return;
            SELECTED_TYPE_KEY = nextTypeKey;
            renderTopMenus();
        },

        onServiceToggle: (serviceKey, checked) => {
            if (IS_REALITY_MAP) return;

            if (checked) SELECTED_SERVICES_SET.add(serviceKey);
            else SELECTED_SERVICES_SET.delete(serviceKey);

            const selectedKeys = getSelectedKeysOrAll();
            saveListToStorage(SERVICES_STORAGE_KEY, selectedKeys);

            document.dispatchEvent(new CustomEvent("servicesFilter:changed", { detail: selectedKeys }));

            renderTopMenus();
        },
    });
}



/* =========================
   Reality Dashboard Tiles
========================= */
function renderRealityTilesDashboard() {
    const host = document.getElementById("realityDashboard");
    if (!host) return;

    const dashResources = filterResources(ALL_RESOURCES, {
        selectedServices: [],
        selectedAccess: CURRENT_ACCESS,
        openNow: OPEN_NOW,
        facetCatalogList: FACET_CATALOG_LIST,
    });

    renderRealityRail({
        container: host,
        resources: dashResources,
        selectedServices: SELECTED_SERVICES_SET,
        serviceCatalog: SERVICE_CATALOG,

        onServiceToggle: (serviceKey, checked) => {
            if (!serviceKey) return;

            if (checked) SELECTED_SERVICES_SET.add(serviceKey);
            else SELECTED_SERVICES_SET.delete(serviceKey);

            const selectedKeys = getSelectedKeysOrAll(); // should be an array
            saveListToStorage(SERVICES_STORAGE_KEY, selectedKeys);

            document.dispatchEvent(
                new CustomEvent("servicesFilter:changed", { detail: selectedKeys })
            );

            renderRealityTilesDashboard();
        },
    });
}

/* =========================
   Open now UI sync
========================= */
function syncOpenNowUI() {
    const btn = document.getElementById("openNowToggle");
    if (!btn) return;
    // openNowToggle is a <button> using aria-pressed, not a checkbox
    btn.setAttribute("aria-pressed", OPEN_NOW ? "true" : "false");
}

function syncPetFriendlyUI() {
    const btn = document.getElementById("petFriendlyToggle");
    if (!btn) return;
    const isPetFriendly = SELECTED_SERVICES_SET.has("facet:pet_friendly");
    btn.setAttribute("aria-pressed", isPetFriendly ? "true" : "false");
}

/* =========================
   Boot
========================= */
async function boot() {
    if (window.lucide?.createIcons) window.lucide.createIcons();

    initTheme();

    const HAS_TOP_MENUS = hasEl("typeMenu") && hasEl("serviceMenu");
    const HAS_RESULTS = hasEl("results");
    const HAS_SERVICES_MODAL = hasEl("filtersModal") && hasEl("filtersGrid");
    const HAS_OPENNOW = hasEl("openNowToggle");
    const HAS_REALITY_DASH = hasEl("realityDashboard");
    const HAS_MAP = hasEl("map");

    try {
        const [resParams, svcParams, facParams] = await Promise.all([
            fetch(DATA_URL).then(res => res.json()),
            fetch(SERVICES_URL).then(res => res.json()),
            fetch(FACETS_URL).then(res => res.json())
        ]);
        ALL_RESOURCES = Array.isArray(resParams?.resources) ? resParams.resources : [];
        SERVICE_CATALOG = Array.isArray(svcParams?.services) ? svcParams.services : [];
        SERVICE_GROUPS = Array.isArray(svcParams?.groups) ? svcParams.groups : [];
        FACET_CATALOG = facParams?.facets || {};
        FACET_GROUPS = Array.isArray(facParams?.groups) ? facParams.groups : [];

        FACET_CATALOG_LIST = Object.values(FACET_CATALOG).flat();
        SERVICE_LABEL = new Map(SERVICE_CATALOG.map((s) => [s.id, s.label]));
        SERVICE_TYPE_BY_KEY = new Map(SERVICE_GROUPS.map((t) => [t.id, t]));

        if (HAS_MAP) {
            const geojson = convertToGeoJSON(ALL_RESOURCES);
            initMap("map", geojson);
        }

        setLastUpdated(new Date());
    } catch (err) {
        const host = document.getElementById("results");
        if (host) {
            host.innerHTML = `
        <div class="loading" role="status" aria-live="polite">
          Could not load resources or data catalogs.
        </div>
      `;
        }
        console.error(err);
        return;
    }

    if (HAS_SERVICES_MODAL) initFilterModal({ serviceCatalog: SERVICE_CATALOG, serviceGroups: SERVICE_GROUPS, facetCatalog: FACET_CATALOG, facetGroups: FACET_GROUPS });
    if (HAS_OPENNOW) initOpenNowToggle();

    const selectedServices = loadSelectedServicesFromStorage();
    CURRENT_ACCESS = loadSelectedAccessFromStorage();
    OPEN_NOW = loadBoolFromStorage(OPENNOW_STORAGE_KEY, false);

    if (HAS_OPENNOW) syncOpenNowUI();

    // Initialize selection from storage (NO DEFAULTS)
    SELECTED_SERVICES_SET = new Set(selectedServices);

    const petFriendlyBtn = document.getElementById("petFriendlyToggle");
    if (petFriendlyBtn) {
        petFriendlyBtn.addEventListener("click", () => {
            const isCurrentlySet = SELECTED_SERVICES_SET.has("facet:pet_friendly");
            if (isCurrentlySet) {
                SELECTED_SERVICES_SET.delete("facet:pet_friendly");
            } else {
                SELECTED_SERVICES_SET.add("facet:pet_friendly");
            }

            const selectedKeys = getSelectedKeysOrAll();
            saveListToStorage(SERVICES_STORAGE_KEY, selectedKeys);
            document.dispatchEvent(new CustomEvent("servicesFilter:changed", { detail: selectedKeys }));
        });
        syncPetFriendlyUI();
    }

    // Mobile map toggle bindings
    const mobileMapToggle = document.getElementById("mobileMapToggle");
    if (mobileMapToggle) {
        mobileMapToggle.addEventListener("click", () => {
            const isMap = document.body.classList.toggle("show-map");
            mobileMapToggle.setAttribute("aria-pressed", isMap);

            const iconContainer = mobileMapToggle.querySelector(".icon");
            const mapLabel = mobileMapToggle.querySelector(".mapLabel");
            const listLabel = mobileMapToggle.querySelector(".listLabel");

            if (isMap) {
                iconContainer.innerHTML = '<i data-lucide="list"></i>';
                if (mapLabel) mapLabel.hidden = true;
                if (listLabel) listLabel.hidden = false;
            } else {
                iconContainer.innerHTML = '<i data-lucide="map"></i>';
                if (mapLabel) mapLabel.hidden = false;
                if (listLabel) listLabel.hidden = true;
            }
            if (window.lucide) window.lucide.createIcons();

            if (isMap) {
                // Ensure leaflet redraws internal tile map after being initially rendered in a hidden DOM element
                setTimeout(() => window.dispatchEvent(new Event("resize")), 100);
            }
        });
    }

    // ONLY ON BOOT: set initial tab to match the first selected service (if any).
    const firstSelected = Array.from(SELECTED_SERVICES_SET)[0];
    if (firstSelected) {
        const svcMeta = SERVICE_CATALOG.find((s) => s.id === firstSelected);
        if (svcMeta?.group && SERVICE_TYPE_BY_KEY.has(svcMeta.group)) {
            SELECTED_TYPE_KEY = svcMeta.group;
        }
    }

    const initialSelectedKeys = getSelectedKeysOrAll(); // [] means All services

    if (HAS_TOP_MENUS) renderTopMenus();
    if (HAS_RESULTS) renderResults(initialSelectedKeys);
    if (HAS_REALITY_DASH) renderRealityTilesDashboard();

    document.addEventListener("servicesFilter:changed", (e) => {
        const selectedKeys = Array.isArray(e.detail) ? e.detail : [];

        SELECTED_SERVICES_SET = new Set(selectedKeys);
        saveListToStorage(SERVICES_STORAGE_KEY, selectedKeys);

        const keysForFiltering = getSelectedKeysOrAll();

        if (HAS_TOP_MENUS) renderTopMenus();
        if (HAS_RESULTS) renderResults(keysForFiltering);
        if (HAS_REALITY_DASH) renderRealityTilesDashboard();
        syncPetFriendlyUI();
    });



    document.addEventListener("openNow:changed", (e) => {
        OPEN_NOW = !!e.detail;
        try {
            localStorage.setItem(OPENNOW_STORAGE_KEY, OPEN_NOW ? "true" : "false");
        } catch { }

        if (HAS_OPENNOW) syncOpenNowUI();
        if (HAS_RESULTS) renderResults(getSelectedKeysOrAll());
        if (HAS_REALITY_DASH) renderRealityTilesDashboard();
    });
}

boot();