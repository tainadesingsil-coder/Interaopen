#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT_DIR/cloud/.env"
PUBLIC_DIR="$ROOT_DIR/public"
PROJECT_NAME=${CF_PAGES_PROJECT_NAME:-belmontapp-dev}
BRANCH_NAME=${CF_PAGES_BRANCH:-preview}

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE. Copy cloud/.env.example to cloud/.env and fill credentials." >&2
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then echo "CLOUDFLARE_API_TOKEN is missing" >&2; exit 1; fi
if [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]; then
  # try to fetch account id
  CLOUDFLARE_ACCOUNT_ID=$(curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "Content-Type: application/json" https://api.cloudflare.com/client/v4/accounts | sed -n 's/.*"id":"\([a-f0-9]\{32\}\)".*/\1/p' | head -n1 || true)
  if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo "CLOUDFLARE_ACCOUNT_ID is missing and could not be auto-detected" >&2
    exit 1
  fi
fi

export CLOUDFLARE_API_TOKEN
export CLOUDFLARE_ACCOUNT_ID

echo "Deploying $PUBLIC_DIR to Cloudflare Pages project=$PROJECT_NAME branch=$BRANCH_NAME..."
npx --yes wrangler@3 pages deploy "$PUBLIC_DIR" --project-name "$PROJECT_NAME" --branch "$BRANCH_NAME"

echo "If successful, your preview URL should be: https://$BRANCH_NAME.$PROJECT_NAME.pages.dev/"

