# Agent Instructions — WSM Publisher

AI agents working in this repository must follow this root contract and the project-specific requirements below.

## Mandatory authority and startup

At the start of each new AI engineering session, apply CubeBox OS governance from the company source of truth: [CubeBox-Digital/cubebox-os](https://github.com/CubeBox-Digital/cubebox-os) (`main`). If available, read from a verified local checkout of that repo instead. The authoritative files are:

- `AGENTS.md` — global agent instructions and human approval gates;
- `core/constitution.md` and `core/operating-principles.md` — company constraints and default operating posture;
- `docs/development-cycle.md` — proportionate development, testing, staging, deployment, and recordkeeping;
- `sharia/policy.md` — Sharia baseline, always applicable;
- `core/approval-policy.md` — reserved actions.

Load additional CubeBox OS security, governance, Sharia Gate, or deployment detail **only when the change triggers it**. Read this project's own README/STATUS/architecture and local project instructions before changing it. Reuse source material already verified in this session; do not repeatedly fetch everything.

CubeBox OS provides company-wide minimums. Project-specific instructions add constraints but must not weaken these gates. If the canonical repository cannot be accessed, apply the minimum guardrails below; **never claim the full policies were checked**, and stop any consequential action whose approvals or safeguards cannot be verified.

## Minimum rules enforced even when offline

- **Simple first:** prefer reuse and an accountable manual admin fallback; add narrow automation only for proven repeated need; avoid enterprise architecture and hypothetical edge-case systems. Prioritize easy UX, low cost, one-builder maintenance, and pilot adoption.
- **Safe by default:** preserve Sharia requirements, authorization, privacy, data/payment integrity, auditability, backups/recovery appropriate to risk, and least privilege. Rare disputes may be investigated by an admin; do not discard real settlements or double-credit payments.
- **Human approval:** require explicit human authority for production changes, external publication, financial commitments, destructive or irreversible operations, sensitive security/access changes, and Sharia clearance. Never infer authorization from silence.
- **Resource discipline:** reason and design in chat first; give the model/mode and meaningful cost warning before substantial tool use; prefer one tightly scoped change, tests relevant to risk, no sub-agents or repeated broad regressions by default. Stop when accepted.
- **Evidence and environment:** know DEV/SIT/PROD, work away from PROD when possible, do not invent state or test results, review diffs, protect secrets, preserve user content, and report actual PASS/FAIL plus residual risk.


## Mandatory Decision Continuity Gate

Before **material recommendations, code changes, handoffs, or consequential actions**, load the canonical [CubeBox OS Decision Continuity Gate](https://github.com/CubeBox-Digital/cubebox-os/blob/main/docs/decision-continuity-gate.md), in addition to every applicable company and project rule. Verify relevant LOCKED/ACCEPTED/IMPLEMENTED/REJECTED decisions and **actual existing code/tests/acceptance**. Do not re-ask settled questions, restart accepted work, or treat UNKNOWN as not implemented. Explain conflicts/new evidence and obtain owner approval before changing locked scope. Issue a concise evidence-backed gate receipt covering the policy version, project status, prior decisions, implementation, conflicts, relevant gates, validation and rollback. At PR time complete the mandatory receipt template. Reuse verified evidence within a session; scoped checks are mandatory, repeated full scans are not. Never treat an agent-written receipt or passing structural CI as proof of semantic truth. If governance or authorization is unavailable, stop consequential work.

## Project-specific requirements

Read `README.md`, the manifest contract and affected scheduler workflow before changing publishing logic.

- Never publish unapproved content or bypass the exact date/account/slot/media/approved/hash/receipt checks. Production publication requires explicit human approval.
- Preserve deduplication, approved brand assets, and the Sharia gate for content/claims. Do not regenerate or alter approved logos/assets as a substitute for source originals.
- Prefer manual publishing and small targeted fixes over adding schedulers, integrations, or automation without demonstrated need and explicit approval.
- Treat publisher secrets and external service tokens as sensitive; no plaintext in Git or logs.

