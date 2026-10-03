"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";

import { signOut } from "@/app/studio/actions";

/**
 * Sign out. A form POST to a Server Action rather than a link, because
 * signing out mutates state and must not be triggerable by a prefetch or a
 * crawler following a GET.
 */
export function SignOutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <form action={() => startTransition(() => void signOut())}>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 font-mono text-[0.5625rem] tracking-[0.12em] text-ink-muted uppercase transition-colors hover:text-alert disabled:opacity-50"
      >
        <LogOut className="size-3" strokeWidth={1.9} aria-hidden />
        {pending ? "Signing out…" : "Sign out"}
      </button>
    </form>
  );
}
