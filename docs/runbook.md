# Runbook

Operational procedures for `Roastbook/open-coffee-schema`. Every command runs from the repository root with Bun (`.bun-version`).

## Adding a schema version

1. Agree on the change in an issue. For a major version, announce it in Discussions at least two weeks ahead ([GOVERNANCE.md](GOVERNANCE.md)).
2. Pick the version. From 1.0.0: new optional fields or values → minor; removing a field or value, a new required field, a narrower type, pattern or range, or closing an object → major; wording only → patch. While the standard is 0.x (now), everything shifts down one place: breaking → minor (0.1.0 → 0.2.0), addition → patch, wording only → patch. CI enforces both rules.
3. Copy the newest file and edit the copy. Never edit a published file.
   ```sh
   cp schemas/coffee-places/coffee-places.schema.v0.4.0.json schemas/coffee-places/coffee-places.schema.v0.5.0.json
   ```
   Set `$id` to `https://schema.roastbook.coffee/coffee-places/coffee-places.schema.v0.5.0.json`. If the change touches `common`, add a new `common` version first and point the new family files at it; existing files keep their old references. Families reference `common` (and brew methods reference `equipment`) by absolute `$id`, so a new `common` version means a new version of every family.
4. Give every new field a plain-language `description`.
5. Coffee places only: if fields were added, renamed or removed, add `schemas/coffee-places/coffee-places.context.v0.5.0.jsonld` (copy, then map the new fields to schema.org or to `https://schema.roastbook.coffee/vocab#`).
6. Update examples in `examples/<family>/valid/` (point `$schema` at the new version) and add invalid examples for new rules.
7. Regenerate and check:
   ```sh
   bun scripts/generate.ts   # README stats block
   scripts/validate.sh        # fails if the bump is too small, a published file changed, or the context misses a field
   scripts/build.sh           # the new version gets /coffee-places/v0.5.0/, latest moves, diff pages appear
   ```
8. Open a pull request (Conventional Commit title, DCO sign-off). After merge, release it (below). The data repository gets a "bump schema" pull request automatically.

## Releasing

Nobody creates tags by hand.

1. GitHub → Actions → **Release** → Run workflow. Leave the bump on `auto` (git-cliff derives it from Conventional Commits) or choose `patch`, `minor` or `major`.
2. The shared workflow (`Roastbook/workflows`, `release.yml`) waits for a green `ci.yml` run on the commit, computes `vX.Y.Z`, tags the commit, writes the release notes with git-cliff (`cliff.toml` is rendered from the shared preset by the workflows repository) and runs `scripts/release-assets.sh "$TAG"`.
3. `scripts/release-assets.sh` builds only assets for the tag it receives:
   - `release/npm/`: the publishable `@roastbook/open-coffee-schema` package, version = tag without `v`;
   - `release/roastbook-open-coffee-schema-X.Y.Z.tgz`, `release/open-coffee-schema-vX.Y.Z.d.ts`, `release/open-coffee-schema-vX.Y.Z-schemas.tar.gz`.
   **Version rule:** the release version is the version of the whole standard. Every family's newest schema file must be at most the tag (a `coffee-places.schema.v2.0.0.json` cannot ship in `v1.4.0`); the script fails otherwise. Families keep their own versions below it.
4. The workflow uploads the files in `release/` to the GitHub Release, publishes `release/npm` to npmjs.org with npm Trusted Publishing and sends `schema-released` to `open-coffee-data`. Pages redeploys from `deploy.yml`.

Try the asset build locally without publishing: `scripts/release-assets.sh v0.4.0`, then `(cd release/npm && bun pm pack --dry-run)`.


### Publishing to npm

The schema package goes to the public npm registry (`https://registry.npmjs.org`). Its `publishConfig` sets that registry, public access and provenance, and its `repository` field points at `https://github.com/Roastbook/open-coffee-schema`, which provenance requires. The caller `.github/workflows/release.yml` passes `npm_registry: https://registry.npmjs.org` and grants `id-token: write`. The publish job of the shared release workflow then runs `npm publish --provenance --access public` with npm Trusted Publishing: npm accepts the workflow's OIDC identity, so no npm token or repository secret exists. Versions that already exist are skipped, so rerunning a release is safe.

Versions 0.1.0 to 0.3.0 were published only to GitHub Packages (`https://npm.pkg.github.com`) and stay there; 0.4.0 is the first version on npmjs.org.

One-time setup (an npm owner of the `roastbook` organisation):

1. Create the npm organisation `roastbook`, so the `@roastbook` scope belongs to it.
2. Publish the first version by hand, because a Trusted Publisher can only be added to a package that exists: `scripts/release-assets.sh vX.Y.Z` for the version the Release workflow will tag, then `(cd release/npm && npm publish --access public --provenance=false)` while logged in to npm (provenance only works from CI, so the first version has none). The release then skips that version and publishes the next ones itself.
3. On npmjs.com: package `@roastbook/open-coffee-schema` → Settings → Trusted Publisher → GitHub Actions, organisation or user `Roastbook`, repository `open-coffee-schema`, workflow filename `release.yml`, no environment.
4. Optionally, in the same settings, require two-factor authentication and disallow tokens, so only the workflow can publish.

### Installing the package

`bun add @roastbook/open-coffee-schema` or `npm i @roastbook/open-coffee-schema`. No token, `.npmrc` or `bunfig.toml` scope is needed. Projects that still map `@roastbook` to `https://npm.pkg.github.com` must drop that mapping to get 0.4.0 and later.

## Rolling back a Pages deploy

Schema files are immutable, so a bad deploy is almost always a site bug, not a data change.

1. Find the last good run: Actions → **Deploy** → pick the newest successful run before the bad one, and note its commit.
2. Fastest: open that run and choose **Re-run all jobs**. It rebuilds the site from that commit and deploys it.
3. Then fix forward: revert the bad commit on `main` with a pull request (`git revert <sha>`), so the next push does not redeploy the bug.
4. Check `https://schema.roastbook.coffee/`, one `$id` URL (for example `/coffee-places/coffee-places.schema.v0.1.0.json`) and `/coffee-places/latest/`.

If the custom domain stops working, check Settings → Pages: the custom domain must be `schema.roastbook.coffee` (the build writes `dist/CNAME`) and "Enforce HTTPS" on.

## Updating the social preview

GitHub has no API for the social preview image; upload it by hand after it changes.

1. Regenerate if needed: `scripts/social-preview.sh` writes `docs/assets/social-preview.png` (1280×640) from `docs/assets/social-preview.svg`.
2. GitHub → repository Settings → General → Social preview → Edit → Upload an image → choose `docs/assets/social-preview.png`.

## Shared Roastbook UI

The shared implementation lives in [Roastbook/ui](https://github.com/roastbook/ui).
The site imports `@roastbook/ui/astro/Layout.astro` and `@roastbook/ui/sites`.
Its dependency pins a public Git commit, so installing the UI needs no GitHub
Packages token. Update the dependency and `bun.lock` together, then run the
repository validation and build scripts. Layout, logo and theme changes belong
in the UI repository.
