# Field guide

This guide explains every field in the Roastbook Open Coffee standard in plain language. It is for café owners, contributors, journalists and anyone who wants to read or correct the data without reading JSON Schema.

<!-- Everything below the "How to read the tables" section is generated from the schema descriptions by `node scripts/generate.ts`. Edit docs/fields.intro.md or the schema descriptions, never docs/fields.md. -->

## What a data file looks like

The data lives in plain JSON files, one per city for coffee places (for example `datasets/coffee-places/de/munich.json`) and one per dataset for equipment and brew methods. Every file has three parts:

- `$schema`: the web address of the exact schema version the file follows. Tools use it to check the file.
- `meta`: the dataset version (a date tag such as `2026.11.05.1`), when the file was generated, and its licence.
- a list of records: `places`, `equipment`, `brew_methods` or `sources`. Each record describes one café, one piece of equipment, one brew method or one source.

## Three rules that apply everywhere

1. **Unknown is absent.** If we do not know something, the field is left out. It is never guessed. For yes/no fields, `true` means confirmed yes, `false` means confirmed no, and a missing field means we do not know yet.
2. **Every fact has a source.** Each record lists the `sources` it came from, with the date we read them. `field_provenance` can say, for one field, how the value was found (`method`), how sure we are (`confidence`, from 0 to 1) and which sources back it.
3. **Ids never change.** A record's `id` is permanent and never reused. Duplicates stay in the file with `merged_into` pointing at the record that replaced them.

## How to read the tables

- **Field** is the field's name. Nested fields use dots: `address.postal_code` is the `postal_code` inside `address`. A `*` stands for any key in a named map, for example `field_provenance.*.confidence`. Each name links to its definition in the [Schema Explorer](https://schema.roastbook.coffee/).
- **What it means** comes from the schema's own description, so it always matches the schema.
- **Values** says what kind of value is allowed: text, yes/no, a number, a date, a list, or one of a fixed set of values.
- **Required** says whether a valid record must have the field.

Licence of this guide: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), attribution "Roastbook Open Coffee".
