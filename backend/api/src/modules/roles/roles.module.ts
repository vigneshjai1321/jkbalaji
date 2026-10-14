import { Module } from '@nestjs/common';

/**
 * Roles module - placeholder (no business logic yet).
 * Roles & permissions: role CRUD, permission matrix (resource:action), assignment. Permission catalog is code-defined in packages/shared.
 * Planned wiring: controllers/roles.controller.ts, services/roles.service.ts, repositories/roles.repository.ts
 */
@Module({
  controllers: [],
  providers: [],
  exports: [],
})
export class RolesModule {}
