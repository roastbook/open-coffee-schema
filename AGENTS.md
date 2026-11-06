# Agent instructions: open-coffee-schema

This repository is the Open Coffee standard: JSON Schemas (draft 2020-12) under `schemas/`, the JSON-LD context, the Schema Explorer (`site/`, Astro) and the npm package source (`packages/schema/`). Read [docs/GOVERNANCE.md](docs/GOVERNANCE.md) and [docs/decisions/](docs/decisions/) before changing anything structural.

## Hard rules

- **Never edit a published schema file.** Any file under `schemas/` that exists at a `v*` tag is frozen; `scripts/validate.sh` fails on any byte change. Make a new version file instead.
- Never create tags, releases or npm publishes. Releases run from the Release workflow ([docs/runbook.md](docs/runbook.md#releasing)).
- Do not edit the README block between `<!-- stats:start -->` and `<!-- stats:end -->` by hand. Run `bun scripts/generate.ts`.
- Do not change branch protection, org settings or `.github/workflows/` (generated from Roastbook/workflows templates by Orcastrate).
- Do not add data from Google Maps, OpenStreetMap, review sites or closed coffee guides to examples or docs.
- Commits: Conventional Commits, DCO sign-off (`git commit -s`).

## Adding a schema version

Follow [docs/runbook.md#adding-a-schema-version](docs/runbook.md#adding-a-schema-version). In short: copy the newest `schemas/<family>/<family>.schema.vX.Y.Z.json` to the next version, update `$id`, edit the copy, describe every new field, add examples, add a new context version for coffee-places fields, then run the scripts below. From 1.0.0: minor for optional additions, major for anything that removes or tightens. While the standard is 0.x: patch for optional additions, minor for anything that removes or tightens (CI enforces both, `lib/diff.ts` `checkBump`). A new `common` version means new versions of every family that references it.

## Scripts

| Command | What it does |
|---|---|
| `scripts/validate.sh` | All CI checks: meta-schema (Ajv strict), examples, file names and `$id`, breaking-change bump, immutability against tags, JSON-LD context, generated files, self-tests. Writes `.ci/report.json`. |
| `scripts/build.sh` | Builds the Schema Explorer into `dist/` with every schema at its `$id` path, `latest` aliases, contexts, `CNAME`. |
| `bun scripts/generate.ts` | Rewrites the README stats block from the schemas. |
| `scripts/release-assets.sh vX.Y.Z` | Builds `release/` (package in `release/npm`, types, schemas tarball). Run by the release workflow. |

Use Bun (`.bun-version`) for everything: `bun install`, `bun run`, `bunx`. No Node, npm or pnpm.

## Code map

- `lib/schemas.ts`: discovers schema files and resolves `$ref`s. `lib/tree.ts`: turns a schema into the field tree used by the explorer, docs, diff and package; it throws on unknown keywords, so a new keyword must be added there and rendered. `lib/diff.ts`: breaking-change rules (tested in `scripts/self-test.ts`).
- Field anchors are `#field-<dotted.path>` relative to one record (`places[]`, `equipment[]`, `brew_methods[]`); file-level fields use `#file-<path>`. The Data Explorer deep-links to them; do not change the scheme.

## Shared UI

Use `@roastbook/ui` from `Roastbook/ui` for shared layouts, branding and themes.
Update the shared package instead of copying its implementation into this repo.
