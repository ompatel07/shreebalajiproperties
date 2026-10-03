"use client";

import { useState, useTransition } from "react";

import { updateVisitStatus } from "@/app/studio/actions";
import type { SiteVisit } from "@/types/db";
import { cn } from "@/lib/utils";

/**
 * Visit status control. Buttons rather than a dropdown, deliberately — on a
 * page the client works through first thing in the morning, "Confirm" should
 * be one tap, not a select plus a change event.
 */
const NEXT: { value: SiteVisit["status"]; label: string; tone: string }[] = [
  {
    value: "confirmed",
    label: "Confirm",
    tone: "border-verdant text-verdant hover:bg-verdant hover:text-paper",
  },
  {
    value: "completed",
    label: "Done",
    tone: "border-ink text-ink hover:bg-ink hover:text-bone",
  },
  {
    value: "no_show",
    label: "No show",
    tone: "border-alert/50 text-alert hover:bg-alert hover:text-paper",
  },
  {
    value: "cancelled",
    label: "Cancel",
    tone: "border-rule-strong text-ink-muted hover:bg-sand",
  },
];

export function VisitActions({
  id,
  status,
}: {
  id: string;
  status: SiteVisit["status"];
}) {
  const [current, setCurrent] = useState(status);
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  function set(next: SiteVisit["status"]) {
    const previous = current;

    // Optimistic, with rollback — the list must feel immediate.
    setCurrent(next);
    setFailed(false);

    startTransition(async () => {
      const result = await updateVisitStatus(id, next);
      if (!result.ok) {
        setCurrent(previous);
        setFailed(true);
      }
    });
  }

  return (
    <div className="shrink-0">
      <div className="grid grid-cols-2 gap-1.5 sm:w-44">
        {NEXT.filter((n) => n.value !== current).map((n) => (
          <button
            key={n.value}
            type="button"
            onClick={() => set(n.value)}
            disabled={pending}
            className={cn(
              "rounded-[2px] border px-2.5 py-2 font-semibold text-[0.6875rem] tracking-[0.1em] uppercase transition-colors disabled:opacity-50",
              n.tone,
            )}
          >
            {n.label}
          </button>
        ))}
      </div>

      {failed && (
        <p role="alert" className="mt-2 text-center text-[0.5625rem] text-alert">
          Could not save
        </p>
      )}
    </div>
  );
}
