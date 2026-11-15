# Crossover Stockton

The current public website is [StreetWatch](https://crossoverstockton.org/), a static investigation of street dogs and access to care in Stockton. It uses the standard Vite layout: `index.html` at the root, application code in `src/main.js` and `src/style.css`, structured data in `src/data/`, and public files in `public/`.

## Data

- `src/data/catalog-source.json` holds the 45 evidence, activity, and task records selected for this site, with their full source detail retained.
- `src/data/curated-records.json` holds nine additional StreetWatch source records.
- `src/data/record-id-ledger.json` maps source IDs to stable StreetWatch display IDs.
- `src/data/record-presentation.json` and `ui-presentation.json` hold the catalog's editorial and interface details.
- `npm run build` draws titles, summaries, and source links from the selected records, writes `public/data/records.json` and the generated page module, then runs `vite build`. Editorial status, limitations, and display details remain in the presentation files for review.

The 54 catalog entries include 33 evidence records, five activity records, seven unfinished tasks, and nine curated source records. `npm run check:data` validates their schemas, links, and stable display IDs.

## Local development

```bash
npm ci
npm run dev
```

Validation and production build:

```bash
npm run check:data
npm run build
```

GitHub Actions publishes `dist/` to GitHub Pages from `main`. Vite copies `public/CNAME` and other public assets into `dist/`. A postbuild step adds the direct `/evidence-room/` route.

The StreetWatch tip form saves a draft in the visitor's browser. It does not submit the tip to Crossover.
