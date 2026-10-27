# Crossover Stockton

**Connecting people who want to do good with the good that needs doing.**

[Visit Crossover Stockton](https://crossoverstockton.org)

Crossover investigates unmet needs, tests ways to help in the real world, and makes the evidence publicly accessible.

We begin in Stockton, California, investigating dogs on the street: where they may need help, how they reach care, where existing pathways break down, and what could improve.

## How it works

**Observe → Verify → Respond → Confirm**

We investigate using public information, firsthand observations, direct conversations, and practical attempts to help.

We distinguish plans from completed actions, reports from verified findings, and organizational activity from actual outcomes.

The goal is not to produce more information. It is to discover what works, what doesn't, and how willing people and increasingly capable technology can help meet real needs.

## The investigation

Our current investigation: **Dogs on the street in Stockton**

The working interface has four connected areas:

- **Tasks** — What needs to be done
- **Activity** — What we actually did
- **Map** — Generalized locations associated with evidence
- **Findings** — What the evidence establishes and what remains unknown

Historical reports are not current sightings. A completed task does not establish that an animal received care. Unverified claims remain labeled as such.

## Technology

- React 19, TypeScript, and Vite
- Static JSON data and Git version history
- Interactive geographic mapping
- Build-time validation and static prerendering
- Cloudflare Pages hosting

The public site does not require a database to serve its published content.

## Development

```bash
npm install
npm run dev
npm run build
npm run preview
```

`npm run build` performs validation, TypeScript compilation, production bundling, prerendering, and additional published-output checks.

## Project references

- [BACKLOG.md](BACKLOG.md) — Current priorities and real-world follow-ups
- [docs/ABOUT.md](docs/ABOUT.md) — Mission and long-term vision
- [docs/STYLE.md](docs/STYLE.md) — Design conventions

## The larger idea

As AI and automation take on more necessary work, people may gain greater freedom to care for animals, help neighbors, and pursue meaningful lives.

Crossover explores how that possibility can become reality, starting with a specific, observable need.

**Nothing is assumed to work. Everything can be investigated. Anything that works can be strengthened.**

*From thinking to being.*