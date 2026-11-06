# Contributing to Open Coffee Schema

Thank you for helping improve the standard. This repository holds the schemas, the JSON-LD context and the Schema Explorer. To add or correct a café, a piece of equipment or a brew method, go to [Roastbook/open-coffee-data](https://github.com/Roastbook/open-coffee-data) instead.

## Proposing a change

1. Open an [issue](https://github.com/Roastbook/open-coffee-schema/issues/new) proposing the change. Describe the real-world fact you want to record, an example value and a source that would provide it. Maintainers agree on the shape and the version bump before anyone writes code.
2. Major versions (anything that breaks existing data) are announced in Discussions at least two weeks before release; see [GOVERNANCE.md](docs/GOVERNANCE.md).
3. Open a pull request. Follow [docs/runbook.md#adding-a-schema-version](docs/runbook.md#adding-a-schema-version).

## Rules for schema changes

- Never edit a published schema file. Copy the newest file to a new version (`coffee-places.schema.v1.1.0.json`), change its `$id`, and edit the copy. CI compares every file with every `v*` tag.
- Additive optional fields: minor bump. Removing or tightening anything: major bump. Wording only: patch bump. CI computes the needed bump and fails when yours is too small. While the standard is a pre-release (0.x), everything shifts down one place: a breaking change needs a minor bump (0.1 → 0.2) and an addition a patch bump; 1.0.0 marks the first stable release.
- Every new field needs a plain-language `description`; the Schema Explorer shows it on every version page.
- Add or update examples in `examples/<family>/valid/` and `examples/<family>/invalid/`.
- Coffee places: map every new field in a new version of the JSON-LD context (`coffee-places.context.vX.Y.Z.jsonld`). CI fails if a field is not mapped.
- Run `bun scripts/generate.ts` to refresh the README numbers, then `scripts/validate.sh` and `scripts/build.sh`.

## Maintainer notes

- Releases run only from the Release workflow (Actions → Release). Never create tags, releases or package versions by hand.
- `.github/workflows/` is generated from the templates in [Roastbook/workflows](https://github.com/Roastbook/workflows) by Orcastrate. Change the template there, not the file here.
- The Schema Explorer's renderer (`lib/tree.ts`) fails on JSON Schema keywords it does not know. A schema that uses a new keyword needs renderer support first.
- Field anchors (`#field-<dotted.path>` for record fields, `#file-<path>` for file-level fields) are linked from the Data Explorer. Keep that scheme stable.

## Local setup

Bun (the version in `.bun-version`):

```sh
bun install
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

All contributions are licensed MIT, like the rest of the repository. Do not contribute data or text copied from closed sources (Google Maps, review sites, closed coffee guides) or from OpenStreetMap.
