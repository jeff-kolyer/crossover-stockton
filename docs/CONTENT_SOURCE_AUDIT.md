# Content source audit

Authored, page-facing copy lives in JSON under `src/data/pages/`. React components choose records, apply data bindings, and render the chosen text. Route IDs, CSS classes, URLs, enum values, date formats, and punctuation used to join dynamic fields remain in code.

| Page | Copy source |
| --- | --- |
| Home hero, section headings, cards, links | `src/data/pages/home.json` |
| Needs reference page and investigation status wording | `src/data/pages/needs.json` |
| Action introduction, investigation listing, three actions, metrics, images, and links | `src/data/pages/action.json` |
| Updates page, source actions, and update type labels | `src/data/pages/updates.json` |
| Story detail page | `src/data/pages/stories.json` |
| About editorial copy and four idea captions | `src/data/pages/about.json` |
| Dog investigation shell, overview, and short evidence link labels | `src/data/pages/investigations/dogs/overview.json` |
| Dog task status wording and priority context | `src/data/pages/investigations/dogs/tasks.json` |
| Dog activity, field reports, organization labels, and investigation questions | `src/data/pages/investigations/dogs/activity.json` |
| Dog map, filters, location details, and map category labels | `src/data/pages/investigations/dogs/map.json` |
| Dog findings article interface | `src/data/pages/investigations/dogs/findings.json` |
| Shared navigation, footer, menu, and route titles | `src/data/ui-copy.json` |

Stories, gaps, organizations, records, findings, articles, work, locations, and task definitions already lived in `src/data/*.json`. Their data bindings continue to supply record titles, summaries, dates, and metrics at render time. The page files are copy sources; they do not duplicate those record datasets.

Run `npm run check:copy` to check that component JSX contains no direct text or static display attributes. Run `node scripts/audit-static-copy.mjs --candidates` to review code literals when adding new pages. The candidate report includes technical tokens that should stay in code.
