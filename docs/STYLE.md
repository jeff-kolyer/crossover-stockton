# Crossover Design System

The site should use a small number of shared typography, color, icon, and component roles.

Do not style text or components based on the specific words being displayed. Choose the appropriate semantic role and reuse that style everywhere.

The goal is a recognizable Crossover system: editorial where it should feel human and civic, functional where it should help people scan and act, and restrained enough that status colors and real content retain meaning.

---

## Typography

### Page / Feature Title

The largest editorial headline on a page. Used for main page heroes and page titles.

**Font**

- Display Serif

- Bold / strong weight

- Used sparingly

**Examples**

- `Too many dogs still on the street`

- `Current Gaps`

- `Signs of Being`

The serif font gives major editorial subjects their Crossover identity.

---

### Eyebrow

Small uppercase text that establishes context for the heading below it.

**Font**

- Sans serif

- Bold

- Uppercase

- Slight letter spacing

- Smaller than normal body copy

**Examples**

- `WHAT REALITY NEEDS NOW`

- `WHAT REALITY LOOKS LIKE`

- `CROSSOVER'S WORK`

An eyebrow should normally be followed by a larger heading.

Example:

```text
CROSSOVER'S WORK
What we're doing
```

Do not use eyebrows merely because text is small and uppercase.

---

### Section Title

Primary heading for a content section.

**Font**

- Sans serif

- Bold

- Large

- Sentence/title case

- Never all caps

**Examples**

- `Why dogs get stuck`

- `Why this gap gets stuck`

- `What we're doing`

- `Who's responding`

- `What can I do right now?`

- `Signs of change`

- `Latest updates`

These headings should share the same typography throughout the site.

A section should not receive its own custom heading style simply because its content is different.

---

### UI Strong

Strong titles inside cards, rows, lists, and feed items.

**Font**

- Sans serif

- Semibold or bold

- Normal capitalization

**Examples**

- `More dogs keep arriving`

- `Care and foster space are limited`

- `Stockton Street Dogs`

- `Map barriers to fostering and adoption`

- Update headlines

---

### Body

Default explanatory copy.

**Font**

- Sans serif

- Regular

- Approximately `1rem`

- Comfortable line height

**Examples**

- Gap explanations

- Organization descriptions

- Update summaries

- Section introductions

Body copy should generally not become smaller simply because it appears inside a card.

### Gap Detail Full-Width Type

At full-width desktop sizes, gap-detail pages use the following shared type scale:

- Hero description: `1.15rem` with approximately `1.45` line-height.
- Ordinary gap-page body copy: `0.95rem` with approximately `1.45` line-height.
- UI Strong titles in Why, What, and Who cards: `1rem` with approximately `1.2` line-height.
- Update summaries and action descriptions use the same `0.95rem` Body treatment in the full-width layout.
- The compact desktop updates rail may retain its denser presentation only when it is intentionally a compact sidebar; it should not establish a smaller general paragraph role.

These values are semantic roles, not section-specific exceptions. The hero description, explanatory cards, work rows, responding-card descriptions, update summaries, and action descriptions should remain visually coherent.

### Mobile Body Consistency

At narrow / mobile widths, normal explanatory copy should converge on one shared Body treatment rather than shrinking independently by component.

**Mobile Body rule**

- Use the same Body font family, font size, weight, and line-height for ordinary explanatory paragraphs across the page.
- Target approximately `1rem` / `16px` for mobile Body text.
- Do not reduce paragraph text merely because a component was a desktop sidebar, compact card, feed item, or dense row.
- Preserve comfortable line-height, approximately `1.45–1.6`.
- Let components grow vertically rather than compressing paragraph typography.

**The following should use the same mobile Body treatment**

- Gap / hero description
- `Why this gap gets stuck` explanations
- `What we're doing` section introduction
- Status Row explanations
- Organization descriptions
- Update summaries once the update rail stacks into the mobile flow at the responsive breakpoint
- `What can I do right now?` descriptions
- Featured-action descriptions
- `Signs of change` / story descriptions
- Evidence-strip explanatory copy when it is presented as normal prose

**What may remain smaller**

- Meta information such as dates, source types, counts, confidence, and last-updated text
- Eyebrows
- Footer/legal text
- Button labels and status pills use their own shared Button Label role
- Compact utility labels whose function is genuinely secondary

A mobile component may change layout, spacing, truncation, or card treatment, but it should not create a smaller paragraph style.

The hero summary is ordinary explanatory copy, not a special display subtitle. On mobile it should therefore use the shared Body treatment.

---

### Meta

Supporting information that should remain visually secondary.

**Font**

- Sans serif

- Small

- Medium weight

- May use uppercase when appropriate

**Examples**

- `SEP 29, 2026 · NEWS`

- `8 sources`

- `3 organizations`

- `Last updated Sep 29, 2026`

- `Confidence: medium`

---

### Button Label

Shared typography for button text and work-status pills.

**Font**

- Sans serif

- Semibold or bold, using the shared button weight

- Use the existing button font-size and line-height tokens

- Normal capitalization

The `Foster a dog` button is a reference for this shared typography. Work-status pills must use exactly the same font size, family, weight, and line height as standard buttons. They must not use Meta sizing, serif text, or a separate smaller badge font.

Sharing typography does not make a status pill interactive.

---

### Link

Actionable text link.

**Font**

- Sans serif

- Medium or semibold

- Green when used as a normal Crossover action link

**Examples**

- `View sources →`

- `Visit their website →`

- `Watch on YouTube ↗`

- `See all →`

---

## Labels

### Status Label

Communicates the state or severity of something.

This is **not** an eyebrow.

**Examples**

- `CRITICAL GAP`

- `HIGH PRIORITY GAP`

- `MONITORED GAP`

- `IMPROVING GAP`

- `COMPLETED`

- `IN PROGRESS`

- `NEXT`

Status labels may use semantic colors.

**Examples**

- Critical → red

- High Priority → orange

- Monitored → amber / restrained warning color

- Improving / Completed → green

- In progress → blue

- Next / neutral → gray

Status color is meaningful and should not be reused decoratively.

**Work-status pill variant**

- Labels: `Completed`, `In progress`, and `Next`

- Use Button Label typography, including exactly the same font size as standard buttons such as `Foster a dog`

- Retain the existing pale green, pale blue, and pale gray backgrounds with their corresponding darker text colors

- Use approximately `8px` vertical and `16px` horizontal padding, with softly rounded pill corners

- Give the three pills a consistent minimum width sufficient for the longest label at the shared button font size

- Keep text on one line; allow the row layout to adapt rather than shrinking the label

- These are status indicators: no action arrows, button hover effects, or pointer cursor

Gap severity labels remain a separate Status Label presentation; the work-pill sizing rule does not turn every status label into a large pill.

---

### Content Type Label

Identifies the type of an update or record.

**Examples**

- `NEWS`

- `ORGANIZATION`

- `ARTICLE`

- `FIELD REPORT`

- `GOVERNMENT`

Usually displayed as Meta text and combined with a date.

Example:

```text
NEWS · SEP 29, 2026
```

---

## Color Roles

Color should communicate role, not merely decorate the page.

### Status Colors

Reserved for urgency or state.

- Red → critical

- Orange → high priority

- Amber → monitored

- Green → improving / completed

Do not use these colors casually in explanatory sections.

### Crossover Green

Used for response, action, positive movement, and standard actionable links.

Typical uses:

- Action links

- Organization links

- Response / work icons

- Completed state

- Selected positive emphasis

### Barely Blue

Used for explanatory structure: causes, mechanisms, constraints, and `Why this gap gets stuck` content.

This color is intentionally non-committal. It adds enough visual structure to make explanatory icons legible without introducing another status color.

**Current treatment**

- Icon stroke: Crossover blue-gray `#24425C`

- Circle background: barely blue `#EEF3F7`

- Circle size: approximately `72px`

- Lucide icon size: approximately `42px`

- Space below icon circle: approximately `12px`

Barely Blue has **no status meaning**.

Do not extend Barely Blue to ordinary links, buttons, status labels, or unrelated cards. Its meaning should remain: **explanation / system mechanics**.

---

## Icon System

Use Lucide outline icons.

Icons should represent the actual idea being described, not merely the position of an item in a three-step framework.

Do not force all first, second, or third explanatory items to share the same icon across gaps.

Prefer a specific semantic icon over a generic symbol whenever the content supports it.

Examples:

- Dog intake → `Dog`

- Veterinary / care capacity → `Stethoscope`

- Safe placement / support → `HeartHandshake`

- Cold storage → `Refrigerator`

- Distribution → `Truck`

- Reentry → `DoorOpen`

- Employment → `BriefcaseBusiness`

- Navigation / pathway → `Route`

### Explanatory Icon

Used in causal / explanatory sections such as:

- `Why dogs get stuck`

- `Why this gap gets stuck`

**Style**

- Lucide outline icon

- Larger than normal UI icons

- Dark desaturated blue-gray stroke

- Very pale blue circular background

- Same visual treatment across all gaps

- No status meaning

**Purpose**

The icon should help the user understand the subject before reading the explanatory text.

This treatment distinguishes explanatory structure from:

- status colors

- green action / response icons

- normal black UI icons

---

### Response / Work Icon

Shared green icon treatment for Status Rows and contextual Organization Cards in `Who's responding`.

**Style**

- Lucide outline icon

- Crossover green stroke on a pale green circular background

- Status Rows must use exactly the same icon size, circle diameter, internal padding, and stroke weight as contextual Organization Cards

- Reuse the existing responding-card size tokens; do not create a smaller work-row variant

- Current shared geometry: `56px` circle, `30px` Lucide glyph, and `13px` internal padding

- Center the glyph within its circle and prevent the circle from shrinking

This shared treatment is distinct from the larger Barely Blue explanatory icons and the small black icons used in the organization directory.

---

## Components

### Gap Summary Card

Primary summary of a gap.

**Contains**

- Status Label

- Page / Feature Title

- Body summary

- Evidence / source metadata

- Last updated metadata

May use the Crossover accent stripe to visually identify the gap.

The status stripe and label should use the gap's semantic status color.

---

### Info Card

Standard bordered card for compact informational or action content.

**Used for**

- Doggie Day Out

- Adopt a dog

- Donate supplies

- Other compact informational modules

---

### Organization Card

Compact representation of an organization.

**Contains**

- Organization icon

- Organization name using UI Strong

- Short Body description

- `Visit their website →` Link

**Directory version**

- White bordered card

- Compact horizontal layout

- Small black outline icon

- Icon is not placed inside a green circle

- Optimized for dense multi-column scanning

**Feature / context version**

- Use the shared Response / Work Icon treatment in gap-detail response sections

- Share icon size, circle size, padding, and stroke weight with Status Rows

- Used when organizations appear as part of a gap-detail response section

- Must still use the same title, body, and link typography roles

Do not accidentally mix the directory and contextual icon treatments.

**Mobile typography**

- Organization descriptions use the shared mobile Body treatment.
- Do not shrink organization prose to preserve a desktop card height.
- Stack or grow the card instead.

---

### Feature Card

Larger card used when one action or item deserves significantly more attention than surrounding items.

**Used for**

- Featured Foster card

- Primary action

A feature card may use a restrained pale-green field when the content represents a clear current action.

---

### Cause / Explanation Item

One reason, constraint, or mechanism inside an explanatory section.

Example inside `Why dogs get stuck`:

```text
[explanatory icon]

More dogs keep arriving

Stray and abandoned dogs continue to need help across Stockton.
```

**Contains**

- Explanatory Icon treatment

- UI Strong title

- Body explanation

**Icon treatment**

- Use a `70px` circle with the existing `16px` internal padding; keep the icon glyph size and spacing unchanged

The three items should read as one coherent explanatory set, but each icon should reflect its actual content.

---

### Status Row

Horizontal row representing work Crossover is doing.

**Contains**

- Green response / work icon

- UI Strong title

- Body explanation

- Status Label

**Used inside**

- `What we're doing`

**Typography**

- `What we're doing` uses the exact shared Section Title typography used by `Who's responding` and other section headings

- The section introduction and row explanations use the shared Body font size and line height, approximately `1rem`

- Row titles use the same UI Strong role as titles in other cards and rows

- Status pills use Button Label typography, with exactly the same font size as standard buttons such as `Foster a dog`

- No section-specific font sizes and no reduced description text

**Icons**

- Use the shared Response / Work Icon component

- Match both the green glyph and its circle to the contextual `Who's responding` cards exactly

**Spacing and layout**

- Use approximately `20–24px` vertical row padding and `16px` between the icon circle and text

- Keep the white panel and subtle separators between rows

- At narrow widths, each row may become its own white card with the status pill beneath the title and explanation while retaining the shared icon at left

- Vertically center the icon and status pill beside the text block

- Align status pills in a consistent right-hand column on wider screens

- Let rows grow with their content; do not impose a fixed height that clips or compresses text

- On narrow screens, move the status below the text when needed; preserve typography and icon sizes

Rows should be easy to scan while giving the work the same visual presence as neighboring sections.

---

### Update Item

Editorial feed item.

**Contains**

- Meta: content type + date

- UI Strong headline

- Body summary

- Link

The date and content type share the same Meta treatment: font family, size, weight, color, letter spacing, and line height. They may be separated by a centered dot, but neither should be visually promoted over the other.

Update items should use the same structure whether displayed in:

- A sidebar

- A full-width feed

- The Updates page

Chronology should remain obvious as entries move down the list.

The type/date metadata should remain secondary to the headline.

#### Compact

Used in gap-detail sidebars.

- Narrow available width

- Tighter spacing

- Summary may be truncated

- Several items visible at once

- On desktop, density should come from spacing and truncation, not from inventing a separate paragraph role

- When the sidebar stacks into the mobile flow, update summaries return to the shared mobile Body treatment; do not preserve a smaller desktop-sidebar font size

#### Feed

Used on All Updates pages.

- Wider column or white feed card

- More generous spacing

- Full summary when useful

- Stronger separation between entries

- Optimized for chronological scanning

---

### Update Feed

A chronological container of Update Items. It may appear as a compact sidebar feed or as a full-page feed; the data and semantic item structure do not change between presentations.

---

### Evidence Strip

Quiet horizontal container for evidence context.

**Contains**

- Source count

- Confidence when relevant

- Last updated date

- Link to sources

Should remain visually secondary to the actual gap description.

---

## Gap Detail Page Hierarchy

The gap detail page should follow a consistent semantic reading order:

1. **Gap** — what is wrong
2. **Why this gap gets stuck** — why it is happening
3. **Crossover's work** — what Crossover is researching, checking, or doing
4. **Who's responding** — organizations already working on the gap
5. **What can I do right now?** — concrete public actions
6. **Signs of change** — evidence that conditions or responses are moving
7. **Sources and evidence** — supporting evidence and source access

`Latest updates` may appear in the desktop right rail and should remain part of the same semantic system.

The page should explain the gap quickly rather than requiring the user to study a dashboard.

---

## Implementation Rule

Do not create one-off typography or icon styles for individual sections.

Every text element should map to one of the shared semantic roles:

- Page / Feature Title

- Eyebrow

- Section Title

- UI Strong

- Body

- Meta

- Button Label

- Link

- Status Label

- Content Type Label

Every recurring visual treatment should likewise map to a shared component or semantic role.

The renderer / CSS should implement these roles as reusable tokens or shared classes rather than styling headings and cards independently.

Shared sizing relationships must be implemented through the same tokens or shared classes: work-status pills use button-label typography; work-row icons use contextual organization-icon sizing; section headings, row titles, and descriptions use Section Title, UI Strong, and Body respectively. Do not duplicate matching values in section-specific rules.

At mobile breakpoints, do not create component-specific paragraph sizes. A single shared mobile Body token should drive hero summaries, explanatory paragraphs, update summaries, organization descriptions, action descriptions, work descriptions, and story / sign descriptions. Component media queries may change layout and spacing, but ordinary Body copy should remain typographically consistent.
