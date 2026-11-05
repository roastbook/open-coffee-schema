# 0003: Equipment and brew methods families

Status: accepted (2026-11-05)

After coffee places, the next families are **brew methods** (with data now) and **equipment** (schema now, data later: brewers first, then grinders and espresso machines). Bean vocabularies (roast level, process, brew range) come with the beans family.

## Where they come from

- **Roastbook journal** (`roastbook/src/lib/domain-contracts.ts`, `src/db/schema.ts`): gear types and per-type detail tables (espresso machine, grinder, brewer, kettle, scale, tamper, WDT, basket) with their enums, and per-method recorded parameters (`enabledParameters`). The open schemas keep the same enum values (snake_case) so Roastbook can import them without mapping.
- **michidk/coffee-open-data** (MIT, the maintainer's earlier draft): brew-method and equipment taxonomies, merged in. Its `flavor-wheel.json` is not carried over: the SCA/WCR flavour wheel is CC BY-NC-ND 4.0.

## Prior art we align with (not copy)

| Project | Licence | Used for |
|---|---|---|
| Wikidata | CC0 | `xref.wikidata` on methods and equipment; years and origins imported with provenance. No items exist for V60, Kalita Wave, Clever, Origami or phin. |
| Beanconqueror | GPL-3.0 | `xref.beanconqueror` preparation keys; brew-record parameter names checked for overlap. No code or data copied. |
| Visualizer / Decent shot files | MIT / GPL-3.0 | Parameter naming for espresso logs; shot time series are out of scope for v1. |
| BrewMark Open Brew Profile 0.1 | MIT | Step actions and `grind_d50_microns` idea; candidate for a future recipes family. |
| Yoshimuro/coffee-grinder-extension | MIT | Grinder adjustment model (`grind_setting_step`, `microns_per_step`). |
| schema.org Product / HowTo | CC BY-SA 3.0 | JSON-LD mapping later (brand, model, gtin, mpn; HowTo tools and steps). |
| Google Product Taxonomy, GS1 GPC | free to reference | Optional `xref.google_product_category`, `xref.gs1_gpc_brick`. |
| SCA flavour wheel, WCR lexicon, SCA forms | NC-ND / no open licence | Not used. Numeric facts (for example extraction yield ranges) are fine; texts and structures are not. |

## Design

- Ids are readable slugs (`v60`, `hario-v60-02`) instead of opaque ids: these are catalogue entries whose names are stable and meaningful, unlike businesses. They are still never reused or deleted.
- Brew methods form a tree via `parent` (v60 → pour-over). `category` groups for display; `extraction` is the physical principle and matches `equipment.brewer.mechanism`.
- `typical_parameters` are starting ranges, not rules, with provenance. `recorded_parameters` says what a journal should ask for.
- Equipment records describe models as sold, not owned items. Type-specific details sit in one sub-object per type (`grinder`, `brewer`, …); the schema forbids sub-objects that don't match `type`. Units are in property names.
