# Architecture Overview

## High-Level Design
Crossover Stockton is a **client-side only, vanilla JavaScript application** designed to be hosted on any static file server. It relies on standard browser APIs and avoids build steps, frameworks, or complex dependencies, ensuring long-term maintainability and ease of deployment.

## Tech Stack
*   **Language:** JavaScript (ES6+ Modules)
*   **Markup:** HTML5
*   **Styling:** CSS3 (Custom properties, Flexbox/Grid)
*   **Data:** JSON (Public API Feed)
*   **Runtime:** Browser-only (No Node.js backend required for logic)

## Directory Structure
```text
/
├── .vscode/            # Editor configurations
├── docs/               # Project documentation (Bible, Architecture, Roadmap)
│   └── canonical-snippets/ # Reusable code snippets
├── public/             # Web root (served to client)
│   ├── api/v1/         # Public Data Feed (JSON)
│   │   ├── resources.json       # Primary database
│   │   ├── servicesCatalog.json # Service definitions
│   │   └── facetsCatalog.json   # Access/Compatibility definitions
│   ├── app/            # Application logic
│   │   ├── core/       # Core modules (engine, UI components)
│   │   ├── ui/         # Reusable UI utilities
│   │   └── app.js      # Entry point & state management
│   ├── css/            # Stylesheets
│   │   └── styles.css  # Global styles
│   ├── schema/         # JSON Schemas
│   │   └── crossover.resources.schema.json
│   ├── index.html      # Main entry HTML
│   └── reality-map.html# Alternate statistical view
├── server/             # Backend maintenance scripts
│   └── validate.js     # Data validation script
└── root scripts/       # Linting and maintenance (check-icons.cjs, check-regex.cjs)
```

## Core Modules & Logic
The application uses native ES Modules (`<script type="module">`) for code organization.

### 1. Entry Point (`app.js`)
*   **Responsibility:** Bootstraps the application, handles data fetching (`fetch('/data/resources.json')`), and manages global state.
*   **State Management:**
    *   Maintains in-memory state for `ALL_RESOURCES`, `CURRENT_ACCESS` (facets), and `OPEN_NOW` status.
    *   Persists user preferences (selected filters) to `localStorage`.
*   **Orchestration:** Listens for custom events to trigger re-rendering of results.

### 2. Logic Engine (`core/engine.js`)
*   **Responsibility:** Pure function logic for filtering resources.
*   **Filtering Algorithm:**
    *   **Services:** OR logic (Resource must match ANY selected service).
    *   **Facets/Access:** AND logic (Resource must match ALL selected access requirements).
    *   **Availability:** Time-based filtering (checks current time against parsed hours).

### 3. UI Components (`core/*.js`)
*   **Filter Modal:** Manages the Unified Filter interface (Services + Access Facets).
*   **Open Now Toggle:** specialized UI control for time-based filtering.
*   **Components:** Modular rendering functions (e.g., `renderResults`, `createResourceTile`).
*   **Maps:** `core/map.js` handles Leaflet initialization and GeoJSON formatting.

### 4. Data Layer (Public API Feed)
*   **Decoupled JSON:** The UI relies entirely on `/api/v1/` JSON files for configuration (services, facets) and entity data (resources).
*   **Dynamic Loading:** `app.js` fetches all catalogs and resources concurrently during the boot sequence.

## Data Flow
1.  **Init:** `app.js` loads `resources.json` and restores filters from `localStorage`.
2.  **Interaction:** User toggles a filter in `FilterModal` or toggles `Open Now`.
3.  **Event:** A custom event is dispatched (e.g., `servicesFilter:changed`).
4.  **Update:** `app.js` catches the event, calls `engine.filterResources()`, and re-renders the Results Grid.

## Design Patterns
*   **Event-Driven:** Components are decoupled via `document.addEventListener`.
*   **Feature Detection:** Uses modern APIs (e.g., `<dialog>`, ES Modules) with graceful degradation where possible.
*   **No Build:** The code written is the code served. No Webpack, Vite, or Babel transcoding.

## Codebase Reference

### Root Directory (`/`)
*   `check-icons.cjs`, `check-regex.cjs`: Maintenance scripts for validating codebase quality.
*   `package.json`: Root package configuration.

### Documentation (`/docs`)
*   `PROJECT_BIBLE.md`: Core design philosophy and guidelines.
*   `architecture.md`: This file, structural overview.
*   `roadmap.md`: Project phasing, goals, and principles.
*   `schema.md`: Definition of the data schema.
*   `mvp-scope.md`: Scope definitions for the initial release.
*   `canonical-snippets/`: Reusable, approved code patterns.

### Web Root (`/public`)
*   `index.html`: Main application entry point. Contains the app shell, header, footer, and slots for dynamic content.
*   `reality-map.html`: Alternate statistical view.

### Application Logic (`/public/app`)

#### Entry Point
*   **`app.js`**: Main bootstrap file. Initializes the application, checks page capabilities, loads data via API, and orchestrates main UI rendering.

#### Core Modules (`/public/app/core`)
*   **Logic & State:**
    *   **`engine.js`**: Pure functional filtering logic (`filterResources`, `serviceMatch`, `accessScore`).
    *   **`selectionModal.js`**: Generic, reusable logic for managing selection modals.
    *   **`openNow.js`**: Logic for parsing schedule strings and verifying if a resource is open.
    *   **`theme.js`**: Manages color themes and UI mode switching.
*   **Component Rendering:**
    *   **`filterModal.js`** / **`renderFilterModal.js`**: Orchestration components for the filter modal interface.
    *   **`renderServicesList.js`**: Renders the checkboxes for filtering services.
    *   **`renderFacetsList.js`**: Renders access, compatibility, and eligibility facets.
    *   **`renderSituationMenu.js`**: Renders the top navigation (Urgent Needs, Daily Basics).
    *   **`renderRealityRail.js`**: Renders side-nav elements for Reality Map view.
    *   **`openNowToggle.js`**: Manages interaction logic for the Open Now filter toggle.
    *   **`map.js`**: Handles map initialization and rendering (Leaflet integration).
    *   **`icons.js`**: Helper functions for looking up icons based on service keys.
*   **Data (`/public/app/core/data`):**
    *   **`iconMap.js`**: Static configuration mapping service keys to specific Lucide icon names.

#### UI Utilities (`/public/app/ui`)
*   **`renderIcon.js`**: Utility for programmatically rendering icon elements (e.g. replacing tags with Lucide SVGs).
*   **`enableRailDrag.js`**: Utility for enabling mouse-drag horizontal scrolling on navigation rails.

### Styles (`/public/css`)
*   **`styles.css`**: Global stylesheet implementing the design system (CSS Custom Properties, Flexbox, layout structure).

### Data & API (`/public/api`, `/public/schema`)
*   **`/api/v1/resources.json`**: Primary service dataset.
*   **`/api/v1/servicesCatalog.json`**: Definitions of valid service types.
*   **`/api/v1/facetsCatalog.json`**: Definitions of access requirements and tags.
*   **`/schema/crossover.resources.schema.json`**: JSON Schema ensuring data integrity of `resources.json`.

### Server (`/server`)
*   **`validate.js`**: Node.js script utilizing `ajv` to validate `resources.json` against the defined JSON schema.