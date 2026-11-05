// Turns Ajv errors into plain-language messages and links them to field anchors. Runs in the browser (playground).
import type { ErrorObject } from "ajv";
import { FORMAT_HINTS } from "../../../lib/words.ts";

export interface Target {
  key: string; family: string; version: string; id: string;
  recordKey: string | null; recordRef: string | null; recordTitle: string | null; anchors: string[];
}

const TYPES: Record<string, string> = {
  string: "text in quotes", boolean: "true or false", number: "a number", integer: "a whole number",
  object: "an object ({ … })", array: "a list ([ … ])", null: "null",
};
const COMPARE: Record<string, string> = { ">=": "at least", ">": "more than", "<=": "at most", "<": "less than" };
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function explain(e: ErrorObject): string {
  const p = e.params as any;
  switch (e.keyword) {
    case "required": return `Missing required field “${p.missingProperty}”.`;
    case "additionalProperties": return `“${p.additionalProperty}” is not a field here. Check the spelling or remove it.`;
    case "unevaluatedProperties": return `“${p.unevaluatedProperty}” is not a field here. Check the spelling or remove it.`;
    case "enum": return `Must be one of: ${p.allowedValues.map((v: unknown) => JSON.stringify(v)).join(", ")}.`;
    case "const": return `Must be exactly ${JSON.stringify(p.allowedValue)}.`;
    case "type": return `Must be ${String(p.type).split(",").map((t) => TYPES[t] ?? t).join(" or ")}.`;
    case "format": return `Must be ${FORMAT_HINTS[p.format] ?? `a valid ${p.format}`}.`;
    case "pattern": return `Has the wrong format: it must match ${p.pattern}.`;
    case "minimum": case "maximum": case "exclusiveMinimum": case "exclusiveMaximum":
      return `Must be ${COMPARE[p.comparison]} ${p.limit}.`;
    case "minLength": return `Must be at least ${plural(p.limit, "character", "characters")} long.`;
    case "maxLength": return `Must be at most ${plural(p.limit, "character", "characters")} long.`;
    case "minItems": return `Needs at least ${plural(p.limit, "entry", "entries")}.`;
    case "maxItems": return `Can have at most ${plural(p.limit, "entry", "entries")}.`;
    case "uniqueItems": return `Entries ${p.j + 1} and ${p.i + 1} are the same; each value may appear only once.`;
    case "minProperties": return p.limit === 1 ? "Must not be empty." : `Needs at least ${p.limit} entries.`;
    case "propertyNames": return `The key “${p.propertyName}” is not allowed here.`;
    case "false schema": return "This field is not allowed here. Its definition explains when it may be used.";
    default: return e.message ?? `Fails the ${e.keyword} rule.`;
  }
}

/** Where an error is, in words, and the explorer anchor of the closest documented field. */
export function locate(e: ErrorObject, doc: any, t: Target, asRecord: boolean): { where: string; anchor?: string } {
  const segs = e.instancePath.split("/").slice(1).map((s) => s.replace(/~1/g, "/").replace(/~0/g, "~"));
  const p = e.params as any;
  const extra: string | undefined = e.keyword === "required" ? p.missingProperty : undefined;
  let prefix = "field", label = "", rest = segs;
  if (!asRecord && t.recordKey) {
    if (segs[0] === t.recordKey && segs.length >= 2) {
      const i = Number(segs[1]), rec = doc?.[t.recordKey]?.[i];
      const name = rec?.name ?? rec?.id;
      label = `${t.recordTitle} ${i + 1}${typeof name === "string" ? ` (“${name}”)` : ""}`;
      rest = segs.slice(2);
    } else prefix = "file";
  }
  const anchors = new Set(t.anchors);
  let cur = "", anchor = anchors.has(prefix) ? prefix : undefined;
  for (const s of [...rest, ...(extra ? [extra] : [])].filter((s) => !/^\d+$/.test(s))) {
    const next = cur ? `${cur}.${s}` : s, star = cur ? `${cur}.*` : "*";
    if (anchors.has(`${prefix}-${next}`)) cur = next;
    else if (anchors.has(`${prefix}-${star}`)) cur = star;
    else break;
    anchor = `${prefix}-${cur}`;
  }
  const path = rest.reduce((acc, s) => (/^\d+$/.test(s) ? `${acc} #${Number(s) + 1}` : acc ? `${acc}.${s}` : s), "");
  return { where: [label, path].filter(Boolean).join(" → ") || (asRecord ? "The record" : "Top level"), anchor };
}
