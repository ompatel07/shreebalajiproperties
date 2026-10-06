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
 * Two distinct reasons land here, and conflating them wastes an afternoon:
 *
 *   • authenticated but not authorised — a valid session whose account is not
 *     on the staff allow-list;
 *   • `?reason=unconfigured` — a public deployment with no Supabase
 *     credentials in its BUILD. The middleware refuses to open the panel
 *     there, because `NEXT_PUBLIC_*` values are inlined at build time and
 *     adding them afterwards does not reach an already-built bundle.
 */
export default async function DeniedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  if (reason === "unconfigured") {
    return (
      <div className="grid min-h-dvh place-items-center px-5 py-16">
        <div className="w-full max-w-lg text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-alert-pale text-alert">
            <ShieldAlert className="size-6" strokeWidth={1.8} aria-hidden />
          </span>

          <h1 className="mt-6 font-display text-h3 text-ink">Studio is locked</h1>

          <p className="mt-4 leading-relaxed text-ink-muted">
            This deployment was built without Supabase credentials, so there is
            no account system to sign in to. The panel stays locked rather than
            opening unauthenticated.
          </p>

          <p className="mt-4 text-[0.875rem] leading-relaxed text-ink-muted">
            <code className="font-mono text-[0.8125rem]">NEXT_PUBLIC_*</code>{" "}
            variables are baked in at build time. Setting them in the hosting
            dashboard does not change a bundle that is already built —{" "}
            <strong className="font-semibold text-ink">redeploy</strong> after
            adding them.
          </p>

          <Link
            href="/"
            className="mt-8 inline-block font-semibold text-[0.6875rem] tracking-[0.14em] text-ink-muted uppercase hover:text-brass"
          >
            ← Back to site
          </Link>
        </div>
      </div>
    );
  }

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
