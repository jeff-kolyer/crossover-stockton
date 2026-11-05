# Crossover Stockton

**See clearly. Act locally.**

Crossover Stockton investigates unmet needs and explores how people and technology can help address them.

We begin with dogs on the streets of Stockton, California.

Our approach is simple: investigate conditions, examine evidence, test pathways to help, document what happens, and use what we learn to determine what to do next.

**Website:** https://crossoverstockton.org

## What the website is for

The main navigation describes five distinct ways of engaging with reality, not five interchangeable content categories:

- **Needs** — What AI has surfaced about reality: unmet needs worth understanding and investigating. These are leads, not automatically verified conclusions.
- **Action** — What Crossover and others are actually doing about those needs: investigations, practical attempts, participation, activities, evidence, and findings. Distinguish planned action from documented activity and externally reported work.
- **Stories** — Real people whose lives are changing and progress being made. Ground stories in documented experience and outcomes; do not invent impact.
- **Explore** — Explore the public record freely, in the way that serves the reader: search, filter, and follow connections among needs, investigations, actions, activities, findings, evidence, organizations, places, articles, and stories.
- **About** — What **the crossover** is about: connection, compassion, and the transition from compulsory work to meaningful vocation. It is not merely an organizational biography or a page about what *we* do.

The site should help people **see clearly and act locally**. These meanings should guide future AI-generated pages and navigation, regardless of the layout or implementation. The underlying records remain authoritative; the presentation should make their relationships and limits understandable.

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
