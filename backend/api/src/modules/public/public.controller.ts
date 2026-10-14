import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { SiteKey } from '../../generated/prisma/client.js';
import { LeadNotifyService } from '../../common/lead-notify.service.js';
import { PrismaService } from '../../database/prisma.service.js';
import { ProjectCatalogService } from '../admin/project-catalog.service.js';
import { MarketRatesService } from '../market-rates/market-rates.service.js';
import { LEAD_TYPE_PROJECT_SLUG } from '../admin/project-validation.js';

const LEAD_RATE = new Map<string, number[]>();
const LEAD_RATE_WINDOW_MS = 60_000;
const LEAD_RATE_MAX = 8;
const SCHEME_AMOUNT_MIN_INR = 5_000;
const SCHEME_AMOUNT_MAX_INR = 100_000;
const BLOCKED_PROPERTY_SLUGS = ['green-valley-phase-1', 'sunrise-nagar-corner'] as const;

@Controller({ path: 'public', version: '1' })
export class PublicController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly leadNotify: LeadNotifyService,
    private readonly projectsCatalog: ProjectCatalogService,
    private readonly marketRatesService: MarketRatesService,
  ) {}

  private assertLeadRate(ip: string) {
    const now = Date.now();
    const hits = (LEAD_RATE.get(ip) ?? []).filter((t) => now - t < LEAD_RATE_WINDOW_MS);
    if (hits.length >= LEAD_RATE_MAX) {
      throw new HttpException('Too many submissions. Please try again shortly.', HttpStatus.TOO_MANY_REQUESTS);
    }
    hits.push(now);
    LEAD_RATE.set(ip, hits);
  }

  @Get('properties')
  listProperties() {
    return this.prisma.property.findMany({
      where: { published: true, slug: { notIn: ['green-valley-phase-1', 'sunrise-nagar-corner'] } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('properties/:slug')
  async getProperty(@Param('slug') slug: string) {
    if (BLOCKED_PROPERTY_SLUGS.includes(slug as (typeof BLOCKED_PROPERTY_SLUGS)[number])) {
      throw new NotFoundException('Property not found');
    }
    const row = await this.prisma.property.findUnique({ where: { slug } });
    if (!row?.published) {
      throw new NotFoundException('Property not found');
    }
    return row;
  }

  @Get('projects')
  async listProjects() {
    await this.projectsCatalog.ensureCanonicalProjects();
    return this.prisma.project.findMany({
      where: { published: true },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        location: true,
        phase: true,
        phaseLabel: true,
        description: true,
        coverImage: true,
      },
    });
  }

  @Post('leads')
  async createLead(
    @Req() req: Request,
    @Body()
    body: {
      site?: SiteKey;
      leadType?: string;
      name: string;
      phone: string;
      email?: string;
      message?: string;
      propertyId?: string;
      projectSlug?: string;
      sourcePage?: string;
      website?: string;
      schemeAmountInr?: number;
    },
  ) {
    if (body.website?.trim()) {
      throw new BadRequestException('Invalid submission');
    }
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip ?? 'unknown';
    this.assertLeadRate(ip);

    const site = body.site ?? SiteKey.REAL_ESTATE;
    if (site !== SiteKey.REAL_ESTATE && site !== SiteKey.JEWELLERY) {
      throw new BadRequestException('Invalid site');
    }

    const name = body.name?.trim().slice(0, 120);
    const phone = body.phone?.trim().replace(/\s/g, '').slice(0, 20);
    let message = body.message?.trim().slice(0, 4000);
    const leadType = body.leadType?.trim().slice(0, 80);
    if (leadType === 'GOLD_SCHEME_ENQUIRY' && body.schemeAmountInr == null) {
      throw new BadRequestException('Scheme enquiry requires an amount between ₹5,000 and ₹1,00,000');
    }
    if (body.schemeAmountInr != null) {
      const amt = Number(body.schemeAmountInr);
      if (!Number.isFinite(amt) || amt < SCHEME_AMOUNT_MIN_INR || amt > SCHEME_AMOUNT_MAX_INR) {
        throw new BadRequestException(
          `Scheme amount must be between ₹${SCHEME_AMOUNT_MIN_INR.toLocaleString('en-IN')} and ₹${SCHEME_AMOUNT_MAX_INR.toLocaleString('en-IN')}`,
        );
      }
      const schemeLine = `Preferred scheme contribution: ₹${Math.round(amt).toLocaleString('en-IN')}`;
      message = message ? `${message}\n\n${schemeLine}` : schemeLine;
    }
    const sourcePage = body.sourcePage?.trim().slice(0, 500);

    if (!name || name.length < 2) throw new BadRequestException('Valid name required');
    if (!phone || phone.length < 8) throw new BadRequestException('Valid phone required');
    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      throw new BadRequestException('Invalid email');
    }

    if (body.propertyId) {
      const prop = await this.prisma.property.findUnique({ where: { id: body.propertyId } });
      if (!prop) throw new BadRequestException('Invalid property reference');
    }

    const requestedSlug = body.projectSlug?.trim().toLowerCase().slice(0, 80);
    const mappedSlug = leadType ? LEAD_TYPE_PROJECT_SLUG[leadType] : undefined;
    let projectId = requestedSlug ? await this.projectsCatalog.resolvePublishedProjectId(requestedSlug) : undefined;
    if (!projectId && mappedSlug) {
      projectId = await this.projectsCatalog.resolveProjectId(mappedSlug);
    }
    if (requestedSlug && !projectId) {
      throw new BadRequestException('That project is not available for enquiries');
    }

    const lead = await this.prisma.lead.create({
      data: {
        site,
        leadType: leadType || undefined,
        name,
        phone,
        email: body.email?.trim().slice(0, 160) || undefined,
        message: message || undefined,
        sourcePage: sourcePage || undefined,
        propertyId: body.propertyId,
        projectId,
      },
    });
    await this.leadNotify.onNewLead({
      site: lead.site,
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      message: lead.message,
    });
    return lead;
  }

  @Get('jewellery/products')
  listProducts() {
    return this.prisma.jewelleryProduct.findMany({ orderBy: { createdAt: 'desc' } });
  }

  /** Shop floor rates for billing (manual admin entry). */
  @Get('jewellery/gold-rate')
  latestGoldRate() {
    return this.prisma.goldRate.findFirst({ orderBy: { effectiveDate: 'desc' } });
  }

  /** Cached GoldAPI market benchmarks — never calls GoldAPI from this handler. */
  @Get('jewellery/market-rates')
  marketRates() {
    return this.marketRatesService.getPublicMarketRates();
  }

  @Get('jewellery/schemes')
  schemes() {
    return this.prisma.jewelleryScheme.findMany({ where: { isActive: true } });
  }

  @Get('offers')
  offers(@Query('site') site?: SiteKey) {
    return this.prisma.offer.findMany({
      where: { isActive: true, ...(site ? { site } : {}) },
    });
  }

  @Get('content')
  content(@Query('site') site: SiteKey) {
    return this.prisma.siteContent.findMany({ where: { site } });
  }

  @Get('gallery')
  gallery(@Query('site') site: SiteKey) {
    return this.prisma.galleryItem.findMany({
      where: { site },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
