# Roastbook Open Coffee: design and governance

Roastbook Open Coffee is an open standard (`open-coffee-schema`) and an open dataset (`open-coffee-data`) about coffee: places that serve it, brew methods and, later, equipment, roasters and beans. Roastbook, the self-hosted coffee journal, consumes both.

## Goals

1. Facts about coffee that anyone may reuse, redistribute and build on.
2. Every stored value is correct. When a fact cannot be confirmed, the field stays absent (unknown); nothing is guessed or scored.
3. Coverage that reaches and passes what closed guides show, researched by us, starting in Munich, then Germany, Austria and Switzerland.

Non-goals: reviews, ratings, rankings, translations (everything is English) and photos we have no licence for.

## Repositories

| Repository | Holds |
|---|---|
| `open-coffee-schema` | JSON Schemas, JSON-LD context, Schema Explorer, the `@roastbook/open-coffee-ui` and `@roastbook/open-coffee-schema` packages |
| `open-coffee-data` | Datasets, Data Explorer, Sourcing agent |
| `workflows` | Reusable workflows, composite actions, Orcastrate templates |

Everything is MIT-licensed: schemas, code, sites, docs and data. Images are never stored in the repositories: records link to openly licensed originals and state their licence, author and source. MIT grants no trademark rights to the Roastbook name. Tooling is Bun everywhere.

## Data model principles

- One file per city for places: `datasets/coffee-places/<country>/<city>.json` with `$schema`, `meta` and the records. Catalogue families (brew methods, equipment) are one file each.
- Place ids are opaque (`cp-` plus 10 random base32 characters); catalogue ids are readable slugs (`v60`). Ids are permanent and never reused. Duplicates stay as tombstones with `merged_into`; CI fails if an id disappears.
- `false` means confirmed not, absent means unknown.
- Ratings from other services are stored only as references. Google data is never stored except `google_place_id`. OpenStreetMap data is not used.
- Descriptions are written only from our stored facts, in our own words.
- Personal data: no natural persons. Operators are recorded only when they are legal entities.

## Collecting facts

Facts come only from open datasets with permissive licences (Overture Maps, Foursquare Open Source Places, Wikidata), roasters' partner pages, the place's own website and Instagram bio, openly licensed image repositories, and submissions from owners and contributors. Never Google Maps, OpenStreetMap, closed guides or review sites. Websites are read politely, with at most one request per second per host. CI rejects any URL on the deny-list of forbidden domains. A reviewer can trace each change through the pull request, which links the pages the facts were read from.

## Versioning

- Schemas: semantic versions, starting as pre-release `0.x`. A published file (`*.schema.vX.Y.Z.json`) is never edited. In `0.x`, breaking changes need a minor bump and additions a patch bump; from `1.0.0`, breaking changes need a major bump and additions a minor bump. CI enforces both.
- Data: date tags `YYYY.MM.DD.N`. Each data release pins one schema version in `schema-version.txt`.
- Releases run from the shared Release workflow: git-cliff picks the version from Conventional Commits, the workflow tags, publishes the GitHub Release and the npm packages to GitHub Packages, and asks `open-coffee-data` to bump its pinned schema.

## Change process

Every change reaches `main` through a reviewed pull request, including the Sourcing agent's. The agent may only touch `datasets/coffee-places/**`; CI fails its pull requests anywhere else. Its pull request labels point reviewers at closures, tier changes, new domains and conflicts. All contributions require DCO sign-off (`git commit -s`). Owners claim a place by opening an issue from an address on the place's website domain, or by linking the issue from the place's website or Instagram bio.

## Decisions log

Architecture decisions live in `docs/decisions/`. Ask the maintainers before publishing a schema major version, adding a paid service, spending more than $50, changing org settings, or contacting any café, roaster or data provider.
