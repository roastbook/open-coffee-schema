# 0006: Distribution methods family

Status: accepted (2026-11-11)

Espresso puck preparation starts with spreading the ground coffee evenly in the basket. Brew-methods records which method a brew used (`distribution_method`, an enum since v0.4.0) but not what each method is. The **distribution methods** family (`distribution-methods`, from v0.5.1) describes them as records.

## Design

- Record ids are the values journals already record as `distribution_method` (`wdt`, `blind_shaker`, `distribution_tool`, `stockfleth_move`), so a journal entry links to its record without mapping. New methods get ids in the same style.
- `action` says what moves the grounds (stir, shake, tap, sweep, rotate) and `reach` whether the whole bed or mainly the top layer is evened out. Both are plain facts about the technique, not a quality ranking.
- `equipment_types` and `brew_methods` reference the equipment type list and brew-method ids, as brew methods and pour patterns do.
- `creator`, `introduced_year` and `url` are given only when the creator's own publication or a first-hand account supports them; unknown values are absent.
- Tamping and puck screens are separate steps and stay out of this family.
