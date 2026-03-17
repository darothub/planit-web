# Incident Reports

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
