# Information inventory

Baseline: 2026-11-02. The byte counts, SHA-256 hashes, top-level fields, image-reference counts, and URL counts for every JSON file under `src/data` are frozen in [INFORMATION_BASELINE.json](INFORMATION_BASELINE.json). Existing source files remain in place. The baseline includes the earlier page-copy conversion; those files are an intermediate presentation source, not the semantic model.

## Existing collections

| Source | Records | Information |
| --- | ---: | --- |
| `gaps.json` | 5 | Identified needs, summaries, assessments, uncertainty, responder roles, and links to records/work/stories. |
| `dogs-investigations.json` | 1 active investigation | Scope, questions, plans, uncertainties, cited evidence, and next verification step. Its embedded questions overlap the separate investigation question collection and need editorial reconciliation before deduplication. |
| `investigation-questions.json` | 5 | Stable questions with task, activity, evidence, and finding references. |
| `tasks.json` | 11 | Work to do or completed work, with status and references. Four are done, two waiting, five open. |
| `records.json` | 56 | Published and internal evidence, developments, plans, four actual activity records, one field report, source attribution, outcomes, and links. |
| `findings.json` | 9 | Findings with supporting evidence, related questions, limitations, review dates, and current/superseded flags. |
| `dogs-research.json` | 1 research baseline | Measurements, reported signals, missing measurements, and research notes. |
| `projects.json` | 6 | Proposed, funded, developing, completed, and operating capacity projects, with evidence and open questions. |
| `orgs.json` | 11 | Organizations, sites, summaries, URLs, verification notes, and map references. |
| `investigation-locations.json` | 14 | Generalized map references, source dates, verification state, uncertainty, and evidence links. Eight are historical reports, four recent public reports, and two official locations/records. |
| `investigation-map-maintenance.json` | 1 | Map source-review and update policy/dates. |
| `work.json` | 9 | Legacy workstreams and their links to gaps, records, projects, and organizations. |
| `stories.json` | 6 | Dated stories, source URLs, people and organization connections, and images. |
| `articles.json` | 4 | Published explanatory articles and related gaps/locations. |

`src/data/pages/` contains page-specific editorial copy, link labels, and view configuration. `src/data/pages/compositions.json` now maps 15 routes and route templates to semantic collections and View methods. `src/data/ui-copy.json` contains shared navigation and interface copy. The source collections remain the authority for facts and evidence.

## Shared references and provenance

- Stable IDs connect needs, work, investigations, questions, tasks, records, findings, projects, organizations, locations, stories, and articles. `scripts/validate-investigation-data.mjs` checks the central dog-investigation graph and distinguishes actual activities from plans.
- `records.json` carries 45 records with a source URL. Eleven internal Crossover records have source publisher/type but no external URL. The source objects do not yet have stable source IDs; no IDs will be invented for them during migration.
- Four `record_type: "activity"` entries have occurrence dates and self-reported evidence status. A separate `planning_update` has `planned_not_observed` and does not count as an activity. The one field report is linked to an actual activity.
- Findings range from `established` to `insufficient_evidence`, `developing`, `preliminary`, and `exploratory`. A finding's statement, limitations, evidence references, and `current` flag must stay together.
- Dates appear as `published_at`, `checked_at`, `occurred_at`, `recorded_at`, `completed_at`, `last_reviewed_at`, and several project-specific dates. These meanings must remain distinct.
- Existing image references appear in gaps, stories, records, and page copy. Hero and About media paths also appear directly in React components. The baseline manifest records the data-file image counts; moving an image reference must retain its path and alt text.

## Page use and runtime derivations

Home, Needs, Stories, Updates, and About now resolve their shared records through the Model API. Action resolves its investigation and workstream order through validated page composition. The dog workspace joins investigations, tasks, questions, records, findings, organizations, locations, articles, and projects through its data adapter. Page JSON retains image/alt, navigation, and page-specific editorial copy.

The application calculates active/sorted gaps and stories, update chronology, actual activities, task priority context, active findings, Action record-request statistics, and filtered map/list results at runtime. Those calculations are controller or model-query responsibilities. They are not new source statements.

Shared menu labels and destinations are in `src/data/ui-copy.json`; route parsing, canonical redirects, and titles are in `src/controller/routes.ts`; page-specific links remain in page configuration. The page-composition registry preserves existing URLs.

## Migration issues to resolve explicitly

1. Source objects are nested in records and often have no ID. A future source registry needs an editorial ID policy; a URL alone should not be mistaken for a verified publication identity.
2. `dogs-investigations.json` embeds five broad questions while `investigation-questions.json` defines five cross-linked questions. Their titles/IDs differ. They are retained until a reviewed mapping is possible.
3. `records.json` includes record types and fields beyond the current TypeScript `EvidenceRecord` interface. Schemas must reflect the actual data without deleting fields or weakening evidence distinctions.
4. Some Action statistics are manually reported display values. The records-request count is derived from a specific record. Those sources must remain distinct; an unknown value must never be converted to zero.
5. Existing page JSON still includes page-specific editorial statements and presentation labels. Shared substantive About statements, dog-gap factual claims, and Action workstreams have moved to semantic records; navigation and UI labels remain in View configuration.

No source wording, dates, statuses, image paths, or evidence references are changed by this inventory.
