import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { SignOutButton } from "@/components/admin/SignOutButton";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `Access denied — Studio | ${site.name}`,
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Reached when a session is valid but the account is not on the staff
 * allow-list — i.e. authenticated but not authorised. Kept as its own page so
 * the distinction is visible to whoever is troubleshooting.
 */
export default function DeniedPage() {
  return (
    <div className="grid min-h-dvh place-items-center px-5 py-16">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-alert-pale text-alert">
          <ShieldAlert className="size-6" strokeWidth={1.8} aria-hidden />
        </span>

        <h1 className="mt-6 font-display text-h3 text-ink">Not authorised</h1>

        <p className="mt-4 leading-relaxed text-ink-muted">
          You are signed in, but this account is not on the studio allow-list.
          Access requires both a staff <code className="font-mono text-[0.8125rem]">profiles</code>{" "}
          row with the role <code className="font-mono text-[0.8125rem]">admin</code> or{" "}
          <code className="font-mono text-[0.8125rem]">agent</code>, and the
          email listed in <code className="font-mono text-[0.8125rem]">ADMIN_EMAILS</code>.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4">
          <SignOutButton />
          <Link
            href="/"
            className="font-semibold text-[0.6875rem] tracking-[0.14em] text-ink-muted uppercase hover:text-brass"
          >
            ← Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}
