// public/app/core/icons.js
import { ICON_MAP, FALLBACK_ICON } from "./data/iconMap.js";

export function iconForId(id) {
    if (!id) return FALLBACK_ICON;
    return ICON_MAP[id] || FALLBACK_ICON;
}
