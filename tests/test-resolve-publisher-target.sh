#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RESOLVER="$ROOT/scripts/resolve-publisher-target.sh"

assert_target() {
  local now_wib="$1"
  local slot="$2"
  local expected_account="$3"
  local expected_media_type="$4"
  local result

  result="$(EVENT_NAME=workflow_dispatch INPUT_SLOT="$slot" NOW_WIB="$now_wib" "$RESOLVER")"
  [[ "$result" == *"\"account\":\"$expected_account\""* ]]
  [[ "$result" == *"\"slot_time\":\"$slot\""* ]]
  [[ "$result" == *"\"media_type\":\"$expected_media_type\""* ]]
  [[ "$result" == *'"timezone":"Asia/Jakarta"'* ]]
  [[ "$result" == *'"dry_run":false'* ]]
}

for date in 2026-10-05 2026-10-06 2026-10-07 2026-10-08 2026-10-09 2026-10-10 2026-10-11; do
  assert_target "$date 20:45:00" "11:45" "umrohfriendly" "feed"
  assert_target "$date 20:45:00" "12:30" "infoumrohhemat" "story"
  assert_target "$date 20:45:00" "19:30" "infoumrohhemat" "feed"
done

assert_target "2026-10-05 20:45:00" "20:45" "muslimhalaltrip" "feed"
assert_target "2026-10-06 20:45:00" "20:45" "muslimhalaltrip" "story"
assert_target "2026-10-07 20:45:00" "20:45" "muslimhalaltrip" "feed"
assert_target "2026-10-08 20:45:00" "20:45" "muslimhalaltrip" "story"
assert_target "2026-10-09 20:45:00" "20:45" "muslimhalaltrip" "feed"
assert_target "2026-10-10 20:45:00" "20:45" "muslimhalaltrip" "story"
assert_target "2026-10-11 20:15:00" "20:15" "muslimhalaltrip" "feed"
assert_target "2026-10-11 20:45:00" "20:45" "muslimhalaltrip" "story"

if EVENT_NAME=workflow_dispatch INPUT_SLOT="20:15" NOW_WIB="2026-10-10 20:15:00" "$RESOLVER" >/dev/null 2>&1; then
  echo "Expected non-Sunday 20:15 resolution to fail." >&2
  exit 1
fi

schedule_result="$(EVENT_NAME=schedule EVENT_SCHEDULE="15 13 * * 0" NOW_WIB="2026-10-11 20:15:00" "$RESOLVER")"
[[ "$schedule_result" == *'"media_type":"feed"'* ]]

push_result="$(EVENT_NAME=push NOW_WIB="2026-10-11 11:45:00" "$RESOLVER")"
[[ "$push_result" == *'"dry_run":true'* ]]

echo "Publisher target resolver tests passed."
