# Contributing to Open Coffee Schema

Thank you for helping improve the standard. This repository holds the schemas, the JSON-LD context, the field guide and the Schema Explorer. To add or correct a café, a piece of equipment or a brew method, go to [Roastbook/open-coffee-data](https://github.com/Roastbook/open-coffee-data) instead.

## Proposing a change

1. Open a ["Propose a schema change"](https://github.com/Roastbook/open-coffee-schema/issues/new?template=schema-change.yml) issue. Describe the real-world fact you want to record, an example value and a source that would provide it. Maintainers agree on the shape and the version bump before anyone writes code.
2. Major versions (anything that breaks existing data) are announced in Discussions at least two weeks before release; see [GOVERNANCE.md](docs/GOVERNANCE.md).
3. Open a pull request. Follow [docs/runbook.md#adding-a-schema-version](docs/runbook.md#adding-a-schema-version).

## Rules for schema changes

- Never edit a published schema file. Copy the newest file to a new version (`coffee-places.schema.v1.1.0.json`), change its `$id`, and edit the copy. CI compares every file with every `v*` tag.
- Additive optional fields: minor bump. Removing or tightening anything: major bump. Wording only: patch bump. CI computes the needed bump and fails when yours is too small.
- Every new field needs a plain-language `description`; the [field guide](docs/fields.md) is generated from it.
- Add or update examples in `examples/<family>/valid/` and `examples/<family>/invalid/`.
- Coffee places: map every new field in a new version of the JSON-LD context (`coffee-places.context.vX.Y.Z.jsonld`). CI fails if a field is not mapped.
- Run `node scripts/generate.ts` to refresh the README numbers and the field guide, then `scripts/validate.sh` and `scripts/build.sh`.

## Local setup

Node 26 and pnpm (via corepack):

```sh
corepack enable    # or: COREPACK_HOME=$HOME/.cache/corepack corepack pnpm …
pnpm install
scripts/validate.sh   # the same checks CI runs
scripts/build.sh      # builds the Schema Explorer into dist/
```

## Developer Certificate of Origin

Every commit must be signed off. By signing off you certify the [Developer Certificate of Origin 1.1](https://developercertificate.org/): that you wrote the change or otherwise have the right to submit it under the repository's licences. Add the sign-off with `git commit -s`, which appends:

```
Signed-off-by: Your Name <you@example.com>
```

Pull requests without a sign-off on every commit cannot be merged. To fix the last commit: `git commit --amend -s`; for several commits: `git rebase --signoff main`.

## Licences of contributions

Contributions to `schemas/`, `lib/`, `scripts/`, `site/` and `packages/` are licensed Apache-2.0, to `docs/` CC BY 4.0, and to `examples/` CC0 1.0. Do not contribute data or text copied from closed sources (Google Maps, review sites, closed coffee guides) or from OpenStreetMap.

## Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md).
