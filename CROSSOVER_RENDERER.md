# CROSSOVER_RENDERER.md

Version: 0.3
Status: revised renderer draft
Scope: schema-driven Crossover workspace shell, explorer filters, feed, detail, map, public information pages, sorting, and responsive behavior

---

## 1. Purpose

The schema defines the civic record grammar.

The renderer defines how a Crossover app uses that grammar to create an interface.

The renderer does not invent meaning. It reads the schema and feed.

The renderer uses:

* record kinds
* allowed tags
* tag families
* tag relationships
* view definitions
* selected tags
* optional selected record kinds
* record counts
* record time and trust fields
* current relevance
* location data

The interface is driven by the schema and feed data.

React renders the app, but the schema tells React what kinds of records exist, what tags are allowed, what filters apply, what records are visible, and how views are defined.

The renderer should not assume that the app has a one-record-kind-at-a-time mode.

---

## 1.1 Short Implementation Brief for AI Builders

Build Crossover as a calm civic operations workspace.

The desktop app has four persistent zones:

* a fixed, thin, icon-only left rail
* a resizable Explorer panel for views, saved views later, filters, active filters, tag search, and filter families
* a central Work pane for the feed or selected detail
* a resizable Map pane showing the same filtered record set

The schema and tag registry define record kinds, tags, tag families, filter behavior, counts, and detail fields. The renderer should not invent civic meaning. It should render records, filters, maps, summaries, and detail sections from the schema and feed data.

The main app interaction is:

1. Select a view such as All records, Signals, Services, Gaps, Work, or Posts.
2. Select filters such as Food, Shelter, Open now, High, Tonight, or Needs recheck.
3. Show selected filters at the top of the Explorer.
4. Update the Work pane title, feed, counts, detail state, and map from the same filtered record set.
5. Open a record in place inside the Work pane while keeping the Explorer and Map visible on desktop.

The center Work pane should not become a filter-management surface. The Work pane may change its heading and short summary based on selected filters, but selected filters are primarily tracked in the Explorer.

Mobile should use the same filter model. The Filters button opens an Explorer-like sheet with selected filters at the top, tag search, grouped filter families, Close and Apply controls, and the same show-more behavior.

---

## 2. Core Rendering Model

Crossover renders civic records.

Each record has:

* exactly one record kind
* many allowed tags
* time/freshness fields
* trust/evidence fields
* optional location
* optional related records
* optional entity links

The app has:

* an active view
* selected tags
* optional selected record kinds
* generated filters
* a visible record set
* a map record set
* optional selected record

The default public feed shows all currently relevant record kinds together unless a view or filter narrows the result set.

Record kind is a property of each record.

A view is a way of looking at records.

A view may show all record kinds, one record kind, or a subset of record kinds.

Tags filter across the visible record universe.

If a selected tag only applies to some record kinds, then only matching record kinds will appear.

Examples:

* Selecting Food may show food-related signals, services, gaps, work, and posts.
* Selecting Open now will usually show services, and may also show signals about confirmed availability.
* Selecting Critical will usually show gaps, and may also show signals about critical current conditions.
* Selecting In progress will usually show work records.
* Selecting Request will usually show post records.

The renderer should not need to guess the user’s intended record kind. The tag registry already defines which tags apply to which record kinds.

---

## 3. Product Mental Model

The app shows civic reality as records.

Record kinds answer different civic questions:

Signals:

What is happening?

Services:

What exists?

Gaps:

What is needed?

Work:

What is being done?

Posts:

What are people saying?

The default experience should not require the user to choose one of these before seeing useful information.

The default feed may show a mixed set of signals, services, gaps, work, and posts, sorted by current relevance and civic priority.

The user can then narrow the feed by selecting tags, choosing a saved view, searching, or optionally filtering by record kind.

Example journey:

1. User lands on the General view.
2. The feed shows currently relevant signals, services, gaps, work, and posts.
3. User clicks Food.
4. The feed shows food-related records across all record kinds.
5. User clicks Open now.
6. The feed now mostly shows open food services, plus any current signals that specifically confirm open food availability.
7. User removes Open now and clicks Critical.
8. The feed now shows critical food gaps and possibly critical food signals.
9. User selects the Safe Parking view.
10. The feed shows safe-parking-related services, gaps, signals, work, and posts according to that view’s defaults.

Selected tags remain active until removed by the user.

---

## 4. App Shell

The app has different desktop and mobile shells, but both use the same schema-driven state.

### 4.1 Desktop shell

Desktop uses a workspace layout, not a dashboard layout.

Recommended desktop structure:

* App root
* Top bar
* LeftRail
* Explorer panel
* WorkPane
* MapPane

The desktop shell should feel closer to a calm IDE, NotebookLM-style research console, or operations workspace than to a marketing page.

#### LeftRail

LeftRail is fixed-width and icon-only.

LeftRail may include:

* Live records / console
* Map
* About
* Guides
* What Crossover tracks
* Data sources, if present
* Settings

The rail should be quiet. It should not repeat filter state.

#### Explorer panel

Explorer is the primary filter and view-shaping surface.

Explorer contains:

* current view selector
* saved views later
* active filters
* tag search
* grouped filter families
* counts
* show-more controls

Explorer is resizable and may collapse to a narrow state.

#### WorkPane

WorkPane is the primary attention surface.

It renders either:

* the current feed
* the selected record detail

The WorkPane may change its title, summary, counts, and feed records based on selected filters, but it should not duplicate the full filter controls.

#### MapPane

MapPane is the spatial companion to the WorkPane.

It renders the same filtered record set as the feed.

Desktop should keep the map visible when a record is selected unless the user collapses or resizes the MapPane.

#### Resizable pane dividers

Explorer, WorkPane, and MapPane are separated by draggable vertical dividers.

Pane resizing rules:

* LeftRail stays fixed.
* Explorer has a minimum useful width and a collapsed width.
* WorkPane has the strongest claim on horizontal space.
* MapPane has a minimum useful width.
* Drag handles should be subtle but discoverable.
* Layout state may be remembered locally.

The purpose of resizing is to let operators shift between browsing, reading, and spatial work without changing the core app model.

### 4.2 Mobile shell

Mobile uses one primary surface at a time.

Mobile surfaces:

* Feed
* Map
* Monitor or Views
* Detail
* Tags/filter sheet

Mobile default surface:

* Feed in the General view

Mobile bottom navigation should include at least:

* Feed
* Map
* Monitor or Views

Filters should open as a sheet.

The filter sheet should be the mobile equivalent of the desktop Explorer.

The mobile filter sheet includes:

* title: Filters
* Close control
* Apply control
* active filters at the top
* Clear all action when filters are active
* tag search
* current view selector
* grouped filter families
* show-more controls
* record counts where useful

On mobile, filter changes may be staged until Apply is tapped. If filters apply live, Apply should still close the sheet and return the user to the previous surface.

The user should be able to choose views such as:

* General
* Top infrastructure gaps
* Safe parking resources
* Shelter capacity
* Work in motion
* Needs recheck

On mobile, selecting Map shows the same currently visible records on the map when those records have location or area data.

---

## 5. Top Bar

The top bar should be compact and functional.

Recommended contents:

* Crossover wordmark
* City selector
* Feed freshness
* Search
* Filters control
* More/menu as needed

The top bar should not become a marketing hero.

The top bar should not explain the whole mission.

Freshness should use precise language:

* Refreshed for feed or view refresh
* Checked for source/evidence checks
* Changed when a real state changed
* Reported for human or partner reports
* Observed for AI/source observations

Do not show generic “Updated” everywhere.

---

## 6. Views

Views replace the old idea of app modes.

A view is a named way of looking at the same civic record universe.

A view may define:

* label
* description
* default selected tags
* allowed record kinds, if any
* default sort
* map behavior
* summary behavior
* suggested filters

The default view should be General.

General shows all currently relevant record kinds unless the user applies filters.

Example views:

* General
* Top infrastructure gaps
* Safe parking resources
* Shelter capacity
* Food open now
* Work in motion
* Critical conditions
* Needs recheck

A view is not the same thing as a record kind.

A view may include multiple record kinds.

Examples:

Safe parking resources may show:

* safe parking services
* safe parking gaps
* safe parking signals
* related work
* relevant posts

Top infrastructure gaps may show:

* gap records
* critical signals related to those gaps
* work records related to those gaps

Food open now may show:

* service records tagged food and open now
* signal records that confirm current food availability

Work in motion may show:

* work records
* signals related to active work
* gaps connected to that work

---

## 7. Optional Record Kind Filter

Record kind may be exposed as a filter when useful.

It should not be treated as the required primary app navigation.

A record-kind filter may allow:

* all record kinds
* one selected record kind
* multiple selected record kinds

The schema only requires that each record has exactly one record kind.

The renderer may let the user narrow to:

* Signals
* Services
* Gaps
* Work
* Posts

But the default state should not require one of these to be selected.

If record-kind counts are shown, they should be calculated after selected tags and search are applied.

Example with Food selected:

* All 30
* Signals 12
* Services 8
* Gaps 3
* Work 2
* Posts 5

These counts mean: within records tagged Food, those are the available record kinds.

---

## 8. Explorer, Tags, and Filter Area

The Explorer is the desktop filter and view-shaping surface.

On mobile, the same model appears as the Filters sheet.

The tag/filter area is a searchable list or sheet of allowed tags.

It does not need to separate record kinds as the primary navigation, though it may expose record kind or view choices when useful.

The tag/filter area shows tags that can filter the current record universe.

Examples:

* Food
* Meal service
* Pantry
* Safe parking
* ID service
* Shelter
* Cooling
* Restrooms
* Storage
* Open now
* No ID required
* Critical
* In progress
* Request
* Needs recheck
* South Stockton

### 8.1 Tag/filter behavior

The tag/filter area should:

* show useful tags first
* group tags by family where useful
* allow vertical scrolling when needed
* include search above the tag list
* filter the tag list as the user types
* allow tags to be selected and deselected
* preserve selected tags when switching views unless the user removes them
* show selected tags clearly near the top of Explorer or the mobile sheet
* show tags that apply to the visible record universe
* update counts when the active view, selected tags, or search query changes
* show selected tags even when they would normally be hidden behind Show more

The center WorkPane should not contain the full filter UI. Filter selection and filter tracking belong in Explorer on desktop and in the filter sheet on mobile.

### 8.2 Tag search

Typing into tag search should search:

* tag labels
* tag descriptions
* related tags
* parent tags
* common synonyms if present in schema later

Search results should still show the tag family.

Example:

Search: meal

Results:

* Meal service — Service type
* Hot meal — Service type
* Sack lunch — Service type
* Food — Support

### 8.3 More behavior

For long tag families, show the most useful or most common tags first.

Use More to show the full list for that family.

The More state should not hide selected tags.

Selected tags remain visible even if they would normally be below the fold.

### 8.4 View selector behavior

The Explorer should include a compact View section.

The View section may include:

* All records
* Signals
* Services
* Gaps
* Work
* Posts

These are view controls or record-kind filters depending on implementation, but the UI should make them feel like ways to shape the visible record set, not separate apps.

When a view is selected:

* filters update to match that view and current result universe
* counts update
* selected tags remain active when still valid
* selected tags may remain visible even if they return zero results
* the WorkPane heading changes to describe the current view
* the feed and map update from the same visible record set

Later, saved views may appear above or near the View section. Saved views are named combinations of view, selected tags, sort, and map behavior.

### 8.5 Filter families that change with view

Filter families should be generated from the active view, selected tags, and visible record universe.

Examples:

* A gaps view prioritizes Support, Service Type, Gap Pattern, Severity, Urgency, Time, Trust, and Area.
* A services view prioritizes Support, Service Type, Availability, Access, Time, Trust, Area, and Population Fit.
* A signals view prioritizes Support, Service Type, Time, Urgency, Trust, Area, and Related.

The renderer may hide families that have no relevant tags for the current view, or show them disabled if that helps explain the filtered state.

### 8.6 Show more behavior

Long families should show a short default list and a subtle Show more control.

Show more rules:

* The default list should include the most useful tags for the current view.
* Show more expands the family in place.
* Selected tags always remain visible.
* The control should be quiet, such as “+ 12 more” or a subtle chevron row.
* The expanded/collapsed state may be remembered locally.

---

## 9. Selected Tags and Active Filters

Selected tags are active filters.

Selected tags should appear as compact chips or pills in a visible area.

The primary selected-filter display belongs near the top of Explorer on desktop and near the top of the Filters sheet on mobile.

A selected tag should show:

* public label
* optional family label when ambiguity exists
* remove control

Examples:

* Food
* Meal service
* Open now
* Critical
* South Stockton
* Needs recheck

Selected tags should not be loud or decorative.

They should feel operational.

### 9.0 Placement rule

Selected filters should be tracked in two ways:

1. **At the source of selection** — the selected checkbox, radio, or row remains visibly selected inside its filter family.
2. **In the Active filters area** — selected filters appear as removable chips near the top of Explorer or the mobile filter sheet.

The WorkPane may reflect selected filters through its title, summary, counts, and visible records. It should not repeat the full selected-filter chip set unless the Explorer is hidden, collapsed, or unavailable.

For example, when Food is selected:

* Support shows `Food` selected.
* Support may show an active count such as `Support (1)`.
* Active filters shows `Food ×`.
* The WorkPane title may become `Food gaps affecting Stockton tonight`.
* The feed and map show only matching food records.

Avoid showing the same selected filter in three equally prominent places.

### 9.1 Selected tags affect the visible record universe

If Food is selected, the app filters records to records that contain Food.

If Food and Open now are selected, the app filters records to records that contain both Food and Open now.

If a selected tag only applies to certain record kinds, the result set naturally narrows to those kinds.

The app does not need to force a record-kind switch.

### 9.2 Tags with limited record-kind applicability

If a selected tag does not apply to many record kinds, that is expected.

For example:

Open now usually applies to services and some signals.

Critical usually applies to gaps and some signals.

In progress usually applies to work.

Request usually applies to posts.

The renderer should not treat this as an error.

It should simply show the matching records.

### 9.3 Empty results from selected tags

If selected tags produce no results, the renderer should explain that no current records match that combination.

It should not overclaim that the underlying real-world condition does not exist.

---

## 10. Generated Filters

Generated filters come from the schema and current visible record universe.

The renderer asks:

* What view is active?
* Which tags are selected?
* Which record kinds are allowed by the view, if any?
* Which tags are filterable?
* Which tag families exist in the visible or available record set?
* Which related tags should be suggested?
* Which filters should appear first?

Generated filters may appear as:

* chips
* grouped lists
* compact dropdown controls
* a filter sheet
* a left or right filter panel

Before selection, a dropdown may show the family label.

Examples before selection:

* Availability
* Access
* Severity
* Time
* Trust
* Area

After selection, it may show the selected tag label.

Examples after selection:

* Open now
* Walk-ins accepted
* Critical
* Tonight
* Partner update
* South Stockton

If multiple options are selected, show a compact summary.

Examples:

* Food + Pantry
* 3 selected
* High + Critical

---

## 11. Default Filter Families by View and Result Set

The renderer should not assume one mode equals one record kind.

Instead, filters are generated from the view, selected tags, visible records, and tag registry.

### 11.1 General view filters

General view may prioritize:

* Support
* Availability
* Severity
* Urgency
* Time
* Trust
* Area
* Record kind, if exposed

General view should show filters that help users quickly narrow mixed civic reality.

Useful General filters:

* Food
* Shelter
* Safe parking
* Open now
* Critical
* Tonight
* Needs recheck
* Verified
* South Stockton

### 11.2 Service-heavy result filters

When visible results include many services, emphasize:

* Availability
* Access
* Service type
* Time
* Trust
* Area
* Population fit

Useful service filters:

* Open now
* Opening soon
* Closed now
* Limited availability
* Free
* Low barrier
* Walk-ins accepted
* Appointment required
* No ID required
* Referral required
* Wheelchair accessible
* Area
* Trust

### 11.3 Gap-heavy result filters

When visible results include many gaps, emphasize:

* Support
* Service type
* Gap pattern
* Severity
* Urgency
* Time
* Trust
* Area

Useful gap filters:

* Capacity gap
* Coverage gap
* Time gap
* Access gap
* Mobility gap
* Information gap
* Verification gap
* Policy gap
* High
* Critical
* Tonight
* Needs recheck
* Source-supported
* Area

### 11.4 Signal-heavy result filters

When visible results include many signals, emphasize:

* Time
* Trust
* Urgency
* Area
* Support
* Service type
* Related

Useful signal filters:

* Today
* Tonight
* Partner update
* Human reported
* Field observation
* Needs recheck
* Open now
* Temporarily unavailable
* Service type
* Area

### 11.5 Work-heavy result filters

When visible results include many work records, emphasize:

* Work stage
* Support
* Service type
* Urgency
* Time
* Trust
* Area

Useful work filters:

* In progress
* Planned
* Blocked
* Needs owner
* Verification work
* Delivery
* Setup
* Repair
* Coordination
* Area

### 11.6 Post-heavy result filters

When visible results include many posts, emphasize:

* Post type
* Support
* Service type
* Time
* Area
* Related

Useful post filters:

* Request
* Offer
* Report
* Discussion
* Donation need
* Volunteer need
* Today
* Weekend
* Area

---

## 12. Feed Pane

The feed pane renders records matching:

* active view
* selected tags
* optional selected record kinds
* generated filters
* search query
* current relevance rules

The feed pane should always render from the same visible record set as the map.

If a record appears in the feed and has usable location or area data, it should be eligible for map rendering.

### 12.1 WorkPane header

The WorkPane header describes the current visible record set.

It may include:

* generated title
* short AI-assisted summary when available
* compact count chips
* sort control
* refresh control

The WorkPane header should not be a marketing hero.

When filters are active, the title and summary may adapt.

Examples:

* `Top gaps affecting Stockton tonight`
* `Food gaps affecting Stockton tonight`
* `Open food services near Downtown`
* `Safe parking records needing recheck`

The WorkPane header may include an AI summary chip or disclaimer link, but it should remain compact and should not compete with the first record.

### 12.2 Feed default view

Default view:

General

The General view should show all currently relevant record kinds, sorted by mixed-feed priority.

The user arrives and sees what matters now, not a blank category choice.

### 12.3 Feed records by record kind

Signal cards should feel like observations or current conditions.

Service cards should feel like usable listings.

Gap cards should feel like tracked infrastructure issues.

Work cards should feel like action status.

Post cards should feel like human/community context.

All cards share the same visual family.

Do not create five unrelated card designs.

### 12.4 Mixed feed rhythm

A mixed feed should be readable.

The renderer may use subtle record-kind cues, such as small labels, icons, or metadata, when multiple record kinds appear together.

Do not use giant type chips.

The content of the card should do most of the work.

---

## 13. Feed Record Rendering

The feed may render records as rows, cards, or compact tiles depending on viewport and view.

For the desktop operations console, the preferred default is a dispatch-log or issue-list style feed rather than chunky dashboard cards.

Feed records should show the most important tags in a collapsed row and all tags in expanded detail.

The schema tells the renderer which tags show on cards.

A tag may have:

* show_on_card true
* show_in_detail true
* display priority
* family
* color role

### 13.1 Collapsed feed record structure

Recommended collapsed feed record structure:

* title
* meaning line or summary
* primary tag row
* time/trust line when useful
* optional location/area
* optional small media or mini visual

### 13.2 Primary tag row

The primary tag row should show only the most useful tags.

Use tag priority and family rules.

Examples:

Signal card:

Food · Meal service · Open now · Partner update · Today

Service card:

Food · Meal service · Open now · Free · Walk-ins accepted

Gap card:

Food · Time gap · High · Tonight · Source-supported

Work card:

Food · Verification work · In progress · Today

Post card:

Food · Baby food · Request · Weekend

### 13.3 Expanded tag display

When expanded, group tags by family.

Example service detail:

Support

Food

Service type

Meal service, Hot meal

Availability

Open now

Access

Free, Walk-ins accepted, Low barrier

Trust

Partner update

Area

Central Core

### 13.4 Type labels

Do not use giant type chips.

In a mixed feed, a record may show the record kind subtly when useful.

In a record-kind-specific view, the record kind may be less visible because the view already provides context.

### 13.5 Ranked feed rows

When the view is sorted by priority or relevance, the renderer may show rank numbers.

Rank numbers should:

* align cleanly at the left of rows
* match numbered map markers when the map uses numbered markers
* update when sorting or filtering changes
* remain visually quiet enough that the title is still primary

Rows should support hover, selection, keyboard focus, and opening detail.

---

## 14. Signal Cards

Signals are observation records.

A signal card should answer:

* What is happening?
* What condition, pattern, change, or confirmation was observed?
* When was it observed or reported?
* What evidence supports it?
* What record does it relate to?
* Does it expire or need recheck?

Signal example:

Title:

Food pressure is easing as meal services open

Summary:

Several verified meal services are now active, reducing near-term food access pressure in the central area.

Collapsed tags:

Food · Meal service · Open now · Source-supported · Today

Time line:

Observed 12 min ago

Action:

View related services

Signal detail should show:

* evidence
* source
* observed/reported time
* valid window
* related service/gap/work/post records

---

## 15. Service Cards

Services are usable resources.

A service card should answer:

* What is the service?
* Is it open or usable now?
* Who can use it?
* What access conditions matter?
* Where is it?
* How trusted is the information?

Service cards should show the service itself, not only the latest signal about it.

Example title:

St. Mary’s meal service

Collapsed tags:

Food · Meal service · Open now · Free · Walk-ins accepted

Service detail should show:

* current availability
* hours or valid window
* access conditions
* location
* support instructions
* evidence and sources
* related signals
* related gaps
* related work

---

## 16. Gap Cards

Gaps are tracked support failures.

A gap card should answer:

* What is missing or failing?
* What kind of gap is it?
* How serious is it?
* How soon does it matter?
* What support system does it affect?
* What evidence supports it?
* What could help?

Gap example:

Food access drops after 7 PM in south Stockton

Collapsed tags:

Food · Time gap · High · Tonight · Source-supported

Gap detail should show:

* what is missing
* gap pattern
* severity
* urgency
* affected area
* evidence
* confidence
* related services
* related signals
* related work
* what could help

---

## 17. Work Cards

Work records show action underway.

A work card should answer:

* What is being done?
* What stage is it in?
* What gap, service, signal, or post is it related to?
* Who or what is needed next, if known?
* Is it blocked?

Work example:

Verify pantry hours

Collapsed tags:

Food · Pantry · Verification work · In progress · Needs phone call

Work detail should show:

* task/action
* stage
* related records
* needed next step
* evidence/source
* time/freshness

---

## 18. Post Cards

Posts show human/community context.

A post card should answer:

* What is being said?
* Is it a request, offer, report, discussion, or donation need?
* What tags does it relate to?
* Is it location-specific?
* Does it connect to a service, gap, signal, or work record?

Post example:

Baby food requested for weekend pantry

Collapsed tags:

Food · Baby food · Request · Weekend

Post detail should show:

* post body or summary
* post type
* related tags
* related records
* source/report info
* caveat/trust state

---

## 19. Detail Behavior

Clicking a feed record opens detail.

Desktop:

* The detail should open in the feed pane or adjacent detail area.
* The map remains visible.
* The selected map marker is emphasized.

Mobile:

* The detail opens as the active surface or a full-height sheet.
* Back returns to the previous surface.

Detail should be schema-driven.

Detail should feel like opening a record file inside the WorkPane, not like leaving the app.

### 19.1 Detail toolbar

The detail toolbar should be compact and persistent at the top of the WorkPane.

Recommended controls:

* Back to results
* Previous
* result index, such as `2 / 4`
* Next
* Bookmark, optional
* Verify, optional
* Open source, optional
* Close

The toolbar should use the same quiet button style as the rest of the app.

If filters are active, detail may show a small context line such as `Viewing within active filter: Food`. This is context, not the main filter-management surface.

### 19.2 Detail content

Detail groups tags by family.

Detail shows:

* title
* summary
* record kind
* primary tag chips
* grouped tags
* current relevance
* what is happening
* time/freshness
* trust/evidence
* sources
* location or affected area
* suggested next checks or follow-up when available
* related records
* support instruction when available

### 19.3 Detail layout

The detail layout should use clear sections with subtle dividers.

Recommended sections:

* Current relevance
* Trust / evidence
* What is happening
* Tags / classification
* Suggested next checks
* Sources
* Related records

The detail page should be more structured than a plain text dump, but should avoid loud cards, heavy borders, or decorative dashboards.

---

## 20. Map Rendering

The map renders the same visible records as the feed, when records have location or area data.

Gap records may render as affected areas, boundaries, or zones when they have area data but no point location.

Feed and map must stay synchronized.

Changing view, tags, generated filters, record-kind filters, or search updates both feed and map.

Clicking a map marker or gap area selects the corresponding record.

Clicking a card selects the corresponding marker or gap area.

When a gap record is selected, the map may focus on that gap and reduce competing map records so the selected area is readable.

### 20.1 Map by visible record set

The map should not rely on an app mode.

It should render the current visible record set.

If the visible set contains services, show service locations.

If the visible set contains gaps, show affected locations, areas, or zones.

If the visible set contains signals, show signal locations when available.

If the visible set contains work, show work locations, verification areas, setup sites, delivery routes, or coordination zones.

If the visible set contains posts, show posts with location data.

Records without location or area data remain feed-only.

### 20.2 Map by view

Views may define map behavior.

Examples:

General view:

Show all visible mappable records using calm, differentiated markers.

Safe parking resources view:

Emphasize safe parking locations, unclear zones, related work, and related signals.

Top infrastructure gaps view:

Emphasize gap areas and connected signals/work.

Food open now view:

Emphasize open service locations and current availability signals.

### 20.3 Marker semantics

Markers should be calm and custom.

Do not use default Leaflet pins.

Marker appearance may depend on:

* record kind
* support tags
* severity tags
* availability tags
* trust tags
* selected state
* active view

Service markers should emphasize availability.

Gap markers should emphasize severity and urgency.

Signal markers should emphasize recency and trust.

Work markers should emphasize stage.

Post markers should be quieter unless urgent.

---

## 21. Search

Search should work across:

* record titles
* record summaries
* tag labels
* tag IDs
* tag descriptions
* areas
* sources
* related records

Search should not replace tags.

Search helps find tags and records.

If the user searches a known tag label, the renderer should offer that tag as a selectable filter.

Example:

Search “food” should show:

* Food tag
* records matching food
* related tags such as Meal service and Pantry

---

## 22. Counts

Counts should be calculated from the current filtered universe.

Counts may be shown for:

* all visible records
* record kind breakdown
* tag options
* view result counts
* map-visible records

If record-kind counts are shown, they should reflect selected tags and global search, but not require record kind to be the active navigation.

Example:

Selected tag: Food

Record-kind counts:

* All 30
* Signals 12
* Services 8
* Gaps 3
* Work 2
* Posts 5

If the user also selects South Stockton, counts update to Food + South Stockton.

This allows the user to move across kinds of civic reality without losing topic context.

---

## 23. Empty States

Empty states should be specific to the selected view and tags.

Example:

Food + Open now has no results:

No current records match Food and Open now.

Try removing Open now, checking Needs recheck, or viewing stale records.

Food + Critical has no results:

No current critical food records are visible in this feed.

That does not mean no food problems exist. It means the current feed has no matching records.

Empty states should not overclaim reality.

---

## 24. Freshness and Time Rendering

Do not use generic “Updated” everywhere.

Use precise labels from the time model.

For feed/view:

Refreshed 2 min ago

For source/evidence:

Checked 12 min ago

For state changes:

Changed 12 min ago

For human/partner reports:

Reported 18 min ago

For AI/source observations:

Observed 3:30 PM

For service windows:

Open until 2 PM

For gaps:

Still active · checked 2 min ago

For stale records:

Needs recheck · last checked 7 days ago

---

## 25. Current Relevance

The visible feed should default to current relevance.

A record is visible when:

* it matches the active view
* it matches selected tags
* it matches optional selected record kinds, if any
* it matches generated filters
* it matches search query, if any
* current_relevance.is_currently_relevant is true, unless the user includes stale/expired records

Current relevance is not the same as recency.

A record can be old but currently relevant.

A record can be recent but no longer relevant.

---

## 26. Sorting

Sorting should work across all visible records by default.

A mixed feed may contain signals, services, gaps, work, and posts together.

The renderer must be able to sort mixed records without requiring a one-record-kind mode.

### 26.1 Default mixed-feed sort

Default mixed-feed sort should consider:

1. Current relevance
2. Urgency
3. Severity
4. Availability or actionability
5. Trust/confidence
6. Recency of observation, report, or state change
7. View-specific priorities

### 26.2 Record-kind-aware sort refinement

Within the mixed sort, record-kind-specific rules may refine ordering.

Signals may sort by current relevance, observed/reported time, urgency, and trust.

Services may sort by open now, opening soon, limited or available, trust, and distance or area relevance when available.

Gaps may sort by critical severity, high severity, urgency, confidence, and last observed or state updated.

Work may sort by in progress, blocked, urgent, planned, and recently updated.

Posts may sort by recent, relevant to selected tags, and human/community priority when available.

### 26.3 Tag-specific sort roles

Tags may provide sort roles.

Examples:

* Critical sorts critical gaps and critical signals higher.
* Open now sorts currently available services higher.
* Opening soon sorts near-term services higher.
* In progress sorts active work higher.
* Blocked may sort blocked work higher in a work-focused view.
* Verified may sort more trusted records higher when trust is important.

A tag’s sort role only applies when relevant to the record kind and view.

A tag should not force unrelated record kinds into a view.

---

## 27. Support Instructions

Support instructions are generated from records, tags, time, trust, and sources.

The renderer may show support instructions in detail when present.

Support instructions should use the same tag grammar.

For service records, support instructions may explain:

* where to go
* when to go
* what to bring
* access conditions
* backup options
* caveats

For gap records, support instructions may explain:

* what is missing
* who may be affected
* what could help
* what needs verification

Support instructions should preserve uncertainty.

Do not generate confident action instructions from stale, conflicting, or model-inferred information without warning.

---

## 28. Mobile Behavior

Mobile should not squeeze the desktop layout.

Mobile has one active surface at a time.

Recommended mobile surfaces:

* Feed
* Map
* Monitor or Views
* Detail
* Tags/Filters

The default mobile experience:

* General view
* Feed surface
* mixed currently relevant records

User can tap Map to see the same records spatially.

User can open Filters to select tags.

User can open Views or Monitor to choose a saved view.

Selected tags remain active across view changes unless the user removes them.

Contextual filters may open as a sheet.

The tag/filter area becomes a sheet on mobile.

### 28.1 Mobile filter sheet

The mobile filter sheet is the mobile version of Explorer.

It should include:

* Close
* Apply
* Active filters
* Clear all
* Search filters
* View selector
* filter families
* show-more controls

Selected filters should be visible near the top of the sheet.

Mobile should not require users to hunt through collapsed families to discover what is active.

When Apply is tapped, the sheet closes and the Feed, Map, or Detail surface reflects the same filtered record set.

---

## 29. Desktop Behavior

Desktop should support simultaneous filtering, reading, and spatial context.

Recommended desktop:

* fixed icon-only LeftRail
* resizable Explorer panel
* resizable WorkPane
* resizable MapPane

The map remains visible while browsing records or details.

The feed and map update together.

Desktop should use draggable vertical dividers between Explorer, WorkPane, and MapPane.

If a grid layout is ever used inside the WorkPane, it should reflow based on WorkPane width, not only viewport width.

The default desktop feed should favor readable operational rows over card-heavy browsing.

---

## 30. Public Information Pages

Crossover may include public or informational pages linked from the left rail or site navigation.

These pages should not crowd the main operations console.

The recommended split is:

1. About Crossover
2. Guides / How Crossover Works
3. What Crossover Tracks

### 30.1 About Crossover

The About page should be simple and emotional-practical.

It answers:

* What is Crossover?
* Why does it exist?
* Who is it for?

Recommended About page structure:

* Hero
* Why Crossover exists
* Three core actions
* Starting in Stockton
* final sentence or console CTA

Hero language may use:

`Find the gaps between need and support.`

Short supporting copy:

`People cannot respond to what they cannot see. Crossover helps show what support exists, where it is missing, what changed, and what needs attention.`

Three core actions:

* Find gaps — where support is missing, strained, stale, unreachable, or failing.
* Check what is true — see what is verified, source-supported, reported, stale, or uncertain.
* Coordinate useful work — help people follow up, avoid duplication, and respond from a clearer view.

Starting in Stockton:

`Crossover begins in Stockton, California, with one practical question: what is happening, what is missing, and what needs attention first?`

The About page should be much lighter than the console or guides.

### 30.2 Guides / How Crossover Works

The Guides page may explain:

* how AI helps
* evidence and trust
* verified, source-supported, human-reported, model-inferred, stale, conflicting, and unknown information
* questions that guide the work
* what records mean
* how to read the console

This page can be more explanatory because the user intentionally opened it.

### 30.3 What Crossover Tracks

The What Crossover Tracks page explains the record kinds.

It should include:

* Signals
* Services
* Gaps
* Work
* Posts

Each record kind should have room for:

* plain-language meaning
* example
* icon
* what it helps people do

This page prevents the About page from becoming a product manual.

### 30.4 Public page visual rule

Public pages may be warmer and more explanatory than the console, but should keep the same calm civic identity.

The About page should not try to explain the whole trust framework.

The console should not contain marketing hero sections.

---

## 31. Visual Tone

The renderer should feel:

* calm
* civic
* practical
* readable
* modern
* restrained
* operational

Avoid:

* marketing hero sections
* generic dashboard KPI rows
* loud rainbow category styling
* giant type chips
* default map pins
* fake AI futurism
* decorative clutter
* overexplaining the mission in the main app chrome

Cards should feel like one product family even though records have different kinds.

Tags should be legible and useful, not decorative.

---

## 32. Renderer Responsibilities

The renderer owns:

* layout
* workspace shell and pane resizing
* view selection
* optional record-kind filtering
* tag/filter behavior
* selected tag display
* generated filter display
* feed card rendering
* detail rendering
* map marker rendering
* responsive behavior
* empty states
* sorting behavior
* public information page rendering
* visual tone

The renderer does not own:

* allowed tags
* tag meanings
* tag families
* AI tagging rules
* source ingestion
* backend persistence
* schema validation

Those belong to the schema or backend systems.

---

## 33. Schema Responsibilities Used by Renderer

The renderer depends on the schema for:

* record kinds
* tag registry
* tag families
* which tags apply to which record kinds
* which tags are filterable
* which tags show on cards
* which tags show in detail
* tag display priority
* tag relationships
* tag conflicts
* current relevance
* time/freshness fields
* trust tags
* view definitions, if provided

If a new tag is added to the schema, the renderer should be able to display and filter it without code changes, as long as the tag includes required metadata.

---

## 34. Plain-English Summary

The renderer turns the schema into an app.

The user starts in the General view and sees currently relevant civic records.

Those records may include signals, services, gaps, work, and posts together.

The user can click Map to see the same visible records spatially.

The user can select tags like Food, Open now, Critical, Safe parking, Needs recheck, or South Stockton.

Selected filters are tracked near the top of Explorer on desktop and near the top of the filter sheet on mobile.

Tags filter the whole visible record universe.

If Open now is selected, mostly services appear because Open now mostly applies to services.

If Critical is selected, mostly gaps and critical signals appear because Critical applies to those records.

If Food is selected, all food-related record kinds may appear.

The user can choose views like General, Top infrastructure gaps, Safe parking resources, Shelter capacity, or Work in motion.

Views are saved ways of looking at records.

Views are not the same thing as record kinds.

Record kind may still be available as a filter, but the app does not need a one-record-kind-at-a-time mode.

The schema tells the renderer which filters to show, which tags apply, which records are visible, and how to sort them.

The feed and map always reflect the same filtered record set.

That is the Crossover interface.
