# Information inventory

Baseline: 2026-11-02. The byte counts, SHA-256 hashes, top-level fields, image-reference counts, and URL counts for the original JSON files under `src/data` are frozen in [INFORMATION_BASELINE.json](INFORMATION_BASELINE.json). That manifest is historical: the current files below have since been reorganized, and page definitions and interface copy have moved to `src/pages/` and `src/ui/`.

## Existing collections

| Source | Records | Information |
| --- | ---: | --- |
| `needs.json` | 5 | Identified needs, summaries, assessments, uncertainty, responder roles, and links to records and stories. |
| `investigations.json` | 1 investigation | Primary goal, scope, status, public summaries, and cited evidence. Objectives are separate linked records. |
| `objectives.json` | 5 | Stable investigation objectives with task, activity, evidence, and finding references. |
| `tasks.json` | 12 | Work to do or completed work, with status and references. |
| `activities.json` | 5 | Completed Crossover actions with occurrence dates, outcomes, and investigation links. |
| `evidence.json` | 47 | Source-attributed reports, observations, public developments, and older research and planning records. Five AI-assisted initial assessments were retired from active data. |
| `findings.json` | 3 | Reviewed investigation findings with supporting evidence, related objectives, limitations, and review dates. |
| `measurements.json` | 14 | Measured values with source, period, coverage, and investigation IDs. |
| `projects.json` | 6 | Proposed, funded, developing, completed, and operating capacity projects, with evidence and open questions. |
| `organizations.json` | 11 | Organizations, sites, summaries, URLs, verification notes, and map references. |
| `locations.json` | 14 | Generalized map references, source dates, verification state, uncertainty, and evidence links. Eight are historical reports, four recent public reports, and two official locations/records. |
| `stories.json` | 6 | Dated stories, source URLs, people and organization connections, and images. |
| `articles.json` | 4 | Published explanatory articles and related gaps/locations. |

`src/pages/` contains page definitions. `src/pages/compositions.json` maps the legacy routes and route templates to semantic collections and View methods; `src/pages/home.json` is the authoritative homepage definition. `src/pages/site-navigation.json` defines page links and labels, and `src/pages/action-cards.json` defines the three Action cards. Map review policy and dates are in `src/pages/map.json`. Activity display notes are in `src/pages/activity.json`. Interface copy lives in `src/ui/`. The source collections remain the authority for facts and evidence.

## Shared references and provenance

- Stable IDs connect needs, investigations, objectives, tasks, records, findings, projects, organizations, locations, stories, and articles. `scripts/validate-investigation-data.mjs` checks their references and distinguishes actual activities from plans.
- `activities.json` and `evidence.json` preserve the original record IDs and source objects. Some internal Crossover records have no external URL; no publication URL or source ID was fabricated.
- Five `activities.json` entries have occurrence dates and self-reported evidence status. A separate `planning_update` in `evidence.json` has `planned_not_observed` and does not count as an activity. The one field report is linked to an actual activity.
- Findings range from `established` to `insufficient_evidence`, `developing`, `preliminary`, and `exploratory`. A finding's statement, limitations, evidence references, and `current` flag must stay together.
- Dates appear as `published_at`, `checked_at`, `occurred_at`, `recorded_at`, `completed_at`, `last_reviewed_at`, and several project-specific dates. These meanings must remain distinct.
- Existing image references appear in needs, stories, evidence, and page copy. Hero and About media paths also appear directly in React components. The historical baseline manifest records the original data-file image counts; moving an image reference must retain its path and alt text.

## Page use and runtime derivations

Home, Needs, Stories, Updates, and About now resolve their shared records through the Model API. Action uses page configuration for its cards and derives progress counts from linked tasks and actual activities. The dog workspace joins investigations, tasks, objectives, records, findings, organizations, locations, articles, and projects through its data adapter. Page JSON retains image/alt, navigation, and page-specific editorial copy.

The application calculates active/sorted gaps and stories, update chronology, actual activities, task priority context, active findings, Action record-request statistics, and filtered map/list results at runtime. Those calculations are controller or model-query responsibilities. They are not new source statements.

Shared menu labels and destinations are in `src/ui/shared.json`; route parsing, canonical redirects, and titles are in `src/controller/routes.ts`; page-specific links remain in page configuration. The page-composition registry preserves existing URLs.

## Migration issues to resolve explicitly

1. Source objects are nested in records and often have no ID. A future source registry needs an editorial ID policy; a URL alone should not be mistaken for a verified publication identity.
2. `objectives.json` defines the canonical investigation objectives and their Activity record links. Overview, Activity, and Findings use the same IDs and titles. The Activity page derives primary and related records from those links and each record's primary objective. A need's `unknown_questions` are separate statements about that need record.
3. Five AI-assisted initial assessments and the unused investigation planning notes were removed from active data and preserved under `docs/research/`. The three reviewed findings remain in `findings.json`.
4. Action statistics derive from linked tasks and actual activities. Dog counts remain unknown when visits exist but the records lack an observed count.
5. Existing page JSON still includes page-specific editorial statements and presentation labels. Shared substantive About statements and need-related claims use semantic records; navigation and Action cards remain page configuration.
