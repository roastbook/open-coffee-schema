# Shared shell helpers for scripts/*.sh. Sourced, not executed.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

install_deps() {
  if ! command -v bun >/dev/null 2>&1; then
    echo "error: Bun $(cat .bun-version) is required (https://bun.sh)." >&2
    exit 1
  fi
  bun install --frozen-lockfile >/dev/null
}
