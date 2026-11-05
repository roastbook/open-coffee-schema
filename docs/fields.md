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

Family `coffee-places`, version 0.1.0. One file per city listing cafés, coffee bars and other places that serve coffee, with provenance for every fact. Part of Roastbook Open Coffee.

Schema: <https://schema.roastbook.coffee/coffee-places/coffee-places.schema.v0.1.0.json> · Explorer: <https://schema.roastbook.coffee/coffee-places/v0.1.0/>

### Coffee place record

| Field | What it means | Values | Required |
|---|---|---|---|
| [`id`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-id) | Permanent, opaque identifier. Never reused, never derived from a name, never deleted. | text; at least 3 characters; at most 64 characters; format `^[a-z0-9_.-]+$` | yes |
| [`name`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-name) | The name the place uses on its sign or website. | text; at least 1 character; at most 200 characters | yes |
| [`status`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-status) | open; temporarily_closed (renovation, holiday longer than a month); closed (permanently); unverified (found but not yet confirmed to exist). | one of: `open`, `temporarily_closed`, `closed`, `unverified` | yes |
| [`merged_into`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-merged_into) | Set when this record turned out to be a duplicate. The record stays as a tombstone so its id is never reused or lost. | text; at least 3 characters; at most 64 characters; format `^[a-z0-9_.-]+$` | no |
| [`opened_on`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-opened_on) | Calendar date, YYYY-MM-DD. | a date like 2026-11-05 | no |
| [`closed_on`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-closed_on) | Calendar date, YYYY-MM-DD. Only allowed when status is "closed". | a date like 2026-11-05 | no |
| [`last_verified_at`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-last_verified_at) | When a primary source last confirmed that the place exists with this status. | a timestamp with time zone like 2026-11-05T14:00:00Z | no |
| [`checked_at`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-checked_at) | When the record as a whole was last reviewed or enriched. | a timestamp with time zone like 2026-11-05T14:00:00Z | yes |
| [`address`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-address) | Postal address | object | yes |
| [`address.street_address`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-address.street_address) | Street and house number. | text; at least 1 character | no |
| [`address.postal_code`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-address.postal_code) | Postal code as used locally, for example 80331. | text; at least 1 character | no |
| [`address.locality`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-address.locality) | City or town. | text; at least 1 character | no |
| [`address.region`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-address.region) | State or region. | text; at least 1 character | no |
| [`address.country_code`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-address.country_code) | ISO 3166-1 alpha-2 code in upper case. | text; format `^[A-Z]{2}$` | yes |
| [`location`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-location) | WGS 84 coordinates of the entrance or building. | object | yes |
| [`location.lat`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-location.lat) | Latitude in decimal degrees (WGS 84); positive is north of the equator, for example 48.1371. | number; at least -90; at most 90 | yes |
| [`location.lon`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-location.lon) | Longitude in decimal degrees (WGS 84); positive is east of Greenwich, for example 11.5754. | number; at least -180; at most 180 | yes |
| [`opening_hours`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-opening_hours) | Opening hours in OpenStreetMap opening_hours syntax (used as a format only; no OSM data), for example "Mo-Fr 08:00-18:00; Sa,Su 09:00-17:00". | text; at least 2 characters; at most 255 characters | no |
| [`open_sunday`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-open_sunday) | Regularly open on Sundays. | yes/no | no |
| [`description`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-description) | Short English description written only from the facts stored in this record. Never copied from the place's own texts. | text; at least 20 characters; at most 600 characters | no |
| [`specialty_tier`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-specialty_tier) | A: coffee is the core product; the place roasts its own beans or serves named specialty roasters and usually offers filter coffee. B: food or something else leads, but the place serves a specialty roaster. none: not a specialty place (kept in the dataset). unknown: not yet assessed. | one of: `A`, `B`, `none`, `unknown` | yes |
| [`specialty_evidence`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-specialty_evidence) | A short claim in our own words and the page that supports it. | list of object; at most 5 entries | no |
| [`specialty_evidence.claim`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-specialty_evidence.claim) | One sentence in our own words stating the fact that supports the specialty tier, for example "Serves filter coffee from a named Munich roaster". | text; at least 3 characters; at most 280 characters | yes |
| [`specialty_evidence.url`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-specialty_evidence.url) | Absolute http or https URL. | a full web address; format `^https?://` | yes |
| [`roasts_own_beans`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-roasts_own_beans) | Whether the place roasts coffee itself. true: roasts its own beans; false: confirmed not roasting; absent: unknown. | yes/no | no |
| [`roasters_served`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-roasters_served) | Roaster served | list of object | no |
| [`roasters_served.name`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-roasters_served.name) | Name of the roastery whose coffee is served. | text; at least 1 character | yes |
| [`roasters_served.roaster_id`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-roasters_served.roaster_id) | Reserved for the future Open Coffee roasters dataset. | text; at least 3 characters; at most 64 characters; format `^[a-z0-9_.-]+$` | no |
| [`roasters_served.url`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-roasters_served.url) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`roasters_served.own`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-roasters_served.own) | The place roasts this coffee itself. | yes/no | no |
| [`serving`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-serving) | Coffee preparation offered. true: offered; false: confirmed not offered; absent: unknown. | object | no |
| [`serving.espresso`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-serving.espresso) | Espresso and espresso-based drinks. | yes/no | no |
| [`serving.filter`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-serving.filter) | Any filter coffee. | yes/no | no |
| [`serving.pour_over`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-serving.pour_over) | Hand-brewed filter (V60, Kalita, Chemex and similar). | yes/no | no |
| [`serving.batch_brew`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-serving.batch_brew) | Filter coffee from a batch brewer. | yes/no | no |
| [`serving.cold_brew`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-serving.cold_brew) | Coffee brewed with cold water over many hours. true: offered; false: confirmed not offered; absent: unknown. | yes/no | no |
| [`serving.decaf`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-serving.decaf) | Decaffeinated coffee. true: offered; false: confirmed not offered; absent: unknown. | yes/no | no |
| [`serving.plant_milk`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-serving.plant_milk) | At least one plant-based milk. | yes/no | no |
| [`amenities`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-amenities) | true: available; false: confirmed not available; absent: unknown. | object | no |
| [`amenities.wifi`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-amenities.wifi) | Wi-Fi for guests. true: available; false: confirmed not available; absent: unknown. | yes/no | no |
| [`amenities.laptop_friendly`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-amenities.laptop_friendly) | Laptops are welcome (no laptop ban, seats with sockets or tables). | yes/no | no |
| [`amenities.kids_friendly`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-amenities.kids_friendly) | Suitable for children, for example with high chairs, space for prams or a kids' menu. true: yes; false: confirmed not suitable; absent: unknown. | yes/no | no |
| [`amenities.vegan_options`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-amenities.vegan_options) | Vegan food beyond plant milk. | yes/no | no |
| [`amenities.dogs_allowed`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-amenities.dogs_allowed) | Dogs may come inside. true: allowed; false: confirmed not allowed; absent: unknown. | yes/no | no |
| [`amenities.outdoor_seating`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-amenities.outdoor_seating) | Seats outside, such as a terrace or tables on the pavement. true: available; false: confirmed none; absent: unknown. | yes/no | no |
| [`amenities.card_payment`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-amenities.card_payment) | Payment by debit or credit card. true: accepted; false: confirmed not accepted; absent: unknown. | yes/no | no |
| [`amenities.cash_only`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-amenities.cash_only) | Only cash is accepted. true: cash only; false: other payment methods are accepted; absent: unknown. | yes/no | no |
| [`amenities.wheelchair_accessible`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-amenities.wheelchair_accessible) | Step-free entrance. | yes/no | no |
| [`food`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-food) | Food | object | no |
| [`food.focus`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-food.focus) | coffee_led: coffee is the main product; food_led: food or a restaurant concept leads; balanced: both matter equally. | one of: `coffee_led`, `food_led`, `balanced` | no |
| [`food.breakfast`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-food.breakfast) | Breakfast is served. true: served; false: confirmed not served; absent: unknown. | yes/no | no |
| [`food.lunch`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-food.lunch) | Lunch dishes are served. true: served; false: confirmed not served; absent: unknown. | yes/no | no |
| [`food.cakes_baked_in_house`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-food.cakes_baked_in_house) | Cakes or pastries are baked by the place itself. true: baked in house; false: confirmed bought in; absent: unknown. | yes/no | no |
| [`sells_beans`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-sells_beans) | Whether whole beans or ground coffee are sold to take home. true: sold; false: confirmed not sold; absent: unknown. | yes/no | no |
| [`sells_equipment`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-sells_equipment) | Whether brewing equipment such as grinders, drippers or kettles is sold. true: sold; false: confirmed not sold; absent: unknown. | yes/no | no |
| [`offers_courses`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-offers_courses) | Barista courses, brewing classes or public cuppings. | yes/no | no |
| [`reusable_cup_systems`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-reusable_cup_systems) | Deposit or reusable cup schemes accepted, for example recup, vytal, own_cup. | list of text; no duplicates; format `^[a-z0-9_-]+$` | no |
| [`good_for`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-good_for) | Good for | list, each one of: `working`, `meetings`, `quick_espresso`, `takeaway`, `brunch`, `groups`, `reading`, `date`, `coffee_nerds`, `families`; no duplicates | no |
| [`awards`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-awards) | Award | list of object | no |
| [`awards.name`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-awards.name) | Name of the award or ranking, for example a national barista championship or a city guide's list. | text; at least 1 character | yes |
| [`awards.year`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-awards.year) | Year the award was given, for example 2025. | whole number; at least 1900; at most 2100 | no |
| [`awards.url`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-awards.url) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`prices`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-prices) | Prices we observed, each with the date and page where we saw it. Currently only the cappuccino price, as a comparable reference. | object | no |
| [`prices.cappuccino`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-prices.cappuccino) | Observed price | object | no |
| [`prices.cappuccino.amount`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-prices.cappuccino.amount) | Price paid for one standard drink, in the currency given by currency, for example 3.9. | number; more than 0 | yes |
| [`prices.cappuccino.currency`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-prices.cappuccino.currency) | ISO 4217 currency code. | text; format `^[A-Z]{3}$` | yes |
| [`prices.cappuccino.observed_on`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-prices.cappuccino.observed_on) | Calendar date, YYYY-MM-DD. | a date like 2026-11-05 | yes |
| [`prices.cappuccino.source_url`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-prices.cappuccino.source_url) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`operator`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-operator) | The legal entity running the place, taken from its Impressum or legal notice. Only companies and other legal entities; never the name of a natural person (sole traders are omitted). | object | no |
| [`operator.name`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-operator.name) | Registered name of the company that runs the place, as written in its legal notice. | text; at least 1 character | yes |
| [`operator.legal_form`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-operator.legal_form) | For example GmbH, UG (haftungsbeschränkt), KG, e.K. | text | no |
| [`operator.register_id`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-operator.register_id) | Commercial register number, for example HRB 123456 (Amtsgericht München). | text | no |
| [`links`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-links) | Links | object | no |
| [`links.website`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-links.website) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`links.instagram`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-links.instagram) | Address of the place's own Instagram profile, for example https://www.instagram.com/example.coffee/. | text; format `^https://(www\.)?instagram\.com/[A-Za-z0-9_.]+/?$` | no |
| [`links.facebook`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-links.facebook) | Address of the place's own Facebook page. | text; format `^https://(www\.\|m\.)?facebook\.com/.+` | no |
| [`image`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-image) | An openly licensed image. Each image carries its own licence, author and source. | object | no |
| [`image.url`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-image.url) | Where the file is served from (our assets folder or the original host). | a full web address; format `^https?://` | yes |
| [`image.licence`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-image.licence) | SPDX identifier, for example CC-BY-4.0, CC-BY-SA-4.0 or CC0-1.0. | text; at least 2 characters | yes |
| [`image.author`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-image.author) | Name of the photographer or creator, as the licence requires it to be credited. | text; at least 1 character | yes |
| [`image.source_url`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-image.source_url) | Page describing the original file and its licence. | a full web address; format `^https?://` | yes |
| [`image.title`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-image.title) | Short caption describing what the image shows. | text | no |
| [`image.width`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-image.width) | Width of the image file in pixels. | whole number; at least 1 | no |
| [`image.height`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-image.height) | Height of the image file in pixels. | whole number; at least 1 | no |
| [`xref`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-xref) | Crosswalk to other datasets. google_place_id is the only Google data we may store. | object | no |
| [`xref.overture`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-xref.overture) | Overture Maps place GERS id. | text; at least 1 character | no |
| [`xref.foursquare`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-xref.foursquare) | Foursquare Open Source Places fsq_place_id. | text; at least 1 character | no |
| [`xref.wikidata`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-xref.wikidata) | Wikidata item id of the place, for example Q42. | text; format `^Q[1-9][0-9]*$` | no |
| [`xref.google_place_id`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-xref.google_place_id) | Google Maps place id, stored only so a known place can be matched. No other Google data is stored. | text; at least 1 character | no |
| [`external_ratings`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-external_ratings) | References to rating pages elsewhere. Rating values are never stored. | list of object | no |
| [`external_ratings.source`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-external_ratings.source) | Short name of the other service, for example tripadvisor or untappd. Lowercase letters, digits, dots, dashes and underscores. | text; format `^[a-z0-9_.-]+$` | yes |
| [`external_ratings.id`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-external_ratings.id) | The record's identifier in the other service. | text; at least 1 character | yes |
| [`external_ratings.url`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-external_ratings.url) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`method`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-method) | How a value was obtained. import: copied from an allow-listed open dataset; crawl: read directly from a page; llm_extraction: extracted from crawled text by a language model; manual: entered by a reviewer; owner_submitted: supplied by the business owner. | one of: `import`, `crawl`, `llm_extraction`, `manual`, `owner_submitted` | no |
| [`confidence`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-confidence) | Probability (0-1) that the value is correct. Values of 0.85 or more may be merged without human review. | number; at least 0; at most 1 | no |
| [`sources`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-sources) | Where a fact came from. source_id must exist in the dataset's sources allow-list. | list of object; at least 1 entry | yes |
| [`sources.source_id`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-sources.source_id) | Permanent, opaque identifier. Never reused, never derived from a name, never deleted. | text; at least 3 characters; at most 64 characters; format `^[a-z0-9_.-]+$` | yes |
| [`sources.url`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-sources.url) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`sources.retrieved_at`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-sources.retrieved_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | yes |
| [`field_provenance`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-field_provenance) | Keys are dotted field paths inside the record (for example opening_hours or serving.filter). | map of named entries; keys match `^[a-z_]+(\.[a-z_]+)*$` | no |
| [`field_provenance.*`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-field_provenance.*) | Overrides the record's default method and confidence for one field and names the sources for that value. | object; not empty | no |
| [`field_provenance.*.method`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-field_provenance.*.method) | How a value was obtained. import: copied from an allow-listed open dataset; crawl: read directly from a page; llm_extraction: extracted from crawled text by a language model; manual: entered by a reviewer; owner_submitted: supplied by the business owner. | one of: `import`, `crawl`, `llm_extraction`, `manual`, `owner_submitted` | no |
| [`field_provenance.*.confidence`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-field_provenance.*.confidence) | Probability (0-1) that the value is correct. Values of 0.85 or more may be merged without human review. | number; at least 0; at most 1 | no |
| [`field_provenance.*.sources`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-field_provenance.*.sources) | Where a fact came from. source_id must exist in the dataset's sources allow-list. | list of object; at least 1 entry | no |
| [`field_provenance.*.sources.source_id`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-field_provenance.*.sources.source_id) | Permanent, opaque identifier. Never reused, never derived from a name, never deleted. | text; at least 3 characters; at most 64 characters; format `^[a-z0-9_.-]+$` | yes |
| [`field_provenance.*.sources.url`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-field_provenance.*.sources.url) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`field_provenance.*.sources.retrieved_at`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-field_provenance.*.sources.retrieved_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | yes |
| [`field_provenance.*.checked_at`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#field-field_provenance.*.checked_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | no |

### File structure

| Field | What it means | Values | Required |
|---|---|---|---|
| [`$schema`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#file-$schema) | Canonical URL of the schema version this file follows. | text; format `^https://schema\.roastbook\.coffee/coffee-places/coffee-places\.schema\.v[0-9]+\.[0-9]+\.[0-9]+\.json$` | yes |
| [`meta`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#file-meta) | File metadata | object | yes |
| [`meta.version`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#file-meta.version) | Date tag YYYY.MM.DD.N; N counts releases on the same day, starting at 1. | text; format `^[0-9]{4}\.[0-9]{2}\.[0-9]{2}\.[1-9][0-9]*$` | yes |
| [`meta.generated_at`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#file-meta.generated_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | yes |
| [`meta.licence`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#file-meta.licence) | Licence of the data in this file. Always CC-BY-4.0. | exactly "CC-BY-4.0" | no |
| [`meta.attribution`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#file-meta.attribution) | Text to show when you reuse the data, normally "Roastbook Open Coffee". | text | no |
| [`meta.country_code`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#file-meta.country_code) | ISO 3166-1 alpha-2 code in upper case. | text; format `^[A-Z]{2}$` | yes |
| [`meta.city`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#file-meta.city) | City slug, matching the file name. | text; format `^[a-z0-9-]+$` | yes |
| [`meta.city_name`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#file-meta.city_name) | City name in the local language. | text | no |
| [`meta.schema_version`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#file-meta.schema_version) | Semantic version | text; format `^(0\|[1-9][0-9]*)\.(0\|[1-9][0-9]*)\.(0\|[1-9][0-9]*)$` | no |
| [`places`](https://schema.roastbook.coffee/coffee-places/v0.1.0/#file-places) | Coffee place Each entry is one Coffee place record (see above). | list of object | yes |

## Open Coffee brew methods

Family `brew-methods`, version 0.1.0. Ways of brewing coffee (espresso, pour-over, V60, AeroPress, cold brew…), their typical parameters and what a coffee journal should record for each. Methods form a tree: a device-specific method such as v60 has the general method pour-over as parent. Part of Roastbook Open Coffee.

Schema: <https://schema.roastbook.coffee/brew-methods/brew-methods.schema.v0.1.0.json> · Explorer: <https://schema.roastbook.coffee/brew-methods/v0.1.0/>

### Brew method record

| Field | What it means | Values | Required |
|---|---|---|---|
| [`id`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-id) | Stable readable slug, e.g. v60, french-press. Never reused. | text; at least 3 characters; at most 64 characters; format `^[a-z0-9_.-]+$` | yes |
| [`name`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-name) | Common English name of the method, for example Pour-over or French press. | text; at least 1 character | yes |
| [`aliases`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-aliases) | Other names in any language, e.g. Filterkaffee, drip. | list of text; at least 1 character; no duplicates | no |
| [`parent`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-parent) | The more general method, e.g. pour-over for v60. | text; at least 3 characters; at most 64 characters; format `^[a-z0-9_.-]+$` | no |
| [`category`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-category) | Family used for grouping: espresso (9-bar style pressure), filter (percolation through a filter), immersion (steep, then separate), pressure (non-espresso pressure such as AeroPress or moka pot), vacuum (siphon), boiling (cezve/ibrik), cold (cold water over hours). | one of: `espresso`, `filter`, `immersion`, `pressure`, `vacuum`, `boiling`, `cold` | yes |
| [`extraction`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-extraction) | Physical principle; matches equipment brewer.mechanism. | one of: `percolation`, `immersion`, `hybrid` | yes |
| [`description`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-description) | Short neutral explanation in our own words. | text; at least 20 characters; at most 600 characters | yes |
| [`introduced_year`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-introduced_year) | Year the method or device was invented or first sold. | whole number; at least 1000; at most 2100 | no |
| [`origin_country_code`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-origin_country_code) | ISO 3166-1 alpha-2 code in upper case. | text; format `^[A-Z]{2}$` | no |
| [`equipment_types`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-equipment_types) | Equipment types needed, from the equipment schema's type list. | list, each one of: `espresso_machine`, `espresso_machine_with_grinder`, `grinder`, `brewer`, `kettle`, `scale`, `tamper`, `wdt`, `basket`, `filter`, `roaster`, `milk_frother`, `accessory`; no duplicates | no |
| [`typical_parameters`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-typical_parameters) | Common starting ranges, not rules. Each value cites its source in field_provenance. | object | no |
| [`typical_parameters.dose_g`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-typical_parameters.dose_g) | Range | object; not empty | no |
| [`typical_parameters.dose_g.min`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-typical_parameters.dose_g.min) | Lowest common value, in the unit named by the parameter (for example grams for dose_g, degrees Celsius for water_temperature_celsius). | number; at least 0 | no |
| [`typical_parameters.dose_g.max`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-typical_parameters.dose_g.max) | Highest common value, in the unit named by the parameter. | number; at least 0 | no |
| [`typical_parameters.dose_g.typical`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-typical_parameters.dose_g.typical) | A good starting value, in the unit named by the parameter. | number; at least 0 | no |
| [`typical_parameters.ratio`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-typical_parameters.ratio) | Range | object; not empty | no |
| [`typical_parameters.ratio.min`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-typical_parameters.ratio.min) | Lowest common value, in the unit named by the parameter (for example grams for dose_g, degrees Celsius for water_temperature_celsius). | number; at least 0 | no |
| [`typical_parameters.ratio.max`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-typical_parameters.ratio.max) | Highest common value, in the unit named by the parameter. | number; at least 0 | no |
| [`typical_parameters.ratio.typical`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-typical_parameters.ratio.typical) | A good starting value, in the unit named by the parameter. | number; at least 0 | no |
| [`typical_parameters.water_temperature_celsius`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-typical_parameters.water_temperature_celsius) | Range | object; not empty | no |
| [`typical_parameters.water_temperature_celsius.min`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-typical_parameters.water_temperature_celsius.min) | Lowest common value, in the unit named by the parameter (for example grams for dose_g, degrees Celsius for water_temperature_celsius). | number; at least 0 | no |
| [`typical_parameters.water_temperature_celsius.max`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-typical_parameters.water_temperature_celsius.max) | Highest common value, in the unit named by the parameter. | number; at least 0 | no |
| [`typical_parameters.water_temperature_celsius.typical`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-typical_parameters.water_temperature_celsius.typical) | A good starting value, in the unit named by the parameter. | number; at least 0 | no |
| [`typical_parameters.brew_time_seconds`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-typical_parameters.brew_time_seconds) | Range | object; not empty | no |
| [`typical_parameters.brew_time_seconds.min`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-typical_parameters.brew_time_seconds.min) | Lowest common value, in the unit named by the parameter (for example grams for dose_g, degrees Celsius for water_temperature_celsius). | number; at least 0 | no |
| [`typical_parameters.brew_time_seconds.max`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-typical_parameters.brew_time_seconds.max) | Highest common value, in the unit named by the parameter. | number; at least 0 | no |
| [`typical_parameters.brew_time_seconds.typical`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-typical_parameters.brew_time_seconds.typical) | A good starting value, in the unit named by the parameter. | number; at least 0 | no |
| [`typical_parameters.brew_pressure_bar`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-typical_parameters.brew_pressure_bar) | Range | object; not empty | no |
| [`typical_parameters.brew_pressure_bar.min`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-typical_parameters.brew_pressure_bar.min) | Lowest common value, in the unit named by the parameter (for example grams for dose_g, degrees Celsius for water_temperature_celsius). | number; at least 0 | no |
| [`typical_parameters.brew_pressure_bar.max`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-typical_parameters.brew_pressure_bar.max) | Highest common value, in the unit named by the parameter. | number; at least 0 | no |
| [`typical_parameters.brew_pressure_bar.typical`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-typical_parameters.brew_pressure_bar.typical) | A good starting value, in the unit named by the parameter. | number; at least 0 | no |
| [`typical_parameters.grind_size`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-typical_parameters.grind_size) | Descriptive grind size; extra_fine is Turkish, fine espresso, medium filter, coarse French press and cold brew. | list, each one of: `extra_fine`, `fine`, `medium_fine`, `medium`, `medium_coarse`, `coarse`, `extra_coarse`; at least 1 entry; no duplicates | no |
| [`typical_parameters.grind_d50_microns`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-typical_parameters.grind_d50_microns) | Median particle size in micrometres, comparable across grinders. | object; not empty | no |
| [`typical_parameters.grind_d50_microns.min`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-typical_parameters.grind_d50_microns.min) | Lowest common value, in the unit named by the parameter (for example grams for dose_g, degrees Celsius for water_temperature_celsius). | number; at least 0 | no |
| [`typical_parameters.grind_d50_microns.max`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-typical_parameters.grind_d50_microns.max) | Highest common value, in the unit named by the parameter. | number; at least 0 | no |
| [`typical_parameters.grind_d50_microns.typical`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-typical_parameters.grind_d50_microns.typical) | A good starting value, in the unit named by the parameter. | number; at least 0 | no |
| [`recorded_parameters`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-recorded_parameters) | Parameters a coffee journal should offer when logging a brew with this method. | list, each one of: `dose_g`, `brew_water_g`, `yield_g`, `ratio`, `grind_setting`, `brew_time_seconds`, `target_time_seconds`, `water_temperature_celsius`, `bloom_time_seconds`, `bloom_water_g`, `preinfusion_time_seconds`, `preinfusion_pressure_bar`, `brew_pressure_bar`, `flow_rate_ml_per_second`, `tamp_force_kg`, `paper_filter_position`, `distribution_method`, `pour_count`, `steep_time_seconds`; no duplicates | no |
| [`typical_drinks`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-typical_drinks) | Drinks usually made with this method, in plain lowercase English, for example espresso, cappuccino or flat white. | list of text; at least 1 character; no duplicates | no |
| [`xref`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-xref) | Identifiers of the method in other datasets and apps. | object | no |
| [`xref.wikidata`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-xref.wikidata) | Wikidata item id of the method, for example Q180289 for espresso. | text; format `^Q[1-9][0-9]*$` | no |
| [`xref.beanconqueror`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-xref.beanconqueror) | Beanconqueror PREPARATION_TYPES key, for app imports. | text; format `^[A-Z0-9_]+$` | no |
| [`image`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-image) | An openly licensed image. Each image carries its own licence, author and source. | object | no |
| [`image.url`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-image.url) | Where the file is served from (our assets folder or the original host). | a full web address; format `^https?://` | yes |
| [`image.licence`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-image.licence) | SPDX identifier, for example CC-BY-4.0, CC-BY-SA-4.0 or CC0-1.0. | text; at least 2 characters | yes |
| [`image.author`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-image.author) | Name of the photographer or creator, as the licence requires it to be credited. | text; at least 1 character | yes |
| [`image.source_url`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-image.source_url) | Page describing the original file and its licence. | a full web address; format `^https?://` | yes |
| [`image.title`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-image.title) | Short caption describing what the image shows. | text | no |
| [`image.width`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-image.width) | Width of the image file in pixels. | whole number; at least 1 | no |
| [`image.height`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-image.height) | Height of the image file in pixels. | whole number; at least 1 | no |
| [`method`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-method) | How a value was obtained. import: copied from an allow-listed open dataset; crawl: read directly from a page; llm_extraction: extracted from crawled text by a language model; manual: entered by a reviewer; owner_submitted: supplied by the business owner. | one of: `import`, `crawl`, `llm_extraction`, `manual`, `owner_submitted` | no |
| [`confidence`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-confidence) | Probability (0-1) that the value is correct. Values of 0.85 or more may be merged without human review. | number; at least 0; at most 1 | no |
| [`sources`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-sources) | Where a fact came from. source_id must exist in the dataset's sources allow-list. | list of object; at least 1 entry | yes |
| [`sources.source_id`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-sources.source_id) | Permanent, opaque identifier. Never reused, never derived from a name, never deleted. | text; at least 3 characters; at most 64 characters; format `^[a-z0-9_.-]+$` | yes |
| [`sources.url`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-sources.url) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`sources.retrieved_at`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-sources.retrieved_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | yes |
| [`checked_at`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-checked_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | yes |
| [`field_provenance`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-field_provenance) | Keys are dotted field paths inside the record (for example opening_hours or serving.filter). | map of named entries; keys match `^[a-z_]+(\.[a-z_]+)*$` | no |
| [`field_provenance.*`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-field_provenance.*) | Overrides the record's default method and confidence for one field and names the sources for that value. | object; not empty | no |
| [`field_provenance.*.method`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-field_provenance.*.method) | How a value was obtained. import: copied from an allow-listed open dataset; crawl: read directly from a page; llm_extraction: extracted from crawled text by a language model; manual: entered by a reviewer; owner_submitted: supplied by the business owner. | one of: `import`, `crawl`, `llm_extraction`, `manual`, `owner_submitted` | no |
| [`field_provenance.*.confidence`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-field_provenance.*.confidence) | Probability (0-1) that the value is correct. Values of 0.85 or more may be merged without human review. | number; at least 0; at most 1 | no |
| [`field_provenance.*.sources`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-field_provenance.*.sources) | Where a fact came from. source_id must exist in the dataset's sources allow-list. | list of object; at least 1 entry | no |
| [`field_provenance.*.sources.source_id`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-field_provenance.*.sources.source_id) | Permanent, opaque identifier. Never reused, never derived from a name, never deleted. | text; at least 3 characters; at most 64 characters; format `^[a-z0-9_.-]+$` | yes |
| [`field_provenance.*.sources.url`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-field_provenance.*.sources.url) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`field_provenance.*.sources.retrieved_at`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-field_provenance.*.sources.retrieved_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | yes |
| [`field_provenance.*.checked_at`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-field_provenance.*.checked_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | no |
| [`filter_types`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#field-filter_types) | Filters the method can use. paper: paper filters; metal: metal mesh or perforated metal; cloth: cloth filters; none: no filter (for example cezve or cold brew in a jar). | list, each one of: `paper`, `metal`, `cloth`, `none`; no duplicates | no |

### File structure

| Field | What it means | Values | Required |
|---|---|---|---|
| [`$schema`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#file-$schema) | Canonical URL of the schema version this file follows. | text; format `^https://schema\.roastbook\.coffee/brew-methods/brew-methods\.schema\.v[0-9]+\.[0-9]+\.[0-9]+\.json$` | yes |
| [`meta`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#file-meta) | Dataset metadata | object | yes |
| [`meta.version`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#file-meta.version) | Date tag YYYY.MM.DD.N; N counts releases on the same day, starting at 1. | text; format `^[0-9]{4}\.[0-9]{2}\.[0-9]{2}\.[1-9][0-9]*$` | yes |
| [`meta.generated_at`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#file-meta.generated_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | yes |
| [`meta.licence`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#file-meta.licence) | Licence of the data in this file. Always CC-BY-4.0. | exactly "CC-BY-4.0" | no |
| [`meta.attribution`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#file-meta.attribution) | Text to show when you reuse the data, normally "Roastbook Open Coffee". | text | no |
| [`brew_methods`](https://schema.roastbook.coffee/brew-methods/v0.1.0/#file-brew_methods) | Brew method Each entry is one Brew method record (see above). | list of object | yes |

## Open Coffee equipment catalog

Family `equipment`, version 0.1.0. Coffee equipment models (machines, grinders, brewers, kettles, scales and accessories) as sold, not individual owned items. Measurements put the unit in the property name. Part of Roastbook Open Coffee; derived from the Roastbook journal gear model.

Schema: <https://schema.roastbook.coffee/equipment/equipment.schema.v0.1.0.json> · Explorer: <https://schema.roastbook.coffee/equipment/v0.1.0/>

### Equipment model record

| Field | What it means | Values | Required |
|---|---|---|---|
| [`id`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-id) | Stable readable slug of manufacturer and model, e.g. hario-v60-02. Never reused. | text; at least 3 characters; at most 64 characters; format `^[a-z0-9_.-]+$` | yes |
| [`name`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-name) | Full display name, e.g. Hario V60 02. | text; at least 1 character | yes |
| [`manufacturer`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-manufacturer) | Manufacturer | object | yes |
| [`manufacturer.name`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-manufacturer.name) | Brand or company name as printed on the product, for example Hario. | text; at least 1 character | yes |
| [`manufacturer.manufacturer_id`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-manufacturer.manufacturer_id) | Reserved for a future manufacturers dataset. | text; at least 3 characters; at most 64 characters; format `^[a-z0-9_.-]+$` | no |
| [`manufacturer.country_code`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-manufacturer.country_code) | ISO 3166-1 alpha-2 code in upper case. | text; format `^[A-Z]{2}$` | no |
| [`manufacturer.website`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-manufacturer.website) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`model`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-model) | Model name without the brand, for example V60. | text; at least 1 character | no |
| [`variants`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-variants) | Sizes or materials sold under the same model, e.g. 01 and 02, ceramic and plastic. | list of text; at least 1 character | no |
| [`type`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-type) | espresso_machine_with_grinder is an espresso machine with a built-in grinder; filter covers paper and metal filters; accessory covers everything without a dedicated type (puck screens, distribution tools, thermometers, dosing cups). | one of: `espresso_machine`, `espresso_machine_with_grinder`, `grinder`, `brewer`, `kettle`, `scale`, `tamper`, `wdt`, `basket`, `filter`, `roaster`, `milk_frother`, `accessory` | yes |
| [`brew_methods`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-brew_methods) | Brew method ids from the Open Coffee brew methods dataset this equipment is made for. | list of text; at least 3 characters; at most 64 characters; no duplicates; format `^[a-z0-9_.-]+$` | no |
| [`released_year`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-released_year) | Year the model first went on sale. | whole number; at least 1800; at most 2100 | no |
| [`discontinued`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-discontinued) | Whether the maker has stopped selling the model. true: discontinued; false: still sold; absent: unknown. | yes/no | no |
| [`links`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-links) | Links | object | no |
| [`links.product`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-links.product) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`links.manual`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-links.manual) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`image`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-image) | An openly licensed image. Each image carries its own licence, author and source. | object | no |
| [`image.url`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-image.url) | Where the file is served from (our assets folder or the original host). | a full web address; format `^https?://` | yes |
| [`image.licence`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-image.licence) | SPDX identifier, for example CC-BY-4.0, CC-BY-SA-4.0 or CC0-1.0. | text; at least 2 characters | yes |
| [`image.author`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-image.author) | Name of the photographer or creator, as the licence requires it to be credited. | text; at least 1 character | yes |
| [`image.source_url`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-image.source_url) | Page describing the original file and its licence. | a full web address; format `^https?://` | yes |
| [`image.title`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-image.title) | Short caption describing what the image shows. | text | no |
| [`image.width`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-image.width) | Width of the image file in pixels. | whole number; at least 1 | no |
| [`image.height`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-image.height) | Height of the image file in pixels. | whole number; at least 1 | no |
| [`xref`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-xref) | Identifiers elsewhere | object | no |
| [`xref.wikidata`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-xref.wikidata) | Wikidata item id of the model or product line, for example Q1234567. | text; format `^Q[1-9][0-9]*$` | no |
| [`xref.gtin`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-xref.gtin) | Barcode numbers (GTIN, EAN or UPC; 8 to 14 digits) printed on the packaging, one per variant. | list of text; format `^[0-9]{8,14}$` | no |
| [`xref.google_product_category`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-xref.google_product_category) | Google Product Taxonomy id (Wikidata P11302). | whole number; at least 1 | no |
| [`xref.gs1_gpc_brick`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-xref.gs1_gpc_brick) | GS1 Global Product Classification brick code (Wikidata P8957). | text; format `^[0-9]{8}$` | no |
| [`espresso_machine`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-espresso_machine) | Espresso machine details Not allowed when type is one of "grinder", "brewer", "kettle", "scale", "tamper", "wdt", "basket", "filter", "roaster", "milk_frother", "accessory". | object | no |
| [`espresso_machine.heating_architecture`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-espresso_machine.heating_architecture) | How the machine heats water. single_boiler: one boiler for brewing and steam, used in turn; heat_exchanger: one steam boiler that heats brew water passing through a pipe inside it; dual_boiler: separate brew and steam boilers; multi_boiler: more than two boilers, for example one per group; single_thermoblock and dual_thermoblock: water heated on the fly in one or two thermoblocks; hybrid: a boiler combined with a thermoblock; manual: no heater, you pour in hot water. | one of: `single_boiler`, `heat_exchanger`, `dual_boiler`, `multi_boiler`, `single_thermoblock`, `dual_thermoblock`, `hybrid`, `manual`, `other` | no |
| [`espresso_machine.temperature_control`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-espresso_machine.temperature_control) | How brew temperature is set. none: no control; fixed: set at the factory; adjustable: the user can change it (for example with a PID); programmable: can change during the shot or follow profiles. | one of: `none`, `fixed`, `adjustable`, `programmable` | no |
| [`espresso_machine.pressure_control`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-espresso_machine.pressure_control) | How brew pressure is set. fixed: set by the factory; adjustable_opv: the over-pressure valve can be adjusted; manual: controlled by hand, for example with a lever; programmable: follows set pressure profiles. | one of: `fixed`, `adjustable_opv`, `manual`, `programmable` | no |
| [`espresso_machine.flow_control`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-espresso_machine.flow_control) | Whether water flow during the shot can be controlled. none: no control; manual: by hand, for example a needle valve paddle; programmable: follows set profiles. | one of: `none`, `manual`, `programmable` | no |
| [`espresso_machine.preinfusion_control`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-espresso_machine.preinfusion_control) | Wetting the coffee at low pressure before full pressure. none: no preinfusion; supported: possible by hand or by technique; fixed: built in with a fixed duration; adjustable: duration or pressure can be set; programmable: part of a programmable profile. | one of: `none`, `supported`, `fixed`, `adjustable`, `programmable` | no |
| [`espresso_machine.steam_system`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-espresso_machine.steam_system) | How milk steam is produced. none: no steam wand; shared_heater: the same heater as for brewing, so the machine switches between modes; dedicated_heater: a separate boiler or thermoblock for steam. | one of: `none`, `shared_heater`, `dedicated_heater` | no |
| [`espresso_machine.simultaneous_brew_and_steam`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-espresso_machine.simultaneous_brew_and_steam) | Whether you can pull a shot and steam milk at the same time. true: possible; false: confirmed not possible; absent: unknown. | yes/no | no |
| [`espresso_machine.pump_type`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-espresso_machine.pump_type) | How pressure is made. vibration: small vibratory pump; rotary: quieter rotary vane pump; gear: gear pump, often used for flow profiling; peristaltic: squeezed-tube pump; manual: lever or hand pump, no motor. | one of: `vibration`, `rotary`, `gear`, `peristaltic`, `manual`, `other` | no |
| [`espresso_machine.water_source_modes`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-espresso_machine.water_source_modes) | Where water comes from. reservoir: a tank you fill; plumbed: connected to the mains water supply. | list, each one of: `reservoir`, `plumbed`; at least 1 entry; no duplicates | no |
| [`espresso_machine.shot_stop_modes`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-espresso_machine.shot_stop_modes) | How a shot can be stopped. manual: by the user; weight: automatically at a target weight with a scale; time: after a set time; volume: after a set volume (volumetric dosing). | list, each one of: `manual`, `weight`, `time`, `volume`; no duplicates | no |
| [`espresso_machine.group_count`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-espresso_machine.group_count) | Number of brew groups (where portafilters lock in), for example 1 for most home machines. | whole number; at least 1 | no |
| [`espresso_machine.portafilter_diameter_mm`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-espresso_machine.portafilter_diameter_mm) | Inner diameter of the portafilter basket in millimetres, for example 58. | number; more than 0 | no |
| [`espresso_machine.brew_pressure_min_bar`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-espresso_machine.brew_pressure_min_bar) | Lowest brew pressure the machine can deliver, in bar. | number; more than 0 | no |
| [`espresso_machine.brew_pressure_max_bar`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-espresso_machine.brew_pressure_max_bar) | Highest brew pressure the machine can deliver, in bar. | number; more than 0 | no |
| [`espresso_machine.brew_temperature_min_celsius`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-espresso_machine.brew_temperature_min_celsius) | Lowest brew water temperature that can be set, in degrees Celsius. | number; more than 0 | no |
| [`espresso_machine.brew_temperature_max_celsius`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-espresso_machine.brew_temperature_max_celsius) | Highest brew water temperature that can be set, in degrees Celsius. | number; more than 0 | no |
| [`espresso_machine.reservoir_capacity_ml`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-espresso_machine.reservoir_capacity_ml) | Size of the water tank in millilitres. | number; more than 0 | no |
| [`espresso_machine.power_w`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-espresso_machine.power_w) | Rated electrical power in watts. | number; more than 0 | no |
| [`espresso_machine.group_type`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-espresso_machine.group_type) | Type of brew group. e61: the classic heated E61 group; saturated: group filled with boiler water and kept at its temperature; semi_saturated: group attached to the boiler but not fully filled; lever: piston group driven by a lever; integrated: group built into a thermoblock or the machine body; other: anything else. | one of: `e61`, `saturated`, `semi_saturated`, `lever`, `integrated`, `other` | no |
| [`espresso_machine.boiler_count`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-espresso_machine.boiler_count) | Number of boilers, 0 for thermoblock or manual machines. | whole number; at least 0 | no |
| [`espresso_machine.connectivity`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-espresso_machine.connectivity) | Wireless or wired connections for apps or updates: bluetooth, wifi or usb. | list, each one of: `bluetooth`, `wifi`, `usb`; no duplicates | no |
| [`grinder`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-grinder) | Grinder details Not allowed when type is one of "espresso_machine", "brewer", "kettle", "scale", "tamper", "wdt", "basket", "filter", "roaster", "milk_frother", "accessory". | object | no |
| [`grinder.burr_mechanism`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-grinder.burr_mechanism) | Type of cutting parts. conical: cone-shaped burrs; flat: two flat discs; ghost: flat burrs in a design without a burr carrier contact, sold as "ghost burrs"; roller: industrial-style roller mill; blade: spinning blade that chops rather than grinds; other: anything else. | one of: `conical`, `flat`, `ghost`, `roller`, `blade`, `other` | no |
| [`grinder.burr_diameter_mm`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-grinder.burr_diameter_mm) | Diameter of the burrs in millimetres, for example 64 for many flat-burr grinders. | number; more than 0 | no |
| [`grinder.burr_material`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-grinder.burr_material) | What the burrs are made of. steel: hardened steel; ceramic: ceramic burrs; titanium_coated: steel with a titanium or similar hard coating; other: anything else. | one of: `steel`, `ceramic`, `titanium_coated`, `other` | no |
| [`grinder.adjustment_type`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-grinder.adjustment_type) | How grind size is changed. fixed: cannot be changed; stepped: clicks between set positions; stepless: any position in between. | one of: `fixed`, `stepped`, `stepless` | no |
| [`grinder.grind_setting_format`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-grinder.grind_setting_format) | How the dial reads, so journals can store settings. | one of: `whole_number`, `decimal`, `string` | no |
| [`grinder.grind_setting_min`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-grinder.grind_setting_min) | Lowest number on the grind dial, as printed by the maker. | number | no |
| [`grinder.grind_setting_max`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-grinder.grind_setting_max) | Highest number on the grind dial, as printed by the maker. | number | no |
| [`grinder.brew_range`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-grinder.brew_range) | Brew styles the grinder can grind for, as stated by the maker: espresso, filter or turkish (extra fine). | list, each one of: `espresso`, `filter`, `turkish`; at least 1 entry; no duplicates | no |
| [`grinder.bean_feed`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-grinder.bean_feed) | How beans go in. single_dose: weighed dose for each brew; hopper: a container holding beans for many brews; both: works either way. | one of: `single_dose`, `hopper`, `both` | no |
| [`grinder.dose_control_modes`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-grinder.dose_control_modes) | How the amount of ground coffee is controlled. manual: the user stops grinding; time: grinds for a set time; weight: stops at a target weight with a built-in scale. | list, each one of: `manual`, `time`, `weight`; no duplicates | no |
| [`grinder.drive`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-grinder.drive) | manual: turned by hand; electric: driven by a motor. | one of: `manual`, `electric` | no |
| [`grinder.motor_power_w`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-grinder.motor_power_w) | Rated motor power in watts. | number; more than 0 | no |
| [`grinder.grind_setting_step`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-grinder.grind_setting_step) | Smallest step between settings on a stepped dial. | number; more than 0 | no |
| [`grinder.microns_per_step`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-grinder.microns_per_step) | Burr gap change per setting step, as stated by the maker or measured. | number; more than 0 | no |
| [`grinder.retention_g`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-grinder.retention_g) | Ground coffee left inside the grinder after grinding, in grams, as measured or stated by the maker. | number; at least 0 | no |
| [`grinder.rpm_min`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-grinder.rpm_min) | Lowest motor speed in revolutions per minute. | number; more than 0 | no |
| [`grinder.rpm_max`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-grinder.rpm_max) | Highest motor speed in revolutions per minute. Equal to rpm_min for fixed-speed grinders. | number; more than 0 | no |
| [`brewer`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-brewer) | Brewer details Not allowed when type is one of "espresso_machine", "espresso_machine_with_grinder", "grinder", "kettle", "scale", "tamper", "wdt", "basket", "filter", "roaster", "milk_frother", "accessory". | object | no |
| [`brewer.mechanism`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-brewer.mechanism) | How water and coffee meet; matches brew method categories. | one of: `percolation`, `immersion`, `hybrid`, `press`, `vacuum`, `boiling`, `other` | no |
| [`brewer.capacity_ml`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-brewer.capacity_ml) | Largest amount of brewed coffee it holds or makes at once, in millilitres. | number; more than 0 | no |
| [`brewer.cup_capacity`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-brewer.cup_capacity) | Nominal number of cups the maker states. | whole number; at least 1 | no |
| [`brewer.material`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-brewer.material) | What the brewer is made of; list every material sold under this model, such as ceramic and plastic. | list, each one of: `ceramic`, `glass`, `plastic`, `stainless_steel`, `copper`, `aluminium`, `porcelain`, `wood`, `silicone`, `other`; no duplicates | no |
| [`brewer.filter_format`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-brewer.filter_format) | Filter shape or size, e.g. cone_02, flat_185, chemex_6cup, aeropress_round, metal_mesh. | text; format `^[a-z0-9_-]+$` | no |
| [`brewer.filter_shape`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-brewer.filter_shape) | Shape of the filter it uses. cone: pointed cone; flat_bottom: flat base, for example wave filters; basket: basket-shaped paper filter used in drip machines; disc: round disc, as in AeroPress; none: no separate filter. | one of: `cone`, `flat_bottom`, `basket`, `disc`, `none` | no |
| [`brewer.flow_control`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-brewer.flow_control) | How fast water drains. fixed: set by the design; manual_valve: a valve or switch you open and close; programmable: controlled by the machine. | one of: `fixed`, `manual_valve`, `programmable` | no |
| [`brewer.drive`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-brewer.drive) | manual: you pour or press by hand; electric: a machine heats and pours the water; stovetop: heated on a hob, such as a moka pot. | one of: `manual`, `electric`, `stovetop` | no |
| [`kettle`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-kettle) | Kettle details Not allowed when type is one of "espresso_machine", "espresso_machine_with_grinder", "grinder", "brewer", "scale", "tamper", "wdt", "basket", "filter", "roaster", "milk_frother", "accessory". | object | no |
| [`kettle.capacity_ml`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-kettle.capacity_ml) | Largest amount of water it holds, in millilitres. | number; more than 0 | no |
| [`kettle.spout_type`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-kettle.spout_type) | gooseneck: thin curved spout for a slow, precise pour; standard: ordinary spout; other: anything else. | one of: `gooseneck`, `standard`, `other` | no |
| [`kettle.temperature_control`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-kettle.temperature_control) | none: just boils; fixed: a few preset temperatures; adjustable: any temperature in a range can be set. | one of: `none`, `fixed`, `adjustable` | no |
| [`kettle.temperature_min_celsius`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-kettle.temperature_min_celsius) | Lowest temperature that can be set, in degrees Celsius. | number; more than 0 | no |
| [`kettle.temperature_max_celsius`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-kettle.temperature_max_celsius) | Highest temperature that can be set, in degrees Celsius. | number; more than 0 | no |
| [`kettle.supports_temperature_hold`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-kettle.supports_temperature_hold) | Whether the kettle can keep water at the set temperature. true: can hold; false: confirmed cannot hold; absent: unknown. | yes/no | no |
| [`kettle.heat_source`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-kettle.heat_source) | electric: has its own heating base; stovetop: heated on a hob; induction_compatible: stovetop kettle that also works on induction hobs; other: anything else. | one of: `electric`, `stovetop`, `induction_compatible`, `other` | no |
| [`scale`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-scale) | Scale details Not allowed when type is one of "espresso_machine", "espresso_machine_with_grinder", "grinder", "brewer", "kettle", "tamper", "wdt", "basket", "filter", "roaster", "milk_frother", "accessory". | object | no |
| [`scale.resolution_g`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-scale.resolution_g) | Smallest weight step the display shows, in grams, for example 0.1. | number; more than 0 | no |
| [`scale.capacity_g`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-scale.capacity_g) | Largest weight the scale can measure, in grams. | number; more than 0 | no |
| [`scale.has_timer`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-scale.has_timer) | Built-in timer. true: has one; false: confirmed none; absent: unknown. | yes/no | no |
| [`scale.supports_auto_tare`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-scale.supports_auto_tare) | Sets itself to zero when a cup or brewer is put on. true: supported; false: confirmed not supported; absent: unknown. | yes/no | no |
| [`scale.supports_auto_timer`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-scale.supports_auto_timer) | Starts the timer by itself when liquid starts to flow or water is poured. true: supported; false: confirmed not supported; absent: unknown. | yes/no | no |
| [`scale.has_flow_rate_display`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-scale.has_flow_rate_display) | Shows how fast weight changes, in grams per second. true: shown; false: confirmed not shown; absent: unknown. | yes/no | no |
| [`scale.connectivity`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-scale.connectivity) | Wireless or wired connections to apps or machines: bluetooth, wifi or usb. | list, each one of: `bluetooth`, `wifi`, `usb`; no duplicates | no |
| [`tamper`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-tamper) | Tamper details Not allowed when type is one of "espresso_machine", "espresso_machine_with_grinder", "grinder", "brewer", "kettle", "scale", "wdt", "basket", "filter", "roaster", "milk_frother", "accessory". | object | no |
| [`tamper.diameter_mm`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-tamper.diameter_mm) | Diameter of the tamper base in millimetres, for example 58. | number; more than 0 | no |
| [`tamper.force_control`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-tamper.force_control) | none: the user decides how hard to press; fixed: a spring gives a set force; adjustable: the spring force can be set. | one of: `none`, `fixed`, `adjustable` | no |
| [`tamper.base_shape`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-tamper.base_shape) | Shape of the pressing surface. flat; convex: slightly curved outward; rippled: grooved surface; other: anything else. | one of: `flat`, `convex`, `rippled`, `other` | no |
| [`tamper.self_leveling`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-tamper.self_leveling) | Whether the tamper sits on the basket rim so it always presses level. true: self-levelling; false: confirmed not self-levelling; absent: unknown. | yes/no | no |
| [`wdt`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-wdt) | WDT tool details Not allowed when type is one of "espresso_machine", "espresso_machine_with_grinder", "grinder", "brewer", "kettle", "scale", "tamper", "basket", "filter", "roaster", "milk_frother", "accessory". | object | no |
| [`wdt.needle_diameter_mm`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-wdt.needle_diameter_mm) | Thickness of each needle in millimetres, for example 0.3. | number; more than 0 | no |
| [`wdt.needle_count`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-wdt.needle_count) | Number of needles. | whole number; at least 1 | no |
| [`wdt.depth_control`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-wdt.depth_control) | Whether you can limit how deep the needles reach. none: no limit; fixed: set depth; adjustable: depth can be set. | one of: `none`, `fixed`, `adjustable` | no |
| [`basket`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-basket) | Portafilter basket details Not allowed when type is one of "espresso_machine", "espresso_machine_with_grinder", "grinder", "brewer", "kettle", "scale", "tamper", "wdt", "filter", "roaster", "milk_frother", "accessory". | object | no |
| [`basket.kind`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-basket.kind) | single, double or triple: the shot size the basket is made for; other: anything else. | one of: `single`, `double`, `triple`, `other` | no |
| [`basket.diameter_mm`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-basket.diameter_mm) | Diameter of the basket in millimetres, for example 58. | number; more than 0 | no |
| [`basket.nominal_dose_g`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-basket.nominal_dose_g) | Dose of ground coffee the basket is designed for, in grams. | number; more than 0 | no |
| [`basket.dose_min_g`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-basket.dose_min_g) | Smallest recommended dose in grams. | number; more than 0 | no |
| [`basket.dose_max_g`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-basket.dose_max_g) | Largest recommended dose in grams. | number; more than 0 | no |
| [`basket.pressurized`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-basket.pressurized) | A pressurised basket has a single small exit hole that builds pressure even with a coarse grind. true: pressurised; false: standard unpressurised basket; absent: unknown. | yes/no | no |
| [`basket.precision`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-basket.precision) | A precision basket has tightly controlled hole sizes, sold for consistent extraction. true: precision basket; false: ordinary basket; absent: unknown. | yes/no | no |
| [`method`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-method) | How a value was obtained. import: copied from an allow-listed open dataset; crawl: read directly from a page; llm_extraction: extracted from crawled text by a language model; manual: entered by a reviewer; owner_submitted: supplied by the business owner. | one of: `import`, `crawl`, `llm_extraction`, `manual`, `owner_submitted` | no |
| [`confidence`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-confidence) | Probability (0-1) that the value is correct. Values of 0.85 or more may be merged without human review. | number; at least 0; at most 1 | no |
| [`sources`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-sources) | Where a fact came from. source_id must exist in the dataset's sources allow-list. | list of object; at least 1 entry | yes |
| [`sources.source_id`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-sources.source_id) | Permanent, opaque identifier. Never reused, never derived from a name, never deleted. | text; at least 3 characters; at most 64 characters; format `^[a-z0-9_.-]+$` | yes |
| [`sources.url`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-sources.url) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`sources.retrieved_at`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-sources.retrieved_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | yes |
| [`checked_at`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-checked_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | yes |
| [`field_provenance`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-field_provenance) | Keys are dotted field paths inside the record (for example opening_hours or serving.filter). | map of named entries; keys match `^[a-z_]+(\.[a-z_]+)*$` | no |
| [`field_provenance.*`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-field_provenance.*) | Overrides the record's default method and confidence for one field and names the sources for that value. | object; not empty | no |
| [`field_provenance.*.method`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-field_provenance.*.method) | How a value was obtained. import: copied from an allow-listed open dataset; crawl: read directly from a page; llm_extraction: extracted from crawled text by a language model; manual: entered by a reviewer; owner_submitted: supplied by the business owner. | one of: `import`, `crawl`, `llm_extraction`, `manual`, `owner_submitted` | no |
| [`field_provenance.*.confidence`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-field_provenance.*.confidence) | Probability (0-1) that the value is correct. Values of 0.85 or more may be merged without human review. | number; at least 0; at most 1 | no |
| [`field_provenance.*.sources`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-field_provenance.*.sources) | Where a fact came from. source_id must exist in the dataset's sources allow-list. | list of object; at least 1 entry | no |
| [`field_provenance.*.sources.source_id`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-field_provenance.*.sources.source_id) | Permanent, opaque identifier. Never reused, never derived from a name, never deleted. | text; at least 3 characters; at most 64 characters; format `^[a-z0-9_.-]+$` | yes |
| [`field_provenance.*.sources.url`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-field_provenance.*.sources.url) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`field_provenance.*.sources.retrieved_at`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-field_provenance.*.sources.retrieved_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | yes |
| [`field_provenance.*.checked_at`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-field_provenance.*.checked_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | no |
| [`mpn`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-mpn) | Manufacturer part number. | text; at least 1 character | no |
| [`weight_g`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-weight_g) | Weight of the product without packaging, in grams. | number; more than 0 | no |
| [`dimensions_mm`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-dimensions_mm) | Outside size of the product in millimetres. | object | no |
| [`dimensions_mm.width`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-dimensions_mm.width) | Width in millimetres, seen from the front. | number; more than 0 | no |
| [`dimensions_mm.depth`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-dimensions_mm.depth) | Depth in millimetres, from front to back. | number; more than 0 | no |
| [`dimensions_mm.height`](https://schema.roastbook.coffee/equipment/v0.1.0/#field-dimensions_mm.height) | Height in millimetres. | number; more than 0 | no |

### File structure

| Field | What it means | Values | Required |
|---|---|---|---|
| [`$schema`](https://schema.roastbook.coffee/equipment/v0.1.0/#file-$schema) | Canonical URL of the schema version this file follows. | text; format `^https://schema\.roastbook\.coffee/equipment/equipment\.schema\.v[0-9]+\.[0-9]+\.[0-9]+\.json$` | yes |
| [`meta`](https://schema.roastbook.coffee/equipment/v0.1.0/#file-meta) | Dataset metadata | object | yes |
| [`meta.version`](https://schema.roastbook.coffee/equipment/v0.1.0/#file-meta.version) | Date tag YYYY.MM.DD.N; N counts releases on the same day, starting at 1. | text; format `^[0-9]{4}\.[0-9]{2}\.[0-9]{2}\.[1-9][0-9]*$` | yes |
| [`meta.generated_at`](https://schema.roastbook.coffee/equipment/v0.1.0/#file-meta.generated_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | yes |
| [`meta.licence`](https://schema.roastbook.coffee/equipment/v0.1.0/#file-meta.licence) | Licence of the data in this file. Always CC-BY-4.0. | exactly "CC-BY-4.0" | no |
| [`meta.attribution`](https://schema.roastbook.coffee/equipment/v0.1.0/#file-meta.attribution) | Text to show when you reuse the data, normally "Roastbook Open Coffee". | text | no |
| [`equipment`](https://schema.roastbook.coffee/equipment/v0.1.0/#file-equipment) | Equipment model Each entry is one Equipment model record (see above). | list of object | yes |

## Open Coffee source allow-list

Family `sources`, version 0.1.0. Every source a record may cite. Adding or changing an entry is a human-reviewed pull request.

Schema: <https://schema.roastbook.coffee/sources/sources.schema.v0.1.0.json> · Explorer: <https://schema.roastbook.coffee/sources/v0.1.0/>

### sources record

| Field | What it means | Values | Required |
|---|---|---|---|
| [`id`](https://schema.roastbook.coffee/sources/v0.1.0/#field-id) | Permanent, opaque identifier. Never reused, never derived from a name, never deleted. | text; at least 3 characters; at most 64 characters; format `^[a-z0-9_.-]+$` | yes |
| [`name`](https://schema.roastbook.coffee/sources/v0.1.0/#field-name) | Full name of the source, for example Foursquare Open Source Places. | text; at least 1 character | yes |
| [`kind`](https://schema.roastbook.coffee/sources/v0.1.0/#field-kind) | What sort of source it is. open_dataset: openly licensed bulk data; roaster_page: a roaster's list of cafés serving its coffee; primary_website: the place's or company's own website; social_profile: its own social media profile; web_search: a search engine, for finding pages only; open_knowledge: Wikidata and similar; image_repository: openly licensed images such as Wikimedia Commons; community: submissions from owners and contributors; verification_api: an API used only to confirm a known place; manufacturer_page: an equipment maker's own pages; retailer_page: a shop's product pages; standards_body: a standards organisation or association. | one of: `open_dataset`, `roaster_page`, `primary_website`, `social_profile`, `web_search`, `open_knowledge`, `image_repository`, `community`, `verification_api`, `manufacturer_page`, `retailer_page`, `standards_body` | yes |
| [`url`](https://schema.roastbook.coffee/sources/v0.1.0/#field-url) | Absolute http or https URL. | a full web address; format `^https?://` | no |
| [`licence`](https://schema.roastbook.coffee/sources/v0.1.0/#field-licence) | SPDX identifier, or a short statement such as 'facts only, no copyright claimed'. | text; at least 1 character | yes |
| [`attribution`](https://schema.roastbook.coffee/sources/v0.1.0/#field-attribution) | Attribution text that must accompany data derived from this source. | text | no |
| [`allowed_for`](https://schema.roastbook.coffee/sources/v0.1.0/#field-allowed_for) | What the source may be used for. discovery: finding candidates; facts: values we store; images: photos with their licence; verification: confirming a place exists, without storing its data. | list, each one of: `discovery`, `facts`, `images`, `verification`; at least 1 entry; no duplicates | yes |
| [`how_to_use`](https://schema.roastbook.coffee/sources/v0.1.0/#field-how_to_use) | Instructions for people and the data agent: what to take from the source, what to leave out and which licence conditions to follow. | text; at least 10 characters | yes |
| [`vetted`](https://schema.roastbook.coffee/sources/v0.1.0/#field-vetted) | A maintainer checked the licence and terms. | yes/no | yes |
| [`checked_at`](https://schema.roastbook.coffee/sources/v0.1.0/#field-checked_at) | Calendar date, YYYY-MM-DD. | a date like 2026-11-05 | yes |

### File structure

| Field | What it means | Values | Required |
|---|---|---|---|
| [`$schema`](https://schema.roastbook.coffee/sources/v0.1.0/#file-$schema) | Canonical URL of the schema version this file follows. | text; format `^https://schema\.roastbook\.coffee/sources/sources\.schema\.v[0-9]+\.[0-9]+\.[0-9]+\.json$` | yes |
| [`meta`](https://schema.roastbook.coffee/sources/v0.1.0/#file-meta) | Dataset metadata | object | yes |
| [`meta.version`](https://schema.roastbook.coffee/sources/v0.1.0/#file-meta.version) | Date tag YYYY.MM.DD.N; N counts releases on the same day, starting at 1. | text; format `^[0-9]{4}\.[0-9]{2}\.[0-9]{2}\.[1-9][0-9]*$` | yes |
| [`meta.generated_at`](https://schema.roastbook.coffee/sources/v0.1.0/#file-meta.generated_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | yes |
| [`meta.licence`](https://schema.roastbook.coffee/sources/v0.1.0/#file-meta.licence) | Licence of the data in this file. Always CC-BY-4.0. | exactly "CC-BY-4.0" | no |
| [`meta.attribution`](https://schema.roastbook.coffee/sources/v0.1.0/#file-meta.attribution) | Text to show when you reuse the data, normally "Roastbook Open Coffee". | text | no |
| [`sources`](https://schema.roastbook.coffee/sources/v0.1.0/#file-sources) | The allow-listed sources. A record may only cite a source_id listed here. Each entry is one sources record (see above). | list of object; at least 1 entry | yes |

## Open Coffee translations

Family `translations`, version 0.1.0. Translated text fields for one dataset file, keyed by record id. Untranslated records fall back to the base file.

Schema: <https://schema.roastbook.coffee/translations/translations.schema.v0.1.0.json> · Explorer: <https://schema.roastbook.coffee/translations/v0.1.0/>

### File structure

| Field | What it means | Values | Required |
|---|---|---|---|
| [`$schema`](https://schema.roastbook.coffee/translations/v0.1.0/#field-$schema) | Canonical URL of the schema version this file follows. | text; format `^https://schema\.roastbook\.coffee/translations/translations\.schema\.v[0-9]+\.[0-9]+\.[0-9]+\.json$` | yes |
| [`meta`](https://schema.roastbook.coffee/translations/v0.1.0/#field-meta) | Information about the file: dataset version, generation time, licence, language and the base file it translates. | object | yes |
| [`meta.version`](https://schema.roastbook.coffee/translations/v0.1.0/#field-meta.version) | Date tag YYYY.MM.DD.N; N counts releases on the same day, starting at 1. | text; format `^[0-9]{4}\.[0-9]{2}\.[0-9]{2}\.[1-9][0-9]*$` | yes |
| [`meta.generated_at`](https://schema.roastbook.coffee/translations/v0.1.0/#field-meta.generated_at) | RFC 3339 timestamp with time zone, for example 2026-11-05T14:00:00Z. | a timestamp with time zone like 2026-11-05T14:00:00Z | yes |
| [`meta.licence`](https://schema.roastbook.coffee/translations/v0.1.0/#field-meta.licence) | Licence of the data in this file. Always CC-BY-4.0. | exactly "CC-BY-4.0" | no |
| [`meta.attribution`](https://schema.roastbook.coffee/translations/v0.1.0/#field-meta.attribution) | Text to show when you reuse the data, normally "Roastbook Open Coffee". | text | no |
| [`meta.locale`](https://schema.roastbook.coffee/translations/v0.1.0/#field-meta.locale) | Language of the translations, as a code such as de or de-AT. | text; format `^[a-z]{2}(-[A-Z]{2})?$` | yes |
| [`meta.base`](https://schema.roastbook.coffee/translations/v0.1.0/#field-meta.base) | Path of the base dataset file, for example datasets/coffee-places/de/munich.json. | text | yes |
| [`entries`](https://schema.roastbook.coffee/translations/v0.1.0/#field-entries) | Translations keyed by the record id they belong to, for example cp-7k2m9x4qvd. | map of named entries; keys match `^[a-z0-9_.-]+$` | yes |
| [`entries.*`](https://schema.roastbook.coffee/translations/v0.1.0/#field-entries.*) | Translated texts for one record. Fields left out fall back to the base file. | object; not empty | no |
| [`entries.*.name`](https://schema.roastbook.coffee/translations/v0.1.0/#field-entries.*.name) | The record's name in this language, only when it is really used locally. | text; at least 1 character | no |
| [`entries.*.description`](https://schema.roastbook.coffee/translations/v0.1.0/#field-entries.*.description) | Translation of the record's description into this language. | text; at least 20 characters; at most 600 characters | no |

