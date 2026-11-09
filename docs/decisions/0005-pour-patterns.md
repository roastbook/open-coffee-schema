# 0005: Pour patterns family

Status: accepted (2026-11-09)

Pour-over brews differ less in their amounts than in how the water goes on. The **pour patterns** family (`pour-patterns`, from v0.5.0) describes that in one list with three kinds of record:

- **flow** – how the water is spread over time: bloom, continuous, pulse, stepped, constant, ramp-up, ramp-down, variable, freeform replay, osmotic, double bloom.
- **movement** – where the stream lands, independent of the flow: centre, circular, spiral, back-and-forth, hybrid, fixed point.
- **recipe** – a named technique (Better 1 Cup, 4:6 method …) that combines flow patterns and movements.

## Design

- Ids are readable slugs, as for brew methods (decision 0003). Recipes reference flow patterns (`flow_patterns`), kettle movements (`phases[].movement`) and brew methods (`brew_methods`) by id; data repositories check those references.
- Recipes and flow patterns are a list of **phases** (`pour`, `hold`, `drawdown`) that run one after the other. A pour gives its share of the water (`water_fraction`), so a recipe scales to other doses; `scaling` says whether gram amounts and times scale. The pour phases add up to 1.
- Within a pour, `flow` is `constant`, `ramp_up`, `ramp_down` or `custom` with a `flow_curve` in grams per second, which also stores a recorded reference pour. Every flow pattern carries an example phase list, so apps draw all three kinds with the same code.
- A kettle movement is a `path` of segments (`point`, `circle`, `spiral`, `line`) in fractions of the bed radius; several segments make a hybrid movement.
- `scored` marks phases a follow-along app should compare with the brewer's own pour.
- Field names follow the brew-methods family (`dose_g`, `brew_water_g`, `brew_temperature_celsius`, `grind_size`) so journals such as Roastbook can import recipes without mapping.

## Prior art

BrewMark Open Brew Profile 0.1 (MIT) showed timed step lists for brews (decision 0003 named it as a candidate for this family). Recipe facts (amounts, times, water targets) come from the creators' own publications; their texts are not copied.
