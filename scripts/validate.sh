#!/usr/bin/env bash
# Every check CI runs, in the same way: schemas, examples, breaking changes, immutability,
# JSON-LD context, generated docs. Writes .ci/report.json. Usage: scripts/validate.sh
source "$(dirname "$0")/lib.sh"
install_deps
bun scripts/validate.ts

if command -v actionlint >/dev/null 2>&1; then
  actionlint && echo "✓ actionlint"
else
  echo "! actionlint not installed: workflow lint skipped locally (CI runs it)"
fi
