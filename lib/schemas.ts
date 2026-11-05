// Discovers the versioned schema files under schemas/<family>/ and resolves $refs between them.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

export const BASE_URL = "https://schema.roastbook.coffee/";
export const FILE_RE = /^([a-z0-9-]+)\.schema\.v(\d+\.\d+\.\d+)\.json$/;

export type Json = any;
export interface SchemaFile {
  family: string;
  version: string;
  /** Repository path, e.g. schemas/coffee-places/coffee-places.schema.v1.0.0.json */
  path: string;
  fileName: string;
  /** Canonical $id the file should have. */
  expectedId: string;
  raw: string;
  json: Json;
}

export const parseSemver = (v: string) => v.split(".").map(Number) as [number, number, number];
export const cmpSemver = (a: string, b: string) => {
  const x = parseSemver(a), y = parseSemver(b);
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
};

/** All schema files, sorted by family, then version ascending. Files not matching the naming rule are returned with version "". */
export function loadSchemas(root: string): SchemaFile[] {
  const dir = join(root, "schemas");
  const out: SchemaFile[] = [];
  for (const family of readdirSync(dir).sort()) {
    const fdir = join(dir, family);
    if (!statSync(fdir).isDirectory()) continue;
    for (const fileName of readdirSync(fdir).sort()) {
      if (!fileName.endsWith(".json")) continue;
      const m = FILE_RE.exec(fileName);
      const raw = readFileSync(join(fdir, fileName), "utf8");
      out.push({
        family,
        version: m && m[1] === family ? m[2] : "",
        path: `schemas/${family}/${fileName}`,
        fileName,
        expectedId: `${BASE_URL}${family}/${fileName}`,
        raw,
        json: JSON.parse(raw),
      });
    }
  }
  return out.sort((a, b) => a.family.localeCompare(b.family) || cmpSemver(a.version || "0.0.0", b.version || "0.0.0"));
}

/** family -> versions ascending */
export function familyVersions(files: SchemaFile[]): Map<string, SchemaFile[]> {
  const map = new Map<string, SchemaFile[]>();
  for (const f of files.filter((f) => f.version)) map.set(f.family, [...(map.get(f.family) ?? []), f]);
  return map;
}

/** Families in reading order: coffee places first, the shared building blocks last. */
export const familyOrder = (names: string[]) =>
  [...names].sort((a, b) => (a === "coffee-places" ? -1 : b === "coffee-places" ? 1 : a === "common" ? 1 : b === "common" ? -1 : a.localeCompare(b)));

export class Registry {
  byId = new Map<string, Json>();
  constructor(files: SchemaFile[]) {
    for (const f of files) this.byId.set(f.json.$id, f.json);
  }
  /** Resolves a $ref relative to the document `baseId`. Returns the target and the id of the document it lives in. */
  resolve(ref: string, baseId: string): { schema: Json; docId: string; pointer: string } {
    const [docPart, pointer = ""] = ref.split("#");
    const docId = docPart ? new URL(docPart, baseId).href : baseId;
    const doc = this.byId.get(docId);
    if (!doc) throw new Error(`Cannot resolve $ref ${ref} from ${baseId}: unknown document ${docId}`);
    let node = doc;
    for (const seg of pointer.split("/").filter(Boolean)) {
      node = node?.[decodeURIComponent(seg).replace(/~1/g, "/").replace(/~0/g, "~")];
      if (node === undefined) throw new Error(`Cannot resolve $ref ${ref} from ${baseId}`);
    }
    return { schema: node, docId, pointer };
  }
}
