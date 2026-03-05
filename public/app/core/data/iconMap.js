// public/app/core/data/iconMap.js
// Crossover Icon Map — Canonical v1
// Must align exactly with SERVICE_GROUPS and SERVICE_CATALOG ids

export const ICON_MAP = {
    // ─────────────────────────
    // GROUPS (SERVICE_GROUPS)
    // ─────────────────────────
    basic_needs: "droplet",            // essential layer
    shelter_stability: "shield",       // protection layer
    system_access: "landmark",         // institutional layer

    // ─────────────────────────
    // BASIC NEEDS
    // ─────────────────────────
    drinking_water: "droplet",
    public_restrooms: "toilet",
    showers: "shower-head",
    laundry_services: "washing-machine",
    hygiene_supplies: "soap-dispenser-droplet",
    food_pantry: "apple",
    prepared_meals: "utensils",
    public_wifi: "wifi",
    device_charging: "smartphone-charging",
    day_space: "sofa",

    // ─────────────────────────
    // SHELTER & STABILITY
    // ─────────────────────────
    emergency_shelter: "bed",
    day_shelter: "building",
    safe_parking: "parking-circle",
    rv_parking: "truck",
    rv_services: "wrench",
    belongings_storage: "lock",
    street_outreach: "map-pin",

    // ─────────────────────────
    // SYSTEM ACCESS
    // ─────────────────────────
    benefits_assistance: "id-card",
    housing_navigation: "home",
    legal_services: "scale",
    medical_clinic: "stethoscope",
    mental_health_services: "brain",
    substance_use_services: "heart-handshake",
    crisis_intervention: "siren",
};

export const FALLBACK_ICON = "circle";
