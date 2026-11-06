# @roastbook/open-coffee-schema

TypeScript types, JSON Schemas, the JSON-LD context and the allowed values of the [Open Coffee](https://schema.roastbook.coffee/) standard: coffee places, equipment and brew methods. By [Roastbook](https://roastbook.coffee/).

The package version is the release of the standard (`1.2.0` = tag `v1.2.0` of [Roastbook/open-coffee-schema](https://github.com/Roastbook/open-coffee-schema)). Each family keeps its own schema version inside it; see `SCHEMA_IDS`. No runtime dependencies.

## Install

The package is on the public npm registry. No token or registry setting is needed:

```sh
bun add @roastbook/open-coffee-schema     # or: npm i @roastbook/open-coffee-schema
```

Releases are published from GitHub Actions with npm Trusted Publishing and carry provenance, which links each version to the release workflow run in [Roastbook/open-coffee-schema](https://github.com/Roastbook/open-coffee-schema). Versions 0.1.0 to 0.3.0 were published only to GitHub Packages (`npm.pkg.github.com`); from 0.4.0 the package is on npmjs.org.

## Types

```ts
import type { CoffeePlacesDataset, CoffeePlace, BrewMethodsDataset, BrewMethod, EquipmentItem, SpecialtyTier } from "@roastbook/open-coffee-schema";

const res = await fetch("https://data.roastbook.coffee/datasets/coffee-places/de/munich.json");
const munich = (await res.json()) as CoffeePlacesDataset;
const filterBars: CoffeePlace[] = munich.places.filter((p) => p.serving?.filter);
```

The types come from the newest version of each family. Rules that TypeScript cannot express (patterns, ranges, "closed_on only when status is closed") are checked by validation, below.

## Validation with Ajv

```ts
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { schemas } from "@roastbook/open-coffee-schema/schemas";
import { SCHEMA_IDS, isIri } from "@roastbook/open-coffee-schema";

const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
ajv.addFormat("iri", isIri); // URL fields use the "iri" format, which ajv-formats lacks
for (const schema of Object.values(schemas)) ajv.addSchema(schema);

const validate = ajv.getSchema(SCHEMA_IDS["brew-methods"].latest)!;
if (!validate(data)) console.error(validate.errors);
```

Validate against the `$id` a file names in its `$schema` to keep old files valid after new versions come out: `ajv.getSchema(data.$schema)`.

Single schema files are exported too: `@roastbook/open-coffee-schema/coffee-places/v0.4.0.json` (every published version stays included, for example `…/coffee-places/v0.1.0.json`), `…/coffee-places/latest.json`, and the JSON-LD context `…/coffee-places/context.v0.4.0.json` (`context.latest.json`; `.json` so Node and bundlers can import it).

## Allowed values

Every fixed list of values is exported as a read-only array, so apps do not re-declare them:

```ts
import { SPECIALTY_TIER_VALUES, EQUIPMENT_TYPE_VALUES, BREW_PARAMETER_VALUES, COFFEE_PLACE_STATUS_VALUES } from "@roastbook/open-coffee-schema";

for (const type of EQUIPMENT_TYPE_VALUES) console.log(type); // "espresso_machine", "grinder", …
```

Names follow the type (`SpecialtyTier` → `SPECIALTY_TIER_VALUES`) or the family and field path (`status` of a coffee place → `COFFEE_PLACE_STATUS_VALUES`).

Coffee journals can take the values of recorded brew parameters from here too: `BREW_PARAMETER_VALUES` (the parameter keys), `PAPER_FILTER_POSITION_VALUES` and `DISTRIBUTION_METHOD_VALUES`. A journal that keeps one ratio plus a basis maps a ratio based on brew water to `brew_ratio` and a ratio based on the yield to `yield_ratio`.

## Licence

MIT. Field documentation: <https://schema.roastbook.coffee/>.
