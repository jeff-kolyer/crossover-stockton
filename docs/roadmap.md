# Crossover Stockton — Roadmap

Last updated: 2026-03-03  
Status: Core Filter UX Stabilizing  
Phase: Refinement → Content Depth → Field Validation

---

# 0. Roadmap Philosophy

Crossover Stockton grows in **layers**, not feature explosions.

Each phase must:
- Preserve anonymity
- Preserve autonomy
- Preserve mobility protection
- Keep the app static and browser-only
- Avoid architectural creep

We are not building a platform or a product.  
We are building civic infrastructure to answer the question of how to find and display existing services. Data is reality.

The Reality Dashboard must reflect the **Strength of Service**. It uses visual bars (e.g., 1/2) to show what services actually exist and are currently open. This prevents users from blindly searching for resources that aren't there.

---

# Phase 1 — Core Stability (Current Phase)

**Goal:** Make the filter + results system feel complete, stable, and trustworthy.

## 1.1 UI Refinement (In Progress)

- Stabilize Reality Dashboard sizing across breakpoints
- Finalize “Open Now” visual treatment (calm, not loud)
- Ensure day/night modes are quiet and consistent
- Improve selected tile clarity without heavy borders
- Eliminate layout snapping and background artifacts
- Ensure mobile landscape doesn’t distort tile proportions

**Deliverable:**  
Visual system feels calm, modern, tablet-friendly.  
No visual experiments left in production CSS.

---

## [x] 1.2 Results Rendering Lock

- Clean, readable list format
- “Showing X results” clarity
- Remove unnecessary counts or UI noise
- Ensure:
  - Open services float first
  - Closed services clearly labeled
  - No moral or eligibility tone

**Deliverable:**  
Results feel factual, not institutional.

---

## [x] 1.3 Modal Refactor (Filters)

Replace current modal with:

Structure:
- Category icon
- Category title
- Checkbox list
- 2 columns on wide screens
- No collapse/expand
- No counts
- No clutter

Facets:
- Access
- Compatibility
- Eligibility

**Deliverable:**  
Filter UI feels clean and decisive.  
No interrogation flow.

---

# Phase 2 — Data Depth & Integrity

**Goal:** Make the dataset real, verified, and durable.

## [x] 2.1 Schema Enforcement

- Validate all entries against canonical schema
- Ensure:
  - `track_eligibility`
  - `pet_friendly`
  - `rv_allowed`
  - `employment_compatible`
  - `low_barrier_access`
- Ensure Track A protects employment continuity and vehicles

**Deliverable:**  
Dataset integrity locked.

---

## [x] 2.2 Real Service Population

- Populate Stockton services fully
- Verify hours
- Confirm open/closed logic
- Remove placeholder content permanently

**Deliverable:**  
Real-world usable dataset.

---

## [x] 2.3 Open Now Logic Validation

- Timezone correctness
- Daylight savings correctness
- Cross-midnight service handling
- Visual clarity (green calm, not neon)

**Deliverable:**  
“Open Now” is trusted.

---

# [x] Phase 3 — Map Integration (Controlled Expansion)

**Goal:** Add map without turning into a Google Maps clone.

Rules:
- Map is secondary to list
- No heavy UI overlays
- No routing engine
- No geolocation tracking

Features:
- Toggle list/map
- Pan/zoom to pin when clicking a list item
- Simple clustering if needed

**Deliverable:**  
Map enhances clarity, not complexity.

---

# [x] Phase 4 — Publishing & Pipeline

**Goal:** Establish the production environment and automated deployment.

Steps:
- [x] Establish GitHub repository and clean push
- [x] Configure GitHub Pages or static host (Netlify/Vercel/S3) for `/public`
- [x] Configure DNS settings and custom domain mapping
- [x] Set up automated CI/pipeline to run `validate.js` before deploying
- [x] Establish canonical production URL and apply SSL/TLS certificates

**Deliverable:**  
The site is live (`crossoverstockton.org`), stable, and auto-checks its own data integrity.

---

# Phase 5 — Field Testing

**Goal:** Validate real-world usefulness.

Steps:
- Quiet pilot with:
  - Outreach workers
  - Vehicle residents
  - Employed but unstable individuals
- Observe:
  - Do they understand filters?
  - Do they trust “Open Now”?
  - Are categories intuitive?

Measure:
- Confusion points
- Filter abandonment
- Visual overload
- Missing service types

**Deliverable:**  
UX adjustments grounded in lived experience.

---

# Phase 6 — Trust & Legibility Enhancements

Only after real-world validation.

Potential additions (non-binding):

- “Last verified” badge visibility refinement
- Subtle trust indicators
- Micro-guides (e.g., “How to replace ID”)
- Lightweight “Share service” link

Never:
- No user accounts
- No personalization engine
- No tracking dashboards
- No case workflow

This is a finder. Nothing else.

---

# Phase 7 — Offline & Physical Distribution

**Goal:** Ensure the tool works when devices or connectivity run out.

Physical distribution is often the primary use case for this demographic. We need to support analog workflows for outreach workers and bulletin boards.

Steps:
- Develop a dedicated `@media print` CSS block
- Strip out maps, headers, and interactive UI on print
- Force high-contrast, dense list view with clear addresses and hours
- Add a generated QR code to print view for digital transition

**Deliverable:**  
Anyone can hit "Ctrl+P" and instantly get a beautiful, usable offline flyer of the currently filtered resources without needing a separate PDF generator.

---

# Phase 8 — Multi-Language Support (Localization)

**Goal:** Serve non-English speakers (starting with Spanish) without complicating the architecture.

Steps:
- Keep the app logic identical
- Externalize all hardcoded UI text (tabs, filter labels, buttons) into a lightweight JSON dictionary (`/api/v1/i18n.json`)
- Add a simple language toggle in the header
- Translate the UI shell first. Translating the dynamic data (resource descriptions) is a secondary priority if resources allow, as most value is in the filters/categories themselves.

**Deliverable:**  
The tool is accessible to the broader community without requiring a heavy i18n framework.

---

# Phase 9 — Community Feedback Loop (Correction Pipeline)

**Goal:** Prevent data rot by allowing the community to report inaccuracies seamlessly, without breaking the "no backend" rule.

Steps:
- Add a "Suggest an Edit" or "Report Closed/Incorrect" button to every resource detail view
- Use a zero-backend approach:
  - Phase A: Pre-filled `mailto:` link pointing to a dedicated inbox, automatically including the `resource_id`.
  - Phase B: (If needed) Lightweight embedded form (e.g. Google Form/Typeform) that dumps into a secure spreadsheet for the data maintainer to review.

**Deliverable:**  
Data maintenance becomes a collaborative loop rather than a solo burden, entirely relying on static/third-party tools.

---

# Phase 10 — Civic Stability

Long-term durability layer.

- Documentation freeze of stable architecture
- Backup export of dataset
- Offline copy plan
- Version tagging

**Goal:**  
Make it hard to break and easy to maintain.

---

# Phase 11 — API Feed Contract & Data Governance

**Goal:** Keep the public JSON feed stable, trustworthy, and future-proof without adding backend complexity.

## 11.1 Static API Contract (Read-Only)

- Treat `/public/api/v1/` as a **versioned, read-only API feed**
- Define backwards-compatibility rules:
  - Additive changes are allowed in `v1`
  - Breaking changes require `v2/`
- Client must tolerate unknown fields (forward compatible)
- Standardize fetch paths (no mixed `/data/` vs `/api/`)

**Deliverable:**  
The UI and dataset can evolve without breaking older clients or links.

---

## 11.2 Feed Metadata

- Add `/api/v1/meta.json` (dataset_version, generated_at, schema_version, location)
- Expose “Last updated” via metadata (not hardcoded UI strings)

**Deliverable:**  
Trust and debugging improve; changes are visible and attributable.

---

## 11.3 Agent Auto-Updating (The GitOps Pipeline)

- To maintain the data feed without ballooning the web hosting architecture, establish external AI agents.
- Agents run on external compute (e.g., GitHub Actions, Google Cloud) on a cron schedule.
- Agents verify services, modify the raw `resources.json`, and commit the changes directly to GitHub.
- The repository's CI/CD pipeline serves as the ultimate gatekeeper, validating the data before triggering a static deployment to GitHub Pages.

**Deliverable:**  
The dataset remains fresh and accurate automatically without requiring complex APIs, custom databases, or expensive hosting.

---

## 11.4 Verification & Provenance Rules

- Enforce `last_verified_at` for every resource
- Optional: `verification_method` (`call`, `website`, `in_person`, `partner_report`)
- Keep verification notes non-identifying (no personal data)

**Deliverable:**  
Service accuracy becomes a maintained practice, not a one-time population sprint.

---

## 11.4 Update Workflow Discipline

- Validation must run before publishing:
  - schema validation (AJV)
  - basic sanity checks (hours formatting, lat/lng ranges, required fields)
- Maintain a lightweight changelog for dataset edits

**Deliverable:**  
Data does not rot silently.

---

# Phase 12 — Privacy & Resilience Hardening

**Goal:** Make anonymity true in implementation, not just intent.

- Remove/avoid third-party analytics and tracking pixels
- Prefer local assets over remote CDNs for critical UI (icons, fonts)
- Ensure graceful degradation:
  - app still works if map tiles fail
  - app still works if icon system fails
- Publish a plain-language Privacy page

**Deliverable:**  
Users can trust the tool without needing to “believe” it.

---

# Phase 13 — Accessibility & Low-Connectivity Readiness

**Goal:** Ensure the tool works for more people, more often.

- WCAG contrast check for day/night modes
- Keyboard + screen reader pass for filters and results
- Reduced motion support
- Plan (or implement) offline caching for `/api/v1/*.json` + core assets
- Show “Cached results / last updated” when offline

**Deliverable:**  
The app remains usable on real devices in real conditions.

---

# What We Will NOT Build

To prevent drift:

- Case management system
- Intake workflow
- AI chatbot layer
- Risk scoring
- User profiles
- Social features
- “Journey” funnels
- Gamification
- Ads

This is a finder. Nothing more.

---

# Technical Guardrails

Must remain:

- Static site
- Vanilla JS
- No bundlers
- No frameworks
- One HTML entry
- One JS entry
- Clean `/public` structure
- Public JSON is read-only (static feed)

---

# Success Definition

Crossover Stockton succeeds when:

- A working person living in a vehicle can:
  - Find showers
  - Find safe parking
  - Find work help
  - Without being pushed toward shelter

- A person in crisis can:
  - Immediately find open services
  - Without answering questions

- An outreach worker can:
  - Use it on a tablet
  - Trust the data
  - Trust the tone