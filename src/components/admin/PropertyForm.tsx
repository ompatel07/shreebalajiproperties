"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Eye,
  Info,
  Save,
  Sparkles,
} from "lucide-react";

import {
  countBySeverity,
  evaluateReadiness,
  type ListingDraft,
  type ReadinessItem,
} from "@/components/admin/listing-readiness";
import { upsertProperty, type AdminResult } from "@/app/studio/actions";
import { Button } from "@/components/ui/Button";
import {
  amenities as ALL_AMENITIES,
  localities,
  possessionStatuses,
  propertyTypes,
  site,
} from "@/config/site";
import { formatPrice, pricePerSqft, slugify } from "@/lib/format";
import { heroImageFor } from "@/lib/imagery";
import { cn } from "@/lib/utils";
import type { Builder, Project, Property } from "@/types/db";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * LISTING EDITOR — rebuilt
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The previous version was 29 fields in one flat scroll. It was complete and
 * it was miserable. Three things fixed that:
 *
 *   1. **Progressive disclosure.** Four tabs, and the first one holds the
 *      eight fields that are genuinely required. You can create a usable
 *      draft without ever opening the other three.
 *
 *   2. **A readiness panel.** Permanently visible, it lists exactly what is
 *      blocking publication, what will look unfinished, and what is just
 *      polish. Clicking an item jumps to the tab and focuses the field. The
 *      publish control is disabled while a blocker exists — so the database
 *      can no longer reject a save you thought was complete.
 *
 *   3. **A live card preview.** You see the thing you are building as you
 *      type it, including the ₹/sq.ft a buyer will compare on.
 *
 * Smaller affordances that matter at volume: the price box echoes
 * "₹85 Lakh" as you type digits, carpet area offers a super-built-up
 * suggestion at typical Ahmedabad loading, category follows property type
 * automatically, and ⌘/Ctrl+S saves.
 */

type TabKey = "essentials" | "spec" | "content" | "location";

const TABS: { key: TabKey; label: string; hint: string }[] = [
  { key: "essentials", label: "Essentials", hint: "Everything required to publish" },
  { key: "spec", label: "Specification", hint: "Areas, floors, furnishing" },
  { key: "content", label: "Content & media", hint: "Copy, photos, amenities" },
  { key: "location", label: "Location & links", hint: "Map, developer, project" },
];

export function PropertyForm({
  property,
  builders,
  projects,
}: {
  property?: Property;
  builders: Pick<Builder, "id" | "name">[];
  projects: Pick<Project, "id" | "name">[];
}) {
  const router = useRouter();
  const isEdit = Boolean(property);

  const [tab, setTab] = useState<TabKey>("essentials");
  const [result, setResult] = useState<AdminResult | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  /* ── Controlled state. Only the fields the preview, the readiness panel
        or a derived helper actually needs — everything else stays
        uncontrolled so typing in a textarea does not re-render the tree. ── */
  const [d, setD] = useState<ListingDraft>({
    title: property?.title ?? "",
    slug: property?.slug ?? "",
    localitySlug: property?.locality_slug ?? "",
    propertyType: property?.property_type ?? "flats",
    category: property?.category ?? "residential",
    price: property?.price ? String(property.price) : "",
    priceOnRequest: property?.price_on_request ?? false,
    carpetSqft: property?.carpet_sqft ? String(property.carpet_sqft) : "",
    bhk: property?.bhk ? String(property.bhk) : "",
    bathrooms: property?.bathrooms ? String(property.bathrooms) : "",
    description: property?.description ?? "",
    heroImage: property?.hero_image ?? "",
    reraId: property?.rera_id ?? "",
    reraVerified: property?.rera_verified ?? false,
    lat: property?.lat ? String(property.lat) : "",
    lng: property?.lng ? String(property.lng) : "",
    amenities: property?.amenities ?? [],
    highlights: (property?.highlights ?? []).join("\n"),
    possession: property?.possession ?? "ready-to-move",
    possessionDate: property?.possession_date ?? "",
  });

  const [status, setStatus] = useState(property?.status ?? "draft");
  const [slugLocked, setSlugLocked] = useState(isEdit);

  const set = <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) =>
    setD((prev) => ({ ...prev, [key]: value }));

  const readiness = useMemo(() => evaluateReadiness(d), [d]);
  const { blockers } = countBySeverity(readiness);

  /* ── Derived helpers ──────────────────────────────────────────────────── */

  const priceNum = Number(d.price) || 0;
  const carpetNum = Number(d.carpetSqft) || 0;
  const suggestedSuper = carpetNum ? Math.round(carpetNum * 1.4) : 0;

  const typesForCategory = propertyTypes.filter((t) => t.category === d.category);

  /** Title → slug, but never on an existing listing: changing a live URL
   *  breaks every inbound link and shared WhatsApp message. */
  function onTitleChange(value: string) {
    setD((prev) => ({
      ...prev,
      title: value,
      slug: slugLocked ? prev.slug : slugify(value),
    }));
  }

  /** Property type drives category, so they can never contradict. */
  function onTypeChange(slug: string) {
    const type = propertyTypes.find((t) => t.slug === slug);
    setD((prev) => ({
      ...prev,
      propertyType: slug,
      category: type?.category ?? prev.category,
    }));
  }

  function jumpTo(item: ReadinessItem) {
    setTab(item.tab);
    if (!item.field) return;
    // Wait for the tab to mount before focusing.
    requestAnimationFrame(() => {
      const el = formRef.current?.querySelector<HTMLElement>(`[name="${item.field}"]`);
      el?.focus();
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function submit(formData: FormData) {
    formData.set("status", status);
    startTransition(async () => {
      const res = await upsertProperty(formData);
      setResult(res);

      if (res.ok) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (!isEdit && res.id) router.replace(`/studio/listings/${res.id}`);
        else router.refresh();
      } else if (res.errors) {
        // Jump to the tab holding the first server-side error.
        const first = Object.keys(res.errors)[0];
        const map: Record<string, TabKey> = {
          title: "essentials", slug: "essentials", price: "essentials",
          carpetSqft: "essentials", localitySlug: "essentials",
          superSqft: "spec", builtupSqft: "spec", plotSqft: "spec",
          description: "content", heroImage: "content",
          lat: "location", lng: "location",
        };
        if (first && map[first]) setTab(map[first]);
      }
    });
  }

  /** ⌘/Ctrl+S saves, as in any editor someone uses all day. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const errors = result?.errors ?? {};

  return (
    <form
      ref={formRef}
      action={submit}
      /**
       * `noValidate` is load-bearing. Inactive tabs stay mounted (so
       * uncontrolled values survive switching), and Chrome refuses to submit
       * a form containing a `required` field it cannot focus — which would
       * make saving silently fail from any tab but the first. Validation is
       * Zod on the server plus the readiness panel in the UI, both of which
       * give better feedback than a native bubble anyway. `required` is kept
       * on the inputs for assistive-tech semantics.
       */
      noValidate
      className="pb-28"
    >
      {property && <input type="hidden" name="id" value={property.id} />}

      {/* ── Result banner ────────────────────────────────────────────────── */}
      {result && (
        <div
          role={result.ok ? "status" : "alert"}
          className={cn(
            "mb-6 flex items-start gap-3 border p-4",
            result.ok ? "border-verdant/30 bg-verdant-pale" : "border-alert/30 bg-alert-pale",
          )}
        >
          {result.ok ? (
            <Check className="mt-0.5 size-4 shrink-0 text-verdant" strokeWidth={2.4} aria-hidden />
          ) : (
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-alert" strokeWidth={2.2} aria-hidden />
          )}
          <p className={cn("text-caption", result.ok ? "text-verdant" : "text-alert")}>
            {result.message}
          </p>
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[1fr_21rem] xl:gap-10">
        {/* ══════════════════════════════════════════════════════════════════
            FORM
            ══════════════════════════════════════════════════════════════════ */}
        <div className="min-w-0">
          {/* Tabs */}
          <div className="no-bar -mx-1 overflow-x-auto border-b border-rule px-1">
            <div role="tablist" aria-label="Listing sections" className="flex gap-1">
              {TABS.map((t) => {
                const tabBlockers = readiness.filter(
                  (r) => r.tab === t.key && r.severity === "blocker",
                ).length;

                return (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.key}
                    onClick={() => setTab(t.key)}
                    className={cn(
                      "relative shrink-0 px-4 py-3 font-semibold text-[0.6875rem] tracking-[0.12em] uppercase transition-colors",
                      tab === t.key
                        ? "text-ink"
                        : "text-ink-faint hover:text-ink-muted",
                    )}
                  >
                    {t.label}
                    {tabBlockers > 0 && (
                      <span className="ml-1.5 inline-grid size-4 place-items-center rounded-full bg-alert align-middle font-mono text-[0.5rem] text-paper">
                        {tabBlockers}
                      </span>
                    )}
                    <span
                      className={cn(
                        "absolute inset-x-2 -bottom-px h-0.5 transition-transform duration-300",
                        tab === t.key ? "scale-x-100 bg-ink" : "scale-x-0 bg-transparent",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mt-3 text-caption text-ink-muted">
            {TABS.find((t) => t.key === tab)?.hint}
          </p>

          {/* ── ESSENTIALS ──────────────────────────────────────────────── */}
          <Panel show={tab === "essentials"}>
            <Row>
              <Field
                label="Title"
                required
                error={errors.title}
                hint="Write it the way a buyer searches: configuration, type, locality."
                span2
              >
                <input
                  name="title"
                  value={d.title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  required
                  maxLength={200}
                  placeholder="3 BHK corner unit in Serene Heights, Shilaj"
                  className={input}
                />
              </Field>

              <Field
                label="URL slug"
                required
                error={errors.slug}
                hint={
                  isEdit
                    ? "Changing this breaks existing links. Only edit if never shared."
                    : "Generated from the title. Edit for something shorter."
                }
                span2
              >
                <div className="flex">
                  <span className="shrink-0 border border-r-0 border-rule-strong bg-sand px-3 py-3 font-mono text-[0.75rem] text-ink-faint">
                    /property/
                  </span>
                  <input
                    name="slug"
                    value={d.slug}
                    onChange={(e) => {
                      setSlugLocked(true);
                      set("slug", slugify(e.target.value));
                    }}
                    required
                    className={cn(input, "rounded-l-none")}
                  />
                </div>
              </Field>

              <Field label="Property type" required error={errors.propertyType}>
                <select
                  name="propertyType"
                  value={d.propertyType}
                  onChange={(e) => onTypeChange(e.target.value)}
                  required
                  className={input}
                >
                  <optgroup label="Residential">
                    {propertyTypes.filter((t) => t.category === "residential").map((t) => (
                      <option key={t.slug} value={t.slug}>{t.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Commercial">
                    {propertyTypes.filter((t) => t.category === "commercial").map((t) => (
                      <option key={t.slug} value={t.slug}>{t.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Land">
                    {propertyTypes.filter((t) => t.category === "land").map((t) => (
                      <option key={t.slug} value={t.slug}>{t.name}</option>
                    ))}
                  </optgroup>
                </select>
                {/* Category follows type, so it cannot contradict. */}
                <input type="hidden" name="category" value={d.category} />
                <p className="mt-1.5 text-[0.6875rem] text-ink-faint">
                  Category set automatically: <strong>{d.category}</strong>
                </p>
              </Field>

              <Field label="Locality" required error={errors.localitySlug}>
                <select
                  name="localitySlug"
                  value={d.localitySlug}
                  onChange={(e) => set("localitySlug", e.target.value)}
                  required
                  className={input}
                >
                  <option value="">Select a locality…</option>
                  {site.cities.map((city) => (
                    <optgroup key={city.slug} label={city.name}>
                      {localities
                        .filter((l) => l.city === city.slug)
                        .map((l) => (
                          <option key={l.slug} value={l.slug}>{l.name}</option>
                        ))}
                    </optgroup>
                  ))}
                </select>
                <input type="hidden" name="city" value={cityForLocality(d.localitySlug)} />
              </Field>

              <Field
                label="Price (₹)"
                error={errors.price}
                hint={priceNum > 0 ? undefined : "Full rupee value — 8500000 for ₹85 lakh."}
              >
                <input
                  name="price"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={d.price}
                  onChange={(e) => set("price", e.target.value)}
                  disabled={d.priceOnRequest}
                  placeholder="8500000"
                  className={cn(input, "tabular-nums")}
                />
                {/* Echoes the figure back in words — catches a missing zero. */}
                {priceNum > 0 && (
                  <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[0.6875rem] text-brass">
                    <Sparkles className="size-3" strokeWidth={2} aria-hidden />
                    {formatPrice(priceNum)}
                    {carpetNum > 0 && <span className="text-ink-faint">· {pricePerSqft(priceNum, carpetNum)}</span>}
                  </p>
                )}
                <Toggle
                  name="priceOnRequest"
                  label="Price on request"
                  checked={d.priceOnRequest}
                  onChange={(v) => set("priceOnRequest", v)}
                  className="mt-3"
                />
              </Field>

              <Field
                label="Carpet area (sq.ft)"
                required={d.category === "residential"}
                error={errors.carpetSqft}
                hint="The RERA figure. Required before a residential listing can go live."
              >
                <input
                  name="carpetSqft"
                  type="number"
                  inputMode="numeric"
                  min={50}
                  value={d.carpetSqft}
                  onChange={(e) => set("carpetSqft", e.target.value)}
                  placeholder="1485"
                  className={cn(input, "tabular-nums")}
                />
                {suggestedSuper > 0 && (
                  <p className="mt-1.5 text-[0.6875rem] text-ink-faint">
                    Typical super built-up at 40% loading ≈{" "}
                    <strong className="text-ink-muted tabular-nums">{suggestedSuper}</strong> sq.ft
                  </p>
                )}
              </Field>

              <Field label="Configuration (BHK)" error={errors.bhk} hint="2.5 is valid.">
                <input
                  name="bhk"
                  type="number"
                  step="0.5"
                  min={0}
                  max={20}
                  value={d.bhk}
                  onChange={(e) => set("bhk", e.target.value)}
                  placeholder="3"
                  className={cn(input, "tabular-nums")}
                />
              </Field>

              <Field label="Possession" required error={errors.possession}>
                <select
                  name="possession"
                  value={d.possession}
                  onChange={(e) => set("possession", e.target.value)}
                  className={input}
                >
                  {possessionStatuses.map((s) => (
                    <option key={s.slug} value={s.slug}>{s.label}</option>
                  ))}
                </select>
              </Field>

              {d.possession !== "ready-to-move" && (
                <Field label="Possession date" error={errors.possessionDate}>
                  <input
                    name="possessionDate"
                    type="date"
                    value={d.possessionDate}
                    onChange={(e) => set("possessionDate", e.target.value)}
                    className={input}
                  />
                </Field>
              )}

              <Field
                label="RERA registration"
                error={errors.reraId}
                hint="Pull it from gujrera.gujarat.gov.in. Resale is exempt — leave blank."
                span2
              >
                <input
                  name="reraId"
                  value={d.reraId}
                  onChange={(e) => set("reraId", e.target.value)}
                  maxLength={120}
                  placeholder="PR/GJ/AHMEDABAD/AHMEDABAD/AUDA/MAA00000/010124"
                  className={cn(input, "font-mono text-[0.8125rem]")}
                />
                <Toggle
                  name="reraVerified"
                  label="I have checked this on the GujRERA portal"
                  checked={d.reraVerified}
                  onChange={(v) => set("reraVerified", v)}
                  className="mt-3"
                />
              </Field>
            </Row>
          </Panel>

          {/* ── SPECIFICATION ───────────────────────────────────────────── */}
          <Panel show={tab === "spec"}>
            <Row>
              <Field label="Bathrooms" error={errors.bathrooms}>
                <input name="bathrooms" type="number" min={0} max={20} value={d.bathrooms}
                  onChange={(e) => set("bathrooms", e.target.value)} className={cn(input, "tabular-nums")} />
              </Field>
              <Field label="Balconies" error={errors.balconies}>
                <input name="balconies" type="number" min={0} max={20}
                  defaultValue={property?.balconies ?? ""} className={cn(input, "tabular-nums")} />
              </Field>
              <Field label="Super built-up (sq.ft)" error={errors.superSqft}
                hint={suggestedSuper ? `Suggestion: ${suggestedSuper}` : undefined}>
                <input name="superSqft" type="number" min={50}
                  defaultValue={property?.super_sqft ?? ""} className={cn(input, "tabular-nums")} />
              </Field>
              <Field label="Built-up (sq.ft)" error={errors.builtupSqft}>
                <input name="builtupSqft" type="number" min={50}
                  defaultValue={property?.builtup_sqft ?? ""} className={cn(input, "tabular-nums")} />
              </Field>
              <Field label="Plot area (sq.ft)" error={errors.plotSqft} hint="Villas, bungalows, plots.">
                <input name="plotSqft" type="number" min={50}
                  defaultValue={property?.plot_sqft ?? ""} className={cn(input, "tabular-nums")} />
              </Field>
              <Field label="Facing" error={errors.facing}>
                <select name="facing" defaultValue={property?.facing ?? ""} className={input}>
                  <option value="">—</option>
                  {["East","West","North","South","North-East","North-West","South-East","South-West"].map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </Field>
              <Field label="Floor" error={errors.floorNo}>
                <input name="floorNo" type="number" defaultValue={property?.floor_no ?? ""}
                  className={cn(input, "tabular-nums")} />
              </Field>
              <Field label="Total floors" error={errors.totalFloors}>
                <input name="totalFloors" type="number" min={0}
                  defaultValue={property?.total_floors ?? ""} className={cn(input, "tabular-nums")} />
              </Field>
              <Field label="Furnishing" error={errors.furnishing}>
                <select name="furnishing" defaultValue={property?.furnishing ?? ""} className={input}>
                  <option value="">—</option>
                  <option value="unfurnished">Unfurnished</option>
                  <option value="semi-furnished">Semi-furnished</option>
                  <option value="furnished">Furnished</option>
                </select>
              </Field>
              <Field label="Age (years)" error={errors.ageYears} hint="0 for new construction.">
                <input name="ageYears" type="number" min={0} max={120}
                  defaultValue={property?.age_years ?? ""} className={cn(input, "tabular-nums")} />
              </Field>
              <Field label="Maintenance (₹/sq.ft/mo)" error={errors.maintenancePsf}>
                <input name="maintenancePsf" type="number" step="0.01" min={0}
                  defaultValue={property?.maintenance_psf ?? ""} className={cn(input, "tabular-nums")} />
              </Field>
              <Field label="Booking amount (₹)" error={errors.bookingAmount}>
                <input name="bookingAmount" type="number" min={0}
                  defaultValue={property?.booking_amount ?? ""} className={cn(input, "tabular-nums")} />
              </Field>

              <div className="sm:col-span-2">
                <Toggle name="isNegotiable" label="Price is negotiable"
                  defaultChecked={property?.is_negotiable ?? true} />
              </div>
            </Row>
          </Panel>

          {/* ── CONTENT & MEDIA ─────────────────────────────────────────── */}
          <Panel show={tab === "content"}>
            <Row>
              <Field
                label="Description"
                error={errors.description}
                hint="Blank lines become paragraphs. Write what you would say on a call — specifics, not adjectives."
                span2
              >
                <textarea
                  name="description"
                  rows={9}
                  maxLength={8000}
                  value={d.description}
                  onChange={(e) => set("description", e.target.value)}
                  className={cn(input, "resize-y leading-relaxed")}
                />
                <p className="mt-1.5 text-right font-mono text-[0.625rem] text-ink-faint tabular-nums">
                  {d.description.length} / 8000
                </p>
              </Field>

              <Field
                label="Highlights"
                error={errors.highlights}
                hint="One per line, up to 12. Renders as “why we shortlisted it”."
                span2
              >
                <textarea
                  name="highlights"
                  rows={5}
                  value={d.highlights}
                  onChange={(e) => set("highlights", e.target.value)}
                  placeholder={"Corner unit, three open sides\nDeveloper delivered its last four projects on time"}
                  className={cn(input, "resize-y")}
                />
              </Field>

              <Field
                label="Hero image URL"
                error={errors.heroImage}
                hint="Upload to the property-media bucket in Supabase, then paste the public URL."
                span2
              >
                <input
                  name="heroImage"
                  type="url"
                  value={d.heroImage}
                  onChange={(e) => set("heroImage", e.target.value)}
                  placeholder="https://….supabase.co/storage/v1/object/public/property-media/…"
                  className={input}
                />
              </Field>

              <Field label="Video URL" error={errors.videoUrl}>
                <input name="videoUrl" type="url" defaultValue={property?.video_url ?? ""} className={input} />
              </Field>
              <Field label="Virtual tour URL" error={errors.virtualTourUrl}>
                <input name="virtualTourUrl" type="url" defaultValue={property?.virtual_tour_url ?? ""} className={input} />
              </Field>

              <Field
                label="Nearby places (JSON)"
                error={errors.nearby}
                hint='[{"name":"Udgam School","type":"school","distance_km":1.2}] — school, hospital, mall, transit, office, park, temple'
                span2
              >
                <textarea name="nearby" rows={3}
                  defaultValue={JSON.stringify(property?.nearby ?? [])}
                  className={cn(input, "resize-y font-mono text-[0.75rem]")} />
              </Field>
            </Row>

            {/* Amenities */}
            <div className="mt-8">
              <div className="flex items-baseline justify-between gap-4 border-b border-rule pb-3">
                <p className="font-semibold text-[0.6875rem] tracking-[0.14em] text-ink-muted uppercase">
                  Amenities
                </p>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[0.5625rem] text-ink-faint tabular-nums">
                    {d.amenities.length} selected
                  </span>
                  {d.amenities.length > 0 && (
                    <button type="button" onClick={() => set("amenities", [])}
                      className="font-semibold text-[0.6875rem] tracking-[0.1em] text-brass uppercase hover:underline">
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
                {ALL_AMENITIES.map((a) => {
                  const on = d.amenities.includes(a);
                  return (
                    <label key={a}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 border px-3 py-2 text-[0.8125rem] transition-colors",
                        on ? "border-brass bg-brass-pale/50 text-ink" : "border-rule text-ink-muted hover:border-rule-strong",
                      )}>
                      <input type="checkbox" name="amenities" value={a} checked={on}
                        onChange={(e) =>
                          set("amenities", e.target.checked
                            ? [...d.amenities, a]
                            : d.amenities.filter((x) => x !== a))
                        }
                        className="size-3.5 shrink-0" style={{ accentColor: "var(--color-brass)" }} />
                      <span className="truncate">{a}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </Panel>

          {/* ── LOCATION & LINKS ────────────────────────────────────────── */}
          <Panel show={tab === "location"}>
            <Row>
              <Field label="Address" error={errors.address} span2>
                <input name="address" defaultValue={property?.address ?? ""} maxLength={400}
                  placeholder="Tower B, Serene Heights, Off Shilaj Circle" className={input} />
              </Field>

              <Field label="Latitude" error={errors.lat}
                hint="Right-click the exact spot in Google Maps and copy the pair.">
                <input name="lat" type="number" step="any" value={d.lat}
                  onChange={(e) => set("lat", e.target.value)} placeholder="23.0318"
                  className={cn(input, "tabular-nums")} />
              </Field>
              <Field label="Longitude" error={errors.lng}>
                <input name="lng" type="number" step="any" value={d.lng}
                  onChange={(e) => set("lng", e.target.value)} placeholder="72.4582"
                  className={cn(input, "tabular-nums")} />
              </Field>

              <Field label="Developer" error={errors.builderId}>
                <select name="builderId" defaultValue={property?.builder_id ?? ""} className={input}>
                  <option value="">—</option>
                  {builders.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </Field>
              <Field label="Project" error={errors.projectId}>
                <select name="projectId" defaultValue={property?.project_id ?? ""} className={input}>
                  <option value="">—</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Field>

              <Field label="Transaction" error={errors.transaction}>
                <select name="transaction" defaultValue={property?.transaction ?? "sale"} className={input}>
                  <option value="sale">For sale</option>
                  <option value="rent">For rent</option>
                  <option value="lease">For lease</option>
                </select>
              </Field>
              <Field label="Sort order" error={errors.sortOrder} hint="Lower appears first.">
                <input name="sortOrder" type="number" defaultValue={property?.sort_order ?? 0}
                  className={cn(input, "tabular-nums")} />
              </Field>

              <div className="space-y-3 sm:col-span-2">
                <Toggle name="isFeatured" label="Featured — shows on the homepage"
                  defaultChecked={property?.is_featured ?? false} />
                <Toggle name="isExclusive" label="Sole mandate — badged “Exclusive”"
                  defaultChecked={property?.is_exclusive ?? false} />
              </div>
            </Row>
          </Panel>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            SIDEBAR — preview + readiness
            ══════════════════════════════════════════════════════════════════ */}
        <aside className="xl:sticky xl:top-6 xl:h-fit xl:self-start">
          <div className="space-y-5">
            <LivePreview draft={d} />
            <ReadinessPanel items={readiness} onJump={jumpTo} />
          </div>
        </aside>
      </div>

      {/* ── Sticky action bar ──────────────────────────────────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-bone/95 backdrop-blur-xl lg:left-60">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 lg:px-10">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <span className="font-semibold text-[0.6875rem] tracking-[0.14em] text-ink-muted uppercase">
                Status
              </span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="border border-rule-strong bg-paper px-2.5 py-1.5 font-semibold text-[0.6875rem] tracking-[0.1em] uppercase focus:border-brass focus:outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published" disabled={blockers > 0}>
                  Published {blockers > 0 ? "(fix blockers first)" : ""}
                </option>
                <option value="under_offer" disabled={blockers > 0}>Under offer</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
                <option value="archived">Archived</option>
              </select>
            </label>

            {blockers > 0 && (
              <span className="hidden items-center gap-1.5 font-semibold text-[0.6875rem] tracking-[0.1em] text-alert uppercase sm:flex">
                <AlertTriangle className="size-3" strokeWidth={2.2} aria-hidden />
                {blockers} blocker{blockers === 1 ? "" : "s"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden font-semibold text-[0.6875rem] tracking-[0.1em] text-ink-faint uppercase md:inline">
              ⌘S to save
            </span>
            <Button type="button" variant="ghost" onClick={() => router.push("/studio/listings")}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending}
              icon={!pending && <Save className="size-4" strokeWidth={1.9} aria-hidden />}
            >
              {pending ? "Saving…" : isEdit ? "Save changes" : "Create listing"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SIDEBAR PIECES
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Live card preview. Deliberately a bespoke, lightweight render rather than
 * importing the real `PropertyCard` — that would pull the public card's
 * shortlist button and its client dependencies into the admin bundle for a
 * thumbnail.
 */
function LivePreview({ draft }: { draft: ListingDraft }) {
  const locality = localities.find((l) => l.slug === draft.localitySlug);
  const price = Number(draft.price) || 0;
  const carpet = Number(draft.carpetSqft) || 0;

  const src =
    draft.heroImage ||
    heroImageFor({ hero_image: null, slug: draft.slug || "preview", category: draft.category }, 600);

  return (
    <div className="border border-rule bg-paper">
      <p className="flex items-center gap-2 border-b border-rule px-4 py-2.5 font-semibold text-[0.6875rem] tracking-[0.14em] text-ink-muted uppercase">
        <Eye className="size-3" strokeWidth={2} aria-hidden />
        How the card will look
      </p>

      <div className="p-4">
        <div className="relative aspect-[4/3] overflow-hidden bg-sand">
          {/* Unoptimised: this URL changes on every keystroke in the hero
              field, and running each draft through the optimiser would be
              pure waste. */}
          <Image
            src={src}
            alt=""
            aria-hidden
            fill
            sizes="19rem"
            unoptimized
            className="photo-warm object-cover"
          />
          <div className="absolute inset-x-2 top-2 flex gap-1.5">
            {draft.reraVerified ? (
              <span className="bg-verdant px-1.5 py-0.5 font-semibold text-[0.6875rem] tracking-[0.1em] text-paper uppercase">
                RERA ✓
              </span>
            ) : (
              <span className="bg-bone/85 px-1.5 py-0.5 font-semibold text-[0.6875rem] tracking-[0.1em] text-ink-muted uppercase">
                Resale
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 border-t border-rule pt-3">
          <p className="font-semibold text-[0.6875rem] tracking-[0.14em] text-ink-muted uppercase">
            {locality?.name ?? "No locality"}
          </p>
          <p className="mt-1.5 line-clamp-2 text-[1.0625rem] font-semibold leading-snug text-ink">
            {draft.title || "Untitled listing"}
          </p>
          <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2.5">
            <p className="font-display text-h4 leading-none text-ink" data-numeric>
              {draft.priceOnRequest ? "On request" : price > 0 ? formatPrice(price) : "No price"}
            </p>
            {price > 0 && carpet > 0 && (
              <p className="font-mono text-[0.625rem] text-brass" data-numeric>
                {pricePerSqft(price, carpet)}
              </p>
            )}
          </div>
          <p className="mt-1.5 font-mono text-[0.625rem] text-ink-muted" data-numeric>
            {[
              draft.bhk ? `${draft.bhk} BHK` : null,
              draft.bathrooms ? `${draft.bathrooms} bath` : null,
              carpet ? `${carpet} sq.ft carpet` : null,
            ].filter(Boolean).join("  ·  ") || "No specification yet"}
          </p>
        </div>
      </div>
    </div>
  );
}

function ReadinessPanel({
  items,
  onJump,
}: {
  items: ReadinessItem[];
  onJump: (item: ReadinessItem) => void;
}) {
  const { blockers, warnings, polish } = countBySeverity(items);

  if (items.length === 0) {
    return (
      <div className="border border-verdant/30 bg-verdant-pale p-5">
        <p className="flex items-center gap-2 text-[1.0625rem] font-semibold text-ink">
          <Check className="size-4 text-verdant" strokeWidth={2.6} aria-hidden />
          Ready to publish
        </p>
        <p className="mt-2 text-caption leading-relaxed text-ink-soft">
          Nothing outstanding. Set the status to Published and save.
        </p>
      </div>
    );
  }

  const tone =
    blockers > 0 ? "border-alert/30 bg-alert-pale" : "border-brass/30 bg-brass-pale/40";

  return (
    <div className={cn("border", tone)}>
      <div className="border-b border-ink/10 px-5 py-3.5">
        <p className="font-semibold text-[0.6875rem] tracking-[0.14em] uppercase">
          {blockers > 0 ? (
            <span className="text-alert">
              {blockers} blocker{blockers === 1 ? "" : "s"} before publishing
            </span>
          ) : (
            <span className="text-brass-deep">Publishable · {warnings + polish} suggestions</span>
          )}
        </p>
      </div>

      <ul className="divide-y divide-ink/5">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onJump(item)}
              className="group flex w-full items-start gap-2.5 px-5 py-3 text-left transition-colors hover:bg-bone/50"
            >
              <SeverityDot severity={item.severity} />
              <span className="min-w-0 flex-1 text-[0.8125rem] leading-snug text-ink-soft">
                {item.label}
              </span>
              <ChevronRight
                className="mt-0.5 size-3 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5"
                strokeWidth={2.2}
                aria-hidden
              />
            </button>
          </li>
        ))}
      </ul>

      <p className="flex items-start gap-2 border-t border-ink/10 px-5 py-3 text-[0.6875rem] leading-snug text-ink-muted">
        <Info className="mt-0.5 size-3 shrink-0" strokeWidth={2} aria-hidden />
        Red blocks publishing. Amber will publish but looks unfinished. Grey is
        optional.
      </p>
    </div>
  );
}

function SeverityDot({ severity }: { severity: ReadinessItem["severity"] }) {
  const tones = {
    blocker: "bg-alert",
    warning: "bg-brass",
    polish: "bg-ink-faint",
  } as const;

  return (
    <span
      aria-label={severity}
      className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", tones[severity])}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FORM ATOMS
   ═══════════════════════════════════════════════════════════════════════════ */

const input =
  "w-full border border-rule-strong bg-paper px-3.5 py-3 text-[0.9375rem] text-ink " +
  "transition-colors placeholder:text-ink-faint focus:border-brass focus:outline-none " +
  "disabled:bg-sand disabled:opacity-60";

/** Tabs stay mounted so uncontrolled values survive switching. */
function Panel({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <div role="tabpanel" hidden={!show} className={show ? "mt-7" : "hidden"}>
      {children}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
}

function Field({
  label,
  children,
  error,
  hint,
  required,
  span2,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
  span2?: boolean;
}) {
  return (
    <div className={cn("flex flex-col", span2 && "sm:col-span-2")}>
      <label className="mb-1.5 font-semibold text-[0.6875rem] tracking-[0.14em] text-ink-muted uppercase">
        {label}
        {required && <span className="ml-1 text-brass" aria-hidden>*</span>}
      </label>

      {children}

      {hint && !error && (
        <p className="mt-1.5 text-[0.6875rem] leading-snug text-ink-faint">{hint}</p>
      )}
      {error && (
        <p role="alert" className="mt-1.5 flex items-start gap-1.5 text-[0.6875rem] text-alert">
          <AlertTriangle className="mt-px size-3 shrink-0" strokeWidth={2.2} aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

function Toggle({
  name,
  label,
  checked,
  defaultChecked,
  onChange,
  className,
}: {
  name: string;
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (v: boolean) => void;
  className?: string;
}) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-2.5", className)}>
      <input
        type="checkbox"
        name={name}
        {...(checked !== undefined
          ? { checked, onChange: (e) => onChange?.(e.target.checked) }
          : { defaultChecked })}
        className="mt-0.5 size-4 shrink-0"
        style={{ accentColor: "var(--color-brass)" }}
      />
      <span className="text-[0.8125rem] leading-snug text-ink-soft">{label}</span>
    </label>
  );
}

/** Keeps the hidden `city` field consistent with the chosen locality. */
function cityForLocality(slug: string): string {
  return localities.find((l) => l.slug === slug)?.city ?? "ahmedabad";
}
