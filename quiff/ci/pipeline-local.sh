#!/usr/bin/env bash
set -Eeuo pipefail

QUIFF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT_DIR="$(cd "$QUIFF_DIR/.." && pwd)"
cd "$QUIFF_DIR"

IMAGE_NAME="signup-app:quiff-check"
CONTAINER_NAME="signup-quiff-check-$$"
PORT=3000
PROGRESS_PORT=4173
PROGRESS_URL="http://127.0.0.1:${PROGRESS_PORT}"
CONTAINER_STARTED=0
PROGRESS_PID=""

progress() {
  local status="$1" step="$2" title="$3" message="$4"
  curl --silent --show-error --max-time 2 -X POST "${PROGRESS_URL}/update" \
    -H 'Content-Type: application/json' \
    --data "{\"status\":\"${status}\",\"step\":${step},\"title\":\"${title}\",\"message\":\"${message}\"}" >/dev/null || true
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
  progress running 1 'Check prerequisites' 'Confirm Docker, Kane CLI, and the local port are ready.'
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
  trap - EXIT

  if (( status != 0 )); then
    progress failed "${CURRENT_STEP:-1}" 'Pipeline failed' 'The pipeline stopped. Check the terminal output for details.'
  else
    progress running 6 'Clean up' 'Remove the temporary app container.'
  fi

  if [[ "$CONTAINER_STARTED" == "1" ]]; then
    if (( status != 0 )); then
      printf '\n[cleanup] App container logs (pipeline failed):\n'
      docker logs "$CONTAINER_NAME" || true
    fi
    printf '\n[cleanup] Stop and remove app container\n'
    print_command docker rm --force "$CONTAINER_NAME"
    docker rm --force "$CONTAINER_NAME" >/dev/null || true
  fi

  if (( status == 0 )); then
    printf '\nLocal pipeline completed successfully.\n'
    progress success 6 'Pipeline completed' 'All checks passed and the temporary container was removed.'
  else
    printf '\nLocal pipeline failed with exit code %s.\n' "$status" >&2
  fi
  if [[ -n "$PROGRESS_PID" ]]; then
    kill "$PROGRESS_PID" >/dev/null 2>&1 || true
    wait "$PROGRESS_PID" 2>/dev/null || true
  fi
  exit "$status"
}
trap cleanup EXIT

start_progress_dashboard

printf 'Quiff local Docker + Kane check\n'
printf 'Repository: %s\n' "$ROOT_DIR"
printf 'Image: %s\nContainer: %s\nApp URL: http://localhost:%s\n' "$IMAGE_NAME" "$CONTAINER_NAME" "$PORT"

printf '\n[1] Check prerequisites and port\n'
CURRENT_STEP=1
for command_name in docker curl npm kane-cli; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    printf 'Missing required command: %s\n' "$command_name" >&2
    exit 1
  fi
done
print_command docker info
docker info >/dev/null
print_command env KANE_CLI_USER_AGENT=codex kane-cli --version
KANE_CLI_USER_AGENT=codex kane-cli --version
if command -v lsof >/dev/null 2>&1 && lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  printf 'Port %s is already in use. Stop the existing listener and retry.\n' "$PORT" >&2
  exit 1
fi
printf 'Prerequisites are ready and port %s is free.\n' "$PORT"

CURRENT_STEP=2
progress running 2 'Build app image' 'Create the Docker image for the signup app.'
run_step 2 'Build the login/signup app Docker image' docker build --file "$QUIFF_DIR/ci/Dockerfile" --tag "$IMAGE_NAME" "$ROOT_DIR"
CURRENT_STEP=3
progress running 3 'Start app container' 'Launch the app for the browser checks.'
run_step 3 'Start the app container' docker run --detach --name "$CONTAINER_NAME" --publish "$PORT:3000" "$IMAGE_NAME"
CONTAINER_STARTED=1

printf '\n[4] Wait for the app health check\n'
CURRENT_STEP=4
progress running 4 'Wait for app health' 'Checking that the app responds at localhost:3000.'
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

CURRENT_STEP=5
progress running 5 'Run saved Kane tests' 'Run the end-to-end checks against the app.'
run_step 5 'Run Quiff saved Kane tests headlessly' npm run test:kane
