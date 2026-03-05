# Crossover Resources Feed — Data Contract v1

**File:** `resources.json`
**Purpose:** Public, forkable resource feed for rendering the map, list, and applying filter logic.

This document serves as the human-readable schema. For the formal, machine-readable validation contract, see `public/schema/crossover.resources.schema.json`. 

All commits to `resources.json` are strictly enforced by the `server/validate.js` CI/CD pipeline using Ajv.

---

## 1. Top-Level Fields

All of the following fields are **required**:

*   `schema_version`: Contract version (e.g., "1.0.1")
*   `data_version`: Content revision (e.g., "0.4.0")
*   `last_updated`: Date string (`YYYY-MM-DD`)
*   `jurisdiction`: Object containing `{ city, state, country }`
*   `resources`: Array of Resource records (minimum 1)

---

## 2. Resource Record

A Resource record represents a discrete claim about reality (a location, a mobile service, a hotline, etc.). 

### 2.1 Required Properties

*   `id`: Stable slug identifier (e.g., `stk-st-marys-hygiene-001`)
*   `name`: Plain text string
*   `services[]`: Array of canonical service IDs (e.g., `["water", "hot_meal"]`). Must match IDs in `servicesCatalog.json`.
*   `location`: Object containing:
    *   `address`: Plain text string
    *   `geo`: Object containing `lat` (-90 to 90) and `lng` (-180 to 180)
*   `schedule`: Machine-readable schedule object, **OR** `null` if completely unknown. (See Schedule Model below)
*   `provenance`: Object detailing where this data came from and when it was verified. (See Provenance Model below)

### 2.2 Optional Properties

*   `description`: Plain text string summary
*   `type`: Broad UX categorization. Options: `"location" | "mobile" | "hotline" | "service_area"`. (Default: `"location"`)
*   `status`: Operational status, distinct from schedule. Options: `"active" | "temporarily_closed" | "permanently_closed"`. (Default: `"active"`)
*   `contact`: Object containing any combination of `phone`, `website` (URI), and `email`.
*   `hours_text`: Human-readable fallback string for hours. (Not used for computational filter logic).
*   `notes`: Human-readable notes for internal data curation.

---

## 3. Facets (Filtering Buckets)

Facets separate the *what* from the *how*. While `services` defines what is offered (e.g., "Shower"), facets define the rules of engagement.

These buckets are open for evolution, but core keys are strictly enforced in version 1.0.1:

### 3.1 `compatibility`
*   `pet_friendly`: boolean (True if pets are allowed)
*   `rv_allowed`: boolean (True if RVs/vehicles are allowed overnight or for services)
*   `employment_compatible`: boolean (True if the service requirements/hours do not prohibit maintaining an external job)

### 3.2 `access`
*   `low_barrier_access`: boolean (True if the service intentionally minimizes prerequisites like ID, sobriety, or heavy intake forms)

### 3.3 `eligibility`
*   `track_eligibility[]`: Array containing one or more of `["A", "B", "C", "D"]`. Indicates which strict system tracks this resource legally qualifies for.

---

## 4. Legal / Conditional Enforcement

The schema enforces strict "if-this-then-that" legal logic:

**The Track A Rule:**
If a resource claims `track_eligibility` includes `"A"`, it is legally mandated by the schema that:
1. `compatibility.rv_allowed` MUST be `true`
2. `compatibility.employment_compatible` MUST be `true`

*If either of these are false or missing, the CI pipeline will reject the data commit.*

---

## 5. Schedule Model (v1)

If the hours of operation are known, provide a `schedule` object:

*   `timezone`: Required IANA timezone string (e.g., `"America/Los_Angeles"`)
*   `regular[]`: Required array of schedule blocks:
    *   `days[]`: Array of (`"mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun"`)
    *   `open`: `"HH:MM"` (24-hour clock. e.g., `"08:00"`)
    *   `close`: `"HH:MM"` (24-hour clock. e.g., `"17:30"`)
*   *(Optional)* `exceptions[]`: Array of dates (`YYYY-MM-DD`) with overrides (`closed: true`, or specific `open`/`close` times).

*Note: For 24-hour operations, use `open: "00:00"` and `close: "24:00"`.*

---

## 6. Provenance Model (Verification Loop)

A defining feature of the Crossover architecture is that every single resource carries its own justification. A resource is not real unless it can be proven.

The `provenance` object is **Required**:

*   `source_urls[]`: Array of valid URIs pointing to public proof (websites, PDFs, official county docs).
*   `last_verified`: Date string (`YYYY-MM-DD`) capturing when a human or agent last confirmed the data.
*   *(Optional)* `method`: `"web" | "phone" | "in_person" | "provider" | "unknown"`
*   *(Optional)* `confidence`: Number between `0` and `1`.

---

## 7. Automated Enforcement (GitOps)

No human or agent can manually upload data to the live API endpoints. 

1. Data updates are pushed as Git commits to `public/api/v1/resources.json`.
2. The GitHub Action runner executes `node server/validate.js`. 
3. The script utilizes `ajv` (Draft 2020-12 schema standard) to strictly validate the data payload against `public/schema/crossover.resources.schema.json`.
4. If a single comma is misplaced, a tracking rule is violated, or a required geo-coordinate is missing, the build **fails** and the site is not deployed.
5. If the validation passes, the site UI and the raw JSON feed are published simultaneously to GitHub Pages.