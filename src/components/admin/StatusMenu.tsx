"use client";

import { useState, useTransition } from "react";

import { setPropertyStatus } from "@/app/studio/actions";
import type { ListingStatus } from "@/types/db";
import { cn } from "@/lib/utils";

/**
 * Inline status control.
 *
 * Publishing is the single most frequent action in the panel, so it is a
 * one-touch select in the list rather than a round trip through the edit
 * form.
 *
 * `archived` is offered but labelled plainly — the action archives rather
 * than deletes, because a sold listing still has leads, visits and audit
 * entries pointing at it and that history is worth keeping.
 */

const OPTIONS: { value: ListingStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Live" },
  { value: "under_offer", label: "Under offer" },
  { value: "sold", label: "Sold" },
  { value: "rented", label: "Rented" },
  { value: "archived", label: "Archived" },
];

const TONE: Record<ListingStatus, string> = {
  draft: "border-rule-strong text-ink-muted bg-paper",
  published: "border-verdant/40 text-verdant bg-verdant-pale",
  under_offer: "border-alert/35 text-alert bg-alert-pale",
  sold: "border-ink/25 text-ink bg-sand",
  rented: "border-ink/25 text-ink bg-sand",
  archived: "border-rule text-ink-faint bg-bone",
};

export function StatusMenu({
  id,
  status,
}: {
  id: string;
  status: ListingStatus;
}) {
  const [current, setCurrent] = useState(status);
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  function onChange(next: ListingStatus) {
    const previous = current;

    // Optimistic — the list should feel instant.
    setCurrent(next);
    setFailed(false);

    startTransition(async () => {
      const result = await setPropertyStatus(id, next);
      if (!result.ok) {
        setCurrent(previous); // roll back
        setFailed(true);
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={current}
        onChange={(e) => onChange(e.target.value as ListingStatus)}
        disabled={pending}
        aria-label="Listing status"
        className={cn(
          "cursor-pointer rounded-[2px] border px-2.5 py-1.5 font-semibold text-[0.6875rem] tracking-[0.1em] uppercase transition-opacity focus:border-brass focus:outline-none",
          TONE[current],
          pending && "opacity-60",
        )}
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {failed && (
        <span role="alert" className="text-[0.5625rem] text-alert">
          Could not save
        </span>
      )}
    </div>
  );
}
