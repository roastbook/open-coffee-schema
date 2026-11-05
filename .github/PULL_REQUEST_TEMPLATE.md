## What and why

<!-- What changes, and which issue it implements (Closes #…). Title in Conventional Commits form, e.g. `feat(coffee-places): add amenities.power_outlets`. -->

## Validation checklist

- [ ] No published schema file was edited; changes are in a new version file with a matching `$id`.
- [ ] The version bump matches the change (optional addition = minor, breaking = major, wording = patch).
- [ ] Every new field has a plain-language `description`.
- [ ] Examples added or updated in `examples/<family>/valid/` and `invalid/`.
- [ ] Coffee places: new fields are mapped in a new JSON-LD context version.
- [ ] `node scripts/generate.ts` run (README numbers, `docs/fields.md`).
- [ ] `scripts/validate.sh` and `scripts/build.sh` pass locally.
- [ ] Breaking change: announced in Discussions at least two weeks ago (link: …).

## Sign-off

- [ ] Every commit is signed off (`git commit -s`) under the [Developer Certificate of Origin](https://developercertificate.org/).
