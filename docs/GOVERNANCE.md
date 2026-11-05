# Roastbook Open Coffee: design and governance

Roastbook Open Coffee is an open standard (`open-coffee-schema`) and an open dataset (`open-coffee-data`) for places that serve coffee. It starts with coffee places; roasters, beans and gear follow as separate datasets that reuse the same conventions. Roastbook, the self-hosted coffee journal, will consume both.

## Goals

1. Facts about coffee places that anyone may reuse, redistribute and build on (CC BY 4.0).
2. Every fact traceable to an allow-listed source, with a retrieval date and, where useful, a confidence.
3. Coverage that reaches and passes what closed guides show, researched by us, starting in Munich, then Germany, Austria and Switzerland.

Non-goals: reviews, ratings, rankings and photos we have no licence for.

## Repositories

| Repository | Holds | Licence |
|---|---|---|
| `open-coffee-schema` | JSON Schemas, JSON-LD context, field docs, Schema Explorer, shared UI package | Schemas, code, site: Apache-2.0. Docs: CC BY 4.0 |
| `open-coffee-data` | Datasets, source allow-list, images, Data Explorer, data agent | Data, docs: CC BY 4.0. Code, site: Apache-2.0. Images: per file |
| `workflows` | Reusable workflows, composite actions, Orcastrate templates | Apache-2.0 |

Brand assets (logo, wordmark) are all rights reserved. Attribution for the data: "Roastbook Open Coffee".

## Data model principles

- One file per city: `datasets/<family>/<country>/<city>.json` with `$schema`, `meta` and the records.
- Ids are opaque (`cp-` plus 10 random base32 characters), permanent and never reused. Duplicates are kept as tombstones with `merged_into`; CI fails if an id disappears.
- `sources[]` on every record; `field_provenance` overrides method, confidence and sources per field. Unknown is absent, never guessed: `false` means confirmed not offered.
- Ratings from other services are stored only as references. Google data is never stored except `google_place_id`. OpenStreetMap data is not used, because its share-alike licence would bind the dataset.
- Descriptions are generated only from our stored facts.
- Personal data: no natural persons. Operators are recorded only when they are legal entities.

## Sources

`open-coffee-data/datasets/sources.json` is the allow-list. CI rejects any record citing a source not on it and any URL on the deny-list (closed guides, Google Maps, OpenStreetMap). Adding a source is a pull request reviewed by a maintainer, who checks the licence and terms and records `checked_at`. Crawling respects robots.txt, identifies itself (`RoastbookOpenCoffeeBot/1.0 (+https://data.roastbook.coffee/bot)`) and stays at or below one request per second per host.

## Versioning

- Schemas: semantic versions. A published file (`*.schema.vX.Y.Z.json`) is never edited. Additive optional fields are a minor bump; removing or tightening anything is a major bump. CI enforces both. While the standard is a pre-release (0.x), everything shifts down one place: a breaking change needs a minor bump (0.1 → 0.2) and an addition a patch bump; 1.0.0 marks the first stable release.
- Data: date tags `YYYY.MM.DD.N`. Each data release pins one schema version in `schema-version.txt`.
- A schema release publishes a GitHub Release with changelog and TypeScript types and dispatches a "bump schema" PR to the data repository.

## Change process

| Change | Who | Review |
|---|---|---|
| Records in `datasets/coffee-places/**`, `assets/**` | Contributors, owners, the Sourcing agent | Auto-merge when every changed field has confidence ≥ 0.85 and no rule below applies |
| `status: closed`, tier changes, low confidence, new source domains | Anyone | One maintainer |
| Schemas, `sources.json`, scripts, `.github/` | Maintainers | One maintainer via `CODEOWNERS`; the agent cannot touch them |
| New schema major version | Maintainers | Announced in Discussions at least two weeks before release |

All contributions require DCO sign-off (`git commit -s`). Owners claim a place by opening an issue from an address on the place's website domain, or by linking the issue from the place's website or Instagram bio.

## The Sourcing agent

A scheduled workflow in `open-coffee-data` that discovers, enriches and re-verifies places. It acts through a GitHub App bot, writes only through pull requests, may touch only `datasets/coffee-places/**` and `assets/**`, and stops at a hard monthly budget. Crawled text is untrusted input: it is fenced and quoted in prompts, the model returns strict JSON validated against the schema, and any value without a cited source URL is dropped.

## Decisions log

Architecture decisions live in `docs/decisions/`. Ask the maintainers before publishing a schema major version, adding a paid service, spending more than $50, changing org settings or branch protection, or contacting any café, roaster or data provider.
