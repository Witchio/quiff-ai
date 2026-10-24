#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
QUIFF_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${ENV_FILE:-$QUIFF_DIR/.env.local}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # This is the local, user-managed env file for the Quiff tools.
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

if [[ -z "${SLACK_WEBHOOK_URL:-}" ]]; then
  printf 'SLACK_WEBHOOK_URL is missing. Set it in %s or export it in your shell.\n' "$ENV_FILE" >&2
  exit 1
fi

case "$SLACK_WEBHOOK_URL" in
  https://hooks.slack.com/services/*) ;;
  *)
    printf 'SLACK_WEBHOOK_URL does not look like a Slack incoming webhook URL.\n' >&2
    exit 1
    ;;
esac

printf 'Sending a test message to the configured Slack channel...\n'
response="$(curl \
  --fail \
  --silent \
  --show-error \
  --connect-timeout 5 \
  --max-time 20 \
  --request POST \
  --header 'Content-Type: application/json' \
  --data-binary '{"text":"Hello world from Quiff 👋"}' \
  "$SLACK_WEBHOOK_URL")"

if [[ "$response" != "ok" ]]; then
  printf 'Slack returned an unexpected response; the test message may not have been delivered.\n' >&2
  exit 1
fi

printf 'Slack accepted the test message. Check the channel selected for this webhook.\n'
