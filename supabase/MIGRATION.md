# Migrating to Supabase

Written for: whoever runs the migration (you, or the client's developer later).

The site currently runs in **demo mode**. There is no Supabase project, so
every query falls back to fixtures in `src/lib/demo-data.ts` and
`src/lib/demo-studio.ts`. That fallback switches off automatically the moment
`NEXT_PUBLIC_SUPABASE_URL` holds a real URL — there is no flag to flip and no
code to change.

Budget about 30 minutes. Nothing here costs money; everything fits the
Supabase free tier.

---

## Before you start

Have ready:

- A Supabase account (free tier is enough).
- The e-mail address that should be able to open `/studio`.
- The real domain, if there is one. **If there is not, read step 7 anyway** —
  without it the site is invisible to Google, which is most of what this build
  is for.

---

## 1. Create the project

1. <https://supabase.com/dashboard> → **New project**.
2. Region: **Mumbai (ap-south-1)**. Every visitor is in Gujarat; a US region
   adds roughly 200ms to every query for no benefit.
3. Save the database password somewhere safe. You will not be shown it again.

Wait for provisioning to finish before the next step.

---

## 2. Apply the schema

Dashboard → **SQL Editor** → **New query**.

Paste the entire contents of `supabase/schema.sql` and run it.

It is idempotent (`create table if not exists`, `create policy if not exists`),
so re-running it is safe. It creates:

- 12 tables, with every index the app's queries rely on
- Row Level Security policies, **deny-by-default**
- the `score_lead` trigger that ranks enquiries
- the `admin_stats()` RPC the dashboard reads
- a `search_doc` tsvector column and its GIN index — this is the free
  replacement for Algolia

Expect "Success. No rows returned."

---

## 3. Seed it

Same editor, new query, paste `supabase/seed.sql`, run.

This inserts builders, projects and a starter set of listings so the site is
not empty on first load. **Replace this with the client's real inventory
before launch** — the seed copy is explicitly marked as demonstration data.

---

## 4. Create the admin user

1. Dashboard → **Authentication** → **Users** → **Add user**.
2. Use the client's real e-mail. Set a strong password and tick
   *Auto-confirm user*.
3. Copy the new user's UUID.
4. SQL Editor:

```sql
insert into profiles (id, email, full_name, role)
values ('<paste-the-uuid>', '<their-email>', 'Shree Krishna Properties', 'admin')
on conflict (id) do update set role = 'admin';
```

The `/studio` gate checks **both** `ADMIN_EMAILS` in the environment and this
`profiles.role` row. Both must agree, deliberately — the environment variable
alone would be a single point of failure, and the RLS policy alone would not
stop someone reaching the page shell.

---

## 5. Collect the keys

Dashboard → **Project Settings** → **API**:

| Dashboard label | Environment variable |
|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` `secret` | `SUPABASE_SERVICE_ROLE_KEY` |

> **The `service_role` key bypasses every RLS policy.** It must never be
> prefixed `NEXT_PUBLIC_`, never imported into a Client Component, and never
> committed. In this codebase it is reachable from exactly one module, which is
> marked `server-only`. The verify script in step 6 checks you have not swapped
> the two keys round, because that mistake ships a full-access key to every
> browser and is invisible until someone finds it.

---

## 6. Wire it up locally and verify

Create `.env.local` (already in `.gitignore` — check it stays there):

```ini
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
NEXT_PUBLIC_SITE_URL=https://<real domain>
ADMIN_EMAILS=<their-email>
REVALIDATE_SECRET=<a long random string>
```

Then:

```bash
npm run verify:supabase
```

This connects with both keys and checks the things that are painful to find
later: every table and column the app selects, that RLS is actually on, that
the **anon key cannot read `leads`** (they hold names and phone numbers), that
`admin_stats()` is callable, and that the seed landed. It exits non-zero on any
failure, so it can gate a deploy.

Fix anything it reports before continuing. Then:

```bash
npm run verify          # typecheck + 104 unit tests
npm run build
npm start               # in another terminal:
npm run test:smoke      # 40 end-to-end checks against the running server
```

The demo banner across the top of `/studio` disappears once real credentials
are present. That is the visual confirmation the fallback has switched off.

---

## 7. Set the same variables on Vercel

Project → **Settings** → **Environment Variables**. Add all six, for
**Production** and **Preview**. Redeploy.

### `NEXT_PUBLIC_SITE_URL` is not optional

`src/app/robots.ts` blocks all crawling unless `NEXT_PUBLIC_SITE_URL` is a real
domain — not `localhost`, not `*.vercel.app`. That is correct behaviour (a
preview URL must never compete with production), but it has a consequence worth
stating plainly:

**Until a custom domain is set here, `robots.txt` reads `Disallow: /` and the
sitemap advertises `localhost` URLs. The ~2,900 landing pages — the main reason
this site should out-rank the competition — do nothing at all.**

After deploying with a real domain, confirm:

```
https://<domain>/robots.txt     # must NOT be "Disallow: /"
https://<domain>/sitemap.xml    # <loc> entries must use the real domain
```

The smoke suite asserts this automatically: run
`SMOKE_URL=https://<domain> npm run test:smoke` against production and the
"robots.txt agrees with the deployment" test will fail if it is wrong.

---

## 8. Post-migration checklist

- [ ] Sign in at `/studio` with the real account; the demo banner is gone.
- [ ] Create a listing, publish it, confirm it appears on the public site.
- [ ] Submit an enquiry from a listing page; confirm it lands in **Leads**.
- [ ] Request a site visit; confirm it lands in **Site visits**.
- [ ] `npm run test:smoke` against production passes.
- [ ] Replace the seed listings with real inventory.
- [ ] Replace stock photography (`src/lib/imagery.ts` explains how).
- [ ] Fill in the real values in `src/config/identity.ts`: office address,
      RERA agent ID, GSTIN, e-mail, legal entity type, trust figures.

---

## If something goes wrong

**The site is empty after migrating.** The anon key cannot read `properties`.
Re-run step 2 — the `properties_public_read` policy did not apply.

**`/studio` says access denied.** `ADMIN_EMAILS` and the `profiles` row
disagree, or the `profiles` row was not inserted. Both must match.

**Enquiries vanish.** `SUPABASE_SERVICE_ROLE_KEY` is missing in the deployed
environment. `leads` has no anon insert policy by design, so the server action
is the only writer.

**Everything reverted to fictional data.** `NEXT_PUBLIC_SUPABASE_URL` is unset
or still a placeholder in that environment, so demo mode re-engaged. This is
the fallback working as intended — it is not a crash, which is why it is easy
to miss.
