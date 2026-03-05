// public/app/core/engine.js
// Browser-safe filtering helpers (no DOM)
import { isOpenNow } from "./openNow.js";

function serviceMatch(resource, selectedServices) {
    if (!selectedServices.length) return true;
    const offered = Array.isArray(resource?.services) ? resource.services : [];
    // OR logic: any selected service matches
    return selectedServices.some((k) => offered.includes(k));
}

function getFacetValue(resource, path) {
    if (!path) return undefined;
    const parts = path.split(".");
    let curr = resource;
    for (const p of parts) {
        if (curr == null) return undefined;
        curr = curr[p];
    }
    return curr === true ? 1 : 0;
}

function accessScore(resource, selectedFacets, facetCatalogList = []) {
    if (!selectedFacets.length) return 0;

    return selectedFacets.reduce((score, facetKey) => {
        // facetKey looks like "facet:pet_friendly"
        const id = facetKey.replace("facet:", "");
        const facetDef = facetCatalogList.find(f => f.id === id);
        if (facetDef && facetDef.path) {
            return score + getFacetValue(resource, facetDef.path);
        }
        return score;
    }, 0);
}

/**
 * filterResources(resources, opts)
 * - Services = hard filter (inclusion)
 * - Access options = soft filter (ranking)
 *
 * Returns: array of resources in display order
 */
export function filterResources(
    resources,
    { selectedServices = [], selectedAccess = [], openNow = false, debug = false, facetCatalogList = [] } = {}
) {
    const list = Array.isArray(resources) ? resources : [];

    const scored = list
        .filter((r) => serviceMatch(r, selectedServices))
        .filter((r) => {
            if (openNow) return isOpenNow(r);
            return true;
        })
        .map((r) => {
            const score = accessScore(r, selectedAccess, facetCatalogList);
            return debug ? { resource: r, score } : { resource: r, score };
        })
        .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return String(a.resource?.name || "").localeCompare(
                String(b.resource?.name || ""),
                undefined,
                { sensitivity: "base" }
            );
        });

    return debug ? scored : scored.map((x) => x.resource);
}
