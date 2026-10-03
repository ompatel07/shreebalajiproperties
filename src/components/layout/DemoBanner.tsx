import { AlertTriangle } from "lucide-react";

import { isDemoMode } from "@/lib/demo-data";

/**
 * Demo-mode notice.
 *
 * Renders only while `NEXT_PUBLIC_SUPABASE_URL` is absent or still a
 * placeholder — the same condition that activates the fixture fallback. It
 * disappears the moment real credentials exist, with nothing to remember to
 * remove.
 *
 * It exists because the alternative is worse: a site showing fictional
 * builders, invented prices and fake RERA numbers with no indication that
 * they are not real. Anyone reviewing this — including the client — should
 * be able to tell at a glance.
 */
export function DemoBanner() {
  if (!isDemoMode()) return null;

  return (
    <div className="relative z-[70] border-b border-brass/40 bg-brass-pale">
      <div className="shell flex items-start gap-3 py-2.5">
        <AlertTriangle
          className="mt-0.5 size-3.5 shrink-0 text-brass-deep"
          strokeWidth={2.2}
          aria-hidden
        />
        <p className="text-[0.75rem] leading-snug text-brass-deep">
          <strong className="font-medium">Demo mode — all data below is fictional.</strong>{" "}
          Supabase is not connected, so listings, developers, projects and
          testimonials are placeholder fixtures. Add your Supabase credentials
          to <code className="font-mono text-[0.6875rem]">.env.local</code> and
          this banner disappears on its own.
        </p>
      </div>
    </div>
  );
}
