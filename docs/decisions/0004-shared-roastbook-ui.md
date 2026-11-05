# 0004: Share UI across Roastbook projects

Status: accepted (2026-11-05)

The app, marketing website and Open Coffee explorers use `@roastbook/ui` from
`Roastbook/ui`. The React primitives and all six themes originate in the
Roastbook app's shadcn Base UI components. The existing Astro header, footer,
layout and mark move to the same package and use its semantic colour tokens.
Astro sites retain static rendering without React hydration.

This supersedes the UI package ownership in decisions 0001 and 0002. Schema
releases publish only the schema package; UI changes have their own history.
Consumers pin a public Git commit and lock dependencies with Bun. The old public
logo path remains for existing links; it is not a second UI implementation.
