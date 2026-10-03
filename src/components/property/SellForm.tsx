"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowRight, Check } from "lucide-react";

import { submitSellRequest, type ActionResult } from "@/app/actions/enquiry";
import { Button } from "@/components/ui/Button";
import { Field, Honeypot, Select, TextArea, TextInput } from "@/components/ui/Field";
import { localities, propertyTypes, site } from "@/config/site";

/**
 * Sell / list-with-us form.
 *
 * Asks for enough to give a real valuation opinion on the first call —
 * locality, type, configuration, carpet area and the owner's expectation —
 * without turning into a twenty-field intake form. Everything beyond name and
 * phone is optional.
 */
export function SellForm() {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const mountedAt = useRef(Date.now());
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  function onSubmit(formData: FormData) {
    formData.set("elapsedMs", String(Date.now() - mountedAt.current));

    startTransition(async () => {
      const res = await submitSellRequest(formData);
      setResult(res);
      if (res.ok) formRef.current?.reset();
    });
  }

  if (result?.ok) {
    return (
      <div className="pop-in rounded-[2px] border border-verdant/30 bg-verdant-pale p-7 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-verdant text-paper">
          <Check className="size-5" strokeWidth={2.4} aria-hidden />
        </span>
        <h3 className="mt-5 font-display text-h4 text-ink">Details received</h3>
        <p className="mx-auto mt-3 max-w-sm leading-relaxed text-ink-soft">{result.message}</p>
      </div>
    );
  }

  const errors = result?.errors ?? {};
  const residential = propertyTypes.filter((t) => t.category === "residential");
  const commercial = propertyTypes.filter((t) => t.category === "commercial");
  const land = propertyTypes.filter((t) => t.category === "land");

  return (
    <div className="rounded-[2px] border border-rule bg-paper p-6 lg:p-8">
      <p className="eyebrow">List with us</p>
      <h2 className="mt-2.5 font-display text-h4 leading-snug text-ink">
        What are you selling?
      </h2>
      <p className="mt-2 max-w-md text-caption leading-relaxed text-ink-muted">
        Enough detail to give you an honest number on the first call. Only your
        name and mobile are required.
      </p>

      <form ref={formRef} action={onSubmit} className="relative mt-7 space-y-4">
        <Honeypot />

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

          <Field label="Email" error={errors.email} className="sm:col-span-2">
            {(p) => (
              <TextInput
                {...p}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                maxLength={180}
              />
            )}
          </Field>

          <Field label="Locality" required error={errors.locality}>
            {(p) => (
              <Select {...p} name="locality" required defaultValue="">
                <option value="" disabled>
                  Select…
                </option>
                {localities.map((l) => (
                  <option key={l.slug} value={l.slug}>
                    {l.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field label="Property type" required error={errors.propertyType}>
            {(p) => (
              <Select {...p} name="propertyType" required defaultValue="">
                <option value="" disabled>
                  Select…
                </option>
                <optgroup label="Residential">
                  {residential.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.singular}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Commercial">
                  {commercial.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.singular}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Land">
                  {land.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.singular}
                    </option>
                  ))}
                </optgroup>
              </Select>
            )}
          </Field>

          <Field label="Configuration" error={errors.bhk}>
            {(p) => (
              <Select {...p} name="bhk" defaultValue="">
                <option value="">Not applicable</option>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} BHK
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <Field
            label="Carpet area (sq.ft)"
            error={errors.carpetSqft}
            hint="From your sale deed or RERA carpet certificate."
          >
            {(p) => (
              <TextInput
                {...p}
                name="carpetSqft"
                type="number"
                inputMode="numeric"
                min="50"
                placeholder="1250"
              />
            )}
          </Field>

          <Field
            label="Your expectation (₹)"
            error={errors.expectedPrice}
            hint="Full rupee value. Leave blank if you want us to suggest one."
            className="sm:col-span-2"
          >
            {(p) => (
              <TextInput
                {...p}
                name="expectedPrice"
                type="number"
                inputMode="numeric"
                min="100000"
                placeholder="9500000"
              />
            )}
          </Field>

          <Field label="Anything else?" error={errors.message} className="sm:col-span-2">
            {(p) => (
              <TextArea
                {...p}
                name="message"
                rows={3}
                maxLength={2000}
                placeholder="Floor, facing, tenanted or vacant, how soon you need to sell…"
              />
            )}
          </Field>
        </div>

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
          {pending ? "Sending…" : "Get a valuation"}
        </Button>

        <p className="text-center text-[0.6875rem] leading-relaxed text-ink-faint">
          No listing fee, and no obligation to proceed. We will tell you what it
          should fetch and how long it is likely to take — including if the
          answer is &ldquo;hold for another year&rdquo;. See our{" "}
          <a href="/privacy" className="link-draw text-ink-muted">
            privacy policy
          </a>
          .
        </p>
      </form>
    </div>
  );
}
