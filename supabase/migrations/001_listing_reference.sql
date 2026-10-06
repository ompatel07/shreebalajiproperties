-- ═══════════════════════════════════════════════════════════════════════════
-- 001 — LISTING REFERENCE NUMBERS
-- Run in the Supabase SQL Editor, after schema.sql.
-- Safe to re-run: every step is guarded.
--
-- ── Why a sequence and not something derived ──────────────────────────────
-- The number has to survive being spoken down a phone ("I'm calling about
-- SK-0042"), so it must be short, stable and never reused. That rules out:
--
--   * a hash of the UUID — short hashes collide, and nobody can read one out
--   * row_number() over created_at — renumbers everything the moment a row is
--     deleted, so yesterday's SK-0042 is today's SK-0041. A reference that
--     changes is worse than none.
--
-- A sequence gives a gap-tolerant, monotonic, never-reused integer. Gaps are
-- a feature here: if SK-0042 was deleted, SK-0042 stays dead rather than being
-- handed to a different flat.
--
-- `ref_code` is a STORED generated column so the display form is computed
-- once by Postgres and is indexable — the admin searches on it directly, and
-- the app never has to format or parse it.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

-- ── 1. The raw number ─────────────────────────────────────────────────────
alter table properties add column if not exists ref_no bigint;

-- ── 2. Backfill existing rows in a stable, meaningful order ───────────────
-- Oldest listing becomes SK-0001. `id` breaks ties so the result is
-- deterministic if two rows share a created_at.
with ordered as (
  select id, row_number() over (order by created_at, id) as rn
  from properties
  where ref_no is null
)
update properties p
set ref_no = o.rn
from ordered o
where p.id = o.id;

-- ── 3. The sequence, positioned past whatever we just backfilled ──────────
create sequence if not exists properties_ref_no_seq owned by properties.ref_no;

select setval(
  'properties_ref_no_seq',
  coalesce((select max(ref_no) from properties), 0) + 1,
  false
);

alter table properties alter column ref_no set default nextval('properties_ref_no_seq');
alter table properties alter column ref_no set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'properties_ref_no_unique'
  ) then
    alter table properties add constraint properties_ref_no_unique unique (ref_no);
  end if;
end $$;

-- ── 4. The human-facing code ──────────────────────────────────────────────
-- SK-0001 … SK-9999, then widening naturally to SK-10000. Four digits is the
-- sweet spot: short enough to read aloud, long enough that it looks like a
-- reference rather than a count.
alter table properties
  add column if not exists ref_code text
  generated always as ('SK-' || lpad(ref_no::text, 4, '0')) stored;

create index if not exists properties_ref_code_idx on properties (ref_code);

commit;

-- ── Check ─────────────────────────────────────────────────────────────────
-- select ref_code, title from properties order by ref_no limit 10;
