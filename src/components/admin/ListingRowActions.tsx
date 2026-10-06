"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Archive, Check, Copy, IndianRupee, Trash2, X } from "lucide-react";

import {
  archiveProperty,
  deleteProperty,
  duplicateProperty,
  updatePropertyPrice,
} from "@/app/studio/actions";
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
 *   · **Archive** — the safe removal. Hides the listing from the public site
 *     without breaking anything that points at it.
 *   · **Delete** — permanent. Guarded by a typed confirmation rather than a
 *     `confirm()` dialog, because those get dismissed by reflex. The row is
 *     snapshotted into the audit log first, so it is recoverable.
 */
export function ListingRowActions({
  id,
  slug,
  price,
  priceOnRequest,
  title,
  refCode,
  status,
}: {
  id: string;
  slug: string;
  price: number | null;
  priceOnRequest: boolean;
  title: string;
  /** e.g. "SK-0042". Absent until the reference migration has been run. */
  refCode?: string | null;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(price ? String(price) : "");
  const [current, setCurrent] = useState(price);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [gone, setGone] = useState(false);

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

  function archive() {
    startTransition(async () => {
      const res = await archiveProperty(id);
      if (res.ok) {
        flash(true, "Archived");
        router.refresh();
      } else flash(false, res.message.slice(0, 60));
    });
  }

  function remove() {
    startTransition(async () => {
      const res = await deleteProperty(id, typed);
      if (res.ok) {
        // Hide the row immediately. `router.refresh()` re-renders the server
        // component, but on a long table the row lingering for a beat after a
        // delete reads as "it did not work" and invites a second click.
        setGone(true);
        setConfirming(false);
        router.refresh();
      } else {
        flash(false, res.message.slice(0, 70));
      }
    });
  }

  if (gone) {
    return (
      <span className="text-[0.75rem] font-semibold text-ink-faint">Deleted</span>
    );
  }

  if (confirming) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <p className="max-w-[18rem] text-right text-[0.75rem] leading-snug text-ink-muted">
          Permanently delete{" "}
          <span className="font-semibold text-ink">{refCode ?? title}</span>? Its
          enquiries and site visits are kept.
        </p>
        <div className="flex items-center gap-1.5">
          <input
            autoFocus
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && typed.trim().toUpperCase() === "DELETE") remove();
              if (e.key === "Escape") { setConfirming(false); setTyped(""); }
            }}
            placeholder="Type DELETE"
            aria-label="Type DELETE to confirm"
            className="w-28 rounded-[2px] border border-alert/60 bg-paper px-2 py-1 text-[0.75rem] text-ink focus:border-alert focus:outline-none"
          />
          <button
            type="button"
            onClick={remove}
            disabled={pending || typed.trim().toUpperCase() !== "DELETE"}
            className="rounded-[2px] bg-alert px-2.5 py-1.5 text-[0.6875rem] font-semibold text-paper disabled:opacity-35"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => { setConfirming(false); setTyped(""); }}
            aria-label="Cancel delete"
            className="grid size-7 place-items-center rounded-[2px] border border-rule-strong text-ink-muted hover:bg-sand"
          >
            <X className="size-3.5" strokeWidth={2.2} aria-hidden />
          </button>
        </div>
        {note && !note.ok && (
          <span role="status" className="text-[0.6875rem] font-semibold text-alert">
            {note.text}
          </span>
        )}
      </div>
    );
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
              "group inline-flex items-center gap-1.5 border border-transparent px-2 py-1 text-[0.9375rem] font-semibold text-ink transition-colors hover:border-rule-strong hover:bg-sand",
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

        {/* ── Archive — the safe removal ─────────────────────────────── */}
        {status !== "archived" && (
          <button
            type="button"
            onClick={archive}
            disabled={pending}
            title="Archive — hides it from the public site, keeps the record"
            aria-label={`Archive ${title}`}
            className="grid size-8 place-items-center text-ink-muted transition-colors hover:bg-sand hover:text-ink disabled:opacity-40"
          >
            <Archive className="size-3.5" strokeWidth={1.8} aria-hidden />
          </button>
        )}

        {/* ── Delete — permanent ─────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => setConfirming(true)}
          disabled={pending}
          title="Delete permanently"
          aria-label={`Delete ${title}`}
          className="grid size-8 place-items-center text-ink-faint transition-colors hover:bg-alert-pale hover:text-alert disabled:opacity-40"
        >
          <Trash2 className="size-3.5" strokeWidth={1.8} aria-hidden />
        </button>
      </div>

      {note && (
        <span
          role="status"
          className={cn(
            "font-semibold text-[0.6875rem] tracking-[0.1em] uppercase",
            note.ok ? "text-verdant" : "text-alert",
          )}
        >
          {note.text}
        </span>
      )}
    </div>
  );
}
