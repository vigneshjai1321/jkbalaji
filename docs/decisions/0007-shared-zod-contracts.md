# 0007. Zod contracts shared by web and API
- Status: Accepted, 2026-10-07
## Decision
Request schemas live in `packages/shared/src/schemas` (Zod 4). The web uses them in react-hook-form, and the API validates with a custom `ZodValidationPipe`. OpenAPI comes from `z.toJSONSchema()`. `nestjs-zod` is not used because it does not support Nest 12 yet. class-validator is not used.
## Consequences
+ One definition per contract, and identical client/server validation messages.
- Swagger decorators need a small helper. If `nestjs-zod` adds Nest 12 support, adopting it is optional.
