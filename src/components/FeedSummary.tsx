import { CheckCircle2, ChevronLeft, ChevronRight, ClipboardCheck, ExternalLink, HandHeart, MapPin, Phone, Route, X } from "lucide-react";
import { FAMILY_LABELS } from "../constants";
import type { ActionKind, ActionOption, CivicSource, FeedRecord, OutcomeEvent, ResourceMatch, TagDefinition } from "../types";
import { formatTimeLabel, getRecordTags } from "../lib/utils";

interface FeedSummaryProps {
  record: FeedRecord;
  tagsById: Map<string, TagDefinition>;
  sources: CivicSource[];
  relatedRecords: FeedRecord[];
  onBack: () => void;
  onSelectRelated: (record: FeedRecord) => void;
  actionLog?: OutcomeEvent[];
  onRecordAction?: (record: FeedRecord, label: string, note?: string) => void;
  sequence?: {
    current: number;
    total: number;
    previous?: FeedRecord;
    next?: FeedRecord;
    onNavigate: (record: FeedRecord) => void;
  };
}

export function FeedSummary({ record, tagsById, sources, relatedRecords, onBack, onSelectRelated, actionLog = [], onRecordAction, sequence }: FeedSummaryProps) {
  const tags = getRecordTags(record, tagsById);
  const grouped = tags.reduce<Record<string, TagDefinition[]>>((groups, tag) => {
    if (tag.show_in_detail === false) return groups;
    groups[tag.family] = [...(groups[tag.family] ?? []), tag];
    return groups;
  }, {});
  const recordSources = record.sources.map((id) => sources.find((source) => source.id === id)).filter((source): source is CivicSource => Boolean(source));
  const publicKind = record.record_kind === "signal" ? "signal" : record.record_kind;
  const status = record.status ?? inferStatus(record);
  const evidenceItems = buildEvidence(record, recordSources, tagsById);
  const resourceMatches = record.resource_matches?.length ? record.resource_matches : buildResourceMatches(record, relatedRecords, tagsById);
  const actions = record.actions?.length ? record.actions : buildActions(record, relatedRecords);
  const recommendedAction = actions[0];
  const otherActions = actions.slice(1);
  const availableResources = buildAvailableResources(record, relatedRecords, resourceMatches);
  const workUnderway = buildWorkUnderway(relatedRecords);
  const outcomes = [...(record.outcomes ?? []), ...actionLog].sort((a, b) => new Date(b.happened_at).getTime() - new Date(a.happened_at).getTime());

  return (
    <section className="detail-pane">
      <div className="detail-nav-row">
        <button className="back-button" type="button" onClick={onBack}>
          <ChevronLeft size={16} />
          Back to feed
        </button>
        {sequence && sequence.total > 1 && (
          <nav className="detail-sequence-inline" aria-label="Record navigation">
            <button type="button" onClick={() => sequence.previous && sequence.onNavigate(sequence.previous)} disabled={!sequence.previous}>
              <ChevronLeft size={16} />
              Previous
            </button>
            <span>
              {sequence.current} / {sequence.total}
            </span>
            <button type="button" onClick={() => sequence.next && sequence.onNavigate(sequence.next)} disabled={!sequence.next}>
              Next
              <ChevronRight size={16} />
            </button>
          </nav>
        )}
        <button className="detail-close-button" type="button" onClick={onBack} aria-label="Close detail">
          <X size={18} />
        </button>
      </div>

      <div className="detail-content">
        <div className="detail-header">
          <div className="detail-kicker-row">
            <p>{publicKind}</p>
            <span className={`status-pill is-${status}`}>{formatStatus(status)}</span>
          </div>
          <h2>{record.title}</h2>
          <p>{record.summary}</p>
        </div>

        <section className="need-answer">
          <h3>{record.record_kind === "service" ? "Capacity" : record.record_kind === "work" ? "Work" : record.record_kind === "signal" ? "Signal" : "The condition"}</h3>
          <p>{buildNeedAnswer(record, tagsById)}</p>
        </section>

        <section className="evidence-strip" aria-label="Evidence summary">
          {evidenceItems.slice(0, 3).map((item) => (
            <span key={item.label}>
              <strong>{item.label}</strong>
              {item.value}
            </span>
          ))}
        </section>

        {(record.support_instruction || record.detail_sections?.length) && (
        <section className="detail-section">
          <h3>{record.record_kind === "gap" ? "The gap" : "What this means"}</h3>
          {record.support_instruction && <p>{record.support_instruction}</p>}
          {record.detail_sections?.map((section) => (
            <div className="detail-note" key={section.title}>
              <strong>{section.title}</strong>
              <span>{section.body}</span>
            </div>
          ))}
        </section>
        )}

        {availableResources.length > 0 && (
        <section className="detail-section">
          <h3>Available response</h3>
          <div className="resource-match-list">
            {availableResources.map((match) => (
              <button className={`resource-match is-${match.fit}`} type="button" key={match.id} onClick={() => selectResource(match, relatedRecords, onSelectRelated)}>
                <strong>{match.label}</strong>
                <span>{match.summary}</span>
              </button>
            ))}
          </div>
        </section>
        )}

        {workUnderway.length > 0 && (
        <section className="detail-section">
          <h3>Work underway</h3>
          <div className="resource-match-list">
            {workUnderway.map((work) => (
              <button className="resource-match is-work" type="button" key={work.id} onClick={() => onSelectRelated(work)}>
                <strong>{work.title}</strong>
                <span>{work.summary}</span>
              </button>
            ))}
          </div>
        </section>
        )}

        {recommendedAction && (
        <section className="detail-section action-section">
          <h3>Recommended next action</h3>
          <button className={`recommended-action is-${recommendedAction.kind}`} type="button" onClick={() => onRecordAction?.(record, `Task taken: ${recommendedAction.label}`, recommendedAction.summary)}>
            <ActionIcon kind={recommendedAction.kind} />
            <span>
              <strong>{recommendedAction.label}</strong>
              <small>{recommendedAction.summary}</small>
              <em>{formatActionMeta(recommendedAction)}</em>
            </span>
          </button>
          <div className="primary-task-row">
            <button type="button" onClick={() => onRecordAction?.(record, `Task taken: ${recommendedAction.label}`, recommendedAction.summary)}>Take this task</button>
            <button type="button" onClick={() => onRecordAction?.(record, "Verified", "The recommended action was verified from the detail view.")}>I verified this</button>
          </div>
          {otherActions.length > 0 && (
            <>
              <h4>Other useful actions</h4>
              <div className="other-action-list">
                {otherActions.map((action) => (
                  <button type="button" key={action.id} onClick={() => onRecordAction?.(record, action.label, action.summary)}>
                    {action.label}
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="quick-action-row">
            <button type="button" onClick={() => onRecordAction?.(record, "Checked", "Someone checked this record from the detail view.")}>I checked this</button>
            <button type="button" onClick={() => onRecordAction?.(record, "Still true", "The need was confirmed as still active.")}>Still true</button>
            <button type="button" onClick={() => onRecordAction?.(record, "Resolved", "The record was marked resolved in this session.")}>Mark resolved</button>
          </div>
        </section>
        )}

        <section className="detail-section">
          <h3>Outcome</h3>
          {outcomes.length ? (
            <div className="outcome-list">
              {outcomes.map((outcome) => (
                <div className="outcome-row" key={outcome.id}>
                  <CheckCircle2 size={17} />
                  <span>
                    <strong>{outcome.label}</strong>
                    {outcome.note && <small>{outcome.note}</small>}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p>{record.record_kind === "gap" ? "Gap remains active." : "No outcome recorded yet."}</p>
          )}
        </section>

        <section className="detail-section detail-raw-section">
          <h3>Evidence, trust, and sources</h3>
          <div className="evidence-list">
            {evidenceItems.map((item) => (
              <div className="evidence-row" key={item.label}>
                <strong>{item.label}</strong>
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="detail-grid detail-raw-section">
          <section>
            <h3>Current relevance</h3>
            <p>{record.current_relevance.reason ?? "Currently relevant to the active feed."}</p>
            <span>{formatTimeLabel(record)}</span>
          </section>
          <section>
            <h3>Trust</h3>
            <p>{Math.round((record.trust.confidence ?? 0) * 100)}% confidence</p>
            <span>{record.trust.tag_ids?.map((id) => tagsById.get(id)?.label ?? id).join(", ") || "No trust tags"}</span>
          </section>
        </div>

        {record.location && (
        <section className="detail-section">
          <h3>Location</h3>
          <p>
            <MapPin size={16} />
            {record.location.label ?? record.location.address}
          </p>
        </section>
        )}

        <section className="detail-section">
          <h3>Tags</h3>
          <div className="detail-tags">
            {Object.entries(grouped).map(([family, tags]) => (
              <div key={family}>
                <strong>{FAMILY_LABELS[family as keyof typeof FAMILY_LABELS] ?? family}</strong>
                <span>{tags.map((tag) => tag.label).join(", ")}</span>
              </div>
            ))}
          </div>
        </section>

        {recordSources.length > 0 && (
        <section className="detail-section">
          <h3>Sources</h3>
          {recordSources.map((source) => (
            <div className="source-row" key={source.id}>
              <div>
                <strong>{source.title}</strong>
                {source.publisher && <span>{source.publisher}</span>}
                {source.type && <span>{source.type}</span>}
              </div>
              {source.url && <ExternalLink size={15} />}
            </div>
          ))}
        </section>
        )}

        {relatedRecords.length > 0 && (
        <section className="detail-section">
          <h3>Related records</h3>
          {relatedRecords.map((related) => (
            <button className="related-row" type="button" key={related.id} onClick={() => onSelectRelated(related)}>
              <strong>{related.title}</strong>
              <span>{related.record_kind}</span>
            </button>
          ))}
        </section>
        )}
      </div>
    </section>
  );
}

function ActionIcon({ kind }: { kind: ActionKind }) {
  const Icon = kind === "call" ? Phone : kind === "ride" ? Route : kind === "verify" ? ClipboardCheck : HandHeart;
  return <Icon size={19} />;
}

function inferStatus(record: FeedRecord) {
  if (record.tag_ids.includes("closed_now")) return "closed";
  if (record.tag_ids.includes("limited") || record.tag_ids.includes("full") || record.tag_ids.includes("waitlist")) return "limited";
  if (record.tag_ids.includes("open_now") || record.tag_ids.includes("verified")) return "open";
  if (record.tag_ids.includes("blocked")) return "blocked";
  if (record.tag_ids.includes("planned")) return "assigned";
  if (record.tag_ids.includes("needs_recheck") || record.tag_ids.includes("unverified") || record.tag_ids.includes("conflicting")) return "needs_verification";
  if (record.tag_ids.includes("in_progress") || record.record_kind === "work") return "in_progress";
  return "active";
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

function buildNeedAnswer(record: FeedRecord, tagsById: Map<string, TagDefinition>) {
  const tags = getRecordTags(record, tagsById);
  const support = tags.find((tag) => tag.family === "support")?.label.toLowerCase() ?? "support";
  const gap = tags.find((tag) => tag.family === "gap_pattern")?.label.toLowerCase();
  const area = tags.find((tag) => tag.family === "area")?.label ?? record.location?.label ?? "this area";
  const time = getTimePhrase(record, tags);
  if (record.record_kind === "gap") {
    if (record.tag_ids.includes("food")) return `People in ${area} who need food ${time} currently have no confirmed nearby option.`;
    if (record.tag_ids.includes("safe_parking")) return "People sleeping in vehicles do not have clear, verified overnight parking rules tonight.";
    if (record.tag_ids.includes("cooling") && record.tag_ids.includes("transportation")) return `People near ${area} who need cooling tonight may not be able to reach the available center.`;
    if (record.tag_ids.includes("restrooms")) return `People downtown may not have verified restroom access, and the available information still needs a field check.`;
    if (record.tag_ids.includes("shelter")) return `People seeking shelter ${time} may face waitlists or limited intake capacity in ${area}.`;
    return `${capitalize(support)} is missing or blocked in ${area}${time !== "now" ? ` ${time}` : ""}${gap ? ` because of a ${gap}` : ""}.`;
  }
  if (record.record_kind === "service") {
    const availability = tags.find((tag) => tag.family === "availability")?.label.toUpperCase() ?? "STATUS UNKNOWN";
    const checked = formatTimeLabel(record);
    return `${availability} - ${capitalize(support)} capacity near ${area}. ${checked}.`;
  }
  if (record.record_kind === "work") return `${capitalize(support)} response is already underway in ${area}. The useful move is to join, unblock, or verify the result.`;
  if (record.record_kind === "signal") return `New ${support} evidence from ${area} may change how related gaps or work should be understood.`;
  return `${capitalize(support)} context from ${area}, relevant ${time}.`;
}

function buildEvidence(record: FeedRecord, recordSources: CivicSource[], tagsById: Map<string, TagDefinition>) {
  const trustTags = record.trust.tag_ids?.map((id) => tagsById.get(id)?.label ?? id).join(", ") || "No trust tags";
  const newestSource = recordSources
    .map((source) => source.retrieved_at ?? source.published_at)
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
  return [
    { label: "Confidence", value: `${Math.round((record.trust.confidence ?? 0) * 100)}% confidence · ${trustTags}` },
    { label: "Sources", value: recordSources.length ? `${recordSources.length} source${recordSources.length === 1 ? "" : "s"} attached` : "No source attached" },
    { label: "Freshness", value: newestSource ? `Newest source checked ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(newestSource))}` : formatTimeLabel(record) },
    { label: "Current state", value: record.current_relevance.reason ?? "Currently relevant to the active feed." },
  ];
}

function getTimePhrase(record: FeedRecord, tags: TagDefinition[]) {
  const tagIds = new Set(record.tag_ids);
  if (tagIds.has("tonight")) return "tonight";
  if (tagIds.has("after_hours")) return "after 7 PM";
  if (tagIds.has("evening")) return "this evening";
  if (tagIds.has("today")) return "today";
  if (tagIds.has("weekend")) return "this weekend";
  if (tagIds.has("this_week")) return "this week";
  return tags.find((tag) => tag.family === "time")?.label.toLowerCase() ?? "now";
}

function buildAvailableResources(record: FeedRecord, relatedRecords: FeedRecord[], resourceMatches: ResourceMatch[]) {
  const serviceIds = new Set(relatedRecords.filter((related) => related.record_kind === "service").map((related) => related.id));
  const serviceMatches = resourceMatches.filter((match) => match.record_id && serviceIds.has(match.record_id));
  if (serviceMatches.length) return serviceMatches;
  if (record.record_kind !== "gap") return resourceMatches;
  return [
    {
      id: `${record.id}-no-confirmed-resource`,
      label: "No confirmed usable resource yet",
      summary: "The first useful move is to verify availability or attach a usable service to this gap.",
      fit: "unknown" as const,
    },
  ];
}

function buildWorkUnderway(relatedRecords: FeedRecord[]) {
  return relatedRecords.filter((related) => related.record_kind === "work").slice(0, 4);
}

function formatActionMeta(action: ActionOption) {
  if (action.kind === "call") return "10-15 min - Phone - Anyone can do this";
  if (action.kind === "ride") return "1-2 hr - Vehicle - Driver needed";
  if (action.kind === "deliver") return "30-90 min - Supplies - Local helper";
  if (action.kind === "verify") return "10-20 min - Field check - Update record";
  if (action.kind === "join") return "Coordinate first - Existing effort";
  return "Bounded task - Outcome should be verified";
}

function buildResourceMatches(record: FeedRecord, relatedRecords: FeedRecord[], tagsById: Map<string, TagDefinition>): ResourceMatch[] {
  const supportIds = getRecordTags(record, tagsById).filter((tag) => tag.family === "support" || tag.family === "service_type").map((tag) => tag.id);
  const matches = relatedRecords.filter((related) => related.record_kind === "service");
  if (matches.length) {
    return matches.slice(0, 4).map((related) => ({
      id: `match-${related.id}`,
      record_id: related.id,
      label: related.title,
      summary: related.summary,
      fit: related.tag_ids.some((id) => supportIds.includes(id)) ? "strong" : "partial",
    }));
  }
  if (record.record_kind !== "gap") return [];
  return [
    {
      id: `${record.id}-verification`,
      label: "Verification can start here",
      summary: "No linked service is attached yet, so the first useful resource is a call, field check, or partner update.",
      fit: "unknown",
    },
  ];
}

function buildActions(record: FeedRecord, relatedRecords: FeedRecord[]): ActionOption[] {
  const tags = new Set(record.tag_ids);
  if (record.record_kind === "service") {
    return [{ id: `${record.id}-verify`, kind: "verify", label: "Confirm availability", summary: "Check that this resource is still usable before routing someone there." }];
  }
  if (record.record_kind === "work") {
    return [{ id: `${record.id}-join`, kind: "join", label: "Join this effort", summary: "Coordinate with the existing work instead of starting a duplicate effort." }];
  }
  const actions: ActionOption[] = [];
  if (tags.has("needs_phone_call") || tags.has("needs_recheck") || tags.has("verification_gap") || tags.has("information_gap")) {
    actions.push({ id: `${record.id}-call`, kind: "call", label: "Call and confirm", summary: "Verify hours, access, capacity, or ownership, then update the record." });
  }
  if (tags.has("mobility_gap") || tags.has("transportation")) {
    actions.push({ id: `${record.id}-ride`, kind: "ride", label: "Provide a ride", summary: "Help someone reach the existing resource while the access gap is active." });
  }
  if (tags.has("food") || tags.has("water") || tags.has("baby_food")) {
    actions.push({ id: `${record.id}-deliver`, kind: "deliver", label: "Deliver supplies", summary: "Bring the needed food, water, or items to the affected area." });
  }
  if (tags.has("restrooms") || tags.has("hygiene")) {
    actions.push({ id: `${record.id}-field-check`, kind: "verify", label: "Field check the site", summary: "Go there, confirm whether the facility is usable, and note barriers." });
  }
  if (relatedRecords.some((related) => related.record_kind === "work")) {
    actions.push({ id: `${record.id}-join`, kind: "join", label: "Join existing work", summary: "There is already related work underway; add capacity there first." });
  }
  if (!actions.length) actions.push({ id: `${record.id}-verify`, kind: "verify", label: "Verify what is true", summary: "Check the need before acting so the next step is grounded." });
  return actions.slice(0, 4);
}

function selectResource(match: ResourceMatch, relatedRecords: FeedRecord[], onSelectRelated: (record: FeedRecord) => void) {
  const related = relatedRecords.find((record) => record.id === match.record_id);
  if (related) onSelectRelated(related);
}

function capitalize(value: string) {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;
}
