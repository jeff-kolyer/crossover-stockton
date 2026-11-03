# Explorer Model review

Reviewed November 3, 2026, before adding Explorer renderers. This describes the current source data and generated public snapshot, not an idealized future ontology. Counts reflect the current checkout and can change as records are edited.

Implementation follow-up: Explorer has six browse groups: Updates, Crossover, Needs, Investigations, Stories, and Articles. Investigations opens individual investigation records, each with child collections derived from explicit relationships. Organizations, evidence, and projects appear in an investigation branch only when related to it. Current workstreams have no reliable investigation association, so their three records remain searchable but have no invented child path. The snapshot has 158 canonical public records after the Findings cleanup. The 20-collection inventory below records the Model as it stood during the required initial review, with the Findings count updated to match the current collection.

## Source collections and semantic types

The Model in `src/model/index.ts` reads semantic JSON collections under `src/data/`, indexes stable IDs, checks selected references, and exposes raw records alongside derived queries. The 27 JSON schemas under `src/schemas/` are: `action`, `activity`, `article`, `claim`, `common`, `development`, `evidence`, `finding`, `identity`, `investigation`, `legacy-work`, `location`, `measurement`, `method`, `need`, `organization-service`, `organization`, `page`, `person`, `principle`, `project`, `question-group`, `question`, `source`, `story`, `view`, and `workstream`. `common`, `page`, `view`, `source`, `organization-service`, `development`, and `legacy-work` do not have separate public Explorer collections. Schemas describe the main type and properties, but many source files contain additional optional fields not enumerated by their schema.

| Public collection | Source | Count | Meaning and example |
| --- | --- | ---: | --- |
| Identity | `crossover.json` | 1 | Crossover Stockton's identity, purpose, geography, and founder links (`crossover-stockton`). |
| Principles | `principles.json` | 4 | Guiding beliefs (`work-to-vocation`). |
| Methods | `methods.json` | 2 | Stated ways of working (`investigation`). |
| People | `people.json` | 1 | Public person and organization roles (`jeff-kolyer`). |
| Organizations | `orgs.json` | 11 | Named groups and services, with verification notes (`stockton-street-dogs`). |
| Needs | `gaps.json` | 5 | Identified needs, uncertainty, and references (`dogs-safe-placement`). Status is an assessment, not proof of severity. |
| Investigations | `dogs-investigations.json` → `active_investigations` | 1 | Bounded inquiry (`street-dog-immediate-welfare`). |
| Questions | `investigation-questions.json` | 5 | Questions with task, activity, evidence, and finding IDs (`where-dogs-need-help`). |
| Activity question groups | `activity-question-groups.json` | 5 | Activity page groupings (`question-extent`); these are presentation groupings, not another investigation-question type. |
| Tasks | `tasks.json` | 12 | Work with status and explicit `order_by_id` (`task-review-sas-field-call-records`, open). A completed task is not an additional event. |
| Activities | Derived from `records.json` | 5 | Evidence records classified `activity` that occurred and are not planned (`crossover-2026-11-02-sas-field-call-records-received`). |
| Findings | `findings.json` | 3 | Evaluated statements with status, evidence links, limitations, and review dates (`finding-public-street-dog-information-fragmented`). |
| Locations | `investigation-locations.json` | 14 | General or mapped places, verification state, evidence links (`weston-ranch-carrie-street`). Precise coordinates are not published by Explorer. |
| Evidence records | `records.json` | 57 | Source-attributed records of conditions, services, updates, plans, outcomes, activities, reports, and more. Five Activity entries appear here too under the **same IDs**. |
| Claims | `claims.json` | 4 | Attributed assertions and their verification state (`stockton-street-dog-population-reported-estimate`). |
| Measurements | `dogs-research.json` → `measurements` | 14 | Values with unit, period, coverage, source, and evidence state (`sas-2024-dog-intake-total`). The research baseline contains other data not exposed as independent collections. |
| Stories | `stories.json` | 6 | Source-linked narratives (`truckloads-of-food-reached-families`). Publication date is distinct from event date. |
| Projects | `projects.json` | 6 | Capacity interventions with planning, funding, and operational distinctions (`canine-campus`). |
| Workstreams | `workstreams.json` | 3 | Current grouped actions (`requesting-records`). |
| Articles | `articles.json` | 4 | Published explanatory content (`friction-of-volunteering`). |

These 20 collections contain 163 collection appearances but 158 distinct public snapshot IDs because the five activities also belong to Evidence records. `records.json` currently has 57 source records across 18 `record_type` values, including `activity` (5), `field_report` (1), `current_ask` (9), `current_service` (6), `update` (6), `planning_update` (5), and `finding` (5). A `record_type: "update"` is a legacy evidence classification; the public Updates feed is a Model query over developments and selected activities, not a second source database.

Other source collections include `work.json` (9 legacy work records), map maintenance (1 object), the research baseline (1 object), and page copy/configuration in `src/data/pages/`. `pages/compositions.json` maps 16 routes or templates to semantic source types and presentation methods. These are not all independent semantic record collections.

## Relationships and queries

IDs connect the graph: identity → founder/principles/methods; need → evidence/organizations/stories; investigation → need; question → investigation/tasks/activities/evidence/findings; task → investigation/questions/basis records/activities/organizations/locations; finding → supporting and contradicting evidence; claim and measurement → source evidence; project → needs/evidence/organizations; story → needs/organizations; location → investigation/evidence. The receipt activity is linked to the October 20 records request through `basis_record_ids`, to the dog need through `gap_ids`, and to the investigation through `investigation_id`.

`siteModel` offers ID lookups (`getTask`, `getEvidenceRecord`, etc.), collection queries (`getAllTasks`, `getAllEvidence`, etc.), investigation/question joins (`getTasks`, `getActivities`, `getFindings`), source and location lookups, and `getPublicUpdates()`. Derived collections are not new records: `getAllActivities()` filters actual occurred activities from Evidence; `getPublicUpdates()` selects and sorts publishable developments. Task order is read from each task's `order_by_id`. Some legacy broad investigation questions and Activity question groups overlap semantically with the five normalized question records, but have different IDs and have not been reconciled.

## Existing Explorer hierarchy and publication

`src/model/explorer-publication.json` names the six top-level browse groups and the types eligible for investigation child collections. `scripts/build-explorer-data.mjs` loads Model queries through Vite; `scripts/explorer-snapshot.mjs` derives each investigation branch from stable IDs and explicit relationships. It retains one canonical record payload even when the record appears in several browse paths. The snapshot also contains field labels and missing-reference diagnostics. Tree and Breadcrumb read the same hierarchy; search indexes published record fields and linked titles.

Publication currently excludes records with `active: false`, `published: false`, or `public: false`. It then projects only top-level fields listed for that collection and only allowed nested keys for known objects such as `source` and `outcome`. The build rejects known private fields including `visit_notes`, `checklist`, `coordinates`, `contact_questions`, `instructions`, and `source_notes`. A record can appear in multiple collections; projected fields are merged under one stable ID. The generated `title`, `description`, `typeName`, and group counts are Explorer summaries. They are **not** source JSON. Links to unpublished or absent targets are reported unavailable, rather than exposing their source values.

The publication check needs one correction before adding more renderers: it does not currently exclude explicit `visibility: "internal"`. Only one evidence record currently carries `visibility: "public"` and the other 56 have no visibility property. Legacy absence therefore cannot be treated as private without suppressing existing public records, but an explicit internal flag must be respected. The snapshot is a public **projection** of source records, not their complete raw JSON. A JSON renderer should be labelled **Public JSON** and serialize the projected record fields, preserving their original property names and public values without implying that omitted fields do not exist.

## Renderer implications and current limits

- Tree and Breadcrumb can share the same group → collection → record snapshot. Breadcrumb should traverse one level at a time and derive its path from that snapshot, rather than duplicating the grouping in a new config file. A record may have more than one collection path (activities also appear in Evidence); the current selected path should be retained when known, with a deterministic fallback for direct links.
- Reference and Public JSON should inspect the **same selected public record**. Reference can use schema type, field labels, date meanings, reference IDs, source attribution, limitations, and nested objects. Public JSON should render the projected fields without title/description summaries invented by Explorer.
- The current Reference-like `RecordDetails` generically lists projected fields but infers references by field-name suffix and formats every number alike. It does not use schema property metadata to distinguish dates, measurements, or ID references. Relationship interpretation belongs in the Model/snapshot contract, not in the View.
- Nested source objects usually have publisher and URL but no stable source ID. They should be rendered as attributed source information, not assigned a fabricated record identity. The schemas are permissive about many nested and optional fields, so a generic renderer needs an honest fallback for unknown keys, `null`, and unavailable references.
- Evidence dates must retain meaning: `occurred_at`, `published_at`, `checked_at`, and `recorded_at` are different. A reported street-dog estimate is not a verified count; `sas-2024-dog-intake-total` is dog intake events for a reporting period, not a street-dog census. Findings must keep support and contradiction links and limitations visible. Locations may have no coordinates or deliberately generalized positions.
- `docs/INFORMATION_INVENTORY.md` is a November 2 baseline and predates the receipt and twelfth task. Current counts above come from actual source files and the generated public snapshot.

## Minimum shared contracts to add

Retain one `ExplorerSnapshot`: groups/collections define browse paths, records provide public-safe fields plus schema/type identity, and schema-derived field metadata identifies dates, references, and meaningful labels. The Controller owns selected record ID, selected browse path, search, navigation mode, and record display mode. The Views consume the same snapshot record; neither view computes publication eligibility or fabricates relationships. Browser URL state should preserve record and path so direct links and back/forward navigation work.
