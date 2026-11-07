# Crossover information model

The Model describes Crossover and its evidence without prescribing a web page. Stable IDs connect records; dates describe different events; source attribution and limitations remain attached to the assertion they qualify.

## Organization and identity

**Organization** is a named entity with a purpose and operating scope. Crossover Stockton is the organization that owns this information. An **organization name** identifies it, not a slogan or page heading. A **purpose** states why it exists. A **slogan** is a reusable expression of that purpose; “See clearly. Act locally.” is Crossover's slogan, independent of its hero presentation. An **organizational principle** is a guiding belief, such as the transition from work to vocation. An **organizational method** is a stated way of working, such as observing conditions and recording what happens. A **person** is a human associated with an organization; an **organizational role** links that person to an organization and should not be inferred from page position.

## Needs and conditions

A **need** is a potentially unmet human, animal, or community requirement; it is not proof of severity. A **reported condition** is a source-attributed description of a situation. An **affected population** is the people or animals to whom a condition may apply, with scope and count kept separate. **Service capacity** describes how much care a service can actually provide in a period; a proposed capacity is not operational capacity. A **resource** is something potentially available to meet a need. An **assessment** is Crossover's current interpretation with its date, basis, and limitations. A **knowledge gap** is an explicit unanswered question. These may link to a need but remain distinct from it.

## Gap and current focus

A **gap** organizes work around an unmet need. The current gap is street dogs and access to care. Its record carries a short `current_focus` statement, slug, and default landing designation. Tasks, activity, evidence, and findings link directly to the gap. There is no separate objective or project wrapper.

## Evidence and knowledge

A **claim** is an attributed assertion. **Evidence** is a record that bears on a claim or question; it has a provenance and limitations. A **measurement** is a value with unit, scope, time period, method or source, and evidence state. An estimate is not a census, and an unknown quantity is null/unknown, never zero. An **observation** is something recorded from a stated vantage point; a planned visit is not an observation. A **source** identifies where a claim or evidence originated; a publisher, URL, publication date, and access/review date are separate. A **finding** is an evaluated conclusion tied to evidence IDs and explicit limitations. **Verification status** says what level of checking has occurred; it is separate from source type. A **limitation** restricts what evidence or a finding can establish. **Uncertainty** marks information not yet established. A **contradiction** is evidence opposing a claim and must be linked explicitly rather than silently resolved.

Being documented in a source is not the same as being independently verified. Published reporting and administrative records are not Crossover firsthand evidence unless Crossover actually observed the event or condition. Missing evidence does not establish either a positive or negative conclusion.

## Work and outcomes

A **task** is tracked work to do and can remain open, waiting, done, or cancelled. An **activity** is work that actually occurred with an occurrence date and provenance. A **field report** is a firsthand activity record. An **attempt** is an activity whose intended outcome may not have been reached. An **outcome** records what resulted and when it was known; applying to volunteer is not completed onboarding. A completed task may reference an actual activity but is not itself a second event.

## People and services

A **person** is a human, with any public role recorded separately. An **organization** is a group or institution. A **facility** is a physical place of operation. A **program** is an organized service or effort. A **service** is care or assistance actually described as available, with status and source. A **participation pathway** is a documented way someone may contribute, including requirements, status, and evidence of use. A proposal for a program or facility is not an operating service.

## Events and accounts

A **development** is a dated change or reported change. An **event** is something that happened at a time and place. An **announcement** is a statement of intent or news, not necessarily an outcome. A **proposal** is a suggested change that may never be enacted. A **policy decision** requires a documented decision; committee referral is not enactment. A **publication** is the released source material, separate from the event it reports.

## Geography and time

A **location** is a place record; exact coordinates, generalized map reference, and unpinned broad report are distinct. **Geographic scope** states the area to which a claim, measurement, investigation, or service applies. An **event date** (`occurredAt`) is when something happened. A **publication date** (`publishedAt`) is when a source appeared. A **review date** (`reviewedAt`) is when Crossover checked or reassessed information. A **reporting period** has a start and end, distinct from publication. Legacy snake_case fields are mapped to these meanings by the Model API without changing their original values.

## Visual preferences

Records may carry `visual_description`, `preferred_image`, `logo_description`, and `preferred_logo`. These are optional information about a visual concept or an existing asset, not page layout instructions. An independent renderer may choose the preferred asset when suitable, choose another illustration, or use no image. A visual description is not alt text; alt text describes the actual displayed image. An organization's authentic logo must never be replaced by an invented mark presented as official.

Existing focus artwork uses `preferred_image`; thumbnails remain a separate compact variant. Crossover's existing logo is its `preferred_logo`. Field-report imagery remains attached to its source record with its caption and attribution; illustrative imagery is not evidence. The public record projection at `/data/records.json` includes these optional fields when present and omits them when absent.

## Permitted relationships

- A gap may reference reported conditions, assessments, services, organizations, and evidence.
- Tasks, actual activities, evidence, findings, metrics, and initiatives connect to the gap directly.
- A finding references supporting or contradicting evidence IDs and keeps its limitation and review date. Unsupported findings are invalid.
- An activity may reference its task, organization, location, and field report. A planned action may reference a future location but cannot be represented as a completed observation.
- A claim or measurement references the source/evidence that reports it. Source attribution is not a verification flag.
- A project or proposal may reference evidence of planning, funding, construction, or operation. These states cannot be substituted for one another.

Relationships are checked by `npm run check:data`. Unresolved links or classifications are recorded as migration issues rather than filled with invented information.
