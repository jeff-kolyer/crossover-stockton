# Structured information migration

## Converted in this pass

- Froze a pre-migration JSON inventory in `INFORMATION_BASELINE.json` with paths, sizes, hashes, and data shapes. Original source collections were retained; the dog investigation gained only `publicName` and `indexSummary` for its existing public presentation.
- Moved shared Crossover identity, principles, methods, and About prose to `crossover.json`, with people in `people.json`. Home and About resolve these through the framework-independent Model API.
- Moved four dog-gap facts from the Needs page copy to `claims.json`, preserving their values, source record IDs, and stated limits. The unknown citywide population remains unknown; shelter intake is explicitly scoped to the multi-jurisdiction service area.
- The three Action cards live in `src/pages/action-cards.json` as page configuration. Their counters derive from linked tasks and actual activities.
- Added 20 collection schemas plus shared, page, and View definitions, a strict schema checker, cross-reference and evidence checks, and `npm run check:data`. The existing investigation validator remains in the gate.
- Added 15 validated page compositions and a View method registry. The Action page now resolves its investigation and action list through that registry and renders the list with the shared section renderer. Home, Needs, Updates, Stories, About, and the investigation data adapter read their shared records through the Model API.
- Moved route parsing, canonical redirects, and document-title decisions to `src/controller/routes.ts`; it resolves needs, stories, reports, organizations, and legacy work through the Model API. `App.tsx` retains browser history state. `src/view/PageRenderer.tsx` dispatches the existing page Views through the shared site shell.

## Retained as legacy during migration

- Existing Needs, Stories, Updates, investigation workspace, articles, and report Views continue to use their established components and data adapters. Their presentation has not been replaced by the generic section renderer. This preserves current visuals and behavior while the compositions provide a validated target for later conversion.
- `investigations.json` holds the investigation record and its primary goal; `objectives.json` holds its five canonical objectives. Their stable IDs and existing task, activity, evidence, and finding relationships were preserved from the former question records. Need-record `unknown_questions` remain separate.
- Source objects remain embedded in records. Eleven internal Crossover records have no external URL; no publication URL or source ID was fabricated. Projects, articles, and the remaining page-specific editorial copy remain in their original files.
- Action counts derive from actual activities linked to tasks. An observed-dog count remains unknown if completed visits lack that field.

## Later collection cleanup

The investigation's source is now `investigations.json`, with its goal, status, summaries, and evidence links. Unused planning notes and barrier threads are archived under `docs/research/`; five AI-assisted initial assessments were also retired from active evidence and archived there. Map review metadata lives in `src/pages/map.json`. The 14 measurements in `measurements.json` link directly to the investigation and their source evidence. Historical `/work/...` URLs remain redirects in routing code.

Completed Crossover actions now live in `activities.json`; the remaining source records live in `evidence.json`. The five activities retain their IDs, dates, outcomes, and links. `findings.json` and `tasks.json` remain their own collections. Activity presentation now derives primary and related objective records from canonical links rather than duplicated lists on each objective.

## Validation

Run `npm run check:data`, `npm run check:layout`, and `npm run build`. The data check rejects invalid schema values, duplicate IDs, missing references, mismatched page composition references, invalid source URLs, and an administrative-count claim without a measurement link. It covers needs, people, principles, methods, investigations, objectives, tasks, activities, evidence, findings, organizations, stories, locations, measurements, claims, projects, and articles. It also validates page navigation and Action card configuration. The investigation validator checks actual versus planned activity, finding support, and the canonical task/objective/finding graph.

The Model API is independent of React and layout classes. Page compositions contain record IDs and View method names, so a new renderer can consume the same records without extracting facts from JSX. The remaining legacy Views listed above are the outstanding migration work before the entire site has one page renderer.
