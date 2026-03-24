# Incident Reports

---

## INC-006 — API OOM Kill: JVM Overcommitting Memory on 512MB Machine

**Date:** 2026-03-18
**Severity:** High (API repeatedly killed by Linux OOM killer; health checks failing; connection pool exhausted)
**Status:** Resolved
**Duration:** ~40 minutes (23:27 UTC → 00:05 UTC OOM kill, then ~2 min auto-restart)

---

### Summary

The `planit-api` Fly.io machine (512MB RAM) was killed by the Linux OOM killer after running for approximately 10 hours. The JVM was configured with `-XX:MaxRAMPercentage=75.0` and `-XX:MaxMetaspaceSize=128m`, which allocated up to 384MB heap + 128MB metaspace + ~100MB JVM overhead = ~612MB total — exceeding the 512MB machine limit. As memory pressure built, GC pauses grew to 1–6 minutes, starving HikariCP's housekeeper thread, causing connection pool exhaustion and health check failures before the kernel finally killed the process.

---

### Timeline

| Time (UTC) | Event |
|---|---|
| 12:55 | App started after previous restart. HikariPool started successfully. |
| 23:27 | First health check failure — JVM GC pausing long enough to miss the 10s timeout |
| 23:27–00:00 | `HikariPool-1 - Thread starvation or clock leap detected` logged repeatedly with GC pause deltas of 1–6 minutes. HikariPool housekeeper starved → all 5 connections held → `Connection is not available, request timed out after 32s` |
| 00:05 | **`Out of memory: Killed process 646 (java) anon-rss:391624kB`** — Linux OOM killer terminated the JVM |
| 00:05 | Fly.io detected crash, auto-restarted the machine |
| 00:07 | Spring Boot startup began. App became healthy ~2 minutes later. |

---

### Root Cause

**JVM memory overcommitment on a 512MB container.**

The Dockerfile `ENTRYPOINT` was:
```
java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:MaxMetaspaceSize=128m -jar app.jar
```

On a 512MB machine, this allocates:
| Region | Size |
|---|---|
| Heap (`MaxRAMPercentage=75%`) | 384MB |
| Metaspace | 128MB |
| JVM overhead (code cache, thread stacks, GC) | ~100MB |
| **Total** | **~612MB** |

This exceeds the 512MB machine limit. The JVM could not GC fast enough to stay within bounds. GC pauses grew to minutes, starving all other threads including the HikariCP housekeeper (which manages keepalives and pool maintenance). The cascading effect:

1. Housekeeper starved → connections not returned to pool
2. New requests waited 30s for a connection → `SQLTransientConnectionException`
3. `/actuator/health` couldn't get a connection → health check failed
4. Eventually the kernel OOM-killed the JVM process

The `spring.jpa.open-in-view is enabled by default` warning in the logs is also relevant — Open Session in View keeps a Hibernate session (and DB connection) open for the entire HTTP request lifecycle, including view rendering. This increases per-request connection hold time and amplifies pool exhaustion under memory pressure.

---

### Fix

| Change | Before | After | File |
|---|---|---|---|
| Machine RAM | 512MB | **1GB** | `fly.toml` |
| JVM heap ceiling | 75% of RAM = 384MB | **60% of RAM = 614MB** | `Dockerfile` |
| **Total JVM footprint** | ~612MB (over limit) | ~850MB (150MB headroom) | — |
| HikariCP pool size | 5 | **10** | `planit-prod.yml` |
| HikariCP `connection-timeout` | 30s | **10s** (fail fast) | `planit-prod.yml` |
| HikariCP `leak-detection-threshold` | not set | **15s** (logs stack trace if connection held > 15s) | `planit-prod.yml` |
| `spring.jpa.open-in-view` | `true` (default) | **`false`** — connections released at end of `@Transactional`, not end of HTTP request | `planit-prod.yml` |

With 1GB RAM and `MaxRAMPercentage=60%`: heap = 614MB, metaspace = 128MB, overhead ~100MB = ~850MB total, leaving ~174MB free for the OS and other processes.

---

### Prevention

- **Spring Boot on Fly.io requires at minimum 1GB RAM for production.** The JVM (heap + metaspace + code cache + thread stacks) for a full Spring Boot app with Hibernate, Security, WebSocket, and Spring Cloud Client routinely exceeds 500MB. Never deploy to a 512MB machine.
- **Never use `MaxRAMPercentage` above 60% on a container.** Leave headroom for metaspace, code cache, thread stacks, and the OS. Rule of thumb: `MaxRAMPercentage=60` + `MaxMetaspaceSize=128m` on a 1GB machine.
- **`spring.jpa.open-in-view=false` should be set explicitly.** The default (`true`) holds a DB connection open for the entire HTTP request, increasing connection hold time. Disable it in `application.yml` to reduce connection pressure.
- **Always set `leak-detection-threshold`** in HikariCP from the start — it logs the exact stack trace of any connection held longer than the threshold, making future pool exhaustion immediately diagnosable.

---

## INC-005 — Showcase Demo Data Leaking into Production Pages

**Date:** 2026-03-18
**Severity:** High (fake listings, messages, and bookings visible to real users; stale JWTs kept deleted accounts "signed in")
**Status:** Resolved

---

### Summary

After the production database was wiped and the real user base was still small, several production pages continued to display mock data — "Luxury Marquee", "Luxury Rooftop" listings in the messages inbox, fake featured events on the homepage, phantom bookings on the planner dashboard, and demo inquiry threads. Separately, users whose accounts had been deleted (during the DB wipe) remained "signed in" on the UI because no 401 interceptor existed to purge their stale JWT cookies.

The root cause was the demo-first React Query pattern (`placeholderData: DEMO_DATA` + `data = DEMO_*` default) which had been applied to every page during initial development — including authenticated pages where it is actively harmful.

---

### Root Causes

**1. Demo data as `placeholderData` and error-state default**
Every page query used `placeholderData: DEMO_*` (shown during loading) and `data = DEMO_*` as the destructuring default (shown when the query fails or returns nothing). This meant:
- On first load: fake listings/planners/bookings flashed before the real API response arrived.
- On API error: the page silently fell back to demo fixtures — appearing full of data even when the DB was empty or the user's session was invalid.

Affected pages:
- `FeaturedListings.tsx` — demo featured listings on homepage
- `CategoryRows.tsx` — demo event categories and listings on homepage
- `listings/index.tsx` — demo listing page on browse page
- `planners/index.tsx` — demo planner page on browse page
- `messages/[inquiryId].tsx` — demo inquiries and messages in the inbox
- `PlannerDashboard.tsx` — demo bookings, inquiries, and planner profile
- `ClientDashboard.tsx` — demo bookings and inquiries on client dashboard
- `PlannerStatsRow.tsx` — demo stats and bookings on planner dashboard

**2. No global 401 interceptor**
When the production database was wiped, all existing user accounts were deleted. However, their JWTs had a 7-day expiry — so existing cookies remained valid client-side. On every API call, the server returned 401 (user not found), but the frontend had no interceptor to handle this response. The Zustand auth store (persisted to `localStorage`) still held the user object, and the 401 errors were silently swallowed — leaving the UI in a "signed in with no account" limbo state, which caused further API failures and cascade fallbacks to demo data.

---

### Fix

**Part 1 — Global 401 interceptor** (`src/lib/api.ts`)

Added an Axios response interceptor that on any 401:
1. Removes the `planit_token` cookie
2. Calls `useAuthStore.getState().logout()` (Zustand static getter — safe outside React)
3. Redirects to `/auth/login` via `window.location.replace`

**Part 2 — Remove demo data from production pages** (8 files)

| File | Removed | Replaced with |
|---|---|---|
| `FeaturedListings.tsx` | `DEMO_FEATURED`, `placeholderData` | `[]`, skeleton on `isLoading` |
| `CategoryRows.tsx` | `DEMO_EVENT_TYPES`, `getDemoListings`, `placeholderData` | `[]` |
| `listings/index.tsx` | `DEMO_PAGE`, `DEMO_EVENT_TYPES` | `EMPTY_PAGE`, `[]` |
| `planners/index.tsx` | `DEMO_TYPES`, `DEMO_PAGE` | `EMPTY_PAGE`, `[]` |
| `messages/[inquiryId].tsx` | `DEMO_INQUIRIES_*`, `DEMO_MESSAGES` | `[]` |
| `PlannerDashboard.tsx` | `DEMO_BOOKINGS_PLANNER`, `DEMO_INQUIRIES_RECEIVED`, `DEMO_PLANNER_PROFILE_VERIFIED` | `[]`, `undefined` |
| `ClientDashboard.tsx` | `DEMO_BOOKINGS_CLIENT`, `DEMO_INQUIRIES_CLIENT` | `[]` |
| `PlannerStatsRow.tsx` | `DEMO_PLANNER_STATS`, `DEMO_BOOKINGS_PLANNER` | `undefined`, `[]` |

For pagination pages (`listings`, `planners`), `placeholderData: (prev) => prev` is kept — this retains the previous real page during filter changes, preventing flicker. It is safe because it only activates when a prior real API result exists.

---

### Prevention

- **The demo-first React Query pattern is for public unauthenticated pages only** (homepage, public listing browse, public planner browse). It must never be used on:
  - Authenticated dashboard pages (client, planner)
  - Admin pages
  - Inbox / messages pages
  - Any page where showing fake data could mislead a real user
- **Always add a global 401 interceptor** in `api.ts` from the start of any project. Stale JWTs are inevitable — the app must handle them gracefully rather than silently degrading to demo state.
- **Showcase demo data (`src/showcase/data.ts`) must never be imported outside `src/pages/showcase/` and `src/showcase/`.** Any import of showcase fixtures in a production page is a bug.

---

## INC-004 — Database Migration to Fly.io: SSL Handshake Failure on First Deploy

**Date:** 2026-03-18
**Severity:** Medium (API failed to start on first migration deploy; self-resolved within minutes)
**Status:** Resolved

---

### Summary

The production database was migrated from Railway PostgreSQL to a Fly.io Postgres cluster (`planit-db`, London region) to eliminate cross-cloud latency and idle connection timeout issues. The first deploy after switching the JDBC URL failed because the JDBC driver attempted an SSL handshake to an internal Fly.io address that does not speak SSL on that interface. A second deploy with `sslmode=disable` resolved the issue. The app started in 36 seconds — down from 614 seconds on Railway.

---

### Timeline

| Time | Event |
|---|---|
| T+0 | Created Fly.io Postgres cluster `planit-db` in `lhr` (London) region, `shared-cpu-1x`, 10 GB volume |
| T+0:05 | Created `planit` database via `fly proxy` tunnel + local psql |
| T+0:10 | Updated `planit-config-repo/planit-prod.yml`: switched JDBC URL to `planit-db.flycast:5432/planit`, relaxed HikariCP settings (max-lifetime 30 min, keepalive 60s) |
| T+0:15 | First deploy failed — `SSL error: Remote host terminated the handshake` |
| T+0:20 | Added `?sslmode=disable` to JDBC URL. Redeployed. |
| T+0:25 | App started successfully in **36 seconds**. Admin user and event types seeded on fresh DB. |

---

### Root Cause

Fly.io's private networking (`.flycast` / `.internal`) routes traffic through WireGuard — the connection is already encrypted at the network level. The Fly.io Postgres cluster does not present an SSL certificate on the internal interface. The PostgreSQL JDBC driver defaults to `sslmode=prefer`, which attempts SSL and fails when the server terminates the handshake. Adding `sslmode=disable` tells the driver to skip SSL negotiation for internal connections.

---

### Fix

```
# planit-config-repo/planit-prod.yml
spring.datasource.url: jdbc:postgresql://planit-db.flycast:5432/planit?sslmode=disable
```

---

### Outcome

| Metric | Before (Railway) | After (Fly.io) |
|---|---|---|
| Startup time | ~614 seconds | ~36 seconds |
| Connection idle timeout | ~58 seconds (Railway kills connections) | No issue (same-region, stable) |
| HikariCP keepalive needed | 30s (to beat 58s timeout) | 60s (relaxed) |
| Cross-cloud latency | Fly.io London → Railway DB | Same-region internal (WireGuard) |

---

### Prevention

- **Always add `?sslmode=disable` when connecting to Fly.io Postgres via `.flycast` or `.internal`.** The internal network is secured by WireGuard — SSL at the JDBC layer is redundant and unsupported on the internal interface.
- **For external connections** (e.g. local `fly proxy` tunnel), SSL works normally and should be kept enabled.

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
