# config

Typed, validated configuration. Loaded once by `ConfigModule.forRoot({ isGlobal: true, validate })`.

| Planned file              | Purpose                                                                  |
|---------------------------|--------------------------------------------------------------------------|
| `env.validation.ts`       | Zod schema for ALL env vars; fail fast at boot with a readable error      |
| `app.config.ts`           | `registerAs('app')`: port, host, prefix, version, web origin, timezone    |
| `auth.config.ts`          | `registerAs('auth')`: JWT secrets/TTLs, cookie names/flags, lockout policy |
| `database.config.ts`      | `registerAs('database')`: URL, pool size                                  |
| `throttle.config.ts`      | Rate limit windows                                                       |
| `storage.config.ts`       | Upload dir, max size, allowed MIME types                                  |
| `swagger.config.ts`       | Swagger enablement + document builder options                            |

Rule: no `process.env` reads outside this folder (and `main.ts` bootstrap).
