# Crossover Stockton

*See clearly. Act locally.*

Crossover Stockton is an independent civic organization developing and verifying practical pathways to meet needs in Stockton, California. This repository powers Crossover’s working pathway tracker (`crossoverstockton.org`) — an operational workspace built to test whether real routes to help are actually accessible, rather than a promotional site or an unverified directory.

For the underlying philosophy behind this work, see [PHILOSOPHY.md](PHILOSOPHY.md).

## How the tracker works

The workspace is organized into four counted sections in the top navigation bar (with **About & methodology** and Light/Dark appearance controls in the left menu drawer):

| Section | Role |
|---|---|
| **Help Today** (`/help`, default home) | Surfaces only verified, repeatable routes ready for action today, with confirmed steps and an availability check under 48 hours old. |
| **Pathways** (`/pathways`) | Tracks all prospective and active routes (`PW-*`) across **Cards**, **List** (default on phones `<= 700px`), and **Board** (default on desktop `> 700px`) views, with stage, contribution, and text filters. |
| **Tasks** (`/tasks`) | Tracks concrete fieldwork, follow-ups, source reviews, and organization contacts (`WORK-*`) linked back to pathways and supporting evidence. |
| **Evidence** (`/evidence`, also `/evidence-room/`) | Searchable source catalog of public records, field activities, and work plans (`SHEL-*`, `GOV-*`, `CPRA-*`, `FLD-*`, `WORK-*`, etc.), including source links, custody history, and explicit limitations. |

### Pathway states

Pathways move across four descriptive states — not a mandatory linear sequence:

- **Exploring** — Checking whether a practical, legitimate route to help exists.
- **Blocked** — A documented obstacle (such as an unanswered application, waitlist, or missing intake channel) currently prevents participation.
- **Enabling** — Active work is underway to remove a bottleneck or clarify raw records.
- **Established** — Confirmed open, repeatable, documented with clear steps, and verified within the last 48 hours.

### Example: Doggie Day Out / Stockton Animal Services

Sending a volunteer application or asking Stockton Animal Services about **Doggie Day Out** is **evidence of an attempt** (`FLD-2026-002`, `FLD-2026-004`). Following up to confirm whether and how new volunteers can book an outing is a **task** (`WORK-2026-005`). Only after the route is confirmed accessible with usable steps and a fresh availability check does the **pathway** (`PW-01`) move from **Exploring** to **Established** and appear in **Help Today**.

### Verification standard

A published listing or video lead is not treated as proof of current access. **Help Today** currently starts with **0 verified pathways** — an honest operational state reflecting that advertised or reported avenues have not yet been verified as open and repeatable within the 48-hour freshness window. Each record in **Evidence** separates verified facts, unconfirmed leads, failed or unanswered attempts, and scope limitations.

### Present scope

Crossover can develop pathways for any kind of community need in Stockton without a fixed project or topic hierarchy. Existing street-dog and shelter-access records (`PW-01`, `PW-02`, `PW-04`) serve as the initial working cases.

## Data and operation

- **Authoritative repository data (`src/data/`)**:
  - `pathways.json` — pathway records (`PW-*`), stages, criteria flags (`criteriaMet`), `linkedEvidence` IDs, `actionDetails`, and `checklist` references.
  - `catalog-source.json` — `44` source records (`32` evidence, `5` activities, `7` tasks), validated against schemas in `src/schemas/`.
  - `curated-records.json` — `9` curated records.
  - `record-id-ledger.json` — maps all `53` source IDs to stable public display IDs.
  - `tracker-config.json` — valid stages, contribution categories, and confidence scoring criteria.
- **Generated build artifacts**: `scripts/build-streetwatch-data.mjs` compiles `public/data/records.json` and `src/generated/records.js` (`STREETWATCH_RECORDS`).
- **Browser-local workspace edits**: Creating pathways, adding tasks, updating task statuses/pathway stages, saving field notes, and switching Light/Dark appearance persist in the user's browser `localStorage` (`crossover-field-work-1`, `crossover-field-prefs-1`, `crossover-field-source-1`) and do not write back to the Git repository. The **Refresh from GitHub** action in **About & methodology** can pull newer committed snapshots from `main`.
- **Image credits**: See [docs/IMAGE_CREDITS.md](docs/IMAGE_CREDITS.md) for image attribution and license details.

## Development

```sh
npm install
npm run dev       # build StreetWatch data and start Vite dev server
npm run check:data
npm run build     # validate catalog, build StreetWatch data, Vite production bundle + 404.html
npm run test:ui   # run Playwright UI invariants across 9 desktop, tablet, and mobile viewports
```
