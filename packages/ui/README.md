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

The release workflow publishes it to the GitHub npm registry (`https://npm.pkg.github.com`) with the same version as `@roastbook/open-coffee-schema`; `open-coffee-data` installs it from there. Configure the `@roastbook` scope as described in [`packages/schema/README.md`](../schema/README.md#install). Inside this repository the Schema Explorer uses it through the Bun workspace (`workspace:*`).

Licence: MIT.
