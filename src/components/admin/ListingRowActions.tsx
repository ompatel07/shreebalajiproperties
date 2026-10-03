"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, Copy, IndianRupee, X } from "lucide-react";

import { duplicateProperty, updatePropertyPrice } from "@/app/studio/actions";
import { formatPrice } from "@/lib/format";
import { parseRupees } from "@/lib/utils";
import { cn } from "@/lib/utils";

/**
 * Row-level shortcuts in the listings table.
 *
 * Both exist because of the same observation: the old panel made you open a
 * 29-field form to do a ten-second job.
 *
 *   · **Inline price edit** — correcting a typo in a price is the single most
 *     common edit. It accepts what people type: "1.2cr", "85 lakh",
 *     "9500000".
 *   · **Duplicate** — inventory arrives in batches from one project. Copying
 *     and changing the floor and carpet beats re-entering thirty fields. The
 *     copy lands as a draft, so it can never go live by accident.
 */
export function ListingRowActions({
  id,
  slug,
  price,
  priceOnRequest,
}: {
  id: string;
  slug: string;
  price: number | null;
  priceOnRequest: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(price ? String(price) : "");
  const [current, setCurrent] = useState(price);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  function flash(ok: boolean, text: string) {
    setNote({ ok, text });
    setTimeout(() => setNote(null), 2600);
  }

  function savePrice() {
    const parsed = parseRupees(draft);

    if (draft.trim() !== "" && parsed === null) {
      flash(false, "Could not read that number");
      return;
    }

    const previous = current;
    setCurrent(parsed);
    setEditing(false);

    startTransition(async () => {
      const res = await updatePropertyPrice(id, parsed);
      if (res.ok) flash(true, "Saved");
      else {
        setCurrent(previous); // roll back
        flash(false, res.message.slice(0, 60));
      }
    });
  }

  function duplicate() {
    startTransition(async () => {
      const res = await duplicateProperty(id);
      if (res.ok && res.id) router.push(`/studio/listings/${res.id}`);
      else flash(false, res.message.slice(0, 60));
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        {/* ── Price ──────────────────────────────────────────────────── */}
        {editing ? (
          <span className="flex items-center gap-1">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") savePrice();
                if (e.key === "Escape") setEditing(false);
              }}
              placeholder="1.2cr"
              aria-label="Price"
              className="w-24 border border-brass bg-paper px-2 py-1 font-mono text-[0.6875rem] text-ink tabular-nums focus:outline-none"
            />
            <button
              type="button"
              onClick={savePrice}
              aria-label="Save price"
              className="grid size-7 place-items-center border border-verdant/50 text-verdant hover:bg-verdant hover:text-paper"
            >
              <Check className="size-3.5" strokeWidth={2.4} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              aria-label="Cancel"
              className="grid size-7 place-items-center border border-rule-strong text-ink-muted hover:bg-sand"
            >
              <X className="size-3.5" strokeWidth={2.2} aria-hidden />
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(current ? String(current) : "");
              setEditing(true);
            }}
            disabled={pending}
            title="Edit price inline"
            className={cn(
              "group inline-flex items-center gap-1.5 border border-transparent px-2 py-1 font-display text-[0.9375rem] text-ink transition-colors hover:border-rule-strong hover:bg-sand",
              pending && "opacity-50",
            )}
            data-numeric
          >
            {priceOnRequest ? "On request" : formatPrice(current)}
            <IndianRupee
              className="size-3 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100"
              strokeWidth={2}
              aria-hidden
            />
          </button>
        )}

        {/* ── Duplicate ──────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={duplicate}
          disabled={pending}
          title="Duplicate as a draft"
          aria-label={`Duplicate ${slug}`}
          className="grid size-8 place-items-center text-ink-muted transition-colors hover:bg-sand hover:text-ink disabled:opacity-40"
        >
          <Copy className="size-3.5" strokeWidth={1.8} aria-hidden />
        </button>
      </div>

      {note && (
        <span
          role="status"
          className={cn(
            "font-mono text-[0.5625rem] tracking-[0.1em] uppercase",
            note.ok ? "text-verdant" : "text-alert",
          )}
        >
          {note.text}
        </span>
      )}
    </div>
  );
}
