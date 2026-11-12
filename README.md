# Crossover Stockton

**See clearly. Act locally.**

Crossover Stockton is an independent civic project for understanding unmet needs and finding practical ways to help in Stockton, California.

We begin with a need in the real world. We investigate what is happening, examine evidence, learn from people involved, and take useful action.

We don't need a complete understanding or a predetermined solution before beginning.

**The work discovers the work.**

Website: https://crossoverstockton.org/

---

## How Crossover works

Crossover begins by identifying a **gap**: a need that isn't being adequately met.

We create a project around that gap and build an understanding of the situation through research, firsthand observations, public records, conversations, and practical attempts to help.

The project evolves as we learn. New information may change our understanding, raise questions, reveal resources, or suggest actions.

The website makes this work public.

## The feed

**The feed is the center of the project.**

It is a living account of what we're learning, what we're doing, and what may happen next.

Unlike a chronological activity log, the feed is organized to help someone understand the situation. It combines narrative, evidence, observations, questions, and developments into a coherent account.

The feed has four views:

| View | Purpose |
|---|---|
| **Overview** | What is happening? What do we know, and what remains uncertain? |
| **Our work** | What have we investigated, attempted, observed, and learned? |
| **What's next** | What are we pursuing, planning, or waiting for? |
| **Questions** | What do we still need to understand? |

These are different views of the same evolving project, not separate investigations.

Visitors can read or listen to the feed.

### A living account, supported by records

The feed is editorial. We can revise explanations, introduce new information, and change the order of subjects as our understanding develops.

The underlying records provide continuity and accountability.

An activity may no longer appear in the current feed, but its record remains available. A finding may change when new evidence emerges. A question may be answered or replaced by a better question.

**The account evolves. The evidence remains traceable.**

## Explore the project

The left navigation provides access to the structured information behind the feed.

| Collection | Contents |
|---|---|
| **Actions** | Steps we plan to take, are pursuing, or have completed |
| **Activity** | Dated records of what happened |
| **Places** | Locations relevant to the project |
| **Organizations** | People, groups, and institutions involved |
| **Measurements** | Quantitative information, including its sources and limitations |
| **Findings** | Evidence-supported conclusions that may be revised |
| **Sources** | Documents, reports, websites, and other source material |
| **About** | Crossover's purpose and approach |

The feed helps visitors understand the situation. The collections allow them to explore the underlying information.

These collections are not a prescribed workflow. Research, observations, questions, findings, and actions can develop in any order.

## Evidence and accountability

We distinguish between what we observe, what others report, what records establish, and what we infer.

Our publishing practices are straightforward:

- **Attribution:** Identify where information originated.
- **Evidence:** Connect claims and findings to supporting sources.
- **Dates:** Distinguish when something occurred, was reported, and was updated.
- **Uncertainty:** Make unknowns, estimates, and limitations explicit.
- **Revision:** Correct conclusions without misrepresenting historical events.
- **Transparency:** Identify illustrative and AI-generated material.
- **Privacy:** Protect sensitive personal information and vulnerable people.

A record is not necessarily a verified fact. A measurement is not necessarily an explanation. A proposed improvement is not a completed outcome.

Our objective is to understand reality, not manufacture certainty.

## Data and publishing

Crossover is built with Vite, React, TypeScript, and structured JSON data.

The system separates three concerns:

1. **Records** preserve structured information, evidence, and history.
2. **The feed** selects and presents information as a readable, listenable account.
3. **The interface** provides navigation, exploration, and access to the underlying material.

The publication is generated from structured source files. Changes to the editorial account do not automatically change the records on which it relies.

Public outputs include:

- [Website](https://crossoverstockton.org/)
- [Feed JSON](https://crossoverstockton.org/feed.json)
- [Plain-text feed](https://crossoverstockton.org/feed.txt)
- [Public records JSON](https://crossoverstockton.org/data/records.json)

### Local development

```bash
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

For implementation details and publishing conventions, see the project documentation.

## Purpose

The website is not the outcome.

Neither are the number of records, measurements, or findings.

Understanding a gap helps us discover where action may be useful. The work succeeds when it contributes to meeting a real need.

We start with what we can observe, learn what we can, and act where we can help.

**See clearly. Act locally.**

**The work discovers the work.**