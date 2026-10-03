"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { CalendarCheck, Check } from "lucide-react";

import { requestSiteVisit, type ActionResult } from "@/app/actions/enquiry";
import { Field, Honeypot, Select, TextInput } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Site-visit scheduler.
 *
 * Deliberately NOT a live availability calendar: the client has no calendar
 * system for this to read, and a slot that says "available" and then gets a
 * call saying otherwise is worse than no slot at all. So this *requests* a
 * slot, says plainly that it will be confirmed by phone, and lands in the
 * admin panel as a high-score lead with `status = visit_scheduled`.
 *
 * Dates are generated client-side for the next 14 days, Sundays excluded —
 * matching the office hours in `site.config`.
 */
export function SiteVisitForm({
  propertyId,
  projectId,
  propertyTitle,
}: {
  propertyId?: string;
  projectId?: string;
  propertyTitle: string;
}) {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  // The next 14 days, Sundays dropped.
  const dates = useMemo(() => {
    const out: { value: string; label: string }[] = [];
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    for (let i = 1; out.length < 12 && i <= 20; i++) {
      const d = new Date(cursor);
      d.setDate(d.getDate() + i);
      if (d.getDay() === 0) continue; // closed Sunday

      // Build the value from local parts — `toISOString()` would shift the
      // date backwards for anyone east of UTC, which includes all of India.
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate(),
      ).padStart(2, "0")}`;

      out.push({
        value,
        label: d.toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
      });
    }
    return out;
  }, []);

  const slots = useMemo(() => {
    const out: string[] = [];
    for (let h = 10; h <= 19; h++) {
      out.push(`${String(h).padStart(2, "0")}:00`);
      if (h < 19) out.push(`${String(h).padStart(2, "0")}:30`);
    }
    return out;
  }, []);

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await requestSiteVisit(formData);
      setResult(res);
      if (res.ok) formRef.current?.reset();
    });
  }

  if (result?.ok) {
    return (
      <div className="pop-in rounded-[2px] border border-verdant/30 bg-verdant-pale p-7">
        <span className="grid size-11 place-items-center rounded-full bg-verdant text-paper">
          <Check className="size-5" strokeWidth={2.4} aria-hidden />
        </span>
        <h3 className="mt-4 font-display text-h4 text-ink">Visit requested</h3>
        <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-ink-soft">
          {result.message}
        </p>
      </div>
    );
  }

  const errors = result?.errors ?? {};

  return (
    <section
      aria-labelledby="visit"
      className="rounded-[2px] border border-rule bg-paper p-6 lg:p-8"
    >
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-[2px] border border-rule text-brass">
          <CalendarCheck className="size-5" strokeWidth={1.6} aria-hidden />
        </span>

        <div>
          <h2 id="visit" className="font-display text-h4 text-ink">
            See it in person
          </h2>
          <p className="mt-1.5 max-w-lg text-caption leading-relaxed text-ink-muted">
            Pick a slot that suits you and we will confirm by phone before you
            travel — we would rather call than have you arrive to a locked gate.
          </p>
        </div>
      </div>

      <form ref={formRef} action={onSubmit} className="relative mt-7 space-y-4">
        <Honeypot />
        {propertyId && <input type="hidden" name="propertyId" value={propertyId} />}
        {projectId && <input type="hidden" name="projectId" value={projectId} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your name" required error={errors.name}>
            {(p) => (
              <TextInput {...p} name="name" autoComplete="name" required maxLength={120} />
            )}
          </Field>

          <Field label="Mobile" required error={errors.phone}>
            {(p) => (
              <TextInput
                {...p}
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="98765 43210"
                required
                maxLength={20}
              />
            )}
          </Field>

          <Field label="Preferred date" required error={errors.slotDate}>
            {(p) => (
              <Select {...p} name="slotDate" required defaultValue={dates[0]?.value ?? ""}>
                {dates.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="Time" required error={errors.slotTime}>
            {(p) => (
              <Select {...p} name="slotTime" required defaultValue="11:00">
                {slots.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="How many visiting?" error={errors.partySize}>
            {(p) => (
              <Select {...p} name="partySize" defaultValue="2">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "person" : "people"}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="Anything we should know?" error={errors.message}>
            {(p) => (
              <TextInput
                {...p}
                name="message"
                maxLength={1000}
                placeholder="Coming from Gandhinagar, prefer morning…"
              />
            )}
          </Field>
        </div>

        {result && !result.ok && (
          <p role="alert" className="rounded-[2px] bg-alert-pale px-3.5 py-3 text-caption text-alert">
            {result.message}
          </p>
        )}

        <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center")}>
          <Button type="submit" disabled={pending} size="lg" className="sm:w-auto">
            {pending ? "Requesting…" : "Request this slot"}
          </Button>
          <p className="text-[0.75rem] leading-relaxed text-ink-faint">
            Free, and no obligation. We visit {propertyTitle.slice(0, 48)}
            {propertyTitle.length > 48 ? "…" : ""} with you.
          </p>
        </div>
      </form>
    </section>
  );
}
