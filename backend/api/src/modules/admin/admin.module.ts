import { Module } from '@nestjs/common';
import { ActivityLogService } from '../../common/activity-log.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { AdminAuditController } from './admin-audit.controller.js';
import { AdminController } from './admin.controller.js';
import { AdminCrmController } from './admin-crm.controller.js';
import { AdminDashboardService } from './admin-dashboard.service.js';
import { ProjectCatalogService } from './project-catalog.service.js';
import { AdminUsersController } from './admin-users.controller.js';
import { AdminErpController } from './admin-erp.controller.js';
import { AdminPlotSalesController } from './admin-plot-sales.controller.js';
import { AdminResourcesController } from './admin-resources.controller.js';
import { GoldApiAdminController } from '../goldapi/goldapi-admin.controller.js';
import { AdminMailController } from './admin-mail.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [
    AdminMailController,
    GoldApiAdminController,
    AdminController,
    AdminResourcesController,
    AdminUsersController,
    AdminAuditController,
    AdminCrmController,
    AdminErpController,
    AdminPlotSalesController,
  ],
  providers: [AdminDashboardService, ActivityLogService, ProjectCatalogService],
})
export class AdminModule {}
