"use client";

import { useState, useTransition } from "react";
import { ArrowRight } from "lucide-react";

import { signIn, type AdminResult } from "@/app/studio/actions";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";

/**
 * Staff sign-in.
 *
 * Deliberately minimal: no "remember me" (Supabase handles session
 * persistence), no social login, no signup link, and no password-reset link —
 * a reset flow would need email delivery, which this build avoids on purpose.
 * The owner resets passwords from the Supabase dashboard.
 *
 * Note the action returns only a generic failure message. Distinguishing
 * "wrong password" from "no such account" would let someone enumerate which
 * emails have studio access.
 */
export function LoginForm({ next }: { next: string }) {
  const [result, setResult] = useState<AdminResult | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      // On success the action redirects, so nothing comes back to set.
      const res = await signIn(formData);
      setResult(res);
    });
  }

  const errors = result?.errors ?? {};

  return (
    <form
      action={onSubmit}
      className="space-y-5 rounded-[2px] border border-rule bg-paper p-7 shadow-[var(--shadow-raise)]"
    >
      <input type="hidden" name="next" value={next} />

      <Field label="Email" required error={errors.email}>
        {(p) => (
          <TextInput
            {...p}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            required
            autoFocus
            placeholder="you@example.com"
          />
        )}
      </Field>

      <Field label="Password" required error={errors.password}>
        {(p) => (
          <TextInput
            {...p}
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            placeholder="••••••••"
          />
        )}
      </Field>

      {result && !result.ok && !result.errors && (
        <p
          role="alert"
          className="rounded-[2px] bg-alert-pale px-3.5 py-3 text-caption text-alert"
        >
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
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
