# CubeBox Campaign Assets / WSM Publisher

This repository contains the external scheduler for the WSM Campaign Factory Instagram publisher.

## Architecture

- Creative generation + human approval: ChatGPT WSM Campaign Factory automation at 08:00 Asia/Jakarta.
- Approved assets + fail-closed manifest: https://cubebox-campaign-assets.floot.app
- Scheduler: GitHub Actions in `.github/workflows/wsm-instagram-publisher.yml`.
- Authentication from GitHub to Floot: GitHub OIDC, audience `wsm-campaign-publisher`.
- Publisher backend: Floot `/_api/publisher-run`.
- Instagram write transport: Windsor.ai Connectors Write Actions API.
- Runtime dedupe + publish proof: Floot Postgres `campaign_publish_receipts`.

## Slots

- 11:45 WIB — @umrohfriendly feed
- 12:30 WIB — @infoumrohhemat Story
- 19:30 WIB — @infoumrohhemat feed
- Monday 20:45 WIB — @muslimhalaltrip feed
- Tuesday 20:45 WIB — @muslimhalaltrip Story
- Wednesday 20:45 WIB — @muslimhalaltrip feed
- Thursday 20:45 WIB — @muslimhalaltrip Story
- Friday 20:45 WIB — @muslimhalaltrip feed
- Saturday 20:45 WIB — @muslimhalaltrip Story
- Sunday 20:15 WIB — @muslimhalaltrip feed
- Sunday 20:45 WIB — @muslimhalaltrip Story

GitHub cron runs in UTC. The scheduler resolves the exact Asia/Jakarta date,
account, account ID, slot time, and media type before calling Floot. The only
additional cron is the Sunday 20:15 MHT feed; the daily 20:45 cron is reused.

## Fail-closed contract

The backend publishes only when the current Asia/Jakarta date and canonical
weekly rotation exactly match the scheduler request and the manifest has one
exact entry matching date, account, account_id, slot time, media type, and
`approved:true`. Feed entries require a non-empty caption. Story captions are
ignored. It verifies the public asset is JPEG, byte length matches, and SHA-256
matches before claiming a database receipt and calling Windsor.

A published database receipt for the exact date/account/account_id/slot/media
target blocks duplicate writes. Approvals are never reused across dates. Assets
are sent byte-for-byte from the exact manifest URL; the publisher must not
regenerate, resize, recompress, or substitute them. GitHub stores no Windsor or
Instagram secret.

If a canonical slot has no exact same-day approved manifest entry, the run is a
successful no-op. In particular, the new Sunday 20:15 MHT feed remains a no-op
until a separate exact asset is created and approved for that slot.

## Validation

Run `tests/test-resolve-publisher-target.sh` to verify all seven MHT rotation
days, the Sunday dual-slot, the unchanged core slots, invalid non-Sunday 20:15
rejection, and the push-event dry run.
