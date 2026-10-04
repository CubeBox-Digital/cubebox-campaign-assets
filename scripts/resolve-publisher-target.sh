#!/usr/bin/env bash

set -euo pipefail

EVENT_NAME="${EVENT_NAME:?EVENT_NAME is required}"
EVENT_SCHEDULE="${EVENT_SCHEDULE:-}"
INPUT_SLOT="${INPUT_SLOT:-}"
NOW_WIB="${NOW_WIB:-}"
OUTPUT_FILE="${GITHUB_OUTPUT:-}"

if [[ -n "$NOW_WIB" ]]; then
  PUBLISH_DATE="$(TZ=Asia/Jakarta date --date="$NOW_WIB" +%F)"
  DAY_OF_WEEK="$(TZ=Asia/Jakarta date --date="$NOW_WIB" +%u)"
else
  PUBLISH_DATE="$(TZ=Asia/Jakarta date +%F)"
  DAY_OF_WEEK="$(TZ=Asia/Jakarta date +%u)"
fi

case "$EVENT_NAME" in
  workflow_dispatch)
    SLOT="$INPUT_SLOT"
    DRY_RUN=false
    ;;
  push)
    SLOT="11:45"
    DRY_RUN=true
    ;;
  schedule)
    DRY_RUN=false
    case "$EVENT_SCHEDULE" in
      "45 4 * * *") SLOT="11:45" ;;
      "30 5 * * *") SLOT="12:30" ;;
      "30 12 * * *") SLOT="19:30" ;;
      "15 13 * * 0") SLOT="20:15" ;;
      "45 13 * * *") SLOT="20:45" ;;
      *)
        echo "Unknown schedule: $EVENT_SCHEDULE" >&2
        exit 1
        ;;
    esac
    ;;
  *)
    echo "Unsupported event: $EVENT_NAME" >&2
    exit 1
    ;;
esac

case "$SLOT" in
  "11:45")
    ACCOUNT="umrohfriendly"
    ACCOUNT_ID="17841456189730019"
    MEDIA_TYPE="feed"
    ;;
  "12:30")
    ACCOUNT="infoumrohhemat"
    ACCOUNT_ID="17841408096044761"
    MEDIA_TYPE="story"
    ;;
  "19:30")
    ACCOUNT="infoumrohhemat"
    ACCOUNT_ID="17841408096044761"
    MEDIA_TYPE="feed"
    ;;
  "20:15")
    if [[ "$DAY_OF_WEEK" != "7" ]]; then
      echo "20:15 @muslimhalaltrip feed is valid only on Sunday in Asia/Jakarta." >&2
      exit 1
    fi
    ACCOUNT="muslimhalaltrip"
    ACCOUNT_ID="17841456186551011"
    MEDIA_TYPE="feed"
    ;;
  "20:45")
    ACCOUNT="muslimhalaltrip"
    ACCOUNT_ID="17841456186551011"
    case "$DAY_OF_WEEK" in
      1|3|5) MEDIA_TYPE="feed" ;;
      2|4|6|7) MEDIA_TYPE="story" ;;
      *)
        echo "Invalid Asia/Jakarta weekday: $DAY_OF_WEEK" >&2
        exit 1
        ;;
    esac
    ;;
  *)
    echo "Unsupported slot: $SLOT" >&2
    exit 1
    ;;
esac

emit_output() {
  local key="$1"
  local value="$2"
  if [[ -n "$OUTPUT_FILE" ]]; then
    printf '%s=%s\n' "$key" "$value" >> "$OUTPUT_FILE"
  fi
}

emit_output date "$PUBLISH_DATE"
emit_output timezone "Asia/Jakarta"
emit_output account "$ACCOUNT"
emit_output account_id "$ACCOUNT_ID"
emit_output slot_time "$SLOT"
emit_output media_type "$MEDIA_TYPE"
emit_output dry_run "$DRY_RUN"

printf '{"date":"%s","timezone":"Asia/Jakarta","account":"%s","account_id":"%s","slot_time":"%s","media_type":"%s","dry_run":%s}\n' \
  "$PUBLISH_DATE" "$ACCOUNT" "$ACCOUNT_ID" "$SLOT" "$MEDIA_TYPE" "$DRY_RUN"
