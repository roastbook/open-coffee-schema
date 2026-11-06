// Turns Ajv errors into plain-language messages and links them to field anchors. Runs in the browser (playground).
import type { ErrorObject } from "ajv";
import { FORMAT_HINTS } from "../../../lib/words.ts";

export interface Target {
  key: string; family: string; version: string; id: string;
  recordKey: string | null; recordRef: string | null; recordTitle: string | null; anchors: string[];
}

const TYPES = new Map<string, string>(Object.entries({
  string: "text in quotes", boolean: "true or false", number: "a number", integer: "a whole number",
  object: "an object ({ … })", array: "a list ([ … ])", null: "null",
}));
const COMPARE = new Map(Object.entries({ ">=": "at least", ">": "more than", "<=": "at most", "<": "less than" }));
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

type ErrorParams = ErrorObject["params"];
const MESSAGES = new Map<string, (p: ErrorParams) => string>([
  ["required", (p: ErrorParams) => `Missing required field “${p.missingProperty}”.`],
  ["additionalProperties", (p: ErrorParams) => `“${p.additionalProperty}” is not a field here. Check the spelling or remove it.`],
  ["unevaluatedProperties", (p: ErrorParams) => `“${p.unevaluatedProperty}” is not a field here. Check the spelling or remove it.`],
  ["enum", (p: ErrorParams) => `Must be one of: ${p.allowedValues.map((v: unknown) => JSON.stringify(v)).join(", ")}.`],
  ["const", (p: ErrorParams) => `Must be exactly ${JSON.stringify(p.allowedValue)}.`],
  ["type", (p: ErrorParams) => `Must be ${String(p.type).split(",").map((t) => TYPES.get(t) ?? t).join(" or ")}.`],
  ["format", (p: ErrorParams) => `Must be ${FORMAT_HINTS.get(p.format) ?? `a valid ${p.format}`}.`],
  ["pattern", (p: ErrorParams) => `Has the wrong format: it must match ${p.pattern}.`],
  ...["minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum"].map((keyword): [string, (p: ErrorParams) => string] =>
    [keyword, (p: ErrorParams) => `Must be ${COMPARE.get(p.comparison)} ${p.limit}.`]),
  ["minLength", (p: ErrorParams) => `Must be at least ${plural(p.limit, "character", "characters")} long.`],
  ["maxLength", (p: ErrorParams) => `Must be at most ${plural(p.limit, "character", "characters")} long.`],
  ["minItems", (p: ErrorParams) => `Needs at least ${plural(p.limit, "entry", "entries")}.`],
  ["maxItems", (p: ErrorParams) => `Can have at most ${plural(p.limit, "entry", "entries")}.`],
  ["uniqueItems", (p: ErrorParams) => `Entries ${p.j + 1} and ${p.i + 1} are the same; each value may appear only once.`],
  ["minProperties", (p: ErrorParams) => p.limit === 1 ? "Must not be empty." : `Needs at least ${p.limit} entries.`],
  ["propertyNames", (p: ErrorParams) => `The key “${p.propertyName}” is not allowed here.`],
  ["false schema", () => "This field is not allowed here. Its definition explains when it may be used."],
]);

export function explain(e: ErrorObject): string {
  return MESSAGES.get(e.keyword)?.(e.params) ?? e.message ?? `Fails the ${e.keyword} rule.`;
}

function fieldAnchor(rest: string[], extra: string | undefined, prefix: string, anchors: Set<string>): string | undefined {
  let cur = "", anchor = anchors.has(prefix) ? prefix : undefined;
  for (const s of [...rest, ...(extra ? [extra] : [])].filter((s) => !/^\d+$/.test(s))) {
    const next = cur ? `${cur}.${s}` : s, star = cur ? `${cur}.*` : "*";
    if (anchors.has(`${prefix}-${next}`)) cur = next;
    else if (anchors.has(`${prefix}-${star}`)) cur = star;
    else break;
    anchor = `${prefix}-${cur}`;
  }
  return anchor;
}

/** Where an error is, in words, and the explorer anchor of the closest documented field. */
export function locate(e: ErrorObject, doc: any, t: Target, asRecord: boolean): { where: string; anchor?: string } {
  const segs = e.instancePath.split("/").slice(1).map((s) => s.replace(/~1/g, "/").replace(/~0/g, "~"));
  const p = e.params as any;
  const extra: string | undefined = e.keyword === "required" ? p.missingProperty : undefined;
  let prefix = "field", label = "", rest = segs;
  if (!asRecord && t.recordKey) {
    if (segs[0] === t.recordKey && segs.length >= 2) {
      // eslint-disable-next-line security/detect-object-injection -- The schema-defined record key and numeric index are used only to read a label from parsed JSON.
      const i = Number(segs[1]), rec = doc?.[t.recordKey]?.[i];
      const name = rec?.name ?? rec?.id;
      label = `${t.recordTitle} ${i + 1}${typeof name === "string" ? ` (“${name}”)` : ""}`;
      rest = segs.slice(2);
    } else prefix = "file";
  }
  const anchor = fieldAnchor(rest, extra, prefix, new Set(t.anchors));
  const path = rest.reduce((acc, s) => (/^\d+$/.test(s) ? `${acc} #${Number(s) + 1}` : acc ? `${acc}.${s}` : s), "");
  return { where: [label, path].filter(Boolean).join(" → ") || (asRecord ? "The record" : "Top level"), anchor };
}
