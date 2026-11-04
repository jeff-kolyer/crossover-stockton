# Crossover Stockton

**See clearly. Act locally.**

Crossover Stockton investigates unmet needs and explores how people and technology can help address them.

We begin with dogs on the streets of Stockton, California.

Our approach is simple: investigate conditions, examine evidence, test pathways to help, document what happens, and use what we learn to determine what to do next.

**Website:** https://crossoverstockton.org

## How it works

**Action → Activity → Findings → New Action**

- **Action:** Identify what needs investigating or doing.
- **Activity:** Document what actually happened.
- **Findings:** Evaluate evidence and identify what we've learned.
- **New Action:** Determine what to investigate or attempt next.

The investigation develops through firsthand observations, conversations, public records, and practical experience.

## Data and architecture

Crossover maintains structured JSON records describing needs, investigations, actions, activities, findings, organizations, and locations.

- `src/data/` — Authoritative, version-controlled source records.
- `public/data/records.json` — Generated public data feed.
- Static HTML pages — Generated from the feed.
- GitHub — Source control and publication.

The information is independent of its presentation. The website can change without changing the underlying investigation records.

## Development

```bash
npm install
npm run dev
npm run build
npm run preview
```

The build validates source records, generates the public feed, and produces the website.

## Current investigation

**Dogs in Stockton**

We're investigating the extent of the street-dog problem, what happens when people seek help, and what prevents existing resources from reaching animals in need.

Our findings and activities are published as the investigation progresses.
