**Crossover Stockton** (`crossoverstockton.org`) is a civic pathway development platform built to investigate community needs and verify actionable routes for public assistance in Stockton, California. Rather than functioning as an unverified directory, the tracker isolates proven, repeatable ways to help from avenues that are still under investigation or stalled by operational bottlenecks.

## 1. Core Architectural Views

The tracker divides its workflow across four primary operational views:

* **Help Today (Public Action Pathways):** Surfaces only directly confirmed, repeatable routes to contribute. Listings are ranked by **freshness** (tracking whether data is *Fresh* within 48 hours or *Aging*) and **evidence confidence**.
* **Pathways Board (Development Pipeline):** Organizes unconfirmed or developing civic avenues across a four-stage lifecycle, viewable in either a **List** or **Board** layout.
* **Tasks & Checklists (Concrete Work):** Breaks down active pathways into granular, trackable action items (such as following up on volunteer applications, conducting site observations, or reconciling public records) linked to specific pathway IDs (e.g., `PW-01`, `PW-02`, `PW-04`).
* **Evidence & Records Log:** Maintains a ground-truth repository of public disclosures, California Public Records Act (CPRA) filings, field-call datasets, and official reports (indexed via a Master File Index) that substantiate pathway statuses and metrics.

---

## 2. Four-Stage Pathway Lifecycle

Every prospective route to community help moves through four defined verification states:

| Stage | Definition & Operational Criteria |
| --- | --- |
| **01 Exploring** | Checking whether an accessible, legitimate route to help exists (e.g., verifying shelter volunteer intake or local supply drop-off logistics). |
| **02 Blocked** | A concrete operational obstacle prevents participation—such as an unresponsive inbox, multi-week waitlists, or the lack of a verified payment/delivery channel. |
| **03 Enabling** | Active intervention is underway to clear a bottleneck, verify conditions, or establish a usable route. |
| **04 Established** | Confirmed open, repeatable, and verified as **fresh (less than 48 hours)**, qualifying the pathway for publication in **Help Today**. |

---

## 3. Evidence, Verification & Data Integrity Features

* **Contribution Categorization:** Pathways and tasks are tagged by specific resource and action types—including **Direct Action**, **Supplies**, and **Fieldwork**—so contributors can filter by how they are able to help.
* **Source-Checked Metric Cards:** Quantitative data points (such as municipal intake counts, outcome dispositions, and live-release percentages) are paired with source IDs (e.g., `SHEL-2024-001`, `GOV-2026-001`), exact page citations, verification dates, and **Scope & Limits** disclosures explaining what the numbers do and do not prove.
* **Distinction Between Leads and Proof:** Unverified tips (such as video leads or third-party service listings) are explicitly flagged as leads requiring field observation rather than confirmed current conditions.
* **Exportable Citations & Structured Data:** Individual metrics and records support one-click **Copy Citation** and **Copy JSON** actions alongside direct links to underlying source documents.
* **Live Telemetry Header:** Displays real-time platform status (`LIVE`), last-updated timestamps, location context (`Stockton, CA`), and live counts across *Help Today*, *Pathways Board*, *Open Tasks*, and *Evidence & Records*.








Crossover helps people answer **“What can I actually do to help in Stockton today?”** It tracks possible ways to contribute, checks whether someone can follow through, and documents what would make more help possible. Its first focus is street dogs and access to care.

| Section | What it does |
|---|---|
| **Help Today** | Shows verified, repeatable ways to help. Each needs clear steps, firsthand completion or confirmation from the responsible organization, and an availability check within the past 48 hours. |
| **Pathways** | Tracks each possible route to help, the organization involved, its current condition, and the next step. You can view pathways as cards, a list, or a board and open one to see its tasks, evidence, field notes, and confidence score. |
| **Tasks** | Tracks specific actions such as following up on an application, visiting a location, or reviewing field-call records. Each task has a status and links back to its pathway. |
| **Evidence** | Makes public records, firsthand observations, and contact attempts searchable. Each record explains what was learned, where it came from, and the limits of what it establishes. |

**Doggie Day Out** illustrates how the pieces fit together. Taking a shelter dog on an outing is the *pathway*. Crossover’s email to Stockton Animal Services is *evidence of an attempt*. Finding out whether a new volunteer can book an outing, and how, is the *task*.

That pathway is **Exploring** while the answer is unknown. A confirmed obstacle can make it **Blocked**. Work to remove that obstacle makes it **Enabling**. Once the route is verified and repeatable, it can become **Established** and appear in Help Today. A pathway can also go directly from Exploring to Established.

In the private app, you can add pathways, update stages, complete tasks, and record field notes. Those edits are saved in the browser where you enter them.