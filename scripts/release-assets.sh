#!/usr/bin/env bash
# Builds the release assets for one tag into release/. The release workflow computes the tag, creates it and
# then calls this script; the script never creates tags or picks versions.
#   release/npm/                                     publishable @roastbook/open-coffee-schema (npm publish from here)
#   release/npm-ui/                                  publishable @roastbook/open-coffee-ui (packages/ui at the same version)
#   release/roastbook-open-coffee-schema-X.Y.Z.tgz   the packages as tarballs
#   release/roastbook-open-coffee-ui-X.Y.Z.tgz
#   release/open-coffee-schema-vX.Y.Z.d.ts           TypeScript types for every family
#   release/open-coffee-schema-vX.Y.Z-schemas.tar.gz the schemas/ folder
# Rule: every family's newest schema version must be <= the tag (checked by scripts/build-package.ts).
# Usage: scripts/release-assets.sh vX.Y.Z
source "$(dirname "$0")/lib.sh"

tag="${1:-}"
if ! [[ "$tag" =~ ^v(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$ ]]; then
  echo "usage: scripts/release-assets.sh vX.Y.Z (got '${tag}')" >&2
  exit 2
fi
version="${tag#v}"
install_deps

rm -rf release
mkdir -p release
bun scripts/build-package.ts "$version" release/npm
# The UI package ships its sources as they are, stamped with the release version.
mkdir -p release/npm-ui
cp -R packages/ui/src packages/ui/assets packages/ui/README.md release/npm-ui/
cp LICENSE release/npm-ui/LICENSE
bun -e '
  const [src, out, version] = process.argv.slice(1);
  const pkg = await Bun.file(src).json();
  delete pkg.private;
  await Bun.write(out, JSON.stringify({ ...pkg, version }, null, 2) + "\n");
' packages/ui/package.json release/npm-ui/package.json "$version"
cp release/npm/index.d.ts "release/open-coffee-schema-$tag.d.ts"

# Reproducible tarball: fixed order, owner and mtime.
tar --sort=name --mtime='@0' --owner=0 --group=0 --numeric-owner -cf - schemas LICENSE \
  | gzip -n > "release/open-coffee-schema-$tag-schemas.tar.gz"

for pkg in release/npm release/npm-ui; do
  (cd "$pkg" && bun pm pack --quiet --destination .. >/dev/null)
done
ls -l release
