#!/usr/bin/env bash
# Builds the Schema Explorer into dist/ (the Pages artifact root): the Astro site, every schema file at its
# exact $id path, <family>.schema.latest.json aliases, JSON-LD contexts and CNAME. Usage: scripts/build.sh
source "$(dirname "$0")/lib.sh"
install_deps
rm -rf dist
pnpm --filter @roastbook/open-coffee-schema-site build

for dir in schemas/*/; do
  family="$(basename "$dir")"
  mkdir -p "dist/$family"
  cp -p "$dir"*.json "dist/$family/"
  compgen -G "$dir*.jsonld" >/dev/null && cp -p "$dir"*.jsonld "dist/$family/"
  latest="$(ls "$dir" | grep -E "^$family\.schema\.v[0-9]+\.[0-9]+\.[0-9]+\.json$" | sort -V | tail -n1)"
  cp -p "$dir$latest" "dist/$family/$family.schema.latest.json"
done

test "$(cat dist/CNAME)" = "schema.roastbook.coffee"
test -f dist/favicon.svg

node -e '
  const fs = require("node:fs"), path = require("node:path");
  let bytes = 0, files = 0;
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else { files++; bytes += fs.statSync(p).size; } } };
  walk("dist");
  fs.mkdirSync(".roast", { recursive: true });
  const out = ".roast/report.json";
  const report = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : {};
  fs.writeFileSync(out, JSON.stringify({ ...report, build: { bytes, files }, url: "https://schema.roastbook.coffee/" }, null, 2) + "\n");
  console.log(`dist/: ${files} files, ${(bytes / 1024).toFixed(0)} KiB`);
'
