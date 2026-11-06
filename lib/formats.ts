// Formats the schemas use that ajv-formats does not provide. Shared by validate.ts, the playground and the npm package.

/**
 * format "iri" (RFC 3987): an absolute IRI such as https://kaffee-münchen.de/über-uns. A scheme, no spaces or
 * characters URIs forbid, and accepted by the WHATWG URL parser. The npm package ships this function's source
 * (as Bun transpiles it), so it must not use imports or outer variables.
 */
export function isIri(value: unknown): boolean {
  // Control characters are deliberately excluded from IRIs.
  // eslint-disable-next-line no-control-regex
  if (typeof value !== "string" || !/^[A-Za-z][A-Za-z0-9+.-]*:[^\s<>"{}|\\^`\u0000-\u001f\u007f]+$/.test(value)) return false;
  try { return Boolean(new URL(value)); } catch { return false; }
}

/** Adds the formats above to an Ajv instance (after ajv-formats). */
export const addOpenCoffeeFormats = <T extends { addFormat(name: string, f: (v: string) => boolean): unknown }>(ajv: T): T => {
  ajv.addFormat("iri", isIri);
  return ajv;
};
