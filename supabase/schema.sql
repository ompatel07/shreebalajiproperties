-- ═══════════════════════════════════════════════════════════════════════════
-- SHREE BALAJI PROPERTIES — DATABASE SCHEMA
-- Postgres 15 / Supabase. Run this once in the Supabase SQL Editor.
--
-- SECURITY MODEL
-- ──────────────
-- Row Level Security is ON for every table, and every table starts from
-- "deny all". The anon key (which ships to the browser) can read exactly
-- three things: published listings, published projects, and approved
-- testimonials. It cannot read a lead, a draft, an internal note or a
-- phone number belonging to someone else — not because the UI hides those,
-- but because Postgres refuses to return the rows.
--
-- Writes from the public site (enquiries) never use the anon key at all.
-- They go through a Next.js Server Action that validates with Zod, rate
-- limits by IP, and then inserts with the service role. That keeps the
-- browser-exposed key read-only in practice.
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists "pg_trgm";      -- fuzzy locality / project search
create extension if not exists "pgcrypto";     -- gen_random_uuid()

-- ═══════════════════════════════════════════════════════════════════════════
-- ENUMS
-- ═══════════════════════════════════════════════════════════════════════════

do $$ begin
  create type listing_status as enum ('draft', 'published', 'under_offer', 'sold', 'rented', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type property_category as enum ('residential', 'commercial', 'land');
exception when duplicate_object then null; end $$;

do $$ begin
  create type transaction_type as enum ('sale', 'rent', 'lease');
exception when duplicate_object then null; end $$;

do $$ begin
  create type possession_status as enum (
    'ready-to-move', 'new-launch',
    'possession-in-1-year', 'possession-in-2-years', 'possession-after-2-years'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_status as enum ('new', 'contacted', 'qualified', 'visit_scheduled', 'visited', 'negotiating', 'closed_won', 'closed_lost');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_source as enum ('property_enquiry', 'contact_form', 'sell_request', 'calculator', 'site_visit', 'whatsapp', 'call', 'walk_in', 'referral');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('admin', 'agent', 'viewer');
exception when duplicate_object then null; end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- HELPERS
-- ═══════════════════════════════════════════════════════════════════════════

-- `updated_at` maintenance, attached to every mutable table below.
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- PROFILES — the allow-list for the admin panel.
--
-- Being in auth.users is NOT enough to administer the site. A matching row
-- here, with role 'admin' or 'agent', is what grants access. Create the user
-- in the Supabase Auth dashboard, then insert the profile row. There is
-- deliberately no self-service signup anywhere in the app.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  full_name   text,
  role        user_role not null default 'viewer',
  phone       text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- SECURITY DEFINER so the policies below can consult this table without
-- recursively triggering profile RLS. `search_path` is pinned to defeat
-- search-path hijacking, and the function is restricted to the two roles
-- that actually need it.
create or replace function is_staff()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('admin', 'agent')
  );
$$;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function is_staff() from public, anon;
revoke all on function is_admin() from public, anon;
grant execute on function is_staff() to authenticated;
grant execute on function is_admin() to authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- BUILDERS — the developers whose inventory this channel partner sells.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists builders (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  established   int,
  logo_url      text,
  about         text,
  website       text,
  projects_done int default 0,
  is_published  boolean not null default true,
  sort_order    int default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint builders_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{1,78}[a-z0-9]$')
);

-- ═══════════════════════════════════════════════════════════════════════════
-- PROJECTS — a development as a whole.
--
-- `is_partnered` is the commercially important flag: it marks the projects
-- this business has co-invested in, which the site surfaces separately from
-- ordinary channel-partner inventory. That distinction is the client's actual
-- differentiator, so it is a first-class column rather than a tag.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists projects (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  name             text not null,
  builder_id       uuid references builders(id) on delete set null,

  city             text not null default 'ahmedabad',
  locality_slug    text not null,
  address          text,
  lat              double precision,
  lng              double precision,

  category         property_category not null default 'residential',
  status           listing_status not null default 'draft',
  possession       possession_status not null default 'new-launch',
  possession_date  date,

  rera_id          text,
  total_units      int,
  total_towers     int,
  floors           int,
  land_area_acres  numeric(8,2),

  price_min        bigint,
  price_max        bigint,

  tagline          text,
  description      text,
  highlights       text[] default '{}',
  amenities        text[] default '{}',
  specifications   jsonb default '{}'::jsonb,

  hero_image       text,
  brochure_url     text,
  video_url        text,

  is_partnered     boolean not null default false,
  is_featured      boolean not null default false,

  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint projects_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{1,78}[a-z0-9]$'),
  constraint projects_price_order check (price_max is null or price_min is null or price_max >= price_min),
  constraint projects_lat_range check (lat is null or (lat between -90 and 90)),
  constraint projects_lng_range check (lng is null or (lng between -180 and 180))
);

-- ═══════════════════════════════════════════════════════════════════════════
-- PROPERTIES — an individual sellable unit. The core of the site.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists properties (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,

  project_id       uuid references projects(id) on delete set null,
  builder_id       uuid references builders(id) on delete set null,

  -- Location. `locality_slug` is validated against the app's taxonomy in
  -- src/config/site.ts, not with a FK, so adding a locality never needs a
  -- migration.
  city             text not null default 'ahmedabad',
  locality_slug    text not null,
  address          text,
  lat              double precision,
  lng              double precision,

  -- Classification
  category         property_category not null default 'residential',
  property_type    text not null,                 -- 'flats' | 'villas' | …
  transaction      transaction_type not null default 'sale',
  status           listing_status not null default 'draft',

  -- Configuration. `bhk` is numeric to allow the 2.5 BHK convention.
  bhk              numeric(3,1),
  bathrooms        int,
  balconies        int,
  floor_no         int,
  total_floors     int,
  facing           text,
  furnishing       text,                          -- unfurnished | semi | full
  age_years        int,

  -- Area, in sq.ft. Carpet is the RERA-mandated figure and the one buyers
  -- should compare on, so it is required for residential listings.
  carpet_sqft      int,
  builtup_sqft     int,
  super_sqft       int,
  plot_sqft        int,

  -- Money
  price            bigint,
  price_on_request boolean not null default false,
  maintenance_psf  numeric(8,2),
  booking_amount   bigint,
  is_negotiable    boolean not null default true,

  -- Possession
  possession       possession_status not null default 'ready-to-move',
  possession_date  date,

  -- Compliance. A listing without a RERA id can still be published (resale
  -- is exempt) but the UI badges the difference, and `rera_verified` is what
  -- the "100% RERA-verified" claim on the homepage is counted from.
  rera_id          text,
  rera_verified    boolean not null default false,

  -- Content
  description      text,
  highlights       text[] default '{}',
  amenities        text[] default '{}',
  nearby           jsonb default '[]'::jsonb,   -- [{name, type, distance_km}]

  hero_image       text,
  video_url        text,
  virtual_tour_url text,

  -- Merchandising
  is_featured      boolean not null default false,
  is_exclusive     boolean not null default false,  -- sole-mandate inventory
  sort_order       int default 0,

  -- Telemetry, incremented through an RPC rather than a client write.
  view_count       int not null default 0,
  enquiry_count    int not null default 0,

  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint properties_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{1,118}[a-z0-9]$'),
  constraint properties_bhk_range check (bhk is null or (bhk > 0 and bhk <= 20)),
  constraint properties_price_sane check (price is null or (price > 0 and price < 100000000000)),
  constraint properties_lat_range check (lat is null or (lat between -90 and 90)),
  constraint properties_lng_range check (lng is null or (lng between -180 and 180)),
  constraint properties_area_positive check (carpet_sqft is null or carpet_sqft > 0),
  -- A published listing must carry a price or be explicitly marked POR.
  constraint properties_price_required_when_live check (
    status <> 'published' or price is not null or price_on_request
  )
);

-- Full-text search across the fields a buyer would actually type.
-- Generated + GIN-indexed, so search stays in Postgres and needs no
-- third-party search service.
alter table properties
  drop column if exists search_doc;
alter table properties
  add column search_doc tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(locality_slug, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(property_type, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(address, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'D')
  ) stored;

-- ── Indexes. Each one maps to a query the app actually issues. ────────────
create index if not exists properties_search_idx    on properties using gin (search_doc);
create index if not exists properties_browse_idx    on properties (status, category, city, locality_slug);
create index if not exists properties_price_idx     on properties (price) where status = 'published';
create index if not exists properties_bhk_idx       on properties (bhk) where status = 'published';
create index if not exists properties_type_idx      on properties (property_type) where status = 'published';
create index if not exists properties_featured_idx  on properties (is_featured, sort_order) where status = 'published';
create index if not exists properties_published_idx on properties (published_at desc) where status = 'published';
create index if not exists properties_geo_idx       on properties (lat, lng) where status = 'published';
create index if not exists properties_amenities_idx on properties using gin (amenities);
create index if not exists properties_project_idx   on properties (project_id);
create index if not exists properties_locality_trgm on properties using gin (locality_slug gin_trgm_ops);

create index if not exists projects_browse_idx      on projects (status, city, locality_slug);
create index if not exists projects_partnered_idx   on projects (is_partnered, is_featured) where status = 'published';

-- ═══════════════════════════════════════════════════════════════════════════
-- MEDIA
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists property_images (
  id          uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  url         text not null,
  alt         text,
  caption     text,
  room_tag    text,                -- 'living' | 'kitchen' | 'master' | …
  width       int,
  height      int,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists property_images_prop_idx on property_images (property_id, sort_order);

create table if not exists project_images (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  url        text not null,
  alt        text,
  caption    text,
  kind       text default 'gallery',   -- gallery | masterplan | elevation | progress
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists project_images_proj_idx on project_images (project_id, sort_order);

create table if not exists floor_plans (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references projects(id) on delete cascade,
  property_id uuid references properties(id) on delete cascade,
  label       text not null,              -- '3 BHK — Type A'
  bhk         numeric(3,1),
  carpet_sqft int,
  super_sqft  int,
  price       bigint,
  image_url   text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  -- A plan belongs to a project or a unit, never to neither and never to both.
  constraint floor_plans_one_parent check (
    (project_id is not null and property_id is null) or
    (project_id is null and property_id is not null)
  )
);

-- ═══════════════════════════════════════════════════════════════════════════
-- LEADS — the commercial output of the whole site.
--
-- No anon policy exists on this table, by design. Enquiries arrive through a
-- Server Action; staff read them in the admin panel. A leaked anon key still
-- cannot enumerate the client's customer list.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists leads (
  id             uuid primary key default gen_random_uuid(),

  name           text not null,
  phone          text not null,
  email          text,
  message        text,

  source         lead_source not null default 'property_enquiry',
  status         lead_status not null default 'new',

  property_id    uuid references properties(id) on delete set null,
  project_id     uuid references projects(id) on delete set null,

  -- What the enquirer was looking for, when they told us.
  budget_min     bigint,
  budget_max     bigint,
  preferred_bhk  numeric(3,1),
  preferred_localities text[] default '{}',
  timeline       text,                      -- 'immediate' | '3m' | '6m' | 'exploring'

  -- Heuristic 0–100 priority score, computed on insert. Lets the client work
  -- the list top-down instead of chronologically.
  score          int not null default 0,

  -- Attribution + abuse forensics. `ip_hash` is a salted hash, never a raw
  -- IP, so the table stays useful for rate-limit review without becoming a
  -- log of personal data.
  utm            jsonb default '{}'::jsonb,
  referrer       text,
  user_agent     text,
  ip_hash        text,

  -- Internal
  assigned_to    uuid references profiles(id) on delete set null,
  notes          text,
  follow_up_at   timestamptz,
  contacted_at   timestamptz,
  closed_at      timestamptz,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint leads_phone_format check (phone ~ '^[+]?[0-9 ()-]{7,20}$'),
  constraint leads_email_format check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$'),
  constraint leads_score_range check (score between 0 and 100),
  constraint leads_name_length check (char_length(name) between 2 and 120),
  constraint leads_message_length check (message is null or char_length(message) <= 2000)
);

create index if not exists leads_status_idx   on leads (status, created_at desc);
create index if not exists leads_score_idx    on leads (score desc, created_at desc) where status = 'new';
create index if not exists leads_property_idx on leads (property_id);
create index if not exists leads_followup_idx on leads (follow_up_at) where status not in ('closed_won','closed_lost');
create index if not exists leads_iphash_idx   on leads (ip_hash, created_at desc);

-- Lead scoring. Deliberately simple and transparent — the client should be
-- able to read this and understand why a lead is at the top of their list.
create or replace function score_lead()
returns trigger language plpgsql as $$
declare s int := 20;
begin
  if new.email is not null then s := s + 10; end if;
  if new.message is not null and char_length(new.message) > 40 then s := s + 10; end if;
  if new.property_id is not null then s := s + 15; end if;   -- enquired on a specific unit
  if new.budget_max is not null then s := s + 15; end if;    -- disclosed a budget
  if new.budget_max >= 20000000 then s := s + 10; end if;    -- ₹2 Cr+
  if new.timeline = 'immediate' then s := s + 20;
  elsif new.timeline = '3m' then s := s + 12;
  elsif new.timeline = '6m' then s := s + 6;
  end if;
  if new.source = 'site_visit' then s := s + 15; end if;
  new.score := least(100, greatest(0, s));
  return new;
end $$;

drop trigger if exists leads_score_trg on leads;
create trigger leads_score_trg before insert on leads
  for each row execute function score_lead();

-- ═══════════════════════════════════════════════════════════════════════════
-- SITE VISITS
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists site_visits (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid references leads(id) on delete cascade,
  property_id uuid references properties(id) on delete set null,
  project_id  uuid references projects(id) on delete set null,
  visitor_name  text not null,
  visitor_phone text not null,
  slot_date   date not null,
  slot_time   text not null,          -- '10:00' … '19:00', half-hour grid
  party_size  int default 1,
  status      text not null default 'requested',  -- requested|confirmed|completed|no_show|cancelled
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint site_visits_future check (slot_date >= '2024-01-01'),
  constraint site_visits_party check (party_size between 1 and 20)
);
create index if not exists site_visits_slot_idx on site_visits (slot_date, slot_time);

-- ═══════════════════════════════════════════════════════════════════════════
-- TESTIMONIALS — social proof, moderated before it appears.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists testimonials (
  id           uuid primary key default gen_random_uuid(),
  author       text not null,
  role         text,                    -- 'Bought a 3 BHK in Shela'
  locality     text,
  avatar_url   text,
  quote        text not null,
  rating       int default 5,
  property_id  uuid references properties(id) on delete set null,
  is_published boolean not null default false,
  is_featured  boolean not null default false,
  sort_order   int default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint testimonials_rating check (rating between 1 and 5),
  constraint testimonials_quote_len check (char_length(quote) between 20 and 1200)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- LOCALITY STATS — quarterly ₹/sq.ft, powering the price-trend charts.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists locality_stats (
  id             uuid primary key default gen_random_uuid(),
  locality_slug  text not null,
  quarter        text not null,          -- '2026-Q3'
  avg_psf        int not null,
  yoy_change_pct numeric(5,2),
  inventory      int,
  created_at     timestamptz not null default now(),
  unique (locality_slug, quarter)
);
create index if not exists locality_stats_idx on locality_stats (locality_slug, quarter desc);

-- ═══════════════════════════════════════════════════════════════════════════
-- AUDIT LOG — who changed what. Append-only; not even an admin can edit it.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists audit_log (
  id         bigserial primary key,
  actor_id   uuid references profiles(id) on delete set null,
  actor_email text,
  action     text not null,              -- 'property.publish'
  entity     text,                       -- 'properties'
  entity_id  uuid,
  diff       jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_log_recent_idx on audit_log (created_at desc);
create index if not exists audit_log_entity_idx on audit_log (entity, entity_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- updated_at TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','builders','projects','properties','leads','site_visits','testimonials'
  ] loop
    execute format('drop trigger if exists %I_updated_at on %I;', t, t);
    execute format(
      'create trigger %I_updated_at before update on %I
       for each row execute function set_updated_at();', t, t);
  end loop;
end $$;

-- Stamp published_at the first time something goes live, so "newest first"
-- ordering reflects publication rather than row creation.
create or replace function stamp_published_at()
returns trigger language plpgsql as $$
begin
  if new.status = 'published' and old.status is distinct from 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end $$;

drop trigger if exists properties_publish_trg on properties;
create trigger properties_publish_trg before update on properties
  for each row execute function stamp_published_at();

drop trigger if exists projects_publish_trg on projects;
create trigger projects_publish_trg before update on projects
  for each row execute function stamp_published_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- Enabled on every table. Default is deny; each grant below is deliberate.
-- ═══════════════════════════════════════════════════════════════════════════

alter table profiles        enable row level security;
alter table builders        enable row level security;
alter table projects        enable row level security;
alter table properties      enable row level security;
alter table property_images enable row level security;
alter table project_images  enable row level security;
alter table floor_plans     enable row level security;
alter table leads           enable row level security;
alter table site_visits     enable row level security;
alter table testimonials    enable row level security;
alter table locality_stats  enable row level security;
alter table audit_log       enable row level security;

-- ── PROFILES ──────────────────────────────────────────────────────────────
drop policy if exists profiles_self_read on profiles;
create policy profiles_self_read on profiles
  for select to authenticated using (id = auth.uid() or is_admin());

drop policy if exists profiles_self_update on profiles;
create policy profiles_self_update on profiles
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- Only an admin may mint or re-role another staff account. Note this does
-- not let an admin escalate via the API alone — the auth.users row must be
-- created in the Supabase dashboard first.
drop policy if exists profiles_admin_write on profiles;
create policy profiles_admin_write on profiles
  for all to authenticated using (is_admin()) with check (is_admin());

-- ── PUBLIC READ: published inventory only ─────────────────────────────────
drop policy if exists properties_public_read on properties;
create policy properties_public_read on properties
  for select to anon, authenticated
  using (status in ('published', 'under_offer'));

drop policy if exists projects_public_read on projects;
create policy projects_public_read on projects
  for select to anon, authenticated
  using (status in ('published', 'under_offer'));

drop policy if exists builders_public_read on builders;
create policy builders_public_read on builders
  for select to anon, authenticated using (is_published);

drop policy if exists testimonials_public_read on testimonials;
create policy testimonials_public_read on testimonials
  for select to anon, authenticated using (is_published);

drop policy if exists locality_stats_public_read on locality_stats;
create policy locality_stats_public_read on locality_stats
  for select to anon, authenticated using (true);

-- Media is readable only when its parent listing is. The EXISTS subquery is
-- what stops someone walking image rows to discover unpublished inventory.
drop policy if exists property_images_public_read on property_images;
create policy property_images_public_read on property_images
  for select to anon, authenticated
  using (exists (
    select 1 from properties p
    where p.id = property_images.property_id
      and p.status in ('published','under_offer')
  ));

drop policy if exists project_images_public_read on project_images;
create policy project_images_public_read on project_images
  for select to anon, authenticated
  using (exists (
    select 1 from projects pr
    where pr.id = project_images.project_id
      and pr.status in ('published','under_offer')
  ));

drop policy if exists floor_plans_public_read on floor_plans;
create policy floor_plans_public_read on floor_plans
  for select to anon, authenticated
  using (
    exists (select 1 from projects pr where pr.id = floor_plans.project_id and pr.status in ('published','under_offer'))
    or exists (select 1 from properties p where p.id = floor_plans.property_id and p.status in ('published','under_offer'))
  );

-- ── STAFF WRITE ───────────────────────────────────────────────────────────
-- One `for all` policy per table: staff get full CRUD, everyone else gets
-- only the public read policy above.
do $$
declare t text;
begin
  foreach t in array array[
    'properties','projects','builders','property_images','project_images',
    'floor_plans','testimonials','locality_stats','leads','site_visits'
  ] loop
    execute format('drop policy if exists %I_staff_all on %I;', t, t);
    execute format(
      'create policy %I_staff_all on %I for all to authenticated
       using (is_staff()) with check (is_staff());', t, t);
  end loop;
end $$;

-- ── LEADS: no anon policy at all. ─────────────────────────────────────────
-- Public enquiry submission happens in a Server Action under the service
-- role, after Zod validation and IP rate limiting. There is intentionally
-- no path from the browser-exposed anon key into this table.

-- ── AUDIT LOG: readable by admins, writable by no one through the API. ────
drop policy if exists audit_log_admin_read on audit_log;
create policy audit_log_admin_read on audit_log
  for select to authenticated using (is_admin());
-- (Inserts arrive via the service role, which bypasses RLS.)

-- ═══════════════════════════════════════════════════════════════════════════
-- RPC: view counter.
--
-- A plain UPDATE grant would let anyone rewrite any column on a listing.
-- This function is the narrow exception: it can only ever add 1 to one
-- integer on one published row.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function bump_property_view(p_slug text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update properties
     set view_count = view_count + 1
   where slug = p_slug and status in ('published','under_offer');
end $$;

revoke all on function bump_property_view(text) from public;
grant execute on function bump_property_view(text) to anon, authenticated;

-- Enquiry counter. Called by the enquiry Server Action under the service
-- role, so it needs no anon grant — kept SECURITY DEFINER purely so the
-- narrow write stays in one auditable place.
create or replace function bump_property_enquiry(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update properties
     set enquiry_count = enquiry_count + 1
   where id = p_id;
end $$;

revoke all on function bump_property_enquiry(uuid) from public, anon;
grant execute on function bump_property_enquiry(uuid) to authenticated, service_role;

-- ═══════════════════════════════════════════════════════════════════════════
-- RPC: dashboard counters, in one round trip.
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function admin_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare result jsonb;
begin
  if not is_staff() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'properties_total',     (select count(*) from properties),
    'properties_live',      (select count(*) from properties where status = 'published'),
    'properties_draft',     (select count(*) from properties where status = 'draft'),
    'projects_total',       (select count(*) from projects),
    'leads_total',          (select count(*) from leads),
    'leads_new',            (select count(*) from leads where status = 'new'),
    'leads_week',           (select count(*) from leads where created_at > now() - interval '7 days'),
    'visits_upcoming',      (select count(*) from site_visits where slot_date >= current_date and status in ('requested','confirmed')),
    'views_total',          (select coalesce(sum(view_count), 0) from properties),
    'inventory_value',      (select coalesce(sum(price), 0) from properties where status = 'published')
  ) into result;

  return result;
end $$;

revoke all on function admin_stats() from public, anon;
grant execute on function admin_stats() to authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- STORAGE
-- Public read for listing photography; uploads restricted to staff.
-- ═══════════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-media', 'property-media', true, 10485760,
  array['image/jpeg','image/png','image/webp','image/avif','application/pdf']
)
on conflict (id) do update
  set file_size_limit = 10485760,
      allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif','application/pdf'];

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'property-media');

drop policy if exists "media staff write" on storage.objects;
create policy "media staff write" on storage.objects
  for insert to authenticated with check (bucket_id = 'property-media' and is_staff());

drop policy if exists "media staff update" on storage.objects;
create policy "media staff update" on storage.objects
  for update to authenticated using (bucket_id = 'property-media' and is_staff());

drop policy if exists "media staff delete" on storage.objects;
create policy "media staff delete" on storage.objects
  for delete to authenticated using (bucket_id = 'property-media' and is_staff());

-- ═══════════════════════════════════════════════════════════════════════════
-- BOOTSTRAP YOUR ADMIN ACCOUNT
--
--   1. Supabase Dashboard → Authentication → Users → "Add user"
--      (set a strong password, tick "Auto Confirm User")
--   2. Copy the new user's UUID, then run:
--
--      insert into profiles (id, email, full_name, role)
--      values ('<uuid-from-step-1>', 'owner@example.com', 'Owner', 'admin');
--
--   3. Add that same email to ADMIN_EMAILS in your Vercel env vars.
--
-- Access is checked in BOTH places: middleware reads ADMIN_EMAILS, and RLS
-- reads this table. Revoking either one locks the account out.
-- ═══════════════════════════════════════════════════════════════════════════
