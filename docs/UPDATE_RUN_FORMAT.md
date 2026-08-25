# Crossover Update Run Format

This document defines the standard output for an AI-assisted Crossover update run.

The purpose of an update run is not to generate content for its own sake. It is to determine whether the public picture of local reality should change.

Every run should make it easy for a human reviewer to answer:

**What changed?**
**What evidence supports it?**
**What should Crossover change, if anything?**
**What requires human judgment?**

---

# 1. Update Run Header

Every run begins with a short summary.

Example:

```text
Crossover Update Run
Date: Aug. 24, 2026

Organizations checked: 3
Sources checked: 8

New observations: 3
Existing records refreshed: 2
Possible editorial changes: 1
Judgment changes requiring approval: 0
Stale or unverified items: 2
```

The summary should describe what the scan actually found.

Do not manufacture changes simply because an update run occurred.

---

# 2. New Evidence

List meaningful new observations discovered during the run.

For each observation include:

### Title

A short factual description of what happened.

**Source:** Organization or publisher
**Published:** Date, when available
**Checked:** Date checked by Crossover
**Related to:** Relevant gap, organization, action, or story
**Confidence:** High / Medium / Low

**What changed**

A concise factual summary of the new information.

**Why it matters**

Explain why the observation may affect Crossover's current picture.

**Proposed record**

State whether this should:

* create a new `records.json` entry,
* update an existing record,
* or require no structured change.

---

# 3. Existing Evidence Refreshed

Use this section when an existing standing source has been checked again.

Examples include:

* an action is still available,
* an organization still requests volunteers,
* a program is still operating,
* a donation page or public opportunity is still active.

For each item include:

**Record:** Existing record ID
**Source checked:** URL or source name
**Result:** Confirmed / Changed / No longer found / Unclear
**Checked:** Date
**Recommended change:** Refresh `checked_at`, revise content, mark stale, investigate, or no change
**Content changed:** Yes / No

If No, do not change `updated_at`.

Refreshing evidence is useful even when nothing substantively changed.

When a source is confirmed but its meaning has not changed, update `checked_at` only. Update `updated_at` only when the public-facing content or interpretation actually changes.

---

# 4. Proposed Changes to the Current Picture

This section contains synthesis changes suggested by the evidence.

Each proposal should identify the exact target.

Example:

### Dogs still lack safe placement

**Target:** `gaps.json` → `dogs-safe-placement` → `current_state`

**Current**

> Stockton continues to report pet overpopulation and stray-animal intake pressure beyond normal shelter capacity.

**Proposed**

> [new proposed wording]

**Evidence**

* `record-id-one`
* `record-id-two`

**Why change it**

Brief explanation.

**Confidence:** Medium
**Approval level:** Level 2 — Editorial

Do not rewrite existing text unless new evidence actually improves or changes the current picture.

---

# 5. Judgment Changes Requiring Approval

Keep this section especially short and obvious.

Include only consequential recommendations such as:

* create a new gap,
* deactivate a gap,
* change gap severity,
* change gap rank,
* change `most_useful_now`,
* change an action's priority,
* designate a new featured Sign of Being,
* add or remove a tracked organization,
* declare a condition substantially improved or resolved.

Example:

### Proposed priority change

**Gap:** Food distribution capacity

**Current most useful action:** Help with food distribution

**Proposed:** Support cold-storage capacity

**Reason:** Two recent records indicate storage, rather than volunteer availability, is currently the limiting constraint.

**Evidence:**

* `bol-2026-08-06-cold-storage-overflow`
* `bol-2026-08-06-freezer-expansion-need`

**Confidence:** Medium

**Approval level:** Level 3 — Judgment

**Decision required:** Approve / Reject / Investigate

No Level 3 change should be applied silently.

---

# 6. Sign of Being Candidates

A new positive outcome does not automatically become a public story.

For each candidate include:

### Candidate title

**What happened**

A factual description of the outcome.

**Evidence**

Source and relevant record IDs.

**Why it may qualify**

Explain what real connection, care, response, or measurable outcome occurred.

**Possible fruit**

List the concrete results.

**Confidence:** High / Medium / Low
**Approval level:** Level 2 — Editorial

The reviewer decides whether the event genuinely represents a Sign of Being rather than ordinary promotion or activity.

---

# 7. Action Changes

Review current public actions against recent evidence.

For each affected action include:

**Action:** Action ID and title
**Currentness:** Standing / Recent / Unverified / Stale
**Last supported:** Date
**Evidence:** Relevant record IDs

**Recommendation:**

* keep active,
* refresh evidence,
* revise wording,
* change priority,
* deactivate,
* investigate.

Priority changes require stronger review than routine freshness updates.

---

# 8. Stale or Unverified Items

Identify information that may no longer deserve to be presented as current.

Examples:

```text
Action: transport-a-dog
Last direct support: none
Currentness: unverified
Recommendation: verify before featuring
```

or:

```text
Record: example-standing-program
Last checked: 62 days ago
Recommendation: re-check source
```

Do not automatically delete stale information.

Prefer:

**re-check → mark appropriately → preserve history**

---

# 9. No-Change Findings

This section is important.

List significant sources that were checked and produced no meaningful change.

Example:

```text
Stockton Street Dogs foster/adoption links remain active.
No change recommended.

St. Mary's Pathways information remains consistent with the current gap description.
No change recommended.
```

A successful update run may conclude that little or nothing needs to change.

**No change is a valid result.**

---

# 10. Proposed File Changes

End the report with a compact change summary.

Example:

```text
records.json
+ 3 new records
~ 2 refreshed records

gaps.json
~ 1 current_state proposal

actions.json
~ 1 freshness update

stories.json
+ 1 Sign of Being candidate

orgs.json
no changes
```

Separate **proposed** edits from **approved** edits.

---

# 11. Decisions Needed

Finish with only the questions requiring human input.

Example:

```text
DECISIONS NEEDED

1. Approve revised current state for dogs-safe-placement?
   [Approve] [Reject] [Investigate]

2. Add "Neighborhood freezer expansion" as a Sign of Being?
   [Approve] [Reject] [Investigate]

3. Change food-storage action from Medium to High priority?
   [Approve] [Reject] [Investigate]
```

Routine evidence updates should not clutter this section.

---

# 12. After Approval

Once decisions are made, the agent may prepare the corresponding JSON edits.

The normal workflow is:

```text
scan public sources
↓
produce update report
↓
human reviews
↓
approve / reject / investigate
↓
edit structured data
↓
validate JSON and app build
↓
review Git diff
↓
commit
↓
push to main
↓
GitHub Pages deploys
```

Before publication, run:

```bash
npm run build
```

and review:

```bash
git status
git diff
```

The public site should never be changed merely because an AI scan found something interesting.

---

# Guiding Rule

**An update run is successful when Crossover becomes more accurate — even when the correct update is no update at all.**
