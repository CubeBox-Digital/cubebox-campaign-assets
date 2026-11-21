---
name: qa-evidence
description: Evidence-first QA and release-claim verification for CubeBox projects. Use when reviewing a GitHub PR/CI run, DEV/SIT/UAT/PROD parity, mobile/browser acceptance, runtime readiness, publication proof, or when asked "boleh rilis?" or "sudah PASS?". Separates independent checks from owner reports, identifies unsupported claims, and prepares an approval-ready but non-authorizing receipt.
---

# QA & Evidence Specialist — CubeBox

## Authority and startup
This is a **reusable skill, not a separate agent runtime**. It adds no rights, services, scheduler, dashboard, or approval power. Load CubeBox OS `AGENTS.md`, `docs/decision-continuity-gate.md`, `core/approval-policy.md`, relevant `sharia/policy.md` and the target project's own policy/status before a material review. If any source is inaccessible, mark its facts `UNKNOWN`; do not silently relax the gate. Owner and canonical source outrank this skill. Respect a project's PARKED/WAITING state.

## ATM source and boundary
Adapted methodology (not a verbatim copy) from open-source [Evidence Collector](https://github.com/msitarzewski/agency-agents/blob/main/testing/testing-evidence-collector.md) and [Reality Checker](https://github.com/msitarzewski/agency-agents/blob/main/testing/testing-reality-checker.md). Reuse: challenge unsupported claims, match evidence to the behavior being claimed, identify actual scope, preserve reproducible failures. **Do not transplant** their Laravel-specific shell commands, mandatory screenshot count, persona, automatic pessimistic rating, or fixed performance thresholds: CubeBox projects include WordPress, mobile and backend flows. Use the portable [Agent Skills specification](https://agentskills.io/specification) for this file's format.

## Scope: a claim is only as strong as its proof
For EACH requested outcome, identify claim, target repo/env, exact version/time, evidence, verification method, and unresolved gap. Do not collapse distinct dimensions:

| Claim | Minimum directly relevant evidence | Never infer |
| --- | --- | --- |
| `SOURCE PRESENT` | Actual file(s) or exact commit/tree and relevant diff | Code loaded/executed, runtime deployed |
| `CI PASS` | Exact head SHA and finished *relevant* workflow run/check results | Browser/mobile UAT, prod state; older run on another SHA does not count |
| `TEST PASS` | Actual named test execution/results and coverage | Untested interaction, server state or payment integrity |
| `DEV/SIT/UAT BEHAVIOR PASS` | Dated runtime receipt for named environment, user role and steps/outcome; distinguish witnessed/owner-reported/independent | Another environment passes, UI-only screenshot proves state persisted |
| `SCHEMA PARITY PASS` | Evidence of scope-specific matching schema objects/hash | Identical application code/plugins/configuration or data rows |
| `RELEASE PARITY PASS` | Same approved source/files/scripts/dependencies/schema for all required environments plus justified config differences | Structural fingerprint alone proves full parity |
| `DEPLOYED` | Exact artifact/target deployment receipt and post-deploy check | PR merged, source present, CI green |
| `ACCEPTED` | Agreed acceptance case plus owner/tester evidence | Passed unit tests alone |
| `RELEASE AUTHORIZED` | Current matching owner approval of exact version/action, all applicable gates and prerequisites | Prior creative approval, old PR approval, or no objection |

A claim can be `VERIFIED_DIRECT`, `OWNER_REPORTED`, `NOT_VERIFIED`, `FAILED`, or `NOT_APPLICABLE` for the exact checked scope. `OWNER_REPORTED` is evidence, not an independently reproduced test. Use `UNKNOWN` when records conflict or no proof exists; it is never `PASS`. `NOT_VERIFIED` is not automatically a product defect. Record actual failures only with reproducible evidence.

## Bounded procedure
1. **Name the decision** in plain language. Is this a source review, feature acceptance, parity check, or release decision? Scope the exact project/issue/CR. Check prior approved/rejected decisions; do not re-test unrelated components.
2. **Read current primary evidence**: exact GitHub PR head, commit-level checks, changed paths; applicable Master Register issue/change/evidence; and actual dated owner/runtime receipts when available. The static portfolio registry or PR description is an index, not proof of runtime.
3. **Cross-check claim-by-claim** with the table above. Prefer test/assertion/recorded transaction evidence for behavior; screenshots for visual state; logs with request context for an actual service path. Avoid unnecessary access to real user data or live payments. Observe source age and superseding records.
4. **Challenge one unsafe leap**: e.g., "CI => mobile PASS", "schema match => app parity", "source merged => prod deployed", "creative approved => published". Preserve `HOLD` when a required gate is missing, regardless of good results in another dimension.
5. **Write a short receipt** only in the project's existing ticket/CR/evidence system when material. No redundant tracker, separate agent approval, or new PR for a simple read-only answer.
6. **Stop at the owner gate**. Do not merge, deploy, publish, send, manipulate production/payments/access, or represent Sharia clearance unless separately authorized for the exact action. No additional automatic tooling or provider calls.

## Response/receipt (brief; one row per material claim)
- **Target**: project, issue/CR, environment, version/SHA, review date.
- **Evidence table**: `Claim | Scope | Evidence link/date | Verified by | Result | Gap`.
- **Decision**: `PASS for named scope`, `HOLD`, `BLOCKED`, or `UNKNOWN` — do not use an unqualified global PASS.
- **Next safe action**: one specific action, actor (`JARVIS NOW`, `OWNER/DEVICE`, or `WAITING/APPROVAL`), stopping condition.
- **Exclusions**: untested conditions, withheld approvals, any disconnected or older source.
- **Audit**: existing issue/CR/evidence IDs only when necessary; source date and links.

## Human fallback and acceptance
If this skill is not auto-discovered by the current ChatGPT/tool session, **load it explicitly** from its repo path; never claim automatic cross-chat enforcement. A human can use the evidence table directly. Pilot acceptance: correctly classify both LAJU and Umroh Journey examples in `docs/pilots/qa-evidence-20261121.md`, avoid false UAT/deployment claims, and incur no new recurring cost. This only proves scoped source-review behavior, not independently running agents or a production QA service.
