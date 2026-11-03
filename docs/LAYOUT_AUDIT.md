# Crossover layout audit — migration status

The original audit on 2026-11-02 inspected nine first-party CSS files and found 289 typography and spacing declarations, including 231 spacing declarations. It identified competing heading and paragraph margins, child margins layered on parent gaps, independently positioned separators, footer margins, and separate typography adjustments across the public site and investigation app. That inventory was a snapshot of the old implementation. [LAYOUT_SYSTEM.md](LAYOUT_SYSTEM.md) is the authority for the migrated system.

## Legacy declarations removed

| Old pattern | Resolution |
|---|---|
| Heading, paragraph, list, figure, and divider top/bottom margins in shared documents | Central semantic reset makes their external margins zero. HeadingGroup, ProseStack, Stack, and RecordList own the gaps. |
| Home heading and card text margins, including the Find out more link top margin | Home content uses HeadingGroup, Stack, and the parent card grid. |
| Action heading/paragraph compound gap and extra spacing on later actions | HeadingGroup owns heading to summary; separated RecordList owns the line and 16px on each side. |
| About floated-image top margin and paragraph rhythm | About entries use a grid, HeadingGroup, ProseStack, and section boundaries. |
| Story and Updates record top margins | Their lists use RecordList with the shared boundary contract. |
| Public header bottom margin and footer top margin | The public shell owns both relationships; fixed bottom navigation clearance is a named geometry token. |
| Independent Activity question and record margins | QuestionGroup, ActivityRecord, and RecordList own accordion and record spacing. |
| Local H1/H2/H3 sizes and page-level heading overrides | The shared semantic role tokens set 28px/22px/18px on both site and app. |

## Declarations replaced by shared roles

- `src/styles/layout-system.css` defines Body, H1, H2, H3, Small, Control, and Display roles; the four-step spacing scale; named rail widths; semantic defaults; and the layout primitives.
- `src/components/layout.tsx` supplies Page, Section, Stack, Row, Grid, Cluster, Inset, Divider, SectionBoundary, HeadingGroup, ProseStack, SectionHeader, RecordList, RecordRow, QuestionGroup, ActivityRecord, Finding, Figure, MediaRow, and ActionMetrics.
- Public pages and investigation screens now compose those components where the same relationship recurs. Remaining local CSS defines visual treatment, image geometry, grids, navigation, map positioning, and component-specific arrangement.
- The static checker rejects new unauthorized typography, non-scale spacing, vertical margins, semantic heading overrides, responsive type changes, and stale or incomplete exception entries.

## Remaining documented exceptions

There are 22 narrow entries in [layout-exceptions.json](layout-exceptions.json): six named content widths or rails, the public chrome gutter and fixed mobile navigation clearance, home rail inset and background bleed, home Display/subtitle treatments, compact public branding, desktop navigation contraction, home image fade, and resizable map panel/sheet geometry. Each entry names its file, selector, exact property/value, reason, owner, and responsive behavior. The registry is checked on every build.

## Outstanding issues and limits

- The source validator enforces authored declarations, while rendered relationships require the browser contract test in `tests/layout-contracts.cua.js`. The latter is manual because the project's build does not include a browser automation runtime.
- Some controls, map labels, image frames, navigation geometry, and safe-area offsets retain specialized dimensions by design. These are not standard content gaps. The checker requires registration for non-scale spacing and named geometry it recognizes; rendered review remains necessary for browser and map-library behavior.
- `scripts/layout-audit-inventory.mjs` still describes the historical declaration inventory and is retained as a diagnostic source scan, not as the normative specification.
