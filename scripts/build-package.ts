// Assembles the npm package @roastbook/open-coffee-schema from packages/schema/ and the schema files.
// Usage: bun scripts/build-package.ts <version> <outDir>. Called by scripts/release-assets.sh.
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { compile } from "json-schema-to-typescript";
import { BASE_URL, cmpSemver, familyOrder, familyVersions, loadSchemas, Registry, type Json } from "../lib/schemas.ts";
import { buildModel, flatten } from "../lib/tree.ts";
import { isIri } from "../lib/formats.ts";

const ROOT = join(import.meta.dirname, "..");
const [version, outDir] = process.argv.slice(2);
if (!/^\d+\.\d+\.\d+$/.test(version ?? "") || !outDir) {
  console.error("usage: bun scripts/build-package.ts <X.Y.Z> <outDir>");
  process.exit(2);
}

const files = loadSchemas(ROOT), reg = new Registry(files), families = familyVersions(files);
const names = familyOrder([...families.keys()]);

// Release rule (docs/runbook.md): no family may be newer than the release.
const ahead = names.map((f) => families.get(f)!.at(-1)!).filter((f) => cmpSemver(f.version, version) > 0);
if (ahead.length) {
  console.error(`error: release v${version} is older than ${ahead.map((f) => `${f.family} v${f.version}`).join(", ")}. Every family's newest schema version must be <= the release version; choose a larger bump.`);
  process.exit(1);
}

// ---- Type names --------------------------------------------------------------------------------
const pascal = (s: string) => s.replace(/(^|[^a-zA-Z0-9]+)([a-zA-Z0-9])/g, (_, __, c: string) => c.toUpperCase());
const PREFIX: Record<string, string> = { "coffee-places": "CoffeePlace", equipment: "Equipment", "brew-methods": "BrewMethod", common: "" };
const ROOT_NAME: Record<string, string> = { "coffee-places": "CoffeePlacesDataset", equipment: "EquipmentCatalog", "brew-methods": "BrewMethodsDataset" };
const DEF_NAME: Record<string, string> = {
  "coffee-places#place": "CoffeePlace", "coffee-places#tier": "SpecialtyTier",
  "brew-methods#brew_method": "BrewMethod", "brew-methods#parameter": "BrewParameter", "brew-methods#grind_size": "GrindSize",
  "brew-methods#paper_filter_position": "PaperFilterPosition", "brew-methods#distribution_method": "DistributionMethod",
  // Avoid shadowing globals such as Date and URL.
  "common#id": "OpenCoffeeId", "common#date": "IsoDate", "common#datetime": "IsoDateTime", "common#url": "HttpUrl",
};
const prefixOf = (family: string) => PREFIX[family] ?? pascal(family);
const defName = (family: string, def: string) => DEF_NAME[`${family}#${def}`] ?? prefixOf(family) + pascal(def);

/** A copy of the schema whose titles are the TypeScript names we want. */
function named(family: string, schema: Json): Json {
  const s = structuredClone(schema);
  const retitle = (node: Json, inDefs: boolean) => {
    if (!node || typeof node !== "object") return;
    // Annotations next to a $ref make json2ts emit a copy (Id1, Id2…); `true` properties only serve unevaluatedProperties.
    if (node.$ref) for (const k of ["title", "description", "examples"]) delete node[k];
    for (const [k, v] of Object.entries(node.properties ?? {})) if (v === true) delete node.properties[k];
    if (!inDefs && typeof node.title === "string" && node !== s) node.title = prefixOf(family) + pascal(node.title);
    for (const [k, v] of Object.entries(node)) {
      if (k === "$defs") continue;
      if (v && typeof v === "object") Array.isArray(v) ? v.forEach((x) => retitle(x, false)) : k === "properties" ? Object.values(v).forEach((x) => retitle(x, false)) : retitle(v, false);
    }
  };
  retitle(s, false);
  for (const [k, d] of Object.entries((s.$defs ?? {}) as Record<string, Json>)) {
    retitle(d, true);
    if (d && typeof d === "object") d.title = defName(family, k);
  }
  if (ROOT_NAME[family]) s.title = ROOT_NAME[family];
  return s;
}

const latest = names.map((f) => families.get(f)!.at(-1)!);
const served = new Map(files.map((f) => [f.json.$id, named(f.family, f.json)]));
const bundle = {
  title: "OpenCoffeeBundle",
  type: "object",
  additionalProperties: false,
  properties: Object.fromEntries(latest.flatMap((f) =>
    f.json.properties ? [[f.family, { $ref: f.json.$id }]] : Object.keys(f.json.$defs ?? {}).map((d) => [`${f.family}_${d}`, { $ref: `${f.json.$id}#/$defs/${d}` }]))),
};
let types = await compile(bundle as Json, "OpenCoffeeBundle", {
  bannerComment: "",
  declareExternallyReferenced: true,
  additionalProperties: false,
  unknownAny: true,
  strictIndexSignatures: true,
  ignoreMinAndMaxItems: true,
  format: true,
  $refOptions: {
    resolve: {
      http: false,
      file: false,
      roastbook: {
        order: 1,
        canRead: (f: { url: string }) => f.url.startsWith(BASE_URL),
        read: (f: { url: string }) => {
          const doc = served.get(f.url.split("#")[0]);
          if (!doc) throw new Error(`unknown schema ${f.url}`);
          return JSON.stringify(doc);
        },
      },
    } as Json,
  },
});
// The bundle interface only exists to pull every family into one file.
types = types.replace(/export interface OpenCoffeeBundle \{[\s\S]*?\n\}\n/, "");

// ---- Runtime: $id constants and enum value arrays -----------------------------------------------
const constName = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, "$1_$2").replace(/[^A-Za-z0-9]+/g, "_").toUpperCase();
const enums = new Map<string, unknown[]>();
for (const f of latest) {
  const m = buildModel(f, reg);
  for (const section of m.sections) {
    for (const n of flatten(section.root)) {
      if (!n.enum) continue;
      const def = /^([a-z0-9-]+)\.schema\.v[\d.]+\.json#\/\$defs\/([^/]+)$/.exec(n.ref ?? "");
      const name = def ? defName(def[1], def[2]) : `${prefixOf(f.family)}${pascal(n.path.replace(/\*/g, "entry"))}`;
      const key = `${constName(name)}_VALUES`, seen = enums.get(key);
      // The same definition is reached from several fields; two different value lists under one name are a naming clash.
      if (seen && JSON.stringify(seen) !== JSON.stringify(n.enum)) throw new Error(`Two enum value lists are both named ${key} (${f.family} ${n.path}); add a name to DEF_NAME.`);
      enums.set(key, n.enum);
    }
  }
}
const ids: Record<string, { latest: string; versions: Record<string, string> }> = {};
for (const f of names) ids[f] = { latest: families.get(f)!.at(-1)!.json.$id, versions: Object.fromEntries(families.get(f)!.map((v) => [v.version, v.json.$id])) };
const contexts = names.flatMap((family) => readdirSync(join(ROOT, "schemas", family)).filter((n) => n.endsWith(".jsonld")).sort().map((n) => ({ family, name: n })));

const js = [
  "// Generated by scripts/build-package.ts. Do not edit.",
  `export const SCHEMA_IDS = ${JSON.stringify(ids, null, 2)};`,
  ...[...enums].sort().map(([k, v]) => `export const ${k} = ${JSON.stringify(v)};`),
  "/** Validator for the \"iri\" format, which ajv-formats lacks: ajv.addFormat(\"iri\", isIri). */",
  `export ${isIri.toString()}`,
  "",
].join("\n");
const dts = [
  "// Generated by scripts/build-package.ts from the Open Coffee JSON Schemas. Do not edit.",
  types.trim(),
  "",
  `export declare const SCHEMA_IDS: ${JSON.stringify(ids, null, 2)};`,
  ...[...enums].sort().map(([k, v]) => `export declare const ${k}: readonly [${v.map((x) => JSON.stringify(x)).join(", ")}];`),
  "/** Validator for the \"iri\" format used by URL fields, which ajv-formats lacks: ajv.addFormat(\"iri\", isIri). */",
  "export declare function isIri(value: unknown): boolean;",
  "",
].join("\n");

// ---- Package -----------------------------------------------------------------------------------
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const exportsMap: Record<string, Json> = {
  ".": { types: "./index.d.ts", default: "./index.js" },
  "./schemas": { types: "./schemas.d.ts", default: "./schemas.js" },
  "./package.json": "./package.json",
};
for (const family of names) {
  mkdirSync(join(outDir, family));
  for (const f of families.get(family)!) {
    cpSync(join(ROOT, f.path), join(outDir, family, `v${f.version}.json`));
    exportsMap[`./${family}/v${f.version}.json`] = `./${family}/v${f.version}.json`;
  }
  cpSync(join(ROOT, families.get(family)!.at(-1)!.path), join(outDir, family, "latest.json"));
  exportsMap[`./${family}/latest.json`] = `./${family}/latest.json`;
}
for (const c of contexts) {
  const v = c.name.match(/\.v(\d+\.\d+\.\d+)\.jsonld$/)![1];
  cpSync(join(ROOT, "schemas", c.family, c.name), join(outDir, c.family, `context.v${v}.json`));
  exportsMap[`./${c.family}/context.v${v}.json`] = `./${c.family}/context.v${v}.json`;
}
const newest = new Map(contexts.map((c) => [c.family, c.name]));
for (const [family, name] of newest) {
  cpSync(join(ROOT, "schemas", family, name), join(outDir, family, "context.latest.json"));
  exportsMap[`./${family}/context.latest.json`] = `./${family}/context.latest.json`;
}

writeFileSync(join(outDir, "index.js"), js);
writeFileSync(join(outDir, "index.d.ts"), dts);
writeFileSync(join(outDir, "schemas.js"), [
  "// Generated by scripts/build-package.ts. Every schema version, keyed by $id. Do not edit.",
  `export const schemas = ${JSON.stringify(Object.fromEntries(files.map((f) => [f.json.$id, f.json])))};`,
  "export default schemas;",
  "",
].join("\n"));
writeFileSync(join(outDir, "schemas.d.ts"), [
  "// Generated by scripts/build-package.ts. Do not edit.",
  `export type SchemaId = ${files.map((f) => JSON.stringify(f.json.$id)).join(" | ")};`,
  "/** Every schema version, keyed by $id. Add them all to Ajv, then validate against an $id. */",
  "export declare const schemas: Record<SchemaId, Record<string, unknown>>;",
  "export default schemas;",
  "",
].join("\n"));

const template = JSON.parse(readFileSync(join(ROOT, "packages/schema/package.json"), "utf8"));
delete template.private;
delete template.scripts;
writeFileSync(join(outDir, "package.json"), JSON.stringify({ ...template, version, exports: exportsMap, main: "./index.js", types: "./index.d.ts" }, null, 2) + "\n");
cpSync(join(ROOT, "packages/schema/README.md"), join(outDir, "README.md"));
cpSync(join(ROOT, "LICENSE"), join(outDir, "LICENSE"));
console.log(`Built ${template.name}@${version} in ${outDir}: ${files.length} schemas, ${contexts.length} context(s), ${enums.size} enum value lists.`);
