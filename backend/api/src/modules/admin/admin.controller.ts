import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Prisma, SiteKey, UserRole } from '../../generated/prisma/client.js';
import { PrismaService } from '../../database/prisma.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { AdminDashboardService } from './admin-dashboard.service.js';
import { ProjectCatalogService } from './project-catalog.service.js';
import { toSqft, type AreaUnitCode } from './measure.js';
import { parseProjectWrite, ProjectValidationError, type ProjectWriteInput } from './project-validation.js';

const PROJECT_EDITORS = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.REAL_ESTATE_MANAGER] as const;

@Controller({ path: 'admin', version: '1' })
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dashboardService: AdminDashboardService,
    private readonly projectsCatalog: ProjectCatalogService,
  ) {}

  private projectWrite(body: Record<string, unknown>, partial: boolean): Partial<ProjectWriteInput> {
    try {
      return parseProjectWrite(body, partial);
    } catch (error) {
      if (error instanceof ProjectValidationError) throw new BadRequestException(error.message);
      throw error;
    }
  }

  @Get('dashboard')
  getDashboard() {
    return this.dashboardService.overview();
  }

  @Get('projects')
  async projects() {
    await this.projectsCatalog.ensureCanonicalProjects();
    return this.prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { properties: true, plots: true, leads: true } } },
    });
  }

  @Post('projects')
  @UseGuards(RolesGuard)
  @Roles(...PROJECT_EDITORS)
  async createProject(@Body() body: Record<string, unknown>) {
    const data = this.projectWrite(body, false);
    if (!data.name || !data.slug || !data.phase || data.published === undefined) {
      throw new BadRequestException('Project name, slug, and status are required');
    }
    try {
      const created = await this.prisma.project.create({ data: data as ProjectWriteInput });
      return created;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('A project with this slug already exists');
      }
      throw error;
    }
  }

  @Get('projects/:id')
  async project(@Param('id') id: string) {
    const row = await this.prisma.project.findUnique({
      where: { id },
      include: {
        _count: { select: { properties: true, plots: true, leads: true } },
        properties: {
          orderBy: { updatedAt: 'desc' },
          select: { id: true, title: true, slug: true, location: true, status: true, plotNo: true },
        },
        plots: {
          orderBy: { plotNumber: 'asc' },
          select: { id: true, plotNumber: true, status: true },
        },
        leads: {
          orderBy: { createdAt: 'desc' },
          take: 25,
          select: { id: true, name: true, phone: true, status: true, leadType: true, createdAt: true, sourcePage: true },
        },
      },
    });
    if (!row) throw new NotFoundException('Project not found');
    return row;
  }

  @Patch('projects/:id')
  @UseGuards(RolesGuard)
  @Roles(...PROJECT_EDITORS)
  async updateProject(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    const data = this.projectWrite(body, true);
    if (Object.keys(data).length === 0) throw new BadRequestException('No changes submitted');
    try {
      return await this.prisma.project.update({ where: { id }, data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Project not found');
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('A project with this slug already exists');
      }
      throw error;
    }
  }

  @Get('properties')
  properties() {
    return this.prisma.property.findMany({
      where: { slug: { notIn: ['green-valley-phase-1', 'sunrise-nagar-corner'] } },
      orderBy: { createdAt: 'desc' },
      include: { project: { select: { id: true, name: true } }, broker: { select: { id: true, name: true } } },
    });
  }

  @Get('products')
  products() {
    return this.prisma.jewelleryProduct.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Get('leads')
  leads() {
    return this.prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        site: true,
        leadType: true,
        name: true,
        phone: true,
        email: true,
        message: true,
        sourcePage: true,
        status: true,
        createdAt: true,
        property: { select: { id: true, title: true, slug: true } },
        project: { select: { id: true, name: true, slug: true } },
        assignedTo: { select: { id: true, name: true } },
        _count: { select: { notes: true, followups: true } },
      },
    });
  }

  @Patch('leads/:id')
  updateLead(@Param('id') id: string, @Body() body: { status?: string; assignedToId?: string | null }) {
    return this.prisma.lead.update({
      where: { id },
      data: {
        ...(body.status ? { status: body.status as never } : {}),
        ...(body.assignedToId !== undefined ? { assignedToId: body.assignedToId } : {}),
      },
    });
  }

  @Post('properties')
  createProperty(@Body() body: Record<string, unknown>) {
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : '';
    const location = typeof body.location === 'string' ? body.location.trim() : '';
    const price = Number(body.priceInr);
    if (title.length < 2 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || location.length < 2 || !Number.isFinite(price) || price < 0) {
      throw new BadRequestException('Title, slug, location, and a valid price are required');
    }
    const units = ['SQFT', 'SQYD', 'SQM', 'ACRE', 'CENT'] as const;
    const areaUnit = units.includes(body.areaUnit as AreaUnitCode) ? (body.areaUnit as AreaUnitCode) : 'SQFT';
    const landArea = body.landArea == null || body.landArea === '' ? null : Number(body.landArea);
    if (landArea != null && (!Number.isFinite(landArea) || landArea < 0)) {
      throw new BadRequestException('Land area must be a non-negative number');
    }
    return this.prisma.property.create({
      data: {
        title,
        slug,
        location,
        priceInr: price,
        status: body.status === 'BOOKED' || body.status === 'SOLD' ? body.status : 'AVAILABLE',
        kind: typeof body.kind === 'string' ? (body.kind as never) : 'RESIDENTIAL_PLOT',
        areaUnit,
        landArea,
        areaSqft: landArea == null ? null : toSqft(landArea, areaUnit),
        builtUpSqft: body.builtUpSqft == null || body.builtUpSqft === '' ? null : Number(body.builtUpSqft),
        projectId: typeof body.projectId === 'string' && body.projectId ? body.projectId : null,
        published: body.published === true,
      },
    });
  }

  @Post('products')
  createProduct(@Body() body: Record<string, unknown>) {
    return this.prisma.jewelleryProduct.create({ data: body as never });
  }

  @Post('gold-rates')
  createGoldRate(@Body() body: { rate22k: number; rate24k: number; effectiveDate?: string }) {
    return this.prisma.goldRate.create({
      data: {
        rate22k: body.rate22k,
        rate24k: body.rate24k,
        effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : new Date(),
      },
    });
  }

  @Post('content')
  upsertContent(@Body() body: { site: SiteKey; key: string; value: string }) {
    return this.prisma.siteContent.upsert({
      where: { site_key: { site: body.site, key: body.key } },
      update: { value: body.value },
      create: body,
    });
  }
}
