# Understand and improve unmet needs in Stockton.

# Understand and improve unmet needs in Stockton.

We start by identifying a gap, learning what’s happening, and taking useful action. See clearly. Act locally.

Crossover Stockton begins with an unmet need in the real world. We examine evidence, show up, document what happened, and use what we learn to choose the next useful step. We do not need a complete picture or a promised solution before we begin. **The work discovers the work.**

## Current gap and focus

Our one active gap is **street dogs and access to care**. Dogs on Stockton’s streets need care, people trying to help them need workable paths to services, and people with pets may face barriers to shelter. Earlier candidate gaps are not separate active projects; pet-inclusive shelter is part of this gap’s context.

Our current focus is **Understanding the Gap**: learning about dogs on the streets, the care available, and where needs may be going unmet. This is a changeable description on the gap record and its Overview, not a separate collection or permanent goal structure. As the work teaches us more, the focus can change while dated records of earlier work remain.

## How we work and what the records mean

- **Gap:** the unmet need people and animals face, independent of Crossover.
- **Current focus:** what we are concentrating on now. It guides work without defining a separate collection or formal objective lifecycle.
- **Tasks:** concrete steps we plan to take. A planned visit is not a completed observation.
- **Activity:** dated, documented actions and events that actually happened.
- **Evidence, sources, and measurements:** public or firsthand material retained with its attribution, date, scope, and limitations. A reported claim is not automatically a firsthand Crossover observation.
- **Findings:** scoped, revisable conclusions supported by evidence. Unanswered questions and observations are not automatically findings; there is no target number of findings.
- **Initiatives:** efforts to address the gap, generally by other organizations or agencies unless a record explicitly identifies Crossover’s own effort.

The gap is the situation in Stockton. Crossover’s work is our contribution to understanding and improving it. These concepts inform each other; they are not a rigid sequence or a scorecard of records produced.

## What is documented now

- Stockton Animal Services reported **3,106 stray-dog intake events in 2024** across its multi-jurisdiction service area. These are intake events, not a census of dogs on Stockton’s streets.
- Crossover requested Animal Services field-call records on **October 20, 2026**. Animal Services provided a spreadsheet with **7,183 case records on November 2**. Crossover confirmed receipt on **November 3** and began review on **November 4**. Analysis is underway. The case count does not establish a number of individual dogs, verified sightings, or care outcomes.
- Public-area observation near **St. Mary’s** and verification of **South Stockton / District 5** reports are planned tasks. They are not documented completed visits; published leads still need to be checked against current conditions.
- One finding is **developing**: existing animal-care capacity is under pressure. Stockton Animal Services reports recurring shelter pressure; the city is expanding its municipal shelter, and Stockton Street Dogs has proposed a separate **Canine Campus**. The proposal reflects a perceived need for added capacity. It does not prove the municipal expansion will be insufficient, that the proposed campus will be built, or what future outcomes will be.

We keep source reports, our direct observations, supported conclusions, and unknowns distinct. Counts of pages, records, or activities are not measures of people or animals helped.

## Website and public record

The [homepage](https://crossoverstockton.org/) introduces Crossover’s purpose and the current gap, with links to Overview, Activity, and Findings. [About](https://crossoverstockton.org/about/) explains why and how we work. The [gap Overview](https://crossoverstockton.org/gaps/street-dogs/overview/) explains the issue, our current focus, and significant developments. [Activity](https://crossoverstockton.org/gaps/street-dogs/activity/) documents tasks and dated work; [Findings](https://crossoverstockton.org/gaps/street-dogs/findings/) presents supported conclusions and their limits. Metrics, Places, Organizations, Initiatives, and Sources provide further context. Page names organize reading; they are not data types.

Source links let readers check individual statements. The [public record feed](https://crossoverstockton.org/data/records.json) contains the published records and their relationships. The [one-file edition](https://crossoverstockton.org/interactive/) also includes a searchable Explorer. Published routes have readable HTML fallbacks, while the interactive site navigates between pages without a reload.

## Data integrity and build

Canonical source records live in `src/data/`, including `gaps.json`, `tasks.json`, `activities.json`, `evidence.json`, and `findings.json`. `src/schemas/` defines record shapes; `src/model/explorer-publication.json` controls the public projection. `public/data/records.json` is generated from those sources. Preserve attribution, dates, geographic precision, and limitations when updating them. No density map has been validated from the field-call spreadsheet.

```bash
npm install
npm run dev
npm run build
npm run preview
```

`npm run dev` builds the site before starting Vite. `npm run build` validates data, generates the public feed and one-file edition, publishes the site, and tests the output. The main interface is rendered by `public/preview/ai-variant.js` and `public/preview/ai-variant-modern.css`; `site/one-file-template.html` supplies the alternate edition and readable fallback pages. See [site design rules](docs/SITE_DESIGN.md) for visual guidance.
