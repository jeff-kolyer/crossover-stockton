

/**
 * @param {HTMLElement} container
 * @param {Set<string>} selectedSet
 * @param {{ onToggle?: Function }} ctx
 */
export function renderFacetsList(container, selectedSet, { onToggle, facetCatalog = {}, facetGroups = [] } = {}) {
    if (!container) return;

    facetGroups.forEach((group) => {
        const groupId = group.id;
        const title = group.label;

        const items = facetCatalog[groupId];
        if (!Array.isArray(items) || !items.length) return;

        const boolItems = items.filter((f) => f.type === "boolean");
        if (!boolItems.length) return;

        container.appendChild(
            renderFacetGroup({ groupId, title, boolItems, selectedSet, onToggle })
        );
    });
}

function renderFacetGroup({ groupId, title, boolItems, selectedSet, onToggle }) {
    const section = document.createElement("section");
    section.className = "filterGroup";
    section.dataset.group = `facet:${groupId}`;
    section.setAttribute("aria-label", title);

    const h = document.createElement("h3");
    h.className = "filterGroup__title";
    h.textContent = title;

    const options = document.createElement("div");
    options.className = "filterOptions";

    boolItems.forEach((item) => {
        const fullKey = `facet:${item.id}`;
        const checkboxId = `facet-${groupId}-${item.id}`;

        const row = document.createElement("label");
        row.className = "filterItem";
        row.innerHTML = `
      <input
        type="checkbox"
        id="${checkboxId}"
        data-facet="${item.id}"
        ${selectedSet.has(fullKey) ? "checked" : ""}
      />
      <span class="filterItem__label">${item.label}</span>
    `;

        const input = row.querySelector("input");
        input.addEventListener("change", () => onToggle?.(fullKey, input.checked));

        options.appendChild(row);
    });

    section.appendChild(h);
    section.appendChild(options);
    return section;
}