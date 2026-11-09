# Focusing on unmet needs in Stockton.

I want to walk a dog. Dogs want to be walked. But it's not that easy. Why?

We start by identifying a gap, learning what’s happening, and taking useful action. See clearly. Act locally.

Crossover Stockton begins with an unmet need in the real world. We examine evidence, show up, document what happened, and use what we learn to choose the next useful step. We do not need a complete picture or a promised solution before we begin. **The work discovers the work.**

## Current gap and focus

Our one active gap is **street dogs and access to care**. Dogs on Stockton’s streets need care, people trying to help them need workable paths to services, and people with pets may face barriers to shelter. 

Our current focus is **Understanding the Gap**: learning about dogs on the streets, the care available, and where needs may be going unmet. This changeable passage lives in the feed and appears in Overview. As the work teaches us more, the focus can change while dated records of earlier work remain.

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

The [homepage](https://crossoverstockton.org/) is the street-dogs Overview. It presents the dated, listenable account, focus, attributed figures, activity, and open questions from the feed and public records. The former `/street-dogs/overview/` URL remains readable and points search engines to `/` as its canonical URL. The desktop sidebar and mobile navigation group the same pages by what a visitor needs to do:

- **What's happening?** Overview explains the current situation; Feed is the evolving account to read or listen to.
- **Who's helping?** Organizations, Improvements, Places, and Events show the people, efforts, locations, and occasions involved. Improvements records generally describe work by others; listing an effort does not make it Crossover's project.
- **Our Work** separates Activity (what we did), Actions (our next tasks), Measurements (figures we track), and Findings (conclusions we can support). A measurement can come from an outside source and keeps its attribution; grouping it here does not claim we collected the underlying data.
- **Sources** lets readers inspect where information came from.
- **About** explains why Crossover exists.

These links are working tools: someone can find an organization to contact, inspect a place, check an event, review evidence, or see what needs doing next. The separation between others' efforts and our tasks prevents a proposed improvement from appearing to be Crossover's action. Actions displays the canonical task records at `/street-dogs/tasks/`. [About](https://crossoverstockton.org/about/) renders the feed's About portion. The [feed](https://crossoverstockton.org/feed/) is an ordered editorial account of the current work. Page names organize reading; they are not data types.

The feed is **not another record type**. It is a curated account drawn from what Crossover knows, with selected records and narrative passages. If we learn about a Stockton Animal Services event, we add an Event record so people can find and attend it, and we may also select it for the feed because it matters to the current account. When the event passes, we can remove it from the feed without deleting its record. The record remains in Events and the public record; feed inclusion is an editorial choice, not the record's lifecycle.

Source links let readers check individual statements. The [feed JSON](https://crossoverstockton.org/feed.json) holds the authored chapters, one curated reading order, explicit record selections, and silent navigation entries. Edit `src/feed.json` to choose, reorder, or remove a briefing entry; its `record` points to a canonical record and its `narration` is the paragraph shown and spoken in the feed. Optional `note` text identifies editorial exploration. This does not change the record or the chronological public-updates data. The [feed page](https://crossoverstockton.org/feed/) uses the regular site navigation, offers a listen control, and links to a [plain-text version](https://crossoverstockton.org/feed.txt) with the same narrative. The [public records JSON](https://crossoverstockton.org/data/records.json) and [Explorer](https://crossoverstockton.org/explore/) retain the complete evidence and exact fields. The [one-file edition](https://crossoverstockton.org/interactive/) embeds both the feed and records. Published routes have readable HTML fallbacks, while the interactive site navigates between pages without a reload.

## Data integrity and build

Canonical source records live in `src/data/`, including `gaps.json`, `tasks.json`, `activities.json`, `evidence.json`, `findings.json`, and `improvements.json`. Evidence records include published outside sources and firsthand reports, so they remain distinct from claims and findings. `src/feed.json` is the editorial source: it orders the account, selects records, and defines the gap menu without putting page copy in factual records. The improvements file retains the `initiative` record type and existing record IDs. `src/schemas/` defines record shapes; `src/model/explorer-publication.json` controls the technical public projection. The build validates feed references, then generates `public/feed.json`, `public/data/records.json`, and the reading outputs. Preserve attribution, dates, geographic precision, and limitations when updating records. No density map has been validated from the field-call spreadsheet.

```bash
npm install
npm run dev
npm run build
npm run preview
```

`npm run dev` builds the site before starting Vite. `npm run build` validates data, generates the public feed and one-file edition, publishes the site, and tests the output. The main interface is rendered by `public/preview/site-md.js` and `public/preview/site-md.css`; `site/one-file-template.html` supplies the alternate edition and readable fallback pages. See [site design rules](docs/SITE_DESIGN.md) for visual guidance.
