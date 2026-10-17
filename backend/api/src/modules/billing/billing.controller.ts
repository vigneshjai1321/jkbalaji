import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { InvoiceStatus, InvoiceType } from '../../generated/prisma/client.js';
import { UserRole } from '../../generated/prisma/client.js';
import { JewelleryUnit } from '../auth/business-unit.decorator.js';
import { BusinessUnitGuard } from '../auth/business-unit.guard.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { PrismaService } from '../../database/prisma.service.js';
import { BillingService, type CreateInvoiceInput, type PreviewInvoiceInput } from './billing.service.js';
import type { SellerProfile } from './billing-seller.js';

type AuthReq = Request & { user?: { sub?: string } };

const BILLING_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.GOLD_MANAGER,
  UserRole.BILLING_STAFF,
  UserRole.ACCOUNTANT,
] as const;

@Controller({ path: 'admin/billing', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard, BusinessUnitGuard)
@Roles(...BILLING_ROLES)
@JewelleryUnit()
export class BillingController {
  constructor(
    private readonly billing: BillingService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('seller')
  seller() {
    return this.billing.getSellerProfile();
  }

  @Patch('seller')
  updateSeller(@Body() body: SellerProfile) {
    return this.billing.updateSellerProfile(body);
  }

  @Get('summary')
  summary() {
    return this.billing.summary();
  }

  @Post('invoices/preview')
  preview(@Body() body: PreviewInvoiceInput) {
    return this.billing.preview(body);
  }

  @Post('invoices/preview/pdf')
  async previewPdf(@Body() body: PreviewInvoiceInput, @Res() res: Response) {
    const buf = await this.billing.previewPdf(body);
    const name = body.sample ? 'sample-invoice.pdf' : 'invoice-preview.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${name}"`);
    res.send(buf);
  }

  @Get('customers')
  customers(@Query('q') q?: string, @Query('limit') limit?: string) {
    return this.billing.searchCustomers(q, limit ? Number(limit) : undefined);
  }

  @Post('customers')
  createCustomer(@Body() body: { name: string; phone: string; email?: string; address?: string; gstin?: string }) {
    return this.prisma.customer.create({ data: body });
  }

  @Get('customers/:id')
  customer(@Param('id') id: string) {
    return this.prisma.customer.findUniqueOrThrow({
      where: { id },
      include: {
        invoices: { orderBy: { invoiceDate: 'desc' }, take: 50 },
        plots: { include: { project: true } },
      },
    });
  }

  @Patch('customers/:id')
  updateCustomer(
    @Param('id') id: string,
    @Body() body: { name?: string; phone?: string; email?: string; address?: string; gstin?: string },
  ) {
    return this.prisma.customer.update({ where: { id }, data: body });
  }

  @Delete('customers/:id')
  deleteCustomer(@Param('id') id: string) {
    return this.prisma.customer.delete({ where: { id } });
  }

  @Get('reports/gst')
  gstReport(@Query('preset') preset?: string, @Query('from') from?: string, @Query('to') to?: string) {
    return this.billing.gstReport(preset, from, to);
  }

  @Get('reports/gst/export.csv')
  async gstCsv(@Res() res: Response, @Query('preset') preset?: string, @Query('from') from?: string, @Query('to') to?: string) {
    const csv = await this.billing.gstReportCsv(preset, from, to);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="gst-report.csv"');
    res.send('\uFEFF' + csv);
  }

  @Get('reports/gst/export.pdf')
  async gstPdf(@Res() res: Response, @Query('preset') preset?: string, @Query('from') from?: string, @Query('to') to?: string) {
    const buf = await this.billing.gstReportPdf(preset, from, to);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="gst-report.pdf"');
    res.send(buf);
  }

  @Get('invoices/next-number')
  async nextInvoiceNumber(@Query('date') date?: string) {
    const invoiceNo = await this.billing.suggestNextInvoiceNumber(date);
    return { invoiceNo };
  }

  @Get('invoices')
  invoices(
    @Query('search') search?: string,
    @Query('status') status?: InvoiceStatus,
    @Query('payment') payment?: 'paid' | 'unpaid',
    @Query('customerId') customerId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('gstApplied') gstApplied?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const gst =
      gstApplied === 'true' ? true : gstApplied === 'false' ? false : undefined;
    return this.billing.listInvoices({
      search,
      status,
      payment,
      customerId,
      from,
      to,
      gstApplied: gst,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Delete('invoices/:id')
  deleteDraft(@Param('id') id: string, @Req() req: AuthReq) {
    return this.billing.deleteDraftInvoice(id, req.user?.sub);
  }

  @Get('invoices/:id')
  invoice(@Param('id') id: string) {
    return this.billing.getInvoice(id);
  }

  @Post('invoices')
  createInvoice(@Body() body: CreateInvoiceInput, @Req() req: AuthReq) {
    return this.billing.createInvoice({ ...body, createdById: req.user?.sub });
  }

  @Patch('invoices/:id')
  updateInvoice(@Param('id') id: string, @Body() body: Partial<CreateInvoiceInput>, @Req() req: AuthReq) {
    return this.billing.updateInvoice(id, { ...body, userId: req.user?.sub });
  }

  @Post('invoices/:id/issue')
  issue(@Param('id') id: string, @Body() body: { settleAsPaid?: boolean }, @Req() req: AuthReq) {
    return this.billing.issueInvoice(id, req.user?.sub, body?.settleAsPaid === true);
  }

  @Post('invoices/:id/cancel')
  cancel(@Param('id') id: string, @Body() body: { reason: string }, @Req() req: AuthReq) {
    return this.billing.cancelInvoice(id, body.reason, req.user?.sub);
  }

  @Post('invoices/:id/payments')
  payment(
    @Param('id') id: string,
    @Body() body: { amountInr: number; method?: string; reference?: string; paidAt?: string },
    @Req() req: AuthReq,
  ) {
    return this.billing.recordPayment(id, { ...body, userId: req.user?.sub });
  }

  @Get('invoices/:id/pdf')
  async pdf(@Param('id') id: string, @Res() res: Response) {
    const inv = await this.billing.getInvoice(id);
    const buf = await this.billing.pdfBuffer(id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${inv.invoiceNo}.pdf"`);
    res.send(buf);
  }

  @Get('stock')
  stock() {
    return this.prisma.stockItem.findMany();
  }

  @Post('stock')
  upsertStock(@Body() body: { sku: string; name: string; quantity: number; unit?: string }) {
    return this.prisma.stockItem.upsert({
      where: { sku: body.sku },
      update: { name: body.name, quantity: body.quantity, unit: body.unit ?? 'g' },
      create: { sku: body.sku, name: body.name, quantity: body.quantity, unit: body.unit ?? 'g' },
    });
  }

  @Get('reports/sales')
  salesReport() {
    return this.prisma.invoice.findMany({
      where: { type: InvoiceType.SALE },
      include: { customer: true },
      orderBy: { invoiceDate: 'desc' },
    });
  }

  @Get('reports/purchases')
  purchaseReport() {
    return this.prisma.invoice.findMany({
      where: { type: InvoiceType.PURCHASE },
      include: { customer: true },
      orderBy: { invoiceDate: 'desc' },
    });
  }
}
