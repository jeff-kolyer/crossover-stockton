# CSS reset inventory

The pre-reset design is preserved by commit `0dd89ea` on branch `codex/css-reset`.
The only application stylesheet currently imported is the empty `src/styles/app.css`.
All original files below remain in the repository but are disconnected.

## Authored stylesheets

| File | Original entry point |
| --- | --- |
| `src/index.css` | `src/main.tsx` |
| `src/styles/design-system.css` | `src/main.tsx` |
| `src/styles/investigation-app.css` | `src/main.tsx` |
| `src/components/AboutPage.css` | `AboutPage.tsx` |
| `src/components/ActionDetailPage.css` | `ActionDetailPage.tsx` |
| `src/components/ActionIndexPage.css` | `ActionIndexPage.tsx`, `DogGapExperience.tsx` |
| `src/components/DogGapExperience.css` | `DogGapExperience.tsx`, `WorkPage.tsx` |
| `src/components/DogGapLanding.css` | `DogGapExperience.tsx`, `WorkPage.tsx` |
| `src/components/DogGapOverview.css` | `DogGapExperience.tsx`, `DogGapOverview.tsx` |
| `src/components/DogsLocationsMapPage.css` | `DogsLocationsMapPage.tsx` |
| `src/components/HomeLanding.css` | `HomeLanding.tsx` |
| `src/components/InvestigationPageHeader.css` | `InvestigationPageHeader.tsx` |
| `src/components/KeyFactorsPage.css` | `KeyFactorsPage.tsx` |
| `src/components/PlainActionButton.css` | `PlainActionButton.tsx` |

The third-party `leaflet/dist/leaflet.css` import from `src/main.tsx` is also disconnected. Google Maps draws its own map and controls, including styles outside the application's CSS bundle.

## CSS modules and utility frameworks

There are no `*.module.css` files, Sass/Less files, Tailwind configuration, Tailwind directives, or Tailwind utility imports. The `clsx` package is used to compose class names in `src/lib/utils.ts`; it does not inject styles.

## Inline styles and runtime style changes

- `DogCareScenario.tsx`: inline width for the stage track.
- `DogGapExperience.tsx`: inline `top` value while dragging the map information sheet.
- `DogsResearchContent.tsx`: inline width for a chart bar.
- `GoogleLocationsMap.tsx`: inline position, size, transform, and coordinates for map marker buttons.

The two chart widths have no visual effect without their old CSS. The sheet offset and Google marker coordinates are positioning needed for interaction; they remain in place during this visual reset.

## Dynamic classes

Runtime classes remain in markup but have no effect while their stylesheets are disconnected. They occur in:

`ActionModal.tsx`, `DogCarePreview.tsx`, `DogCareScenario.tsx`, `DogGapExperience.tsx`, `DogGapOverviewLanding.tsx`, `DogsInvestigationContent.tsx`, `DogsLocationsMapPage.tsx`, `DogsResearchContent.tsx`, `FeedCard.tsx`, `FeedSummary.tsx`, `GapDetailPage.tsx`, `GapSourcesPage.tsx`, `GapUpdatesPage.tsx`, `GoogleLocationsMap.tsx`, `HomePage.tsx`, `InvestigationLocations.tsx`, `KeyFactorsPage.tsx`, `ModeRow.tsx`, `PublicMobileMenu.tsx`, `PublicSiteNav.tsx`, `TagRail.tsx`, `UpdatesPage.tsx`, `ViewSummary.tsx`, `WorkPage.tsx`, and `WorkSectionNav.tsx`.

These include selection and status classes (`is-active`, `is-selected`, `is-expanded`, `is-collapsed`, status variants), map sheet states, page and route variants, menu-open body classes, and conditional card classes. No runtime-created `<style>` element, stylesheet rule insertion, or CSS-in-JS library was found in application source.
