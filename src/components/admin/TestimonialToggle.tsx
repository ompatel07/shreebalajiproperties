"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";

import { setTestimonialPublished } from "@/app/studio/actions";
import { cn } from "@/lib/utils";

/** Publish / hide a testimonial. Revalidates the homepage on success. */
export function TestimonialToggle({
  id,
  published,
}: {
  id: string;
  published: boolean;
}) {
  const [current, setCurrent] = useState(published);
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  function toggle() {
    const next = !current;
    setCurrent(next);
    setFailed(false);

    startTransition(async () => {
      const result = await setTestimonialPublished(id, next);
      if (!result.ok) {
        setCurrent(!next);
        setFailed(true);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {failed && (
        <span role="alert" className="text-[0.5625rem] text-alert">
          Failed
        </span>
      )}

      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={current}
        className={cn(
          "inline-flex items-center gap-2 rounded-[2px] border px-3.5 py-2 font-semibold text-[0.6875rem] tracking-[0.1em] uppercase transition-colors disabled:opacity-50",
          current
            ? "border-verdant/40 bg-verdant-pale text-verdant hover:bg-verdant hover:text-paper"
            : "border-rule-strong text-ink-muted hover:border-ink hover:bg-ink hover:text-bone",
        )}
      >
        {current ? (
          <>
            <Eye className="size-3" strokeWidth={1.9} aria-hidden />
            Live
          </>
        ) : (
          <>
            <EyeOff className="size-3" strokeWidth={1.9} aria-hidden />
            Hidden
          </>
        )}
      </button>
    </div>
  );
}
