import { ArrowRight, CalendarDays, CheckCircle2, Clock3, ExternalLink, Heart, Info, Tag, Users, X } from "lucide-react";
import type { MouseEvent } from "react";
import { useEffect, useRef } from "react";
import gapsData from "../data/gaps.json";
import orgsData from "../data/orgs.json";
import { getActionIcon } from "../lib/actionIcons";
import type { GapRecord, OrgRecord, PublicActionRecord } from "../types";

interface ActionModalProps {
  action: PublicActionRecord;
  onClose: () => void;
  onOpenGap: (slug: string) => void;
}

const gaps = gapsData as GapRecord[];
const orgs = orgsData as OrgRecord[];

export function ActionModal({ action, onClose, onOpenGap }: ActionModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const relatedGap = gaps.find((gap) => gap.id === action.gap_ids[0]);
  const org = orgs.find((item) => item.id === action.organization_id);
  const provider = providerLabel(action);
  const sourceDate = formatSourceDate(action.last_supported_at);
  const ActionIcon = getActionIcon(action);
  const glanceItems = [
    { label: "What it is", value: action.at_a_glance?.what, icon: Tag },
    { label: "Time", value: action.at_a_glance?.time, icon: Clock3 },
    { label: "Why it matters", value: action.at_a_glance?.why, icon: Heart },
    { label: "Availability", value: action.at_a_glance?.availability, icon: CalendarDays },
  ].filter((item) => item.value);
  const currentDetails = [
    action.when_label,
    currentnessLabel(action.currentness),
    sourceDate ? `Checked ${sourceDate}` : "",
    action.location_label,
  ].filter(Boolean);

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = focusableElements(dialogRef.current);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("has-action-modal");

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("has-action-modal");
      previouslyFocused?.focus();
    };
  }, [onClose]);

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  function handleHandoff() {
    if (!action.source_url) return;
    window.open(action.source_url, "_blank", "noopener,noreferrer");
  }

  function handleRelatedNeed() {
    if (!relatedGap) return;
    onClose();
    onOpenGap(relatedGap.slug);
  }

  return (
    <div className="action-modal-backdrop" onMouseDown={handleBackdropClick}>
      <div
        className="action-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="action-modal-title"
        ref={dialogRef}
      >
        <button className="action-modal-close" type="button" aria-label="Close action details" onClick={onClose} ref={closeButtonRef}>
          <X size={20} />
        </button>

        <div className="action-modal-hero">
          <span className="action-modal-icon"><ActionIcon size={42} /></span>
          <div>
            <p>ACTION</p>
            <h2 id="action-modal-title">{action.modal_title ?? action.title}</h2>
            <span>{action.summary}</span>
          </div>
        </div>

        {glanceItems.length > 0 && (
          <div className="action-modal-glance" aria-label="Action at a glance">
            {glanceItems.map((item) => {
              const Icon = item.icon;
              return (
                <span key={item.label}>
                  <Icon size={26} />
                  <small>{item.label}</small>
                  <strong>{item.value}</strong>
                </span>
              );
            })}
          </div>
        )}

        <div className="action-modal-content">
          <div className="action-modal-main">
            {action.why_it_helps && (
              <section className="action-modal-copy-block">
                <h3>Why this helps</h3>
                <p>{action.why_it_helps}</p>
              </section>
            )}

            <section className="action-modal-copy-block">
              <h3>What to expect</h3>
              {action.what_to_expect?.length ? (
                <ul className="action-modal-expect-list">
                  {action.what_to_expect.map((item) => (
                    <li key={item}><CheckCircle2 size={17} /> {item}</li>
                  ))}
                </ul>
              ) : (
                <p>You&apos;ll leave Crossover to view the provider&apos;s latest instructions and availability.</p>
              )}
            </section>
          </div>

          <div className="action-modal-side">
            <section className="action-modal-copy-block">
              <h3>Who offers it</h3>
              <div className="action-modal-provider">
                <span><Users size={28} /></span>
                <p>
                  <strong>{provider}</strong>
                  {org?.summary && <small>{org.summary}</small>}
                </p>
              </div>
            </section>

            {currentDetails.length > 0 && (
              <section className="action-modal-current">
                <h3>Current details</h3>
                <ul>
                  {currentDetails.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </section>
            )}
          </div>
        </div>

        <button className="action-modal-primary" type="button" onClick={handleHandoff} disabled={!action.source_url}>
          {action.handoff_label ?? "Go to organization"} <ArrowRight size={21} />
        </button>
        <p className="action-modal-handoff-note">Opens the organization&apos;s website.</p>

        <section className="action-modal-field-reports">
          <h3>Field Reports</h3>
          <div>
            <Info size={19} />
            <span>
              <strong>No field reports yet.</strong>
              <small>We&apos;ll add notes here as this action is checked in the field.</small>
            </span>
          </div>
        </section>

        <div className="action-modal-footer-meta">
          <span><CheckCircle2 size={16} /> {sourceDate ? `Source checked ${sourceDate}` : "Source check pending"}</span>
          <span><Clock3 size={16} /> {currentnessLabel(action.currentness) || "Availability can change"}</span>
          {relatedGap && (
            <span>
              Related need:
              <button type="button" onClick={handleRelatedNeed}>
                {relatedGap.title} <ExternalLink size={14} />
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function providerLabel(action: PublicActionRecord) {
  if (action.provider_label) return action.provider_label;
  const org = orgs.find((item) => item.id === action.organization_id);
  return org?.name ?? action.source_label ?? "Provider";
}

function formatSourceDate(value?: string | null) {
  if (!value) return "";

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value);

  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function currentnessLabel(value?: PublicActionRecord["currentness"]) {
  if (value === "standing") return "Standing opportunity";
  if (value === "recent") return "Recent need";
  if (value === "dated") return "Check before acting";
  if (value === "unverified") return "Needs verification";
  return "";
}

function focusableElements(container: HTMLElement | null) {
  if (!container) return [];

  return Array.from(container.querySelectorAll<HTMLElement>(
    "a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])",
  )).filter((element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true");
}
