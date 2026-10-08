#!/usr/bin/env bash
set -euo pipefail

: "${SSH_HOST:?SSH_HOST is required}" "${SSH_USER:?SSH_USER is required}"
: "${DEPLOY_PATH:?DEPLOY_PATH is required}" "${GABTROTTER_IMAGE:?GABTROTTER_IMAGE is required}"
: "${SSH_PRIVATE_KEY:?SSH_PRIVATE_KEY is required}" "${SSH_KNOWN_HOSTS:?SSH_KNOWN_HOSTS is required}"
SSH_PORT=${SSH_PORT:-22}
[[ "$SSH_HOST" =~ ^[A-Za-z0-9][A-Za-z0-9:._-]*$ ]] || exit 1
[[ "$SSH_USER" =~ ^[a-z_][a-z0-9_-]*$ ]] || exit 1
[[ "$SSH_PORT" =~ ^[0-9]+$ && ${#SSH_PORT} -le 5 ]] || exit 1
(( 10#$SSH_PORT >= 1 && 10#$SSH_PORT <= 65535 )) || exit 1
[[ "$DEPLOY_PATH" == /* && "$DEPLOY_PATH" != / && ! "$DEPLOY_PATH" =~ [[:cntrl:]] ]] || exit 1
[[ "$GABTROTTER_IMAGE" =~ ^ghcr\.io/[a-z0-9][a-z0-9._/-]*@sha256:[a-f0-9]{64}$ ]] || exit 1

directory=$(mktemp -d)
trap 'rm -rf "$directory"' EXIT
printf '%s\n' "$SSH_PRIVATE_KEY" > "$directory/key"
printf '%s\n' "$SSH_KNOWN_HOSTS" > "$directory/known_hosts"
chmod 600 "$directory/key" "$directory/known_hosts"
compose=$(base64 < "$(dirname "$0")/../docker-compose.deploy.yml" | tr -d '\n')
quote() { printf "'"; printf '%s' "$1" | sed "s/'/'\\\\''/g"; printf "'"; }
command="bash -s -- $(quote "$DEPLOY_PATH") $(quote "$GABTROTTER_IMAGE") $(quote "$compose")"
ssh -p "$SSH_PORT" -i "$directory/key" -o BatchMode=yes -o IdentitiesOnly=yes \
  -o ConnectTimeout=10 -o StrictHostKeyChecking=yes -o "UserKnownHostsFile=$directory/known_hosts" \
  "$SSH_USER@$SSH_HOST" "$command" <<'REMOTE'
set -euo pipefail
cd "$1"
[[ -f .env ]] || { echo 'The deployment folder must already contain the server .env.' >&2; exit 1; }
exec 9>.deploy.lock
flock -w 180 9 || { echo 'Another deployment still holds the server lock.' >&2; exit 1; }
image=$2
previous=$(cat .deployed-image 2>/dev/null || true)
printf '%s' "$3" | base64 --decode > docker-compose.deploy.yml.tmp
mv docker-compose.deploy.yml.tmp docker-compose.deploy.yml
compose() {
  local digest=$1
  shift
  GABTROTTER_IMAGE="$digest" docker compose --project-name gabtrotter --env-file .env -f docker-compose.deploy.yml "$@"
}
deploy() {
  docker pull "$1" && compose "$1" up --detach --wait --wait-timeout 90 &&
    compose "$1" exec -T app node --input-type=module -e '
      import mongoose from "mongoose";
      try {
        const health = await fetch("http://127.0.0.1:5000/api/health", {signal: AbortSignal.timeout(5000)});
        if (!health.ok) throw new Error();
        await mongoose.connect(process.env.MONGO_URL, {serverSelectionTimeoutMS: 5000});
        await mongoose.connection.db.admin().ping();
        console.log("HTTP health passed and MongoDB is reachable.");
      } catch {
        console.error("HTTP health or database connectivity check failed.");
        process.exitCode = 1;
      } finally {
        await mongoose.disconnect();
      }
    '
}
if deploy "$image"; then
  printf '%s\n' "$image" > .deployed-image.tmp
  mv .deployed-image.tmp .deployed-image
  echo 'Deployment succeeded.'
else
  echo 'Deployment failed.' >&2
  if [[ "$previous" =~ ^ghcr\.io/[a-z0-9][a-z0-9._/-]*@sha256:[a-f0-9]{64}$ ]]; then
    if deploy "$previous"; then echo 'Previous successful image restored.'; else echo 'Rollback failed.' >&2; fi
  else
    echo 'No previous successful digest is available for rollback.' >&2
  fi
  exit 1
fi
REMOTE
