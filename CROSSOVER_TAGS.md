# CROSSOVER_TAG_REGISTRY.md

Version: 0.1
Status: starter registry draft
Scope: Approved Crossover tags, grouped by family, with filter/menu/card behavior

---

## Purpose

This registry is the controlled vocabulary for Crossover records.

The schema defines the rule that every record uses approved tags. This registry defines the actual approved tags.

Renderers, AI outputs, filters, cards, details, map markers, and saved views should use these tag records instead of inventing tags.

---

## Registry Rules

Every tag has:

* `id`
* `label`
* `family`
* `description`
* `applies_to_record_kinds`
* `filterable`
* `show_on_card`
* `show_in_detail`
* `display_priority`
* `filter_priority`
* `show_in_filter_default`

Optional fields:

* `parent_tag_ids`
* `related_tag_ids`
* `suggested_tag_ids`
* `conflicts_with_tag_ids`
* `exclusive_within_family`
* `color_role`
* `sort_role`
* `support_instruction_role`
* `map_role`

---

## Left Menu Behavior

The left menu should be generated from this registry.

For each filter family:

1. Include tags where `filterable: true`.
2. Group by `family`.
3. Sort by `filter_priority` ascending.
4. Show selected tags even if they would normally be hidden.
5. Show tags where `show_in_filter_default: true` before the Show more break.
6. Put the rest behind Show more.
7. If a tag has no matching visible records, the renderer may hide it or show it disabled depending on the view.

Default visible counts may be controlled by renderer policy, but this starter registry assumes about five default-visible tags per major family.

---

# Tag Registry

## Support

Support tags describe broad systems of support.

### `food`

* Label: Food
* Family: support
* Description: Food access, meals, groceries, pantry support, and related food infrastructure.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 20
* Filter priority: 10
* Show in filter default: true
* Related tags: meal_service, pantry, grocery_distribution, hot_meal, sack_lunch, baby_food
* Suggested tags: free, walk_ins_accepted, open_now, needs_recheck

### `shelter`

* Label: Shelter
* Family: support
* Description: Overnight shelter, emergency shelter, temporary shelter, intake, capacity, and related shelter infrastructure.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 21
* Filter priority: 20
* Show in filter default: true
* Related tags: capacity_gap, full, waitlist, intake_required, tonight, families_accepted, couples_accepted

### `safe_parking`

* Label: Safe parking
* Family: support
* Description: Parking support for people living in vehicles, including safe lots, overnight parking, rules, access, and enforcement risk.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 22
* Filter priority: 30
* Show in filter default: true
* Related tags: safe_parking_lot, overnight_parking, people_in_vehicles, rv_residents, tow_risk, policy_gap

### `hygiene`

* Label: Hygiene
* Family: support
* Description: Showers, laundry, hygiene supplies, sanitation, and related personal-care infrastructure.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 23
* Filter priority: 40
* Show in filter default: true
* Related tags: mobile_shower, laundry, restrooms, water

### `cooling`

* Label: Cooling
* Family: support
* Description: Cooling centers, shade, heat relief, hydration, misting, and other hot-weather support.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 24
* Filter priority: 50
* Show in filter default: true
* Related tags: cooling_center, weather_triggered, today, hydration_station, misting_station

### `water`

* Label: Water
* Family: support
* Description: Drinking water, hydration access, water distribution, and related water infrastructure.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 25
* Filter priority: 60
* Show in filter default: false
* Related tags: hydration_station, water_nearby, weather_triggered

### `restrooms`

* Label: Restrooms
* Family: support
* Description: Public restroom access, restroom closures, portable toilets, sanitation availability, and restroom-related gaps.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 26
* Filter priority: 70
* Show in filter default: false
* Related tags: restroom_nearby, access_gap, verification_gap

### `heating`

* Label: Heating
* Family: support
* Description: Warming centers, cold-weather support, blankets, winter shelter support, and heat access.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 27
* Filter priority: 80
* Show in filter default: false
* Related tags: warming_center, weather_triggered, overnight, tonight

### `family_support`

* Label: Family support
* Family: support
* Description: Broad support infrastructure related to families, caregivers, children, and household needs.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 28
* Filter priority: 90
* Show in filter default: false
* Related tags: baby_food, families, families_accepted

### `charging`

* Label: Charging
* Family: support
* Description: Phone charging, device charging, battery access, power access, and related energy support.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 29
* Filter priority: 100
* Show in filter default: false
* Related tags: connectivity, open_now, capacity_gap

### `transportation`

* Label: Transportation
* Family: support
* Description: Transit, rides, shuttles, route access, mobility support, and transportation barriers.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 30
* Filter priority: 110
* Show in filter default: false
* Related tags: transit_accessible, mobility_gap

### `health`

* Label: Health
* Family: support
* Description: Medical services, clinics, health access, urgent health support, and related public health infrastructure.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 31
* Filter priority: 120
* Show in filter default: false
* Related tags: appointment_required, referral_required, low_barrier

### `mental_health`

* Label: Mental health
* Family: support
* Description: Mental-health support, crisis response, counseling, behavioral-health services, and related support infrastructure.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 32
* Filter priority: 130
* Show in filter default: false
* Related tags: referral_required, appointment_required, low_barrier

### `substance_use_support`

* Label: Substance-use support
* Family: support
* Description: Harm reduction, recovery support, treatment access, outreach, and substance-use related services or gaps.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 33
* Filter priority: 140
* Show in filter default: false
* Related tags: outreach, referral_required, low_barrier

### `connectivity`

* Label: Connectivity
* Family: support
* Description: Internet access, Wi-Fi, phones, communication access, and related connectivity infrastructure.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 34
* Filter priority: 150
* Show in filter default: false
* Related tags: charging, access_gap

### `storage`

* Label: Storage
* Family: support
* Description: Belongings storage, storage lockers, safe storage access, and related storage gaps.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 35
* Filter priority: 160
* Show in filter default: false
* Related tags: storage_locker, access_gap

### `id_service`

* Label: ID service
* Family: support
* Description: Identification replacement, documents, paperwork support, and ID-related access help.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 36
* Filter priority: 170
* Show in filter default: false
* Related tags: id_replacement, legal_clinic, benefits_enrollment, people_without_id

### `benefits`

* Label: Benefits
* Family: support
* Description: Enrollment or support for public benefits, assistance programs, and benefit access.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 37
* Filter priority: 180
* Show in filter default: false
* Related tags: benefits_enrollment, appointment_required, low_barrier

### `legal`

* Label: Legal
* Family: support
* Description: Legal aid, legal clinics, rights support, documentation, and related legal-access infrastructure.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 38
* Filter priority: 190
* Show in filter default: false
* Related tags: legal_clinic, appointment_required, referral_required

### `housing_help`

* Label: Housing help
* Family: support
* Description: Housing navigation, housing application help, placement support, and housing-related assistance.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 39
* Filter priority: 200
* Show in filter default: false
* Related tags: appointment_required, referral_required, intake_required

### `safety`

* Label: Safety
* Family: support
* Description: Safety concerns, safe locations, violence risk, environmental safety, and immediate personal safety issues.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 40
* Filter priority: 210
* Show in filter default: false
* Related tags: safety_gap, critical, now

### `pets`

* Label: Pets
* Family: support
* Description: Pet-related access, pet-friendly services, animal support, and service barriers related to pets.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 41
* Filter priority: 220
* Show in filter default: false
* Related tags: pets_allowed, people_with_pets

### `accessibility`

* Label: Accessibility
* Family: support
* Description: Disability access, accessible locations, mobility support, and accessibility barriers.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 42
* Filter priority: 230
* Show in filter default: false
* Related tags: wheelchair_accessible, people_with_disabilities

---

## Service Type

Service type tags describe the specific kind of support offering.

### `meal_service`

* Label: Meal service
* Family: service_type
* Description: A service or support pattern involving prepared meals.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 30
* Filter priority: 10
* Show in filter default: true
* Parent tags: food
* Related tags: hot_meal, to_go_meal, sack_lunch

### `pantry`

* Label: Pantry
* Family: service_type
* Description: Pantry access, pantry pickup, and pantry-based food distribution.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 31
* Filter priority: 20
* Show in filter default: true
* Parent tags: food
* Related tags: groceries, pantry_box

### `grocery_distribution`

* Label: Grocery distribution
* Family: service_type
* Description: Grocery boxes, food distribution events, and take-home food supplies.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 32
* Filter priority: 30
* Show in filter default: true
* Parent tags: food
* Related tags: groceries, pantry_box

### `cooling_center`

* Label: Cooling center
* Family: service_type
* Description: A place opened for cooling, heat relief, and hot-weather refuge.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 33
* Filter priority: 40
* Show in filter default: true
* Parent tags: cooling
* Related tags: weather_triggered, hydration_station

### `safe_parking_lot`

* Label: Safe parking lot
* Family: service_type
* Description: A specific lot or program offering safer parking access.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 34
* Filter priority: 50
* Show in filter default: true
* Parent tags: safe_parking
* Related tags: overnight_parking, people_in_vehicles

### `warming_center`

* Label: Warming center
* Family: service_type
* Description: A place opened for cold-weather refuge and warming support.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 35
* Filter priority: 60
* Show in filter default: false
* Parent tags: heating
* Related tags: weather_triggered, overnight

### `mobile_shower`

* Label: Mobile shower
* Family: service_type
* Description: Mobile shower service, shower truck, or temporary shower access.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 36
* Filter priority: 70
* Show in filter default: false
* Parent tags: hygiene

### `laundry`

* Label: Laundry
* Family: service_type
* Description: Laundry service, laundry access, or clothes-washing support.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 37
* Filter priority: 80
* Show in filter default: false
* Parent tags: hygiene

### `id_replacement`

* Label: ID replacement
* Family: service_type
* Description: Help replacing or obtaining identification documents.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 38
* Filter priority: 90
* Show in filter default: false
* Parent tags: id_service

### `legal_clinic`

* Label: Legal clinic
* Family: service_type
* Description: Legal clinic, legal aid session, or scheduled legal support.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 39
* Filter priority: 100
* Show in filter default: false
* Parent tags: legal

### `benefits_enrollment`

* Label: Benefits enrollment
* Family: service_type
* Description: Enrollment help for public benefits or assistance programs.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 40
* Filter priority: 110
* Show in filter default: false
* Parent tags: benefits

### `overnight_parking`

* Label: Overnight parking
* Family: service_type
* Description: Parking support specifically available overnight.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 41
* Filter priority: 120
* Show in filter default: false
* Parent tags: safe_parking

### `storage_locker`

* Label: Storage locker
* Family: service_type
* Description: Locker or secure storage offering for belongings.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 42
* Filter priority: 130
* Show in filter default: false
* Parent tags: storage

---

## Availability

Availability tags describe whether a service is usable now or soon.

### `open_now`

* Label: Open now
* Family: availability
* Description: The service is currently usable, or a signal confirms current availability.
* Applies to record kinds: service, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 10
* Filter priority: 10
* Show in filter default: true
* Exclusive within family: true
* Conflicts with: closed_now, opening_soon, temporarily_unavailable, full
* Color role: positive
* Sort role: service_available_first

### `opening_soon`

* Label: Opening soon
* Family: availability
* Description: The service is expected to become usable soon.
* Applies to record kinds: service, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 11
* Filter priority: 20
* Show in filter default: true
* Exclusive within family: true
* Conflicts with: open_now, closed_now, temporarily_unavailable, full
* Color role: positive
* Sort role: opening_soon_first

### `limited_availability`

* Label: Limited availability
* Family: availability
* Description: The service exists but access is limited by capacity, supply, time, staffing, or other constraints.
* Applies to record kinds: service, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 12
* Filter priority: 30
* Show in filter default: true
* Exclusive within family: true
* Color role: caution
* Sort role: limited_availability_first

### `full`

* Label: Full
* Family: availability
* Description: The service or resource is at capacity.
* Applies to record kinds: service, signal, gap
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 13
* Filter priority: 40
* Show in filter default: true
* Exclusive within family: true
* Conflicts with: open_now, available
* Color role: danger
* Sort role: capacity_problem_first

### `waitlist`

* Label: Waitlist
* Family: availability
* Description: Access requires joining or checking a waitlist.
* Applies to record kinds: service, signal, gap
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 14
* Filter priority: 50
* Show in filter default: true
* Color role: caution

### `closing_soon`

* Label: Closing soon
* Family: availability
* Description: The service is currently usable but expected to close soon.
* Applies to record kinds: service, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 15
* Filter priority: 60
* Show in filter default: false
* Exclusive within family: true
* Color role: caution

### `closed_now`

* Label: Closed now
* Family: availability
* Description: The service is not currently usable because its service window is closed.
* Applies to record kinds: service, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 16
* Filter priority: 70
* Show in filter default: false
* Exclusive within family: true
* Conflicts with: open_now, opening_soon
* Color role: muted

### `available`

* Label: Available
* Family: availability
* Description: The service, resource, slot, or support appears available, but not necessarily open right now.
* Applies to record kinds: service, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 17
* Filter priority: 80
* Show in filter default: false
* Color role: positive

### `temporarily_unavailable`

* Label: Temporarily unavailable
* Family: availability
* Description: The service exists but is temporarily unavailable.
* Applies to record kinds: service, signal, gap
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 18
* Filter priority: 90
* Show in filter default: false
* Exclusive within family: true
* Conflicts with: open_now, available, opening_soon
* Color role: danger

### `unknown_status`

* Label: Unknown status
* Family: availability
* Description: Current availability is unknown or cannot be verified.
* Applies to record kinds: service, signal, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 19
* Filter priority: 100
* Show in filter default: false
* Color role: muted
* Support instruction role: warn_before_action

---

## Access

Access tags describe conditions that affect whether someone can actually use a service.

### `free`

* Label: Free
* Family: access
* Description: The service is free to use.
* Applies to record kinds: service, signal, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 40
* Filter priority: 10
* Show in filter default: true

### `low_barrier`

* Label: Low barrier
* Family: access
* Description: The service has fewer access restrictions than typical services.
* Applies to record kinds: service, signal, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 41
* Filter priority: 20
* Show in filter default: true

### `walk_ins_accepted`

* Label: Walk-ins accepted
* Family: access
* Description: People may use the service without making an appointment first.
* Applies to record kinds: service, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 42
* Filter priority: 30
* Show in filter default: true

### `no_id_required`

* Label: No ID required
* Family: access
* Description: Identification is not required for access.
* Applies to record kinds: service, signal, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 43
* Filter priority: 40
* Show in filter default: true

### `transit_accessible`

* Label: Transit accessible
* Family: access
* Description: The service is reachable by transit or is located near usable transit.
* Applies to record kinds: service, signal, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 44
* Filter priority: 50
* Show in filter default: true

### `low_cost`

* Label: Low cost
* Family: access
* Description: The service has a cost but is relatively low-cost.
* Applies to record kinds: service, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 45
* Filter priority: 60
* Show in filter default: false

### `appointment_required`

* Label: Appointment required
* Family: access
* Description: An appointment is required to use the service.
* Applies to record kinds: service, signal, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 46
* Filter priority: 70
* Show in filter default: false

### `referral_required`

* Label: Referral required
* Family: access
* Description: A referral is required to use the service.
* Applies to record kinds: service, signal, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 47
* Filter priority: 80
* Show in filter default: false

### `intake_required`

* Label: Intake required
* Family: access
* Description: People must complete intake before using the service.
* Applies to record kinds: service, signal, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 48
* Filter priority: 90
* Show in filter default: false

### `id_required`

* Label: ID required
* Family: access
* Description: Identification is required to use the service.
* Applies to record kinds: service, signal, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 49
* Filter priority: 100
* Show in filter default: false
* Conflicts with: no_id_required

### `first_come_first_served`

* Label: First come, first served
* Family: access
* Description: Access is provided in order of arrival until capacity is reached.
* Applies to record kinds: service, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 50
* Filter priority: 110
* Show in filter default: false

### `wheelchair_accessible`

* Label: Wheelchair accessible
* Family: access
* Description: The service or location is wheelchair accessible.
* Applies to record kinds: service, signal, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 51
* Filter priority: 120
* Show in filter default: false

### `pets_allowed`

* Label: Pets allowed
* Family: access
* Description: Pets are allowed or accommodated.
* Applies to record kinds: service, signal, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 52
* Filter priority: 130
* Show in filter default: false

### `couples_accepted`

* Label: Couples accepted
* Family: access
* Description: Couples may use the service together or are accommodated.
* Applies to record kinds: service, signal, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 53
* Filter priority: 140
* Show in filter default: false

### `families_accepted`

* Label: Families accepted
* Family: access
* Description: Families or caregivers with children may use the service together or are accommodated.
* Applies to record kinds: service, signal, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 54
* Filter priority: 150
* Show in filter default: false

---

## Gap Pattern

Gap pattern tags describe the kind of infrastructure failure.

### `availability_gap`

* Label: Availability gap
* Family: gap_pattern
* Description: Support exists somewhere, but not enough is available when needed.
* Applies to record kinds: gap, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 40
* Filter priority: 10
* Show in filter default: true

### `capacity_gap`

* Label: Capacity gap
* Family: gap_pattern
* Description: Demand appears to exceed available capacity.
* Applies to record kinds: gap, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 41
* Filter priority: 20
* Show in filter default: true

### `coverage_gap`

* Label: Coverage gap
* Family: gap_pattern
* Description: Support is missing or thin in a geographic area or for a relevant population.
* Applies to record kinds: gap, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 42
* Filter priority: 30
* Show in filter default: true

### `time_gap`

* Label: Time gap
* Family: gap_pattern
* Description: Support exists, but not during the time it is needed.
* Applies to record kinds: gap, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 43
* Filter priority: 40
* Show in filter default: true

### `access_gap`

* Label: Access gap
* Family: gap_pattern
* Description: Support exists, but access requirements, location, cost, eligibility, or other barriers prevent practical use.
* Applies to record kinds: gap, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 44
* Filter priority: 50
* Show in filter default: true

### `mobility_gap`

* Label: Mobility gap
* Family: gap_pattern
* Description: People cannot practically reach support because of transportation, distance, route, or mobility barriers.
* Applies to record kinds: gap, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 45
* Filter priority: 60
* Show in filter default: false

### `information_gap`

* Label: Information gap
* Family: gap_pattern
* Description: Needed information is missing, confusing, conflicting, stale, or hard to find.
* Applies to record kinds: gap, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 46
* Filter priority: 70
* Show in filter default: false

### `verification_gap`

* Label: Verification gap
* Family: gap_pattern
* Description: A record, service, or claim needs verification before people should rely on it.
* Applies to record kinds: gap, signal, work
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 47
* Filter priority: 80
* Show in filter default: false
* Related tags: needs_recheck, verification_work

### `safety_gap`

* Label: Safety gap
* Family: gap_pattern
* Description: A condition creates or reflects a personal safety, environmental safety, or access safety issue.
* Applies to record kinds: gap, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 48
* Filter priority: 90
* Show in filter default: false

### `continuity_gap`

* Label: Continuity gap
* Family: gap_pattern
* Description: Support is interrupted, inconsistent, short-lived, or not continuous enough to meet the need.
* Applies to record kinds: gap, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 49
* Filter priority: 100
* Show in filter default: false

### `coordination_gap`

* Label: Coordination gap
* Family: gap_pattern
* Description: Support efforts exist but are poorly coordinated or not aligned across providers, teams, or systems.
* Applies to record kinds: gap, signal, work
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 50
* Filter priority: 110
* Show in filter default: false

### `policy_gap`

* Label: Policy gap
* Family: gap_pattern
* Description: Policy, rules, enforcement, eligibility, or legal constraints are creating or worsening a support gap.
* Applies to record kinds: gap, signal, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 51
* Filter priority: 120
* Show in filter default: false

---

## Severity

Severity tags describe how serious a gap, signal, or condition is.

### `critical`

* Label: Critical
* Family: severity
* Description: A serious condition or gap requiring urgent attention.
* Applies to record kinds: gap, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 8
* Filter priority: 10
* Show in filter default: true
* Exclusive within family: true
* Color role: danger
* Sort role: critical_first

### `high`

* Label: High
* Family: severity
* Description: A high-severity condition or gap that should be prioritized.
* Applies to record kinds: gap, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 9
* Filter priority: 20
* Show in filter default: true
* Exclusive within family: true
* Color role: danger
* Sort role: high_first

### `moderate`

* Label: Moderate
* Family: severity
* Description: A meaningful condition or gap, but not currently high or critical.
* Applies to record kinds: gap, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 10
* Filter priority: 30
* Show in filter default: true
* Exclusive within family: true
* Color role: caution

### `low`

* Label: Low
* Family: severity
* Description: A low-severity condition or gap.
* Applies to record kinds: gap, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 11
* Filter priority: 40
* Show in filter default: true
* Exclusive within family: true
* Color role: muted

---

## Urgency

Urgency tags describe how soon action or attention matters.

### `now`

* Label: Now
* Family: urgency
* Description: The issue matters immediately.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 20
* Filter priority: 10
* Show in filter default: true
* Color role: danger
* Sort role: urgent_first

### `today`

* Label: Today
* Family: urgency
* Description: The issue matters today.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 21
* Filter priority: 20
* Show in filter default: true
* Sort role: today_first

### `tonight`

* Label: Tonight
* Family: urgency
* Description: The issue matters tonight or during the evening/overnight period.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 22
* Filter priority: 30
* Show in filter default: true
* Sort role: tonight_first

### `next_24_hours`

* Label: Next 24 hours
* Family: urgency
* Description: The issue matters within the next day.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 23
* Filter priority: 40
* Show in filter default: true

### `this_week`

* Label: This week
* Family: urgency
* Description: The issue matters during the current week.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 24
* Filter priority: 50
* Show in filter default: true

### `monitor`

* Label: Monitor
* Family: urgency
* Description: The issue should be watched, but may not require immediate action.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 25
* Filter priority: 60
* Show in filter default: false
* Color role: caution

---

## Time

Time tags describe when the record matters.

### `morning`

* Label: Morning
* Family: time
* Description: The record matters during the morning period.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 60
* Filter priority: 10
* Show in filter default: true

### `afternoon`

* Label: Afternoon
* Family: time
* Description: The record matters during the afternoon period.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 61
* Filter priority: 20
* Show in filter default: true

### `evening`

* Label: Evening
* Family: time
* Description: The record matters during the evening period.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 62
* Filter priority: 30
* Show in filter default: true

### `overnight`

* Label: Overnight
* Family: time
* Description: The record matters overnight.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 63
* Filter priority: 40
* Show in filter default: true

### `after_hours`

* Label: After hours
* Family: time
* Description: The record matters outside common daytime service hours.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 64
* Filter priority: 50
* Show in filter default: true

### `weekday`

* Label: Weekday
* Family: time
* Description: The record matters on weekdays.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 65
* Filter priority: 60
* Show in filter default: false

### `weekend`

* Label: Weekend
* Family: time
* Description: The record matters on weekends.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 66
* Filter priority: 70
* Show in filter default: false

### `weather_triggered`

* Label: Weather-triggered
* Family: time
* Description: The record becomes relevant because of weather conditions.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 67
* Filter priority: 80
* Show in filter default: false

### `temporary`

* Label: Temporary
* Family: time
* Description: The service, condition, or record is temporary.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 68
* Filter priority: 90
* Show in filter default: false

### `recurring`

* Label: Recurring
* Family: time
* Description: The service, condition, or event recurs.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 69
* Filter priority: 100
* Show in filter default: false

### `one_time`

* Label: One time
* Family: time
* Description: The service, event, condition, or post applies once.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 70
* Filter priority: 110
* Show in filter default: false

---

## Trust

Trust tags describe evidence, verification, confidence, and freshness.

### `verified`

* Label: Verified
* Family: trust
* Description: Crossover has verified the record through a trusted source, partner update, field observation, or other verification process.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 10
* Filter priority: 10
* Show in filter default: true
* Color role: trust
* Sort role: verified_first

### `needs_recheck`

* Label: Needs recheck
* Family: trust
* Description: The record should be checked again before being relied on.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 50
* Filter priority: 20
* Show in filter default: true
* Color role: caution
* Support instruction role: warn_before_action

### `source_supported`

* Label: Source-supported
* Family: trust
* Description: The record is supported by at least one source, but may not be fully verified.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 51
* Filter priority: 30
* Show in filter default: true

### `partner_update`

* Label: Partner update
* Family: trust
* Description: The record is based on an update from a partner or provider.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 52
* Filter priority: 40
* Show in filter default: true

### `human_reported`

* Label: Human reported
* Family: trust
* Description: The record is based on a human or community report.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 53
* Filter priority: 50
* Show in filter default: true

### `field_observation`

* Label: Field observation
* Family: trust
* Description: The record is based on a field observation.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 54
* Filter priority: 60
* Show in filter default: false

### `model_inferred`

* Label: Model inferred
* Family: trust
* Description: The record is based on AI inference and must not be presented as verified.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 55
* Filter priority: 70
* Show in filter default: false
* Support instruction role: warn_before_action

### `conflicting`

* Label: Conflicting
* Family: trust
* Description: Sources or observations conflict.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 56
* Filter priority: 80
* Show in filter default: false
* Color role: caution
* Support instruction role: warn_before_action

### `stale`

* Label: Stale
* Family: trust
* Description: The record may be out of date.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 57
* Filter priority: 90
* Show in filter default: false
* Color role: caution
* Support instruction role: warn_before_action

### `unverified`

* Label: Unverified
* Family: trust
* Description: The record has not been verified.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 58
* Filter priority: 100
* Show in filter default: false
* Support instruction role: warn_before_action

---

## Work Stage

Work stage tags describe the state of work underway.

### `in_progress`

* Label: In progress
* Family: work_stage
* Description: Work is actively underway.
* Applies to record kinds: work, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 20
* Filter priority: 10
* Show in filter default: true
* Sort role: active_work_first

### `planned`

* Label: Planned
* Family: work_stage
* Description: Work is planned but not yet underway.
* Applies to record kinds: work, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 21
* Filter priority: 20
* Show in filter default: true

### `blocked`

* Label: Blocked
* Family: work_stage
* Description: Work is blocked by a dependency, missing information, lack of owner, constraint, or unresolved decision.
* Applies to record kinds: work, signal, gap
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 22
* Filter priority: 30
* Show in filter default: true
* Color role: caution
* Sort role: blocked_work_first

### `needs_owner`

* Label: Needs owner
* Family: work_stage
* Description: Work exists but needs an owner or responsible party.
* Applies to record kinds: work, signal, gap
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 23
* Filter priority: 40
* Show in filter default: true
* Color role: caution

### `completed`

* Label: Completed
* Family: work_stage
* Description: Work has been completed.
* Applies to record kinds: work, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 24
* Filter priority: 50
* Show in filter default: true
* Color role: positive

### `paused`

* Label: Paused
* Family: work_stage
* Description: Work is paused.
* Applies to record kinds: work, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 25
* Filter priority: 60
* Show in filter default: false

### `verification_work`

* Label: Verification work
* Family: work_stage
* Description: Work is focused on checking, confirming, calling, visiting, or otherwise verifying a record or condition.
* Applies to record kinds: work, signal, gap
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 26
* Filter priority: 70
* Show in filter default: false
* Related tags: needs_recheck, verification_gap

### `delivery`

* Label: Delivery
* Family: work_stage
* Description: Work involves delivering supplies, support, resources, or services.
* Applies to record kinds: work, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 27
* Filter priority: 80
* Show in filter default: false

### `setup`

* Label: Setup
* Family: work_stage
* Description: Work involves setting up a location, service, station, event, or support operation.
* Applies to record kinds: work, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 28
* Filter priority: 90
* Show in filter default: false

### `repair`

* Label: Repair
* Family: work_stage
* Description: Work involves repair, restoration, or fixing a broken support condition.
* Applies to record kinds: work, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 29
* Filter priority: 100
* Show in filter default: false

### `coordination`

* Label: Coordination
* Family: work_stage
* Description: Work involves coordinating partners, teams, providers, volunteers, or systems.
* Applies to record kinds: work, signal
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 30
* Filter priority: 110
* Show in filter default: false

---

## Post Type

Post type tags describe the kind of post.

### `request`

* Label: Request
* Family: post_type
* Description: A person or group is requesting help, resources, information, or action.
* Applies to record kinds: post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 20
* Filter priority: 10
* Show in filter default: true

### `offer`

* Label: Offer
* Family: post_type
* Description: A person or group is offering help, resources, rides, supplies, labor, or information.
* Applies to record kinds: post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 21
* Filter priority: 20
* Show in filter default: true

### `report`

* Label: Report
* Family: post_type
* Description: A person or group is reporting a condition, change, concern, or observation.
* Applies to record kinds: post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 22
* Filter priority: 30
* Show in filter default: true

### `discussion`

* Label: Discussion
* Family: post_type
* Description: A discussion or exchange about a civic need, service, gap, work item, or condition.
* Applies to record kinds: post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 23
* Filter priority: 40
* Show in filter default: true

### `donation_need`

* Label: Donation need
* Family: post_type
* Description: A need for donated supplies, funds, goods, or other resources.
* Applies to record kinds: post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 24
* Filter priority: 50
* Show in filter default: true

### `community_note`

* Label: Community note
* Family: post_type
* Description: A contextual note from the community that may help explain local conditions, needs, or services.
* Applies to record kinds: post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 25
* Filter priority: 60
* Show in filter default: false

### `volunteer_need`

* Label: Volunteer need
* Family: post_type
* Description: A need for volunteers, volunteer labor, volunteer coordination, or volunteer support.
* Applies to record kinds: post, work
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 26
* Filter priority: 70
* Show in filter default: false

---

## Area

Area tags describe geography.

### `citywide`

* Label: Citywide
* Family: area
* Description: The record applies citywide.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 70
* Filter priority: 10
* Show in filter default: true

### `central_core`

* Label: Central Core
* Family: area
* Description: The record applies to the Central Core area.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 71
* Filter priority: 20
* Show in filter default: true

### `downtown`

* Label: Downtown
* Family: area
* Description: The record applies to Downtown.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 72
* Filter priority: 30
* Show in filter default: true

### `south_stockton`

* Label: South Stockton
* Family: area
* Description: The record applies to South Stockton.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 73
* Filter priority: 40
* Show in filter default: true

### `east_corridor`

* Label: East Corridor
* Family: area
* Description: The record applies to the East Corridor.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 74
* Filter priority: 50
* Show in filter default: true

### `north_edge`

* Label: North Edge
* Family: area
* Description: The record applies to the North Edge.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 75
* Filter priority: 60
* Show in filter default: false

---

## Population Fit

Population fit tags describe who a service, gap, signal, work item, or post may be especially relevant for.

### `families`

* Label: Families
* Family: population_fit
* Description: The record is especially relevant to families or caregivers.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 60
* Filter priority: 10
* Show in filter default: true
* Related tags: family_support, baby_food, families_accepted

### `people_in_vehicles`

* Label: People in vehicles
* Family: population_fit
* Description: The record is especially relevant to people living in or relying on vehicles.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 61
* Filter priority: 20
* Show in filter default: true
* Related tags: safe_parking, overnight_parking, safe_parking_lot

### `people_without_id`

* Label: People without ID
* Family: population_fit
* Description: The record is especially relevant to people who do not have identification.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 62
* Filter priority: 30
* Show in filter default: true
* Related tags: no_id_required, id_required, id_service, id_replacement

### `people_with_pets`

* Label: People with pets
* Family: population_fit
* Description: The record is especially relevant to people with pets.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 63
* Filter priority: 40
* Show in filter default: true
* Related tags: pets, pets_allowed

### `people_with_disabilities`

* Label: People with disabilities
* Family: population_fit
* Description: The record is especially relevant to people with disabilities or accessibility needs.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 64
* Filter priority: 50
* Show in filter default: true
* Related tags: accessibility, wheelchair_accessible

### `youth`

* Label: Youth
* Family: population_fit
* Description: The record is especially relevant to youth.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 65
* Filter priority: 60
* Show in filter default: false

### `seniors`

* Label: Seniors
* Family: population_fit
* Description: The record is especially relevant to seniors.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 66
* Filter priority: 70
* Show in filter default: false

### `veterans`

* Label: Veterans
* Family: population_fit
* Description: The record is especially relevant to veterans.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 67
* Filter priority: 80
* Show in filter default: false

### `rv_residents`

* Label: RV residents
* Family: population_fit
* Description: The record is especially relevant to people living in or relying on RVs.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 68
* Filter priority: 90
* Show in filter default: false
* Related tags: safe_parking, overnight_parking, tow_risk

### `spanish_speakers`

* Label: Spanish speakers
* Family: population_fit
* Description: The record is especially relevant to Spanish speakers or includes Spanish-language access.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 69
* Filter priority: 100
* Show in filter default: false

---

## Source Type

Source type tags describe where a claim came from.

### `partner_update_source`

* Label: Partner update
* Family: source_type
* Description: The source is a partner or provider update.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: false
* Show in detail: true
* Display priority: 80
* Filter priority: 10
* Show in filter default: true

### `city_notice`

* Label: City notice
* Family: source_type
* Description: The source is a city notice or city-published information.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: false
* Show in detail: true
* Display priority: 81
* Filter priority: 20
* Show in filter default: true

### `provider_website`

* Label: Provider website
* Family: source_type
* Description: The source is a provider website.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: false
* Show in detail: true
* Display priority: 82
* Filter priority: 30
* Show in filter default: true

### `public_directory`

* Label: Public directory
* Family: source_type
* Description: The source is a public directory.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: false
* Show in detail: true
* Display priority: 83
* Filter priority: 40
* Show in filter default: true

### `field_observation_source`

* Label: Field observation
* Family: source_type
* Description: The source is a field observation.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: false
* Show in detail: true
* Display priority: 84
* Filter priority: 50
* Show in filter default: true

### `human_report_source`

* Label: Human report
* Family: source_type
* Description: The source is a human report.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: false
* Show in detail: true
* Display priority: 85
* Filter priority: 60
* Show in filter default: false

### `manual_note`

* Label: Manual note
* Family: source_type
* Description: The source is a manual note entered by a trusted operator or contributor.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: false
* Show in detail: true
* Display priority: 86
* Filter priority: 70
* Show in filter default: false

### `model_output_source`

* Label: Model output
* Family: source_type
* Description: The source is model output and should not be treated as verified by itself.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: false
* Show in detail: true
* Display priority: 87
* Filter priority: 80
* Show in filter default: false
* Support instruction role: warn_before_action

### `demo_placeholder`

* Label: Demo placeholder
* Family: source_type
* Description: The source is a placeholder used for demos or prototypes.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: false
* Show in detail: true
* Display priority: 88
* Filter priority: 90
* Show in filter default: false
* Support instruction role: warn_before_action

---

## Related

Related tags add helpful context without becoming primary structure.

### `hot_meal`

* Label: Hot meal
* Family: related
* Description: The record involves hot meals.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 90
* Filter priority: 10
* Show in filter default: true
* Parent tags: food, meal_service

### `to_go_meal`

* Label: To-go meal
* Family: related
* Description: The record involves meals available to go.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 91
* Filter priority: 20
* Show in filter default: true
* Parent tags: food, meal_service

### `sack_lunch`

* Label: Sack lunch
* Family: related
* Description: The record involves sack lunches.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 92
* Filter priority: 30
* Show in filter default: true
* Parent tags: food, meal_service

### `groceries`

* Label: Groceries
* Family: related
* Description: The record involves groceries or take-home food.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 93
* Filter priority: 40
* Show in filter default: true
* Parent tags: food

### `baby_food`

* Label: Baby food
* Family: related
* Description: The record involves baby food, formula, or infant food support.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 94
* Filter priority: 50
* Show in filter default: true
* Parent tags: food, family_support

### `pantry_box`

* Label: Pantry box
* Family: related
* Description: The record involves a pantry box or boxed food distribution.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 95
* Filter priority: 60
* Show in filter default: false
* Parent tags: food, pantry

### `hydration_station`

* Label: Hydration station
* Family: related
* Description: The record involves drinking water or hydration access at a station or location.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 96
* Filter priority: 70
* Show in filter default: false
* Parent tags: water, cooling

### `misting_station`

* Label: Misting station
* Family: related
* Description: The record involves misting or spray-based heat relief.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 97
* Filter priority: 80
* Show in filter default: false
* Parent tags: cooling

### `tow_risk`

* Label: Tow risk
* Family: related
* Description: The record involves possible towing, enforcement, or vehicle displacement risk.
* Applies to record kinds: signal, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 98
* Filter priority: 90
* Show in filter default: false
* Parent tags: safe_parking, safety

### `restroom_nearby`

* Label: Restroom nearby
* Family: related
* Description: A restroom appears nearby or is relevant to the record.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 99
* Filter priority: 100
* Show in filter default: false
* Parent tags: restrooms

### `water_nearby`

* Label: Water nearby
* Family: related
* Description: Drinking water appears nearby or is relevant to the record.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 100
* Filter priority: 110
* Show in filter default: false
* Parent tags: water

### `hours_conflict`

* Label: Hours conflict
* Family: related
* Description: Available hours conflict across sources or need clarification.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 101
* Filter priority: 120
* Show in filter default: false
* Related tags: conflicting, needs_recheck

### `capacity_unknown`

* Label: Capacity unknown
* Family: related
* Description: Capacity is unknown or unconfirmed.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 102
* Filter priority: 130
* Show in filter default: false
* Related tags: unknown_status, needs_recheck

### `needs_phone_call`

* Label: Needs phone call
* Family: related
* Description: A phone call is likely needed to verify or clarify the record.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 103
* Filter priority: 140
* Show in filter default: false
* Related tags: needs_recheck, verification_work

### `needs_field_check`

* Label: Needs field check
* Family: related
* Description: A field check is likely needed to verify or clarify the record.
* Applies to record kinds: signal, service, gap, work, post
* Filterable: true
* Show on card: true
* Show in detail: true
* Display priority: 104
* Filter priority: 150
* Show in filter default: false
* Related tags: needs_recheck, verification_work
