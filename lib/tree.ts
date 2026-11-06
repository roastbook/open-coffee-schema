// Turns a JSON Schema into a field tree for the Schema Explorer, the field docs and the breaking-change check.
// It understands a fixed keyword subset and throws on anything else, so a new keyword cannot render wrong silently.
import { Registry, type Json, type SchemaFile } from "./schemas.ts";

/** Keywords the renderer understands. Adding one here means rendering it in buildNode and diffing it in lib/diff.ts. */
export const KNOWN_KEYWORDS = new Set([
  "$schema", "$id", "$defs", "$ref", "title", "description", "examples",
  "type", "enum", "const", "format", "pattern",
  "minLength", "maxLength", "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum",
  "minItems", "maxItems", "uniqueItems", "minProperties", "maxProperties",
  "properties", "required", "additionalProperties", "unevaluatedProperties", "propertyNames",
  "items", "allOf", "if", "then", "else", "dependentSchemas",
]);
const CONSTRAINTS = ["minLength", "maxLength", "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "minItems", "maxItems", "uniqueItems", "minProperties", "maxProperties"] as const;

/** Throws on any keyword outside KNOWN_KEYWORDS anywhere in the document, including unused $defs. */
export function assertKnownKeywords(schema: Json, where: string): void {
  if (typeof schema === "boolean") return;
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) throw new Error(`${where}: not a schema`);
  for (const [k, v] of Object.entries(schema)) {
    if (!KNOWN_KEYWORDS.has(k)) throw new Error(`Unknown JSON Schema keyword "${k}" at ${where}`);
    assertKeywordSchemas(k, v, where);

  }
}

function assertKeywordSchemas(k: string, v: Json, where: string): void {
  if (["properties", "$defs", "dependentSchemas"].includes(k)) {
    for (const [p, schema] of Object.entries(v as object)) assertKnownKeywords(schema, `${where}/${k}/${p}`);
  }
  if (["items", "additionalProperties", "unevaluatedProperties", "propertyNames", "if", "then", "else"].includes(k)) assertKnownKeywords(v, `${where}/${k}`);
  if (k === "allOf") (v as Json[]).forEach((schema, i) => assertKnownKeywords(schema, `${where}/allOf/${i}`));
}

export interface FieldNode {
  key: string;
  /** Dotted path inside the section root ("" for the root). Map values use "*". */
  path: string;
  anchor: string;
  title?: string;
  description?: string;
  /** Human-readable type, e.g. "list of text". */
  label: string;
  /** JSON types of the value; arrays as "array<itemtypes>". */
  types: string[];
  required: boolean;
  array: boolean;
  map: boolean;
  /** Allowed values: the intersection of every enum that applies. */
  enum?: unknown[];
  const?: unknown;
  /** Every format and pattern that applies, one entry per subschema (allOf, $ref and local keywords all count). */
  formats: string[];
  patterns: string[];
  keyPatterns: string[];
  /** Effective limits on the value itself (for a list: on the list). */
  constraints: Record<string, unknown>;
  /** For a list: effective limits on each entry. */
  itemConstraints: Record<string, unknown>;
  examples?: unknown[];
  closed: boolean;
  forbidden: boolean;
  /** Rules in words that are compared as text. */
  rules: string[];
  /** The field is only allowed while the sibling field `prop` has one of `values` (from if/then and dependentSchemas). */
  allowedWhen?: { prop: string; values: unknown[] };
  /** Where the definition comes from, e.g. common.schema.v0.1.0.json#/$defs/address */
  ref?: string;
  /** Set on the file-level array that holds the records described in the record section. */
  recordOf?: string;
  children: FieldNode[];
}

interface Part { schema: Json; docId: string }
interface Cond { text: string; prop?: string; values?: unknown[] }
/** "forbidden": the field is not allowed under cond; "only": the field is allowed only under cond; "text": a value rule in words. */
type FieldRule = { field: string; kind: "forbidden" | "only"; cond: Cond } | { field: string; kind: "text"; text: string };
/** Everything collected for one value. Keywords that can appear in several subschemas are kept as lists, one entry each. */
interface Shape {
  title?: string; description?: string; types: Set<string>; enums: unknown[][]; consts: unknown[];
  formats: string[]; patterns: string[]; examples?: unknown[]; constraints: [string, unknown][];
  properties: Map<string, Part[]>; required: Set<string>; closed: boolean; additional?: Part; keyPatterns: string[];
  items?: Part; forbidden: boolean; ref?: string; rules: string[]; fieldRules: FieldRule[];
}
const emptyShape = (): Shape => ({ types: new Set(), enums: [], consts: [], formats: [], patterns: [], constraints: [], properties: new Map(), required: new Set(), closed: false, keyPatterns: [], forbidden: false, rules: [], fieldRules: [] });

const MIN_LIKE = new Set(["minLength", "minimum", "exclusiveMinimum", "minItems", "minProperties"]);
/** The binding value of each limit: the largest minimum, the smallest maximum, uniqueItems if any subschema sets it. */
function effective(list: [string, unknown][]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of list) {
    // eslint-disable-next-line security/detect-object-injection -- k comes from CONSTRAINTS; this accumulator never receives arbitrary property names.
    const o = out[k];
    // eslint-disable-next-line security/detect-object-injection -- k comes from CONSTRAINTS; this accumulator never receives arbitrary property names.
    out[k] = o === undefined ? v : k === "uniqueItems" ? o || v : MIN_LIKE.has(k) ? Math.max(o as number, v as number) : Math.min(o as number, v as number);
  }
  return out;
}
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
/** Values every enum allows (undefined when no enum applies). */
const effectiveEnum = (s: Shape) => s.enums.length ? s.enums.reduce((acc, e) => acc.filter((v) => e.some((w) => same(v, w)))) : undefined;
const uniq = (xs: string[]) => [...new Set(xs)];

const fmt = (v: unknown) => (typeof v === "string" ? `"${v}"` : JSON.stringify(v));

function describeCond(ifs: Json): Cond {
  const props = Object.entries(ifs?.properties ?? {}) as [string, Json][];
  const extra = Object.keys(ifs ?? {}).filter((k) => k !== "properties" && k !== "required");
  if (props.length === 1 && !extra.length) {
    const [prop, s] = props[0];
    if (s && "const" in s) return { text: `${prop} is ${fmt(s.const)}`, prop, values: [s.const] };
    if (s?.enum) return { text: `${prop} is one of ${s.enum.map(fmt).join(", ")}`, prop, values: s.enum };
  }
  return { text: `the record matches ${JSON.stringify(ifs)}` };
}

class Builder {
  reg: Registry;
  constructor(reg: Registry) { this.reg = reg; }

  collect(schema: Json, docId: string, shape: Shape, depth = 0): void {
    if (depth > 30) throw new Error("Schema nesting too deep (recursive $ref?)");
    if (schema === true) return;
    if (schema === false) { shape.forbidden = true; return; }
    this.collectComposition(schema, docId, shape, depth);
    this.collectValue(schema, shape);
    this.collectObject(schema, docId, shape, depth);
  }

  collectReference(schema: Json, docId: string, shape: Shape, depth: number): void {
    if (schema.$ref) {
      const t = this.reg.resolve(schema.$ref, docId);
      shape.ref ??= `${t.docId.split("/").pop()}#${t.pointer}`;
      this.collect(t.schema, t.docId, shape, depth + 1);
    }
  }

  collectComposition(schema: Json, docId: string, shape: Shape, depth: number): void {
    this.collectReference(schema, docId, shape, depth);
    for (const sub of schema.allOf ?? []) {
      if (sub.if) this.rule(sub, docId, shape); else this.collect(sub, docId, shape, depth + 1);
    }
    if (schema.if) this.rule(schema, docId, shape);
    this.collectDependencies(schema, shape);
  }

  collectDependencies(schema: Json, shape: Shape): void {
    for (const [field, dep] of Object.entries(schema.dependentSchemas ?? {})) this.dependent(field, dep, shape);
  }

  collectAnnotations(schema: Json, shape: Shape): void {
    if (schema.title !== undefined) shape.title = schema.title;
    if (schema.description !== undefined) shape.description = schema.description;
    if (schema.examples) shape.examples = schema.examples;
  }

  collectValue(schema: Json, shape: Shape): void {
    this.collectAnnotations(schema, shape);
    for (const t of [schema.type ?? []].flat()) shape.types.add(t);
    if (schema.enum) shape.enums.push(schema.enum);
    if ("const" in schema) shape.consts.push(schema.const);
    if (schema.format) shape.formats.push(schema.format);
    if (schema.pattern) shape.patterns.push(schema.pattern);
    // eslint-disable-next-line security/detect-object-injection -- c comes from the fixed constraint keyword list.
    for (const c of CONSTRAINTS) if (c in schema) shape.constraints.push([c, schema[c]]);
  }

  collectProperties(schema: Json, docId: string, shape: Shape): void {
    for (const [k, v] of Object.entries(schema.properties ?? {})) shape.properties.set(k, [...(shape.properties.get(k) ?? []), { schema: v, docId }]);
    for (const r of schema.required ?? []) shape.required.add(r);
  }

  collectObject(schema: Json, docId: string, shape: Shape, depth: number): void {
    this.collectProperties(schema, docId, shape);
    shape.closed ||= [schema.additionalProperties, schema.unevaluatedProperties].includes(false);
    if (schema.additionalProperties && typeof schema.additionalProperties === "object") shape.additional = { schema: schema.additionalProperties, docId };
    if (schema.propertyNames) {
      const tmp = emptyShape();
      this.collect(schema.propertyNames, docId, tmp, depth + 1);
      shape.keyPatterns.push(...tmp.patterns);
    }
    if (schema.items !== undefined) shape.items = { schema: schema.items, docId };
  }

  rule(s: Json, docId: string, shape: Shape) {
    const cond = describeCond(s.if);
    for (const [branchKind, branch] of [["when", s.then], ["unless", s.else]] as const) {
      if (branch === undefined) continue;
      const rest = { ...branch, properties: { ...branch.properties } };
      for (const [field, fs] of Object.entries(branch.properties ?? {}) as [string, Json][]) {
        const fieldRule = conditionalFieldRule(field, fs, branchKind, cond);
        if (!fieldRule) continue;
        shape.fieldRules.push(fieldRule);
        // eslint-disable-next-line security/detect-object-injection -- field is an own entry of the repository schema; only the local clone is changed.
        delete rest.properties[field];
      }
      if (!Object.keys(rest.properties).length) delete rest.properties;
      if (Object.keys(rest).length) shape.rules.push(`${branchKind === "when" ? "When" : "Unless"} ${cond.text}: must also match ${JSON.stringify(rest)}`);
    }
    void docId;
  }

  /** dependentSchemas: `{ "<field>": { "properties": { "<prop>": { "enum": [...] } } } }` reads "field only allowed when prop is one of ...". */
  dependent(field: string, dep: Json, shape: Shape) {
    const cond = dep && typeof dep === "object" && Object.keys(dep).length === 1 ? describeCond(dep) : undefined;
    if (cond?.prop) shape.fieldRules.push({ field, kind: "only", cond });
    else shape.rules.push(`When ${field} is present: must also match ${JSON.stringify(dep)}`);
  }

  node(parts: Part[], key: string, path: string, prefix: string, required: boolean, depth = 0): FieldNode {
    if (depth > 30) throw new Error(`Schema nesting too deep at ${path}`);
    const shape = emptyShape();
    const defined = parts.filter((p) => p.schema !== true);
    for (const p of defined.length ? defined : parts) this.collect(p.schema, p.docId, shape);
    let target = shape;
    let array = false;
    if (shape.items) {
      array = true;
      target = emptyShape();
      this.collect(shape.items.schema, shape.items.docId, target);
    }
    const children: FieldNode[] = [];
    const childPath = (k: string) => (path ? `${path}.${k}` : k);
    for (const [k, ps] of target.properties) children.push(this.node(ps, k, childPath(k), prefix, target.required.has(k), depth + 1));
    for (const child of children) applyFieldRules(child, target.fieldRules.filter((r) => r.field === child.key), children);
    if (target.additional) children.push(this.node([target.additional], "*", childPath("*"), prefix, false, depth + 1));
    return {
      key, path, anchor: path ? `${prefix}-${path}` : prefix,
      required, children,
      ...valueFields(shape, target, array),
    };
  }
}

function conditionalFieldRule(field: string, schema: Json, branch: "when" | "unless", cond: Cond): FieldRule | undefined {
  if (schema === false) return { field, kind: branch === "when" ? "forbidden" : "only", cond };
  if (branch !== "when" || !schema || Object.keys(schema).length !== 1) return undefined;
  if ("const" in schema) return { field, kind: "text", text: `Must be ${fmt(schema.const)} when ${cond.text}.` };
  if (schema.enum) return { field, kind: "text", text: `Must be one of ${schema.enum.map(fmt).join(", ")} when ${cond.text}.` };
  return undefined;
}

function valueLabel(shape: Shape, target: Shape, array: boolean): string {
  if (shape.forbidden) return "not allowed";
  const label = typeLabel(target, !!target.additional);
  return array ? `list of ${label}` : label;
}

function valueTypes(shape: Shape, target: Shape, array: boolean): string[] {
  if (shape.forbidden) return [];
  const types = jsonTypes(target);
  return array ? [`array<${types.join("|")}>`] : types;
}

function valueAnnotations(shape: Shape, target: Shape, array: boolean): Pick<FieldNode, "title" | "description" | "examples" | "ref"> {
  const annotations = array ? target : shape;
  return {
    title: shape.title ?? annotations.title,
    description: shape.description ?? annotations.description,
    examples: shape.examples ?? target.examples,
    ref: shape.ref ?? target.ref,
  };
}

function valueFields(shape: Shape, target: Shape, array: boolean): Omit<FieldNode, "key" | "path" | "anchor" | "required" | "children"> {
  return {
    ...valueAnnotations(shape, target, array),
    label: valueLabel(shape, target, array),
    types: valueTypes(shape, target, array),
    array, map: !!target.additional,
    enum: effectiveEnum(target), const: target.consts[0],
    formats: uniq(target.formats), patterns: uniq(target.patterns), keyPatterns: uniq(target.keyPatterns),
    constraints: effective(shape.constraints),
    itemConstraints: array ? effective(target.constraints) : {},
    closed: target.closed, forbidden: shape.forbidden,
    rules: [...target.rules],
  };
}

function jsonTypes(s: Shape): string[] {
  if (s.types.size) return [...s.types].sort();
  const vals = effectiveEnum(s) ?? (s.consts.length ? [s.consts[0]] : null);
  if (vals) return [...new Set(vals.map((v) => (v === null ? "null" : Number.isInteger(v) ? "integer" : typeof v)))].sort();
  if (s.properties.size || s.additional) return ["object"];
  return ["any"];
}

const PLAIN: Record<string, string> = { string: "text", boolean: "yes/no", number: "number", integer: "whole number", object: "object", array: "list", null: "empty", any: "any value" };
const FORMATS: Record<string, string> = { date: "date", "date-time": "timestamp", uri: "URL", iri: "URL" };
function typeLabel(s: Shape, map: boolean): string {
  if (s.enums.length) return "one of a fixed set";
  if (s.consts.length) return `exactly ${fmt(s.consts[0])}`;
  if (map) return "map of named entries";
  // eslint-disable-next-line security/detect-object-injection -- This only reads the fixed display dictionary with schema format names.
  const format = s.formats.find((f) => FORMATS[f]);
  // eslint-disable-next-line security/detect-object-injection -- This only reads the fixed display dictionary with schema format names.
  if (format) return FORMATS[format];
  // eslint-disable-next-line security/detect-object-injection -- This only reads the fixed display dictionary with schema type names.
  return jsonTypes(s).map((t) => PLAIN[t] ?? t).join(" or ");
}

/** The values of a sibling field that a field's rules refer to: its enum, its const, or true/false. */
function domainOf(n: FieldNode | undefined): unknown[] | undefined {
  if (!n) return undefined;
  if (n.enum) return n.enum;
  if (n.const !== undefined) return [n.const];
  if (n.types.length === 1 && n.types[0] === "boolean") return [true, false];
  return undefined;
}

/** Turns the if/then and dependentSchemas rules on one field into `allowedWhen` (when they all test one sibling with known values) or text. */
function applyFieldRules(child: FieldNode, rules: FieldRule[], siblings: FieldNode[]) {
  const presence = rules.filter((r) => r.kind !== "text") as Extract<FieldRule, { cond: Cond }>[];
  const props = new Set(presence.map((r) => r.cond.prop));
  const prop = props.size === 1 ? [...props][0] : undefined;
  const domain = prop ? domainOf(siblings.find((s) => s.key === prop)) : undefined;
  if (prop && domain) {
    let allowed = domain;
    for (const r of presence) allowed = allowed.filter((v) => r.cond.values!.some((w) => same(v, w)) === (r.kind === "only"));
    child.allowedWhen = { prop, values: allowed };
  } else {
    for (const r of presence) child.rules.push(`${r.kind === "only" ? "Only allowed when" : "Not allowed when"} ${r.cond.text}.`);
  }
  for (const r of rules) if (r.kind === "text") child.rules.push(r.text);
}

/** The allowedWhen rule in words, for the explorer. */
export function allowedWhenText(n: FieldNode): string | undefined {
  const a = n.allowedWhen;
  if (!a) return undefined;
  if (!a.values.length) return "Never allowed.";
  const values = a.values.length === 1 ? fmt(a.values[0]) : "one of " + a.values.map(fmt).join(", ");
  return `Only allowed when ${a.prop} is ${values}.`;
}

export interface Section { id: string; title: string; description?: string; root: FieldNode }
export interface Model { family: string; version: string; id: string; title?: string; description?: string; recordKey?: string; recordTitle?: string; sections: Section[] }

/** The root property that holds the family's records: an array whose items $ref a local definition. */
export function recordKeyOf(schema: Json): string | undefined {
  const keys = Object.entries(schema.properties ?? {})
    .filter(([, s]: [string, Json]) => s?.type === "array" && typeof s.items?.$ref === "string" && s.items.$ref.startsWith("#/$defs/"))
    .map(([k]) => k);
  return keys.length === 1 ? keys[0] : undefined;
}

/**
 * Sections of an explorer page. Record fields get anchors `field-<dotted.path>` relative to one record,
 * file-level fields `file-<path>`. Families without root properties (common) render each $def as `field-<def>.<path>`.
 */
export function buildModel(file: SchemaFile, reg: Registry): Model {
  for (const [id, doc] of reg.byId) assertKnownKeywords(doc, id);
  const s = file.json, docId = s.$id, b = new Builder(reg);
  const model: Model = { family: file.family, version: file.version, id: docId, title: s.title, description: s.description, sections: [] };
  const recordKey = recordKeyOf(s);
  if (recordKey) {
    // eslint-disable-next-line security/detect-object-injection -- recordKey was selected from this schema's own properties by recordKeyOf.
    const defRef = s.properties[recordKey].items.$ref;
    const def = reg.resolve(defRef, docId).schema;
    model.recordKey = recordKey;
    model.recordTitle = def.title ?? recordKey;
    model.sections.push({ id: "field", title: `${model.recordTitle} record`, description: def.description, root: b.node([{ schema: { $ref: defRef }, docId }], "", "", "field", true) });
  }
  addStructureSections(s, docId, b, model, recordKey);

  return model;
}

function addStructureSections(s: Json, docId: string, b: Builder, model: Model, recordKey: string | undefined): void {
  if (s.properties) {
    const root = b.node([{ schema: { ...s, $defs: undefined }, docId }], "", "", recordKey ? "file" : "field", true);
    if (recordKey) {
      const holder = root.children.find((c) => c.key === recordKey)!;
      holder.recordOf = model.recordTitle;
      holder.children = [];
    }
    model.sections.push({ id: recordKey ? "file" : "field", title: "File structure", root });
  } else {
    for (const name of Object.keys(s.$defs ?? {})) {
      // eslint-disable-next-line security/detect-object-injection -- name comes from Object.keys of the repository schema's own definitions.
      model.sections.push({ id: `def-${name}`, title: s.$defs[name].title ?? name, description: s.$defs[name].description, root: b.node([{ schema: { $ref: `#/$defs/${name}` }, docId }], name, name, "field", false) });
    }
  }
}

export function flatten(node: FieldNode, out: FieldNode[] = []): FieldNode[] {
  out.push(node);
  for (const c of node.children) flatten(c, out);
  return out;
}

/** Every anchor on a model's page, used by the playground to link errors. */
export const anchorsOf = (m: Model) => m.sections.flatMap((s) => flatten(s.root).map((n) => n.anchor));
