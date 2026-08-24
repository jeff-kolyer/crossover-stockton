import { ArrowRight, ExternalLink, HandHeart, Heart, Send, Users, X } from "lucide-react";
import type { MouseEvent } from "react";
import { useEffect, useRef } from "react";
import gapsData from "../data/gaps.json";
import orgsData from "../data/orgs.json";
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
  const provider = providerLabel(action);
  const sourceDate = formatSourceDate(action.last_supported_at);

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
          <span className="action-modal-icon"><HandHeart size={34} /></span>
          <h2 id="action-modal-title">{action.modal_title ?? action.title}</h2>
          <p>{action.summary}</p>
        </div>

        <div className="action-modal-sections">
          {action.why_it_helps && (
            <section className="action-modal-section">
              <span><Heart size={22} /></span>
              <div>
                <h3>Why this helps</h3>
                <p>{action.why_it_helps}</p>
              </div>
            </section>
          )}

          <section className="action-modal-section">
            <span><Users size={22} /></span>
            <div>
              <h3>Who offers it</h3>
              <p>{provider}</p>
            </div>
          </section>

          <section className="action-modal-section">
            <span><Send size={22} /></span>
            <div>
              <h3>What happens next</h3>
              <p>You&apos;ll leave Crossover and view the provider&apos;s latest instructions and availability.</p>
            </div>
          </section>
        </div>

        <button className="action-modal-primary" type="button" onClick={handleHandoff} disabled={!action.source_url}>
          {action.handoff_label ?? "Go to organization"} <ArrowRight size={18} />
        </button>

        <p className="action-modal-freshness">
          {sourceDate ? <>Source checked {sourceDate} <span aria-hidden="true">·</span> Availability can change</> : "Availability can change"}
        </p>

        {relatedGap && (
          <p className="action-modal-related">
            Related need:
            <button type="button" onClick={handleRelatedNeed}>
              {relatedGap.title} <ExternalLink size={14} />
            </button>
          </p>
        )}
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

function focusableElements(container: HTMLElement | null) {
  if (!container) return [];

  return Array.from(container.querySelectorAll<HTMLElement>(
    "a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])",
  )).filter((element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true");
}
