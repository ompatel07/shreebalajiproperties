import type { Metadata } from "next";
import Link from "next/link";

import { safeNext as safeNextPath } from "@/lib/admin-access";

import { LoginForm } from "@/components/admin/LoginForm";
import { Monogram } from "@/components/ui/Logo";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `Sign in — Studio | ${site.name}`,
  robots: { index: false, follow: false, nocache: true },
};

interface Props {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;

  // Only a studio path is accepted, so `?next=` cannot be used as an open
  // redirect after sign-in ("/\evil.com" slipped past the old "//" check).
  // The sign-in action applies the same rule again server-side.
  const safeNext = safeNextPath(next);

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-5 py-16">
      <div className="jaali absolute inset-0" aria-hidden />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Monogram className="size-11 text-ink/70" />
          <h1 className="mt-5 font-display text-h3 text-ink">Studio</h1>
          <p className="mt-2 font-semibold text-[0.8125rem] text-ink-muted">
            {site.name} · Staff only
          </p>
        </div>

        <LoginForm next={safeNext} />

        <p className="mt-8 text-center text-[0.75rem] leading-relaxed text-ink-faint">
          Staff access only. There is no sign-up.
        </p>

        <p className="mt-6 text-center">
          <Link
            href="/"
            className="font-bold text-[0.9375rem] text-ink-muted hover:text-brass"
          >
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
