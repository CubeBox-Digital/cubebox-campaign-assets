# WSM Cloudflare Cron cutover — shadow-first

This change is a **DRAFT**, not deployed. Never enter production secrets in a repo or chat.

## Why
GitHub scheduled runs were delayed hours and Floot rejected them with 409. Same-day late catch-up now works in Floot (tested with GitHub OIDC); a reliable independent scheduler and fail-closed HMAC auth are the next steps.

## Prerequisites
- Own Cloudflare account with at least 5 Cron Trigger allocations free. Workers Free limit/usage must be checked on the user's account.
- Floot secret `WSM_CF_HMAC_SECRET` provisioned as SERVER-SIDE resource using account settings (same 32+ character random value as Worker secret).
- Floot endpoint verified to accept `cloudflare-cron-v1` HMAC signed request. Existing GitHub OIDC remains valid during transition.

## Safe deployment and cutover
1. Test locally: `node --test cloudflare/test/worker.test.mjs`.
2. Create or link Cloudflare account, `cd cloudflare; npx wrangler login; npx wrangler deploy`.
3. Set `npx wrangler secret put WSM_CF_HMAC_SECRET`; NEVER check secret into repo.
4. Keep `WSM_SHADOW_MODE = "true"` through 1–3 successful exact-slot dry runs. Confirm the signed Floot endpoint returns 200 with `no_op` and that no new publish receipts/media appear.
5. Confirm approved same-day manifests exist for testing. Shadow dry-run on unapproved slots returns `no_op`; do not call it PASS for a whole publish cycle.
6. During a controlled cutover, disable GitHub workflow `schedule:` triggers, retain manual workflow dispatch as a break-glass fallback; ensure only one publisher is enabled.
7. Set `WSM_SHADOW_MODE = "false"` and deploy. For each triggered slot, verify Instagram Media ID and Floot `campaign_publish_receipts`. Failures are NOT successes. Test 3 consecutive days.
8. Rollback: set `WSM_SHADOW_MODE = "true"` first. Reenable GitHub schedule only when Cloudflare publishing is off; DB receipt dedupe remains in effect.
9. Never republish an ambiguous `claimed`/failed receipt without verifying Instagram first. Never publish cross-date.

## Security contract
Request body: exact JSON `{date,timezone,account,account_id,slot_time,media_type,dry_run}`.
Headers:
- `x-wsm-scheduler: cloudflare-cron-v1`
- `x-wsm-timestamp: <milliseconds since epoch>`
- `x-wsm-signature: sha256=<hex HMAC-SHA256(secret, timestamp + "." + raw body)>`

Floot checks: timestamp tolerance max 300 seconds, timingSafeEqual, valid secret length, exact canonical Jakarta target, no early publish, same-day approved manifest, JPEG bytes + hash, database dedupe, Instagram Media ID.

Only original event.scheduledTime resolves dates (not current date). A cross-day-delayed event is no-op and alerts, never shifted to tomorrow. Cloudflare cron is best effort: monitor actual latency; do not promise exact 5-minute SLA before pilot measurement.

5 UTC cron entries map to WIB 11:45, 12:30, 19:30, Sunday 20:15, daily 20:45. MHT 20:45 weekday rotation is built into resolver.
