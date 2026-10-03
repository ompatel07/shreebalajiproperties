"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

import { site } from "@/config/site";
import { telLink } from "@/lib/utils";

/**
 * Route error boundary.
 *
 * Deliberately shows the visitor nothing technical. `error.message` from a
 * server component is already redacted in production by Next.js, but even the
 * digest is noise to a buyer — so they get a retry, a phone number, and the
 * `digest` only as small print so support can correlate it with a log line.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Replace with a real error reporter (Sentry, Axiom) when one is added.
    console.error("[route-error]", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="grid min-h-[70svh] place-items-center px-5 py-20">
      <div className="w-full max-w-lg text-center">
        <p className="eyebrow">Something broke</p>

        <h1 className="display-tight mt-5 font-display text-h2 text-ink">
          That did not load properly.
        </h1>

        <p className="mx-auto mt-5 max-w-md leading-relaxed text-ink-muted">
          Our fault, not yours. Try again — and if it keeps happening, call us
          and we will deal with it personally rather than leave you clicking.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-13 items-center justify-center gap-2.5 rounded-[2px] bg-ink px-7 py-4 font-mono text-micro tracking-[0.14em] text-bone uppercase transition-colors hover:bg-brass-deep"
          >
            <RotateCcw className="size-3.5" strokeWidth={2} aria-hidden />
            Try again
          </button>

          <a
            href={telLink(site.contact.phoneE164)}
            className="inline-flex h-13 items-center justify-center gap-2.5 rounded-[2px] border border-ink/25 px-7 py-4 font-mono text-micro tracking-[0.14em] text-ink uppercase transition-colors hover:border-ink hover:bg-ink hover:text-bone"
          >
            {site.contact.phoneDisplay}
          </a>
        </div>

        {error.digest && (
          <p className="mt-10 font-mono text-[0.5625rem] tracking-[0.1em] text-ink-faint uppercase">
            Reference {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
