import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarCheck,
  Building2,
  Home,
  LayoutDashboard,
  MessageSquareQuote,
  Users,
} from "lucide-react";

import { SignOutButton } from "@/components/admin/SignOutButton";
import { StudioNav } from "@/components/admin/StudioNav";
import { Monogram } from "@/components/ui/Logo";
import { site } from "@/config/site";
import { isDemoMode } from "@/lib/demo-data";
import { demoProfile } from "@/lib/demo-studio";
import { createClient } from "@/lib/supabase/server";

/**
 * Admin shell.
 *
 * `noindex, nofollow` plus `Cache-Control: no-store` (set in next.config.ts)
 * — an admin panel must never be indexed or held in a shared cache.
 *
 * The nav is rendered for every `/studio` route including `/studio/login`,
 * but the identity strip only appears once there is a session, so the login
 * page does not render an empty user block.
 */
export const metadata: Metadata = {
  title: `Studio — ${site.name}`,
  robots: { index: false, follow: false, nocache: true },
};

const navItems = [
  { href: "/studio", label: "Overview", icon: LayoutDashboard },
  { href: "/studio/listings", label: "Listings", icon: Home },
  { href: "/studio/leads", label: "Leads", icon: Users },
  { href: "/studio/visits", label: "Site visits", icon: CalendarCheck },
  { href: "/studio/projects", label: "Projects", icon: Building2 },
  { href: "/studio/testimonials", label: "Testimonials", icon: MessageSquareQuote },
];

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const demo = isDemoMode();

  // Skip the auth round trip entirely when there is no Supabase to ask.
  const supabase = demo ? null : await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  // Named type, rather than `typeof profile` inside the branch — the latter
  // reads the already-narrowed type and collapses to `never`.
  type StaffProfile = { full_name: string | null; email: string; role: string };
  let profile: StaffProfile | null = null;

  if (demo) {
    profile = demoProfile as StaffProfile;
  } else if (user && supabase) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, email, role")
      .eq("id", user.id)
      .maybeSingle();
    profile = (data as StaffProfile | null) ?? null;
  }

  // No session (login / denied pages) → render bare, no chrome.
  if (!profile) {
    return <div className="min-h-dvh bg-bone">{children}</div>;
  }

  return (
    <div className="min-h-dvh bg-bone lg:grid lg:grid-cols-[15rem_1fr]">
      {/* ══ Sidebar ═══════════════════════════════════════════════════════ */}
      <aside className="relative hidden border-r border-rule bg-sand lg:block">
        <div className="blueprint absolute inset-0 opacity-30" aria-hidden />

        <div className="sticky top-0 flex h-dvh flex-col">
          <div className="flex items-center gap-3 border-b border-rule px-5 py-5">
            <Monogram className="size-8 text-ink/70" />
            <div>
              <p className="font-display text-[1.0625rem] leading-none text-ink">
                Studio
              </p>
              <p className="mt-1 font-mono text-[0.5rem] tracking-[0.18em] text-ink-muted uppercase">
                {site.name}
              </p>
            </div>
          </div>

          <StudioNav items={navItems.map(({ icon, ...rest }) => rest)} />

          {/* Identity + sign out, pinned to the bottom. */}
          <div className="relative mt-auto border-t border-rule p-5">
            <p className="truncate font-display text-[0.9375rem] text-ink">
              {profile.full_name ?? profile.email}
            </p>
            <p className="mt-0.5 truncate font-mono text-[0.5rem] tracking-[0.14em] text-ink-muted uppercase">
              {profile.role}
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[0.5625rem] tracking-[0.12em] text-ink-muted uppercase hover:text-brass"
              >
                View live site ↗
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </aside>

      {/* ══ Content ═══════════════════════════════════════════════════════ */}
      <div className="min-w-0">
        {/* Mobile top bar — the sidebar is desktop-only, so the nav scrolls
            horizontally here instead. */}
        <div className="border-b border-rule bg-sand lg:hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2.5">
              <Monogram className="size-7 text-ink/70" />
              <span className="font-display text-[1.0625rem] text-ink">Studio</span>
            </div>
            <SignOutButton />
          </div>

          <StudioNav
            items={navItems.map(({ icon, ...rest }) => rest)}
            orientation="horizontal"
          />
        </div>

        {demo && <DemoStudioNotice />}

        {children}
      </div>
    </div>
  );
}

/**
 * Unmissable while the studio is open without authentication. It should be
 * impossible to look at this panel and think it is a live, secured session.
 */
function DemoStudioNotice() {
  return (
    <div className="border-b border-brass/40 bg-brass-pale px-5 py-3 lg:px-10">
      <p className="text-[0.75rem] leading-snug text-brass-deep">
        <strong className="font-medium">
          Demo mode — sign-in is bypassed and all records below are fictional.
        </strong>{" "}
        Supabase is not connected, so there is no session to establish and no
        real data to protect. Editing is disabled. Add your Supabase
        credentials to <code className="font-mono text-[0.6875rem]">.env.local</code>{" "}
        and this panel immediately requires a real staff login.
      </p>
    </div>
  );
}
