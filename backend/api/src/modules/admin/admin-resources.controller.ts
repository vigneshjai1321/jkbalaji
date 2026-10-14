import { Body, Controller, ConflictException, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UserRole } from '../../generated/prisma/client.js';
import { PrismaService } from '../../database/prisma.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';

const PROJECT_EDITORS = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.REAL_ESTATE_MANAGER] as const;
const JEWELLERY_EDITORS = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.GOLD_MANAGER] as const;

@Controller({ path: 'admin', version: '1' })
@UseGuards(JwtAuthGuard)
export class AdminResourcesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('projects/:id')
  project(@Param('id') id: string) {
    return this.prisma.project.findUniqueOrThrow({
      where: { id },
      include: { _count: { select: { properties: true, plots: true } }, properties: true },
    });
  }

  @Patch('projects/:id')
  @UseGuards(RolesGuard)
  @Roles(...PROJECT_EDITORS)
  updateProject(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.prisma.project.update({ where: { id }, data: body as never });
  }

  @Delete('projects/:id')
  async deleteProject(@Param('id') id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { _count: { select: { properties: true, plots: true, leads: true, commissions: true } } },
    });
    if (!project) return { ok: false };
    const dependents = project._count.properties + project._count.plots + project._count.leads + project._count.commissions;
    if (dependents > 0) {
      await this.prisma.project.update({ where: { id }, data: { lifecycle: 'ARCHIVED', published: false } });
      return { ok: true, archived: true, message: 'Project archived because it has related records.' };
    }
    await this.prisma.project.delete({ where: { id } });
    return { ok: true, archived: false };
  }

  @Get('properties/:id')
  property(@Param('id') id: string) {
    return this.prisma.property.findUniqueOrThrow({ where: { id }, include: { project: true } });
  }

  @Patch('properties/:id')
  @UseGuards(RolesGuard)
  @Roles(...PROJECT_EDITORS)
  updateProperty(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.prisma.property.update({ where: { id }, data: body as never });
  }

  @Delete('properties/:id')
  @UseGuards(RolesGuard)
  @Roles(...PROJECT_EDITORS)
  async deleteProperty(@Param('id') id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: { _count: { select: { leads: true, commissions: true } } },
    });
    if (!property) return { ok: false };
    if (property._count.leads || property._count.commissions) {
      throw new ConflictException('This property has enquiries or commissions. Unpublish it instead of deleting it.');
    }
    await this.prisma.property.delete({ where: { id } });
    return { ok: true };
  }

  @Get('products/:id')
  product(@Param('id') id: string) {
    return this.prisma.jewelleryProduct.findUniqueOrThrow({ where: { id } });
  }

  @Patch('products/:id')
  @UseGuards(RolesGuard)
  @Roles(...JEWELLERY_EDITORS)
  updateProduct(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.prisma.jewelleryProduct.update({ where: { id }, data: body as never });
  }

  @Delete('products/:id')
  @UseGuards(RolesGuard)
  @Roles(...JEWELLERY_EDITORS)
  deleteProduct(@Param('id') id: string) {
    return this.prisma.jewelleryProduct.delete({ where: { id } });
  }

  @Get('gold-rates')
  goldRates() {
    return this.prisma.goldRate.findMany({ orderBy: { effectiveDate: 'desc' }, take: 90 });
  }

  @Get('notifications')
  notifications() {
    return this.prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
  }
}
