// public/app/ui/renderIcon.js
import { iconForId } from "../core/icons.js";

export function renderIconById(id, { className = "", label = null } = {}) {
    const iconName = iconForId(id);
    const aria = label
        ? `role="img" aria-label="${escape(label)}"`
        : `aria-hidden="true"`;

    return `<i data-lucide="${iconName}" class="${escape(className)}" ${aria}></i>`;
}

export function hydrateLucide() {
    if (window.lucide?.createIcons) window.lucide.createIcons();
}

function escape(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}
