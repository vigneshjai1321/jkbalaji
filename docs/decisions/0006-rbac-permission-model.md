# 0006. RBAC with resource:action permissions
- Status: Accepted, 2026-10-07
## Decision
Users have many Roles, and Roles have many Permissions. The permission catalog is defined in code (`packages/shared`) and seeded. Roles are editable data. A global PermissionsGuard checks `@RequirePermissions()`. Row-level scope (own/team/all) lives in services through policies.
## Consequences
+ New roles without a deploy, and typo-safe permission keys shared with the UI.
- Adding a permission needs a code change and a deploy (intended).
