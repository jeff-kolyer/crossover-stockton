# Crossover Stockton

Crossover Stockton ("See clearly. Act locally.") is a civic investigation and evidence platform designed to figure out how emerging technology—specifically AI, robotics, and automation—combined with human participation can help solve real-world community gaps in Stockton, California.

**Live site:** https://crossoverstockton.org

## How Crossover works

**Action → Activity → Findings → New Action**

- **Action:** What needs doing? Identify places to investigate, people to contact, services to test, and conditions to verify.
- **Activity:** What happened? Record visits, observations, conversations, attempts, obstacles, and outcomes.
- **Findings:** What did we learn? Evaluate evidence, distinguish facts from assumptions, and identify what remains unknown.
- **New Action:** What's next? Turn findings into practical steps and continue investigating.

This is a continuous feedback loop, not a rigid sequence. Evidence and firsthand reports can enter at any point.

## The investigation app

### Shared investigation workspace

The investigation app combines Tasks, Activity, Map, and Findings around a shared geographic workspace.

The map reflects the selected view:

- **Tasks:** Locations connected to tasks in the selected status filter (Open, Waiting, Completed, or All).
- **Activity:** Locations connected to recorded activities.
- **Map:** All investigation locations, with filters for Recent, Historical, Official, and Firsthand.
- **Findings:** What the evidence establishes, what remains unknown, and what to investigate next.

Selecting a task or activity with a mapped location automatically positions the map at that location. Multiple records can reference the same location without creating duplicate markers.

On desktop, the map appears beside the investigation panel. On mobile, the map remains visible above a draggable sheet. People can slide the sheet down to explore locations or up to examine records without leaving the investigation.

Marker colors and icons retain their meaning across views. Filtering changes which locations appear, not what the underlying evidence means.

**The purpose is simple: see what needs doing, see where it is, go investigate, and record what happened.**

### Tasks

The working to-do list. Tasks can be open, awaiting a response, or completed. Completing a task does not mean the underlying problem is solved.

Filtering tasks by status updates both the list and the shared map, showing locations connected to that work. Selecting a task with a mapped location automatically centers the map there.

### Activity
A dated record of what actually happened, including field observations, volunteering, pathway tests, conversations, and unsuccessful attempts.

Field reports can be created with or without an existing task. Seeing no dogs during a visit is still useful evidence when the time, location, and circumstances are recorded.

### Map

The geographic view of Crossover's investigations, connecting locations, organizations, reports, tasks, activities, and findings.

Locations can represent places we've investigated, organizations we've engaged with, or areas identified through public reports. A location may connect multiple records, allowing the investigation to accumulate evidence and activity over time.

**Marker colors:**

- **Orange — Recent:** Recent public reports.
- **Gray — Historical:** Older reports.
- **Blue — Official:** Government-related locations and records.
- **Green — Firsthand:** Locations with documented Crossover firsthand activity or observations.

**Marker icons identify what the location or record represents**, such as an animal-care facility, organization, or reported sighting. Colors identify the source or nature of the evidence. These are separate properties.

A location may have multiple classifications. Its underlying records retain their original source, date, and verification status regardless of the displayed marker color.

Tasks link to locations but do not themselves constitute firsthand evidence. Planned visits and open tasks must not be represented as completed activity.

Markers may represent generalized areas rather than precise positions. Public reports do not establish current conditions, and sensitive locations are protected.

The map supports investigations across Stockton, making it possible to see where Crossover has worked, what has been reported, and how evidence, activity, and findings relate to real places.

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