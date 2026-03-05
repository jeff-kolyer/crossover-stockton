

export function renderServicesList(container, selectedSet, ctx = {}) {
    if (!container) return;

    const { onToggle, screen, serviceCatalog = [], serviceGroups = [] } = ctx;

    serviceGroups.forEach((type) => {
        const typeId = type.id;
        const title = type.title || typeId;

        const items = serviceCatalog.filter((s) => s.group === typeId);
        if (!items.length) return;

        container.appendChild(
            renderGroup({
                groupKey: typeId,
                title,
                items: items,
                selectedSet,
                onToggle,
            })
        );
    });
}

function renderGroup({
    groupKey,
    title,
    items,
    selectedSet,
    onToggle,
    showMore,
    remainingCount,
}) {
    const section = document.createElement("section");
    section.className = "filterGroup";
    section.dataset.group = groupKey;
    section.setAttribute("aria-label", title);

    const h = document.createElement("h3");
    h.className = "filterGroup__title";
    h.textContent = title;

    const options = document.createElement("div");
    options.className = "filterOptions";

    items.forEach((item) => {
        const row = document.createElement("label");
        row.className = "filterItem";
        row.innerHTML = `
      <input type="checkbox" data-service="${item.id}" ${selectedSet.has(item.id) ? "checked" : ""
            } />
      <span class="filterItem__label">${item.label}</span>
    `;

        const input = row.querySelector("input");
        input.addEventListener("change", () => onToggle?.(item.id, input.checked));

        options.appendChild(row);
    });

    section.appendChild(h);
    section.appendChild(options);

    return section;
}