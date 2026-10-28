# Crossover Stockton

Crossover is an open-source system for investigating real-world problems, documenting what happens, analyzing evidence, and determining what to do next.

Live application: https://crossoverstockton.org

## How Crossover works

The system follows a continuous cycle:

**Action → Activity → Findings → New Action**

1. **Action — What needs to be done?**  
   Tasks identify practical next steps: places to investigate, people to contact, services to test, and conditions to verify.

2. **Activity — What did we actually do?**  
   Activity is the chronological record of work performed and what happened. Field reports document observations, conversations, attempts to help, obstacles encountered, and outcomes.

3. **Findings — What does the evidence tell us?**  
   Findings examine activity records, field reports, public sources, and other evidence to identify what is known, what remains uncertain, and what could improve.

4. **New Action — What should we do next?**  
   Findings generate new questions, investigations, follow-ups, and practical actions. The cycle continues as evidence accumulates.

This is a feedback loop, not a rigid sequence. A field report can be created without an existing task, and new evidence can enter the investigation at any time.

## The four interface areas

### Tasks

The working to-do list.

Tasks describe things that need to happen, such as:

- Check reported conditions at a location.
- Contact an organization.
- Volunteer at a shelter.
- Test a pathway to care.
- Follow up on an unanswered question.

Tasks can be open, awaiting a response, or completed.

Completing a task records that the work was attempted or performed. It does not necessarily establish that the underlying problem was resolved.

### Activity

The record of what actually happened.

Activity contains dated records of completed work, attempts, encounters, and field reports.

A field report may document:

- **Dog spotting:** Where someone looked, when, what they observed, and whether dogs were present.
- **Condition verification:** An attempt to verify a previously reported situation.
- **Pathway testing:** An attempt to access a service or move someone or something toward care, including obstacles and outcomes.
- **Volunteering:** An application, visit, participation, or attempted participation.
- **Other field activity:** Conversations, unexpected observations, visits, and relevant firsthand experiences.

A field report does **not** require a task.

Someone can encounter something worth documenting and create a field report immediately. The report type determines which details are relevant.

Reports may be linked to tasks, organizations, locations, existing evidence, and findings when appropriate.

Activity preserves what actually happened, including unsuccessful attempts and situations where nothing was observed.

### Map

The geographic view of the investigation.

The map displays locations associated with reports and other geographic evidence.

It allows people to:

- Explore reported locations.
- Filter evidence by available categories.
- Select a marker to examine the associated report.
- Identify places that may require further investigation.
- Compare reports across locations and time periods.

The map and report list remain synchronized.

Not every activity requires a map location. Telephone conversations, administrative follow-ups, and other non-geographic work can still appear in Activity.

Historical reports are not necessarily current conditions. Generalized evidence locations must not be presented as the precise current location of a vulnerable person or animal.

### Findings

The analysis of accumulated evidence.

Findings bring together activity records, firsthand reports, public sources, and other information to answer investigation questions.

A finding should make clear:

- What question is being investigated.
- What the available evidence supports.
- What remains unverified or unknown.
- Which sources and activities support the analysis.
- What further investigation or action is needed.

Findings can change as new evidence becomes available.

A finding may generate one or more new tasks, completing the feedback loop.

**Activity records what happened. Findings interprets what it means.** These must remain distinct.

## Creating field reports

Field reports are a primary way of adding firsthand evidence to Crossover.

A report can be created independently or in connection with an existing task.

The basic process is:

1. Identify the type of activity or observation.
2. Record when and where it happened, when relevant.
3. Describe what was attempted or observed.
4. Record the result, including obstacles, uncertainty, or absence of expected conditions.
5. Associate the report with relevant investigation records when appropriate.
6. Submit it for review and inclusion in the evidence record.

Field reports should distinguish direct observations from secondhand statements and interpretations.

A report about seeing no dogs during a visit is still useful evidence. It establishes what was observed during that visit, not that dogs are never present.

Public submissions require review before publication. Sensitive location details must be handled appropriately.

## Working with AI

Crossover is designed so AI systems can help operate the investigation, not merely generate website content.

AI can assist with:

- Reviewing current tasks and identifying priorities.
- Turning spoken or written field observations into structured reports.
- Organizing activity records and linking related evidence.
- Examining sources and identifying gaps in knowledge.
- Drafting findings with supporting evidence and stated uncertainty.
- Proposing new actions based on what has been learned.

For example, someone in the field could tell an AI assistant:

"I visited the park this morning, looked around for twenty minutes, and didn't see any dogs."

The assistant could prepare a condition-check field report with the available information and request any essential missing details.

With an authorized integration, the assistant could submit the structured report through the same process used by the website.

**The website, conversational AI, and external integrations should all work with the same underlying records.**

AI must not invent observations, claim an action occurred when it was only planned, or treat an unverified report as an established fact.

AI-generated findings and proposed actions remain subject to appropriate review.

## Data and evidence principles

- **Plans are not activities.** A proposed visit is not a completed observation.
- **Attempts are not outcomes.** Applying to volunteer does not establish that volunteering occurred.
- **Reports are not automatically verified facts.** Preserve source attribution and verification status.
- **An absence of observations is not proof of absence.** Record the scope and conditions of a visit.
- **Findings are revisable.** New evidence may strengthen, qualify, or contradict earlier conclusions.
- **Records should remain traceable.** Findings should reference supporting evidence, and tasks should reference the questions or findings that prompted them.
- **Sensitive information requires care.** Avoid exposing precise locations of vulnerable people or animals unnecessarily.

## Current investigation

**Dogs on the street in Stockton, California**

The investigation examines reported dog-related conditions, attempts to verify them firsthand, pathways through which dogs may receive care, and obstacles within those pathways.

Tasks, field reports, map locations, and findings are connected within this investigation.

The same structure can support other investigations and future Crossover chapters without requiring an entirely different application.

## Technology

- React 19, TypeScript, and Vite
- Static JSON data and Git version history
- Leaflet-based interactive mapping
- Build-time validation and static prerendering
- Cloudflare Pages hosting

The public site currently serves published content without requiring a database.

Conversational report submission, external integrations, and automated AI workflows require separately implemented and authorized connections. They should not be assumed to exist merely because the repository is public.

## Development

```bash
npm install
npm run dev
npm run build
npm run preview
```

`npm run build` performs validation, TypeScript compilation, production bundling, prerendering, and published-output checks.

## Core operating rule

**Action identifies what to do. Activity records what happened. Findings determines what the evidence means. Findings inform the next Action.**

The map connects the parts of the investigation that have a geographic location.

Every new observation, attempt, source, or result can contribute to the next cycle of investigation.