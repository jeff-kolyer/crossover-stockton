// public/app/core/openNow.js

const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

/**
 * Checks if a resource with a `schedule` block is currently open.
 * Returns true if open or if no schedule is provided (assumes always open if schedule is null/missing)
 * 
 * @param {Object} resource 
 * @param {Date} [now] - optional date override for testing
 * @returns {boolean}
 */
export function isOpenNow(resource, now = new Date()) {
    if (!resource || !resource.schedule || !Array.isArray(resource.schedule.regular)) {
        // If there is no explicit schedule block, we can't filter it out for being closed.
        // It's safer to leave it in the list so we don't hide 24/7 or undocumented services.
        return true;
    }

    // Default to the Stockton target timezone if none provided
    const tz = resource.schedule.timezone || "America/Los_Angeles";

    let localDate;
    try {
        // More robust formatting extraction to bypass `new Date(string)` parsing differences
        const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: tz,
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hour12: false
        });

        const parts = formatter.formatToParts(now);
        const p = {};
        for (const { type, value } of parts) {
            p[type] = value;
        }

        // Month is 0-indexed in Date constructor
        localDate = new Date(p.year, p.month - 1, p.day, p.hour === '24' ? 0 : p.hour, p.minute, p.second);
    } catch (e) {
        // Fallback if browser doesn't support the timezone or threw an error
        localDate = now;
    }

    const currentDayStr = DAYS[localDate.getDay()];
    const currentMins = localDate.getHours() * 60 + localDate.getMinutes();

    const rules = resource.schedule.regular;

    for (const rule of rules) {
        // Must be open today or span into today
        const opensToday = rule.days && rule.days.includes(currentDayStr);

        // Convert "HH:MM" to minutes past midnight
        const openMins = parseTime(rule.open);
        const closeMins = parseTime(rule.close);

        if (opensToday) {
            // Standard daytime hours (e.g. 09:00 - 17:00)
            if (openMins <= closeMins) {
                if (currentMins >= openMins && currentMins < closeMins) {
                    return true;
                }
            }
            // Cross-midnight hours starting today (e.g. 23:00 - 06:00)
            else {
                if (currentMins >= openMins) {
                    return true;
                }
            }
        }

        // Handle the trailing end of a cross-midnight shift that started YESTERDAY
        if (openMins > closeMins) {
            // Find yesterday's string
            const yesterdayIndex = (localDate.getDay() + 6) % 7;
            const yesterdayStr = DAYS[yesterdayIndex];

            if (rule.days && rule.days.includes(yesterdayStr)) {
                // It started yesterday and goes into today up until `closeMins`
                if (currentMins < closeMins) {
                    return true;
                }
            }
        }
    }

    return false; // Did not match any active open rule
}

function parseTime(timeStr) {
    if (!timeStr) return 0;
    const [hh, mm] = timeStr.split(":");
    return parseInt(hh, 10) * 60 + parseInt(mm || "0", 10);
}
