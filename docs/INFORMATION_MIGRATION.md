# Structured information migration

## Converted in this pass

- Froze a pre-migration JSON inventory in `INFORMATION_BASELINE.json` with paths, sizes, hashes, and data shapes. Original source collections were retained; the dog investigation gained only `publicName` and `indexSummary` for its existing public presentation.
- Moved shared Crossover identity and About prose to `crossover.json`, `people.json`, `principles.json`, and `methods.json`. Home and About resolve these through the framework-independent Model API.
- Moved four dog-gap facts from the Needs page copy to `claims.json`, preserving their values, source record IDs, and stated limits. The unknown citywide population remains unknown; shelter intake is explicitly scoped to the multi-jurisdiction service area.
- Moved the three Action workstreams into `workstreams.json`. Page-specific links and labels remain in `pages/action.json`; the records-request count continues to derive from the existing activity outcome.
- Added 20 collection schemas plus shared, page, and View definitions, a strict schema checker, cross-reference and evidence checks, and `npm run check:data`. The existing investigation validator remains in the gate.
- Added 15 validated page compositions and a View method registry. The Action page now resolves its investigation and action list through that registry and renders the list with the shared section renderer. Home, Needs, Updates, Stories, About, and the investigation data adapter read their shared records through the Model API.
- Moved route parsing, canonical redirects, and document-title decisions to `src/controller/routes.ts`; it resolves needs, stories, reports, organizations, and legacy work through the Model API. `App.tsx` retains browser history state. `src/view/PageRenderer.tsx` dispatches the existing page Views through the shared site shell.

## Retained as legacy during migration

- Existing Needs, Stories, Updates, investigation workspace, articles, and report Views continue to use their established components and data adapters. Their presentation has not been replaced by the generic section renderer. This preserves current visuals and behavior while the compositions provide a validated target for later conversion.
- Existing `dogs-investigations.json` embeds broad questions that overlap `investigation-questions.json`. The Activity page's separate question groups now live in `activity-question-groups.json`. These three sets of labels and IDs do not match one-to-one; they remain distinct until an editorial mapping is reviewed. No question was silently merged or dropped.
- Source objects remain embedded in records. Eleven internal Crossover records have no external URL; no publication URL or source ID was fabricated. Projects, articles, and the remaining page-specific editorial copy remain in their original files.
- Some Action statistics are manually reported, whereas record-request counts are calculated. The checker does not promote a manual value to verified evidence.

## Validation

Run `npm run check:data`, `npm run check:layout`, and `npm run build`. The data check rejects invalid schema values, duplicate IDs, missing references, mismatched page composition references, invalid source URLs, and an administrative-count claim without a measurement link. It covers needs, people, principles, methods, investigations, questions and Activity question groups, tasks, evidence, findings, organizations, stories, locations, measurements, claims, workstreams, legacy work, projects, and articles. The existing investigation validator checks actual versus planned activity, finding support, and the canonical task/question/finding graph.

The Model API is independent of React and layout classes. Page compositions contain record IDs and View method names, so a new renderer can consume the same records without extracting facts from JSX. The remaining legacy Views listed above are the outstanding migration work before the entire site has one page renderer.
