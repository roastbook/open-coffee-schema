// Plain-language wording for field constraints, shared by the explorer, the field docs and the playground.
import type { FieldNode } from "./tree.ts";

const WORDS = new Map<string, (v: unknown) => string>(Object.entries({
  minLength: (v: unknown) => `at least ${v} character${v === 1 ? "" : "s"}`,
  maxLength: (v: unknown) => `at most ${v} characters`,
  minimum: (v: unknown) => `at least ${v}`,
  maximum: (v: unknown) => `at most ${v}`,
  exclusiveMinimum: (v: unknown) => `more than ${v}`,
  exclusiveMaximum: (v: unknown) => `less than ${v}`,
  minItems: (v: unknown) => `at least ${v} entr${v === 1 ? "y" : "ies"}`,
  maxItems: (v: unknown) => `at most ${v} entries`,
  uniqueItems: (v: unknown) => (v ? "no duplicates" : ""),
  minProperties: (v: unknown) => (v === 1 ? "not empty" : `at least ${v} entries`),
  maxProperties: (v: unknown) => `at most ${v} entries`,
}));
export const FORMAT_HINTS = new Map<string, string>(Object.entries({
  date: "a date like 2026-11-05",
  "date-time": "a timestamp with time zone like 2026-11-05T14:00:00Z",
  uri: "a full web address",
  iri: "a full web address",
}));

const words = (c: Record<string, unknown>) => Object.entries(c).map(([k, v]) => WORDS.get(k)?.(v) ?? `${k}: ${JSON.stringify(v)}`).filter(Boolean);

export function constraintWords(n: FieldNode): string[] {
  const out = words(n.constraints);
  const each = [...words(n.itemConstraints), ...(n.array ? uniqHints(n) : [])];
  if (each.length) out.push(`each entry: ${each.join(", ")}`);
  if (!n.array) out.push(...uniqHints(n));
  for (const p of n.keyPatterns) out.push(`keys match \`${p}\``);
  return out;
}
const uniqHints = (n: FieldNode) => [...new Set(n.formats.map((f) => FORMAT_HINTS.get(f)).filter(Boolean))];
