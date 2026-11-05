# Shared shell helpers for scripts/*.sh. Sourced, not executed.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# CI puts pnpm on PATH (pnpm/action-setup); locally corepack provides it. A read-only
# COREPACK_HOME (as in some dev images) falls back to a user cache.
[ -z "${COREPACK_HOME:-}" ] || [ -w "$COREPACK_HOME" ] || export COREPACK_HOME="$HOME/.cache/corepack"
pnpm() {
  if command -v pnpm >/dev/null 2>&1; then command pnpm "$@"; else corepack pnpm "$@"; fi
}

require_node() {
  local major; major="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
  if [ "$major" -lt "$(cat .node-version)" ]; then
    echo "error: Node $(cat .node-version) or newer is required (found $(node --version 2>/dev/null || echo none))." >&2
    exit 1
  fi
}

install_deps() {
  require_node
  pnpm install --frozen-lockfile --prefer-offline >/dev/null
}
