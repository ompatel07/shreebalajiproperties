"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowRight, Check, MessageCircle, Phone } from "lucide-react";

import { submitEnquiry, type ActionResult } from "@/app/actions/enquiry";
import { Field, Honeypot, Select, TextArea, TextInput } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { site } from "@/config/site";
import { cn, telLink, whatsappLink } from "@/lib/utils";

/**
 * The enquiry form.
 *
 * Conversion decisions, in the order they matter:
 *
 *   · **Three fields to submit.** Name, phone, and an optional message.
 *     Budget and timeline are present but optional — asking for them is what
 *     drives the lead score, but requiring them costs more leads than the
 *     score is worth.
 *   · **Call and WhatsApp sit above the form, not below it.** Most buyers in
 *     this market would rather talk. Making them scroll past a form to find
 *     the phone number is friction we can simply remove.
 *   · **Progressive enhancement.** It is a real `<form action={...}>`, so it
 *     posts and works before React hydrates.
 *   · The success state replaces the form rather than showing a toast above
 *     it, so there is no way to double-submit.
 */
export function EnquiryForm({
  propertyId,
  propertyTitle,
  projectId,
  source = "property_enquiry",
  compact = false,
  className,
}: {
  propertyId?: string;
  propertyTitle?: string;
  projectId?: string;
  source?: "property_enquiry" | "contact_form" | "calculator";
  compact?: boolean;
  className?: string;
}) {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const mountedAt = useRef<number>(Date.now());
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const waMessage = propertyTitle
    ? `Hi ${site.name}, I am interested in "${propertyTitle}". Could you share more details?`
    : `Hi ${site.name}, I would like help finding a property in Ahmedabad.`;

  function onSubmit(formData: FormData) {
    // Time-on-form, read by the bot heuristic in the action.
    formData.set("elapsedMs", String(Date.now() - mountedAt.current));

    startTransition(async () => {
      const res = await submitEnquiry(formData);
      setResult(res);
      if (res.ok) formRef.current?.reset();
    });
  }

  /* ── Success ─────────────────────────────────────────────────────────── */
  if (result?.ok) {
    return (
      <div className={cn(
          "pop-in rounded-[2px] border border-verdant/30 bg-verdant-pale p-7 text-center",
          className,
        )}
      >
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-verdant text-paper">
          <Check className="size-5" strokeWidth={2.4} aria-hidden />
        </span>

        <h3 className="mt-5 font-display text-h4 text-ink">Enquiry received</h3>
        <p className="mx-auto mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-ink-soft">
          {result.message}
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <a
            href={whatsappLink(site.contact.whatsapp, waMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-[2px] border border-verdant px-5 py-3 font-mono text-micro tracking-[0.14em] text-verdant uppercase transition-colors hover:bg-verdant hover:text-paper"
          >
            <MessageCircle className="size-3.5" strokeWidth={1.9} aria-hidden />
            Message us now
          </a>
          <a
            href={telLink(site.contact.phoneE164)}
            className="inline-flex items-center justify-center gap-2 rounded-[2px] px-5 py-3 font-mono text-micro tracking-[0.14em] text-ink-muted uppercase transition-colors hover:text-ink"
          >
            <Phone className="size-3.5" strokeWidth={1.9} aria-hidden />
            {site.contact.phoneDisplay}
          </a>
        </div>
      </div>
    );
  }

  /* ── Form ────────────────────────────────────────────────────────────── */
  const errors = result?.errors ?? {};

  return (
    <div
      className={cn(
        "rounded-[2px] border border-rule bg-paper p-6 lg:p-7",
        className,
      )}
    >
      <p className="eyebrow">Talk to an advisor</p>
      <h3 className="mt-2.5 font-display text-h4 leading-snug text-ink">
        {propertyTitle ? "Interested in this one?" : "Tell us what you are looking for"}
      </h3>
      <p className="mt-2 text-caption leading-relaxed text-ink-muted">
        No automated calls, no selling your number on. One advisor, one
        conversation.
      </p>

      {/* Direct channels, deliberately above the form. */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        <a
          href={telLink(site.contact.phoneE164)}
          className="flex items-center justify-center gap-2 rounded-[2px] border border-rule-strong py-3 font-mono text-micro tracking-[0.12em] text-ink uppercase transition-colors hover:border-ink hover:bg-ink hover:text-bone"
        >
          <Phone className="size-3.5" strokeWidth={1.9} aria-hidden />
          Call
        </a>
        <a
          href={whatsappLink(site.contact.whatsapp, waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-[2px] border border-verdant/40 py-3 font-mono text-micro tracking-[0.12em] text-verdant uppercase transition-colors hover:bg-verdant hover:text-paper"
        >
          <MessageCircle className="size-3.5" strokeWidth={1.9} aria-hidden />
          WhatsApp
        </a>
      </div>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-rule" aria-hidden />
        <span className="font-mono text-[0.5625rem] tracking-[0.16em] text-ink-faint uppercase">
          or send a brief
        </span>
        <span className="h-px flex-1 bg-rule" aria-hidden />
      </div>

      <form ref={formRef} action={onSubmit} className="relative space-y-4">
        <Honeypot />

        {propertyId && <input type="hidden" name="propertyId" value={propertyId} />}
        {projectId && <input type="hidden" name="projectId" value={projectId} />}
        <input type="hidden" name="source" value={source} />

        <Field label="Your name" required error={errors.name}>
          {(p) => (
            <TextInput
              {...p}
              name="name"
              autoComplete="name"
              placeholder="Rahul Shah"
              required
              maxLength={120}
            />
          )}
        </Field>

        <Field label="Mobile" required error={errors.phone} hint="We call from a Gujarat landline, never a bot.">
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

        {!compact && (
          <>
            <Field label="Email" error={errors.email} hint="Optional — for floor plans and the price sheet.">
              {(p) => (
                <TextInput
                  {...p}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  maxLength={180}
                />
              )}
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Budget" error={errors.budgetMax}>
                {(p) => (
                  <Select {...p} name="budgetMax" defaultValue="">
                    <option value="">Not sure yet</option>
                    <option value="5000000">Up to ₹50 Lakh</option>
                    <option value="7500000">₹50 – 75 Lakh</option>
                    <option value="10000000">₹75 Lakh – ₹1 Cr</option>
                    <option value="20000000">₹1 – 2 Cr</option>
                    <option value="30000000">₹2 – 3 Cr</option>
                    <option value="50000000">₹3 – 5 Cr</option>
                    <option value="100000000">Above ₹5 Cr</option>
                  </Select>
                )}
              </Field>

              <Field label="Timeline" error={errors.timeline}>
                {(p) => (
                  <Select {...p} name="timeline" defaultValue="">
                    <option value="">—</option>
                    <option value="immediate">Ready now</option>
                    <option value="3m">Within 3 months</option>
                    <option value="6m">Within 6 months</option>
                    <option value="exploring">Just exploring</option>
                  </Select>
                )}
              </Field>
            </div>
          </>
        )}

        <Field label="Anything specific?" error={errors.message}>
          {(p) => (
            <TextArea
              {...p}
              name="message"
              rows={compact ? 2 : 3}
              maxLength={2000}
              placeholder={
                propertyTitle
                  ? "Floor preference, possession date, loan help…"
                  : "Locality, configuration, school nearby, possession…"
              }
            />
          )}
        </Field>

        {result && !result.ok && (
          <p role="alert" className="rounded-[2px] bg-alert-pale px-3.5 py-3 text-caption text-alert">
            {result.message}
          </p>
        )}

        <Button
          type="submit"
          disabled={pending}
          fullWidth
          size="lg"
          icon={!pending && <ArrowRight className="size-4" strokeWidth={2} aria-hidden />}
        >
          {pending ? "Sending…" : "Send enquiry"}
        </Button>

        <p className="text-center text-[0.6875rem] leading-relaxed text-ink-faint">
          By sending this you agree we may contact you about your enquiry. We do
          not sell or share your number. See our{" "}
          <a href="/privacy" className="link-draw text-ink-muted">
            privacy policy
          </a>
          .
        </p>
      </form>
    </div>
  );
}
