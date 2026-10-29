# Crossover Stockton

Crossover explores the transition from work to vocation: using technology to free people to pursue meaningful lives and solve real problems.

We begin in Stockton, investigating unmet needs, testing ways to help, and documenting what actually happens.

**Live site:** https://crossoverstockton.org

## How Crossover works

**Action → Activity → Findings → New Action**

- **Action:** What needs doing? Identify places to investigate, people to contact, services to test, and conditions to verify.
- **Activity:** What happened? Record visits, observations, conversations, attempts, obstacles, and outcomes.
- **Findings:** What did we learn? Evaluate evidence, distinguish facts from assumptions, and identify what remains unknown.
- **New Action:** What's next? Turn findings into practical steps and continue investigating.

This is a continuous feedback loop, not a rigid sequence. Evidence and firsthand reports can enter at any point.

## The investigation app

### Tasks
The working to-do list. Tasks can be open, awaiting a response, or completed. Completing a task does not mean the underlying problem is solved.

### Activity
A dated record of what actually happened, including field observations, volunteering, pathway tests, conversations, and unsuccessful attempts.

Field reports can be created with or without an existing task. Seeing no dogs during a visit is still useful evidence when the time, location, and circumstances are recorded.

### Map
The geographic view connecting locations, reports, tasks, and observations.

**Marker colors:**

- **Orange:** Recent public reports
- **Gray:** Historical reports
- **Blue:** Official records
- **Green:** Locations with open Crossover tasks

An open task takes priority over the underlying report color. Green indicates work to be done, not a verified observation. The original evidence category remains unchanged.

Markers represent generalized locations, not necessarily the exact location of a dog or person. Historical reports do not establish current conditions. Safety alerts identify concerns requiring review, not necessarily present danger.

### Findings
What the evidence supports, what remains uncertain, and what should be investigated next.

Findings reference supporting evidence and can change as new information becomes available.

**Activity records what happened. Findings interprets what it means.**

## Working with AI

AI can help organize observations, connect records, analyze evidence, draft findings, and propose new actions.

A person might simply say:

> I visited Louis Park this morning, looked around for twenty minutes, and didn't see any dogs.

AI could prepare a structured field report, asking only for essential missing details.

The website, conversational AI, and future integrations should work with the same underlying records. Automated submissions require authorized integrations and review.

**AI must never invent observations, confuse plans with completed work, or present unverified reports as facts.**

## Evidence principles

- **Plans aren't activities.** Intentions are not observations.
- **Attempts aren't outcomes.** Trying to help doesn't establish success.
- **Reports aren't verified facts.** Preserve sources, dates, and uncertainty.
- **No observation isn't proof of absence.** Record what was checked and when.
- **Findings can change.** New evidence may confirm or contradict earlier conclusions.
- **Protect vulnerable people and animals.** Avoid unnecessary precise locations and sensitive information.

## Current investigation

**Dogs on the street in Stockton, California**

We're examining reported conditions, checking locations firsthand, and investigating how dogs reach care—and where that process may break down.

The work connects public reports, firsthand activities, locations, tasks, and evidence-based findings.

Crossover has also identified other needs in Stockton. The same investigation model can be applied to them as work expands.

## Technology

- React 19, TypeScript, Vite
- Leaflet and MapLibre mapping
- Static JSON records and Git history
- Build-time validation and prerendering
- Cloudflare Pages hosting

The public site currently operates without a database. AI-assisted submissions and external integrations require additional implementation and authorization.

## Development

```bash
npm install
npm run dev
npm run build
npm run preview
```

The build validates data, compiles TypeScript, bundles the application, prerenders pages, and checks published output.

## Core principle

**See what needs doing. Take a real step. Record what happened. Learn from reality. Repeat.**

Technology provides the tools. Vocation provides the purpose.

*We'll bring the dog food.*