// app/core/presets.js
// UI-facing presets (no Track labels). These are the four big buttons.

export const INTAKE_PRESETS = [
  {
    id: "emergency",
    label: "Emergency / might lose housing",
    description: "Immediate risk, unsafe situation, eviction risk, or urgent stabilization.",
    intake: {
      housing: "at_risk",
      working: false,
      has_pet: false,
      has_rv: false,
      needs_medical: false
    }
  },
  {
    id: "stabilizing",
    label: "Working or living in a vehicle",
    description: "Working, looking for work, or living in a car/van/RV and trying to stabilize.",
    intake: {
      housing: "vehicular",
      working: true,
      has_pet: false,
      has_rv: true,
      needs_medical: false
    }
  },
  {
    id: "outside",
    label: "Outside / need basics",
    description: "Staying outside and need basics like food, hygiene, mail, documents, or support.",
    intake: {
      housing: "unsheltered",
      working: false,
      has_pet: false,
      has_rv: false,
      needs_medical: false
    }
  },
  {
    id: "medical",
    label: "Medical / detox / crisis",
    description: "Need medical, mental health, or substance-related clinical help now.",
    intake: {
      housing: "unknown",
      working: false,
      has_pet: false,
      has_rv: false,
      needs_medical: true
    }
  }
];

// Helper for quick lookup by id
export function getPreset(id) {
  return INTAKE_PRESETS.find(p => p.id === id);
}
