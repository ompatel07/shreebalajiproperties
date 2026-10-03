import type { Metadata } from "next";
import Link from "next/link";

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

  // Only ever accept a same-site path, so `?next=` cannot be used as an
  // open-redirect into an attacker's page after a successful login.
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/studio";

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-5 py-16">
      <div className="jaali absolute inset-0" aria-hidden />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Monogram className="size-11 text-ink/70" />
          <h1 className="mt-5 font-display text-h3 text-ink">Studio</h1>
          <p className="mt-2 font-mono text-micro tracking-[0.14em] text-ink-muted uppercase">
            {site.name} · Staff only
          </p>
        </div>

        <LoginForm next={safeNext} />

        <p className="mt-8 text-center text-[0.75rem] leading-relaxed text-ink-faint">
          There is no self-service signup. Accounts are created by an
          administrator in Supabase and must carry a staff profile row — see
          the bootstrap notes at the end of{" "}
          <code className="font-mono text-[0.6875rem]">supabase/schema.sql</code>.
        </p>

        <p className="mt-6 text-center">
          <Link
            href="/"
            className="font-mono text-[0.5625rem] tracking-[0.14em] text-ink-muted uppercase hover:text-brass"
          >
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
