"use client";

import { useState, useTransition } from "react";
import { Check, StickyNote } from "lucide-react";

import { updateLead } from "@/app/studio/actions";
import type { LeadStatus } from "@/types/db";
import { cn } from "@/lib/utils";

/**
 * Per-lead triage: move it along the pipeline, set a follow-up date, keep a
 * note.
 *
 * The note stays collapsed until asked for. On a list of 40 leads, forty
 * open textareas is noise — and the thing the client needs most of the time
 * is just the status dropdown.
 */

const STATUSES: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "visit_scheduled", label: "Visit scheduled" },
  { value: "visited", label: "Visited" },
  { value: "negotiating", label: "Negotiating" },
  { value: "closed_won", label: "Closed — won" },
  { value: "closed_lost", label: "Closed — lost" },
];

export function LeadRow({
  id,
  status,
  notes,
  followUpAt,
}: {
  id: string;
  status: LeadStatus;
  notes: string | null;
  followUpAt: string | null;
}) {
  const [current, setCurrent] = useState(status);
  const [showNote, setShowNote] = useState(false);
  const [saved, setSaved] = useState(false);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  function save(formData: FormData) {
    setFailed(false);
    startTransition(async () => {
      const result = await updateLead(formData);
      if (result.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2200);
      } else {
        setFailed(true);
      }
    });
  }

  /** Status change posts immediately — one interaction, not two. */
  function onStatusChange(next: LeadStatus) {
    const previous = current;
    setCurrent(next);

    const formData = new FormData();
    formData.set("id", id);
    formData.set("status", next);

    setFailed(false);
    startTransition(async () => {
      const result = await updateLead(formData);
      if (result.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2200);
      } else {
        setCurrent(previous);
        setFailed(true);
      }
    });
  }

  const tone =
    current === "closed_won"
      ? "border-verdant/40 bg-verdant-pale text-verdant"
      : current === "closed_lost"
        ? "border-rule bg-bone text-ink-faint"
        : current === "new"
          ? "border-brass/40 bg-brass-pale text-brass-deep"
          : "border-rule-strong bg-paper text-ink";

  return (
    <div className="flex w-full shrink-0 flex-col items-stretch gap-2 sm:w-52">
      <select
        value={current}
        onChange={(e) => onStatusChange(e.target.value as LeadStatus)}
        disabled={pending}
        aria-label="Lead status"
        className={cn(
          "cursor-pointer rounded-[2px] border px-3 py-2 font-semibold text-[0.6875rem] tracking-[0.1em] uppercase focus:border-brass focus:outline-none",
          tone,
          pending && "opacity-60",
        )}
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => setShowNote((v) => !v)}
        aria-expanded={showNote}
        className="inline-flex items-center justify-center gap-1.5 rounded-[2px] border border-rule px-3 py-2 font-semibold text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase hover:border-ink hover:text-ink"
      >
        <StickyNote className="size-3" strokeWidth={1.9} aria-hidden />
        {notes ? "Note ·" : "Add note"}
        {notes && <span className="text-brass">1</span>}
      </button>

      {showNote && (
        <form action={save} className="space-y-2 rounded-[2px] border border-rule bg-sand p-3">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value={current} />

          <label className="block">
            <span className="font-semibold text-[0.6875rem] tracking-[0.14em] text-ink-muted uppercase">
              Internal note
            </span>
            <textarea
              name="notes"
              rows={4}
              defaultValue={notes ?? ""}
              maxLength={4000}
              placeholder="Called — wants Shela or South Bopal, loan pre-approved with HDFC."
              className="mt-1 w-full rounded-[2px] border border-rule-strong bg-paper px-2.5 py-2 text-[0.8125rem] text-ink focus:border-brass focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="font-semibold text-[0.6875rem] tracking-[0.14em] text-ink-muted uppercase">
              Follow up
            </span>
            <input
              type="datetime-local"
              name="followUpAt"
              // `datetime-local` wants `YYYY-MM-DDTHH:mm`, so trim the stored
              // ISO string rather than passing it whole.
              defaultValue={followUpAt ? followUpAt.slice(0, 16) : ""}
              className="mt-1 w-full rounded-[2px] border border-rule-strong bg-paper px-2.5 py-2 text-[0.8125rem] text-ink focus:border-brass focus:outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-[2px] bg-ink px-3 py-2 font-semibold text-[0.6875rem] tracking-[0.12em] text-bone uppercase hover:bg-brass-deep disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save note"}
          </button>
        </form>
      )}

      {saved && (
        <p
          role="status"
          className="inline-flex items-center justify-center gap-1 font-semibold text-[0.6875rem] tracking-[0.12em] text-verdant uppercase"
        >
          <Check className="size-2.5" strokeWidth={3} aria-hidden />
          Saved
        </p>
      )}

      {failed && (
        <p role="alert" className="text-center text-[0.5625rem] text-alert">
          Could not save
        </p>
      )}
    </div>
  );
}
