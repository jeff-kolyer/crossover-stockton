# Crossover layout system — current implementation

This document records the layout that exists on 2026-11-02. It is the reference for new work, not a silent migration to the proposed Crossover Layout System v1 values. The companion [audit](LAYOUT_AUDIT.md) lists every authored spacing and type declaration and the decisions still open.

## Sources and ownership

- `src/styles/app.css` defines the root type, four spacing tokens, shared heading sizes, shared editorial rhythm, and the investigation shell.
- `src/styles/public.css` defines public page layouts and editorial sections.
- `src/styles/public-chrome.css` defines the public header, footer, and bottom navigation.
- `src/styles/home.css` defines the home hero and landing layout.
- `src/styles/map.css`, `activity.css`, `controls.css`, and `investigation-google.css` define investigation UI layouts.
- `src/components/PublicMobileMenu.layout.css` defines the mobile menu.
- Component TSX adds state classes and a few inline values. External Leaflet and MapLibre styles also render in the map, but are not Crossover-authored rules.

There is no Tailwind configuration or `space-x`/`space-y` utility layer. CSS is imported from `src/main.tsx` and the relevant components. A selector's presence does not prove it wins the cascade; consult computed styles when changing a rule.

## Typography

| Role | Current authored size | Current line height | Source |
|---|---:|---:|---|
| Root/body | 17px | 1.5 | `app.css:3–6` |
| H1 | 28px | 1.25 | `app.css:85–88` |
| H2 | 22px | 1.3 | `app.css:90–93` |
| H3 | 18px, browser bold weight | 1.3 | `app.css:95–98` |
| Investigation small/time/secondary | 14px | 1.5 | `app.css:100–105` |
| Home hero title | 3.125rem desktop; 1.875rem through 820px | 1.1 desktop; 1.2 through 820px | `home.css:21,99` |
| Home hero subtitle | 1.04rem; `--type-body-size` (.98rem) through 520px | 1.45 | `home.css:22,122` |

The home hero title is a paragraph with a named class, not an H1 (`HomePage.tsx:82`). Public interior H1 elements use the one global 28px rule. The hero is an existing exception, including its responsive type change. Green arrow links, status labels, statistics, navigation, map controls, and metadata have their own authored sizes; see the audit inventory for every occurrence. `rem` values currently resolve against the 17px root, not 16px.

## Spacing and external geometry

The four defined tokens are `--space-1: 4px`, `--space-2: 8px`, `--space-3: 16px`, and `--space-4: 24px` (`app.css:9–12`). Existing CSS also uses literal values outside this scale. The tokens are available but are not yet the sole spacing authority.

- **Public page gutters and widths.** Standard interior public content uses 16px padding and a 960px maximum width (`public.css:48–56,157–162`). Editorial text often caps at 760px (`public.css:63–74,165–166`). The home rail caps at 1120px (`home.css:2–4`); its landing gutters are 20px through 820px and 16px through 520px (`home.css:98,125`). These are separate existing layout rules.
- **Investigation widths.** The investigation content cap is 900px (`app.css:185–199`). The workspace layout, sheet sizes, map, and resizable panel are governed by `app.css`, `map.css`, and inline runtime position variables.
- **Major sections.** Editorial documents currently use 24px between adjacent sections (`app.css:124–126`). Some public sections use different literal margins or parent gaps. Preserve these until a visual decision is made.
- **Text groups.** Shared public H3 uses 8px below (`public.css:7–10`); shared document headings also use 8px below (`app.css:108–110`). Paragraphs, lists, and figures use 16px below in document shells (`app.css:112–114`). Other components override those margins locally.
- **Repeated lists.** Document list items use 8px above subsequent items (`app.css:120–122`). Action features use a 24px parent gap plus an additional 8px margin on later rows (`public.css:330–359`). The latter is recorded as compound spacing, not a target rule.
- **Controls.** Public primary actions have a 45px minimum height (`public.css:16–24`); public navigation buttons use 44px (`public-chrome.css:57–61`), mobile bottom navigation 62px (`public-chrome.css:110–129`), and mobile menu items 48px (`PublicMobileMenu.layout.css:94–100`). Investigation controls have their own dimensions in `controls.css` and `map.css`.
- **Images.** Most public entries use `16 / 10` (`public.css:100–110`); About's wide hero uses `2.5 / 1` (`public.css:237–240`); Action images use `16 / 9` and a 260px maximum (`public.css:336–345`). On desktop, home story card headings span both card columns, above the image and summary; through 820px, the image sits left of both text rows (`home.css:63–68,116–119`). Other home and investigation images have component-specific dimensions recorded in the audit.
- **Borders and separators.** Public section borders use 1px hairlines (`public.css`); the About philosophy and founder sections share a bottom hairline and 16px bottom padding (`public.css:169–173`). Action investigation cards use `border-block` (`public.css:271–282`). Action feature separators are pseudo-elements positioned relative to the feature (`public.css:356–368`). Preserve these offsets during any spacing ownership change.

## Responsive behavior

Public navigation changes at 900px and 520px (`public-chrome.css`). The home hero and card layout change at 820px and 520px (`home.css`); its image/copy layout changes without preserving a single hero title size. The About ideas layout changes at 720px (`public.css`). The investigation map/sheet changes at 1023/1024px (`map.css`, `activity.css`, `investigation-google.css`). The 260px navigation breakpoint is an existing narrow-screen exception. The audit identifies the breakpoints that alter type or control dimensions.

## Spacing ownership for new work

1. A reusable text or control component should not add an external margin. Its parent layout owns the distance to siblings.
2. One visual relationship should have one owner. Use a parent `gap` for repeated flex/grid relationships. Do not combine child top and bottom margins to tune one gap.
3. Reserve margins for a named document-flow or positioning reason, such as editorial prose, floated imagery, or intentional rail alignment. Record the exception and its owner here before adding it.
4. Use existing type and spacing tokens where they match the intended computed value. Do not replace literals merely for appearance of consistency if the result changes layout.
5. For an existing non-token value, first measure and document the current rendering. Any visible change to size, line height, spacing, control dimensions, or image geometry needs a separate design decision.

**Correct ownership example:** a three-item flex column uses `gap: 8px` on the column; its children have no external margins. **Incorrect ownership example:** an H3 has `margin-bottom: 8px` and the following paragraph has `margin-top: 4px` to produce a 12px gap. The current Action investigation card contains this pattern (`public.css:315–320`) and remains unchanged pending review.

For future AI-generated components, do not introduce an undocumented CSS length, line height, font size, or local spacing override. Reuse an established value or add a named, reasoned exception here with its owner and computed desktop/mobile result before implementation.
