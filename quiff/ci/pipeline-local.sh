#!/usr/bin/env bash
set -Eeuo pipefail

QUIFF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT_DIR="$(cd "$QUIFF_DIR/.." && pwd)"
cd "$QUIFF_DIR"

APP_PID=""
APP_LOG=""
PORT=3000
PROGRESS_PORT=4173
PROGRESS_URL="http://127.0.0.1:${PROGRESS_PORT}"
PROGRESS_PID=""
PIPELINE_STARTED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)-$$"
KANE_LOG=""
CURRENT_STEP=1
KANE_FAILED=0
ANALYSIS_COMPLETED=0
ANALYSIS_FAILED=0
CODEX_CHECK_STARTED=0
TESTED_SHA=""
BRANCH_NAME=""
REPOSITORY_NAME=""
REPOSITORY_URL=""
WORKTREE_CLEAN=true

progress() {
  local status="$1" step="$2" title="$3" message="$4" extra="${5:-}"
  local suffix=""
  if [[ -n "$extra" ]]; then suffix=",${extra}"; fi
  curl --silent --show-error --max-time 2 -X POST "${PROGRESS_URL}/update" \
    -H 'Content-Type: application/json' \
    --data "{\"status\":\"${status}\",\"step\":${step},\"title\":\"${title}\",\"message\":\"${message}\"${suffix}}" >/dev/null || true
}

start_progress_dashboard() {
  QUIFF_PROGRESS_PORT="$PROGRESS_PORT" node "$QUIFF_DIR/ci/progress-server.mjs" >/dev/null 2>&1 &
  PROGRESS_PID=$!
  for attempt in {1..30}; do
    if curl --silent --fail "${PROGRESS_URL}/" >/dev/null; then break; fi
    sleep 0.2
  done
  if command -v open >/dev/null 2>&1; then
    open "$PROGRESS_URL" >/dev/null 2>&1 || true
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$PROGRESS_URL" >/dev/null 2>&1 || true
  fi
  progress running 1 'Starting app' 'Checking Node.js, Kane CLI, and the local port.'
}

print_command() {
  printf '    +'
  printf ' %q' "$@"
  printf '\n'
}

run_step() {
  local number="$1"
  local title="$2"
  shift 2
  printf '\n[%s] %s\n' "$number" "$title"
  print_command "$@"
  "$@"
}

cleanup() {
  local status=$?
  local completed_steps='[]'
  local failed_steps='[]'
  local skipped_steps='[]'
  local progress_title='Pipeline failed'
  local progress_message='The pipeline stopped. Check the terminal output for details.'
  local progress_extra=''
  trap - EXIT

  if [[ -n "$APP_PID" ]]; then
    if (( status != 0 )) && [[ -n "$APP_LOG" && -f "$APP_LOG" ]]; then
      printf '\n[cleanup] Development server output (pipeline failed):\n'
      tail -n 80 "$APP_LOG" || true
    fi
    printf '\n[cleanup] Stop local development server\n'
    kill "$APP_PID" >/dev/null 2>&1 || true
    wait "$APP_PID" 2>/dev/null || true
  fi

  if (( status == 0 )); then
    printf '\nLocal pipeline completed successfully.\n'
    completed_steps='[1,2]'
    progress success 2 'Pipeline completed' 'All Kane checks passed; no investigation was needed.' "\"completedSteps\":${completed_steps},\"failedSteps\":${failed_steps}"
  else
    printf '\nLocal pipeline failed with exit code %s.\n' "$status" >&2
    if (( KANE_FAILED == 1 )); then
      failed_steps='[2]'
      if (( ANALYSIS_COMPLETED == 1 )); then
        completed_steps='[1,3,4]'
        progress_title='Kane tests failed · investigation complete'
        progress_message='Quiff finished investigating the failure. See the findings and Slack notification status below.'
      elif (( ANALYSIS_FAILED == 1 )); then
        if (( CODEX_CHECK_STARTED == 1 )); then
          failed_steps='[2,4]'
          completed_steps='[1,3]'
        else
          failed_steps='[2,3]'
          completed_steps='[1]'
        fi
        progress_title='Kane tests failed · investigation incomplete'
        progress_message='Quiff could not complete the investigation. See the run artifacts and Slack notification status below.'
      else
        completed_steps='[1]'
      fi
    else
      failed_steps="[${CURRENT_STEP}]"
      if (( CURRENT_STEP > 1 )); then completed_steps='[1]'; fi
    fi
    progress_extra="\"completedSteps\":${completed_steps},\"failedSteps\":${failed_steps},\"skippedSteps\":${skipped_steps}"
    local final_step=1
    if (( KANE_FAILED == 1 )); then
      final_step=3
      if (( ANALYSIS_COMPLETED == 1 || CODEX_CHECK_STARTED == 1 )); then final_step=4; fi
    fi
    progress failed "$final_step" "$progress_title" "$progress_message" "$progress_extra"
  fi
  if [[ -n "$KANE_LOG" && -f "$KANE_LOG" ]]; then rm -f -- "$KANE_LOG"; fi
  if [[ -n "$APP_LOG" && -f "$APP_LOG" ]]; then rm -f -- "$APP_LOG"; fi
  if [[ -n "$PROGRESS_PID" ]]; then
    kill "$PROGRESS_PID" >/dev/null 2>&1 || true
    wait "$PROGRESS_PID" 2>/dev/null || true
  fi
  exit "$status"
}
trap cleanup EXIT

KANE_LOG="$(mktemp "${TMPDIR:-/tmp}/quiff-kane.XXXXXX")"

start_progress_dashboard

printf 'Quiff local npm + Kane check\n'
printf 'Repository: %s\nApp URL: http://localhost:%s\n' "$ROOT_DIR" "$PORT"

printf '\n[1] Check prerequisites and port\n'
CURRENT_STEP=1
for command_name in curl npm kane-cli git node codex gh; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    printf 'Missing required command: %s\n' "$command_name" >&2
    exit 1
  fi
done
print_command env KANE_CLI_USER_AGENT=codex kane-cli --version
KANE_CLI_USER_AGENT=codex kane-cli --version
if command -v lsof >/dev/null 2>&1 && lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  printf 'Port %s is already in use. Stop the existing listener and retry.\n' "$PORT" >&2
  exit 1
fi
printf 'Prerequisites are ready and port %s is free.\n' "$PORT"

TESTED_SHA="$(git -C "$ROOT_DIR" rev-parse HEAD)"
BRANCH_NAME="$(git -C "$ROOT_DIR" branch --show-current)"
if [[ -z "$BRANCH_NAME" ]]; then BRANCH_NAME='detached'; fi
REMOTE_URL="$(git -C "$ROOT_DIR" remote get-url origin 2>/dev/null || true)"
if [[ "$REMOTE_URL" == *github.com* ]]; then
  REMOTE_PATH="${REMOTE_URL##*github.com[:/]}"
  REMOTE_PATH="${REMOTE_PATH%.git}"
  if [[ "$REMOTE_PATH" == */* ]]; then
    REPOSITORY_NAME="$REMOTE_PATH"
    REPOSITORY_URL="https://github.com/${REMOTE_PATH}"
  else
    REPOSITORY_NAME="$(basename "$ROOT_DIR")"
  fi
else
  REPOSITORY_NAME="$(basename "$ROOT_DIR")"
fi
if [[ -n "$(git -C "$ROOT_DIR" status --porcelain --untracked-files=all)" ]]; then WORKTREE_CLEAN=false; fi

CURRENT_STEP=1
progress running 1 'Starting app' 'Starting the Next.js development server with npm run dev.'
APP_LOG="$(mktemp "${TMPDIR:-/tmp}/quiff-app.XXXXXX")"
printf '\n[1] Start app with npm run dev\n'
printf '    + (cd %q && npm run dev -- --hostname 127.0.0.1 --port %q)\n' "$ROOT_DIR" "$PORT"
cd "$ROOT_DIR"
npm run dev -- --hostname 127.0.0.1 --port "$PORT" >"$APP_LOG" 2>&1 &
APP_PID=$!
cd "$QUIFF_DIR"
printf '\n[1] Wait for the app health check\n'
CURRENT_STEP=1
progress running 1 'Starting app' 'Waiting for the signup app to respond at localhost:3000.'
printf '    + curl --fail --silent --show-error http://127.0.0.1:%s/\n' "$PORT"
ready=0
for attempt in {1..30}; do
  if curl --fail --silent --show-error "http://127.0.0.1:${PORT}/" >/dev/null; then
    ready=1
    break
  fi
  printf '    App is starting (%s/30); retrying in 2 seconds...\n' "$attempt"
  sleep 2
done
if [[ "$ready" != "1" ]]; then
  printf 'App did not become ready within 60 seconds.\n' >&2
  exit 1
fi
printf 'App is responding at http://localhost:%s.\n' "$PORT"

CURRENT_STEP=2
progress running 2 'Run Kane tests' 'Run the saved signup tests in parallel.' '"completedSteps":[1]'
printf '\n[2] Run Quiff saved Kane tests headlessly\n'
print_command env KANE_CLI_USER_AGENT=codex kane-cli testrun run --agent --headless --parallel 2
set +e
env KANE_CLI_USER_AGENT=codex kane-cli testrun run --agent --headless --parallel 2 < /dev/null 2>&1 | tee "$KANE_LOG" | node "$QUIFF_DIR/ci/stream-kane-progress.mjs" "$PROGRESS_URL"
KANE_STATUS=${PIPESTATUS[0]}
set -e

if (( KANE_STATUS != 0 )); then
  if (( KANE_STATUS != 1 )); then
    printf 'Kane CLI exited with code %s before reporting a test failure; skipping Codex attribution.\n' "$KANE_STATUS" >&2
    exit "$KANE_STATUS"
  fi
  KANE_FAILED=1
  RUN_DIR="$QUIFF_DIR/.testmuai/attribution-runs/$RUN_ID"
  CURRENT_STEP=3
  progress running 3 'Launch Quiff-Ai' 'Kane tests failed. Quiff is preparing to launch its investigator to check the cause and likely responsibility.' '"completedSteps":[1],"failedSteps":[2]'
  if ! node "$QUIFF_DIR/ci/prepare-failure-input.mjs" \
    "$RUN_ID" "$RUN_DIR" "$KANE_LOG" "$KANE_STATUS" \
    "$BRANCH_NAME" "$TESTED_SHA" "$PIPELINE_STARTED_AT" \
    "$REPOSITORY_NAME" "$REPOSITORY_URL" "$WORKTREE_CLEAN"; then
    ANALYSIS_FAILED=1
    printf 'Could not prepare the Codex failure input.\n' >&2
  else
    progress running 3 'Launch Quiff-Ai' 'Failure report is ready. Launching Codex to inspect the evidence.' '"completedSteps":[1],"failedSteps":[2]'
    if node "$QUIFF_DIR/ci/run-attribution.mjs" "$RUN_ID" "$RUN_DIR" "$PROGRESS_URL"; then
      ANALYSIS_COMPLETED=1
    else
      ANALYSIS_FAILED=1
      printf 'Codex attribution failed; see the pipeline log and run artifacts.\n' >&2
    fi
    if [[ -f "$RUN_DIR/codex-investigation-started" ]]; then CODEX_CHECK_STARTED=1; fi
  fi
  if ! node "$QUIFF_DIR/ci/notify-slack.mjs" "$RUN_ID" "$RUN_DIR" "$PROGRESS_URL"; then
    printf 'Slack notification could not be delivered.\n' >&2
  fi
  exit "$KANE_STATUS"
fi

if [[ "$WORKTREE_CLEAN" == true ]]; then
  if ! node "$QUIFF_DIR/ci/record-passing-commit.mjs" "$BRANCH_NAME" "$TESTED_SHA"; then
    printf 'Warning: could not save the last passing QA commit.\n' >&2
  fi
else
  printf 'Checkout had local changes; not updating the last-passing commit baseline.\n'
fi
