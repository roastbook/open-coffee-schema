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
  "items", "allOf", "if", "then", "else",
]);
const CONSTRAINTS = ["minLength", "maxLength", "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "minItems", "maxItems", "uniqueItems", "minProperties", "maxProperties"] as const;

/** Throws on any keyword outside KNOWN_KEYWORDS anywhere in the document, including unused $defs. */
export function assertKnownKeywords(schema: Json, where: string): void {
  if (typeof schema === "boolean") return;
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) throw new Error(`${where}: not a schema`);
  for (const [k, v] of Object.entries(schema)) {
    if (!KNOWN_KEYWORDS.has(k)) throw new Error(`Unknown JSON Schema keyword "${k}" at ${where}`);
    if (k === "properties" || k === "$defs") for (const [p, s] of Object.entries(v as object)) assertKnownKeywords(s, `${where}/${k}/${p}`);
    if (["items", "additionalProperties", "unevaluatedProperties", "propertyNames", "if", "then", "else"].includes(k)) assertKnownKeywords(v, `${where}/${k}`);
    if (k === "allOf") (v as Json[]).forEach((s, i) => assertKnownKeywords(s, `${where}/allOf/${i}`));
  }
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
  enum?: unknown[];
  const?: unknown;
  format?: string;
  pattern?: string;
  keyPattern?: string;
  constraints: Record<string, unknown>;
  examples?: unknown[];
  closed: boolean;
  forbidden: boolean;
  rules: string[];
  /** Where the definition comes from, e.g. common.schema.v1.0.0.json#/$defs/address */
  ref?: string;
  /** Set on the file-level array that holds the records described in the record section. */
  recordOf?: string;
  children: FieldNode[];
}

interface Part { schema: Json; docId: string }
interface Cond { text: string; prop?: string; values?: unknown[] }
interface Shape {
  title?: string; description?: string; types: Set<string>; enum?: unknown[]; const?: unknown; hasConst: boolean;
  format?: string; pattern?: string; examples?: unknown[]; constraints: Record<string, unknown>;
  properties: Map<string, Part[]>; required: Set<string>; closed: boolean; additional?: Part; keyPattern?: string;
  items?: Part; forbidden: boolean; ref?: string; rules: string[];
  fieldRules: { field: string; kind: "when" | "unless"; cond: Cond }[];
}
const emptyShape = (): Shape => ({ types: new Set(), constraints: {}, properties: new Map(), required: new Set(), closed: false, forbidden: false, rules: [], fieldRules: [], hasConst: false });

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
    if (schema.$ref) {
      const t = this.reg.resolve(schema.$ref, docId);
      shape.ref ??= `${t.docId.split("/").pop()}#${t.pointer}`;
      this.collect(t.schema, t.docId, shape, depth + 1);
    }
    for (const sub of schema.allOf ?? []) {
      if (sub.if) this.rule(sub, docId, shape); else this.collect(sub, docId, shape, depth + 1);
    }
    if (schema.if) this.rule(schema, docId, shape);
    if (schema.title !== undefined) shape.title = schema.title;
    if (schema.description !== undefined) shape.description = schema.description;
    for (const t of [schema.type ?? []].flat()) shape.types.add(t);
    if (schema.enum) shape.enum = schema.enum;
    if ("const" in schema) { shape.const = schema.const; shape.hasConst = true; }
    if (schema.format) shape.format = schema.format;
    if (schema.pattern) shape.pattern = schema.pattern;
    if (schema.examples) shape.examples = schema.examples;
    for (const c of CONSTRAINTS) if (c in schema) shape.constraints[c] = schema[c];
    for (const [k, v] of Object.entries(schema.properties ?? {})) shape.properties.set(k, [...(shape.properties.get(k) ?? []), { schema: v, docId }]);
    for (const r of schema.required ?? []) shape.required.add(r);
    if (schema.additionalProperties === false || schema.unevaluatedProperties === false) shape.closed = true;
    if (schema.additionalProperties && typeof schema.additionalProperties === "object") shape.additional = { schema: schema.additionalProperties, docId };
    if (schema.propertyNames) {
      const tmp = emptyShape();
      this.collect(schema.propertyNames, docId, tmp, depth + 1);
      shape.keyPattern = tmp.pattern;
    }
    if (schema.items !== undefined) shape.items = { schema: schema.items, docId };
  }

  rule(s: Json, docId: string, shape: Shape) {
    const cond = describeCond(s.if);
    for (const [kind, branch] of [["when", s.then], ["unless", s.else]] as const) {
      if (branch === undefined) continue;
      const rest = { ...branch, properties: { ...branch.properties } };
      for (const [field, fs] of Object.entries(branch.properties ?? {})) {
        if (fs === false) { shape.fieldRules.push({ field, kind, cond }); delete rest.properties[field]; }
      }
      if (rest.properties && !Object.keys(rest.properties).length) delete rest.properties;
      if (Object.keys(rest).length) shape.rules.push(`${kind === "when" ? "When" : "Unless"} ${cond.text}: must also match ${JSON.stringify(rest)}`);
    }
    void docId;
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
    for (const [k, ps] of target.properties) {
      const child = this.node(ps, k, childPath(k), prefix, target.required.has(k), depth + 1);
      child.rules.push(...ruleTexts(target.fieldRules.filter((r) => r.field === k)));
      children.push(child);
    }
    if (target.additional) children.push(this.node([target.additional], "*", childPath("*"), prefix, false, depth + 1));
    const itemTypes = jsonTypes(target);
    const map = !!target.additional;
    const label = shape.forbidden ? "not allowed" : array ? `list of ${typeLabel(target, map)}` : typeLabel(target, map);
    return {
      key, path, anchor: path ? `${prefix}-${path}` : prefix,
      title: shape.title ?? (array ? target.title : undefined),
      description: shape.description ?? (array ? target.description : undefined),
      label,
      types: shape.forbidden ? [] : array ? [`array<${itemTypes.join("|")}>`] : itemTypes,
      required, array, map,
      enum: target.enum, const: target.const, format: target.format, pattern: target.pattern, keyPattern: target.keyPattern,
      constraints: { ...(array ? target.constraints : {}), ...shape.constraints },
      examples: shape.examples ?? target.examples,
      closed: target.closed, forbidden: shape.forbidden,
      rules: [...target.rules],
      ref: shape.ref ?? target.ref,
      children,
    };
  }
}

function jsonTypes(s: Shape): string[] {
  if (s.types.size) return [...s.types].sort();
  const vals = s.enum ?? (s.hasConst ? [s.const] : null);
  if (vals) return [...new Set(vals.map((v) => (v === null ? "null" : Number.isInteger(v) ? "integer" : typeof v)))].sort();
  if (s.properties.size || s.additional) return ["object"];
  return ["any"];
}

const PLAIN: Record<string, string> = { string: "text", boolean: "yes/no", number: "number", integer: "whole number", object: "object", array: "list", null: "empty", any: "any value" };
const FORMATS: Record<string, string> = { date: "date", "date-time": "timestamp", uri: "URL" };
function typeLabel(s: Shape, map: boolean): string {
  if (s.enum) return "one of a fixed set";
  if (s.hasConst) return `exactly ${fmt(s.const)}`;
  if (map) return "map of named entries";
  if (s.format && FORMATS[s.format]) return FORMATS[s.format];
  return jsonTypes(s).map((t) => PLAIN[t] ?? t).join(" or ");
}

function ruleTexts(rules: Shape["fieldRules"]): string[] {
  const out: string[] = [];
  for (const kind of ["when", "unless"] as const) {
    const rs = rules.filter((r) => r.kind === kind);
    if (!rs.length) continue;
    const byProp = new Map<string, unknown[]>();
    const loose: string[] = [];
    for (const r of rs) r.cond.prop ? byProp.set(r.cond.prop, [...(byProp.get(r.cond.prop) ?? []), ...r.cond.values!]) : loose.push(r.cond.text);
    const parts = [...[...byProp].map(([p, vs]) => (vs.length === 1 ? `${p} is ${fmt(vs[0])}` : `${p} is one of ${vs.map(fmt).join(", ")}`)), ...loose];
    out.push(`${kind === "when" ? "Not allowed when" : "Only allowed when"} ${parts.join(" or ")}.`);
  }
  return out;
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
    const defRef = s.properties[recordKey].items.$ref;
    const def = reg.resolve(defRef, docId).schema;
    model.recordKey = recordKey;
    model.recordTitle = def.title ?? recordKey;
    model.sections.push({ id: "field", title: `${model.recordTitle} record`, description: def.description, root: b.node([{ schema: { $ref: defRef }, docId }], "", "", "field", true) });
  }
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
      model.sections.push({ id: `def-${name}`, title: s.$defs[name].title ?? name, description: s.$defs[name].description, root: b.node([{ schema: { $ref: `#/$defs/${name}` }, docId }], name, name, "field", false) });
    }
  }
  return model;
}

export function flatten(node: FieldNode, out: FieldNode[] = []): FieldNode[] {
  out.push(node);
  for (const c of node.children) flatten(c, out);
  return out;
}

/** Every anchor on a model's page, used by the playground to link errors. */
export const anchorsOf = (m: Model) => m.sections.flatMap((s) => flatten(s.root).map((n) => n.anchor));
