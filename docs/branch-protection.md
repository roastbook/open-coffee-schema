# Branch protection proposal

Status: proposal. Not applied; changing branch protection needs a maintainer's go-ahead ([GOVERNANCE.md](GOVERNANCE.md)). Apply it as a repository ruleset on `main` (Settings → Rules → Rulesets) once agreed.

| Rule | Setting | Why |
|---|---|---|
| Require a pull request | 1 approval; dismiss stale approvals on new commits | Every change is reviewed. |
| Required status checks | `Roastbook · ☕ Cupping (validate) / Validate` (validate.sh), its actionlint job, `Roastbook · 🔥 Roast (build) / Build`; require branches to be up to date | Schemas, examples, immutability, breaking changes and the site build pass before merge. |
| Require signed commits | on | Commits on `main` are verified. Squash merges made in the GitHub UI are signed by GitHub. |
| Merge method | squash only (repository setting); delete branches after merge | Linear history with one Conventional Commit per pull request, which git-cliff turns into release notes. |
| Require linear history | on | Follows from squash merges. |
| Block force pushes and deletions | on | Tags and published history stay intact. |
| Tag protection | ruleset on `v*`: only the release workflow's GitHub App may create; nobody may update or delete | Published schema versions are identified by tags. |
| Bypass list | none (the release App only for `v*` tag creation) | |

DCO sign-off is checked by a DCO app or check on pull requests; add it to the required checks when it is installed.
