/* eslint-disable security/detect-non-literal-fs-filename -- The local validator inspects repository files, tag paths and its own CI report beneath ROOT. */
// All repository checks. Called by scripts/validate.sh, locally and in CI. Exit code 1 on any failure.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import jsonld from "jsonld";
import { BASE_URL, FILE_RE, cmpSemver, familyVersions, latestSchema, versionsOf, loadSchemas, Registry, type Json, type SchemaFile } from "../lib/schemas.ts";
import { buildModel, flatten, type FieldNode, type Model } from "../lib/tree.ts";
import { checkBump, diffModels } from "../lib/diff.ts";
import { addOpenCoffeeFormats } from "../lib/formats.ts";
import { generated } from "./generate.ts";

const ROOT = join(import.meta.dirname, "..");
const failures: string[] = [];
const warnings: string[] = [];
let filesValidated = 0, recordsValidated = 0;

async function check(name: string, fn: () => unknown) {
  const before = failures.length;
  try { await fn(); } catch (e) { failures.push(`${name}: ${(e as Error).message}`); }
  const failed = failures.slice(before);
  console.log(`${failed.length ? "✗" : "✓"} ${name}`);
  for (const f of failed) console.log(`    ${f.replace(/\n/g, "\n    ")}`);
}
const fail = (msg: string) => failures.push(msg);
const git = (...args: string[]) => execFileSync("git", args, { cwd: ROOT, encoding: "buffer", stdio: ["ignore", "pipe", "ignore"] });

const files = loadSchemas(ROOT);
const reg = new Registry(files);
const families = familyVersions(files);
const newAjv = () => { const ajv = new Ajv2020({ strict: true, allErrors: true }); addFormats(ajv); addOpenCoffeeFormats(ajv); for (const f of files) ajv.addSchema(f.json); return ajv; };

function checkSchemaFileName(family: string, name: string): void {
  const path = `schemas/${family}/${name}`;
  if (name.endsWith(".jsonld")) {
    const context = /^([a-z0-9-]+)\.context\.v\d+\.\d+\.\d+\.jsonld$/.exec(name);
    if (context?.[1] !== family) fail(`${path}: context files are named <family>.context.vX.Y.Z.jsonld`);
    return;
  }
  const match = FILE_RE.exec(name);
  if (!match || match[1] !== family) fail(`${path}: schema files are named ${family}.schema.vX.Y.Z.json`);
}

function checkSchemaIdentity(f: SchemaFile): void {
  filesValidated++;
  if (f.json.$id !== f.expectedId) fail(`${f.path}: $id is ${f.json.$id}, expected ${f.expectedId}`);
  if (f.json.$schema !== "https://json-schema.org/draft/2020-12/schema") fail(`${f.path}: $schema must be https://json-schema.org/draft/2020-12/schema`);
  for (const ref of JSON.stringify(f.json).match(/"\$ref":"[^"]+"/g) ?? []) {
    const target = ref.slice(8, -1).split("#")[0];
    if (target && !target.startsWith(BASE_URL)) fail(`${f.path}: $ref ${target} points outside ${BASE_URL}`);
  }
}

await check("1. File names, versions and $id", () => {
  for (const family of readdirSync(join(ROOT, "schemas"), { withFileTypes: true })) {
    if (!family.isDirectory()) { if (family.name !== "LICENSE.md") fail(`unexpected file schemas/${family.name}`); continue; }
    for (const name of readdirSync(join(ROOT, "schemas", family.name))) checkSchemaFileName(family.name, name);
  }

  for (const file of files) checkSchemaIdentity(file);
});

await check("2. Schemas against the 2020-12 meta-schema (Ajv strict + ajv-formats), explorer renderer", () => {
  const ajv = newAjv();
  for (const f of files) {
    if (!ajv.validateSchema(f.json)) fail(`${f.path}: ${ajv.errorsText(ajv.errors)}`);
    try { ajv.getSchema(f.json.$id); } catch (e) { fail(`${f.path}: ${(e as Error).message}`); }
    try {
      const undocumented = buildModel(f, reg).sections.flatMap((s) => flatten(s.root)).filter((n) => n.path && !n.description && !n.title);
      if (undocumented.length && f === families.get(f.family)?.at(-1)) warnings.push(`${f.path}: ${undocumented.length} fields without a description (the explorer shows "—"): ${undocumented.slice(0, 8).map((n) => n.path).join(", ")}${undocumented.length > 8 ? ", …" : ""}`);
    } catch (e) { fail(`${f.path}: ${(e as Error).message}`); }
  }
});

/**
 * Ranges ({ min, typical, max }) must be ordered. JSON Schema cannot compare two values, so this runs on the examples;
 * data repositories run the same check on their data.
 */
function rangeProblems(data: Json, path = ""): string[] {
  if (!data || typeof data !== "object") return [];
  const out = Object.entries(data).flatMap(([k, v]) => rangeProblems(v, `${path}/${k}`));
  // eslint-disable-next-line security/detect-object-injection -- Only the literal min, typical and max keys are read.
  const nums = ["min", "typical", "max"].filter((k) => typeof data[k] === "number").map((k) => [k, data[k] as number] as const);
  // eslint-disable-next-line security/detect-object-injection -- i is a bounded loop index into the locally constructed range array.
  for (let i = 1; i < nums.length; i++) if (nums[i - 1][1] > nums[i][1]) out.push(`${path || "/"}: ${nums[i - 1][0]} ${nums[i - 1][1]} is greater than ${nums[i][0]} ${nums[i][1]}`);
  return out;
}

function exampleRecordCount(schemaId: string, data: Json): number {
  const file = files.find((f) => f.json.$id === schemaId);
  if (!file) throw new Error(`Unknown example schema ${schemaId}`);
  const key = buildModel(file, reg).recordKey;
  // eslint-disable-next-line security/detect-object-injection -- key is the record property discovered from the validated repository schema.
  return key ? data[key].length : 1;
}

type ExampleKind = "valid" | "invalid";
type Validator = NonNullable<ReturnType<ReturnType<typeof newAjv>["getSchema"]>>;

function validateExampleDirectory(ajv: ReturnType<typeof newAjv>, family: string, kind: ExampleKind): void {
  const dir = join(ROOT, "examples", family, kind);
  for (const name of existsSync(dir) ? readdirSync(dir).filter((n) => n.endsWith(".json")) : []) {
    const path = `examples/${family}/${kind}/${name}`;
    filesValidated++;
    const data = JSON.parse(readFileSync(join(dir, name), "utf8"));
    validateExample(ajv, family, kind, path, data);
  }
}

function validateExample(ajv: ReturnType<typeof newAjv>, family: string, kind: ExampleKind, path: string, data: Json): void {
  // Invalid examples may break $schema deliberately, so use the family's latest schema then.
  const schemaId = typeof data.$schema === "string" && reg.byId.has(data.$schema) ? data.$schema : latestSchema(versionsOf(families, family)).json.$id;
  if (kind === "valid" && schemaId !== data.$schema) { fail(`${path}: $schema must name an existing schema file`); return; }
  const validate = ajv.getSchema(schemaId);
  if (!validate) throw new Error(`No validator for ${schemaId}`);
  const ok = validate(data), ranges = rangeProblems(data);
  checkExampleResult(ajv, validate, { kind, path, ok, ranges });
  if (kind === "valid" && ok) recordsValidated += exampleRecordCount(schemaId, data);
}

function checkExampleResult(ajv: ReturnType<typeof newAjv>, validate: Validator, result: { kind: ExampleKind; path: string; ok: boolean | Promise<unknown>; ranges: string[] }): void {
  const { kind, path, ok, ranges } = result;
  if (kind === "valid" && !ok) fail(`${path}: ${ajv.errorsText(validate.errors, { dataVar: "" })}`);
  if (kind === "valid" && ranges.length) fail(`${path}: ${ranges.join("; ")}`);
  if (kind === "invalid" && ok && !ranges.length) fail(`${path}: passed validation but should fail`);
}

await check("3. Examples: valid pass, invalid fail", () => {
  if (rangeProblems({ r: { min: 3, typical: 2, max: 4 } }).length !== 1 || rangeProblems({ r: { min: 1, max: 1 } }).length) fail("rangeProblems self-check failed");
  const ajv = newAjv();
  for (const family of readdirSync(join(ROOT, "examples"), { withFileTypes: true }).filter((d) => d.isDirectory())) {
    if (!families.has(family.name)) fail(`examples/${family.name}: no schema family of that name`);
    for (const kind of ["valid", "invalid"] as const) validateExampleDirectory(ajv, family.name, kind);
  }
  checkExampleCoverage();
});

function checkExampleCoverage(): void {
  for (const [family, versions] of families) {
    if (!buildModel(latestSchema(versions), reg).recordKey) continue;
    for (const kind of ["valid", "invalid"]) {
      const dir = join(ROOT, "examples", family, kind);
      if (!existsSync(dir) || !readdirSync(dir).some((n) => n.endsWith(".json"))) fail(`examples/${family}/${kind}/: add at least one example`);
    }
  }
}

await check("4. Breaking changes need a major bump (each version against the previous one)", () => {
  for (const [family, versions] of families) {
    for (let i = 1; i < versions.length; i++) {
      // eslint-disable-next-line security/detect-object-injection -- i is a bounded loop index into the discovered version list.
      const [a, b] = [versions[i - 1], versions[i]];
      const err = checkBump(a.version, b.version, diffModels(buildModel(a, reg), buildModel(b, reg)));
      if (err) fail(`${family}: ${err}`);
    }
  }
});

await check("5. Published files are immutable (byte-identical to every v* tag)", () => {
  let tags: string[];
  try { tags = git("tag", "--list", "v*").toString().split("\n").filter(Boolean); } catch { warnings.push("Not a git checkout; immutability check skipped."); return; }
  try { if (git("rev-parse", "--is-shallow-repository").toString().trim() === "true") warnings.push("Shallow clone: tags may be missing, so the immutability check may be incomplete. Check out with fetch-depth: 0."); } catch { /* not a repo */ }
  if (!tags.length) { console.log("    no v* tags yet: nothing published"); return; }
  for (const tag of tags) {
    for (const path of git("ls-tree", "-r", "--name-only", tag, "--", "schemas/").toString().split("\n").filter((p) => p && !p.endsWith("LICENSE.md"))) {
      const now = join(ROOT, path);
      if (!existsSync(now)) { fail(`${path} was published in ${tag} and has been deleted`); continue; }
      if (!git("show", `${tag}:${path}`).equals(readFileSync(now))) fail(`${path} differs from the published version in ${tag}; add a new version file instead`);
    }
  }
});

/** A value for every field of a node, so the JSON-LD check covers fields the examples do not use. */
function sample(n: FieldNode): Json {
  const value = sampleValue(n);
  return n.array ? [value] : value;
}

function sampleValue(n: FieldNode): Json {
  if (n.children.length) return Object.fromEntries(n.children.filter((c) => !c.forbidden).map((c) => [c.key === "*" ? "sample" : c.key, sample(c)]));
  if (n.enum) return n.enum[0];
  if (n.const !== undefined) return n.const;
  if (n.examples?.length) return n.examples[0];
  return sampleScalar(n);
}

function sampleScalar(n: FieldNode): Json {
  if (n.types.some((t) => t.includes("boolean"))) return true;
  if (n.types.some((t) => /number|integer/.test(t))) return 1;
  if (n.formats.includes("date")) return "2026-01-01";
  if (n.formats.includes("date-time")) return "2026-01-01T00:00:00Z";
  if (n.formats.some((f) => ["uri", "iri"].includes(f)) || n.patterns.some((p) => /^\^https/i.test(p))) return "https://example.com/sample";
  return "sample";
}

function contextDocuments(family: string, model: Model): [string, Json][] {
  const record = model.sections.find((s) => s.id === "field")?.root;
  if (!record) throw new Error(`No record section for ${family}`);
  const docs: [string, Json][] = [];
  const fileRoot = model.sections.find((s) => s.id === "file")?.root;
  if (fileRoot && model.recordKey) docs.push(["every field of the newest schema", { ...sample(fileRoot), [model.recordKey]: [sample(record)] }]);
  const exDir = join(ROOT, "examples", family, "valid");
  for (const name of existsSync(exDir) ? readdirSync(exDir) : []) docs.push([`examples/${family}/valid/${name}`, JSON.parse(readFileSync(join(exDir, name), "utf8"))]);
  return docs;
}

async function checkContextDocument({ ctx, model, family, label, context, doc }: { ctx: Json; model: Model; family: string; label: string; context: string; doc: Json }): Promise<void> {
  try {
    const safe = { safe: true } as const;
    const expanded = await jsonld.expand({ ...doc, "@context": ctx["@context"] }, safe);
    await jsonld.compact(expanded, ctx, safe);
    const recordKey = model.recordKey;
    if (family === "coffee-places" && recordKey) checkTypedPlaces({ ctx, recordKey, expanded, doc, label: `${context} with ${label}` });
  } catch (e) {
    const details = e instanceof Error && "details" in e ? e.details : undefined;
    const message = e instanceof Error ? e.message : String(e);
    const detailText = details ? " " + JSON.stringify(details) : "";
    fail(`${context} with ${label}: ${message}${detailText}`);
  }
}

function checkTypedPlaces({ ctx, recordKey, expanded, doc, label }: { ctx: Json; recordKey: string; expanded: Json[]; doc: Json; label: string }): void {
  // eslint-disable-next-line security/detect-object-injection -- recordKey comes from the repository schema; this only reads its context mapping.
  const recordTerm = ctx["@context"][recordKey];
  const recordIri = typeof recordTerm === "string" ? recordTerm : recordTerm?.["@id"];
  if (!recordIri) return;
  const full = recordIri.replace(/^schema:/, "https://schema.org/");
  // eslint-disable-next-line security/detect-object-injection -- full is the context-defined IRI used to read JSON-LD expansion results.
  const records = expanded.flatMap((n: Json) => n[full] ?? []);
  // eslint-disable-next-line security/detect-object-injection -- recordKey comes from the repository schema; this only reads record counts.
  const expected = doc[recordKey]?.length ?? 0;
  if (records.length !== expected) fail(`${label}: expected ${expected} records under ${full}, found ${records.length}`);
  for (const record of records) checkTypedPlace(record, label);
}

function checkTypedPlace(record: Json, label: string): void {
  if (!(record["@type"] ?? []).includes("https://schema.org/CafeOrCoffeeShop")) fail(`${label}: a place is not typed schema:CafeOrCoffeeShop`);
  if (typeof record["@id"] !== "string" || !record["@id"].startsWith("https://")) fail(`${label}: a place has no absolute IRI (@id)`);
}

await check("6. JSON-LD context: expands and compacts the valid examples losslessly, covers every field", async () => {
  for (const [family, versions] of families) {
    const dir = join(ROOT, "schemas", family);
    const contexts = readdirSync(dir).filter((n) => n.endsWith(".jsonld")).sort((a, b) => cmpSemver(a.split(".v")[1].slice(0, -7), b.split(".v")[1].slice(0, -7)));
    const context = contexts.at(-1);
    if (!context) continue;
    const ctx = JSON.parse(readFileSync(join(dir, context), "utf8"));
    filesValidated++;
    if (!ctx["@context"]) { fail(`${contexts.at(-1)}: missing @context`); continue; }
    const model = buildModel(latestSchema(versions), reg);
    const docs = contextDocuments(family, model);
    for (const [label, doc] of docs) await checkContextDocument({ ctx, model, family, label, context, doc });

  }
});

await check("7. Generated README stats block is up to date", () => {
  for (const [path, content] of generated(ROOT)) {
    if (!existsSync(join(ROOT, path)) || readFileSync(join(ROOT, path), "utf8") !== content) fail(`${path} is stale: run bun scripts/generate.ts and commit the result`);
  }
});

await check("8. Self-test: breaking-change rules, unknown keywords, playground error wording", async () => { await import("./self-test.ts"); });

const out = join(ROOT, ".ci", "report.json");
mkdirSync(join(ROOT, ".ci"), { recursive: true });
const report = existsSync(out) ? JSON.parse(readFileSync(out, "utf8")) : {};
const latest = families.get("coffee-places")?.at(-1)?.version;
writeFileSync(out, JSON.stringify({
  ...report,
  records_validated: recordsValidated,
  files_validated: filesValidated,
  versions: { ...report.versions, schema: latest },
  warnings: [...warnings, ...failures.map((f) => `FAILED ${f.split("\n")[0]}`)],
}, null, 2) + "\n");

for (const w of warnings) console.log(`! ${w}`);
console.log(failures.length ? `\n${failures.length} check(s) failed.` : `\nAll checks passed: ${filesValidated} files, ${recordsValidated} example records.`);
process.exit(failures.length ? 1 : 0);
