# Shree Balaji Properties — Real Estate Platform

A production-ready property website and admin panel for an Ahmedabad channel
partner. Next.js 15 · Supabase · Vercel. **No paid APIs and no animation
library** — it runs entirely on free tiers.

> **Brand lives in one file.** `src/config/site.ts` drives the wordmark, page
> titles, OpenGraph cards, JSON-LD schema, footer, WhatsApp links and e-mail
> templates. The contact details, office address, RERA/GSTIN numbers and trust
> figures in it are **still placeholders** — see the launch checklist below.

---

## Table of contents

1. [What is in here](#what-is-in-here)
2. [Quick start](#quick-start)
3. [Supabase setup](#supabase-setup)
4. [Deploying to Vercel](#deploying-to-vercel)
5. [Going live — the checklist](#going-live--the-checklist)
6. [How the SEO works](#how-the-seo-works)
7. [Security model](#security-model)
8. [The design system](#the-design-system)
9. [Running the admin panel](#running-the-admin-panel)
10. [Project structure](#project-structure)
11. [Costs](#costs)
12. [Known limitations](#known-limitations)

---

## What is in here

### Public site

| Area | What it does |
|---|---|
| **Homepage** | Full-bleed hero, trust rail with animated counters, featured inventory, 53-locality showcase, co-invested projects, six-stage process, tools strip, testimonials, developer marquee |
| **~1,060 SEO landing pages** | One route generates every `/{city}/{facet}` combination — by type, configuration, budget band, possession status and locality. All statically pre-rendered |
| **Listing detail** | Mosaic gallery with lightbox, full specification grid, carpet-area explainer, amenities, floor plans, OSM map, nearby places, inline EMI widget, enquiry form, site-visit scheduler, similar listings, and a sticky price + call/WhatsApp bar |
| **Project pages** | Masterplan galleries, configuration tables, specification sheets, and an explicit co-investment disclosure where it applies |
| **Search** | Faceted filter rail, full-text search over a Postgres `tsvector`, six sort orders, paginated |
| **Map search** | Split list/map view, price-label pins, corridor and budget filters |
| **4 calculators** | Home-loan EMI with amortisation chart, affordability (FOIR + RBI LTV), Gujarat stamp duty, rental yield & ROI |
| **Shortlist & compare** | Device-local, no account needed; compare table marks the best value per row |
| **4 buyer guides** | Carpet vs built-up, RERA Gujarat, full diligence checklist, GIFT City |
| **Sell page** | Valuation request with a positioning argument against inflated asking prices |
| **Legal** | Privacy policy and terms, written to match what the code actually does |

### Admin panel (`/studio`)

Dashboard · tabbed listing editor with live preview and publish-readiness
checks · inline price editing and duplicate · lead pipeline with scoring,
notes and follow-ups · site-visit confirmation · project visibility ·
testimonial moderation · append-only audit log.

---

## Quick start

```bash
npm install
cp .env.example .env.local     # then fill in your Supabase keys
npm run dev                    # http://localhost:3000
```

The site runs without Supabase credentials — every query fails soft and the
page renders its empty state. Useful for design work, not much else.

```bash
npm run typecheck   # tsc --noEmit
npm run build       # production build, ~1,060 static pages
```

---

## Supabase setup

**1 · Create a project** at [supabase.com](https://supabase.com). Pick the
`ap-south-1` (Mumbai) region — it is the closest to Ahmedabad and shaves
~80 ms off every query compared with a US region.

**2 · Run the schema.** Open the SQL Editor, paste the whole of
`supabase/schema.sql`, run it. This creates every table, enum, index, trigger,
RLS policy, RPC and the storage bucket. It is idempotent — safe to re-run.

**3 · Seed the demo data** (optional but recommended for the client demo).
Paste `supabase/seed.sql` and run it. That gives you 10 developers, 9 projects
(4 marked co-invested), 16 live listings, 1 draft, 7 testimonials and 96
price-trend points, all consistent with the locality rates in
`src/config/site.ts`.

> The seed data is **fictional** — invented builder and project names,
> plausible but not real prices, structurally valid but fake RERA numbers.
> The removal script is at the bottom of `seed.sql`.

> **Reviewing the admin panel before Supabase exists?** You already can.
> While `NEXT_PUBLIC_SUPABASE_URL` is unset or still a placeholder, the site
> runs on fixtures (`src/lib/demo-data.ts`, `src/lib/demo-studio.ts`) and
> `/studio` opens without a login — there is no session to establish and no
> real data to protect. Every write is disabled and the panel carries an
> unmissable amber strip saying so. It all switches off by itself the moment
> real credentials exist.

**4 · Create your admin account.**

```
Dashboard → Authentication → Users → Add user
  ✓ Auto Confirm User
  (use a strong password)
```

Copy the new user's UUID, then in the SQL Editor:

```sql
insert into profiles (id, email, full_name, role)
values ('<uuid-from-above>', 'owner@example.com', 'Owner', 'admin');
```

**5 · Copy your keys** from Settings → API into `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # server only, never NEXT_PUBLIC_
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAILS=owner@example.com
```

---

## Deploying to Vercel

```bash
git init && git add -A && git commit -m "Initial commit"
gh repo create shreebalajiproperties --private --source=. --push
```

Then import the repository at [vercel.com/new](https://vercel.com/new). It
auto-detects Next.js; no build configuration is needed.

**Add the environment variables** in Project Settings → Environment Variables.
All five from `.env.local`, plus set `NEXT_PUBLIC_SITE_URL` to your real
domain. Mark `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_EMAILS` as **Sensitive**.

> `NEXT_PUBLIC_SITE_URL` is load-bearing. It drives every canonical tag,
> the sitemap and the JSON-LD `@id` values. If it is wrong, your canonicals
> point at the wrong origin and the SEO quietly breaks.

**Custom domain:** add it under Settings → Domains and point the DNS at
Vercel. Redeploy after changing `NEXT_PUBLIC_SITE_URL` so the static pages
regenerate with the new canonicals.

`robots.ts` blocks indexing on any origin containing `vercel.app` or
`localhost`, so preview deployments cannot compete with production.

---

## Going live — the checklist

Work top to bottom. The first four are non-negotiable.

- [ ] **Legal entity.** `legalName` in `src/config/site.ts` is the trading
      name only. Confirm the registered entity (LLP / Pvt Ltd /
      proprietorship) — it appears in the footer and both legal pages.
- [ ] **Contact details.** Real phone (E.164 *and* display format), WhatsApp
      number, e-mail, office address and geo-coordinates.
- [ ] **Compliance.** The real **GujRERA agent registration** and GSTIN.
      These are the site's primary trust signals and currently hold dummy
      values. Shipping fake ones is worse than shipping none.
- [ ] **Trust numbers.** `site.trust` ships with 1,800 families / ₹620 Cr /
      53 localities / 100% RERA. **Make these true or change them.** An
      inflated number is the fastest way to lose a referral in this market.
- [ ] **Photography.** Replace the Unsplash placeholders with the client's own
      photographs, uploaded to the `property-media` Supabase bucket. Stock
      interiors are fine for a pitch and actively harmful once a buyer turns
      up expecting the flat in the picture.
- [ ] **Delete the demo data.** The script is at the bottom of `seed.sql`.
- [ ] **Legal review.** `/privacy` and `/terms` are written in good faith to
      describe what the code does, but they are **not legal advice**. Have a
      lawyer check them — particularly the liability clauses and the DPDP Act
      2023 obligations.
- [ ] **Verify the stamp-duty rates** in `src/lib/finance.ts` against the
      current Gujarat notification. They are correct as at 2024–25 and they
      do change.
- [ ] **Social profiles.** Fill in or blank out `site.social` — the footer
      skips empty strings automatically.
- [ ] **Submit the sitemap** to Google Search Console and Bing Webmaster
      Tools: `https://yourdomain.in/sitemap.xml`.
- [ ] **Set up a Google Business Profile** for the office address. For a local
      brokerage this drives more enquiries than anything on this list.

---

## How the SEO works

This is the part that beats the competition, so it is worth understanding.

### One route, ~1,060 pages

`src/app/[city]/[[...facets]]/page.tsx` serves every landing page:

```
/ahmedabad                          city hub
/ahmedabad/flats                    property type
/ahmedabad/3-bhk-flats              configuration + type
/ahmedabad/under-50-lakh            budget band
/ahmedabad/ready-to-move            possession status
/ahmedabad/shela                    locality
/ahmedabad/shela/3-bhk-flats        locality + configuration
/ahmedabad/shela/under-50-lakh      locality + budget
/gandhinagar/gift-city              …and the same for Gandhinagar
```

Each one gets its own `<title>`, `H1`, intro paragraph, canonical,
breadcrumbs, `ItemList` and `FAQPage` schema — generated from the facet's
actual facts (the locality's ₹/sq.ft band, live inventory counts), not from a
template that restates the title.

Three rules stop this being a doorway-page farm:

1. **Unresolvable URLs 404.** `resolveFacets()` returns `null` for an unknown
   segment, a duplicated facet, or a locality in the wrong city.
2. **Nothing behind a `?` is indexed.** Applying a filter switches the page to
   `noindex, follow` with the canonical still pointing at the clean path.
   `robots.ts` additionally blocks `/*?` so those permutations never consume
   crawl budget.
3. **The facet set is curated.** Every facet against every other would be
   ~40,000 near-identical URLs. `allFacetPaths()` emits the ~1,060 that
   correspond to real search intent.

### Everything is server-rendered

The reference site this was benchmarked against is a client-rendered SPA — its
landing pages are JavaScript routes. Here they are static HTML at the edge.
That is a structural advantage in both crawlability and LCP that cannot be
closed without a rewrite.

### Entity graph

`organizationSchema()` emits `RealEstateAgent` + `WebSite` once, in the root
layout, under stable `@id`s. Every page-level block (`RealEstateListing`,
`BreadcrumbList`, `FAQPage`, `Article`) *references* those `@id`s rather than
restating the business — so Google resolves the whole site to one entity.

Listings use `RealEstateListing`, not `Product`. Property is not a retail
good, and `Product` invites price-drop and availability treatments that do not
apply.

---

## Security model

### Row Level Security is the authorisation boundary

Every table has RLS enabled and starts from deny-all. The browser-exposed anon
key can read exactly three things: published listings, published projects, and
approved testimonials. It cannot read a lead, a draft, an internal note or a
phone number — **not because the UI hides them, but because Postgres refuses
to return the rows.**

The admin panel uses the same RLS-bound client. Authorisation is enforced by
the `is_staff()` policies, so a bug in a server action is a 403, not a breach.

### The service-role key is used in exactly two places

Inserting public enquiries (the `leads` table has no anon policy at all, by
design) and writing the append-only `audit_log`. `src/lib/supabase/admin.ts`
starts with `import "server-only"` — if any client component ever imports it,
the build fails rather than shipping the key to a browser bundle.

### Enquiry submission passes five gates

1. **Honeypot** — a hidden field a real browser leaves empty
2. **Time-on-form** — humans take more than 1.5 s to read and type
3. **Zod** — shape, length, format; phone normalised to E.164
4. **Rate limit** — in-process token bucket, then an authoritative count over
   `leads.ip_hash` in Postgres
5. **Service-role insert** — no path from the anon key into this table

No CAPTCHA, because that would mean a third-party dependency and a privacy
cost for a problem these five gates already solve.

### Admin access requires two independent grants

`middleware.ts` checks the session against `ADMIN_EMAILS`; RLS checks the
`profiles` table. Revoking either locks the account out. There is no
self-service signup anywhere.

### Headers

Static headers (HSTS, `X-Frame-Options: DENY`, `nosniff`,
`Referrer-Policy`, a closed `Permissions-Policy`) are set in
`next.config.ts` so the CDN applies them to cached responses too.

The CSP is emitted per-request in `middleware.ts` and **differs by surface**:

- `/studio/*` — nonce + `strict-dynamic`. Authenticated, mutates data, already
  dynamic and `no-store`, so the nonce costs nothing.
- Everywhere else — `'unsafe-inline'` for scripts only.

That split is deliberate. A nonce must be generated per request, which forces
dynamic rendering; applying it site-wide would cost ~1,060 listing and
locality pages their static rendering, and with it their LCP and crawl
economics. The public pages are read-only, rendered from our own data, with no
user-generated HTML and no `dangerouslySetInnerHTML` carrying user input. The
remaining directives stay strict on both surfaces: `object-src 'none'`,
`base-uri 'self'`, `frame-ancestors 'none'`, closed `connect-src` and
`img-src`.

### Other details worth knowing

- `ip_hash` is a **salted SHA-256**, never a raw IP — useful for rate-limit
  forensics without becoming a log of personal data.
- The shortlist lives in `localStorage` and never reaches the server.
- `getUser()` is used for every authorisation decision, never `getSession()`
  (which only decodes a client-controlled cookie).
- `?next=` on the login page accepts same-site paths only, so it cannot be
  used as an open redirect.
- Leaflet popups are assembled as HTML strings (Leaflet's API), so every
  interpolated value goes through `escapeHtml()`.

---

## The design system

**Architectural Editorial** — bone and ivory ground, ink type, a single brass
accent, and a Gujarati *jaali* lattice as the one piece of local vernacular.
Bright by intent: in Indian residential property, light reads as honest and
open where dark reads as nightclub.

Everything lives in `@theme` in `src/app/globals.css`. Components never
hard-code a colour.

### Type

| Role | Family | Why |
|---|---|---|
| Display | **Fraunces** | Variable, with optical sizing. `SOFT`/`WONK` axes give one expressive italic for emphasis |
| Body | **Inter Tight** | Tighter and more architectural than plain Inter |
| Data & labels | **IBM Plex Mono** | The drafting-table register for eyebrows, stats and specs |

Self-hosted by `next/font` at build time — no render-blocking request to
Google and no external origin in the CSP. The reference site ships a single
geometric sans for everything; the serif/sans/mono split is most of why this
reads as an editorial property brand rather than a dashboard.

### Chart colours are computed, not chosen

`--color-series-1/2/3` (gold, green, blue) were validated against the bone
surface for the lightness band, chroma floor, protan/deutan/tritan separation,
normal-vision separation and 3:1 contrast. The brand's own brass and verdant
**fail the chroma floor** as data marks, which is why the series tokens are
their saturated cousins rather than the UI tokens. Re-run the validator before
changing any of them.

### Motion — CSS only, no library

There is **no animation library in the bundle.** Every entrance, overlay,
drawer, accordion and lightbox transition is CSS; scroll reveals are driven by
a single `IntersectionObserver` (`src/components/motion/ScrollReveal.tsx`) that
flips a `data-in` attribute, with the transitions defined in `globals.css`.

That was a deliberate replacement of framer-motion, and it bought:

| Page | Before | After |
|---|---|---|
| Homepage | 167 kB | **137 kB** |
| Listing detail | 248 kB | **209 kB** |
| SEO landing pages | 169 kB | **131 kB** |
| About | 158 kB | **113 kB** |
| Guides | 151 kB | **107 kB** |

The win compounds: because `Reveal` / `RevealGroup` / `RevealItem` no longer
need hooks, they are **server components** that emit a `div` and a data
attribute. A grid of twelve cards ships no JavaScript of its own, and one
observer is created per page instead of one per element.

Stagger comes from `:nth-child` in CSS rather than per-item JS. Accordions
animate `grid-template-rows: 0fr → 1fr`, so nothing has to be measured.

The rules the system still enforces: one easing curve
(`cubic-bezier(0.22, 1, 0.36, 1)`), everything animates once, transforms and
opacity only (nothing can trigger reflow on the mid-range Android most buyers
use), and `prefers-reduced-motion` renders the final state immediately.

### Layout — deliberately not a card grid

The first build used the same section shape throughout — eyebrow, hairline
rule, h2, lede, three-column grid. Consistent, but it read as a template. Each
section now has its own structure:

- **Hero** — asymmetric: rotated index column, offset headline, a listing card
  breaking the bottom-right corner, search pinned to the hero's bottom edge
- **Trust** — figures on one hairline baseline over a drafting grid, labels
  *above* the numbers in monospace
- **Inventory** — one large plate across seven of twelve columns, two stacked
  beside it, three-up beneath; a snap-scrolling rail on mobile
- **Localities** — a large typographic list where hovering a row cross-fades a
  pinned image; compact cards on touch, where there is no hover
- **Projects** — a horizontal rail on the one dark band of the site
- **Process** — sticky-scroll, the image column swapping per stage via one
  observer
- **Testimonials** — a single large pull-quote with a name strip, not three
  truncated cards
- **Tools** — a numbered index list, so each row can carry a real sentence

`PropertyCard` has no box. It is a photograph with type set beneath it on the
page ground, the way a magazine sets a plate — a bordered white card with a
hover shadow is the most recognisable component on the commercial web and was
the main reason the grids looked bought.

---

## Running the admin panel

Sign in at `/studio/login`. `/admin` redirects there.

**Listings** — the table carries a **publish-readiness dot** per row (red =
Postgres would reject publishing it), an **inline price editor** that accepts
"1.2cr" / "85 lakh" / "9500000", a **duplicate** button, and status as an
inline dropdown so publishing is one click. `draft` and `archived` are
invisible to the public site via RLS, not merely hidden by the UI. Archiving
is preferred over deletion because a listing has leads, visits and audit
entries pointing at it; permanent deletion is deliberately left to the
Supabase dashboard.

**The listing editor** was rebuilt around three ideas, because the first
version was 29 fields in one flat scroll:

1. **Four tabs, and the first one is enough.** Essentials holds the eight
   fields genuinely required to publish. You can create a usable draft
   without opening the other three.
2. **A readiness panel, always visible.** It separates *blockers* (the DB
   CHECK constraints and Zod refinements will reject this — publishing is
   disabled), *warnings* (it will publish but look unfinished) and *polish*.
   Clicking an item jumps to the tab and focuses the field. The rules live in
   `src/components/admin/listing-readiness.ts` and are shared with the list
   view, so the two can never disagree.
3. **A live card preview.** You see the card you are building as you type,
   including the ₹/sq.ft a buyer compares on.

Smaller things that matter at volume: the price box echoes "₹85 Lakh" as you
type digits (catches a missing zero), carpet area suggests a super-built-up
figure at typical Ahmedabad loading, category follows property type
automatically so they cannot contradict, and ⌘/Ctrl+S saves.

> One implementation note worth knowing: the form sets `noValidate`. Inactive
> tabs stay mounted so uncontrolled values survive switching, and Chrome
> refuses to submit a form containing a `required` field it cannot focus —
> which would make saving silently fail from any tab but the first.
> Validation is Zod on the server plus the readiness panel in the UI.

**Leads** — sorted by score, highest first, so the list is worked top-down.
The score is computed by a Postgres trigger from signals like a disclosed
budget, an enquiry on a specific unit and a stated timeline; the logic is in
`schema.sql` and is deliberately simple enough to read. Phone numbers are
`tel:` and `wa.me` links, so a lead can be worked from a phone with one tap.

**Projects** are read-only here and created in the Supabase table editor. A
project record carries a masterplan, galleries, floor plans and a brochure —
an editor worth using for that is a bigger piece of work than a listing form,
and the client will add perhaps a dozen a year versus hundreds of listings.

**Revalidation** is automatic. Publishing calls `revalidatePath` for the
homepage, the listing, its locality page and the map, so changes appear
immediately rather than waiting out the ISR window.

---

## Project structure

```
src/
├── app/
│   ├── [city]/[[...facets]]/   ← the ~1,060-page SEO engine
│   ├── property/[slug]/        listing detail
│   ├── projects/               project index + detail
│   ├── calculators/            4 tools, shared layout
│   ├── guides/[slug]/          buyer guides
│   ├── studio/                 admin panel + server actions
│   ├── actions/enquiry.ts      public lead capture
│   ├── sitemap.ts · robots.ts · icon.tsx · opengraph-image.tsx
│   └── globals.css             ← the entire design system
├── components/
│   ├── ui/           Button, Badge, Field, Section, Logo, Breadcrumbs
│   ├── layout/       Header (mega-menu), Footer, StickyActionBar
│   ├── motion/       Reveal, RevealLines, DrawRule, Counter
│   ├── home/         9 homepage sections
│   ├── property/     cards, gallery, filters, map, forms, stores
│   ├── calculators/  4 calculators + charts + controls
│   └── admin/        forms and inline controls
├── config/site.ts    ← SINGLE SOURCE OF BRAND TRUTH + 53 localities
├── content/guides.ts long-form guide content
├── lib/
│   ├── supabase/     server · client · admin (service role)
│   ├── queries.ts    all public data access
│   ├── slugs.ts      URL ⇄ facet resolution + copy generation
│   ├── seo.ts        metadata + JSON-LD builders
│   ├── finance.ts    EMI, FOIR, Gujarat stamp duty, yield
│   ├── format.ts     ₹ lakh/crore, Indian digit grouping
│   ├── validation.ts Zod — the trust boundary
│   └── rate-limit.ts two-layer, no Redis
├── types/db.ts
└── middleware.ts     session · CSP · admin gate

supabase/
├── schema.sql        tables, RLS, triggers, RPCs, storage
└── seed.sql          demo data + removal script
```

---

## Costs

| Service | Tier | Covers |
|---|---|---|
| Vercel | Hobby — free | 100 GB bandwidth/month |
| Supabase | Free | 500 MB database, 1 GB storage, 5 GB egress |
| OpenStreetMap / CARTO | Free | Map tiles, no key, no quota |
| Google Fonts | Free | Self-hosted at build time |
| Unsplash | Free | Placeholder photography only |
| WhatsApp | Free | `wa.me` deep links, no Business API |

**₹0/month.** The deliberate substitutions that keep it there: Leaflet +
OpenStreetMap instead of the Google Maps JS API (which needs billing enabled);
`wa.me` links instead of the WhatsApp Business API; leads stored in Postgres
and read in the admin panel instead of a transactional e-mail service; a
Postgres `tsvector` instead of Algolia; hand-built SVG charts instead of a
charting library.

**What would push it over:** roughly 30,000+ monthly visitors (Vercel
bandwidth), or several hundred listings with 15+ full-resolution photographs
each (Supabase storage). Both are good problems, and both are a paid-tier
upgrade rather than a rewrite.

---

## Known limitations

Stated plainly, because you will be asked.

1. **The shortlist does not sync across devices.** It is `localStorage` by
   design — forcing a signup before someone can save a flat is the biggest
   drop-off point on Indian property portals. The "send my shortlist on
   WhatsApp" action bridges it, and converts better than an account prompt.
2. **Rate limiting is partly per-instance.** The in-process token bucket does
   not share state across serverless instances; the Postgres count over
   `ip_hash` is the authoritative layer. Swapping layer 2 for Upstash is a
   one-function change if it is ever needed.
3. **No transactional e-mail.** Leads land in the admin panel, not an inbox.
   Adding Resend (3,000 e-mails/month free) is roughly an afternoon.
4. **The project editor is the Supabase table editor.** See above for why.
5. **Map filtering is in-memory over a 300-listing cap.** A viewport-driven
   query would fire on every pan and burn egress for no benefit at this
   catalogue size. Past a few thousand listings this becomes a PostGIS
   bounding-box query.
6. **Locality ₹/sq.ft bands are maintained by hand** in `site.ts` and need a
   quarterly refresh. There is no free API for Indian property rates, and a
   stale number on a page that claims to be current is worse than no number.
7. **Stamp-duty rates are hard-coded** and must be checked against the current
   Gujarat notification. Duty is also charged on the higher of agreement value
   and jantri rate, which cannot be looked up without a paid service — the UI
   says so and asks the visitor to enter the higher figure.
8. **Guide content is a typed array, not a CMS.** Fine for four guides. Past
   ~15, move to MDX or a `guides` table so the client can edit without a
   deploy.
9. **The hover-swap locality list is desktop-only.** There is no hover on
   touch, so below `lg` it renders as a card grid instead. That is by design,
   not an oversight — but it does mean the two breakpoints look different.
10. **Demo mode opens `/studio` without auth.** Only while Supabase is
    unconfigured, when there is nothing real to protect. If you deploy without
    setting the Supabase environment variables, the panel will be publicly
    browsable with fictional data. `robots.ts` keeps it out of every index and
    the banner is loud, but set your env vars.

---

## Licence

Proprietary. Built for a specific client engagement.
