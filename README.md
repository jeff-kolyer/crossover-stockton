# Crossover Stockton

Crossover Stockton is a public, evidence-based system for discovering, establishing, and sharing practical pathways to help in Stockton, California.

The central question is simple: **How can someone actually help today?**

Rather than publishing conventional volunteer directories or AI-generated suggestions, Crossover seeks out real needs, attempts to connect with the people and organizations addressing them, documents what happens, and establishes pathways others can follow.

A published opportunity is not necessarily an accessible opportunity. Crossover distinguishes what is reported, what has been attempted, and what has actually been established.

The site has three primary sections: **Help, Work, and Evidence**, with About accessible through the navigation menu.

## Help — Established pathways

Help is the public-facing product: a directory of established, currently usable ways to contribute.

Pathways are classified by the kind of contribution someone can make:

- **Presence** — Spending time providing companionship, care, or practical assistance.
- **Funding** — Financially supporting specific, confirmed needs.
- **Supplies** — Providing requested food, equipment, or materials.
- **Transport** — Moving people, animals, or supplies where needed.
- **Space** — Providing temporary housing, fostering, storage, or facilities.
- **Skills** — Contributing specialized knowledge or abilities.

A pathway is not published simply because an organization advertises an opportunity. It must have a demonstrated or directly confirmed route to participation, clear instructions, supporting evidence, and an assessment of its current reliability.

Each pathway includes its purpose, responsible organization or contact, location where appropriate, instructions for helping, verification history, evidence links, and confidence assessment.

Confidence reflects the strength and freshness of the evidence, not a guarantee of success. Established pathways are periodically rechecked and withdrawn from the active Help list when they become unavailable or insufficiently supported.

**Help currently begins with zero established pathways.** This accurately represents what Crossover has confirmed, rather than filling the directory with unverified possibilities.

## Work — Discovering and enabling pathways

Work is the operational workspace for finding and making more pathways possible.

The desktop interface supports a board or list view. The board organizes pathway development into four states:

1. **Exploring** — Determining whether a practical way to help exists.
2. **Blocked** — A potential pathway has an identified obstacle preventing participation.
3. **Enabling** — Taking action to overcome an obstacle and make the pathway usable.
4. **Established** — A working pathway has been demonstrated and supported by sufficient evidence.

These are descriptive states, not mandatory sequential stages. A pathway can become established directly from exploration, remain blocked, or return to an earlier state if circumstances change.

Work also maintains individual tasks, including their status, priority, linked pathway, attempts, outcomes, and next actions.

Examples include:

- See what opportunities for help exist at St. Mary's.
- Follow up with Stockton Animal Services about accessible volunteer opportunities.
- Confirm whether Stockton Street Dogs has specific supply or funding needs.
- Establish whether veterinary providers accept direct sponsorship of procedures.
- Test a practical route for providing transportation or temporary foster care.

Tasks and pathways are distinct. A task is an action Crossover undertakes. A pathway is a possible or established route through which others can contribute.

Sometimes the work reveals a bottleneck: an organization needs help but lacks a coordinator, onboarding capacity, transport, funding, or some other prerequisite. Crossover can then investigate whether human presence, AI, or other technology can help remove that obstacle.

The objective is not merely to identify opportunities but, where possible, **to create the conditions that make helping possible.**

## Evidence — Contact with reality

Evidence is the public record behind Crossover's work and established pathways.

It includes:

- Firsthand observations and field visits.
- Volunteer applications, inquiries, and responses.
- Direct confirmations from organizations.
- Records of attempted and completed participation.
- Public records, measurements, and source documents.
- Photographs, correspondence, and supporting research.
- Documentation of obstacles, failed attempts, and changed conditions.

Evidence is linked to relevant tasks, pathway leads, and established pathways.

The initial records include Crossover's volunteer inquiries to Stockton Street Dogs and Stockton Animal Services, the 7,183 Animal Services field-call records received in November 2026, and historical shelter intake measurements.

Evidence distinguishes published claims from firsthand experience and independently established facts.

A failed attempt is valuable evidence. An unanswered volunteer application, for example, documents an unsuccessful attempt to access a possible pathway; it does not establish that the advertised opportunity is currently accessible.

## How the system works

The operating model is:

**Work → Evidence → Established Pathway → Help**

Crossover identifies a possible way to help and attempts to establish it. The attempt produces evidence. If a usable pathway is established, it becomes available through Help.

If the pathway is blocked, the obstacle remains visible in Work. If an intervention can enable it, Crossover tracks that effort.

Established pathways remain connected to their history and are rechecked as conditions change.

The system serves two purposes: helping people find practical opportunities today and progressively increasing the number of accessible ways to meet needs in Stockton.

**The work discovers the work.**

## Interface and design

Crossover is a responsive, dark-mode civic application rather than a conventional editorial website.

The design emphasizes compact lists, clear status indicators, usable navigation, and direct access to information.

The application header identifies Crossover Stockton and provides navigation alongside live counts for established pathways, work in progress, and tasks awaiting external responses.

On mobile, Help, Work, and Evidence are accessible through persistent bottom navigation. On desktop, Work can display a four-column pathway development board, with a list alternative. Mobile uses a compact list for efficient browsing.

Help displays established pathways with contribution filters, current availability information, and evidence-based confidence indicators. Individual pathway views provide actionable instructions and linked supporting records.

Work provides pathway development, task management, status filters, and detailed activity histories. Evidence provides searchable records and source inspection.

About explains Crossover's identity and philosophy without interrupting the primary purpose of helping people act.

## Content and sources

The existing repository provides the foundation for the new application.

- `src/data/articles.json` preserves sourced articles and background material for research and historical reference.
- `src/data/site-content.json` contains the previous editorial home content, priorities, care paths, work descriptions, and AI ideas. These remain historical inputs rather than the new homepage structure.
- `src/data/catalog-source.json`, `curated-records.json`, `record-id-ledger.json`, `record-presentation.json`, and `ui-presentation.json` preserve source records, stable identifiers, and presentation metadata.
- `scripts/build-streetwatch-data.mjs` generates `public/data/records.json`, which can support the Evidence explorer.
- `src/editorial.js` and the existing stylesheets provide the previous rendering and design implementation. The new application replaces the editorial navigation model while retaining useful records, content, and source relationships.

The new data model distinguishes **pathways, tasks, and evidence** as separate but interconnected records.

Pathway development records document possible routes, identified bottlenecks, enabling interventions, and establishment status. Published Help records represent only currently established pathways.

Illustrative examples, hypothetical statistics, and AI-generated claims must not be presented as verified local opportunities.

## Local development

```bash
npm ci
npm run dev
```

Validation and production build:

```bash
npm run build
npm run test:ui
```

The existing deployment workflow publishes `dist/` from `main` through GitHub Actions. Legacy routes and query parameters should be redirected or mapped to the appropriate Help, Work, Evidence, or About destinations during migration.

## Purpose

Crossover Stockton is an experiment in **post-scarcity engineering**: using technology, AI, and human presence to help meet needs that are not being met.

AI can assist with research, organizing evidence, identifying potential obstacles, coordinating activity, and reducing administrative work. But AI-generated information is not a substitute for firsthand contact, real-world verification, or human care.

The purpose is not to produce reports, maintain a task board, or build software for its own sake.

**The purpose is to make more good possible.**

Crossover begins with Stockton's street dogs and access to care, but the same approach can eventually serve other needs involving food, housing, companionship, transportation, and community well-being.

The measure of progress is not the quantity of records or tasks completed. It is the number and quality of usable pathways established—and ultimately the real needs they help meet.

**See clearly. Act locally.**