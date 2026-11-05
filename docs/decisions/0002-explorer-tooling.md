# 0002: Schema Explorer tooling

Status: accepted (2026-11-05)

The Schema Explorer must render a property tree with types, required fields, enums and examples for every published version. It needs full JSON Schema draft 2020-12 support, the shared Roastbook theme, and stable per-field anchors that the Data Explorer can deep-link to (`/coffee-places/v1.0.0/#field-serving.filter`).

| Option | Licence | Stack | 2020-12 | Theming and anchors | Verdict |
|---|---|---|---|---|---|
| json-schema-for-humans 1.5 | Apache-2.0 | Python CLI, Jinja templates, static HTML | Partial: no `unevaluatedProperties`, `$dynamicRef`; `if/then/else` shown as text | Own templates; anchors generated from internal ids | Rejected: second toolchain (Python) next to an Astro site, theming means forking its templates |
| docusaurus-json-schema-plugin 1.15 | AGPL-3.0-or-later | Docusaurus (React) | Good | Docusaurus theme only | Rejected: AGPL conflicts with our Apache-2.0 site code, and it requires Docusaurus |
| @stoplight/json-schema-viewer 4.16 | Apache-2.0 | React component (Mosaic UI) | Partial (built for 4–2019-09; `$defs` ok, `unevaluatedProperties` ignored) | Mosaic styling; anchors not stable | Rejected: last release 2025-07, React runtime and Mosaic CSS in a static site |
| **In-house renderer over Ajv** | Apache-2.0 | Astro components (~300 lines) | Full: Ajv 2020 does all validation; the renderer walks the resolved schema | Shared tokens; anchors are dotted field paths | **Chosen** |

## Rationale

None of the three candidates gives full draft 2020-12 support together with our theme and stable anchors. Our schemas use a small, fixed subset of keywords (`$ref`, `$defs`, `properties`, `required`, `enum`, `const`, `items`, `allOf`, `if/else`, `unevaluatedProperties`), so a renderer for that subset is small, and Ajv (draft 2020 build) remains the single source of truth for validation in CI and in the browser playground. The renderer fails the build when it meets a keyword it does not know, so a future schema cannot silently render wrong.

Revisit if a maintained, Apache/MIT-licensed, framework-free renderer with full 2020-12 support appears.
