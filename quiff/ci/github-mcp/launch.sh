#!/usr/bin/env bash
set -Eeuo pipefail

KEYCHAIN_PASSWORD="$(/usr/bin/security find-generic-password \
  -a quiff-ai \
  -s quiff-github-mcp \
  -w)"

if [[ -z "$KEYCHAIN_PASSWORD" ]]; then
  printf 'Quiff GitHub MCP credential was not found in the login keychain.\n' >&2
  exit 1
fi

export GH_TOKEN="$KEYCHAIN_PASSWORD"
unset KEYCHAIN_PASSWORD

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec node "$SCRIPT_DIR/server.mjs"
