# Crossover layout audit — 2026-11-02

## Scope and method

I audited the nine first-party CSS files loaded from `src/main.tsx` or components, TSX `style` props, dynamic class composition, and the project's utility configuration. The generated declaration inventory below records **289** `font`, `font-size`, `line-height`, margin, padding, and gap declarations, including shorthands and media rules. It is grouped by file/component and gives selector, value, and source line. `scripts/layout-audit-inventory.mjs --write-audit` regenerates it from PostCSS. No Tailwind configuration or `space-x`/`space-y` utilities exist. `artifacts/crossover-all-styles.css` is an artifact, not an imported runtime source. External Leaflet/MapLibre CSS is outside the first-party declaration count. The generated inventory was refreshed after the home story card layout change; the audit recommendations remain the pre-standardization findings.

This is a source inventory, not a claim that every declaration wins the cascade. The responsive check below measured the rendered application. No visible CSS changes were made during this audit.

## Current values versus the proposed v1 baseline

| Role | Current | Proposed v1 | Finding |
|---|---|---|---|
| Body/root | 17px / 1.5 (`app.css:3–6`) | 16px / 1.5 | Size differs; all `rem` typography and dimensions would shift if root changed. |
| H1 | 28px / 1.25 (`app.css:85–88`) | 24px / 1.25 | Size differs; 28px was recently selected for all interior H1s. |
| H2 | 22px / 1.3 (`app.css:90–93`) | 20px / 1.3 | Size differs; 22px was recently selected. |
| H3 | 18px / 1.3 (`app.css:95–98`) | 16px / 1.5 | Both differ; 18px was recently selected. |
| Small/metadata | 12px, 14px, and `rem` variants; line heights 1.25–1.5 | 14px / 1.4 | No single implemented metadata style. |
| Spacing tokens | 4, 8, 16, 24px (`app.css:9–12`) | Same | Tokens exist; literal spacing also exists. |

There are **36 font-size**, **18 line-height**, and **4 `font` shorthand** declarations. Two shorthands set explicit sizes and line heights: primary action `.9rem/1.5` (`public.css:28`) and map labels `13px/1.15` (`map.css:238`); two use `font:inherit` (`app.css:29`, `activity.css:106`). Every one appears in the inventory. The current home hero title (`home.css:21,99`) and subtitle (`home.css:22,122`) are named exceptions. At the 17px root, 3.125rem is 53.125px and 1.875rem is 31.875px. The home hero changes size at 820px; its subtitle changes size at 520px. Public navigation/logo/location/bottom-nav type changes at 900px and 520px (`public-chrome.css:100–136`). These conflict with the proposed principle that breakpoints should change layout only.

## Spacing occurrences and ownership findings

The inventory contains **231 spacing declarations**: 37 `margin`, 21 `margin-top`, 14 `margin-bottom`, 9 other margin properties, 66 `padding`, 20 other padding properties, 59 `gap`, 2 `row-gap`, and 2 `column-gap`. It records values such as 5, 6, 7, 9, 10, 12, 13, 15, 18, 20, 22, 26, 28, 30, 32, 34, and 40px alongside the four defined tokens. Those values may have layout reasons, but they have not been named in one authority. Values in `em`, `rem`, `clamp()`, `calc()`, and `var()` also appear. Do not normalize them without a rendered comparison.

| Area | Existing external spacing and issue |
|---|---|
| Shared documents | `app.css:108–146` puts margins on headings, paragraphs, list items, adjacent sections, image followers, and captions. This document-flow exception currently has multiple owners for some relationships. |
| Home | `home.css:21–22,32,44,49,51,54–55,68,94,108,129` contains child margins, section margins, and responsive margins. The dog card's “Find out more” link owns 16px above itself (`home.css:49`), contrary to the proposed parent-owns-spacing rule. |
| About | Images use 4px top plus other float margins (`public.css:210–223,246–252`); the page also inherits document-flow margins. Floated-image offsets are distinct from text rhythm but lack a documented exception. |
| Action | Investigations and current actions each use 24px top margins (`public.css:255–259,330–334`). The investigation H3 has 8px below and its following paragraph has 4px above (`public.css:315–320`), producing a combined gap. Later action features have parent `gap:24px` plus their own `margin-top:8px` (`public.css:330–359`), producing 32px between rows. |
| Stories/Updates | Story cards use `margin-top:1.5em` (`public.css:434–436`); related gap actions use 5px (`public.css:473–475`). Both are local values outside the scale. |
| Header/footer | Public header has 8px bottom margin (`public-chrome.css:2–12`); footer has 40px top margin (`public-chrome.css:79–85`). Their spacing is controlled by the chrome component, not its page parent. |
| Investigation | Identity metadata uses 4px top (`app.css:221–228`); activity sections use 4/8/16px top margins (`activity.css:84–147`); sticky filter actions use 24px top (`controls.css:132–139`). These should be reviewed separately from public editorial layouts. |

Exact positive top margins, including shorthand, total **29** in the current authored CSS. Zero margins and `scroll-margin-top` are not visual top gaps. The full inventory also includes all bottom and side margins, padding, and gaps.

## Duplicates, cascade conflicts, and compounded gaps

- The PostCSS inventory found no exact repeated `selector + property` pair among the 284 audited declarations in the same media context. There are deliberate cross-scope overrides: `.public-site h3` and `.public-document` heading margins (`public.css:8–10`, `app.css:108–110`), component paragraph margin resets, mobile rules, and state classes. Removing one based on source similarity alone is not provably safe.
- The Action investigation copy has two spacing owners for H3-to-paragraph (`public.css:315–320`): 8px bottom and 4px top. The actual gap may be affected by grid layout, so it needs a computed before/after check before consolidation.
- Action feature spacing combines `gap:24px` with `margin-top:8px` on following features (`public.css:330–359`). The separator is positioned at `top:-16px` (`public.css:361–368`), so a margin change can move the line as well as the content.
- Home dog card H3-to-summary is controlled by the shared 8px heading margin (`public.css:8–10`); summary-to-link is controlled by the link's own 16px top margin (`home.css:49`). These are different relationships, but the link owns external spacing contrary to the proposed rule.
- The home hero has desktop and mobile title/subtitle font overrides (`home.css:21–22,99,122`); public chrome has mobile logo, pill, and bottom-navigation font overrides (`public-chrome.css:100–136`). These are real design differences, not redundant declarations.
- The public footer's 40px top margin can add to the preceding page section's bottom spacing (`public-chrome.css:85`). The exact rendered gap depends on the route and whether margins collapse.

## Dynamic styles, utility classes, and vendor styles

- `DogGapExperience.tsx:463` sets `--crossover-expanded-panel-width` inline from drag state; `:467` sets sheet `top` inline. These are runtime geometry, not fixed spacing tokens.
- `DogGapExperience.tsx:508,510,536,546,548` sets status-dot colors/visibility inline. They do not introduce type or spacing values.
- `PublicSiteNav.tsx`, `PublicMobileMenu.tsx`, `DogGapExperience.tsx`, and several page components compose `className` from route, pressed, selected, sheet, and filter state. Their matching CSS is included in the inventory. No Tailwind utility class generator is present.
- `LeafletLocationsMap.tsx` imports Leaflet and MapLibre vendor CSS and passes map `fitBounds` padding `[46,46]` at line 130. That padding is map camera geometry, not a CSS page gutter. Vendor map controls are not governed by the first-party typography table.

## Recommended changes — no visual changes implemented

### Safe cleanup

No declaration was removed. The audit did not find an exact duplicate spacing/type declaration that could be deleted with a proven unchanged computed result across all routes and widths. Existing uncommitted site edits were left intact.

### Structural cleanup requiring before/after geometry comparison

| Source | Existing declaration | Proposed declaration | Reason and expected visual effect |
|---|---|---|---|
| `home.css:49` | `.home-landing-need-more { margin-top:16px }` | Remove child margin; put 16px separation under `.home-landing-need-body` through an explicit parent row relationship. | Gives the card one spacing owner; **intend zero visual change** after measurement at all widths. |
| `public.css:315–320` | H3 `margin-bottom:8px`; following paragraph `margin:4px 0 0` | Remove both child margins and make `.action-index-investigation-copy` own the measured H3-to-paragraph distance with a row gap or explicit row wrapper. | Removes compounded spacing; **intend zero visual change**, but current grid track sizing must be measured. |
| `public.css:330–368` | Parent `gap:24px`, later feature `margin-top:8px`, separator `top:-16px` | Make the action list own both the 24px title-to-first-row and 32px row-to-row relationships; position separator from that owner. | One owner for repeated action spacing; **intend zero visual change**, including separator position. |
| `public.css:255–259,330–334` | Child sections each have `margin-top:24px` | Move these section separations to the Action canvas/section parent. | Aligns section ownership; **intend zero visual change** after checking margin collapse. |
| `public-chrome.css:85` | Footer `margin:40px 0 0` | Give each public page shell an explicit footer gap with the same computed 40px relationship. | Chrome no longer controls external space; **intend zero visual change** after route-by-route checks. |
| `app.css:120–146`, `activity.css:84–147` | Repeated list/document child top and bottom margins | Define explicit prose/list owner layouts where markup permits, preserving each measured gap. | Reduces incidental margin collapse; **intend zero visual change** only after detailed comparison. |

### Visual changes requiring a design decision

| Source | Existing declaration | Proposed v1 declaration | Expected visual effect |
|---|---|---|---|
| `app.css:5` | `:root { font-size:17px }` | `16px` | Shrinks body and every `rem`-based size; can alter wrapping, hero, navigation, and controls. |
| `app.css:86,91,96–97` | H1 28px, H2 22px, H3 18px/1.3 | H1 24px, H2 20px, H3 16px/1.5 | Changes all semantic headings and page height. Conflicts with recent heading decisions. |
| `home.css:21–22,99,122` | Hero title/subtitle change typography at 820/520px | Define a stable type size across breakpoints, if desired | Changes hero scale, line breaks, and vertical rhythm. |
| `public-chrome.css:105,107,126,135` | Mobile logo, pill, and nav font values | Use one cross-breakpoint value per control, if desired | Changes header/bottom-nav widths and touch-label wrapping. |
| `app.css:69–71`, `public.css:306–409`, `public-chrome.css:36–93` | Metadata and control labels range from 12px to 1.2rem with several line heights | Set a documented role scale after visual review | Changes labels, statistics, navigation, and their heights. |
| `home.css:49,94,129`; `public.css:435,474` | Local 16, 8, 28px, 1.5em, and 5px top gaps | Choose approved parent-owned relationships using named values | Changes visible spacing unless matched to existing computed values. |

## Responsive verification

At viewport widths **320, 375, 412, and 1280px**, I opened Home, Needs, Stories, Action, Updates, About, and the investigation Tasks, Activity, Map, and Findings routes. On all 40 route/width combinations, `documentElement.scrollWidth <= innerWidth`; no page-wide horizontal overflow was observed. Public interior H1s computed to 28px at all four widths; the home title is the documented class exception. No heading extended beyond the viewport. At `/work/dogs/map/`, the loaded Leaflet container, canvas, zoom controls, location markers, and all four investigation tabs were present. This was a geometry and presence check, not a full manual interaction regression. The build check follows in the task summary.

## Decisions requiring approval before implementation

1. Whether v1's 16/24/20/16px body/H1/H2/H3 values should supersede the current 17/28/22/18px choices.
2. Whether the home hero and navigation should retain their mobile-specific type sizes or adopt one size across breakpoints.
3. Which existing non-token gaps should become named exceptions, and which should be visually changed to the four-token scale.
4. The desired measured gaps for the dog card link, Action investigation copy, Action feature rows, footer, and editorial document flow before spacing ownership is moved.
5. Whether component-specific metadata and statistic sizes should become shared semantic roles.

## Complete declaration inventory

This appendix lists every authored typography and spacing declaration in the first-party CSS loaded by the site. Each row gives the source line, selector, property, and value. An `@media` condition is part of the selector column. External Leaflet and MapLibre CSS are outside Crossover's authored layout system. Dynamic TSX styles and class composition are listed separately above. This table records source declarations, including declarations that are overridden at runtime.

Total: **289** declarations across 9 first-party CSS files.

### src/styles/app.css (47 declarations)

| Line | Selector or component | Property | Existing value |
|---:|---|---|---|
| 5 | :root | `font-size` | `17px` |
| 6 | :root | `line-height` | `1.5` |
| 22 | body | `margin` | `0` |
| 29 | button, input, select, textarea | `font` | `inherit` |
| 43 | .arrow-text-link | `gap` | `4px` |
| 49 | .arrow-text-link--green | `font-size` | `.85rem` |
| 69 | .home-landing-status | `font-size` | `12px` |
| 71 | .home-landing-status | `line-height` | `1.25` |
| 86 | h1 | `font-size` | `28px` |
| 87 | h1 | `line-height` | `1.25` |
| 91 | h2 | `font-size` | `22px` |
| 92 | h2 | `line-height` | `1.3` |
| 96 | h3 | `font-size` | `18px` |
| 97 | h3 | `line-height` | `1.3` |
| 103 | .sheet small, .sheet time, .secondary-text | `font-size` | `14px` |
| 104 | .sheet small, .sheet time, .secondary-text | `line-height` | `1.5` |
| 109 | :where(.public-document, .report-shell) :is(h1, h2, h3, h4, h5, h6) | `margin` | `0 0 var(--space-2)` |
| 113 | :where(.public-document, .report-shell) :is(p, ul, ol, figure) | `margin` | `0 0 var(--space-3)` |
| 117 | :where(.public-document, .report-shell) :is(ul, ol) | `padding-inline-start` | `var(--space-4)` |
| 121 | :where(.public-document, .report-shell) li+li | `margin-top` | `var(--space-2)` |
| 125 | :where(.public-document, .report-shell) section+section | `margin-top` | `var(--space-4)` |
| 133 | :where(.public-document, .report-shell) img+ :is(h1, h2, h3, h4, h5, h6, p, ul, ol) | `margin-top` | `var(--space-3)` |
| 141 | :where(.public-document, .report-shell) figcaption | `margin-top` | `var(--space-1)` |
| 142 | :where(.public-document, .report-shell) figcaption | `font-size` | `14px` |
| 146 | :where(.public-document, .report-shell)>nav | `margin-bottom` | `var(--space-4)` |
| 151 | :where(.public-document, .report-shell)> :last-child, :where(.public-document, .report-shell) :is(section, article)> :last-child | `margin-bottom` | `0` |
| 163 | .report-meta | `gap` | `var(--space-1) var(--space-2)` |
| 164 | .report-meta | `margin-bottom` | `var(--space-2)` |
| 175 | .crossover-index>header, .public-nav | `padding` | `16px` |
| 197 | .investigation-identity-inner | `gap` | `14px` |
| 200 | .investigation-identity-inner | `margin-inline` | `auto` |
| 202 | .investigation-identity-inner | `padding` | `14px 16px` |
| 218 | .investigation-identity h2 | `margin` | `0` |
| 225 | .investigation-identity-meta | `column-gap` | `6px` |
| 226 | .investigation-identity-meta | `margin-top` | `4px` |
| 227 | .investigation-identity-meta | `font-size` | `14px` |
| 228 | .investigation-identity-meta | `line-height` | `1.35` |
| 256 | .investigation-header .primary-tabs | `margin-top` | `0` |
| 259 | .investigation-header .primary-tabs | `margin-inline` | `auto` |
| 272 | .crossover-index>header, .public-nav | `gap` | `16px` |
| 283 | .public-logo, .footer-logo | `gap` | `8px` |
| 296 | .public-nav nav | `gap` | `8px 16px` |
| 310 | .primary-tabs a | `padding` | `8px 2px` |
| 312 | .primary-tabs a | `font-size` | `15px` |
| 335 | .crossover-index-body, .about-simple-content, .action-index-canvas, .work-page-shell, .public-band, .dog-gap-layout, .gap-updates-page>section | `margin` | `0 auto` |
| 336 | .crossover-index-body, .about-simple-content, .action-index-canvas, .work-page-shell, .public-band, .dog-gap-layout, .gap-updates-page>section | `padding` | `16px` |
| 349 | .crossover-index>header button | `padding` | `0` |

### src/styles/public.css (70 declarations)

| Line | Selector or component | Property | Existing value |
|---:|---|---|---|
| 9 | .public-site h3 | `margin` | `0 0 var(--space-2)` |
| 13 | .public-site :is(h1, h2, h3) + p | `margin-top` | `0` |
| 20 | .public-site .public-primary-action | `gap` | `12px` |
| 25 | .public-site .public-primary-action | `padding` | `0 17px` |
| 28 | .public-site .public-primary-action | `font` | `700 .9rem/1.5 Inter, Roboto, Arial, sans-serif` |
| 55 | .is-section-page .public-hero-copy, .is-section-page .public-band, .action-index-page .action-index-canvas, .story-detail-page .story-detail-shell, .gap-updates-page > section | `margin-inline` | `auto` |
| 56 | .is-section-page .public-hero-copy, .is-section-page .public-band, .action-index-page .action-index-canvas, .story-detail-page .story-detail-shell, .gap-updates-page > section | `padding` | `16px` |
| 69 | .is-section-page .public-band | `padding-top` | `8px` |
| 74 | .is-section-page .section-intro | `margin-bottom` | `24px` |
| 78 | .is-section-page .public-back-link | `margin` | `24px 0 0` |
| 88 | :is(.about-simple, .gap-reference-page) .public-entry, .is-reality-page .gap-card, .is-connection-page .story-card, .action-index-page .action-index-feature, .story-detail-page .story-opening | `gap` | `16px` |
| 115 | .is-reality-page .gap-card-grid, .is-connection-page .story-grid | `gap` | `24px` |
| 119 | .is-reality-page .gap-card | `column-gap` | `24px` |
| 120 | .is-reality-page .gap-card | `row-gap` | `4px` |
| 121 | .is-reality-page .gap-card | `padding-bottom` | `24px` |
| 139 | .is-reality-page .gap-card-body p, .is-connection-page .story-card p | `margin-bottom` | `8px` |
| 144 | .is-reality-page .gap-card-meta | `gap` | `4px` |
| 153 | .is-connection-page .story-card | `padding` | `0 0 24px` |
| 161 | .about-simple .about-simple-content, .gap-reference-page .gap-reference-article | `margin-inline` | `auto` |
| 162 | .about-simple .about-simple-content, .gap-reference-page .gap-reference-article | `padding` | `16px` |
| 172 | .about-simple .about-simple-philosophy, .about-simple .about-simple-founder | `padding-bottom` | `16px` |
| 179 | .about-simple .about-simple-actions | `gap` | `16px` |
| 184 | .gap-reference-page .gap-reference-article > section | `margin-inline` | `auto` |
| 189 | .gap-reference-page .gap-reference-article > section.gap-reference-projects > p + h3 | `padding-top` | `7px` |
| 195 | .gap-reference-page .gap-reference-article > section > button | `padding` | `0` |
| 203 | .about-simple .about-simple-ideas | `gap` | `24px` |
| 208 | .about-simple .about-simple-ideas .public-entry | `gap` | `16px` |
| 213 | .about-simple .about-simple-ideas .public-entry img | `margin-top` | `4px` |
| 224 | .about-simple .about-simple-philosophy .public-entry img | `margin` | `4px 0 8px 16px` |
| 251 | .about-simple .about-simple-founder .about-simple-founder-image | `margin` | `4px 16px 8px 0` |
| 258 | .action-index-page .action-index-investigations | `gap` | `16px` |
| 259 | .action-index-page .action-index-investigations | `margin-top` | `24px` |
| 264 | .action-index-page .action-index-investigations-intro | `gap` | `8px` |
| 269 | .action-index-page .action-index-investigations h2, .action-index-page .action-index-investigations p | `margin` | `0` |
| 277 | .action-index-page .action-index-investigation-card | `gap` | `16px` |
| 280 | .action-index-page .action-index-investigation-card | `padding-block` | `16px` |
| 307 | .action-index-page .action-index-investigation-meta small | `font-size` | `14px` |
| 308 | .action-index-page .action-index-investigation-meta small | `line-height` | `1.25` |
| 317 | .action-index-page .action-index-investigation-copy h3 | `margin-bottom` | `8px` |
| 321 | .action-index-page .action-index-investigation-copy > p | `margin` | `4px 0 0` |
| 333 | .action-index-page .action-index-current | `gap` | `24px` |
| 334 | .action-index-page .action-index-current | `margin-top` | `24px` |
| 340 | .action-index-page .action-index-feature | `gap` | `24px` |
| 354 | .action-index-page .action-index-current > h2, .action-index-page .action-index-feature, .action-index-page .action-index-feature-description h3, .action-index-page .action-index-feature-description p, .action-index-page .action-index-explore | `margin` | `0` |
| 359 | .action-index-page .action-index-feature + .action-index-feature | `margin-top` | `8px` |
| 374 | .action-index-page .action-index-feature-copy | `gap` | `16px` |
| 379 | .action-index-page .action-index-feature-description | `gap` | `8px` |
| 385 | .action-index-page .action-index-status | `margin` | `0` |
| 391 | .action-index-page .action-index-status-item | `gap` | `4px` |
| 397 | .action-index-page .action-index-status-item + .action-index-status-item | `padding-left` | `24px` |
| 402 | .action-index-page .action-index-status dt | `font-size` | `.875rem` |
| 403 | .action-index-page .action-index-status dt | `line-height` | `1.35` |
| 408 | .action-index-page .action-index-status dd | `margin` | `0` |
| 409 | .action-index-page .action-index-status dd | `font-size` | `1.2rem` |
| 410 | .action-index-page .action-index-status dd | `line-height` | `1.3` |
| 428 | .story-detail-page .story-detail-shell > :not(.story-opening), .organizations-page .crossover-index-body | `margin-inline` | `auto` |
| 432 | .organizations-page .crossover-index-body > article | `margin-bottom` | `32px` |
| 436 | .story-detail-page .story-moment-card + .story-moment-card | `margin-top` | `1.5em` |
| 440 | .story-detail-page .story-source-list small | `margin-left` | `.5em` |
| 445 | .gap-updates-page .gap-history-feed-list | `gap` | `24px` |
| 449 | .gap-updates-page .gap-history-header | `padding-bottom` | `0` |
| 453 | .gap-updates-page .gap-history-timeline | `padding-top` | `24px` |
| 458 | .gap-updates-page .gap-history-feed-meta | `font-size` | `14px` |
| 459 | .gap-updates-page .gap-history-feed-meta | `margin-bottom` | `4px` |
| 464 | .gap-updates-page .gap-history-item + .gap-history-item | `padding-top` | `24px` |
| 471 | .gap-updates-page .gap-history-related-gaps | `gap` | `4px 8px` |
| 475 | .gap-updates-page .gap-history-related-gaps + .gap-history-actions | `margin-top` | `5px` |
| 480 | @media (max-width: 900px) · .public-site.action-index-page | `padding-bottom` | `calc(70px + env(safe-area-inset-bottom))` |
| 496 | @media (max-width: 720px) · .about-simple .about-simple-philosophy .public-entry img | `margin` | `0 0 16px` |
| 516 | @media (max-width: 720px) · .action-index-page .action-index-status-item + .action-index-status-item | `padding-left` | `8px` |

### src/styles/public-chrome.css (38 declarations)

| Line | Selector or component | Property | Existing value |
|---:|---|---|---|
| 8 | .public-site .public-nav | `gap` | `24px` |
| 12 | .public-site .public-nav | `margin` | `0 0 8px` |
| 13 | .public-site .public-nav | `padding` | `9px max(38px, calc((100% - 1600px) / 2))` |
| 22 | .public-site .public-logo, .public-site .footer-logo | `gap` | `10px` |
| 36 | .public-site .public-logo span | `font-size` | `.82rem` |
| 42 | .public-site .public-nav nav | `gap` | `clamp(12px, 2vw, 28px)` |
| 45 | .public-site .public-nav nav | `padding-left` | `30px` |
| 59 | .public-site .public-nav nav button | `padding` | `0` |
| 60 | .public-site .public-nav nav button | `font-size` | `.82rem` |
| 69 | .public-site .location-pill | `padding` | `0 12px` |
| 70 | .public-site .location-pill | `font-size` | `.82rem` |
| 76 | @media (min-width: 901px) · .public-site .public-logo | `gap` | `9px` |
| 83 | .public-site .public-footer | `gap` | `24px` |
| 85 | .public-site .public-footer | `margin` | `40px 0 0` |
| 86 | .public-site .public-footer | `padding` | `16px max(38px, calc((100% - 1600px) / 2))` |
| 90 | .public-site .public-footer .footer-logo span | `font-size` | `.78rem` |
| 93 | .public-site .public-footer > span, .public-site .public-footer p, .public-site .public-footer nav a | `margin` | `0` |
| 93 | .public-site .public-footer > span, .public-site .public-footer p, .public-site .public-footer nav a | `font-size` | `.82rem` |
| 95 | .public-site .public-footer nav | `gap` | `24px` |
| 101 | @media (max-width: 900px) · .public-site .public-nav | `gap` | `10px` |
| 101 | @media (max-width: 900px) · .public-site .public-nav | `padding` | `9px 20px` |
| 105 | @media (max-width: 900px) · .public-site .public-logo span | `font-size` | `.72rem` |
| 107 | @media (max-width: 900px) · .public-site .public-nav .location-pill | `padding` | `0` |
| 107 | @media (max-width: 900px) · .public-site .public-nav .location-pill | `font-size` | `.82rem` |
| 108 | @media (max-width: 900px) · .public-site .public-footer | `gap` | `10px` |
| 108 | @media (max-width: 900px) · .public-site .public-footer | `padding` | `24px 20px` |
| 126 | @media (max-width: 900px) · .public-site .public-bottom-nav a | `font-size` | `.8rem` |
| 130 | @media (max-width: 900px) · .public-site | `padding-bottom` | `62px` |
| 134 | @media (max-width: 520px) · .public-site .public-nav | `padding` | `9px 16px` |
| 135 | @media (max-width: 520px) · .public-site .location-pill | `font-size` | `.72rem` |
| 136 | @media (max-width: 520px) · .public-site .public-logo | `gap` | `6px` |
| 152 | .public-nav--investigation | `padding` | `0` |
| 162 | .investigation-nav-inner | `gap` | `8px` |
| 165 | .investigation-nav-inner | `padding` | `9px 16px` |
| 178 | .public-nav--investigation .public-logo | `gap` | `6px` |
| 191 | .public-nav--investigation .public-logo span | `font-size` | `.72rem` |
| 202 | .public-nav--investigation .location-pill | `padding` | `0` |
| 207 | .public-nav--investigation .location-pill | `font-size` | `.72rem` |

### src/styles/home.css (74 declarations)

| Line | Selector or component | Property | Existing value |
|---:|---|---|---|
| 16 | .crossover-home .public-hero | `margin` | `0 auto` |
| 20 | .crossover-home .public-hero-copy | `margin` | `0` |
| 20 | .crossover-home .public-hero-copy | `padding` | `34px 32px` |
| 21 | .crossover-home .home-hero-title | `margin` | `0 0 12px` |
| 21 | .crossover-home .home-hero-title | `font-size` | `3.125rem` |
| 21 | .crossover-home .home-hero-title | `line-height` | `1.1` |
| 22 | .crossover-home .home-hero-subtitle | `margin` | `0 0 20px` |
| 22 | .crossover-home .home-hero-subtitle | `font-size` | `1.04rem` |
| 22 | .crossover-home .home-hero-subtitle | `line-height` | `1.45` |
| 23 | .crossover-home .hero-action-row | `gap` | `18px` |
| 29 | .crossover-home .home-landing | `margin` | `0 auto` |
| 29 | .crossover-home .home-landing | `padding` | `26px var(--home-pad) 0` |
| 30 | .crossover-home .home-landing-section | `row-gap` | `15px` |
| 32 | .crossover-home .home-landing-section-heading p,.crossover-home .home-landing-investigation-copy > p:first-child | `margin` | `0 0 4px` |
| 32 | .crossover-home .home-landing-section-heading p,.crossover-home .home-landing-investigation-copy > p:first-child | `font-size` | `.72rem` |
| 33 | .crossover-home .home-landing-section-heading h2 | `margin` | `0` |
| 35 | .crossover-home .home-landing-needs | `gap` | `14px` |
| 43 | .crossover-home .home-landing-need-body | `padding` | `15px 16px 20px` |
| 44 | .crossover-home .home-landing-need-body .home-landing-status | `margin-bottom` | `8px` |
| 45 | .crossover-home .home-landing-need-body > h3 | `padding-right` | `15px` |
| 46 | .crossover-home .home-landing-need-summary | `margin` | `0` |
| 49 | .crossover-home .home-landing-need-more | `margin-top` | `16px` |
| 51 | .crossover-home .home-landing-investigation | `gap` | `22px` |
| 51 | .crossover-home .home-landing-investigation | `margin` | `22px 0 28px` |
| 51 | .crossover-home .home-landing-investigation | `padding` | `17px` |
| 53 | .crossover-home .home-landing-investigation-copy | `padding` | `8px 0` |
| 54 | .crossover-home .home-landing-investigation-copy h2 | `margin` | `0 0 8px` |
| 55 | .crossover-home .home-landing-investigation-copy > p:not(:first-child) | `margin` | `0 0 16px` |
| 56 | .crossover-home .home-landing-investigation-links | `padding-left` | `18px` |
| 57 | .crossover-home .home-landing-investigation-links a | `padding` | `16px 0` |
| 61 | .crossover-home .home-landing-investigation-links p | `margin` | `0` |
| 63 | .crossover-home .home-landing-stories | `gap` | `14px` |
| 64 | .crossover-home .home-landing-stories a | `gap` | `8px 14px` |
| 64 | .crossover-home .home-landing-stories a | `padding` | `12px` |
| 65 | .crossover-home .home-landing-stories h3 | `margin` | `0` |
| 67 | .crossover-home .home-landing-stories p | `margin` | `0` |
| 68 | .crossover-home .home-landing-destinations | `margin` | `32px calc(-1 * var(--home-pad)) 0` |
| 68 | .crossover-home .home-landing-destinations | `padding` | `20px var(--home-pad)` |
| 69 | .crossover-home .home-landing-destinations a | `gap` | `12px` |
| 69 | .crossover-home .home-landing-destinations a | `padding` | `12px 16px` |
| 73 | .crossover-home .home-landing-destination-copy p | `margin` | `0` |
| 84 | @media (max-width: 1100px) · .crossover-home .home-landing-investigation-links | `padding` | `10px 0 0` |
| 85 | @media (max-width: 1100px) · .crossover-home .home-landing-investigation-links a | `padding` | `16px 10px` |
| 92 | @media (max-width: 820px) · .crossover-home .home-landing-section | `gap` | `0` |
| 93 | @media (max-width: 820px) · .crossover-home .home-landing-section-heading | `margin-bottom` | `10px` |
| 94 | @media (max-width: 820px) · .crossover-home .home-landing-section-link | `margin-top` | `8px` |
| 98 | @media (max-width: 820px) · .crossover-home .public-hero-copy | `padding` | `22px 20px 26px` |
| 99 | @media (max-width: 820px) · .crossover-home .home-hero-title | `font-size` | `1.875rem` |
| 99 | @media (max-width: 820px) · .crossover-home .home-hero-title | `line-height` | `1.2` |
| 101 | @media (max-width: 820px) · .crossover-home .home-landing | `padding` | `20px var(--home-pad) 0` |
| 102 | @media (max-width: 820px) · .crossover-home .home-landing-needs | `gap` | `8px` |
| 103 | @media (max-width: 820px) · .crossover-home .home-landing-need | `padding` | `7px` |
| 105 | @media (max-width: 820px) · .crossover-home .home-landing-need-body | `gap` | `0` |
| 105 | @media (max-width: 820px) · .crossover-home .home-landing-need-body | `padding` | `5px 22px 5px 10px` |
| 106 | @media (max-width: 820px) · .crossover-home .home-landing-need-body > h3 | `padding` | `0` |
| 108 | @media (max-width: 820px) · .crossover-home .home-landing-investigation | `gap` | `13px` |
| 108 | @media (max-width: 820px) · .crossover-home .home-landing-investigation | `margin` | `22px 0` |
| 108 | @media (max-width: 820px) · .crossover-home .home-landing-investigation | `padding` | `12px` |
| 110 | @media (max-width: 820px) · .crossover-home .home-landing-investigation-copy | `padding` | `0` |
| 112 | @media (max-width: 820px) · .crossover-home .home-landing-investigation-links | `padding` | `6px 0 0` |
| 113 | @media (max-width: 820px) · .crossover-home .home-landing-investigation-links a | `padding` | `16px 3px` |
| 115 | @media (max-width: 820px) · .crossover-home .home-landing-stories | `gap` | `8px` |
| 122 | @media (max-width: 520px) · .crossover-home .public-hero-copy | `padding` | `18px 16px 22px` |
| 123 | @media (max-width: 520px) · .crossover-home .home-hero-subtitle | `margin-bottom` | `12px` |
| 123 | @media (max-width: 520px) · .crossover-home .home-hero-subtitle | `font-size` | `var(--type-body-size)` |
| 124 | @media (max-width: 520px) · .crossover-home .hero-action-row | `gap` | `4px` |
| 126 | @media (max-width: 520px) · .crossover-home .home-landing | `padding` | `18px var(--home-pad) 0` |
| 127 | @media (max-width: 520px) · .crossover-home .home-landing-investigation | `gap` | `12px` |
| 128 | @media (max-width: 520px) · .crossover-home .home-landing-stories a | `gap` | `8px 10px` |
| 128 | @media (max-width: 520px) · .crossover-home .home-landing-stories a | `padding` | `9px` |
| 130 | @media (max-width: 520px) · .crossover-home .home-landing-destinations | `margin-top` | `28px` |
| 130 | @media (max-width: 520px) · .crossover-home .home-landing-destinations | `padding-top` | `8px` |
| 130 | @media (max-width: 520px) · .crossover-home .home-landing-destinations | `padding-bottom` | `8px` |
| 131 | @media (max-width: 520px) · .crossover-home .home-landing-destinations a | `padding` | `12px 16px` |

### src/styles/map.css (7 declarations)

| Line | Selector or component | Property | Existing value |
|---:|---|---|---|
| 89 | .panel-resize-handle | `padding` | `0` |
| 122 | .location-list button .location-title, .task-list button .task-title | `gap` | `16px` |
| 123 | .location-list button .location-title, .task-list button .task-title | `line-height` | `1.2` |
| 128 | .location-list button > small, .task-list button > small | `padding-left` | `24px` |
| 136 | .location-eyebrow, .location-area, .location-status, .location-facts dt, .location-coordinate-note | `font-size` | `14px` |
| 235 | .leaflet-tooltip.investigation-map-label | `padding` | `0` |
| 238 | .leaflet-tooltip.investigation-map-label | `font` | `500 13px/1.15 "Noto Sans", "Segoe UI", Arial, sans-serif` |

### src/styles/activity.css (19 declarations)

| Line | Selector or component | Property | Existing value |
|---:|---|---|---|
| 7 | .detail-heading | `gap` | `12px` |
| 25 | .record-list button | `gap` | `2px` |
| 27 | .record-list button | `padding` | `8px 2px` |
| 42 | .task-list button, .location-list button | `padding` | `12px 2px` |
| 53 | .record-list > article | `gap` | `2px` |
| 55 | .record-list > article | `padding` | `8px 2px` |
| 85 | .investigation-organizations > article + article | `margin-top` | `16px` |
| 86 | .investigation-organizations > article + article | `padding-top` | `16px` |
| 91 | .investigation-activity-question + .investigation-activity-question | `margin-top` | `16px` |
| 92 | .investigation-activity-question + .investigation-activity-question | `padding-top` | `16px` |
| 100 | .activity-question-toggle | `gap` | `8px` |
| 102 | .activity-question-toggle | `padding` | `0` |
| 106 | .activity-question-toggle | `font` | `inherit` |
| 120 | .activity-question-copy strong | `font-size` | `16px` |
| 124 | .activity-question-copy > span | `margin-top` | `4px` |
| 132 | .activity-question-chevron | `margin` | `8px 4px 0 0` |
| 143 | .investigation-activity-question > .activity-question-findings | `margin` | `8px 0 0` |
| 147 | .activity-question-records | `margin-top` | `16px` |
| 172 | .workspace-page p button, .workspace-page li button | `padding` | `0` |

### src/styles/controls.css (19 declarations)

| Line | Selector or component | Property | Existing value |
|---:|---|---|---|
| 7 | .plain-action-button | `padding` | `8px 14px` |
| 12 | .plain-action-button | `font-size` | `14px` |
| 14 | .plain-action-button | `line-height` | `1.3` |
| 23 | .plain-action-button.is-pill | `padding` | `0` |
| 37 | .plain-action-button.is-pill>span | `gap` | `6px` |
| 38 | .plain-action-button.is-pill>span | `padding` | `8px 14px` |
| 77 | .plain-action-button.is-compact | `padding` | `5px` |
| 78 | .plain-action-button.is-compact | `font-size` | `20px` |
| 79 | .plain-action-button.is-compact | `line-height` | `1` |
| 86 | .map-filters | `gap` | `8px` |
| 87 | .map-filters | `margin-bottom` | `8px` |
| 119 | .map-filter-button-icon | `margin-right` | `6px` |
| 123 | .map-active-filters | `margin-bottom` | `16px` |
| 127 | .map-filter-remove | `margin-left` | `4px` |
| 128 | .map-filter-remove | `font-size` | `17px` |
| 129 | .map-filter-remove | `line-height` | `1` |
| 137 | .map-filter-actions | `gap` | `12px` |
| 138 | .map-filter-actions | `margin-top` | `24px` |
| 139 | .map-filter-actions | `padding` | `12px 0` |

### src/styles/investigation-google.css (5 declarations)

| Line | Selector or component | Property | Existing value |
|---:|---|---|---|
| 7 | .investigation-google .map-filters | `margin-bottom` | `12px` |
| 11 | .investigation-google .plain-action-button.is-pill > span | `padding` | `12px 10px` |
| 15 | .investigation-google .record-list | `gap` | `8px` |
| 19 | .investigation-google .record-list > button | `padding` | `12px` |
| 25 | .investigation-google .detail-heading .plain-action-button.is-compact | `padding` | `11px` |

### src/components/PublicMobileMenu.layout.css (10 declarations)

| Line | Selector or component | Property | Existing value |
|---:|---|---|---|
| 6 | .public-mobile-menu | `padding` | `0` |
| 15 | .public-mobile-menu-icon | `gap` | `4px` |
| 38 | .public-menu-backdrop | `padding` | `18px` |
| 59 | .public-menu-modal | `padding` | `16px` |
| 74 | .public-menu-header, .public-menu-location | `padding` | `14px 20px` |
| 84 | .public-menu-header button | `padding` | `0` |
| 88 | .public-menu-header button | `font-size` | `26px` |
| 89 | .public-menu-header button | `line-height` | `1` |
| 94 | .public-menu-list | `gap` | `8px` |
| 95 | .public-menu-list | `padding` | `8px` |

## Semantic text and control selectors

These are all first-party CSS rules whose selectors directly name an HTML heading, paragraph, list, link, or button, plus the named shared link/button/status component classes. This includes non-spacing overrides such as color and border. The complete declaration inventory above gives every relevant font and spacing value; this table gives the entire rule body so other component-specific overrides remain visible.

| File:line | Selector | Declarations |
|---|---|---|
| src/styles/app.css:25 | button, input, select, textarea | font: inherit |
| src/styles/app.css:32 | button | cursor: pointer |
| src/styles/app.css:36 | a | color: inherit |
| src/styles/app.css:40 | .arrow-text-link | display: inline-flex; align-items: center; gap: 4px; text-decoration: none |
| src/styles/app.css:47 | .arrow-text-link--green | color: #27583a; font-size: .85rem; font-weight: 750 |
| src/styles/app.css:53 | .arrow-text-link--green:hover .arrow-text-link-label | text-decoration: underline |
| src/styles/app.css:57 | .arrow-text-link-icon | display: block; flex: none; width: 14px; height: 14px; color: inherit; transform: translateY(-1px) |
| src/styles/app.css:66 | .home-landing-status | align-self: start; color: #5f6862; font-size: 12px; font-weight: 700; line-height: 1.25; letter-spacing: .06em; text-transform: uppercase |
| src/styles/app.css:76 | .home-landing-status[data-status="investigating"] | color: #1f6b34 |
| src/styles/app.css:85 | h1 | font-size: 28px; line-height: 1.25 |
| src/styles/app.css:90 | h2 | font-size: 22px; line-height: 1.3 |
| src/styles/app.css:95 | h3 | font-size: 18px; line-height: 1.3 |
| src/styles/app.css:108 | :where(.public-document, .report-shell) :is(h1, h2, h3, h4, h5, h6) | margin: 0 0 var(--space-2) |
| src/styles/app.css:112 | :where(.public-document, .report-shell) :is(p, ul, ol, figure) | margin: 0 0 var(--space-3) |
| src/styles/app.css:120 | :where(.public-document, .report-shell) li+li | margin-top: var(--space-2) |
| src/styles/app.css:132 | :where(.public-document, .report-shell) img+ :is(h1, h2, h3, h4, h5, h6, p, ul, ol) | margin-top: var(--space-3) |
| src/styles/app.css:154 | .workspace-page>header p, .workspace-section>header p, .workspace-back | color: #5f6368 |
| src/styles/app.css:217 | .investigation-identity h2 | margin: 0 |
| src/styles/app.css:231 | .investigation-identity-meta a | align-self: start; color: #111; text-decoration: underline |
| src/styles/app.css:305 | .primary-tabs a | min-width: 0; display: flex; align-items: center; justify-content: center; padding: 8px 2px; border-bottom: 3px solid transparent; font-size: 15px; text-align: center; text-decoration: none |
| src/styles/app.css:317 | .primary-tabs a[aria-current="page"] | border-bottom-color: #1a73e8; font-weight: 700 |
| src/styles/app.css:347 | .crossover-index>header button | border: 0; padding: 0; background: none |
| src/styles/app.css:357 | button, input, select, textarea | max-width: 100% |
| src/styles/app.css:368 | button:focus-visible, a:focus-visible, input:focus-visible | outline: 2px solid #1a73e8; outline-offset: 2px |
| src/styles/public.css:8 | .public-site h3 | margin: 0 0 var(--space-2) |
| src/styles/public.css:12 | .public-site :is(h1, h2, h3) + p | margin-top: 0 |
| src/styles/public.css:16 | .public-site .public-primary-action | display: inline-flex; align-items: center; justify-content: center; gap: 12px; min-height: 45px; border: 1px solid #1f6b34; border-radius: 6px; background: #1f6b34; padding: 0 17px; box-shadow: none; color: #fff; font: 700 .9rem/1.5 Inter, Roboto, Arial, sans-serif; text-decoration: none; cursor: pointer |
| src/styles/public.css:33 | .public-site .public-primary-action:hover | border-color: #17562a; background: #17562a |
| src/styles/public.css:38 | .public-site .public-primary-action:focus-visible | outline: 3px solid #2b7749; outline-offset: 3px |
| src/styles/public.css:63 | .is-section-page .public-hero-copy h1, .is-section-page .public-hero-copy p | max-width: 760px |
| src/styles/public.css:137 | .is-reality-page .gap-card-body p, .is-connection-page .story-card p | margin-bottom: 8px |
| src/styles/public.css:187 | .gap-reference-page .gap-reference-article > section.gap-reference-projects > p + h3 | border-top: 1px solid #dadce0; padding-top: 7px |
| src/styles/public.css:192 | .gap-reference-page .gap-reference-article > section > button | border: 0; background: transparent; padding: 0; color: inherit; text-decoration: underline |
| src/styles/public.css:267 | .action-index-page .action-index-investigations h2, .action-index-page .action-index-investigations p | margin: 0 |
| src/styles/public.css:285 | .action-index-page .action-index-investigation-card:hover h3 | text-decoration: underline |
| src/styles/public.css:316 | .action-index-page .action-index-investigation-copy h3 | margin-bottom: 8px |
| src/styles/public.css:320 | .action-index-page .action-index-investigation-copy > p | margin: 4px 0 0 |
| src/styles/public.css:349 | .action-index-page .action-index-current > h2, .action-index-page .action-index-feature, .action-index-page .action-index-feature-description h3, .action-index-page .action-index-feature-description p, .action-index-page .action-index-explore | margin: 0 |
| src/styles/public-chrome.css:48 | .public-site .public-nav nav button, .public-site .location-pill, .public-site .public-mobile-menu | border: 0; background: none; color: #fff; font-weight: 700 |
| src/styles/public-chrome.css:57 | .public-site .public-nav nav button | min-height: 44px; padding: 0; font-size: .82rem; white-space: nowrap |
| src/styles/public-chrome.css:63 | .public-site .public-nav nav button.is-active, .public-site .public-nav nav button[aria-current="page"] | text-decoration: underline; text-underline-offset: 7px |
| src/styles/public-chrome.css:91 | .public-site .public-footer > span, .public-site .public-footer p, .public-site .public-footer nav a | margin: 0; color: #ffffffdb; font-size: .82rem |
| src/styles/public-chrome.css:94 | .public-site .public-footer p | justify-self: center |
| src/styles/public-chrome.css:96 | .public-site .public-footer nav a | text-decoration: none |
| src/styles/public-chrome.css:97 | .public-site .public-footer nav a:hover | text-decoration: underline |
| src/styles/public-chrome.css:109 | @media (max-width: 900px) · .public-site .public-footer p | justify-self: center |
| src/styles/public-chrome.css:120 | @media (max-width: 900px) · .public-site .public-bottom-nav a | display: grid; place-items: center; min-width: 0; min-height: 62px; color: #17221b; font-size: .8rem; text-decoration: none |
| src/styles/public-chrome.css:129 | @media (max-width: 900px) · .public-site .public-bottom-nav a[aria-current="page"] | color: #1f6b34; font-weight: 700 |
| src/styles/home.css:32 | .crossover-home .home-landing-section-heading p,.crossover-home .home-landing-investigation-copy > p:first-child | margin: 0 0 4px; color: #64716b; font-size: .72rem; font-weight: 750; letter-spacing: .08em; text-transform: uppercase |
| src/styles/home.css:33 | .crossover-home .home-landing-section-heading h2 | margin: 0; color: #152119; font-family: var(--font-sans); font-weight: 700 |
| src/styles/home.css:38 | @media (hover: hover) · .crossover-home .home-landing-need:hover, .crossover-home .home-landing-stories a:hover | box-shadow: 0 2px 8px rgba(0, 0, 0, .09) |
| src/styles/home.css:44 | .crossover-home .home-landing-need-body .home-landing-status | margin-bottom: 8px |
| src/styles/home.css:45 | .crossover-home .home-landing-need-body > h3 | padding-right: 15px |
| src/styles/home.css:54 | .crossover-home .home-landing-investigation-copy h2 | margin: 0 0 8px; color: #111d15; font-family: var(--font-sans); font-weight: 700 |
| src/styles/home.css:55 | .crossover-home .home-landing-investigation-copy > p:not(:first-child) | max-width: 520px; margin: 0 0 16px; color: #4c5a4f |
| src/styles/home.css:57 | .crossover-home .home-landing-investigation-links a | display: grid; grid-template-columns: minmax(0, 1fr); align-items: center; min-height: 61px; border-bottom: 1px solid #dce5dc; padding: 16px 0; color: #1c3424; text-decoration: none |
| src/styles/home.css:58 | .crossover-home .home-landing-investigation-links a:last-child | border-bottom: 0 |
| src/styles/home.css:59 | .crossover-home .home-landing-investigation-links a:hover | color: #16633b |
| src/styles/home.css:60 | .crossover-home .home-landing-investigation-links h3 | color: #1c3424 |
| src/styles/home.css:61 | .crossover-home .home-landing-investigation-links p | margin: 0; color: #647267 |
| src/styles/home.css:64 | .crossover-home .home-landing-stories a | display: grid; grid-template-columns: 120px minmax(0, 1fr); align-items: start; gap: 8px 14px; min-width: 0; min-height: 142px; border: 1px solid #dfe6df; border-radius: 8px; background: #fff; box-shadow: none; padding: 12px; color: #152119; text-align: left; text-decoration: none; transition: box-shadow 160ms ease |
| src/styles/home.css:65 | .crossover-home .home-landing-stories h3 | grid-column: 1 / -1; grid-row: 1; min-width: 0; margin: 0 |
| src/styles/home.css:67 | .crossover-home .home-landing-stories p | grid-column: 2; grid-row: 2; display: -webkit-box; min-width: 0; overflow: hidden; margin: 0; color: #637167; -webkit-line-clamp: 4; -webkit-box-orient: vertical |
| src/styles/home.css:69 | .crossover-home .home-landing-destinations a | display: grid; grid-template-columns: minmax(0, 1fr); align-items: center; gap: 12px; min-width: 0; min-height: 92px; padding: 12px 16px; border-right: 1px solid #dce5dc; color: #172a1d; text-decoration: none |
| src/styles/home.css:70 | .crossover-home .home-landing-destinations a:last-child | border-right: 0 |
| src/styles/home.css:71 | .crossover-home .home-landing-destinations a:hover | background: #fff |
| src/styles/home.css:73 | .crossover-home .home-landing-destination-copy p | margin: 0; color: #5f6e63 |
| src/styles/home.css:74 | .crossover-home .home-landing a:not(.public-primary-action):focus-visible | outline: 2px solid #2b7749; outline-offset: 2px |
| src/styles/home.css:85 | @media (max-width: 1100px) · .crossover-home .home-landing-investigation-links a | border-bottom: 0; border-right: 1px solid #dce5dc; padding: 16px 10px |
| src/styles/home.css:86 | @media (max-width: 1100px) · .crossover-home .home-landing-investigation-links a:last-child | border-right: 0 |
| src/styles/home.css:88 | @media (max-width: 1100px) · .crossover-home .home-landing-destinations a:nth-child(2) | border-right: 0 |
| src/styles/home.css:89 | @media (max-width: 1100px) · .crossover-home .home-landing-destinations a:nth-child(-n+2) | border-bottom: 1px solid #dce5dc |
| src/styles/home.css:106 | @media (max-width: 820px) · .crossover-home .home-landing-need-body > h3 | padding: 0 |
| src/styles/home.css:111 | @media (max-width: 820px) · .crossover-home .home-landing-investigation-copy > p:not(:first-child) | max-width: none |
| src/styles/home.css:113 | @media (max-width: 820px) · .crossover-home .home-landing-investigation-links a | min-height: 55px; border-right: 0; border-bottom: 1px solid #dce5dc; padding: 16px 3px |
| src/styles/home.css:114 | @media (max-width: 820px) · .crossover-home .home-landing-investigation-links a:last-child | border-bottom: 0 |
| src/styles/home.css:116 | @media (max-width: 820px) · .crossover-home .home-landing-stories a | grid-template-columns: 110px minmax(0, 1fr) |
| src/styles/home.css:117 | @media (max-width: 820px) · .crossover-home .home-landing-stories h3 | grid-column: 2; grid-row: 1 |
| src/styles/home.css:128 | @media (max-width: 520px) · .crossover-home .home-landing-stories a | grid-template-columns: 96px minmax(0, 1fr); gap: 8px 10px; min-height: 120px; padding: 9px |
| src/styles/home.css:131 | @media (max-width: 520px) · .crossover-home .home-landing-destinations a | min-height: 76px; border-right: 0; border-bottom: 1px solid #dce5dc; padding: 12px 16px |
| src/styles/home.css:132 | @media (max-width: 520px) · .crossover-home .home-landing-destinations a:last-child | border-bottom: 0 |
| src/styles/map.css:118 | .location-list button .location-title, .task-list button .task-title | display: inline-flex; align-items: center; gap: 16px; line-height: 1.2 |
| src/styles/map.css:126 | .location-list button > small, .task-list button > small | padding-left: 24px |
| src/styles/activity.css:10 | .detail-heading > div, .detail-heading > h2 | min-width: 0 |
| src/styles/activity.css:23 | .record-list button | display: grid; gap: 2px; width: 100%; padding: 8px 2px; border: 0; border-bottom: 1px solid #e2e4e6; background: #fff; color: #202124; text-align: left |
| src/styles/activity.css:35 | .task-list > button:first-child, .location-list > button:first-child | border-top: 0 |
| src/styles/activity.css:40 | .task-list button, .location-list button | padding: 12px 2px; border-bottom: 0 |
| src/styles/activity.css:46 | .task-list button + button, .location-list button + button | border-top: 1px solid #e2e4e6 |
| src/styles/activity.css:66 | .record-list button:hover | background: #f7f7f7 |
| src/styles/activity.css:74 | .record-list button > span | display: block; color: #5f6368 |
| src/styles/activity.css:154 | .activity-question-findings a, .activity-question-records a, .investigation-activity-related a, .investigation-organizations a | text-decoration: underline |
| src/styles/activity.css:168 | .workspace-page p button, .workspace-page li button | border: 0; background: none; padding: 0; color: inherit; text-align: left; text-decoration: underline |
| src/styles/controls.css:3 | .plain-action-button | display: inline-flex; align-items: center; justify-content: center; padding: 8px 14px; border: 1px solid #dadce0; border-radius: 5px; background: #fff; color: #202124; font-size: 14px; font-weight: 500; line-height: 1.3 |
| src/styles/controls.css:17 | button.plain-action-button:not(.is-pill):hover | background: #f7f7f7 |
| src/styles/controls.css:21 | .plain-action-button.is-pill | flex: none; padding: 0; border: 0; background: transparent; -webkit-tap-highlight-color: transparent; font-weight: 400; white-space: nowrap; cursor: pointer |
| src/styles/controls.css:32 | .plain-action-button.is-pill>span | display: inline-flex; flex: 1; align-items: center; justify-content: center; gap: 6px; padding: 8px 14px; border: 1px solid #dadce0; border-radius: 999px; background: #fff; color: #202124 |
| src/styles/controls.css:45 | .plain-action-button.is-selection:hover>span | background: #f7f7f7 |
| src/styles/controls.css:49 | .plain-action-button.is-selection:not(.is-light-blue)[aria-pressed="true"]>span | border-color: #193d70; background: #193d70; color: #fff |
| src/styles/controls.css:55 | .plain-action-button.is-applied-filter>span, .plain-action-button.is-selection.is-light-blue[aria-pressed="true"]>span | border-color: #99bcea; background: #e7f0ff; color: #174b91 |
| src/styles/controls.css:62 | .plain-action-button.is-applied-filter:hover>span | background: #dbeafe |
| src/styles/controls.css:67 | .map-filters .plain-action-button.is-selection.is-light-blue[aria-pressed="true"]>span, .map-active-filters .plain-action-button.is-applied-filter>span, .map-active-filters .plain-action-button.is-applied-filter:hover>span | border-color: #527fb9; background: #f1f6ff; color: #202124 |
| src/styles/controls.css:75 | .plain-action-button.is-compact | min-width: 36px; padding: 5px; font-size: 20px; line-height: 1 |
| src/styles/controls.css:102 | .filter-buttons .plain-action-button.is-pill | min-width: 64px |
| src/styles/investigation-google.css:2 | .investigation-google .primary-tabs a[aria-current="page"] | color: #0b57d0 |
| src/styles/investigation-google.css:10 | .investigation-google .plain-action-button.is-pill > span | padding: 12px 10px |
| src/styles/investigation-google.css:18 | .investigation-google .record-list > button | padding: 12px; border: 1px solid #dadce0; border-radius: 12px |
| src/styles/investigation-google.css:24 | .investigation-google .detail-heading .plain-action-button.is-compact | padding: 11px; border-radius: 50% |
| src/components/PublicMobileMenu.layout.css:26 | .public-mobile-menu, .public-menu-modal button | -webkit-tap-highlight-color: transparent |
| src/components/PublicMobileMenu.layout.css:79 | .public-menu-header button | display: grid; place-items: center; width: 44px; height: 44px; padding: 0; border: 0; background: none; color: inherit; font-size: 26px; line-height: 1 |
| src/components/PublicMobileMenu.layout.css:98 | .public-menu-list button | min-height: 48px; border: 0; background: none; text-align: left |
| src/components/PublicMobileMenu.layout.css:105 | .public-menu-list button:hover, .public-menu-list button:focus-visible | background: #fff |

## TSX dynamic style and class composition

These are authored runtime style expressions and dynamic class assignments. Data-driven colors and drag position values are state, not spacing tokens. Static `className` references are covered by the CSS selector tables above.

| File:line | Expression |
|---|---|
| src/components/ArrowTextLink.tsx:4 | return &lt;a {...props} className={&#96;arrow-text-link${className ? &#96; ${className}&#96; : ""}&#96;}&gt; |
| src/components/DogGapExperience.tsx:445 | const investigationHeader = (className: string) =&gt; &lt;div className={&#96;investigation-header ${className}&#96;}&gt; |
| src/components/DogGapExperience.tsx:463 | &lt;div ref={workspaceRef} className={&#96;map-workspace is-${sheetState}${isSheetDragging ? " is-dragging" : ""}&#96;} style={panelWidth !== null ? { "--crossover-expanded-panel-width": &#96;${panelWidth}px&#96; } as CSSProperties : undefined}&gt; |
| src/components/DogGapExperience.tsx:467 | &lt;div ref={sheetRef} className="sheet" style={dragTop === null ? undefined : { top: dragTop }}&gt; |
| src/components/DogGapExperience.tsx:508 | &lt;div className="map-filters filter-buttons task-filters" role="group" aria-label="Task filters"&gt;{(["all", "open", "waiting", "done"] as const).map((filter) =&gt; &lt;PlainActionButton key={filter} variant="selection" pressed={taskFilter === filter} onClick={() =&gt; { setTaskFilter(filter); setSelectedLocationId(""); setFocusSelectedLocation(false); }}&gt;{filter !== "all" &amp;&amp; &lt;span className="evidence-dot" style={{ backgroundColor: taskStatusColors[filter] }} aria-hidden="true" /&gt;}{filter === "done" ? "Completed" : filter[0].toUpperCase() + filter.slice(1)}&lt;/PlainActionButton&gt;)}&lt;/div&gt; |
| src/components/DogGapExperience.tsx:510 | &lt;strong className="task-title"&gt;&lt;span className="evidence-dot" style={task.status === "cancelled" ? { visibility: "hidden" } : { backgroundColor: taskStatusColors[task.status] }} aria-hidden="true" /&gt;{task.title}&lt;/strong&gt; |
| src/components/DogGapExperience.tsx:536 | &lt;div className="map-filters filter-buttons" role="group" aria-label="Report type filters"&gt;{locationFilterOptions.map((option) =&gt; &lt;PlainActionButton key={option.value} variant="selection" tone="light-blue" pressed={pendingLocationFilters.includes(option.value)} onClick={() =&gt; setPendingLocationFilters((current) =&gt; toggleFilter(current, option.value))}&gt;{option.dotColor &amp;&amp; &lt;span className="evidence-dot" style={{ backgroundColor: option.dotColor }} aria-hidden="true" /&gt;}{option.label}&lt;/PlainActionButton&gt;)}&lt;/div&gt; |
| src/components/DogGapExperience.tsx:546 | {locationFilterOptions.filter((option) =&gt; locationFilters.includes(option.value)).map((option) =&gt; &lt;PlainActionButton key={option.value} variant="applied-filter" ariaLabel={&#96;Remove ${option.label} filter&#96;} onClick={() =&gt; applyMapFilters(markerTypeFilters, locationFilters.filter((value) =&gt; value !== option.value))}&gt;&lt;span className="evidence-dot" style={{ backgroundColor: option.dotColor }} aria-hidden="true" /&gt;{option.label}&lt;span className="map-filter-remove" aria-hidden="true"&gt;×&lt;/span&gt;&lt;/PlainActionButton&gt;)} |
| src/components/DogGapExperience.tsx:548 | &lt;div className="record-list location-list"&gt;{visibleLocations.map((location) =&gt; &lt;button type="button" key={location.id} onClick={() =&gt; selectLocation(location.id, true)}&gt;&lt;strong className="location-title"&gt;&lt;span className="evidence-dot" style={{ backgroundColor: evidenceCategoryColors[location.category] }} aria-hidden="true" /&gt;{location.name}{location.marker_kind === "major_reported_concern" &amp;&amp; &lt;svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D74B45" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Reported historical concern"&gt;&lt;path d="m10.29 3.86-8.47 14.14A2 2 0 0 0 3.53 21h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/&gt;&lt;path d="M12 9v5M12 17.5h.01"/&gt;&lt;/svg&gt;}&lt;/strong&gt;&lt;small&gt;{fmt(location.evidence_date)} · {location.verification_status}{!location.coordinates &amp;&amp; " · No map pin"}&lt;/small&gt;&lt;/button&gt;)}&lt;/div&gt; |
| src/components/GapDetailPage.tsx:29 | return &lt;main className={&#96;gap-page dog-gap-page is-${gap.investigation_status} workspace-app${googleExperiment ? " investigation-google" : ""}&#96;}&gt; |
| src/components/HomePage.tsx:68 | &lt;main className={&#96;public-site public-home ${isHome ? "crossover-home is-home-page" : "is-section-page"} is-${page}-page&#96;}&gt; |
| src/components/HomePage.tsx:70 | &lt;section className={&#96;public-hero ${isHome ? "" : "is-compact"}&#96;}&gt; |
| src/components/HomePage.tsx:82 | &lt;div className={&#96;public-hero-copy${isHome ? "" : " public-document"}&#96;}&gt; |
| src/components/HomePage.tsx:84 | &lt;p className={isHome ? "home-hero-subtitle" : undefined}&gt;{copy.text}&lt;/p&gt; |
| src/components/HomePage.tsx:105 | &lt;a className={&#96;gap-card is-${gap.investigation_status}&#96;} key={gap.id} href={&#96;/reality/${gap.slug}/&#96;} onClick={(event) =&gt; navigateInternalLink(event, () =&gt; onOpenGap(gap.slug))}&gt; |
| src/components/InvestigationLocations.tsx:57 | return &lt;button type="button" className={&#96;investigation-location-selector${selected ? " is-selected" : ""}${location.status === "exploratory" ? " is-exploratory" : ""}${location.category === "recent_public_report" ? " is-recent" : ""}&#96;} aria-pressed={selected} onClick={() =&gt; onSelect(location.id)}&gt; |
| src/components/InvestigationLocations.tsx:66 | &lt;div className="investigation-location-details-top"&gt;&lt;div&gt;&lt;h3&gt;{location.name}&lt;/h3&gt;&lt;p className="investigation-location-area"&gt;{location.area}&lt;/p&gt;&lt;/div&gt;&lt;div className="investigation-location-details-meta"&gt;&lt;span className={&#96;investigation-location-status is-${location.status}&#96;}&gt;{location.verification_status}&lt;/span&gt;&lt;time dateTime={location.evidence_date}&gt;{location.date_label} {fullDate(location.evidence_date)}&lt;/time&gt;&lt;span&gt;{location.evidence_type}&lt;/span&gt;&lt;/div&gt;&lt;/div&gt; |
| src/components/PlainActionButton.tsx:16 | return &lt;button ref={buttonRef} type="button" className={&#96;plain-action-button${compact ? " is-compact" : ""}${variant !== "default" ? &#96; is-pill is-${variant}&#96; : ""}${variant === "selection" &amp;&amp; tone === "light-blue" ? " is-light-blue" : ""}&#96;} aria-label={ariaLabel} aria-pressed={pressed} onClick={onClick} disabled={disabled}&gt;{variant !== "default" ? &lt;span&gt;{children}&lt;/span&gt; : children}&lt;/button&gt;; |
| src/components/PublicMobileMenu.tsx:113 | &lt;div className={popoverOnWide &amp;&amp; desktopPopover ? "public-menu-popover" : "public-menu-backdrop"} role="presentation" onMouseDown={closeMenu}&gt; |
| src/components/PublicMobileMenu.tsx:137 | className={pressedPage === item.page ? "is-pressed" : ""} |
| src/components/PublicSiteNav.tsx:23 | &lt;button type="button" className={active === "reality" ? "is-active" : ""} onClick={() =&gt; onNavigate("reality")}&gt;Needs&lt;/button&gt; |
| src/components/PublicSiteNav.tsx:24 | &lt;button type="button" className={active === "connection" ? "is-active" : ""} onClick={() =&gt; onNavigate("connection")}&gt;Stories&lt;/button&gt; |
| src/components/PublicSiteNav.tsx:25 | &lt;button type="button" className={active === "action" ? "is-active" : ""} onClick={() =&gt; onNavigate("action")}&gt;Action&lt;/button&gt; |
| src/components/PublicSiteNav.tsx:26 | &lt;button type="button" className={active === "updates" ? "is-active" : ""} onClick={() =&gt; onNavigate("updates")}&gt;Updates&lt;/button&gt; |
| src/components/PublicSiteNav.tsx:27 | &lt;button type="button" className={active === "about" ? "is-active" : ""} aria-current={active === "about" ? "page" : undefined} onClick={openAbout}&gt;About&lt;/button&gt; |
| src/components/PublicSiteNav.tsx:32 | &lt;header className={&#96;public-nav${variantClass[variant] ? &#96; ${variantClass[variant]}&#96; : ""}&#96;}&gt; |
| src/components/UpdatesPage.tsx:38 | &lt;article className={&#96;gap-history-item is-${record.record_type}&#96;} key={record.id}&gt; |

