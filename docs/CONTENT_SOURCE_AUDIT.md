# Content source audit

Authored interface copy lives in `src/ui/`. The homepage composition lives in `src/pages/home.json`; its records come from the Model. Route IDs, CSS classes, URLs, enum values, date formats, and punctuation used to join dynamic fields remain in code.

| Page | Copy source |
| --- | --- |
| Home hero, section headings, cards, links | `src/ui/shared.json`; composition in `src/pages/home.json` |
| Needs reference page and investigation status wording | `src/ui/shared.json` |
| Action introduction, investigation listing, three actions, metrics, images, and links | `src/ui/action.json` |
| Updates page, source actions, and update type labels | `src/ui/updates.json` |
| Story detail page | `src/ui/stories.json` |
| About editorial copy and four idea captions | `src/ui/about.json` |
| Investigation shell, overview, task status, activity, field reports, map, and findings interface | `src/ui/investigation.json` |
| Shared navigation, footer, menu, and route titles | `src/ui/shared.json` |

Stories, needs, organizations, records, findings, articles, work, locations, and task definitions live in `src/data/*.json`. Their data bindings supply record titles, summaries, dates, and metrics at render time. Some legacy page files remain copy sources until those pages are migrated.

Run `npm run check:copy` to check that component JSX contains no direct text or static display attributes. Run `node scripts/audit-static-copy.mjs --candidates` to review code literals when adding new pages. The candidate report includes technical tokens that should stay in code.
