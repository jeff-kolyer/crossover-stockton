# Crossover Stockton

**See clearly. Act locally.**

AI, robotics, and automation create new possibilities, while people and animals still have needs that are not being met. Crossover aims to help bring post-scarcity into being by engineering practical solutions, starting in Stockton. We show up, learn what is happening, take a useful action, and let that work reveal the next step.

## Current focus

One gap is active: street dogs and access to care. It includes people trying to help dogs and people who may face barriers to shelter because they have pets. We are getting a clearer picture of the need, the care already available, and barriers people encounter.

The homepage opens the gap's full-width workspace. Its views are Overview, Objectives, Metrics, Activity, Places, Organizations, Initiatives, Findings, and Sources. Activity includes tasks and field reports. New gaps can use the same interface. Explorer holds the full public record. A record count measures the library, not people helped or needs met.

Earlier standalone needs about food distribution, reentry housing, general housing pathways, and pet-inclusive shelter are out of the active data. Relevant pet-and-shelter context is part of the street-dog gap. Tasks, activity, evidence, and places link directly to the gap through `gap_ids`. Guiding questions live inside objectives; there are no separate question, story, action, or project collections.

## Data rules

- `src/data/gaps.json` contains the gap and its canonical slug. `src/data/tasks.json` contains tracked work. `src/schemas/` defines record shapes, and `src/model/explorer-publication.json` defines the public projection.
- `public/data/records.json` is generated. The site, Explorer, and future views should read the same source relationships.
- Preserve attribution, dates, and limits. The 7,183 Animal Services field-call records were received November 2, 2026; review began later. They are not a count of dogs on the street. The 3,106 stray-dog intake events cover the 2024 service area.
- Map references retain their stated precision. The field-call data has not yet been validated for a density map.
- The desired measure of progress is what needs have been met and what has become easier for people and animals, rather than how many records have been collected.

## Build

```bash
npm install
npm run dev
npm run build
npm run preview
```

The build validates source records, generates the reusable feed, publishes the workspace at `/`, preserves readable static pages as fallbacks, and checks the routes. The live workspace uses `public/preview/ai-variant.js` and `public/preview/ai-variant-modern.css`. The one-file site in `site/one-file-template.html` remains an alternate. See [site design rules](docs/SITE_DESIGN.md) for visual details.
