"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, Phone, Search, X } from "lucide-react";

import { Logo } from "@/components/ui/Logo";
import {
  budgetBands,
  localities,
  possessionStatuses,
  propertyTypes,
  site,
  zoneLabels,
  type Zone,
} from "@/config/site";
import { cn, telLink } from "@/lib/utils";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HEADER
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Two states. Over the homepage hero it is transparent with light type; from
 * ~90px of scroll (and on every inner page) it becomes an opaque bone bar
 * with a hairline.
 *
 * The mega panels are not decoration — they are how a visitor and a crawler
 * reach the whole programmatic taxonomy. Every property type, budget band
 * and locality is one click from any page, and that internal linking is a
 * large part of why those landing pages rank.
 *
 * All enter/exit animation is CSS (`.panel-drop`, `.overlay`, `.sheet-right`,
 * `.collapse`). Panels stay mounted and toggle `data-open`, which is what
 * let framer-motion come out of the bundle entirely.
 */

type PanelKey = "buy" | "localities" | "tools" | null;

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [panel, setPanel] = useState<PanelKey>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isHome = pathname === "/";
  /* Transparent only. The homepage hero is ivory from its first pixel, so the
     bar never needs a light colourway — which also removes the contrast
     failure it used to have over the sky in the old photo hero. */
  const atTop = isHome && !scrolled && !panel;
  const hidden = pathname.startsWith("/studio");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 90);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setPanel(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setPanel(null);
      setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock the page behind the mobile drawer.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  if (hidden) return null;

  /** Grace period so the pointer can cross the gap into the panel. */
  const openPanel = (key: PanelKey) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setPanel(key);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setPanel(null), 160);
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
          atTop
            ? "border-b border-transparent bg-transparent"
            : "border-b border-rule bg-bone/90 backdrop-blur-xl",
        )}
        onMouseLeave={scheduleClose}
      >
        <div className="shell flex h-16 flex-nowrap items-center justify-between gap-3 lg:h-[4.75rem] xl:gap-6">
          <Logo tone="ink" />

          {/* ── Desktop nav ───────────────────────────────────────────── */}
          <nav
            aria-label="Primary"
            className="hidden min-w-0 flex-nowrap items-center gap-0.5 lg:flex"
          >
            <NavTrigger label="Buy" active={panel === "buy"} onOpen={() => openPanel("buy")} />
            <NavTrigger label="Localities" active={panel === "localities"} onOpen={() => openPanel("localities")} />
            <NavLink href="/projects" onHover={() => openPanel(null)}>
              Projects
            </NavLink>
            <NavTrigger label="Tools" active={panel === "tools"} onOpen={() => openPanel("tools")} />
            <NavLink href="/sell" onHover={() => openPanel(null)}>
              Sell
            </NavLink>
            {/* The builder audience is real but secondary — one clear link,
                set apart from the buyer items by a hairline. */}
            <span className="mx-2 h-3.5 w-px shrink-0 bg-current opacity-25" aria-hidden />
            <NavLink href="/for-builders" onHover={() => openPanel(null)}>
              For Builders
            </NavLink>
          </nav>

          {/* ── Actions ───────────────────────────────────────────────── */}
          <div className="flex shrink-0 flex-nowrap items-center gap-1.5 sm:gap-2">
            {/* A visible search field, not an icon. The brief was that the
                site must be easy to search, and an icon hides the single most
                used action behind a guess. Collapses to an icon only where
                there is genuinely no room. */}
            <form
              action="/properties"
              method="get"
              className="hidden shrink-0 items-center gap-2 rounded-full border border-rule-strong bg-paper px-3.5 py-2 transition-colors duration-300 focus-within:border-brass xl:flex"
            >
              <Search
                className="size-[0.9rem] shrink-0 text-ink-faint"
                strokeWidth={2}
                aria-hidden
              />
              <input
                type="search"
                name="q"
                placeholder="Search area or project"
                aria-label="Search properties"
                enterKeyHint="search"
                maxLength={120}
                className="w-40 bg-transparent text-[0.8125rem] text-ink placeholder:text-ink-faint focus:outline-none"
              />
            </form>

            <Link
              href="/properties"
              aria-label="Search properties"
              className="grid size-10 shrink-0 place-items-center rounded-full text-ink transition-colors duration-300 hover:bg-sand xl:hidden"
            >
              <Search className="size-[1.05rem]" strokeWidth={1.6} aria-hidden />
            </Link>

            <a
              href={telLink(site.contact.phoneE164)}
              className="hidden shrink-0 items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-[0.8125rem] font-semibold whitespace-nowrap text-bone transition-colors duration-300 hover:bg-brass-deep sm:inline-flex"
            >
              <Phone className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
              {/* The full number only once there is genuinely room for it.
                  Showing it from lg was what pushed the bar into a wrap. */}
              <span className="hidden 2xl:inline" data-numeric>
                {site.contact.phoneDisplay}
              </span>
              <span className="2xl:hidden">Call</span>
            </a>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              className="grid size-10 shrink-0 place-items-center rounded-full text-ink transition-colors duration-300 hover:bg-sand lg:hidden"
            >
              <Menu className="size-5" strokeWidth={1.6} aria-hidden />
            </button>
          </div>
        </div>

        {/* ── Mega panels. Mounted always, toggled with data-open. ────── */}
        <div
          className="panel-drop absolute inset-x-0 top-full hidden border-b border-rule bg-bone shadow-[var(--shadow-float)] lg:block"
          data-open={panel ? "1" : "0"}
          aria-hidden={!panel}
          /* `inert` removes the closed panel from the tab order entirely.
             `aria-hidden` alone hides it from screen readers but leaves its
             links keyboard-focusable, which strands sighted keyboard users
             in an invisible menu. */
          inert={!panel}
          onMouseEnter={() => panel && openPanel(panel)}
        >
          <div className="shell py-10">
            {panel === "buy" && <BuyPanel />}
            {panel === "localities" && <LocalityPanel />}
            {panel === "tools" && <ToolsPanel />}
          </div>
        </div>
      </header>

      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   NAV ATOMS
   ═══════════════════════════════════════════════════════════════════════════ */

function NavLink({
  href,
  children,
  onHover,
}: {
  href: string;
  children: React.ReactNode;
  onHover?: () => void;
}) {
  return (
    <Link
      href={href}
      onMouseEnter={onHover}
      className="link-draw shrink-0 px-3 py-2 text-[0.875rem] font-medium whitespace-nowrap text-ink-soft transition-colors duration-300 hover:text-ink"
    >
      {children}
    </Link>
  );
}

function NavTrigger({
  label,
  active,
  onOpen,
}: {
  label: string;
  active: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onMouseEnter={onOpen}
      onFocus={onOpen}
      onClick={onOpen}
      aria-expanded={active}
      className="relative shrink-0 px-3 py-2 text-[0.875rem] font-medium whitespace-nowrap text-ink transition-colors duration-300 hover:text-brass"
    >
      {label}
      <span
        className={cn(
          "absolute inset-x-3 -bottom-0.5 h-px origin-left bg-brass transition-transform duration-400",
          active ? "scale-x-100" : "scale-x-0",
        )}
      />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PANELS
   ═══════════════════════════════════════════════════════════════════════════ */

function PanelColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-4 border-b border-rule pb-3">{title}</p>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function PanelLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-baseline justify-between gap-3 py-0.5 text-[0.9375rem] text-ink-soft transition-colors duration-250 hover:text-brass"
      >
        <span className="link-draw">{children}</span>
        <ArrowUpRight
          className="size-3 shrink-0 translate-y-[-1px] opacity-0 transition-all duration-250 group-hover:opacity-100"
          strokeWidth={2}
          aria-hidden
        />
      </Link>
    </li>
  );
}

function BuyPanel() {
  const residential = propertyTypes.filter((t) => t.category === "residential");
  const nonResidential = propertyTypes.filter((t) => t.category !== "residential");

  return (
    <div className="grid grid-cols-4 gap-10">
      <PanelColumn title="Residential">
        {residential.slice(0, 7).map((t) => (
          <PanelLink key={t.slug} href={`/ahmedabad/${t.slug}`}>
            {t.name}
          </PanelLink>
        ))}
      </PanelColumn>

      <PanelColumn title="By Configuration">
        {[2, 3, 4, 5].map((bhk) => (
          <PanelLink key={bhk} href={`/ahmedabad/${bhk}-bhk-flats`}>
            {bhk} BHK Flats
          </PanelLink>
        ))}
        <PanelLink href="/ahmedabad/penthouses">Penthouses</PanelLink>
        <PanelLink href="/ahmedabad/weekend-villas">Weekend Villas</PanelLink>
      </PanelColumn>

      <PanelColumn title="By Budget">
        {budgetBands.map((b) => (
          <PanelLink key={b.slug} href={`/ahmedabad/${b.slug}`}>
            {b.label}
          </PanelLink>
        ))}
      </PanelColumn>

      <div className="space-y-7">
        <PanelColumn title="Commercial & Land">
          {nonResidential.map((t) => (
            <PanelLink key={t.slug} href={`/ahmedabad/${t.slug}`}>
              {t.name}
            </PanelLink>
          ))}
        </PanelColumn>

        <PanelColumn title="By Possession">
          {possessionStatuses.slice(0, 3).map((p) => (
            <PanelLink key={p.slug} href={`/ahmedabad/${p.slug}`}>
              {p.label}
            </PanelLink>
          ))}
        </PanelColumn>
      </div>
    </div>
  );
}

function LocalityPanel() {
  const zones = Object.keys(zoneLabels) as Zone[];

  return (
    <div className="grid grid-cols-5 gap-10">
      {zones.map((zone) => (
        <PanelColumn key={zone} title={zoneLabels[zone]}>
          {localities
            .filter((l) => l.zone === zone)
            .slice(0, 8)
            .map((l) => (
              <PanelLink key={l.slug} href={`/${l.city}/${l.slug}`}>
                {l.name}
              </PanelLink>
            ))}
        </PanelColumn>
      ))}
    </div>
  );
}

function ToolsPanel() {
  return (
    <div className="grid grid-cols-4 gap-10">
      <PanelColumn title="Calculators">
        <PanelLink href="/calculators/home-loan-emi">Home Loan EMI</PanelLink>
        <PanelLink href="/calculators/affordability">What Can I Afford?</PanelLink>
        <PanelLink href="/calculators/stamp-duty">Stamp Duty &amp; Registration</PanelLink>
        <PanelLink href="/calculators/rental-yield">Rental Yield &amp; ROI</PanelLink>
      </PanelColumn>

      <PanelColumn title="Search">
        <PanelLink href="/map">Map Search</PanelLink>
        <PanelLink href="/properties">All Listings</PanelLink>
        <PanelLink href="/compare">Compare Properties</PanelLink>
        <PanelLink href="/wishlist">My Shortlist</PanelLink>
      </PanelColumn>

      <PanelColumn title="Guides">
        <PanelLink href="/guides/rera-gujarat">Understanding RERA</PanelLink>
        <PanelLink href="/guides/carpet-vs-builtup">Carpet vs Built-up</PanelLink>
        <PanelLink href="/guides/buying-checklist">Buying Checklist</PanelLink>
        <PanelLink href="/guides/gift-city">Why GIFT City</PanelLink>
      </PanelColumn>

      <div className="border-l border-rule pl-10">
        <p className="eyebrow mb-3">Not sure where to start?</p>
        <p className="mb-5 font-display text-h4 leading-tight text-ink">
          Tell us the budget. We will tell you the honest options.
        </p>
        <Link href="/contact" className="link-draw font-semibold text-micro tracking-[0.14em] text-brass uppercase">
          Talk to an advisor →
        </Link>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MOBILE DRAWER
   ═══════════════════════════════════════════════════════════════════════════ */

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [section, setSection] = useState<string | null>("buy");

  return (
    <>
      <div
        className="overlay fixed inset-0 z-[60] bg-ink/45 backdrop-blur-sm lg:hidden"
        data-open={open ? "1" : "0"}
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!open}
        inert={!open}
        data-open={open ? "1" : "0"}
        className="sheet-right fixed inset-y-0 right-0 z-[61] flex w-full max-w-sm flex-col bg-bone lg:hidden"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-rule px-5">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid size-10 place-items-center text-ink hover:bg-sand"
          >
            <X className="size-5" strokeWidth={1.6} aria-hidden />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
          <Accordion
            id="buy"
            label="Buy"
            open={section === "buy"}
            onToggle={setSection}
            links={[
              ...propertyTypes.slice(0, 6).map((t) => ({
                href: `/ahmedabad/${t.slug}`,
                label: t.name,
              })),
              { href: "/ahmedabad/3-bhk-flats", label: "3 BHK Flats" },
              { href: "/ahmedabad/4-bhk-flats", label: "4 BHK Flats" },
            ]}
          />

          <Accordion
            id="budget"
            label="By Budget"
            open={section === "budget"}
            onToggle={setSection}
            links={budgetBands.map((b) => ({ href: `/ahmedabad/${b.slug}`, label: b.label }))}
          />

          <Accordion
            id="localities"
            label="Localities"
            open={section === "localities"}
            onToggle={setSection}
            links={localities
              .filter((l) => l.featured)
              .map((l) => ({ href: `/${l.city}/${l.slug}`, label: l.name }))}
          />

          <Accordion
            id="tools"
            label="Tools"
            open={section === "tools"}
            onToggle={setSection}
            links={[
              { href: "/calculators/home-loan-emi", label: "Home Loan EMI" },
              { href: "/calculators/affordability", label: "What Can I Afford?" },
              { href: "/calculators/stamp-duty", label: "Stamp Duty" },
              { href: "/calculators/rental-yield", label: "Rental Yield & ROI" },
              { href: "/map", label: "Map Search" },
              { href: "/compare", label: "Compare" },
              { href: "/wishlist", label: "My Shortlist" },
            ]}
          />

          <div className="mt-6 space-y-1 border-t border-rule pt-6">
            {[
              { href: "/properties", label: "All Properties" },
              { href: "/map", label: "Search on Map" },
              { href: "/projects", label: "Projects" },
              { href: "/sell", label: "Sell / Rent Out" },
              { href: "/guides", label: "Buying Guides" },
              { href: "/about", label: "About Us" },
              { href: "/contact", label: "Contact" },
              { href: "/for-builders", label: "For Builders" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="block py-3 font-display text-h4 text-ink">
                {l.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="shrink-0 border-t border-rule p-5">
          <a
            href={telLink(site.contact.phoneE164)}
            className="flex w-full items-center justify-center gap-2.5 rounded-[2px] bg-ink py-4 font-semibold text-micro tracking-[0.14em] text-bone uppercase"
          >
            <Phone className="size-3.5" strokeWidth={1.8} aria-hidden />
            {site.contact.phoneDisplay}
          </a>
        </div>
      </div>
    </>
  );
}

function Accordion({
  id,
  label,
  open,
  onToggle,
  links,
}: {
  id: string;
  label: string;
  open: boolean;
  onToggle: (id: string | null) => void;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="border-b border-rule">
      <button
        type="button"
        onClick={() => onToggle(open ? null : id)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="font-display text-h4 text-ink">{label}</span>
        <span
          className={cn("font-mono text-ink-muted transition-transform duration-300", open && "rotate-45")}
          aria-hidden
        >
          +
        </span>
      </button>

      {/* grid-template-rows 0fr → 1fr. No measuring, no library. */}
      <div className="collapse" data-open={open ? "1" : "0"}>
        <ul>
          <div className="pb-4">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block py-2 pl-1 text-[0.9375rem] text-ink-muted">
                  {l.label}
                </Link>
              </li>
            ))}
          </div>
        </ul>
      </div>
    </div>
  );
}
