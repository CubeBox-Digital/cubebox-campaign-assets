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
- 20:45 WIB — @muslimhalaltrip Story

GitHub cron runs in UTC.

## Fail-closed contract

The backend publishes only when the current Asia/Jakarta date has an exact manifest entry matching date, account, account_id, slot, media type and `approved:true`. It verifies the public asset is JPEG, byte length matches, and SHA-256 matches before claiming a database receipt and calling Windsor.

A published database receipt blocks duplicate writes. GitHub stores no Windsor or Instagram secret.
