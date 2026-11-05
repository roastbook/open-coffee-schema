# Runbook

Operational procedures for `Roastbook/open-coffee-schema`. Every command runs from the repository root with Node 26 and pnpm.

## Adding a schema version

1. Agree on the change in a "Propose a schema change" issue. For a major version, announce it in Discussions at least two weeks ahead ([GOVERNANCE.md](GOVERNANCE.md)).
2. Pick the version: new optional fields or values → minor; removing a field or value, a new required field, a narrower type, pattern or range, or closing an object → major; wording only → patch.
3. Copy the newest file and edit the copy. Never edit a published file.
   ```sh
   cp schemas/coffee-places/coffee-places.schema.v1.0.0.json schemas/coffee-places/coffee-places.schema.v1.1.0.json
   ```
   Set `$id` to `https://schema.roastbook.coffee/coffee-places/coffee-places.schema.v1.1.0.json`. If the change touches `common`, add a new `common` version first and point the new family file at it; existing files keep their old references.
4. Give every new field a plain-language `description`.
5. Coffee places only: if fields were added or renamed, add `schemas/coffee-places/coffee-places.context.v1.1.0.jsonld` (copy, then map the new fields to schema.org or to `https://schema.roastbook.coffee/vocab#`).
6. Update examples in `examples/<family>/valid/` (point `$schema` at the new version) and add invalid examples for new rules.
7. Regenerate and check:
   ```sh
   node scripts/generate.ts   # README stats block and docs/fields.md
   scripts/validate.sh        # fails if the bump is too small, a published file changed, or the context misses a field
   scripts/build.sh           # the new version gets /coffee-places/v1.1.0/, latest moves, diff pages appear
   ```
8. Open a pull request (Conventional Commit title, DCO sign-off). After merge, release it (below). The data repository gets a "bump schema" pull request automatically.

## Releasing

Nobody creates tags by hand.

1. GitHub → Actions → **Roastbook · 🫘 Release** → Run workflow. Leave the bump on `auto` (git-cliff derives it from Conventional Commits) or choose `patch`, `minor` or `major`.
2. The shared workflow (`Roastbook/workflows`, `release.yml`) waits for a green `cupping.yml` run on the commit, computes `vX.Y.Z`, tags the commit, writes the release notes with git-cliff (`cliff.toml` is rendered from the shared preset by the workflows repository) and runs `scripts/release-assets.sh "$TAG"`.
3. `scripts/release-assets.sh` builds only assets for the tag it receives:
   - `release/npm/`: the publishable `@roastbook/open-coffee-schema` package, version = tag without `v`;
   - `release/roastbook-open-coffee-schema-X.Y.Z.tgz`, `release/open-coffee-schema-vX.Y.Z.d.ts`, `release/open-coffee-schema-vX.Y.Z-schemas.tar.gz`.
   **Version rule:** the release version is the version of the whole standard. Every family's newest schema file must be at most the tag (a `coffee-places.schema.v2.0.0.json` cannot ship in `v1.4.0`); the script fails otherwise. Families keep their own versions below it.
4. The workflow uploads the files in `release/` to the GitHub Release, publishes `release/npm` to npm (when enabled) and sends `schema-released` to `open-coffee-data`. Pages redeploys from `serve.yml`.

Try the asset build locally without publishing: `scripts/release-assets.sh v1.0.0`, then `cd release/npm && npm pack --dry-run`.

### npm publishing (trusted publishing)

The workflow publishes with npm trusted publishing: GitHub's OIDC token proves the run, so no npm token is stored. It runs `npm publish --provenance --access public` in `release/npm`. The package's `repository` (`https://github.com/Roastbook/open-coffee-schema`, directory `packages/schema`) must match for provenance.

One-time setup (an npm owner does this once):

1. Create the npm organisation `roastbook` on npmjs.com.
2. Publish the first version manually, because a trusted publisher can only be configured on an existing package: run the Release workflow with npm publishing off, download `roastbook-open-coffee-schema-X.Y.Z.tgz` from the GitHub Release and run `npm publish roastbook-open-coffee-schema-X.Y.Z.tgz --access public` while logged in to npm with 2FA. (Alternative: a short-lived granular access token limited to `@roastbook/open-coffee-schema`, used for the first release only, then deleted.)
3. On npmjs.com → package → Settings → Trusted publishing, add GitHub Actions: organisation `Roastbook`, repository `open-coffee-schema`, workflow `release.yml`, no environment.
4. Set the repository variable `NPM_PUBLISH_ENABLED=true` (Settings → Secrets and variables → Actions → Variables). Later releases publish automatically.
5. Optionally, in the package settings, require 2FA and disallow tokens so only the trusted publisher can publish.

## Rolling back a Pages deploy

Schema files are immutable, so a bad deploy is almost always a site bug, not a data change.

1. Find the last good run: Actions → **Roastbook · 🫖 Serve (deploy)** → pick the newest successful run before the bad one, and note its commit.
2. Fastest: open that run and choose **Re-run all jobs**. It rebuilds the site from that commit and deploys it.
3. Then fix forward: revert the bad commit on `main` with a pull request (`git revert <sha>`), so the next push does not redeploy the bug.
4. Check `https://schema.roastbook.coffee/`, one `$id` URL (for example `/coffee-places/coffee-places.schema.v1.0.0.json`) and `/coffee-places/latest/`.

If the custom domain stops working, check Settings → Pages: the custom domain must be `schema.roastbook.coffee` (the build writes `dist/CNAME`) and "Enforce HTTPS" on.

## Updating the social preview

GitHub has no API for the social preview image; upload it by hand after it changes.

1. Regenerate if needed: `scripts/social-preview.sh` writes `docs/assets/social-preview.png` (1280×640) from `docs/assets/social-preview.svg`.
2. GitHub → repository Settings → General → Social preview → Edit → Upload an image → choose `docs/assets/social-preview.png`.
