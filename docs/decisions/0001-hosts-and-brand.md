# 0001: Canonical hosts and brand

Status: accepted (2026-11-05)

## Canonical hosts

| Host | Serves | Repository |
|---|---|---|
| `https://schema.roastbook.coffee/` | Schema files at their `$id`, the JSON-LD contexts and the Schema Explorer | `Roastbook/open-coffee-schema` |
| `https://data.roastbook.coffee/` | Dataset files, compiled artifacts (NDJSON, GeoJSON, GeoParquet) and the Data Explorer | `Roastbook/open-coffee-data` |

- A schema's `$id` is `https://schema.roastbook.coffee/<family>/<family>.schema.vX.Y.Z.json`. The repository path is the same with a `schemas/` prefix.
- `$id` URLs are permanent. Both hosts are GitHub Pages sites with a `CNAME` file; DNS has one CNAME record per host pointing at `roastbook.github.io`.
- `roastbook.github.io/<repo>` was rejected: it ties every published `$id` to one hosting provider.

## Brand

The open-coffee sites reuse the Roastbook app brand instead of inventing a second one:

- Colours: the Roastbook semantic tokens from `roastbook/DESIGN.md` (paper `#f6eddf`, ink `#3a2a1e`, amber `#aa612f`, Gruvbox-based dark palette). WCAG 2.2 AA contrast.
- Type: Bricolage Grotesque (display) and Hanken Grotesk (body), both SIL OFL 1.1, self-hosted.
- Logo: the three roast bars mark, redrawn as SVG in `packages/ui`.
- Tokens, header, footer and theme switch live in `packages/ui` (`@roastbook/open-coffee-ui`) and are consumed by both sites as a package, not copied.
- Brand assets are all rights reserved (see `packages/ui/assets/LICENSE.md`); code and tokens are Apache-2.0.
