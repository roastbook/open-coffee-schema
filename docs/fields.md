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

## Open Coffee places dataset

Family `coffee-places`, version 1.0.0. One file per city listing cafés, coffee bars and other places that serve coffee, with provenance for every fact. Part of Roastbook Open Coffee.

Schema: <https://schema.roastbook.coffee/coffee-places/coffee-places.schema.v1.0.0.json> · Explorer: <https://schema.roastbook.coffee/coffee-places/v1.0.0/>

### Coffee place record

| Field | What it means | Values | Required |
|---|---|---|---|
| [`id`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-id) | Permanent, opaque identifier. Never reused, never derived from a name, never deleted. | text; at least 3 characters; at most 64 characters; format `^[a-z0-9_.-]+$` | yes |
| [`name`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-name) | — | text; at least 1 character; at most 200 characters | yes |
| [`status`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-status) | open; temporarily_closed (renovation, holiday longer than a month); closed (permanently); unverified (found but not yet confirmed to exist). | one of: `open`, `temporarily_closed`, `closed`, `unverified` | yes |
| [`merged_into`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-merged_into) | Set when this record turned out to be a duplicate. The record stays as a tombstone so its id is never reused or lost. | text; at least 3 characters; at most 64 characters; format `^[a-z0-9_.-]+$` | no |
| [`opened_on`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-opened_on) | Calendar date, YYYY-MM-DD. | a date like 2026-11-05 | no |
| [`closed_on`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-closed_on) | Calendar date, YYYY-MM-DD. Only allowed when status is "closed". | a date like 2026-11-05 | no |
| [`last_verified_at`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-last_verified_at) | When a primary source last confirmed that the place exists with this status. | a timestamp with time zone like 2026-11-05T14:00:00Z | no |
| [`checked_at`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-checked_at) | When the record as a whole was last reviewed or enriched. | a timestamp with time zone like 2026-11-05T14:00:00Z | yes |
| [`address`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-address) | Postal address | object | yes |
| [`address.street_address`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-address.street_address) | Street and house number. | text; at least 1 character | no |
| [`address.postal_code`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-address.postal_code) | — | text; at least 1 character | no |
| [`address.locality`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-address.locality) | City or town. | text; at least 1 character | no |
| [`address.region`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-address.region) | State or region. | text; at least 1 character | no |
| [`address.country_code`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-address.country_code) | ISO 3166-1 alpha-2 code in upper case. | text; format `^[A-Z]{2}$` | yes |
| [`location`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-location) | WGS 84 coordinates of the entrance or building. | object | yes |
| [`location.lat`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-location.lat) | — | number; at least -90; at most 90 | yes |
| [`location.lon`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-location.lon) | — | number; at least -180; at most 180 | yes |
| [`opening_hours`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-opening_hours) | Opening hours in OpenStreetMap opening_hours syntax (used as a format only; no OSM data), for example "Mo-Fr 08:00-18:00; Sa,Su 09:00-17:00". | text; at least 2 characters; at most 255 characters | no |
| [`open_sunday`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-open_sunday) | Regularly open on Sundays. | yes/no | no |
| [`description`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-description) | Short English description written only from the facts stored in this record. Never copied from the place's own texts. | text; at least 20 characters; at most 600 characters | no |
| [`specialty_tier`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-specialty_tier) | A: coffee is the core product; the place roasts its own beans or serves named specialty roasters and usually offers filter coffee. B: food or something else leads, but the place serves a specialty roaster. none: not a specialty place (kept in the dataset). unknown: not yet assessed. | one of: `A`, `B`, `none`, `unknown` | yes |
| [`specialty_evidence`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-specialty_evidence) | A short claim in our own words and the page that supports it. | list of object; at most 5 entries | no |
| [`specialty_evidence.claim`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-specialty_evidence.claim) | — | text; at least 3 characters; at most 280 characters | yes |
| [`specialty_evidence.url`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-specialty_evidence.url) | Absolute http or https URL. | a full web address; format `^https?://` | yes |
| [`roasts_own_beans`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-roasts_own_beans) | — | yes/no | no |
| [`roasters_served`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-roasters_served) | Roaster served | list of object | no |
| [`roasters_served.name`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-roasters_served.name) | — | text; at least 1 character | yes |
| [`roasters_served.roaster_id`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-roasters_served.roaster_id) | Reserved for the future Open Coffee roasters dataset. | text; at least 3 characters; at most 64 characters; format `^[a-z0-9_.-]+$` | no |
| [`roasters_served.url`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-roasters_served.url) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`roasters_served.own`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-roasters_served.own) | The place roasts this coffee itself. | yes/no | no |
| [`serving`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-serving) | Coffee preparation offered. true: offered; false: confirmed not offered; absent: unknown. | object | no |
| [`serving.espresso`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-serving.espresso) | Espresso and espresso-based drinks. | yes/no | no |
| [`serving.filter`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-serving.filter) | Any filter coffee. | yes/no | no |
| [`serving.pour_over`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-serving.pour_over) | Hand-brewed filter (V60, Kalita, Chemex and similar). | yes/no | no |
| [`serving.batch_brew`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-serving.batch_brew) | Filter coffee from a batch brewer. | yes/no | no |
| [`serving.cold_brew`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-serving.cold_brew) | — | yes/no | no |
| [`serving.decaf`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-serving.decaf) | — | yes/no | no |
| [`serving.plant_milk`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-serving.plant_milk) | At least one plant-based milk. | yes/no | no |
| [`amenities`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-amenities) | true: available; false: confirmed not available; absent: unknown. | object | no |
| [`amenities.wifi`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-amenities.wifi) | — | yes/no | no |
| [`amenities.laptop_friendly`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-amenities.laptop_friendly) | Laptops are welcome (no laptop ban, seats with sockets or tables). | yes/no | no |
| [`amenities.kids_friendly`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-amenities.kids_friendly) | — | yes/no | no |
| [`amenities.vegan_options`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-amenities.vegan_options) | Vegan food beyond plant milk. | yes/no | no |
| [`amenities.dogs_allowed`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-amenities.dogs_allowed) | — | yes/no | no |
| [`amenities.outdoor_seating`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-amenities.outdoor_seating) | — | yes/no | no |
| [`amenities.card_payment`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-amenities.card_payment) | — | yes/no | no |
| [`amenities.cash_only`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-amenities.cash_only) | — | yes/no | no |
| [`amenities.wheelchair_accessible`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-amenities.wheelchair_accessible) | Step-free entrance. | yes/no | no |
| [`food`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-food) | Food | object | no |
| [`food.focus`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-food.focus) | coffee_led: coffee is the main product; food_led: food or a restaurant concept leads; balanced: both matter equally. | one of: `coffee_led`, `food_led`, `balanced` | no |
| [`food.breakfast`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-food.breakfast) | — | yes/no | no |
| [`food.lunch`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-food.lunch) | — | yes/no | no |
| [`food.cakes_baked_in_house`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-food.cakes_baked_in_house) | — | yes/no | no |
| [`sells_beans`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-sells_beans) | — | yes/no | no |
| [`sells_equipment`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-sells_equipment) | — | yes/no | no |
| [`offers_courses`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-offers_courses) | Barista courses, brewing classes or public cuppings. | yes/no | no |
| [`reusable_cup_systems`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-reusable_cup_systems) | Deposit or reusable cup schemes accepted, for example recup, vytal, own_cup. | list of text; no duplicates; format `^[a-z0-9_-]+$` | no |
| [`good_for`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-good_for) | Good for | list, each one of: `working`, `meetings`, `quick_espresso`, `takeaway`, `brunch`, `groups`, `reading`, `date`, `coffee_nerds`, `families`; no duplicates | no |
| [`awards`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-awards) | Award | list of object | no |
| [`awards.name`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-awards.name) | — | text; at least 1 character | yes |
| [`awards.year`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-awards.year) | — | whole number; at least 1900; at most 2100 | no |
| [`awards.url`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-awards.url) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`prices`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-prices) | — | object | no |
| [`prices.cappuccino`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-prices.cappuccino) | Observed price | object | no |
| [`prices.cappuccino.amount`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-prices.cappuccino.amount) | — | number; more than 0 | yes |
| [`prices.cappuccino.currency`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-prices.cappuccino.currency) | ISO 4217 currency code. | text; format `^[A-Z]{3}$` | yes |
| [`prices.cappuccino.observed_on`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-prices.cappuccino.observed_on) | Calendar date, YYYY-MM-DD. | a date like 2026-11-05 | yes |
| [`prices.cappuccino.source_url`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-prices.cappuccino.source_url) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`operator`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-operator) | The legal entity running the place, taken from its Impressum or legal notice. Only companies and other legal entities; never the name of a natural person (sole traders are omitted). | object | no |
| [`operator.name`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-operator.name) | — | text; at least 1 character | yes |
| [`operator.legal_form`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-operator.legal_form) | For example GmbH, UG (haftungsbeschränkt), KG, e.K. | text | no |
| [`operator.register_id`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-operator.register_id) | Commercial register number, for example HRB 123456 (Amtsgericht München). | text | no |
| [`links`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-links) | Links | object | no |
| [`links.website`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-links.website) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`links.instagram`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-links.instagram) | — | text; format `^https://(www\.)?instagram\.com/[A-Za-z0-9_.]+/?$` | no |
| [`links.facebook`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-links.facebook) | — | text; format `^https://(www\.\|m\.)?facebook\.com/.+` | no |
| [`image`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-image) | An openly licensed image. Each image carries its own licence, author and source. | object | no |
| [`image.url`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-image.url) | Where the file is served from (our assets folder or the original host). | a full web address; format `^https?://` | yes |
| [`image.licence`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-image.licence) | SPDX identifier, for example CC-BY-4.0, CC-BY-SA-4.0 or CC0-1.0. | text; at least 2 characters | yes |
| [`image.author`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-image.author) | — | text; at least 1 character | yes |
| [`image.source_url`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-image.source_url) | Page describing the original file and its licence. | a full web address; format `^https?://` | yes |
| [`image.title`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-image.title) | — | text | no |
| [`image.width`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-image.width) | — | whole number; at least 1 | no |
| [`image.height`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-image.height) | — | whole number; at least 1 | no |
| [`xref`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-xref) | Crosswalk to other datasets. google_place_id is the only Google data we may store. | object | no |
| [`xref.overture`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-xref.overture) | Overture Maps place GERS id. | text; at least 1 character | no |
| [`xref.foursquare`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-xref.foursquare) | Foursquare Open Source Places fsq_place_id. | text; at least 1 character | no |
| [`xref.wikidata`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-xref.wikidata) | — | text; format `^Q[1-9][0-9]*$` | no |
| [`xref.google_place_id`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-xref.google_place_id) | — | text; at least 1 character | no |
| [`external_ratings`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-external_ratings) | References to rating pages elsewhere. Rating values are never stored. | list of object | no |
| [`external_ratings.source`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-external_ratings.source) | — | text; format `^[a-z0-9_.-]+$` | yes |
| [`external_ratings.id`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-external_ratings.id) | — | text; at least 1 character | yes |
| [`external_ratings.url`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-external_ratings.url) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`method`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-method) | How a value was obtained. import: copied from an allow-listed open dataset; crawl: read directly from a page; llm_extraction: extracted from crawled text by a language model; manual: entered by a reviewer; owner_submitted: supplied by the business owner. | one of: `import`, `crawl`, `llm_extraction`, `manual`, `owner_submitted` | no |
| [`confidence`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-confidence) | Probability (0-1) that the value is correct. Values of 0.85 or more may be merged without human review. | number; at least 0; at most 1 | no |
| [`sources`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-sources) | Where a fact came from. source_id must exist in the dataset's sources allow-list. | list of object; at least 1 entry | yes |
| [`sources.source_id`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-sources.source_id) | Permanent, opaque identifier. Never reused, never derived from a name, never deleted. | text; at least 3 characters; at most 64 characters; format `^[a-z0-9_.-]+$` | yes |
| [`sources.url`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-sources.url) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`sources.retrieved_at`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-sources.retrieved_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | yes |
| [`field_provenance`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-field_provenance) | Keys are dotted field paths inside the record (for example opening_hours or serving.filter). | map of named entries; keys match `^[a-z_]+(\.[a-z_]+)*$` | no |
| [`field_provenance.*`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-field_provenance.*) | Overrides the record's default method and confidence for one field and names the sources for that value. | object; not empty | no |
| [`field_provenance.*.method`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-field_provenance.*.method) | How a value was obtained. import: copied from an allow-listed open dataset; crawl: read directly from a page; llm_extraction: extracted from crawled text by a language model; manual: entered by a reviewer; owner_submitted: supplied by the business owner. | one of: `import`, `crawl`, `llm_extraction`, `manual`, `owner_submitted` | no |
| [`field_provenance.*.confidence`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-field_provenance.*.confidence) | Probability (0-1) that the value is correct. Values of 0.85 or more may be merged without human review. | number; at least 0; at most 1 | no |
| [`field_provenance.*.sources`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-field_provenance.*.sources) | Where a fact came from. source_id must exist in the dataset's sources allow-list. | list of object; at least 1 entry | no |
| [`field_provenance.*.sources.source_id`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-field_provenance.*.sources.source_id) | Permanent, opaque identifier. Never reused, never derived from a name, never deleted. | text; at least 3 characters; at most 64 characters; format `^[a-z0-9_.-]+$` | yes |
| [`field_provenance.*.sources.url`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-field_provenance.*.sources.url) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`field_provenance.*.sources.retrieved_at`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-field_provenance.*.sources.retrieved_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | yes |
| [`field_provenance.*.checked_at`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#field-field_provenance.*.checked_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | no |

### File structure

| Field | What it means | Values | Required |
|---|---|---|---|
| [`$schema`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#file-$schema) | Canonical URL of the schema version this file follows. | text; format `^https://schema\.roastbook\.coffee/coffee-places/coffee-places\.schema\.v[0-9]+\.[0-9]+\.[0-9]+\.json$` | yes |
| [`meta`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#file-meta) | File metadata | object | yes |
| [`meta.version`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#file-meta.version) | Date tag YYYY.MM.DD.N; N counts releases on the same day, starting at 1. | text; format `^[0-9]{4}\.[0-9]{2}\.[0-9]{2}\.[1-9][0-9]*$` | yes |
| [`meta.generated_at`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#file-meta.generated_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | yes |
| [`meta.licence`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#file-meta.licence) | — | exactly "CC-BY-4.0" | no |
| [`meta.attribution`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#file-meta.attribution) | — | text | no |
| [`meta.country_code`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#file-meta.country_code) | ISO 3166-1 alpha-2 code in upper case. | text; format `^[A-Z]{2}$` | yes |
| [`meta.city`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#file-meta.city) | City slug, matching the file name. | text; format `^[a-z0-9-]+$` | yes |
| [`meta.city_name`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#file-meta.city_name) | City name in the local language. | text | no |
| [`meta.schema_version`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#file-meta.schema_version) | Semantic version | text; format `^(0\|[1-9][0-9]*)\.(0\|[1-9][0-9]*)\.(0\|[1-9][0-9]*)$` | no |
| [`places`](https://schema.roastbook.coffee/coffee-places/v1.0.0/#file-places) | Coffee place Each entry is one Coffee place record (see above). | list of object | yes |

## Open Coffee brew methods

Family `brew-methods`, version 1.0.0. Ways of brewing coffee (espresso, pour-over, V60, AeroPress, cold brew…), their typical parameters and what a coffee journal should record for each. Methods form a tree: a device-specific method such as v60 has the general method pour-over as parent. Part of Roastbook Open Coffee.

Schema: <https://schema.roastbook.coffee/brew-methods/brew-methods.schema.v1.0.0.json> · Explorer: <https://schema.roastbook.coffee/brew-methods/v1.0.0/>

### Brew method record

| Field | What it means | Values | Required |
|---|---|---|---|
| [`id`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-id) | Stable readable slug, e.g. v60, french-press. Never reused. | text; at least 3 characters; at most 64 characters; format `^[a-z0-9_.-]+$` | yes |
| [`name`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-name) | — | text; at least 1 character | yes |
| [`aliases`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-aliases) | Other names in any language, e.g. Filterkaffee, drip. | list of text; at least 1 character; no duplicates | no |
| [`parent`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-parent) | The more general method, e.g. pour-over for v60. | text; at least 3 characters; at most 64 characters; format `^[a-z0-9_.-]+$` | no |
| [`category`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-category) | Family used for grouping: espresso (9-bar style pressure), filter (percolation through a filter), immersion (steep, then separate), pressure (non-espresso pressure such as AeroPress or moka pot), vacuum (siphon), boiling (cezve/ibrik), cold (cold water over hours). | one of: `espresso`, `filter`, `immersion`, `pressure`, `vacuum`, `boiling`, `cold` | yes |
| [`extraction`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-extraction) | Physical principle; matches equipment brewer.mechanism. | one of: `percolation`, `immersion`, `hybrid` | yes |
| [`description`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-description) | Short neutral explanation in our own words. | text; at least 20 characters; at most 600 characters | yes |
| [`introduced_year`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-introduced_year) | — | whole number; at least 1000; at most 2100 | no |
| [`origin_country_code`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-origin_country_code) | ISO 3166-1 alpha-2 code in upper case. | text; format `^[A-Z]{2}$` | no |
| [`equipment_types`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-equipment_types) | Equipment types needed, from the equipment schema's type list. | list, each one of: `espresso_machine`, `espresso_machine_with_grinder`, `grinder`, `brewer`, `kettle`, `scale`, `tamper`, `wdt`, `basket`, `filter`, `roaster`, `milk_frother`, `accessory`; no duplicates | no |
| [`typical_parameters`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-typical_parameters) | Common starting ranges, not rules. Each value cites its source in field_provenance. | object | no |
| [`typical_parameters.dose_g`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-typical_parameters.dose_g) | Range | object; not empty | no |
| [`typical_parameters.dose_g.min`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-typical_parameters.dose_g.min) | — | number; at least 0 | no |
| [`typical_parameters.dose_g.max`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-typical_parameters.dose_g.max) | — | number; at least 0 | no |
| [`typical_parameters.dose_g.typical`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-typical_parameters.dose_g.typical) | — | number; at least 0 | no |
| [`typical_parameters.ratio`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-typical_parameters.ratio) | Range | object; not empty | no |
| [`typical_parameters.ratio.min`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-typical_parameters.ratio.min) | — | number; at least 0 | no |
| [`typical_parameters.ratio.max`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-typical_parameters.ratio.max) | — | number; at least 0 | no |
| [`typical_parameters.ratio.typical`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-typical_parameters.ratio.typical) | — | number; at least 0 | no |
| [`typical_parameters.water_temperature_celsius`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-typical_parameters.water_temperature_celsius) | Range | object; not empty | no |
| [`typical_parameters.water_temperature_celsius.min`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-typical_parameters.water_temperature_celsius.min) | — | number; at least 0 | no |
| [`typical_parameters.water_temperature_celsius.max`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-typical_parameters.water_temperature_celsius.max) | — | number; at least 0 | no |
| [`typical_parameters.water_temperature_celsius.typical`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-typical_parameters.water_temperature_celsius.typical) | — | number; at least 0 | no |
| [`typical_parameters.brew_time_seconds`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-typical_parameters.brew_time_seconds) | Range | object; not empty | no |
| [`typical_parameters.brew_time_seconds.min`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-typical_parameters.brew_time_seconds.min) | — | number; at least 0 | no |
| [`typical_parameters.brew_time_seconds.max`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-typical_parameters.brew_time_seconds.max) | — | number; at least 0 | no |
| [`typical_parameters.brew_time_seconds.typical`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-typical_parameters.brew_time_seconds.typical) | — | number; at least 0 | no |
| [`typical_parameters.brew_pressure_bar`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-typical_parameters.brew_pressure_bar) | Range | object; not empty | no |
| [`typical_parameters.brew_pressure_bar.min`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-typical_parameters.brew_pressure_bar.min) | — | number; at least 0 | no |
| [`typical_parameters.brew_pressure_bar.max`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-typical_parameters.brew_pressure_bar.max) | — | number; at least 0 | no |
| [`typical_parameters.brew_pressure_bar.typical`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-typical_parameters.brew_pressure_bar.typical) | — | number; at least 0 | no |
| [`typical_parameters.grind_size`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-typical_parameters.grind_size) | Descriptive grind size; extra_fine is Turkish, fine espresso, medium filter, coarse French press and cold brew. | list, each one of: `extra_fine`, `fine`, `medium_fine`, `medium`, `medium_coarse`, `coarse`, `extra_coarse`; at least 1 entry; no duplicates | no |
| [`typical_parameters.grind_d50_microns`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-typical_parameters.grind_d50_microns) | Median particle size in micrometres, comparable across grinders. | object; not empty | no |
| [`typical_parameters.grind_d50_microns.min`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-typical_parameters.grind_d50_microns.min) | — | number; at least 0 | no |
| [`typical_parameters.grind_d50_microns.max`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-typical_parameters.grind_d50_microns.max) | — | number; at least 0 | no |
| [`typical_parameters.grind_d50_microns.typical`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-typical_parameters.grind_d50_microns.typical) | — | number; at least 0 | no |
| [`recorded_parameters`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-recorded_parameters) | Parameters a coffee journal should offer when logging a brew with this method. | list, each one of: `dose_g`, `brew_water_g`, `yield_g`, `ratio`, `grind_setting`, `brew_time_seconds`, `target_time_seconds`, `water_temperature_celsius`, `bloom_time_seconds`, `bloom_water_g`, `preinfusion_time_seconds`, `preinfusion_pressure_bar`, `brew_pressure_bar`, `flow_rate_ml_per_second`, `tamp_force_kg`, `paper_filter_position`, `distribution_method`, `pour_count`, `steep_time_seconds`; no duplicates | no |
| [`typical_drinks`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-typical_drinks) | — | list of text; at least 1 character; no duplicates | no |
| [`xref`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-xref) | — | object | no |
| [`xref.wikidata`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-xref.wikidata) | — | text; format `^Q[1-9][0-9]*$` | no |
| [`xref.beanconqueror`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-xref.beanconqueror) | Beanconqueror PREPARATION_TYPES key, for app imports. | text; format `^[A-Z0-9_]+$` | no |
| [`image`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-image) | An openly licensed image. Each image carries its own licence, author and source. | object | no |
| [`image.url`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-image.url) | Where the file is served from (our assets folder or the original host). | a full web address; format `^https?://` | yes |
| [`image.licence`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-image.licence) | SPDX identifier, for example CC-BY-4.0, CC-BY-SA-4.0 or CC0-1.0. | text; at least 2 characters | yes |
| [`image.author`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-image.author) | — | text; at least 1 character | yes |
| [`image.source_url`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-image.source_url) | Page describing the original file and its licence. | a full web address; format `^https?://` | yes |
| [`image.title`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-image.title) | — | text | no |
| [`image.width`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-image.width) | — | whole number; at least 1 | no |
| [`image.height`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-image.height) | — | whole number; at least 1 | no |
| [`method`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-method) | How a value was obtained. import: copied from an allow-listed open dataset; crawl: read directly from a page; llm_extraction: extracted from crawled text by a language model; manual: entered by a reviewer; owner_submitted: supplied by the business owner. | one of: `import`, `crawl`, `llm_extraction`, `manual`, `owner_submitted` | no |
| [`confidence`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-confidence) | Probability (0-1) that the value is correct. Values of 0.85 or more may be merged without human review. | number; at least 0; at most 1 | no |
| [`sources`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-sources) | Where a fact came from. source_id must exist in the dataset's sources allow-list. | list of object; at least 1 entry | yes |
| [`sources.source_id`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-sources.source_id) | Permanent, opaque identifier. Never reused, never derived from a name, never deleted. | text; at least 3 characters; at most 64 characters; format `^[a-z0-9_.-]+$` | yes |
| [`sources.url`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-sources.url) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`sources.retrieved_at`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-sources.retrieved_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | yes |
| [`checked_at`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-checked_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | yes |
| [`field_provenance`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-field_provenance) | Keys are dotted field paths inside the record (for example opening_hours or serving.filter). | map of named entries; keys match `^[a-z_]+(\.[a-z_]+)*$` | no |
| [`field_provenance.*`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-field_provenance.*) | Overrides the record's default method and confidence for one field and names the sources for that value. | object; not empty | no |
| [`field_provenance.*.method`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-field_provenance.*.method) | How a value was obtained. import: copied from an allow-listed open dataset; crawl: read directly from a page; llm_extraction: extracted from crawled text by a language model; manual: entered by a reviewer; owner_submitted: supplied by the business owner. | one of: `import`, `crawl`, `llm_extraction`, `manual`, `owner_submitted` | no |
| [`field_provenance.*.confidence`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-field_provenance.*.confidence) | Probability (0-1) that the value is correct. Values of 0.85 or more may be merged without human review. | number; at least 0; at most 1 | no |
| [`field_provenance.*.sources`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-field_provenance.*.sources) | Where a fact came from. source_id must exist in the dataset's sources allow-list. | list of object; at least 1 entry | no |
| [`field_provenance.*.sources.source_id`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-field_provenance.*.sources.source_id) | Permanent, opaque identifier. Never reused, never derived from a name, never deleted. | text; at least 3 characters; at most 64 characters; format `^[a-z0-9_.-]+$` | yes |
| [`field_provenance.*.sources.url`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-field_provenance.*.sources.url) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`field_provenance.*.sources.retrieved_at`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-field_provenance.*.sources.retrieved_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | yes |
| [`field_provenance.*.checked_at`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-field_provenance.*.checked_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | no |
| [`filter_types`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#field-filter_types) | — | list, each one of: `paper`, `metal`, `cloth`, `none`; no duplicates | no |

### File structure

| Field | What it means | Values | Required |
|---|---|---|---|
| [`$schema`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#file-$schema) | — | text; format `^https://schema\.roastbook\.coffee/brew-methods/brew-methods\.schema\.v[0-9]+\.[0-9]+\.[0-9]+\.json$` | yes |
| [`meta`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#file-meta) | Dataset metadata | object | yes |
| [`meta.version`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#file-meta.version) | Date tag YYYY.MM.DD.N; N counts releases on the same day, starting at 1. | text; format `^[0-9]{4}\.[0-9]{2}\.[0-9]{2}\.[1-9][0-9]*$` | yes |
| [`meta.generated_at`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#file-meta.generated_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | yes |
| [`meta.licence`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#file-meta.licence) | — | exactly "CC-BY-4.0" | no |
| [`meta.attribution`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#file-meta.attribution) | — | text | no |
| [`brew_methods`](https://schema.roastbook.coffee/brew-methods/v1.0.0/#file-brew_methods) | Brew method Each entry is one Brew method record (see above). | list of object | yes |

## Open Coffee equipment catalog

Family `equipment`, version 1.0.0. Coffee equipment models (machines, grinders, brewers, kettles, scales and accessories) as sold, not individual owned items. Measurements put the unit in the property name. Part of Roastbook Open Coffee; derived from the Roastbook journal gear model.

Schema: <https://schema.roastbook.coffee/equipment/equipment.schema.v1.0.0.json> · Explorer: <https://schema.roastbook.coffee/equipment/v1.0.0/>

### Equipment model record

| Field | What it means | Values | Required |
|---|---|---|---|
| [`id`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-id) | Stable readable slug of manufacturer and model, e.g. hario-v60-02. Never reused. | text; at least 3 characters; at most 64 characters; format `^[a-z0-9_.-]+$` | yes |
| [`name`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-name) | Full display name, e.g. Hario V60 02. | text; at least 1 character | yes |
| [`manufacturer`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-manufacturer) | Manufacturer | object | yes |
| [`manufacturer.name`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-manufacturer.name) | — | text; at least 1 character | yes |
| [`manufacturer.manufacturer_id`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-manufacturer.manufacturer_id) | Reserved for a future manufacturers dataset. | text; at least 3 characters; at most 64 characters; format `^[a-z0-9_.-]+$` | no |
| [`manufacturer.country_code`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-manufacturer.country_code) | ISO 3166-1 alpha-2 code in upper case. | text; format `^[A-Z]{2}$` | no |
| [`manufacturer.website`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-manufacturer.website) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`model`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-model) | — | text; at least 1 character | no |
| [`variants`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-variants) | Sizes or materials sold under the same model, e.g. 01 and 02, ceramic and plastic. | list of text; at least 1 character | no |
| [`type`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-type) | espresso_machine_with_grinder is an espresso machine with a built-in grinder; filter covers paper and metal filters; accessory covers everything without a dedicated type (puck screens, distribution tools, thermometers, dosing cups). | one of: `espresso_machine`, `espresso_machine_with_grinder`, `grinder`, `brewer`, `kettle`, `scale`, `tamper`, `wdt`, `basket`, `filter`, `roaster`, `milk_frother`, `accessory` | yes |
| [`brew_methods`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-brew_methods) | Brew method ids from the Open Coffee brew methods dataset this equipment is made for. | list of text; at least 3 characters; at most 64 characters; no duplicates; format `^[a-z0-9_.-]+$` | no |
| [`released_year`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-released_year) | — | whole number; at least 1800; at most 2100 | no |
| [`discontinued`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-discontinued) | — | yes/no | no |
| [`links`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-links) | Links | object | no |
| [`links.product`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-links.product) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`links.manual`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-links.manual) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`image`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-image) | An openly licensed image. Each image carries its own licence, author and source. | object | no |
| [`image.url`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-image.url) | Where the file is served from (our assets folder or the original host). | a full web address; format `^https?://` | yes |
| [`image.licence`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-image.licence) | SPDX identifier, for example CC-BY-4.0, CC-BY-SA-4.0 or CC0-1.0. | text; at least 2 characters | yes |
| [`image.author`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-image.author) | — | text; at least 1 character | yes |
| [`image.source_url`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-image.source_url) | Page describing the original file and its licence. | a full web address; format `^https?://` | yes |
| [`image.title`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-image.title) | — | text | no |
| [`image.width`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-image.width) | — | whole number; at least 1 | no |
| [`image.height`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-image.height) | — | whole number; at least 1 | no |
| [`xref`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-xref) | Identifiers elsewhere | object | no |
| [`xref.wikidata`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-xref.wikidata) | — | text; format `^Q[1-9][0-9]*$` | no |
| [`xref.gtin`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-xref.gtin) | — | list of text; format `^[0-9]{8,14}$` | no |
| [`xref.google_product_category`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-xref.google_product_category) | Google Product Taxonomy id (Wikidata P11302). | whole number; at least 1 | no |
| [`xref.gs1_gpc_brick`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-xref.gs1_gpc_brick) | GS1 Global Product Classification brick code (Wikidata P8957). | text; format `^[0-9]{8}$` | no |
| [`espresso_machine`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-espresso_machine) | Espresso machine details Not allowed when type is one of "grinder", "brewer", "kettle", "scale", "tamper", "wdt", "basket", "filter", "roaster", "milk_frother", "accessory". | object | no |
| [`espresso_machine.heating_architecture`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-espresso_machine.heating_architecture) | — | one of: `single_boiler`, `heat_exchanger`, `dual_boiler`, `multi_boiler`, `single_thermoblock`, `dual_thermoblock`, `hybrid`, `manual`, `other` | no |
| [`espresso_machine.temperature_control`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-espresso_machine.temperature_control) | — | one of: `none`, `fixed`, `adjustable`, `programmable` | no |
| [`espresso_machine.pressure_control`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-espresso_machine.pressure_control) | — | one of: `fixed`, `adjustable_opv`, `manual`, `programmable` | no |
| [`espresso_machine.flow_control`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-espresso_machine.flow_control) | — | one of: `none`, `manual`, `programmable` | no |
| [`espresso_machine.preinfusion_control`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-espresso_machine.preinfusion_control) | — | one of: `none`, `supported`, `fixed`, `adjustable`, `programmable` | no |
| [`espresso_machine.steam_system`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-espresso_machine.steam_system) | — | one of: `none`, `shared_heater`, `dedicated_heater` | no |
| [`espresso_machine.simultaneous_brew_and_steam`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-espresso_machine.simultaneous_brew_and_steam) | — | yes/no | no |
| [`espresso_machine.pump_type`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-espresso_machine.pump_type) | — | one of: `vibration`, `rotary`, `gear`, `peristaltic`, `manual`, `other` | no |
| [`espresso_machine.water_source_modes`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-espresso_machine.water_source_modes) | — | list, each one of: `reservoir`, `plumbed`; at least 1 entry; no duplicates | no |
| [`espresso_machine.shot_stop_modes`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-espresso_machine.shot_stop_modes) | — | list, each one of: `manual`, `weight`, `time`, `volume`; no duplicates | no |
| [`espresso_machine.group_count`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-espresso_machine.group_count) | — | whole number; at least 1 | no |
| [`espresso_machine.portafilter_diameter_mm`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-espresso_machine.portafilter_diameter_mm) | — | number; more than 0 | no |
| [`espresso_machine.brew_pressure_min_bar`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-espresso_machine.brew_pressure_min_bar) | — | number; more than 0 | no |
| [`espresso_machine.brew_pressure_max_bar`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-espresso_machine.brew_pressure_max_bar) | — | number; more than 0 | no |
| [`espresso_machine.brew_temperature_min_celsius`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-espresso_machine.brew_temperature_min_celsius) | — | number; more than 0 | no |
| [`espresso_machine.brew_temperature_max_celsius`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-espresso_machine.brew_temperature_max_celsius) | — | number; more than 0 | no |
| [`espresso_machine.reservoir_capacity_ml`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-espresso_machine.reservoir_capacity_ml) | — | number; more than 0 | no |
| [`espresso_machine.power_w`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-espresso_machine.power_w) | — | number; more than 0 | no |
| [`espresso_machine.group_type`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-espresso_machine.group_type) | — | one of: `e61`, `saturated`, `semi_saturated`, `lever`, `integrated`, `other` | no |
| [`espresso_machine.boiler_count`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-espresso_machine.boiler_count) | — | whole number; at least 0 | no |
| [`espresso_machine.connectivity`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-espresso_machine.connectivity) | — | list, each one of: `bluetooth`, `wifi`, `usb`; no duplicates | no |
| [`grinder`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-grinder) | Grinder details Not allowed when type is one of "espresso_machine", "brewer", "kettle", "scale", "tamper", "wdt", "basket", "filter", "roaster", "milk_frother", "accessory". | object | no |
| [`grinder.burr_mechanism`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-grinder.burr_mechanism) | — | one of: `conical`, `flat`, `ghost`, `roller`, `blade`, `other` | no |
| [`grinder.burr_diameter_mm`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-grinder.burr_diameter_mm) | — | number; more than 0 | no |
| [`grinder.burr_material`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-grinder.burr_material) | — | one of: `steel`, `ceramic`, `titanium_coated`, `other` | no |
| [`grinder.adjustment_type`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-grinder.adjustment_type) | — | one of: `fixed`, `stepped`, `stepless` | no |
| [`grinder.grind_setting_format`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-grinder.grind_setting_format) | How the dial reads, so journals can store settings. | one of: `whole_number`, `decimal`, `string` | no |
| [`grinder.grind_setting_min`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-grinder.grind_setting_min) | — | number | no |
| [`grinder.grind_setting_max`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-grinder.grind_setting_max) | — | number | no |
| [`grinder.brew_range`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-grinder.brew_range) | — | list, each one of: `espresso`, `filter`, `turkish`; at least 1 entry; no duplicates | no |
| [`grinder.bean_feed`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-grinder.bean_feed) | — | one of: `single_dose`, `hopper`, `both` | no |
| [`grinder.dose_control_modes`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-grinder.dose_control_modes) | — | list, each one of: `manual`, `time`, `weight`; no duplicates | no |
| [`grinder.drive`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-grinder.drive) | — | one of: `manual`, `electric` | no |
| [`grinder.motor_power_w`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-grinder.motor_power_w) | — | number; more than 0 | no |
| [`grinder.grind_setting_step`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-grinder.grind_setting_step) | Smallest step between settings on a stepped dial. | number; more than 0 | no |
| [`grinder.microns_per_step`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-grinder.microns_per_step) | Burr gap change per setting step, as stated by the maker or measured. | number; more than 0 | no |
| [`grinder.retention_g`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-grinder.retention_g) | — | number; at least 0 | no |
| [`grinder.rpm_min`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-grinder.rpm_min) | — | number; more than 0 | no |
| [`grinder.rpm_max`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-grinder.rpm_max) | — | number; more than 0 | no |
| [`brewer`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-brewer) | Brewer details Not allowed when type is one of "espresso_machine", "espresso_machine_with_grinder", "grinder", "kettle", "scale", "tamper", "wdt", "basket", "filter", "roaster", "milk_frother", "accessory". | object | no |
| [`brewer.mechanism`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-brewer.mechanism) | How water and coffee meet; matches brew method categories. | one of: `percolation`, `immersion`, `hybrid`, `press`, `vacuum`, `boiling`, `other` | no |
| [`brewer.capacity_ml`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-brewer.capacity_ml) | — | number; more than 0 | no |
| [`brewer.cup_capacity`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-brewer.cup_capacity) | Nominal number of cups the maker states. | whole number; at least 1 | no |
| [`brewer.material`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-brewer.material) | — | list, each one of: `ceramic`, `glass`, `plastic`, `stainless_steel`, `copper`, `aluminium`, `porcelain`, `wood`, `silicone`, `other`; no duplicates | no |
| [`brewer.filter_format`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-brewer.filter_format) | Filter shape or size, e.g. cone_02, flat_185, chemex_6cup, aeropress_round, metal_mesh. | text; format `^[a-z0-9_-]+$` | no |
| [`brewer.filter_shape`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-brewer.filter_shape) | — | one of: `cone`, `flat_bottom`, `basket`, `disc`, `none` | no |
| [`brewer.flow_control`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-brewer.flow_control) | — | one of: `fixed`, `manual_valve`, `programmable` | no |
| [`brewer.drive`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-brewer.drive) | — | one of: `manual`, `electric`, `stovetop` | no |
| [`kettle`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-kettle) | Kettle details Not allowed when type is one of "espresso_machine", "espresso_machine_with_grinder", "grinder", "brewer", "scale", "tamper", "wdt", "basket", "filter", "roaster", "milk_frother", "accessory". | object | no |
| [`kettle.capacity_ml`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-kettle.capacity_ml) | — | number; more than 0 | no |
| [`kettle.spout_type`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-kettle.spout_type) | — | one of: `gooseneck`, `standard`, `other` | no |
| [`kettle.temperature_control`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-kettle.temperature_control) | — | one of: `none`, `fixed`, `adjustable` | no |
| [`kettle.temperature_min_celsius`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-kettle.temperature_min_celsius) | — | number; more than 0 | no |
| [`kettle.temperature_max_celsius`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-kettle.temperature_max_celsius) | — | number; more than 0 | no |
| [`kettle.supports_temperature_hold`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-kettle.supports_temperature_hold) | — | yes/no | no |
| [`kettle.heat_source`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-kettle.heat_source) | — | one of: `electric`, `stovetop`, `induction_compatible`, `other` | no |
| [`scale`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-scale) | Scale details Not allowed when type is one of "espresso_machine", "espresso_machine_with_grinder", "grinder", "brewer", "kettle", "tamper", "wdt", "basket", "filter", "roaster", "milk_frother", "accessory". | object | no |
| [`scale.resolution_g`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-scale.resolution_g) | — | number; more than 0 | no |
| [`scale.capacity_g`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-scale.capacity_g) | — | number; more than 0 | no |
| [`scale.has_timer`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-scale.has_timer) | — | yes/no | no |
| [`scale.supports_auto_tare`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-scale.supports_auto_tare) | — | yes/no | no |
| [`scale.supports_auto_timer`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-scale.supports_auto_timer) | — | yes/no | no |
| [`scale.has_flow_rate_display`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-scale.has_flow_rate_display) | — | yes/no | no |
| [`scale.connectivity`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-scale.connectivity) | — | list, each one of: `bluetooth`, `wifi`, `usb`; no duplicates | no |
| [`tamper`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-tamper) | Tamper details Not allowed when type is one of "espresso_machine", "espresso_machine_with_grinder", "grinder", "brewer", "kettle", "scale", "wdt", "basket", "filter", "roaster", "milk_frother", "accessory". | object | no |
| [`tamper.diameter_mm`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-tamper.diameter_mm) | — | number; more than 0 | no |
| [`tamper.force_control`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-tamper.force_control) | — | one of: `none`, `fixed`, `adjustable` | no |
| [`tamper.base_shape`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-tamper.base_shape) | — | one of: `flat`, `convex`, `rippled`, `other` | no |
| [`tamper.self_leveling`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-tamper.self_leveling) | — | yes/no | no |
| [`wdt`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-wdt) | WDT tool details Not allowed when type is one of "espresso_machine", "espresso_machine_with_grinder", "grinder", "brewer", "kettle", "scale", "tamper", "basket", "filter", "roaster", "milk_frother", "accessory". | object | no |
| [`wdt.needle_diameter_mm`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-wdt.needle_diameter_mm) | — | number; more than 0 | no |
| [`wdt.needle_count`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-wdt.needle_count) | — | whole number; at least 1 | no |
| [`wdt.depth_control`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-wdt.depth_control) | — | one of: `none`, `fixed`, `adjustable` | no |
| [`basket`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-basket) | Portafilter basket details Not allowed when type is one of "espresso_machine", "espresso_machine_with_grinder", "grinder", "brewer", "kettle", "scale", "tamper", "wdt", "filter", "roaster", "milk_frother", "accessory". | object | no |
| [`basket.kind`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-basket.kind) | — | one of: `single`, `double`, `triple`, `other` | no |
| [`basket.diameter_mm`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-basket.diameter_mm) | — | number; more than 0 | no |
| [`basket.nominal_dose_g`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-basket.nominal_dose_g) | — | number; more than 0 | no |
| [`basket.dose_min_g`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-basket.dose_min_g) | — | number; more than 0 | no |
| [`basket.dose_max_g`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-basket.dose_max_g) | — | number; more than 0 | no |
| [`basket.pressurized`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-basket.pressurized) | — | yes/no | no |
| [`basket.precision`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-basket.precision) | — | yes/no | no |
| [`method`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-method) | How a value was obtained. import: copied from an allow-listed open dataset; crawl: read directly from a page; llm_extraction: extracted from crawled text by a language model; manual: entered by a reviewer; owner_submitted: supplied by the business owner. | one of: `import`, `crawl`, `llm_extraction`, `manual`, `owner_submitted` | no |
| [`confidence`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-confidence) | Probability (0-1) that the value is correct. Values of 0.85 or more may be merged without human review. | number; at least 0; at most 1 | no |
| [`sources`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-sources) | Where a fact came from. source_id must exist in the dataset's sources allow-list. | list of object; at least 1 entry | yes |
| [`sources.source_id`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-sources.source_id) | Permanent, opaque identifier. Never reused, never derived from a name, never deleted. | text; at least 3 characters; at most 64 characters; format `^[a-z0-9_.-]+$` | yes |
| [`sources.url`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-sources.url) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`sources.retrieved_at`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-sources.retrieved_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | yes |
| [`checked_at`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-checked_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | yes |
| [`field_provenance`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-field_provenance) | Keys are dotted field paths inside the record (for example opening_hours or serving.filter). | map of named entries; keys match `^[a-z_]+(\.[a-z_]+)*$` | no |
| [`field_provenance.*`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-field_provenance.*) | Overrides the record's default method and confidence for one field and names the sources for that value. | object; not empty | no |
| [`field_provenance.*.method`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-field_provenance.*.method) | How a value was obtained. import: copied from an allow-listed open dataset; crawl: read directly from a page; llm_extraction: extracted from crawled text by a language model; manual: entered by a reviewer; owner_submitted: supplied by the business owner. | one of: `import`, `crawl`, `llm_extraction`, `manual`, `owner_submitted` | no |
| [`field_provenance.*.confidence`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-field_provenance.*.confidence) | Probability (0-1) that the value is correct. Values of 0.85 or more may be merged without human review. | number; at least 0; at most 1 | no |
| [`field_provenance.*.sources`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-field_provenance.*.sources) | Where a fact came from. source_id must exist in the dataset's sources allow-list. | list of object; at least 1 entry | no |
| [`field_provenance.*.sources.source_id`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-field_provenance.*.sources.source_id) | Permanent, opaque identifier. Never reused, never derived from a name, never deleted. | text; at least 3 characters; at most 64 characters; format `^[a-z0-9_.-]+$` | yes |
| [`field_provenance.*.sources.url`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-field_provenance.*.sources.url) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`field_provenance.*.sources.retrieved_at`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-field_provenance.*.sources.retrieved_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | yes |
| [`field_provenance.*.checked_at`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-field_provenance.*.checked_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | no |
| [`mpn`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-mpn) | Manufacturer part number. | text; at least 1 character | no |
| [`weight_g`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-weight_g) | — | number; more than 0 | no |
| [`dimensions_mm`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-dimensions_mm) | — | object | no |
| [`dimensions_mm.width`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-dimensions_mm.width) | — | number; more than 0 | no |
| [`dimensions_mm.depth`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-dimensions_mm.depth) | — | number; more than 0 | no |
| [`dimensions_mm.height`](https://schema.roastbook.coffee/equipment/v1.0.0/#field-dimensions_mm.height) | — | number; more than 0 | no |

### File structure

| Field | What it means | Values | Required |
|---|---|---|---|
| [`$schema`](https://schema.roastbook.coffee/equipment/v1.0.0/#file-$schema) | — | text; format `^https://schema\.roastbook\.coffee/equipment/equipment\.schema\.v[0-9]+\.[0-9]+\.[0-9]+\.json$` | yes |
| [`meta`](https://schema.roastbook.coffee/equipment/v1.0.0/#file-meta) | Dataset metadata | object | yes |
| [`meta.version`](https://schema.roastbook.coffee/equipment/v1.0.0/#file-meta.version) | Date tag YYYY.MM.DD.N; N counts releases on the same day, starting at 1. | text; format `^[0-9]{4}\.[0-9]{2}\.[0-9]{2}\.[1-9][0-9]*$` | yes |
| [`meta.generated_at`](https://schema.roastbook.coffee/equipment/v1.0.0/#file-meta.generated_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | yes |
| [`meta.licence`](https://schema.roastbook.coffee/equipment/v1.0.0/#file-meta.licence) | — | exactly "CC-BY-4.0" | no |
| [`meta.attribution`](https://schema.roastbook.coffee/equipment/v1.0.0/#file-meta.attribution) | — | text | no |
| [`equipment`](https://schema.roastbook.coffee/equipment/v1.0.0/#file-equipment) | Equipment model Each entry is one Equipment model record (see above). | list of object | yes |

## Open Coffee source allow-list

Family `sources`, version 1.0.0. Every source a record may cite. Adding or changing an entry is a human-reviewed pull request.

Schema: <https://schema.roastbook.coffee/sources/sources.schema.v1.0.0.json> · Explorer: <https://schema.roastbook.coffee/sources/v1.0.0/>

### sources record

| Field | What it means | Values | Required |
|---|---|---|---|
| [`id`](https://schema.roastbook.coffee/sources/v1.0.0/#field-id) | Permanent, opaque identifier. Never reused, never derived from a name, never deleted. | text; at least 3 characters; at most 64 characters; format `^[a-z0-9_.-]+$` | yes |
| [`name`](https://schema.roastbook.coffee/sources/v1.0.0/#field-name) | — | text; at least 1 character | yes |
| [`kind`](https://schema.roastbook.coffee/sources/v1.0.0/#field-kind) | — | one of: `open_dataset`, `roaster_page`, `primary_website`, `social_profile`, `web_search`, `open_knowledge`, `image_repository`, `community`, `verification_api`, `manufacturer_page`, `retailer_page`, `standards_body` | yes |
| [`url`](https://schema.roastbook.coffee/sources/v1.0.0/#field-url) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`licence`](https://schema.roastbook.coffee/sources/v1.0.0/#field-licence) | SPDX identifier, or a short statement such as 'facts only, no copyright claimed'. | text; at least 1 character | yes |
| [`attribution`](https://schema.roastbook.coffee/sources/v1.0.0/#field-attribution) | Attribution text that must accompany data derived from this source. | text | no |
| [`allowed_for`](https://schema.roastbook.coffee/sources/v1.0.0/#field-allowed_for) | — | list, each one of: `discovery`, `facts`, `images`, `verification`; at least 1 entry; no duplicates | yes |
| [`how_to_use`](https://schema.roastbook.coffee/sources/v1.0.0/#field-how_to_use) | — | text; at least 10 characters | yes |
| [`vetted`](https://schema.roastbook.coffee/sources/v1.0.0/#field-vetted) | A maintainer checked the licence and terms. | yes/no | yes |
| [`checked_at`](https://schema.roastbook.coffee/sources/v1.0.0/#field-checked_at) | Calendar date, YYYY-MM-DD. | a date like 2026-11-05 | yes |

### File structure

| Field | What it means | Values | Required |
|---|---|---|---|
| [`$schema`](https://schema.roastbook.coffee/sources/v1.0.0/#file-$schema) | — | text; format `^https://schema\.roastbook\.coffee/sources/sources\.schema\.v[0-9]+\.[0-9]+\.[0-9]+\.json$` | yes |
| [`meta`](https://schema.roastbook.coffee/sources/v1.0.0/#file-meta) | Dataset metadata | object | yes |
| [`meta.version`](https://schema.roastbook.coffee/sources/v1.0.0/#file-meta.version) | Date tag YYYY.MM.DD.N; N counts releases on the same day, starting at 1. | text; format `^[0-9]{4}\.[0-9]{2}\.[0-9]{2}\.[1-9][0-9]*$` | yes |
| [`meta.generated_at`](https://schema.roastbook.coffee/sources/v1.0.0/#file-meta.generated_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | yes |
| [`meta.licence`](https://schema.roastbook.coffee/sources/v1.0.0/#file-meta.licence) | — | exactly "CC-BY-4.0" | no |
| [`meta.attribution`](https://schema.roastbook.coffee/sources/v1.0.0/#file-meta.attribution) | — | text | no |
| [`sources`](https://schema.roastbook.coffee/sources/v1.0.0/#file-sources) | Each entry is one sources record (see above). | list of object; at least 1 entry | yes |

## Open Coffee translations

Family `translations`, version 1.0.0. Translated text fields for one dataset file, keyed by record id. Untranslated records fall back to the base file.

Schema: <https://schema.roastbook.coffee/translations/translations.schema.v1.0.0.json> · Explorer: <https://schema.roastbook.coffee/translations/v1.0.0/>

### File structure

| Field | What it means | Values | Required |
|---|---|---|---|
| [`$schema`](https://schema.roastbook.coffee/translations/v1.0.0/#field-$schema) | — | text; format `^https://schema\.roastbook\.coffee/translations/translations\.schema\.v[0-9]+\.[0-9]+\.[0-9]+\.json$` | yes |
| [`meta`](https://schema.roastbook.coffee/translations/v1.0.0/#field-meta) | Dataset metadata | object | yes |
| [`meta.version`](https://schema.roastbook.coffee/translations/v1.0.0/#field-meta.version) | Date tag YYYY.MM.DD.N; N counts releases on the same day, starting at 1. | text; format `^[0-9]{4}\.[0-9]{2}\.[0-9]{2}\.[1-9][0-9]*$` | yes |
| [`meta.generated_at`](https://schema.roastbook.coffee/translations/v1.0.0/#field-meta.generated_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | yes |
| [`meta.licence`](https://schema.roastbook.coffee/translations/v1.0.0/#field-meta.licence) | — | exactly "CC-BY-4.0" | no |
| [`meta.attribution`](https://schema.roastbook.coffee/translations/v1.0.0/#field-meta.attribution) | — | text | no |
| [`meta.locale`](https://schema.roastbook.coffee/translations/v1.0.0/#field-meta.locale) | — | text; format `^[a-z]{2}(-[A-Z]{2})?$` | yes |
| [`meta.base`](https://schema.roastbook.coffee/translations/v1.0.0/#field-meta.base) | Path of the base dataset file, for example datasets/coffee-places/de/munich.json. | text | yes |
| [`entries`](https://schema.roastbook.coffee/translations/v1.0.0/#field-entries) | — | map of named entries; keys match `^[a-z0-9_.-]+$` | yes |
| [`entries.*`](https://schema.roastbook.coffee/translations/v1.0.0/#field-entries.*) | — | object; not empty | no |
| [`entries.*.name`](https://schema.roastbook.coffee/translations/v1.0.0/#field-entries.*.name) | — | text; at least 1 character | no |
| [`entries.*.description`](https://schema.roastbook.coffee/translations/v1.0.0/#field-entries.*.description) | — | text; at least 20 characters; at most 600 characters | no |

