# Crossover Stockton

The public site is an editorial account of Crossover Stockton's local work: clear attention, practical action, and care for Stockton's dogs. It has six sections: Home, Articles, What We're Doing, AI & Ideas, Info Explorer, and About.

## Content and sources

- `src/data/articles.json` contains six sourced care articles and the About article. About keeps its own image and grounding cards in the same article data structure.
- `src/data/site-content.json` contains the home introduction, three priorities, situation-specific care paths, the ordered work page, and AI ideas.
- Info Explorer includes the three identified priorities from `site-content.json` as gap records alongside the source catalog. Its quick status buttons follow the mockup and filter the records they label.
- `src/data/catalog-source.json`, `curated-records.json`, `record-id-ledger.json`, `record-presentation.json`, and `ui-presentation.json` preserve the existing source catalog and its stable IDs. `scripts/build-streetwatch-data.mjs` generates `public/data/records.json` for the Info Explorer.
- `src/editorial.js` renders the editorial pages and record inspection; `src/gold-demo.css` is the active stylesheet, built from the supplied gold demo's paper, type, spacing, and status colors. `src/editorial.css` remains as the prior visual baseline. The header uses the demo's blue text mark with “STKN” and “See Clearly.”; the footer uses a plain blue square.

The attached design prototype informed the layout and typography. The later street-dog care models informed the found-dog article's fictional Bruno example, the doghouse article, the distinct care paths, and bounded AI ideas. Their illustrative statistics, maps, and project claims were not imported as facts. The articles link to Crossover's source records and distinguish historical data, reports, plans, and completed activity.

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

GitHub Actions publishes `dist/` to GitHub Pages from `main`. The legacy `/evidence-room/` route and `?tab=evidence-room` links open the new Info Explorer.
