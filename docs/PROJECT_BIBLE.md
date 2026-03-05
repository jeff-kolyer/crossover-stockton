
# Crossover Stockton — Project Bible v1

**Last updated:** 2026-03-02
**Status:** Map + Filters Functional / Data Contract Stabilizing
**Next Phase:** Real Data Seeding → Geo + Schedule Normalization → Public Feed Publication

---

## 0. Vision

Large words like “homelessness” are too abstract to act on.

Crossover Stockton breaks that abstraction down into **real places, real schedules, and real services**.

Crossover is a public, anonymous terminal that makes Stockton’s support infrastructure visible as a **map of reality** — places (or mobile points in time) where someone can meet concrete needs such as:

* Sleep
* Water
* Restrooms
* Food
* Hygiene
* Connectivity
* Stability
* Care

The system does not begin by asking who you are.
It begins with what exists.

Users shape what they see through simple controls (Filters + Hours).
If no results appear, the system states this plainly — reflecting real gaps in infrastructure, not user failure.

Crossover does not promise solutions.
It makes reality legible.

---

## 1. What This Project Is (Now)

At its core, **Crossover Stockton is not a product.** It holds nothing unique and has no proprietary secret sauce.

In an age of AI, the site acts as public infrastructure that exists specifically to answer the question of how to find and display the various services that exist. It explores how to expose civic services and the verification information behind them. Its primary purpose for existing is to provide a forcing function—a reason to actually populate, standardize, and investigate these services in the real world. 

Anyone can duplicate the site by downloading the codebase or just the JSON file that serves as the database, which shows exactly where each resource comes from. You can simply modify these files if needed to recreate this infrastructure for another region.

Crossover Stockton is:

* A **public JSON feed of standardized resource data**
* A **browser-based terminal** that renders that feed
* A **consumable civic skill** that any community or AI can adopt
* Designed to be forked by other cities
* Built to interoperate with future AI agents

It is not:

* A startup product
* A shelter intake system
* A case-management platform
* A questionnaire flow
* A triage decision engine
* A login-based service

It is a filterable, standards-based resource map.

---

## 2. Post-Scarcity Engineering Context

In a world where intelligence becomes abundant, what becomes scarce is:

* Alignment
* Standardization
* Interoperability
* Verified truth

Crossover is the first project in post-scarcity engineering because:

* It treats civic reality as machine-readable.
* It uses open, forkable standards.
* It separates the **data feed** from the **UI client**.
* It is built for both humans and autonomous agents.

**Motto:**

> Built by bots for bots.

Meaning:

* Humans can use it.
* AI agents can parse it.
* Cities can fork it.
* No one owns reality.

---

## 3. Core Principles (Locked)

### Dignity First

* No labeling people.
* No “homeless” category.
* Language reflects needs, not status.

### Anonymous

* No login.
* No accounts.
* No tracking.
* No stored identity.

### Autonomy

* No interrogation flows.
* No forced paths.
* Filters are user-controlled.

### Mobility Protection

The system must not exclude:

* People living in vehicles/RVs
* People who are employed
* People with pets

If filters implicitly exclude these groups, that is a design error.

---

## 4. System Architecture

Crossover has three layers:

### 4.1 The Feed (Public Data Layer)

A standardized `resources.json` file (or endpoint) containing:

* Stable `id`
* Name
* Description
* Services (canonical ids)
* Facets (compatibility, access, eligibility)
* Geo coordinates (lat/lng)
* Structured schedule (for open/closed logic)
* Provenance (source URL + last verified date)

The feed is:

* Public
* Downloadable
* Forkable
* Machine-readable
* Versioned
* **CC0 Public Domain:** The raw data feed (`resources.json`) is explicitly dedicated to the public domain. It is completely free of copyright restrictions, allowing frictionless ingestion by AI agents, researchers, and other cities without requiring attribution or complex licensing negotiations.

The feed is the civic asset.
The UI is just one client.

---

### 4.2 The Terminal (Browser App)

* Vanilla HTML / CSS / JS
* No framework
* Static hosting
* Fetches JSON via API
* Renders list + map
* Applies filter logic locally

The UI does not contain hardcoded resource data.

---

### 4.3 The Verification Loop

Truth changes. Therefore:

Each resource must include:

* `provenance.source_url`
* `provenance.last_verified`
* `provenance.method` (web / phone / provider / observed)

Corrections begin with:

* Public email (e.g., `updates@crossoverstockton.org`)
* GitHub issues for technical feedback only

Slack is not required.

---

### 4.4 The Agent Data Pipeline (Updating Truth)

Crossover Stockton allows for massive intelligence and data curation without requiring a typical backend server or database tier. It achieves this by fully isolating the **gathering** of data from the **hosting** of data.

When it comes time to automate data verification, the expected architecture is the **GitOps Model**:

1.  **"Smart" External Agents:** AI Agents or scripts will run on external, dedicated compute (e.g., GitHub Actions schedules, Google Cloud Functions, or AWS Lambda). 
2.  **The Work:** These agents will crawl local websites, make automated queries, or process human feedback to verify hours and the "strength of service."
3.  **The Update:** When an agent confirms a change, it simply modifies the `resources.json` and pushes a single new commit to the GitHub repository, exactly as a human developer would.
4.  **"Dumb" Static Hosting:** The moment that commit hits the `main` branch, the CI/CD pipeline runs `validate.js` to ensure the agent didn't break the JSON format, and then seamlessly deploys the fresh HTML/CSS and the updated JSON feed locally to GitHub Pages.

**The result:** The web hosting remains infinitely scalable, free, and incredibly fast, while the heavy lifting of AI intelligence happens entirely behind the scenes during the build process.

---

## 5. Information Architecture

### Pages (MVP)

**Home (Results)**

* Desktop: list left, map right
* Mobile: list first, map one tap away
* Controls: HOURS + FILTERS

**Filters (Unified)**

* Services (what a place provides)
* Facets (access, compatibility, eligibility)

**Resource Detail**

* Description
* Services
* Access notes
* Contact info
* Location (map)
* Schedule
* Verification info

**About**

* Methodology
* Standards explanation
* What “no results” means
* How to submit corrections

---

## 6. The Model — Locked

### 6.1 Resource Model

Resources are:

* Fixed locations OR
* Time-bound mobile services

Each resource is a claim about reality.

---

### 6.2 Filtering Logic (Locked)

**SERVICES = OR logic**

If Water + Food selected → show places that provide either.

**FACETS = AND logic**

If Pet Friendly + No Documentation selected → show only places satisfying both.

**HOURS = AND logic**

If “Open now” selected → resource must currently be open.

**Formula:**

Results
= (ANY selected services)
∩ (ALL selected facets)
∩ (Hours match)

---

## 7. Default State Behavior

If no filters are selected:

* Show a curated starter set in the Reality Dashboard:
  * Water
  * Bathrooms
  * Meals
  * Shelter / Day space

### 7.1 Strength of Service Dashboard

The Reality Dashboard tiles feature horizontal green bars that indicate the **"strength of the service"**. This is a literal representation of available capacity out of known capacity.

*   The system uses a "bar" method to show how many services are available. 
*   For example, if a service exists but is closed due to something other than schedule issues, its tile might show **1/2**. 
*   The dashboard makes reality legible immediately: there is no point in searching for services that you can see by the dashboard don't exist or are currently offline.

Optional time-of-day panel:

* Night: moon / stars
* Day: sun / sky

Panel appears only in default state.
Slides away on interaction.

---

## 8. Map Requirements (Phase 1)

Each resource must include:

```
location: {
  address: "...",
  geo: {
    lat: ...,
    lng: ...
  }
}
```

Map must:

* Render markers from geo
* Sync with list
* Highlight on hover/tap
* Support “Open now” filtering
* Avoid implying certainty if schedule is unknown

---

## 9. Data Contract Requirements (v1 Lock)

Each resource must include:

Required:

* id
* name
* services[]
* location.address
* location.geo
* schedule OR schedule: null
* provenance

Optional:

* description
* contact
* compatibility
* eligibility

No freeform keys.
All services must match `servicesCatalog.js`.

---

## 10. Technical Constraints

* Vanilla JS only
* No React
* No Tailwind
* No bundlers required
* Static hosting
* JSON served via API endpoint
* Can run locally with:

  ```
  npx http-server -c-1
  ```

---

## 11. Definition of Success (Year 1)

A person in Stockton:

* Opens Crossover on phone.
* Selects “Bathrooms + Open now.”
* Sees the nearest currently open restroom.
* The schedule is correct.
* If it’s closed, they can report it.

A city can fork:

* Replace feed URL
* Reuse schema
* Stay interoperable

An AI agent can:

* Parse the feed
* Route a human to the nearest viable service
* Explain tradeoffs

---

## 12. What This Is Becoming

Crossover is no longer just:

> “A Stockton web app.”

It is becoming:

> A civic data standard + terminal model that any city can adopt.

Stockton is the proving ground.

