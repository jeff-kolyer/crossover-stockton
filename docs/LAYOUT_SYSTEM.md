# Crossover layout system

This is the normative specification for every route, including the investigation workspace. The legacy [audit](LAYOUT_AUDIT.md) describes the implementation it replaced.

## Four layers

1. **Tokens** in `src/styles/crossover.css` define typography, the spacing scale, width roles, and named geometry. This is the sole first-party stylesheet, imported once in `src/main.tsx`. Leaflet and MapLibre vendor styles remain separate.
2. **Semantic elements** carry document meaning and central typography. Standard content elements have zero external margin.
3. **Layout primitives** in `src/components/layout.tsx` own alignment and space between boxes.
4. **Content components** compose primitives for recurring editorial and investigation structures.

`SiteShell` renders `SiteHeader` once, then `PageShell`, route content, and a shared footer on document routes. `PageShell` has three explicit origins: `standard` begins 24px below the header; `flush` begins at the header edge for the investigation; `hero` begins 24px below the header and leaves hero composition to its child. No page adds a header offset. For any visible gap, inspect the nearest layout parent and its named contract. A border belongs to its owner; the content around it belongs to SectionBoundary or a separated RecordList.

## Typography roles

All standard roles use `Roboto, Arial, sans-serif`. Values are defined once in `crossover.css`.

| Role | Element or class | Size | Weight | Leading | Tracking |
|---|---|---:|---:|---:|---|
| Body | `html`, inherited paragraphs | 17px | 400 | 1.5 | normal |
| H1 | `h1` | 28px | 700 | 1.25 | normal |
| H2 | `h2` | 22px | 700 | 1.3 | normal |
| H3 | `h3` | 18px | 700 | 1.3 | normal |
| Small / metadata | `small`, `time`, `.type-small` | 14px | 400 | 1.4 | normal |
| Control | `.type-control`, public actions | 14px | 700 | 1.3 | normal |
| Display | `.home-hero-title` only | 3.125rem | 700 | 1.1 | −.025em |

The existing home Display becomes 1.875rem / 1.2 below 820px. Its subtitle and compact brand labels are registered exceptions in [layout-exceptions.json](layout-exceptions.json). Semantic heading levels reflect the document outline, never a desired visual size. No page may change H1, H2, or H3 typography. Metric values use `--type-metric-value-size`; labels use Small. Status eyebrows, map labels, icon glyphs, and brand lettering have named central tokens.

## Content spacing scale

| Token | Value | Use |
|---|---:|---|
| `--space-1` | 4px | Tight text, metric value to label, image to caption |
| `--space-2` | 8px | Related controls and compact records |
| `--space-3` | 16px | Content groups, records, prose paragraphs |
| `--space-4` | 24px | Major sections |

Zero is allowed. Arbitrary content spacing is not. Specialized image, control, map, and safe-area geometry uses named tokens and registered exceptions. Auto margins for rail alignment are not content separation.

## Semantic defaults

`h1`–`h6`, `p`, `ul`, `ol`, `figure`, `blockquote`, and `hr` have `margin: 0`. All elements use border-box sizing. Form controls inherit the root font until a control role is applied. Lists receive indentation and item gaps from their containing document or workspace layout. Figure owns its image-to-caption gap. Links never add external spacing. The home destinations rail has the sole registered negative margin, which extends its background and border to the page edge.

## Primitive contracts

| Primitive | Anatomy and owner |
|---|---|
| `Page` | Named width: `document` 760px, `wide` 960px, `investigation` 900px, `map` full width; 16px horizontal gutters. |
| `Section` | Semantic major section with a 24px internal group relationship. |
| `Stack` | Vertical children with named `tight`, `related`, `content`, or `section` gap. |
| `Row` | Horizontal children with named gap and alignment; direction may change responsively. |
| `Grid` | Columns and row/column gaps, including responsive column changes. |
| `Cluster` | Wrapping controls and links with 8px gap. |
| `Inset` | Internal padding from the scale, default 16px. |
| `Divider` | A 1px hairline without margin or padding. |
| `SectionBoundary` | 16px before, 1px divider, 16px after. |

`RecordList separated` applies the same 16px / line / 16px contract between repeated siblings. A plain `RecordList` uses 16px without borders. `PageShell` owns the header-to-content origin and bottom padding on document pages. The investigation workspace fills the remaining viewport beneath the same global header; its identity, local tabs, content panel, and contextual map sit inside the flush page shell.

## Relationship table

| Relationship | Owner | Gap |
|---|---|---:|
| Page edge to content | Page | 16px |
| Global header to page content | PageShell standard / hero | 24px |
| Global header to investigation workspace | PageShell flush | 0px |
| Page title to introduction | HeadingGroup | 4px |
| Heading to supporting text | HeadingGroup | 4px |
| Paragraph to paragraph | ProseStack | 16px |
| Related controls | Cluster | 8px |
| Record to record | RecordList | 16px |
| Content group to content group | Stack / workspace section | 16px |
| Major section to next section | Public shell / Section layout | 24px |
| Image to caption | Figure | 4px |
| Content to visible boundary | SectionBoundary / separated RecordList | 16px |
| Visible boundary to next content | SectionBoundary / separated RecordList | 16px |

Gaps are measured between layout boxes. Font leading, wrapping, aspect ratios, and borders affect perceived whitespace. Do not compensate with a second local margin.

## Content component anatomy

| Component | Anatomy | Internal gap | External owner |
|---|---|---:|---|
| `HeadingGroup` | Heading, optional supporting copy | 4px | Section / Stack |
| `ProseStack` | Editorial paragraphs | 16px | Section / Stack |
| `SectionHeader` | Heading, optional deck | 4px | Section |
| `RecordList` | Repeated records, optional lines | 16px or boundary | Parent section |
| `RecordRow` | Identity and summary | 8px | RecordList |
| `QuestionGroup` | Disclosure, count, expanded findings and records, related navigation | 16px groups, 4px toggle text | Activity list |
| `ActivityRecord` | Date/time, title, description/result, optional location, evidence links, status | 8px | RecordList |
| `Finding` | Title, state, explanation, evidence/navigation | 8px | RecordList or Section |
| `Figure` | Image and optional caption | 4px | Parent layout |
| `MediaRow` | Image/media and copy column | 16px | Parent list / Section |
| `ActionMetrics` | Three equal columns; value above label | 4px value to label | Action feature copy |

QuestionGroup uses the bordered Activity accordion. Its expanded content remains in the same group through its final record; it has no nested decorative cards. ActionMetrics keeps values on one line while labels may wrap within their column. Metric meaning and values come from `crossoverActions`.

## Responsive behavior

The site is phone-first. Breakpoints may change columns, direction, navigation visibility, panel arrangement, image placement, and available width. They do not change standard H1/H2/H3/Body roles. The compact home Display, home subtitle, and small header branding are preserved exceptions. On desktop, the investigation panel and map are adjacent; on phone, its Map tab retains the full map and draggable detail sheet. Map sheet positions, grip, peek height, and drag widths are functional geometry. Bottom navigation clearance includes its fixed 62px height, an 8px buffer, and the browser safe-area inset.

## Example

```tsx
<Page width="wide">
  <HeadingGroup><h1>Updates</h1><p>Recent reporting.</p></HeadingGroup>
  <RecordList separated>{records.map((record) => <ActivityRecord key={record.id}>…</ActivityRecord>)}</RecordList>
</Page>
```

HeadingGroup owns the 4px title-to-deck gap; Page or a containing Section owns separation from RecordList; the separated RecordList owns the full border relationship.

## Enforcement and exceptions

Run `npm run check:layout`. The PostCSS checker covers authored CSS and inline component spacing. It rejects local type values, external vertical margins, non-scale spacing, page-specific heading typography, responsive type without an exception, and stale or incomplete exceptions. The normal build runs it before compilation. Specialized geometry is enumerated in [layout-exceptions.json](layout-exceptions.json) with exact file, selector, property, value, reason, owner, and responsive status. A new exception must be narrow and justified; no entire stylesheet is exempt.
