export function initTheme() {
    const favicon = document.getElementById("favicon");
    const toggleBtn = document.getElementById("themeToggle");

    function setTheme(theme) {
        document.body.setAttribute("data-theme", theme);

        // Persist choice
        localStorage.setItem("theme", theme);

        // Update favicon
        if (favicon) {
            favicon.href =
                theme === "dark"
                    ? "./icons/moon.svg"
                    : "./icons/sun.svg";
        }
    }

    function detectThemeByTime() {
        const hour = new Date().getHours();
        // 7am–6:59pm = light
        return hour >= 7 && hour < 19 ? "light" : "dark";
    }

    function getInitialTheme() {
        const saved = localStorage.getItem("theme");
        if (saved === "light" || saved === "dark") {
            return saved;
        }
        return detectThemeByTime();
    }

    function toggleTheme() {
        const current = document.body.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        setTheme(next);
    }

    // Initial set
    setTheme(getInitialTheme());

    // Attach click
    if (toggleBtn) {
        toggleBtn.addEventListener("click", toggleTheme);
    }
}