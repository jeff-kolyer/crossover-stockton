# CROSSOVER_SCHEMA.md

Version: 0.2
Status: revised schema draft
Scope: Crossover civic record grammar, tag registry, AI output rules, filter behavior, sorting behavior, and feed data shape

---

## 1. Purpose

Crossover turns AI findings into civic records.

Each civic record has a **record kind** and a set of allowed **tags**.

The record kind tells the system what kind of civic thing the record is.

The tags tell the system what the record is about, how it behaves, where it applies, who it helps, when it matters, how trusted it is, and how it should be filtered.

The schema defines the grammar that AI, the feed, the map, filters, cards, and details all share.

This schema is not a visual design document. It does not define card sizes, CSS, animation, exact layout, or mobile presentation. Those belong in the renderer contract.

---

## 2. Core Model

Crossover has three core ideas:

1. **Records** — AI-generated civic things.
2. **Record kinds** — the major kinds of records: signals, services, gaps, work, and posts.
3. **Tags** — the allowed civic vocabulary used to classify records.

A record is not raw source data. A record is a public civic interpretation created from sources, observations, human reports, partner updates, and AI-assisted analysis.

A record may describe something happening, something that exists, something missing, something being done, or something people are saying.

The default public feed may show all record kinds together.

Filtering happens primarily through tags.

A view may show all record kinds, one record kind, or a defined subset of record kinds.

The schema does not require the app to have a one-record-kind-at-a-time mode.

---

## 3. Record Kinds

Every public record must have exactly one `record_kind`.

`record_kind` is exclusive for each record.

A record may be one of the following:

* `signal`
* `service`
* `gap`
* `work`
* `post`

A single record may not be more than one record kind at the same time.

This is a data rule for records, not an interface rule for views.

The app may show multiple record kinds together.

Optional later record kinds:

* `alert`
* `policy`

For this version, alerts and policies may be represented as signals, gaps, work, posts, or services with appropriate tags.

### 3.1 Signal

A signal is an observation, pattern, change, report, confirmation, warning, or current condition.

Signals answer:

**What is happening?**

Examples:

* Food pressure is easing as meal services open.
* Restroom closure reported downtown.
* Cooling center confirmed for tonight.
* Shelter intake capacity changed.
* Safe parking rules need recheck.

A signal is not the full service record, entity record, or gap record. It may link to related records.

Signals are useful when something meaningful is happening in the civic system, but the thing being shown is not itself a service, gap, work item, or post.

### 3.2 Service

A service is a resource, place, program, provider, mobile unit, event, or support offering people may be able to use.

Services answer:

**What exists?**

Examples:

* St. Mary’s meal service.
* Downtown ID clinic.
* Mobile hygiene unit.
* Cooling center.
* Safe parking resource.

### 3.3 Gap

A gap is a missing, insufficient, blocked, failing, stale, conflicting, or worsening part of the support system.

Gaps answer:

**What is needed?**

Examples:

* Food access drops after 7 PM in south Stockton.
* Safe parking options unclear for RVs.
* Restroom access needs recheck downtown.
* Shelter capacity is full tonight.

### 3.4 Work

Work is action underway to verify, repair, deliver, coordinate, set up, improve, or resolve something.

Work answers:

**What is being done?**

Examples:

* Outreach team verifying pantry hours today.
* Cooling station setup underway.
* Partner coordination started for overnight shelter placements.
* Restroom directory recheck assigned.

### 3.5 Post

A post is human or community communication: report, request, offer, discussion, note, announcement, or lived-context update.

Posts answer:

**What are people saying?**

Examples:

* Community group requests baby food donations this weekend.
* Volunteer offers rides to ID clinic.
* Resident reports broken water access.

### 3.6 Related records across kinds

When something seems to belong to multiple record kinds, create separate related records and link them with `related_record_ids`.

Example:

If a meal service opening reduces food pressure, the system may create:

* A service record for the meal service.
* A signal record saying food pressure is easing.
* A gap record for the after-hours food access issue, if the gap still matters.

These records may share tags such as `food`, `meal_service`, `central_core`, and `today`, but each keeps its own exclusive `record_kind`.

---

## 4. Tags

Tags are the allowed civic vocabulary of Crossover.

AI may only assign tags that exist in the tag registry.

People search and click the same tags that AI uses.

A record can have many tags.

Examples of allowed tags:

* Food
* Meal service
* Pantry
* Groceries
* Hot meal
* Sack lunch
* Baby food
* Safe parking
* ID service
* Storage
* Shelter
* Cooling
* Open now
* No ID required
* Needs recheck
* Tonight
* High
* Verified
* South Stockton

A food gap does not need a separate `domain` field. It has the `food` tag.

A pantry gap may have the tags `food`, `pantry`, `groceries`, `coverage_gap`, `weekend`, `high`, and `south_stockton`.

A signal about St. Mary’s may have the tags `food`, `meal_service`, `open_now`, `partner_update`, `today`, and `central_core`.

A service record for St. Mary’s may have the tags `food`, `meal_service`, `hot_meal`, `free`, `walk_ins_accepted`, `open_now`, and `central_core`.

Same tag language. Different record kind.

---

## 5. Tag Families

Tags are not a flat list.

Each tag belongs to exactly one **family**.

A family tells the system what kind of meaning the tag has and how it should be used.

Starter tag families:

* `support`
* `service_type`
* `availability`
* `access`
* `gap_pattern`
* `severity`
* `urgency`
* `time`
* `trust`
* `work_stage`
* `post_type`
* `area`
* `population_fit`
* `source_type`
* `related`

The family is what lets the app know whether a tag belongs in a filter, a card chip, a detail section, a trust row, a map rule, or a support instruction.

### 5.1 Support family

Support tags describe broad systems of support.

Examples:

* Food
* Water
* Restrooms
* Hygiene
* Shelter
* Safe parking
* Heating
* Cooling
* Health
* Mental health
* Substance-use support
* Charging
* Connectivity
* Storage
* Transportation
* ID service
* Benefits
* Legal
* Housing help
* Safety
* Pets
* Family support
* Accessibility

Note: `family_support` is a support-system tag. It is not the same tag as `families`, which belongs to the population fit family.

### 5.2 Service type family

Service type tags describe the specific kind of support offering.

Examples:

* Meal service
* Pantry
* Grocery distribution
* Hot meal
* Sack lunch
* Baby food
* Cooling center
* Warming center
* Mobile shower
* Laundry
* ID replacement
* Legal clinic
* Benefits enrollment
* Safe parking lot
* Overnight parking
* Storage locker

### 5.3 Availability family

Availability tags describe whether a service is usable now or soon.

Examples:

* Open now
* Opening soon
* Closing soon
* Closed now
* Available
* Limited availability
* Full
* Waitlist
* Temporarily unavailable
* Unknown status

Availability is most important for service records and service-related signals.

For example, selecting `open_now` will usually return service records. It may also return signal records when the signal is specifically about an open service or confirmed availability.

### 5.4 Access family

Access tags describe conditions that affect whether someone can actually use a service.

Examples:

* Free
* Low cost
* Low barrier
* Walk-ins accepted
* Appointment required
* Referral required
* Intake required
* ID required
* No ID required
* First come, first served
* Transit accessible
* Wheelchair accessible
* Pets allowed
* Couples accepted
* Families accepted

Access tags are not the same as availability tags.

A service can be open now and still require a referral.

### 5.5 Gap pattern family

Gap pattern tags describe the kind of infrastructure failure.

Examples:

* Availability gap
* Capacity gap
* Coverage gap
* Time gap
* Access gap
* Mobility gap
* Information gap
* Verification gap
* Safety gap
* Continuity gap
* Coordination gap
* Policy gap

Gap pattern tags mostly apply to gap records and gap-related signals.

### 5.6 Severity family

Severity tags describe how serious a gap, signal, or condition is.

Examples:

* Low
* Moderate
* High
* Critical

Only one severity tag should be primary for a record.

Selecting a tag such as `critical` will usually return gap records and may return signal records when the signal reports a critical current condition.

### 5.7 Urgency family

Urgency tags describe how soon action or attention matters.

Examples:

* Now
* Today
* Tonight
* Next 24 hours
* This week
* Monitor

Urgency is not the same as severity.

A record can be severe but not urgent, or urgent but moderate.

### 5.8 Time family

Time tags describe when the record matters.

Examples:

* Morning
* Afternoon
* Evening
* Overnight
* After hours
* Weekday
* Weekend
* Weather-triggered
* Temporary
* Recurring
* One time

### 5.9 Trust family

Trust tags describe evidence, verification, confidence, and freshness.

Examples:

* Verified
* Partner update
* Source-supported
* Human reported
* Field observation
* Model inferred
* Conflicting
* Stale
* Needs recheck
* Unverified

Trust tags are critical because Crossover must not pretend AI knows more than it knows.

### 5.10 Work stage family

Work stage tags describe the state of work underway.

Examples:

* Planned
* In progress
* Blocked
* Completed
* Paused
* Needs owner
* Verification work
* Delivery
* Setup
* Repair
* Coordination

### 5.11 Post type family

Post type tags describe the kind of post.

Examples:

* Request
* Offer
* Report
* Discussion
* Donation need
* Community note
* Volunteer need

### 5.12 Area family

Area tags describe geography.

Examples:

* Central Core
* Downtown
* South Stockton
* East Corridor
* North Edge
* Citywide

### 5.13 Population fit family

Population fit tags describe who a service, gap, signal, work item, or post may be especially relevant for.

These tags describe service fit or relevance, not identity labels assigned to people.

Examples:

* Families
* Youth
* Seniors
* Veterans
* People with pets
* People in vehicles
* RV residents
* People without ID
* People with disabilities
* Spanish speakers

### 5.14 Source type family

Source type tags describe where a claim came from.

Examples:

* Partner update
* City notice
* Provider website
* Public directory
* Field observation
* Human report
* Manual note
* Model output
* Demo placeholder

### 5.15 Related family

Related tags add helpful context without becoming primary structure.

Examples:

* Hot meal
* To-go meal
* Pantry box
* Hydration station
* Misting station
* Tow risk
* Restroom nearby
* Water nearby
* Hours conflict
* Capacity unknown
* Needs phone call
* Needs field check

A related tag may be filterable, but the system treats it as secondary context.

---

## 6. Tag Registry

The tag registry defines every allowed tag.

Each registry entry defines the tag’s meaning and behavior.

Required fields for each tag:

* `id`
* `label`
* `family`
* `description`
* `applies_to_record_kinds`
* `filterable`
* `show_on_card`
* `show_in_detail`
* `display_priority`

Recommended optional fields:

* `parent_tag_ids`
* `related_tag_ids`
* `suggested_tag_ids`
* `conflicts_with_tag_ids`
* `exclusive_within_family`
* `default_for_record_kinds`
* `filter_group_label`
* `card_priority`
* `map_role`
* `color_role`
* `sort_role`
* `support_instruction_role`

Example registry entries:

* `food`

  * Label: Food
  * Family: support
  * Description: Food access, meals, groceries, pantry support, and related food infrastructure.
  * Applies to: signal, service, gap, work, post
  * Filterable: true
  * Show on card: true
  * Show in detail: true
  * Display priority: 20
  * Related tags: meal_service, pantry, groceries, hot_meal, sack_lunch, baby_food
  * Suggested tags: free, walk_ins_accepted, open_now, needs_recheck

* `family_support`

  * Label: Family support
  * Family: support
  * Description: Broad support infrastructure related to families, caregivers, and children.
  * Applies to: signal, service, gap, work, post
  * Filterable: true
  * Show on card: true
  * Show in detail: true
  * Display priority: 28
  * Related tags: baby_food, families, families_accepted

* `families`

  * Label: Families
  * Family: population_fit
  * Description: The record is especially relevant to families or caregivers.
  * Applies to: signal, service, gap, work, post
  * Filterable: true
  * Show on card: true
  * Show in detail: true
  * Display priority: 60
  * Related tags: family_support, baby_food, families_accepted

* `meal_service`

  * Label: Meal service
  * Family: service_type
  * Description: A service or support pattern involving prepared meals.
  * Applies to: signal, service, gap, work, post
  * Filterable: true
  * Show on card: true
  * Show in detail: true
  * Display priority: 30
  * Parent tags: food
  * Related tags: hot_meal, to_go_meal, sack_lunch, meal_window

* `open_now`

  * Label: Open now
  * Family: availability
  * Description: The service is currently usable, or a signal confirms current availability.
  * Applies to: service, signal
  * Filterable: true
  * Show on card: true
  * Show in detail: true
  * Display priority: 10
  * Exclusive within family: true
  * Conflicts with: closed_now, opening_soon, temporarily_unavailable, full
  * Color role: positive
  * Sort role: service_available_first

* `critical`

  * Label: Critical
  * Family: severity
  * Description: A serious condition or gap requiring urgent attention.
  * Applies to: gap, signal
  * Filterable: true
  * Show on card: true
  * Show in detail: true
  * Display priority: 8
  * Exclusive within family: true
  * Color role: danger
  * Sort role: critical_first

* `time_gap`

  * Label: Time gap
  * Family: gap_pattern
  * Description: Support exists, but not during the time it is needed.
  * Applies to: gap, signal
  * Filterable: true
  * Show on card: true
  * Show in detail: true
  * Display priority: 40

* `needs_recheck`

  * Label: Needs recheck
  * Family: trust
  * Description: The record should be checked again before being relied on.
  * Applies to: signal, service, gap, work, post
  * Filterable: true
  * Show on card: true
  * Show in detail: true
  * Display priority: 50
  * Color role: caution
  * Support instruction role: warn_before_action

---

## 7. Record Shape

A public record must be understandable by reading the JSON.

Required record fields:

* `id`
* `record_kind`
* `title`
* `summary`
* `tag_ids`
* `time`
* `trust`
* `sources`
* `current_relevance`

Recommended optional fields:

* `entity_ids`
* `related_record_ids`
* `location`
* `area_tag_ids`
* `field_confidence`
* `detail_sections`
* `media`
* `support_instruction`
* `render_hints`

Example signal record, described in plain terms:

* ID: `sig_food_pressure_easing_2026_05_04_1200`
* Record kind: `signal`
* Title: Food pressure is easing as meal services open
* Summary: Several verified meal services are now active, reducing near-term food access pressure in the central area.
* Tags: food, meal_service, open_now, today, central_core, source_supported
* Related records: service records for the active meal services, and any related food gap records
* Time: observed at noon, valid during the current meal-service window, expires after the window unless refreshed
* Trust: source-supported, with confidence value
* Sources: partner updates, public directories, or field observations
* Current relevance: currently relevant because active services are changing the near-term food picture

Example service record, described in plain terms:

* ID: `svc_st_marys_meal_service`
* Record kind: `service`
* Title: St. Mary’s meal service
* Summary: Meal service in Central Core with hot meals and to-go options during active service windows.
* Tags: food, meal_service, hot_meal, to_go_meal, free, walk_ins_accepted, low_barrier, open_now, central_core
* Location: St. Mary’s Dining Room, Stockton, CA
* Time: last observed, source checked, valid until, expires at
* Trust: partner update, with confidence value
* Sources: partner update or provider source
* Current relevance: currently relevant because service is open according to source data

Example gap record, described in plain terms:

* ID: `gap_food_after_hours_south_stockton`
* Record kind: `gap`
* Title: Food access drops after 7 PM in south Stockton
* Summary: Known meal and pantry options close before the evening period, leaving few low-barrier food options after 7 PM.
* Tags: food, meal_service, pantry, time_gap, coverage_gap, after_hours, tonight, high, source_supported, south_stockton, needs_recheck
* Time: first seen, last observed, state updated, valid until, expires at
* Trust: source-supported, with confidence value
* Sources: food-hours review, partner directory, or other source records
* Current relevance: currently relevant because the gap matters tonight after known food service windows close

---

## 8. Entities

Entities are durable real-world things.

Examples:

* St. Mary’s Dining Room
* A cooling center
* A safe parking lot
* A public restroom
* A mobile hygiene unit
* A transit route
* A city policy
* A gap area

Entities are optional in this version.

A record may link to one or more entities, but a record can exist without a resolved entity.

This allows AI to generate useful civic records before the system has perfect entity resolution.

Entity fields:

* `id`
* `name`
* `entity_kind`
* `tag_ids`
* `location`
* `source_ids`
* `created_at`
* `last_seen_at`

Allowed entity kinds:

* `organization`
* `service_location`
* `area`
* `route`
* `resource`
* `policy`
* `event_location`
* `unknown`

---

## 9. Observations

Observations describe what AI, a source, a partner, or a human report found during a refresh.

Observations are how the system handles change.

A service does not become a new service because it changes from open now to closed now. A new observation updates the current state.

Observation fields:

* `id`
* `observed_at`
* `source_ids`
* `entity_ids`
* `record_ids`
* `assigned_tag_ids`
* `removed_tag_ids`
* `evidence_note`
* `field_confidence`
* `valid_from`
* `valid_until`
* `expires_at`

Example observation, described in plain terms:

* Observation ID: `obs_st_marys_closed_2026_05_04_1415`
* Observed at: 2:15 PM
* Source: St. Mary’s partner update
* Related record: St. Mary’s meal service
* Assigned tag: closed_now
* Removed tag: open_now
* Evidence note: confirmed service window ended at 2 PM
* Field confidence: availability 0.93, trust 0.96
* Valid from: 2 PM
* Expires at: next service-day refresh unless updated sooner

---

## 10. Time and Freshness

The schema separates different clocks.

Do not use one generic `updated_at` to mean everything.

Allowed time fields:

* `created_at`
* `feed_refreshed_at`
* `observed_at`
* `last_observed_at`
* `state_updated_at`
* `source_published_at`
* `source_checked_at`
* `reported_at`
* `valid_from`
* `valid_until`
* `expires_at`

Meanings:

* `feed_refreshed_at` means the feed or view checked for new data.
* `observed_at` means AI, a source, or a partner observed this claim.
* `state_updated_at` means the meaningful state changed.
* `source_published_at` means the source itself published the information.
* `source_checked_at` means Crossover checked the source.
* `reported_at` means a human or partner report was made.
* `valid_from` and `valid_until` describe when the claim is true in the world.
* `expires_at` describes when the record should stop being shown unless refreshed.

Renderer language should prefer precise words:

* Refreshed
* Checked
* Changed
* Reported
* Observed
* Valid until
* Expires
* Needs recheck

---

## 11. Interface Views and Record Kinds

The schema separates **record kind** from **interface view**.

A record has exactly one `record_kind`.

A view may show all record kinds, one record kind, or a subset of record kinds.

The default public feed should show all currently relevant record kinds unless a view or filter narrows the result set.

The app should not be required to have a one-record-kind-at-a-time mode.

Examples:

* A general feed may show signals, services, gaps, work, and posts together.
* A safe parking view may show safe-parking-related services, gaps, signals, work, and posts together.
* A services-focused view may show only service records.
* A work-in-motion view may show work records and related signals.
* A critical conditions view may show critical gaps and critical signals.

Views are allowed to apply default filters, default sort rules, and presentation choices.

Views do not change the underlying record kind of a record.

---

## 12. Filter Grammar

Filters are generated from the tag registry.

When a user selects a tag, the feed and map filter to records containing that tag.

The default feed may include all record kinds.

The selected tags determine which records remain visible.

If a selected tag only applies to certain record kinds, then only those record kinds will appear.

Examples:

* If the user selects `food`, the app may show food-related signals, services, gaps, work, and posts.
* If the user selects `open_now`, the app will usually show service records because `open_now` primarily applies to services. It may also show signal records when a signal confirms current availability.
* If the user selects `critical`, the app will usually show gap records and may show signal records when a signal describes a critical current condition.
* If the user selects `in_progress`, the app will usually show work records.
* If the user selects `request`, the app will usually show post records.

The app should not need to guess which record kind the user wants.

The tag registry already defines which tags apply to which record kinds.

### 12.1 Filter groups

The renderer may organize filters by tag family.

Common filter groups include:

* Support
* Service type
* Availability
* Access
* Gap pattern
* Severity
* Urgency
* Time
* Trust
* Work stage
* Post type
* Area
* Population fit
* Source type
* Related

The renderer may hide empty filters when no visible records contain those tags.

The renderer may prioritize filter groups based on the current view, selected tags, or visible records.

### 12.2 Record kind filters

`record_kind` may be exposed as a filter if the interface needs it.

However, `record_kind` is not required to behave as the primary app mode.

A record-kind filter may be single-select or multi-select depending on the renderer contract.

The schema only requires that each individual record has exactly one `record_kind`.

---

## 13. Sorting Rules

Sorting should work across all visible records by default.

Some tag sort roles only apply to certain record kinds, but the view still needs a default sort that can compare mixed records.

### 13.1 Default mixed-feed sort

The default mixed feed sort should consider:

1. Current relevance
2. Urgency
3. Severity
4. Availability or actionability
5. Trust/confidence
6. Recency of observation, report, or state change
7. View-specific priorities

This allows signals, services, gaps, work, and posts to appear together in a sensible order.

### 13.2 Tag-specific sort roles

Tags may provide sort roles.

Examples:

* `critical` may sort critical gaps and critical signals higher.
* `open_now` may sort currently available services higher.
* `opening_soon` may sort near-term services higher.
* `in_progress` may sort active work higher.
* `blocked` may sort blocked work higher in a work-focused view.
* `verified` may sort more trusted records higher when trust is important.

A tag’s sort role only applies when relevant to the record kind and view.

A tag should not force unrelated record kinds into a view.

### 13.3 Record-kind-aware sort behavior

When comparing records within the same kind, the renderer may use kind-specific rules.

Signals may sort by current relevance, most recent observed or reported time, urgency, and trust.

Services may sort by open now, opening soon, limited or available, higher trust, and distance or area relevance when available.

Gaps may sort by critical severity, high severity, urgency, confidence, and last observed or state updated.

Work may sort by in progress, blocked, urgent, planned, and recently updated.

Posts may sort by recent, relevant to selected tags, and human/community priority when available.

Kind-specific sorting refines the default sort. It does not require the app to show only one record kind at a time.

---

## 14. Sources

Sources describe where claims came from.

Allowed source fields:

* `id`
* `type_tag_id`
* `title`
* `publisher`
* `summary`
* `url`
* `retrieved_at`
* `published_at`
* `public`

Source type tags may include:

* Partner update
* City notice
* Provider website
* Public directory
* Field observation
* Human report
* Manual note
* Model output
* Demo placeholder

---

## 15. Current Relevance

The public feed is governed by current relevance, not by a default date range.

A record may appear because it matters now, today, tonight, this week, or until a condition expires.

Current relevance fields:

* `is_currently_relevant`
* `reason`
* `last_evaluated_at`
* `expires_at`

A record should not remain visible forever just because it once existed.

Operational records need expiration or recheck logic.

---

## 16. AI Output Rules

AI must use the schema as a controlled grammar.

Rules for AI:

1. Use only allowed tag IDs from the tag registry.
2. Do not invent structured tags during refresh.
3. Assign exactly one `record_kind` to each record.
4. Put classification into `tag_ids` unless a field is explicitly defined elsewhere in the schema.
5. Respect tag conflicts.
6. Use `unknown_status` or `needs_recheck` rather than guessing.
7. Do not present model-inferred information as verified.
8. Include source IDs or a demo/source placeholder.
9. Include confidence for important fields when possible.
10. Preserve uncertainty and conflicts.
11. Link related records when a signal refers to a service, gap, work item, or post.
12. Use expiration and recheck fields for operational records.
13. Do not assume that the app is showing one record kind at a time.
14. Produce records that can appear in mixed feeds unless a view explicitly narrows them.

AI may suggest candidate new tags, but candidate tags are not valid structured tags until added to the registry.

---

## 17. Validation Rules

A valid public record must include:

* `id`
* `record_kind`
* `title`
* `summary`
* `tag_ids`
* `trust`
* `sources`
* `current_relevance`

Every `record_kind` must be one of the allowed record kinds.

Every record must have exactly one `record_kind`.

Every `tag_id` must exist in the tag registry.

Every tag must belong to exactly one family.

A record may not contain mutually conflicting tags unless it also contains a conflict explanation.

A service should normally have one primary availability tag.

A gap should normally have at least one gap pattern tag.

A high or critical gap should normally have an urgency tag.

A record containing `stale`, `needs_recheck`, or `conflicting` should explain why.

A visible public record must have at least one source or a clear demo placeholder.

A record with location coordinates can render as a map marker.

A record without coordinates can still render in the feed.

---

## 18. Top-Level Feed Shape

A Crossover feed payload contains:

* `schema_version`
* `feed_id`
* `city`
* `feed_refreshed_at`
* `view_id`
* `selected_tag_ids`
* `selected_record_kinds`
* `tag_registry`
* `records`
* `entities`
* `observations`
* `sources`

Top-level feed example, described in plain terms:

* Schema version: `crossover-schema-0.2`
* Feed ID: `stockton-ca-public-feed-demo`
* City: Stockton, CA, United States
* Timezone: America/Los_Angeles
* Map center: Stockton coordinates
* Feed refreshed at: latest feed refresh time
* View ID: `general`
* Selected tag IDs: empty by default
* Selected record kinds: empty or all by default
* Tag registry: allowed tags
* Records: public civic records
* Entities: durable real-world things
* Observations: timestamped findings and changes
* Sources: evidence records

`view_id` replaces `active_mode`.

A view is not the same as a record kind.

The default `general` view may show all record kinds.

`selected_record_kinds` is optional. If empty or omitted, the renderer should treat all record kinds as eligible unless the view definition says otherwise.

---

## 19. Views

Views are named ways of looking at the same civic records.

A view may define:

* `view_id`
* `label`
* `description`
* `default_tag_ids`
* `allowed_record_kinds`
* `default_sort`
* `map_behavior`
* `summary_behavior`

Views are optional in this schema version, but the schema allows them.

Example views:

* General
* Top infrastructure gaps
* Safe parking resources
* Shelter capacity
* Food open now
* Work in motion
* Critical conditions
* Needs recheck

A view should be understood as a saved filter and sorting pattern, not as the same thing as a record kind.

---

## 20. What This Schema Does Not Own

This schema does not own:

* React component structure
* CSS
* exact desktop layout
* exact mobile layout
* card dimensions
* visual styling
* animation
* map tile choice
* draggable divider behavior
* persistence
* backend ingestion
* admin tools

Saved views may be supported by the schema, but their editing interface, persistence, and UI behavior belong in the renderer contract or app specification.

---

## 21. Plain-English Summary

Crossover has civic records.

Each record has exactly one record kind:

* Signal
* Service
* Gap
* Work
* Post

Each record also has allowed tags.

Tags belong to families.

Families tell the app what the tags mean.

The schema tells AI which tags it may use.

The schema tells the feed and map which records are visible.

The schema tells cards which tags to display.

The schema tells details how to group tags.

The schema tells filters which tags apply to which records.

The schema tells sorting which records matter most right now.

The interface may show all record kinds by default.

The interface does not need a one-record-kind-at-a-time mode.

If the user selects `open_now`, mostly services appear because `open_now` mostly applies to services.

If the user selects `critical`, mostly gaps and critical signals appear because `critical` applies to those records.

If the user selects `food`, all food-related record kinds may appear.

New tags can be added over time by updating the tag registry.

AI and people use the same tag language.

That is the core of Crossover.



