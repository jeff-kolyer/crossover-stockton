# StreetWatch Care Gap: current site functionality

Current public Site: https://crossoverstockton.org (GitHub Pages). Published source: `site/streetwatch`. The accepted ChatGPT Sites copy is https://streetwatch-care-gap.jkolyer.chatgpt.site and is private. Future designs may be generated as separate Sites; after acceptance, copy the selected build into the GitHub Pages source and update this file.

The downloaded `streetwatch_care_gap_investigation (2).html` is the visual and interaction reference. Keep its CSS and six-tab page structure when regenerating. Data in that reference is illustrative; use the checked Crossover and public-source data compiled into this build.

## Navigation and sections

- One page with six tabs: Overview, Ground Truth, Evidence Room, Initiatives, Care Resources, Methodology. Evidence Room stays inside this navigation.
- Overview presents the five bottlenecks as the organizing framework, with evidence, a plain-language finding, and a next action. Source limits remain visible.
- Ground Truth offers the source-linked evidence and place information available now. A dispatch map or time trend must wait for geocoded cases or comparable yearly data.
- Evidence Room uses the reference's compact split desk: searchable and filterable master index on the left; selected record, source, limits, claims, and custody on the right. A record link opens the matching entry through the URL.
- Initiatives relates documented actions and organizations to the bottlenecks without treating plans as completed outcomes.
- Care Resources offers triage paths and source-linked services. It does not promise current openings, eligibility, or wait times without a current source.
- Methodology explains record status, provenance, limitations, and unfinished work.

## Record rules

- Keep the 54 imported entries: 17 source-checked, 21 attributed reports, 8 firsthand, 7 open work items, and 1 waiting work item. The waiting item is the Stockton Animal Services volunteer follow-up. Open includes the location fieldwork plan and six other unfinished tasks.
- Keep record IDs, titles, source links, dates, status, account, and limits. Never invent a CPRA number, dispatch rate, kennel occupancy, clinic capacity, severity calculation, or field observation.
- Display IDs come from `record-id-ledger.json` and are StreetWatch internal catalog labels. They are not agency request or file numbers. The source ID remains available as `originalId`, works in search, and continues to resolve in old links.
- The Site's `/data/records.json` and `/data/crossover-data.json` are the public data snapshots. A source link is shown only where a source URL exists.
- The `Export Entry CSV` action exports the displayed entry metadata, not a purported original source dataset. Citation copy uses the selected record.
- Coordinates on the map are schematic until source-backed locations are available.

## Release checks

- `node build.mjs` and `node check.mjs` must pass.
- Reference CSS must remain unchanged. Confirm the six-tab header and compact Evidence Room at desktop width; confirm mobile has no horizontal overflow.
- Check an Open entry, a checked entry, search and status filters, a direct record URL, the source link, export, citation copy, and the other five tabs.
- A selected evidence filter, including Open, stays orange while the pointer hovers over it. Other filters retain the dark hover treatment.
