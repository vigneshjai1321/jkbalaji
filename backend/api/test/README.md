# test

Vitest (+ unplugin-swc for decorator metadata) and supertest.

- `e2e/` - HTTP-level tests per module: `plots.e2e-spec.ts` (boots AppModule against a test database).
- `factories/` - test data builders (`plot.factory.ts`).
- `fixtures/` - static JSON fixtures.
- `utils/` - `create-test-app.ts`, auth helpers (login as role X), DB reset helpers.

Unit tests live next to source files as `*.spec.ts`.
