// All repository checks. Called by scripts/validate.sh, locally and in CI. Exit code 1 on any failure.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import jsonld from "jsonld";
import { BASE_URL, FILE_RE, cmpSemver, familyVersions, loadSchemas, Registry, type Json } from "../lib/schemas.ts";
import { buildModel, flatten, type FieldNode } from "../lib/tree.ts";
import { checkBump, diffModels } from "../lib/diff.ts";
import { addOpenCoffeeFormats } from "../lib/formats.ts";
import { generated } from "./generate.ts";

const ROOT = join(import.meta.dirname, "..");
const failures: string[] = [];
const warnings: string[] = [];
let filesValidated = 0, recordsValidated = 0;

async function check(name: string, fn: () => unknown | Promise<unknown>) {
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

await check("1. File names, versions and $id", () => {
  for (const family of readdirSync(join(ROOT, "schemas"), { withFileTypes: true })) {
    if (!family.isDirectory()) { if (family.name !== "LICENSE.md") fail(`unexpected file schemas/${family.name}`); continue; }
    for (const name of readdirSync(join(ROOT, "schemas", family.name))) {
      const path = `schemas/${family.name}/${name}`;
      if (name.endsWith(".jsonld")) {
        if (!new RegExp(`^${family.name}\\.context\\.v\\d+\\.\\d+\\.\\d+\\.jsonld$`).test(name)) fail(`${path}: context files are named <family>.context.vX.Y.Z.jsonld`);
        continue;
      }
      const m = FILE_RE.exec(name);
      if (!m || m[1] !== family.name) fail(`${path}: schema files are named ${family.name}.schema.vX.Y.Z.json`);
    }
  }
  for (const f of files) {
    filesValidated++;
    if (f.json.$id !== f.expectedId) fail(`${f.path}: $id is ${f.json.$id}, expected ${f.expectedId}`);
    if (f.json.$schema !== "https://json-schema.org/draft/2020-12/schema") fail(`${f.path}: $schema must be https://json-schema.org/draft/2020-12/schema`);
    for (const ref of JSON.stringify(f.json).match(/"\$ref":"[^"]+"/g) ?? []) {
      const target = ref.slice(8, -1).split("#")[0];
      if (target && !target.startsWith(BASE_URL)) fail(`${f.path}: $ref ${target} points outside ${BASE_URL}`);
    }
  }
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
  const nums = ["min", "typical", "max"].filter((k) => typeof data[k] === "number").map((k) => [k, data[k] as number] as const);
  for (let i = 1; i < nums.length; i++) if (nums[i - 1][1] > nums[i][1]) out.push(`${path || "/"}: ${nums[i - 1][0]} ${nums[i - 1][1]} is greater than ${nums[i][0]} ${nums[i][1]}`);
  return out;
}

await check("3. Examples: valid pass, invalid fail", () => {
  if (rangeProblems({ r: { min: 3, typical: 2, max: 4 } }).length !== 1 || rangeProblems({ r: { min: 1, max: 1 } }).length) fail("rangeProblems self-check failed");
  const ajv = newAjv();
  for (const family of readdirSync(join(ROOT, "examples"), { withFileTypes: true }).filter((d) => d.isDirectory())) {
    if (!families.has(family.name)) fail(`examples/${family.name}: no schema family of that name`);
    for (const kind of ["valid", "invalid"] as const) {
      const dir = join(ROOT, "examples", family.name, kind);
      for (const name of existsSync(dir) ? readdirSync(dir).filter((n) => n.endsWith(".json")) : []) {
        const path = `examples/${family.name}/${kind}/${name}`;
        filesValidated++;
        const data = JSON.parse(readFileSync(join(dir, name), "utf8"));
        // Invalid examples may break $schema on purpose; they are checked against the family's newest version then.
        const schemaId = typeof data.$schema === "string" && reg.byId.has(data.$schema) ? data.$schema : families.get(family.name)?.at(-1)?.json.$id;
        if (kind === "valid" && schemaId !== data.$schema) { fail(`${path}: $schema must name an existing schema file`); continue; }
        const validate = ajv.getSchema(schemaId)!;
        const ok = validate(data), ranges = rangeProblems(data);
        if (kind === "valid" && !ok) fail(`${path}: ${ajv.errorsText(validate.errors, { dataVar: "" })}`);
        if (kind === "valid" && ranges.length) fail(`${path}: ${ranges.join("; ")}`);
        if (kind === "invalid" && ok && !ranges.length) fail(`${path}: passed validation but should fail`);
        if (kind === "valid" && ok) { const key = buildModel(files.find((f) => f.json.$id === schemaId)!, reg).recordKey; recordsValidated += key ? data[key].length : 1; }
      }
    }
  }
  for (const [family, versions] of families) {
    if (!buildModel(versions.at(-1)!, reg).recordKey) continue;
    for (const kind of ["valid", "invalid"]) {
      const dir = join(ROOT, "examples", family, kind);
      if (!existsSync(dir) || !readdirSync(dir).some((n) => n.endsWith(".json"))) fail(`examples/${family}/${kind}/: add at least one example`);
    }
  }
});

await check("4. Breaking changes need a major bump (each version against the previous one)", () => {
  for (const [family, versions] of families) {
    for (let i = 1; i < versions.length; i++) {
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
  let v: Json;
  if (n.children.length) v = Object.fromEntries(n.children.filter((c) => !c.forbidden).map((c) => [c.key === "*" ? "sample" : c.key, sample(c)]));
  else if (n.enum) v = n.enum[0];
  else if (n.const !== undefined) v = n.const;
  else if (n.examples?.length) v = n.examples[0];
  else if (n.types.some((t) => t.includes("boolean"))) v = true;
  else if (n.types.some((t) => /number|integer/.test(t))) v = 1;
  else if (n.formats.includes("date")) v = "2026-01-01";
  else if (n.formats.includes("date-time")) v = "2026-01-01T00:00:00Z";
  else if (n.formats.some((f) => f === "uri" || f === "iri") || n.patterns.some((p) => /^\^https/i.test(p))) v = "https://example.com/sample";
  else v = "sample";
  return n.array ? [v] : v;
}

await check("6. JSON-LD context: expands and compacts the valid examples losslessly, covers every field", async () => {
  for (const [family, versions] of families) {
    const dir = join(ROOT, "schemas", family);
    const contexts = readdirSync(dir).filter((n) => n.endsWith(".jsonld")).sort((a, b) => cmpSemver(a.split(".v")[1].slice(0, -7), b.split(".v")[1].slice(0, -7)));
    if (!contexts.length) continue;
    const ctx = JSON.parse(readFileSync(join(dir, contexts.at(-1)!), "utf8"));
    filesValidated++;
    if (!ctx["@context"]) { fail(`${contexts.at(-1)}: missing @context`); continue; }
    const safe = { safe: true } as const;
    const model = buildModel(versions.at(-1)!, reg);
    const record = model.sections.find((s) => s.id === "field")!.root;
    const docs: [string, Json][] = [];
    const fileRoot = model.sections.find((s) => s.id === "file")?.root;
    if (fileRoot && model.recordKey) docs.push(["every field of the newest schema", { ...sample(fileRoot), [model.recordKey]: [sample(record)] }]);
    const exDir = join(ROOT, "examples", family, "valid");
    for (const name of existsSync(exDir) ? readdirSync(exDir) : []) docs.push([`examples/${family}/valid/${name}`, JSON.parse(readFileSync(join(exDir, name), "utf8"))]);
    for (const [label, doc] of docs) {
      try {
        const expanded = await jsonld.expand({ ...doc, "@context": ctx["@context"] }, safe);
        await jsonld.compact(expanded, ctx, safe);
        // Every record must come out as a typed node with an IRI, e.g. a schema.org CafeOrCoffeeShop.
        const recordTerm = model.recordKey ? ctx["@context"][model.recordKey] : undefined;
        const recordIri = typeof recordTerm === "string" ? recordTerm : recordTerm?.["@id"];
        if (recordIri && family === "coffee-places") {
          const full = recordIri.replace(/^schema:/, "https://schema.org/");
          const records = expanded.flatMap((n: Json) => n[full] ?? []);
          if (records.length !== (doc[model.recordKey!]?.length ?? 0)) fail(`${contexts.at(-1)} with ${label}: expected ${doc[model.recordKey!]?.length} records under ${full}, found ${records.length}`);
          for (const r of records) {
            if (!(r["@type"] ?? []).includes("https://schema.org/CafeOrCoffeeShop")) fail(`${contexts.at(-1)} with ${label}: a place is not typed schema:CafeOrCoffeeShop`);
            if (typeof r["@id"] !== "string" || !/^https:\/\//.test(r["@id"])) fail(`${contexts.at(-1)} with ${label}: a place has no absolute IRI (@id)`);
          }
        }
      } catch (e) {
        const details = (e as Json).details?.event?.details;
        fail(`${contexts.at(-1)} with ${label}: ${(e as Error).message}${details ? ` ${JSON.stringify(details)}` : ""}`);
      }
    }
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
