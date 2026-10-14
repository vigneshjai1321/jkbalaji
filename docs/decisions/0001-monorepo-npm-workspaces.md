# 0001. npm workspaces monorepo
- Status: Accepted, 2026-10-07
## Context
Web, API, and shared contracts change together. There is one developer, and the tooling should be minimal and work on Windows and Linux.
## Decision
Use npm workspaces: `apps/web`, `apps/api`, `packages/shared`. Root scripts orchestrate the build order (shared, then api, then web). No Turborepo/Nx for now.
## Consequences
+ One `npm install`, one lockfile, atomic commits across layers. Nothing extra to learn.
- No build caching or affected-graph. Revisit Turborepo if the build gets above about 5 minutes or a third app is added.
