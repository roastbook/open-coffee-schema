// Build-time access to the schemas, examples and contexts in the repository root.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { familyOrder, familyVersions, loadSchemas, Registry, type SchemaFile } from "../../../lib/schemas.ts";
import { buildModel, type Model } from "../../../lib/tree.ts";

// Astro runs from site/; bundled page code cannot rely on import.meta.url.
export const ROOT = existsSync(resolve(process.cwd(), "schemas")) ? process.cwd() : resolve(process.cwd(), "..");
export const files = loadSchemas(ROOT);
export const reg = new Registry(files);
export const families = familyVersions(files);
export const familyNames = familyOrder([...families.keys()]);
export const latestOf = (family: string) => families.get(family)!.at(-1)!;
export const buildDate = new Date().toISOString().slice(0, 10);

const models = new Map<SchemaFile, Model>();
export const modelOf = (f: SchemaFile) => models.get(f) ?? models.set(f, buildModel(f, reg)).get(f)!;

export interface Example { family: string; kind: "valid" | "invalid"; name: string; text: string }
export function examplesOf(family: string): Example[] {
  return (["valid", "invalid"] as const).flatMap((kind) => {
    const dir = join(ROOT, "examples", family, kind);
    return existsSync(dir)
      ? readdirSync(dir).filter((n) => n.endsWith(".json")).sort().map((name) => ({ family, kind, name, text: readFileSync(join(dir, name), "utf8") }))
      : [];
  });
}

/** JSON-LD context files of a family, newest last. */
export const contextsOf = (family: string) =>
  readdirSync(join(ROOT, "schemas", family)).filter((n) => n.endsWith(".jsonld")).sort();
