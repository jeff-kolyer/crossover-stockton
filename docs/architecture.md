# Crossover Stockton Architecture

This document outlines the high-level architecture, directory structure, key components, and core technologies of the Crossover Stockton application.

## How the App Works

Crossover Stockton is a modern React-based Single Page Application (SPA). At its core, the app serves as a civic attention and diagnostic interface. 

It works by ingesting structured civic records—generated from ambient AI sensor arrays and human verification—and rendering them according to a strict public spec. The UI is fundamentally composed of three primary surfaces:
1. **The Feed**: A chronological or priority-ranked list of civic records (gaps, services, verified updates, signals).
2. **The Map**: A spatial companion that plots those same records using distinct iconography to represent the domain (e.g., food, water, shelter).
3. **The Detail View**: An expanded view of a selected record that replaces the main feed while keeping the map visible and focused.

Data flows through a schema-driven rendering pipeline: every item is fundamentally a `FeedRecord`, and its type, domain, severity, and status inherently control the color accents, map pins, alerts, and badges rendered on the screen.

## Key Technologies

- **Core**: React 19 bundled with Vite for fast local development and optimized production builds.
- **Language**: TypeScript for strict type safety and schema adherence.
- **Styling**: Tailwind CSS v4 for utility-first styling, paired with `clsx` and `tailwind-merge` for dynamic class management.
- **Icons**: `lucide-react` for clean, consistent iconography.
- **Mapping**: `leaflet` and `react-leaflet` to handle interactive map rendering and dynamic marker updates.
- **Animations**: `motion` (Framer Motion) for smooth UI transitions between feed and detail states.

## Directory Structure

```text
crossover-stockton/
├── docs/                   # Project documentation, including operating models and architecture.
├── public/                 # Static assets, local API mocks, and schema configurations.
├── server/                 # Local validation scripts and node-based backend utilities.
├── src/                    # Main application source code.
│   ├── components/         # Reusable React components that make up the UI.
│   ├── data/               # Static data structures, schemas, and sample feed data.
│   ├── lib/                # Utility functions and helper methods.
│   ├── App.tsx             # The main application shell and layout orchestrator.
│   ├── constants.tsx       # Global constants, theme tokens, and domain definitions.
│   ├── index.css           # Global CSS and Tailwind directives.
│   ├── main.tsx            # Application entry point.
│   └── types.ts            # TypeScript interfaces for the FeedRecord and schema.
├── index.html              # The HTML template for the Vite build.
├── package.json            # Project dependencies and npm scripts.
└── vite.config.ts          # Vite bundler configuration.
```

## Key Components

- **`App.tsx`**: The top-level component that manages the core layout (Left Rail / Main App / Map), state (selected records, active filters), and responsive behaviors (desktop vs mobile views).
- **`components/CategoryStrip.tsx`**: A horizontal, interactive filter bar that allows users to toggle active domains (e.g., Food, Shelter, Transit). It filters both the Feed and the Map simultaneously.
- **`components/FeedCard.tsx`**: The building block of the Feed area. It renders a summary of a single `FeedRecord` as a tile, adapting its layout and color cues based on the record's domain and severity.
- **`components/FeedSummary.tsx`**: The "Detail View" component. When a `FeedCard` or map marker is selected, this component replaces the feed list to show deep information about the issue, including why it's showing, human verifications, and what is being done.
- **`components/MapPane.tsx`**: Integrates with Leaflet to render the city map. It subscribes to the current feed records and renders dynamic markers that match the styling and state of the feed cards.
