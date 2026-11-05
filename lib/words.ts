// Plain-language wording for field constraints, shared by the explorer, the field docs and the playground.
import type { FieldNode } from "./tree.ts";

const WORDS: Record<string, (v: any) => string> = {
  minLength: (v) => `at least ${v} character${v === 1 ? "" : "s"}`,
  maxLength: (v) => `at most ${v} characters`,
  minimum: (v) => `at least ${v}`,
  maximum: (v) => `at most ${v}`,
  exclusiveMinimum: (v) => `more than ${v}`,
  exclusiveMaximum: (v) => `less than ${v}`,
  minItems: (v) => `at least ${v} entr${v === 1 ? "y" : "ies"}`,
  maxItems: (v) => `at most ${v} entries`,
  uniqueItems: (v) => (v ? "no duplicates" : ""),
  minProperties: (v) => (v === 1 ? "not empty" : `at least ${v} entries`),
  maxProperties: (v) => `at most ${v} entries`,
};
export const FORMAT_HINTS: Record<string, string> = {
  date: "a date like 2026-11-05",
  "date-time": "a timestamp with time zone like 2026-11-05T14:00:00Z",
  uri: "a full web address",
};

export function constraintWords(n: FieldNode): string[] {
  const out = Object.entries(n.constraints).map(([k, v]) => WORDS[k]?.(v) ?? `${k}: ${JSON.stringify(v)}`).filter(Boolean);
  if (n.format && FORMAT_HINTS[n.format]) out.push(FORMAT_HINTS[n.format]);
  if (n.keyPattern) out.push(`keys match \`${n.keyPattern}\``);
  return out;
}
