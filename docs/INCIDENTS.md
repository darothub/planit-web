# Incident Reports

---

## INC-003 — Planner Browse Broken: `lower(bytea)` Error + HikariCP Connection Drops + 10-Minute Startup

**Date:** 2026-03-17
**Severity:** High (planner browse page completely broken; connection pool errors on every cold start)
**Status:** Resolved

---

### Summary

Three related production issues surfaced after the Fly.io migration:

1. **`lower(bytea)` SQL error** — the planner search endpoint crashed with `function lower(bytea) does not exist` whenever a location filter was applied. The browse page was completely broken for filtered searches.
2. **HikariCP connection drops** — Railway PostgreSQL was closing idle connections in ~58 seconds; HikariCP's keepalive was set to 60 seconds, too slow to prevent the drop.
3. **10-minute startup / health check timeout** — Spring Boot took ~614 seconds to start on a shared-cpu-1x Fly.io machine (Hibernate `ddl-auto: update` doing cross-Atlantic schema validation). The health check grace period was only 60 seconds, causing restart failures.

---

### Root Causes

**1. Hibernate 6 `bytea` inference bug**
In Hibernate 6 (ORM 7.x), untyped JPQL parameters inside SQL functions like `CONCAT()` are inferred as `bytea` by the PostgreSQL JDBC driver when no explicit type is provided. The query:
```java
"LOWER(CONCAT('%', :location, '%'))"
```
caused PostgreSQL to receive `lower(bytea)` which has no matching function overload. This only surfaces with real PostgreSQL — H2 in integration tests handles it silently.

**2. Railway idle connection timeout < 60 seconds**
Railway's managed PostgreSQL closes idle connections in under 60 seconds. HikariCP's `keepalive-time` was configured at 60,000 ms — just too slow to send the keepalive query before Railway terminated the connection.

**3. Health check grace period too short**
The Fly.io health check `grace_period` was set to 60s. Spring Boot initialization (`WebApplicationContext` + Hibernate schema update over a remote DB) takes ~614 seconds on a `shared-cpu-1x` machine. Every restart failed the health check until the machine was eventually healthy.

---

### Fixes

| # | Fix | File(s) |
|---|---|---|
| 1 | Added `cast(:location as string)` in JPQL to give Hibernate an explicit type, generating `CAST(? AS varchar)` | `planner/repository/PlannerRepository.java` |
| 2 | Reduced `keepalive-time` from 60,000 ms → 30,000 ms | `planit-config-repo/planit-prod.yml` |
| 3 | Increased health check `grace_period` from 60s → 720s | `fly.toml` |

Also added: `max-lifetime: 540000` (9 min) and `maximum-pool-size: 5` to HikariCP config.

---

### Prevention

- **Always cast untyped JPQL parameters in function calls.** Use `cast(:param as string)` for any string parameter inside `CONCAT()`, `LOWER()`, or similar functions. The H2 integration tests do not catch this — it only fails on real PostgreSQL.
- **Set `keepalive-time` well below the DB server's idle timeout.** Railway's timeout is ~58 seconds; always use at most half that (30 seconds) as the keepalive interval.
- **Set `grace_period` based on actual measured startup time**, not a guess. After any significant infrastructure change, measure the real startup time from logs (`Started PlanitApplication in X seconds`) and set `grace_period` to at least 120% of that value.
- **Long-term: move the database to Fly.io.** Cross-cloud (Fly.io London → Railway) round trips are the main cause of the 10-minute Hibernate startup. A same-region Fly.io Postgres instance would bring startup to ~1-2 minutes and eliminate idle connection timeout issues entirely.

---

## INC-002 — Mock Data in Production Database + Flash of Fake Admin Stats

**Date:** 2026-03-17
**Severity:** Medium (misleading admin stats; listing deletion blocked by orphaned inquiry)
**Status:** Resolved

---

### Summary

After the initial deployment, the production database contained seeded mock data (users, planners, listings, inquiries) left over from development. This caused two visible issues: (1) a listing could not be deleted because a mock inquiry was associated with it, and (2) admin dashboard pages flashed large fake numbers (187 clients, 142 bookings, £284,750 revenue) before real data loaded due to the React Query `placeholderData: DEMO_DATA` pattern used on admin queries.

---

### Root Causes

1. **Mock data in production DB** — Development seeding scripts or manual testing left 14 users, 4 planners, 1 listing, 1 inquiry, and 2 inquiry messages in the production Railway PostgreSQL database. The listing deletion endpoint correctly blocks deletion when active inquiries exist, which surfaced the orphaned data.

2. **`placeholderData: DEMO_DATA` on admin pages** — The demo-first React Query pattern (required for public-facing pages so they render without a backend) was also applied to admin stat pages. On admin pages this is actively harmful — it flashes inflated fake numbers to admins before real data loads, creating confusion about the actual state of the platform.

---

### Fix

**DB cleanup** — Connected directly via `psql` and deleted all non-admin rows in FK order:
```sql
DELETE FROM inquiry_messages;
DELETE FROM inquiries;
DELETE FROM event_listing_images;
DELETE FROM event_listing_amenities;
DELETE FROM event_listings;
DELETE FROM portfolio_images;
DELETE FROM planner_specialties;
DELETE FROM planners;
DELETE FROM users WHERE role != 'ADMIN';
```
Result: DB left with 1 row (admin user) and all event types intact.

**Admin page fix** — Removed `placeholderData: DEMO_DATA` from `admin/index.tsx`, `admin/disputes.tsx`, and `admin/planners.tsx`. The stats page now uses `EMPTY_STATS` (all zeros) as its error/unavailable fallback instead of demo data. During loading, the existing skeleton UI is shown.

---

### Prevention

- **Never apply `placeholderData: DEMO_DATA` to admin or dashboard data queries.** The demo-first pattern is for public-facing pages only (listings, home, planner profiles). Admin pages should show skeletons on load and zeros on error.
- **Add a DB cleanup step to the post-deployment checklist** in `.workflow/CONFIG-SERVER-MIGRATION.md` to wipe any seeded test data before going live.
- **Before deleting a listing via the admin UI**, ensure associated inquiries are cleared first, or build a cascade-delete admin endpoint.

---

## INC-001 — Cloudflare Turnstile CAPTCHA Not Working on Vercel Deployment

**Date:** 2026-03-17
**Severity:** High (auth forms completely blocked — users could not log in or register)
**Status:** Resolved
**Duration:** ~3 hours

---

### Summary

After migrating the frontend from Railway to Vercel, the Cloudflare Turnstile CAPTCHA widget failed to render correctly on the login, register, and forgot-password pages. Users were blocked from authenticating. Once the widget was eventually rendered (after fixes), the backend rejected all CAPTCHA tokens with "CAPTCHA verification failed".

---

### Timeline

| Time | Event |
|---|---|
| T+0 | Frontend deployed to Vercel. Turnstile widget not rendering at all. |
| T+0:30 | Confirmed `NEXT_PUBLIC_TURNSTILE_SITE_KEY` was set on Vercel but had `ded\n` appended (echo trailing newline artifact). Fixed with `printf`. Redeployed. |
| T+1:00 | Widget now renders but shows "Unable to connect to website" with HTTP 400 from `challenges.cloudflare.com`. |
| T+1:15 | Switched from `@marsidev/react-turnstile` library to native `window.turnstile.render()` via `next/script`. Redeployed. Error persisted. |
| T+1:45 | Confirmed site key was correct in bundle and domain `planit-web-two.vercel.app` was in Cloudflare's hostname allowlist. |
| T+2:00 | Discovered Cloudflare bug: the hostname kept being silently removed from the original widget's allowlist on save. Created a new Turnstile widget for the Vercel domain. Updated site key on Vercel and secret key in `planit-config-repo/planit-prod.yml`. Redeployed. |
| T+2:30 | Widget now renders and completes challenge successfully. But backend returns "CAPTCHA verification failed" — stale secret key in memory. |
| T+2:45 | Restarted `planit-api` Fly.io machine to re-fetch config from Spring Cloud Config Server. |
| T+3:00 | Fully resolved. Login, register, and forgot-password all working. |

---

### Root Causes

1. **Trailing newline in Vercel env var** — `echo "value" | vercel env add` appends a `\n` to the stored value. The actual env var was `0x4AAAAAACrWbGh6Tkz_fdu4ded\n` instead of `0x4AAAAAACrWbGh6Tkz_fdu4`. Always use `printf` when piping values to `vercel env add`.

2. **`@marsidev/react-turnstile` incompatibility** — The library wrapper caused widget initialisation failures in the Next.js 16 / Turbopack build. Replaced with the native Cloudflare Turnstile API (`window.turnstile.render()`) loaded via `next/script` with `strategy="lazyOnload"`.

3. **Cloudflare Turnstile dashboard bug** — Hostnames added to an existing Turnstile widget were silently removed on page refresh. Resolved by creating a fresh widget with only `planit-web-two.vercel.app` as the hostname.

4. **Stale config in planit-api** — Spring Cloud Config is loaded at startup. Rotating the Turnstile secret key in `planit-config-repo` has no effect until the API is restarted. Restarted the Fly.io machine to reload config.

---

### Fix Summary

| # | Fix | File(s) Changed |
|---|---|---|
| 1 | Use `printf` (not `echo`) when piping values to `vercel env add` | — (operational) |
| 2 | Replaced `@marsidev/react-turnstile` with native `window.turnstile.render()` | `src/components/auth/TurnstileWidget.tsx` |
| 3 | Created new Turnstile widget; updated site key on Vercel and secret key in config repo | `planit-config-repo/planit-prod.yml` |
| 4 | Restarted `planit-api` Fly.io machine to reload config server values | — (operational) |

---

### Prevention

- **Always use `printf` not `echo`** when setting Vercel env vars via CLI.
- **After rotating any secret in `planit-config-repo`**, restart the `planit-api` Fly.io machine: `fly machines restart <id> --app planit-api`.
- **Prefer native browser APIs over wrapper libraries** for third-party widgets (Turnstile, reCAPTCHA, etc.) to avoid SSR/hydration conflicts in Next.js.
- **Verify Cloudflare Turnstile hostnames persist** after saving — there is a known dashboard bug where they can be silently removed.
