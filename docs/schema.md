SCHEMA.md (human spec)
Crossover Resources Feed — Data Contract v1

File: resources.json
Purpose: Public, forkable resource feed for rendering map + list + filters.

Top-level fields

schema_version (required): contract version (e.g., "1.0.0")

data_version (required): content revision (e.g., "0.4.0")

last_updated (required): YYYY-MM-DD

jurisdiction (required): { city, state, country }

resources (required): list of resource records

Resource record fields (minimum viable “real”)

Required:

id: stable identifier (stk-...)

name

services[]: array of canonical service ids (strings)

location.address

location.geo.lat + location.geo.lng

schedule (can be null if unknown)

provenance.source_urls[]

provenance.last_verified

Optional:

description

contact.phone, contact.website, contact.email

compatibility, access, eligibility (facets)

notes (human notes, not for logic)

Schedule model (v1)

If hours are known, provide schedule with:

timezone

regular[] blocks with { days[], open, close }

Use open="00:00" and close="24:00" for “24 hours”.

If unknown: schedule: null and optionally keep a human hours_text.

Provenance model (required)

Each record must carry its justification:

source_urls[]: public URLs that support the claim

last_verified: YYYY-MM-DD
Optional:

method: "web" | "phone" | "in_person" | "provider" | "unknown"

confidence: 0..1