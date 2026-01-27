// app/core/routing.js
// Converts lightweight intake answers into: { track, filters }

export function routeIntake(intake) {
  // intake fields we’ll use (keep it minimal and forgiving)
  // intake = {
  //   housing: "at_risk" | "unsheltered" | "vehicular" | "shelter" | "unknown",
  //   working: boolean,
  //   has_pet: boolean,
  //   has_rv: boolean,          // true if RV/vehicle living is relevant
  //   needs_medical: boolean    // urgent clinical need
  // }

  // 1) Highest priority: clinical/medical
  if (intake.needs_medical === true) {
    return {
      track: "D",
      filters: {
        // Track D often isn’t “employment compatible” by nature, so don’t auto-filter it out.
        low_barrier: undefined
      }
    };
  }

  // 2) Prevent housing loss / emergency stabilization
  if (intake.housing === "at_risk") {
    return {
      track: "A",
      filters: {
        // Track A must respect employment/pets/vehicles; don’t over-filter.
        pet_friendly: intake.has_pet === true ? true : undefined,
        rv_allowed: intake.has_rv === true ? true : undefined,
        employment_compatible: intake.working === true ? true : undefined,
        low_barrier: true
      }
    };
  }

  // 3) Vehicular / working stabilization
  if (intake.housing === "vehicular" || intake.working === true) {
    return {
      track: "B",
      filters: {
        pet_friendly: intake.has_pet === true ? true : undefined,
        rv_allowed: intake.has_rv === true ? true : undefined,
        employment_compatible: intake.working === true ? true : undefined,
        low_barrier: true
      }
    };
  }

  // 4) With nature / autonomy / life maintenance
  if (intake.housing === "unsheltered") {
    return {
      track: "C",
      filters: {
        pet_friendly: intake.has_pet === true ? true : undefined,
        rv_allowed: intake.has_rv === true ? true : undefined,
        employment_compatible: intake.working === true ? true : undefined,
        low_barrier: true
      }
    };
  }

  // 5) Default: if unknown, choose C (least coercive) with minimal filters
  return {
    track: "C",
    filters: {
      pet_friendly: intake.has_pet === true ? true : undefined,
      rv_allowed: intake.has_rv === true ? true : undefined,
      employment_compatible: intake.working === true ? true : undefined,
      low_barrier: true
    }
  };
}
