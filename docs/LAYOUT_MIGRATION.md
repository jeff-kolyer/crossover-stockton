# Unified layout migration

## Scope

Migrated the public site and investigation workspace to one typography and spacing source while retaining existing content, routes, imagery, links, filters, map behavior, and responsive arrangements. The governing contracts are in [LAYOUT_SYSTEM.md](LAYOUT_SYSTEM.md).

## Files and components

- `src/styles/layout-system.css`: central type, spacing, width, and specialized geometry tokens; semantic defaults; CSS for shared layout and content components.
- `src/components/layout.tsx`: Page, Section, Stack, Row, Grid, Cluster, Inset, Divider, SectionBoundary, HeadingGroup, ProseStack, SectionHeader, RecordList, RecordRow, QuestionGroup, ActivityRecord, Finding, Figure, MediaRow, and ActionMetrics.
- `src/styles/app.css`, `home.css`, `public.css`, `public-chrome.css`, `activity.css`, `controls.css`, `map.css`, `investigation-google.css`, and `src/components/PublicMobileMenu.layout.css`: removed superseded margins, heading rules, arbitrary content gaps, and separator positioning; retained local visual and functional geometry.
- Public components: HomePage, HomeLanding, AboutPage, ActionIndexPage, ActionProgressStats, UpdatesPage, StoryDetailPage, GapReferencePage, and FieldReportContent now use shared relationships.
- Investigation components: WorkspacePage, InvestigationOverview, and InvestigationActivitySections now use the same HeadingGroup, Stack, RecordList, QuestionGroup, and ActivityRecord contracts.
- `src/main.tsx` imports the central stylesheet before site and app styles.
- `scripts/check-layout.mjs`, `docs/layout-exceptions.json`, and `tests/layout-contracts.cua.js` provide source enforcement, narrow exception registration, and rendered contract checks. `package.json` runs `check:layout` first in the normal build; `package-lock.json` lists PostCSS directly.
- `scripts/validate-gap-tabs.mjs` now checks the Activity heading semantically, allowing the shared HeadingGroup wrapper.

## Visual changes

Standard content text has zero external margin, so gaps come from the nearest named layout parent. Repeated rows with hairlines use one 16px / 1px / 16px boundary contract. Action statistics have three equal columns, with value and label separated by 4px. The About founder area uses a grid in place of an image float. These adjustments may change the amount of visible white space while retaining the site's typography, imagery, and information.

Representative before/after screenshots are in [layout-screenshots](layout-screenshots/) for Home, About, Action, and the investigation Map at 412px and 1280px. The after files should be refreshed after any later layout change.

## Exceptions

[layout-exceptions.json](layout-exceptions.json) records 22 exact entries for rail widths, home Display and rail effects, compact branding, chrome and fixed navigation clearance, and map panel/sheet geometry. New non-scale declarations require their own documented entries; there is no stylesheet-wide exemption.

## Validation

- `npm run check:layout`: source AST validation of authored CSS and relevant inline TSX styles.
- `npm run build`: checker, TypeScript, Vite, prerender, readable content, gap-tab, and redirect checks.
- `tests/layout-contracts.cua.js`: rendered gaps, three-column ActionMetrics, section lines, and overflow on representative routes at 320, 375, 412, 768, and 1280px. Run in the Codex browser REPL after selecting a browser.
- Full route browser sweep: all 28 published routes at those five widths, checking overflow, semantic margins, and computed H1/H2/H3 sizes.
- Interaction smoke checks: public bottom navigation, Task filters, Activity disclosure, Map filters, marker details, and mobile map sheet movement.

The browser test and full route sweep are separate from the normal build because the repository has no browser test runner. Source and build checks do not alone establish visual correctness.
