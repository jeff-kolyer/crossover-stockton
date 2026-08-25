# Crossover Update Contract

Crossover uses AI to help maintain a current picture of local reality.

The AI may **observe, summarize, connect, and propose**. It should not silently redefine reality.

Git is the source of truth. Public changes should be understandable from the evidence that produced them.

## 1. Every update starts with evidence

A change should trace back to a public source.

At minimum, a source record should contain:

* organization or source name
* source URL
* publication or observation date when available
* date Crossover checked it
* short factual summary
* relevant gap, story, organization, or action
* confidence level

The AI should distinguish:

**Observed fact** — directly supported by the source.

**Inference** — a reasonable conclusion drawn from one or more observations.

**Judgment** — a Crossover assessment such as severity, priority, or whether something represents meaningful improvement.

These should not be treated as the same thing.

---

# 2. What AI can propose freely

These are relatively low-risk updates.

### Source records

AI can propose:

* new public records
* updated links
* dates
* source summaries
* organization activity
* new evidence
* corrections to obvious factual errors
* marking records as old or superseded

### Organization information

AI can propose:

* newly discovered programs
* changes in services
* public contact or program links
* recently reported activity
* organizations responding to an existing need

### Story evidence

AI can propose a possible **Sign of Being** when a source reports a concrete result:

* people housed
* animals transferred or adopted
* food distributed
* a program opened
* capacity increased
* a person or community experienced a meaningful outcome

The evidence must describe something that actually happened.

---

# 3. What requires stronger human review

AI can propose these changes, but they should not quietly become public judgments.

### Gap creation

Creating a new Need means Crossover is saying:

> This is an important unmet reality worthy of attention.

That should require human review.

### Severity

Changes such as:

* Watch → High
* High → Critical
* Critical → Improving

require judgment and should be reviewed.

### Current state

AI may draft an updated current-state summary, but important claims should be traceable to recent evidence.

### Priority actions

Changing **what is most useful now** should require review when it affects where people may spend:

* time
* money
* donations
* volunteer effort

### Signs of Being

AI may identify candidate stories, but a human should confirm that the event genuinely represents a meaningful outcome rather than ordinary organizational promotion.

---

# 4. The evidence threshold

A proposed change should answer:

**What changed?**
**How do we know?**
**When did we learn it?**
**Why does it matter?**

Whenever possible, important judgments should be supported by more than one source.

A single credible primary source can still be sufficient for straightforward facts.

Examples:

> Stockton Animal Services reports 34 cats were transferred.

One primary source may be enough.

But:

> Stockton has a critical shortage of foster capacity.

That is a broader conclusion and should ideally draw on several observations.

---

# 5. Confidence

Use simple confidence levels.

### High

The evidence is direct, recent, and specific.

### Medium

The evidence is credible but incomplete, indirect, or assembled from several signals.

### Low

The information is tentative, old, ambiguous, or based on limited evidence.

Low-confidence information can remain useful, but the site should not present it with false certainty.

---

# 6. Freshness

Every important public claim should have a date behind it.

AI should not delete useful older information simply because it is old.

Instead, distinguish:

* **Current**
* **Recently observed**
* **Older evidence**
* **Possibly stale**

When newer evidence contradicts older evidence, preserve the source history while updating the current picture.

`checked_at` and `updated_at` mean different things.

* `checked_at` records when Crossover successfully re-checked the underlying public evidence.
* `updated_at` records when Crossover's actual content or interpretation changed.

A routine verification should update `checked_at` without changing `updated_at`. Do not make unchanged information appear newly updated simply because a source was re-checked.

---

# 7. Never silently erase history

Crossover should behave more like an instrument than an editable brochure.

When reality changes:

**add the new observation → update the current state → preserve the evidence trail**

Do not rewrite old records to make them appear as though the new situation was always true.

---

# 8. Proposed update format

Before changing public content, the AI should be able to produce something conceptually like:

### Proposed update

**Target:** Too many dogs still lack safe placement

**New evidence:**
Stockton Street Dogs reported X on Aug. 24, 2026.

**Observed change:**
Foster capacity remains constrained despite recent transfers.

**Proposed changes:**

* add source record
* update `latest_change`
* update `current_state`
* leave severity unchanged
* leave most useful action unchanged

**Confidence:** Medium

**Reason:**
The new source confirms continuing pressure but does not provide enough evidence to change the overall severity.

That makes the AI's reasoning inspectable before the JSON changes.

---

# 9. Approval levels

For now, use three practical levels.

### Level 1 — Routine

May eventually be automated after the system proves reliable.

Examples:

* add source
* update date
* add factual record
* repair link
* mark record stale

### Level 2 — Editorial

Human review expected.

Examples:

* rewrite current-state summary
* add organization to responders
* create a Sign of Being
* change supporting actions

### Level 3 — Judgment

Explicit human approval required.

Examples:

* create or remove a gap
* change severity
* change the highest-priority action
* declare a major problem improving or resolved
* make a broad claim about local conditions

---

# 10. Publishing workflow

For now:

**Public sources**
↓
**AI finds new evidence**
↓
**AI proposes structured changes**
↓
**Human reviews evidence + diff**
↓
**Approved JSON changes**
↓
**Git commit**
↓
**Push to `main`**
↓
**GitHub Actions builds**
↓
**Crossover updates**

The goal is not maximum automation.

The goal is a system where **more of reality can be seen without losing accountability for what Crossover says is real.**

---

# Guiding rule

**AI helps us see. Evidence keeps us honest. Humans remain responsible for the judgment.**
