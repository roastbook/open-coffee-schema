// Structural diff between two versions of a family, classified by the semver bump it needs.
import { flatten, type FieldNode, type Model } from "./tree.ts";
import { cmpSemver, parseSemver } from "./schemas.ts";

export type Severity = "breaking" | "addition" | "patch";
export interface Change { anchor: string; path: string; section: string; severity: Severity; text: string }

const MIN_LIKE = ["minLength", "minimum", "exclusiveMinimum", "minItems", "minProperties"];
const MAX_LIKE = ["maxLength", "maximum", "exclusiveMaximum", "maxItems", "maxProperties"];
const show = (v: unknown) => (typeof v === "string" ? `"${v}"` : JSON.stringify(v));

/** Whether a value of JSON type `t` is still accepted by a field typed `types` (integer fits number; array<x> compares items). */
function covered(t: string, types: string[]): boolean {
  if (types.includes(t) || types.includes("any") || (t === "integer" && types.includes("number"))) return true;
  const inner = /^array<(.*)>$/.exec(t)?.[1];
  return inner !== undefined && types.some((u) => /^array<(.*)>$/.test(u) && inner.split("|").every((x) => covered(x, u.slice(6, -1).split("|"))));
}

function index(m: Model) {
  const out = new Map<string, { node: FieldNode; section: string }>();
  for (const s of m.sections) for (const node of flatten(s.root)) out.set(node.anchor, { node, section: s.title });
  return out;
}

export function diffModels(a: Model, b: Model): Change[] {
  const A = index(a), B = index(b), changes: Change[] = [];
  const add = (anchor: string, path: string, section: string, severity: Severity, text: string) => changes.push({ anchor, path, section, severity, text });

  removedFields(A, B, changes);
  for (const [anchor, { node, section }] of B) {
    const old = A.get(anchor)?.node;
    if (!old) {
      const parent = anchor.includes(".") ? anchor.slice(0, anchor.lastIndexOf(".")) : undefined;
      if (parent && !A.has(parent)) continue; // reported with its new parent
      add(anchor, node.path, section, node.required ? "breaking" : "addition", node.required ? "New required field." : "New optional field.");
      continue;
    }
    const c = (sev: Severity, text: string) => add(anchor, node.path, section, sev, text);
    requiredChanges(old, node, c);
    typeChanges(old, node, c);
    enumChanges(old, node, c);
    constChanges(old, node, c);
    stringChanges(old, node, c);
    constraintChanges(old.constraints, node.constraints, "", c);
    constraintChanges(old.itemConstraints, node.itemConstraints, "Each entry: ", c);
    conditionChanges(old, node, A, B, c);
    flagChanges(old, node, c);
    ruleChanges(old, node, c);
    annotationChanges(old, node, c);
  }
  return changes;
}

function removedFields(A: ReturnType<typeof index>, B: ReturnType<typeof index>, changes: Change[]) {
  for (const [anchor, { node, section }] of A) {
    if (B.has(anchor)) continue;
    const parent = anchor.includes(".") ? anchor.slice(0, anchor.lastIndexOf(".")) : undefined;
    if (!parent || B.has(parent)) changes.push({ anchor, path: node.path, section, severity: "breaking", text: "Field removed." });
  }
}

type ReportChange = (severity: Severity, text: string) => void;

function requiredChanges(old: FieldNode, node: FieldNode, c: ReportChange) {
  if (!old.required && node.required) c("breaking", "Now required.");
  if (old.required && !node.required) c("addition", "No longer required.");
}

function typeChanges(old: FieldNode, node: FieldNode, c: ReportChange) {
  const lost = old.types.filter((t) => !covered(t, node.types));
  const gained = node.types.filter((t) => !covered(t, old.types));
  if (lost.length) c("breaking", `Type narrowed: ${old.types.join(" | ") || "none"} → ${node.types.join(" | ") || "none"}.`);
  else if (gained.length) c("addition", `Type widened: ${old.types.join(" | ")} → ${node.types.join(" | ")}.`);
}

function enumChanges(old: FieldNode, node: FieldNode, c: ReportChange) {
  if (old.enum && node.enum) {
    const removed = old.enum.filter((v) => !node.enum!.some((w) => show(w) === show(v)));
    const added = node.enum.filter((v) => !old.enum!.some((w) => show(w) === show(v)));
    if (removed.length) c("breaking", `Allowed values removed: ${removed.map(show).join(", ")}.`);
    if (added.length) c("addition", `Allowed values added: ${added.map(show).join(", ")}.`);
  } else if (!old.enum && node.enum) c("breaking", `Restricted to the values ${node.enum.map(show).join(", ")}.`);
  else if (old.enum && !node.enum) c("addition", "No longer restricted to a fixed set of values.");
}

function constChanges(old: FieldNode, node: FieldNode, c: ReportChange) {
  if (show(old.const) !== show(node.const)) {
    if (node.const === undefined) c("addition", `Fixed value ${show(old.const)} removed.`);
    else c("breaking", old.const === undefined ? `Fixed value ${show(node.const)} added.` : `Fixed value changed from ${show(old.const)} to ${show(node.const)}.`);
  }
}

function stringChanges(old: FieldNode, node: FieldNode, c: ReportChange) {
  // Every format and pattern applies on its own, so any new one tightens and any dropped one loosens.
  for (const [key, label] of [["formats", "Format"], ["patterns", "Pattern"], ["keyPatterns", "Key pattern"]] as const) {
    // eslint-disable-next-line security/detect-object-injection -- key is one of the three literal field-list names above.
    for (const v of node[key].filter((v) => !old[key].includes(v))) c("breaking", `${label} ${show(v)} added.`);
    // eslint-disable-next-line security/detect-object-injection -- key is one of the three literal field-list names above.
    for (const v of old[key].filter((v) => !node[key].includes(v))) c("addition", `${label} ${show(v)} removed.`);
  }
}

function flagChanges(old: FieldNode, node: FieldNode, c: ReportChange) {
  if (!old.closed && node.closed) c("breaking", "No longer accepts unknown properties.");
  if (old.closed && !node.closed) c("addition", "Now accepts unknown properties.");
  if (!old.forbidden && node.forbidden) c("breaking", "No longer allowed.");
  if (old.forbidden && !node.forbidden) c("addition", "Now allowed.");
}

function ruleChanges(old: FieldNode, node: FieldNode, c: ReportChange) {
  for (const r of node.rules.filter((r) => !old.rules.includes(r))) c("breaking", `New rule: ${r}`);
  for (const r of old.rules.filter((r) => !node.rules.includes(r))) c("addition", `Rule removed: ${r}`);
}

function annotationChanges(old: FieldNode, node: FieldNode, c: ReportChange) {
  if (old.description !== node.description || old.title !== node.title) c("patch", "Title or description changed.");
  if (show(old.examples) !== show(node.examples)) c("patch", "Examples changed.");
}

function tighterLimit(key: string, before: unknown, after: unknown): boolean {
  if (key === "uniqueItems") return after === true;
  if (after === undefined) return false;
  if (before === undefined) return true;
  if (typeof before !== "number" || typeof after !== "number") throw new Error(`Non-numeric limit ${key}`);
  return MIN_LIKE.includes(key) ? after > before : before > after;
}

function constraintChanges(before: FieldNode["constraints"], after: FieldNode["constraints"], prefix: string, c: ReportChange) {
  for (const k of [...MIN_LIKE, ...MAX_LIKE, "uniqueItems"]) {
    // eslint-disable-next-line security/detect-object-injection -- k is drawn only from the fixed constraint keyword lists.
    const o = before[k], n = after[k];
    if (o === n) continue;
    const action = o === undefined ? "added" : n === undefined ? "removed" : "changed";
    c(tighterLimit(k, o, n) ? "breaking" : "addition", `${prefix}${k} ${action}: ${show(o) ?? "none"} → ${show(n) ?? "none"}.`);
  }
}

/** Values of the sibling field a condition tests: its enum, its const, or true/false. */
function domain(index: Map<string, { node: FieldNode }>, anchor: string, prop: string): unknown[] | undefined {
  const cut = anchor.includes(".") ? anchor.lastIndexOf(".") + 1 : anchor.indexOf("-") + 1;
  const n = index.get(anchor.slice(0, cut) + prop)?.node;
  if (!n) return undefined;
  return n.enum ?? (n.const !== undefined ? [n.const] : n.types.length === 1 && n.types[0] === "boolean" ? [true, false] : undefined);
}

/**
 * Compares the values of a sibling field for which a field is allowed. Only values that existed and allowed the field
 * before count as breaking, so a new enum value that forbids every existing detail field is an addition.
 */
function conditionPropertyChanged(old: FieldNode, node: FieldNode): boolean {
  return !!old.allowedWhen && !!node.allowedWhen && old.allowedWhen.prop !== node.allowedWhen.prop;
}

function conditionChanges(old: FieldNode, node: FieldNode, A: ReturnType<typeof index>, B: ReturnType<typeof index>, c: (s: Severity, t: string) => void) {
  const condition = node.allowedWhen ?? old.allowedWhen;
  if (!condition) return;
  const prop = condition.prop;
  if (conditionPropertyChanged(old, node)) {
    c("breaking", `Condition changed from ${old.allowedWhen?.prop} to ${node.allowedWhen?.prop}.`);
    return;
  }
  const before = old.allowedWhen?.values ?? domain(A, old.anchor, prop);
  const after = node.allowedWhen?.values ?? domain(B, node.anchor, prop);
  if (!before || !after) { c("breaking", `Condition on ${prop} changed.`); return; }
  const has = (xs: unknown[], v: unknown) => xs.some((w) => show(w) === show(v));
  const lost = before.filter((v) => !has(after, v)), gained = after.filter((v) => !has(before, v));
  if (lost.length) c("breaking", `No longer allowed when ${prop} is ${lost.map(show).join(", ")}.`);
  if (gained.length) c("addition", `Allowed when ${prop} is ${gained.map(show).join(", ")}.`);
}

export function requiredBump(changes: Change[]): "major" | "minor" | "patch" | "none" {
  if (changes.some((c) => c.severity === "breaking")) return "major";
  if (changes.some((c) => c.severity === "addition")) return "minor";
  return changes.length ? "patch" : "none";
}

function actualBump(from: string, to: string): string {
  const [a, b] = [parseSemver(from), parseSemver(to)];
  let actual = b[0] !== a[0] ? "major" : b[1] !== a[1] ? "minor" : b[2] !== a[2] ? "patch" : "none";
  // Pre-releases (0.x): a minor bump may break, a patch bump may add.
  if (a[0] === 0 && b[0] === 0) actual = actual === "minor" ? "major" : actual === "patch" ? "minor" : actual;
  return actual;
}

/** Returns an error message when going from version `from` to `to` does not bump enough for `changes`. */
export function checkBump(from: string, to: string, changes: Change[]): string | null {
  const actual = actualBump(from, to);
  const order = ["none", "patch", "minor", "major"];
  const severityBumps = new Map<Severity, string>([["breaking", "major"], ["addition", "minor"], ["patch", "patch"]]);
  if (cmpSemver(to, from) <= 0) return `v${to} is not newer than v${from}`;
  const need = requiredBump(changes);
  if (order.indexOf(actual) < order.indexOf(need)) {
    const why = changes.filter((c) => order.indexOf(severityBumps.get(c.severity)!) > order.indexOf(actual));
    return `v${from} → v${to} is a ${actual} bump, but the changes need a ${need} bump:\n${why.map((c) => `  - ${c.path || c.section}: ${c.text}`).join("\n")}`;
  }
  return null;
}
