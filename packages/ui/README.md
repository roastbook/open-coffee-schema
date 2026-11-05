# @roastbook/open-coffee-ui

Shared layout, header, footer and design tokens for the Open Coffee Schema Explorer and the Open Coffee Data Explorer. Tokens mirror the Roastbook app (`roastbook/DESIGN.md`).

```astro
---
import Layout from "@roastbook/open-coffee-ui/Layout.astro";
import { fieldUrl } from "@roastbook/open-coffee-ui/sites";
---
<Layout title="Munich" site="data" version="2026.11.05.1" buildDate="2026-11-05">
  <a href={fieldUrl("serving.filter")}>filter</a>
</Layout>
```

`open-coffee-data` installs it from this repository at a pinned commit (`github:Roastbook/open-coffee-schema#<sha>&path:packages/ui`); Renovate bumps the commit.

Licences: code and tokens Apache-2.0; `assets/` (logo) all rights reserved, see `assets/LICENSE.md`.
