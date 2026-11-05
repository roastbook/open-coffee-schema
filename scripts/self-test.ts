// Self-test for the breaking-change rules (lib/diff.ts), the unknown-keyword guard (lib/tree.ts) and the playground's
// error wording and field links (site/src/lib/explain.ts). Run by validate.sh.
import assert from "node:assert/strict";
import { Registry, type SchemaFile } from "../lib/schemas.ts";
import { buildModel, flatten } from "../lib/tree.ts";
import { checkBump, diffModels, requiredBump } from "../lib/diff.ts";
import { explain, locate, type Target } from "../site/src/lib/explain.ts";

const file = (version: string, place: object, defs: object = {}): SchemaFile => {
  const json = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: `https://schema.roastbook.coffee/test/test.schema.v${version}.json`,
    type: "object",
    properties: { items: { type: "array", items: { $ref: "#/$defs/rec" } } },
    $defs: { ...defs, rec: { type: "object", ...place } },
  };
  return { family: "test", version, path: "", fileName: "", expectedId: json.$id, raw: "", json };
};
const base = {
  required: ["id"],
  properties: { id: { type: "string" }, kind: { enum: ["a", "b"] }, n: { type: "integer", maximum: 10 }, tags: { type: "array", items: { type: "string" } } },
};
const bump = (next: object) => {
  const a = file("1.0.0", base), b = file("1.1.0", next);
  const reg = new Registry([a, b]);
  return requiredBump(diffModels(buildModel(a, reg), buildModel(b, reg)));
};
const withProps = (p: object, extra: object = {}) => ({ ...base, ...extra, properties: { ...base.properties, ...p } });

assert.equal(bump(base), "none");
assert.equal(bump(withProps({ note: { type: "string" } })), "minor", "new optional field");
assert.equal(bump({ ...withProps({ note: { type: "string" } }), required: ["id", "note"] }), "major", "new required field");
assert.equal(bump({ ...base, properties: { id: base.properties.id, kind: base.properties.kind, n: base.properties.n } }), "major", "removed field");
assert.equal(bump(withProps({ kind: { enum: ["a"] } })), "major", "narrowed enum");
assert.equal(bump(withProps({ kind: { enum: ["a", "b", "c"] } })), "minor", "widened enum");
assert.equal(bump(withProps({ n: { type: "integer", maximum: 5 } })), "major", "tightened maximum");
assert.equal(bump(withProps({ n: { type: "integer", maximum: 20 } })), "minor", "loosened maximum");
assert.equal(bump(withProps({ n: { type: "integer", maximum: 10, minimum: 1 } })), "major", "added minimum");
assert.equal(bump(withProps({ id: { type: "string", pattern: "^x" } })), "major", "added pattern");
assert.equal(bump(withProps({ id: { type: ["string", "integer"] } })), "minor", "widened type");
assert.equal(bump(withProps({ n: { type: "number", maximum: 10 } })), "minor", "integer to number widens");
assert.equal(bump(withProps({ id: { type: "integer" } })), "major", "changed type");
assert.equal(bump(withProps({}, { additionalProperties: false })), "major", "closed object");
assert.equal(bump(withProps({ tags: { type: "array", items: { type: "string" }, uniqueItems: true } })), "major", "uniqueItems added");
assert.equal(bump(withProps({ id: { type: "string", description: "x" } })), "patch", "description only");
assert.equal(bump(withProps({}, { allOf: [{ if: { properties: { kind: { const: "a" } } }, then: { properties: { n: false } } }] })), "major", "new conditional rule");

// Any two records (and extra $defs), for the cases below.
const bumpBetween = (from: object, to: object, fromDefs: object = {}, toDefs: object = fromDefs) => {
  const a = file("1.0.0", from, fromDefs), b = file("1.1.0", to, toDefs);
  const reg = new Registry([a, b]);
  return requiredBump(diffModels(buildModel(a, reg), buildModel(b, reg)));
};
const rec = (properties: object, extra: object = {}) => ({ properties, ...extra });

// Array items: enums, patterns and limits on each entry.
const list = (items: object, extra: object = {}) => rec({ l: { type: "array", items: { type: "string", ...items }, ...extra } });
assert.equal(bumpBetween(list({ enum: ["a", "b"] }), list({ enum: ["a"] })), "major", "item enum narrowed");
assert.equal(bumpBetween(list({ enum: ["a"] }), list({ enum: ["a", "b"] })), "minor", "item enum widened");
assert.equal(bumpBetween(list({}), list({ pattern: "^x" })), "major", "item pattern added");
assert.equal(bumpBetween(list({ pattern: "^x" }), list({})), "minor", "item pattern removed");
assert.equal(bumpBetween(list({ minLength: 1 }), list({ minLength: 3 })), "major", "item minLength tightened");
{
  const f = file("1.0.0", list({ minLength: 3 }, { minItems: 1 }));
  const n = flatten(buildModel(f, new Registry([f])).sections[0].root).find((x) => x.key === "l")!;
  assert.deepEqual([n.constraints, n.itemConstraints], [{ minItems: 1 }, { minLength: 3 }], "item limits stay apart from list limits");
}

// Nested objects.
const nested = (x: object, more: object = {}) => rec({ o: { type: "object", properties: { x: { type: "string", ...x }, ...more } } });
assert.equal(bumpBetween(nested({}), nested({ maxLength: 5 })), "major", "nested maxLength added");
assert.equal(bumpBetween(nested({}), nested({}, { y: { type: "string" } })), "minor", "nested optional field added");
assert.equal(bumpBetween(nested({}), rec({ o: { type: "object", properties: {} } })), "major", "nested field removed");

// $ref targets: switching to another definition, and changing the referenced definition.
const defs = { short: { type: "string", minLength: 1 }, long: { type: "string", minLength: 5 } };
assert.equal(bumpBetween(rec({ r: { $ref: "#/$defs/short" } }), rec({ r: { $ref: "#/$defs/long" } }), defs), "major", "$ref to a stricter definition");
assert.equal(bumpBetween(rec({ r: { $ref: "#/$defs/long" } }), rec({ r: { $ref: "#/$defs/short" } }), defs), "minor", "$ref to a looser definition");
assert.equal(bumpBetween(rec({ r: { $ref: "#/$defs/short" } }), rec({ r: { $ref: "#/$defs/short" } }), defs, { ...defs, short: { type: "string", minLength: 2 } }), "major", "referenced definition tightened");

// Several subschemas setting the same keyword (finding: only the last one used to count).
const both = (first: string) => rec({ s: { type: "string", allOf: [{ pattern: first }, { pattern: "z$" }] } });
assert.equal(bumpBetween(both("^a"), both("^ab")), "major", "first of two allOf patterns tightened");
assert.equal(bumpBetween(both("^a"), rec({ s: { type: "string", allOf: [{ pattern: "z$" }] } })), "minor", "one of two allOf patterns dropped");
const local = (defMin: number) => [rec({ s: { $ref: "#/$defs/d", minLength: 3 } }), { d: { type: "string", minLength: defMin } }] as const;
assert.equal(bumpBetween(local(1)[0], local(4)[0], local(1)[1], local(4)[1]), "major", "$ref minLength tightened past the local minLength");
assert.equal(bumpBetween(local(1)[0], local(2)[0], local(1)[1], local(2)[1]), "none", "$ref minLength still below the local minLength");

// Conditional rules when an enum grows: forbidding fields for a value that did not exist before is an addition.
const typed = (types: string[], details: string[]) => rec({ type: { enum: types }, ...Object.fromEntries(details.map((d) => [d, { type: "object" }])) });
const ifThen = (types: string[], details: string[]) => ({
  ...typed(types, details),
  allOf: types.map((t) => ({ if: { properties: { type: { const: t } }, required: ["type"] }, then: { properties: Object.fromEntries(details.filter((d) => d !== t).map((d) => [d, false])) } })),
});
const dependent = (types: string[], details: string[]) => ({ ...typed(types, details), dependentSchemas: Object.fromEntries(details.map((d) => [d, { properties: { type: { enum: [d] } } }])) });
assert.equal(bumpBetween(ifThen(["a", "b"], ["a", "b"]), ifThen(["a", "b", "c"], ["a", "b"])), "minor", "if/then: new enum value forbids existing details");
assert.equal(bumpBetween(ifThen(["a", "b"], ["a", "b"]), ifThen(["a", "b", "c"], ["a", "b", "c"])), "minor", "if/then: new type plus its details key");
assert.equal(bumpBetween(dependent(["a", "b"], ["a", "b"]), dependent(["a", "b", "c"], ["a", "b", "c"])), "minor", "dependentSchemas: new type plus its details key");
assert.equal(bumpBetween(ifThen(["a", "b"], ["a", "b"]), dependent(["a", "b"], ["a", "b"])), "none", "if/then to dependentSchemas with the same meaning");
assert.equal(bumpBetween(dependent(["a", "b"], ["a", "b"]), { ...dependent(["a", "b"], ["a", "b"]), dependentSchemas: { a: { properties: { type: { enum: [] } } }, b: { properties: { type: { enum: ["b"] } } } } }), "major", "dependentSchemas: an existing value no longer allows a field");

assert.match(checkBump("1.0.0", "1.1.0", [{ anchor: "", path: "x", section: "", severity: "breaking", text: "" }]) ?? "", /major bump/);
assert.equal(checkBump("1.0.0", "2.0.0", [{ anchor: "", path: "x", section: "", severity: "breaking", text: "" }]), null);
assert.match(checkBump("1.1.0", "1.0.0", []) ?? "", /not newer/);
const breaking = [{ anchor: "", path: "x", section: "", severity: "breaking" as const, text: "" }];
const addition = [{ anchor: "", path: "x", section: "", severity: "addition" as const, text: "" }];
assert.equal(checkBump("0.1.0", "0.2.0", breaking), null, "0.x: a minor bump may break");
assert.match(checkBump("0.1.0", "0.1.1", breaking) ?? "", /bump/, "0.x: a patch bump may not break");
assert.equal(checkBump("0.1.0", "0.1.1", addition), null, "0.x: a patch bump may add");
assert.equal(checkBump("1.0.0", "1.0.1", [{ anchor: "", path: "x", section: "", severity: "patch", text: "" }]), null);

assert.throws(() => { const f = file("1.0.0", { ...base, oneOf: [] }); buildModel(f, new Registry([f])); }, /Unknown JSON Schema keyword "oneOf"/);

const t: Target = { key: "", family: "coffee-places", version: "1.0.0", id: "", recordKey: "places", recordRef: "#/$defs/place", recordTitle: "Coffee place",
  anchors: ["field", "field-serving", "field-serving.filter", "field-prices", "field-prices.*", "field-prices.*.amount", "field-roasters_served", "field-roasters_served.url", "file", "file-meta", "file-meta.city"] };
const doc = { places: [{ name: "Corner Café" }] };
const err = (instancePath: string, keyword: string, params: object) => ({ instancePath, keyword, params, schemaPath: "" });
assert.deepEqual(locate(err("/places/0/serving/filter", "type", { type: "boolean" }), doc, t, false), { where: "Coffee place 1 (“Corner Café”) → serving.filter", anchor: "field-serving.filter" });
assert.deepEqual(locate(err("/places/0/prices/cappuccino/amount", "minimum", {}), doc, t, false).anchor, "field-prices.*.amount");
assert.deepEqual(locate(err("/places/0/roasters_served/1/url", "format", {}), doc, t, false).where, "Coffee place 1 (“Corner Café”) → roasters_served #2.url");
assert.deepEqual(locate(err("/meta/city", "pattern", {}), doc, t, false), { where: "meta.city", anchor: "file-meta.city" });
assert.deepEqual(locate(err("/serving", "required", { missingProperty: "filter" }), {}, t, true), { where: "serving", anchor: "field-serving.filter" });
assert.equal(locate(err("/serving", "additionalProperties", { additionalProperty: "drip" }), {}, t, true).anchor, "field-serving");
assert.equal(explain(err("", "type", { type: "boolean" }) as any), "Must be true or false.");
assert.equal(explain(err("", "maximum", { comparison: "<=", limit: 1 }) as any), "Must be at most 1.");
console.log("self-test: ok");
