import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InvoiceStatus, InvoiceType, Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../database/prisma.service.js';
import { loadSellerProfile, saveSellerProfile, type SellerProfile } from './billing-seller.js';
import {
  computeLines,
  gstStateFromGstin,
  paymentStatus,
  resolveTaxMode,
  type LineInput,
} from './invoice-calculations.js';
import { renderInvoicePdf } from './invoice-pdf.js';
import { buildGstReport, gstReportToCsv, resolveReportRange } from './billing-gst-reports.js';
import { renderGstReportPdf } from './invoice-gst-report-pdf.js';
import {
  allocateInvoiceNo,
  isLegacyDraftNo,
  suggestNextInvoiceNo,
} from './invoice-numbering.js';
import { gstinFormatIssue } from './gstin-format.js';

export type CustomerSnapshot = {
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  gstin?: string | null;
};

export type CreateInvoiceInput = {
  customerId: string;
  invoiceDate?: string;
  dueDate?: string;
  paymentTerms?: string;
  placeOfSupply?: string;
  notes?: string;
  lines: LineInput[];
  gstApplied?: boolean;
  issue?: boolean;
  /** When issuing, record a payment for the full total using existing payment rules. Ignored for drafts. */
  settleAsPaid?: boolean;
  createdById?: string;
  /** Draft / issue number (SBT-INV-YYYY-0001). Issued invoices keep their number. */
  invoiceNo?: string;
};

export type PreviewInvoiceInput = Omit<CreateInvoiceInput, 'customerId' | 'issue' | 'createdById'> & {
  customerId?: string;
  customerSnapshot?: CustomerSnapshot;
  invoiceNo?: string;
  sample?: boolean;
};

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  getSellerProfile() {
    return loadSellerProfile(this.prisma);
  }

  updateSellerProfile(profile: SellerProfile) {
    const gstin = profile.gstin?.trim();
    if (gstin) {
      const issue = gstinFormatIssue(gstin);
      if (issue) throw new BadRequestException(issue);
    }
    return saveSellerProfile(this.prisma, profile);
  }

  preview(input: PreviewInvoiceInput) {
    return this.buildDraftTotals(input);
  }

  suggestNextInvoiceNumber(invoiceDate?: string) {
    const d = invoiceDate ? new Date(invoiceDate) : new Date();
    return loadSellerProfile(this.prisma).then((seller) =>
      suggestNextInvoiceNo(this.prisma, d, seller.invoicePrefix),
    );
  }

  async previewPdf(input: PreviewInvoiceInput) {
    const computed = await this.buildDraftTotals(input);
    const customer = await this.resolvePreviewCustomer(input);
    const seller = await loadSellerProfile(this.prisma);
    const invoiceDate = input.invoiceDate ? new Date(input.invoiceDate) : new Date();
    const lines = computed.lines.map((l, idx) => ({
      id: `preview-${idx}`,
      invoiceId: 'preview',
      description: l.description,
      hsnSac: l.hsnSac ?? null,
      unit: l.unit ?? 'nos',
      qty: l.qty,
      rateInr: l.rateInr,
      discountInr: l.discountInr ?? 0,
      gstRatePct: l.gstRatePct ?? 0,
      taxableInr: l.taxableInr,
      cgstInr: l.cgstInr,
      sgstInr: l.sgstInr,
      igstInr: l.igstInr,
      amountInr: l.amountInr,
      sortOrder: idx,
    }));
    const synthetic = {
      id: 'preview',
      invoiceNo: input.invoiceNo ?? (input.sample ? 'SAMPLE-DEMO-00001' : 'PREVIEW'),
      type: InvoiceType.SALE,
      status: InvoiceStatus.DRAFT,
      customerId: customer.id,
      customer,
      invoiceDate,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      paymentTerms: input.paymentTerms ?? null,
      notes: input.notes ?? null,
      taxMode: computed.taxMode,
      gstApplied: computed.gstApplied,
      placeOfSupply: computed.placeOfSupply,
      subtotalInr: computed.totals.subtotalInr,
      discountInr: computed.totals.discountInr,
      cgstInr: computed.totals.cgstInr,
      sgstInr: computed.totals.sgstInr,
      igstInr: computed.totals.igstInr,
      totalInr: computed.totals.totalInr,
      amountPaidInr: 0,
      lines,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: null,
      issuedAt: null,
      cancelledAt: null,
      cancelReason: null,
    };
    return renderInvoicePdf(synthetic as unknown as Parameters<typeof renderInvoicePdf>[0], seller);
  }

  async deleteDraftInvoice(id: string, userId?: string) {
    const inv = await this.prisma.invoice.findUnique({ where: { id } });
    if (!inv) throw new NotFoundException('Invoice not found');
    if (inv.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be deleted');
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.invoiceLine.deleteMany({ where: { invoiceId: id } });
      await tx.invoiceEvent.deleteMany({ where: { invoiceId: id } });
      await tx.invoicePayment.deleteMany({ where: { invoiceId: id } });
      await tx.invoice.delete({ where: { id } });
    });
    void userId;
    return { ok: true };
  }

  private async resolvePreviewCustomer(input: { customerId?: string; customerSnapshot?: CustomerSnapshot }) {
    if (input.customerSnapshot) {
      return {
        id: 'preview-customer',
        name: input.customerSnapshot.name,
        phone: input.customerSnapshot.phone,
        email: input.customerSnapshot.email ?? null,
        address: input.customerSnapshot.address ?? null,
        gstin: input.customerSnapshot.gstin ?? null,
        createdAt: new Date(),
      };
    }
    if (!input.customerId) throw new BadRequestException('Customer is required');
    return this.prisma.customer.findUniqueOrThrow({ where: { id: input.customerId } });
  }

  private async buildDraftTotals(input: {
    customerId?: string;
    customerSnapshot?: CustomerSnapshot;
    lines: LineInput[];
    placeOfSupply?: string;
    gstApplied?: boolean;
  }) {
    const [customer, seller] = await Promise.all([
      this.resolvePreviewCustomer(input),
      loadSellerProfile(this.prisma),
    ]);
    const effectiveGst = input.gstApplied === undefined ? seller.defaultApplyGst : Boolean(input.gstApplied);

    const normalizedLines = input.lines.map((l) => {
      let gstRatePct = effectiveGst ? Number(l.gstRatePct ?? 0) : 0;
      if (effectiveGst && seller.authorizedTaxRates.length) {
        if (!seller.authorizedTaxRates.includes(gstRatePct)) {
          const nearest = seller.authorizedTaxRates.reduce((a, b) =>
            Math.abs(b - gstRatePct) < Math.abs(a - gstRatePct) ? b : a,
          );
          gstRatePct = nearest;
        }
      }
      return { ...l, gstRatePct, unit: l.unit?.trim() || 'nos' };
    });

    const customerState = gstStateFromGstin(customer.gstin);
    const taxMode = effectiveGst ? resolveTaxMode(seller.stateCode, customerState) : 'CGST_SGST';
    const { lines, totals } = computeLines(normalizedLines, taxMode, effectiveGst);
    return {
      taxMode,
      gstApplied: effectiveGst,
      placeOfSupply: input.placeOfSupply ?? customerState ?? seller.stateCode,
      lines,
      totals,
    };
  }

  async searchCustomers(q?: string, limit = 25) {
    const take = Math.min(50, Math.max(5, limit));
    if (!q?.trim()) {
      return this.prisma.customer.findMany({ orderBy: { name: 'asc' }, take });
    }
    const term = q.trim();
    return this.prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { phone: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
        ],
      },
      orderBy: { name: 'asc' },
      take,
    });
  }

  async createInvoice(input: CreateInvoiceInput) {
    if (!input.lines?.length) throw new BadRequestException('At least one line item is required');
    const preview = await this.buildDraftTotals(input);
    const invoiceDate = input.invoiceDate ? new Date(input.invoiceDate) : new Date();
    const dueDate = input.dueDate ? new Date(input.dueDate) : null;
    const issue = input.issue === true;
    const seller = await loadSellerProfile(this.prisma);
    if (issue && preview.gstApplied && !seller.gstin?.trim()) {
      throw new BadRequestException('Configure seller GSTIN in Billing Settings before issuing GST invoices.');
    }

    return this.prisma.$transaction(async (tx) => {
      const invoiceNo = await allocateInvoiceNo(tx, invoiceDate, seller.invoicePrefix, {
        preferred: input.invoiceNo,
      });

      const inv = await tx.invoice.create({
        data: {
          invoiceNo,
          type: InvoiceType.SALE,
          status: issue ? InvoiceStatus.UNPAID : InvoiceStatus.DRAFT,
          customerId: input.customerId,
          createdById: input.createdById,
          invoiceDate,
          dueDate,
          paymentTerms: input.paymentTerms ?? seller.paymentTermsDefault,
          placeOfSupply: preview.placeOfSupply,
          taxMode: preview.taxMode,
          gstApplied: preview.gstApplied,
          subtotalInr: preview.totals.subtotalInr,
          discountInr: preview.totals.discountInr,
          cgstInr: preview.totals.cgstInr,
          sgstInr: preview.totals.sgstInr,
          igstInr: preview.totals.igstInr,
          totalInr: preview.totals.totalInr,
          amountPaidInr: 0,
          notes: input.notes,
          issuedAt: issue ? new Date() : null,
          lines: {
            create: preview.lines.map((l, idx) => ({
              description: l.description,
              hsnSac: preview.gstApplied ? l.hsnSac : null,
              unit: l.unit ?? 'nos',
              qty: l.qty,
              rateInr: l.rateInr,
              discountInr: l.discountInr ?? 0,
              gstRatePct: l.gstRatePct ?? 3,
              taxableInr: l.taxableInr,
              cgstInr: l.cgstInr,
              sgstInr: l.sgstInr,
              igstInr: l.igstInr,
              amountInr: l.amountInr,
              sortOrder: idx,
            })),
          },
          events: {
            create: {
              action: issue ? 'ISSUED' : 'CREATED_DRAFT',
              detail: issue ? 'Invoice issued' : 'Saved as draft',
              userId: input.createdById,
            },
          },
        },
        include: { lines: true, customer: true, payments: true, events: true },
      });
      if (issue && input.settleAsPaid) {
        return this.settleInvoiceInFull(tx, inv.id, Number(inv.totalInr), input.createdById);
      }
      return inv;
    });
  }

  async updateInvoice(
    id: string,
    input: Partial<CreateInvoiceInput> & { userId?: string },
  ) {
    const existing = await this.prisma.invoice.findUnique({ where: { id }, include: { lines: true } });
    if (!existing) throw new NotFoundException('Invoice not found');
    if (existing.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Cancelled invoices cannot be edited');
    }
    if (existing.status !== InvoiceStatus.DRAFT && existing.status !== InvoiceStatus.UNPAID) {
      throw new BadRequestException('Only draft or unpaid invoices can be edited');
    }
    if (Number(existing.amountPaidInr) > 0) {
      throw new BadRequestException('Cannot edit invoice after payments are recorded');
    }

    const merged = {
      customerId: input.customerId ?? existing.customerId,
      gstApplied: input.gstApplied ?? existing.gstApplied,
      lines: input.lines ?? existing.lines.map((l) => ({
        description: l.description,
        hsnSac: l.hsnSac ?? undefined,
        unit: l.unit ?? 'nos',
        qty: Number(l.qty),
        rateInr: Number(l.rateInr),
        discountInr: Number(l.discountInr),
        gstRatePct: Number(l.gstRatePct),
      })),
      placeOfSupply: input.placeOfSupply ?? existing.placeOfSupply ?? undefined,
    };
    const preview = await this.buildDraftTotals(merged);
    const seller = await loadSellerProfile(this.prisma);
    const invDate = input.invoiceDate ? new Date(input.invoiceDate) : existing.invoiceDate;
    const canEditNo = existing.status === InvoiceStatus.DRAFT;

    return this.prisma.$transaction(async (tx) => {
      let nextNo = existing.invoiceNo;
      if (canEditNo && input.invoiceNo?.trim()) {
        nextNo = await allocateInvoiceNo(tx, invDate, seller.invoicePrefix, {
          preferred: input.invoiceNo.trim(),
          excludeInvoiceId: id,
        });
      } else if (canEditNo && isLegacyDraftNo(existing.invoiceNo)) {
        nextNo = await allocateInvoiceNo(tx, invDate, seller.invoicePrefix, { excludeInvoiceId: id });
      }

      await tx.invoiceLine.deleteMany({ where: { invoiceId: id } });
      const inv = await tx.invoice.update({
        where: { id },
        data: {
          invoiceNo: nextNo,
          customerId: merged.customerId,
          invoiceDate: input.invoiceDate ? new Date(input.invoiceDate) : existing.invoiceDate,
          dueDate: input.dueDate ? new Date(input.dueDate) : existing.dueDate,
          paymentTerms: input.paymentTerms ?? existing.paymentTerms,
          placeOfSupply: preview.placeOfSupply,
          taxMode: preview.taxMode,
          gstApplied: preview.gstApplied,
          subtotalInr: preview.totals.subtotalInr,
          discountInr: preview.totals.discountInr,
          cgstInr: preview.totals.cgstInr,
          sgstInr: preview.totals.sgstInr,
          igstInr: preview.totals.igstInr,
          totalInr: preview.totals.totalInr,
          notes: input.notes ?? existing.notes,
          lines: {
            create: preview.lines.map((l, idx) => ({
              description: l.description,
              hsnSac: preview.gstApplied ? l.hsnSac : null,
              unit: l.unit ?? 'nos',
              qty: l.qty,
              rateInr: l.rateInr,
              discountInr: l.discountInr ?? 0,
              gstRatePct: l.gstRatePct ?? 0,
              taxableInr: l.taxableInr,
              cgstInr: l.cgstInr,
              sgstInr: l.sgstInr,
              igstInr: l.igstInr,
              amountInr: l.amountInr,
              sortOrder: idx,
            })),
          },
          events: { create: { action: 'UPDATED', userId: input.userId } },
        },
        include: { lines: true, customer: true, payments: true, events: true },
      });
      if (input.settleAsPaid && existing.status === InvoiceStatus.UNPAID && Number(existing.amountPaidInr) <= 0) {
        return this.settleInvoiceInFull(tx, inv.id, Number(inv.totalInr), input.userId);
      }
      return inv;
    });
  }

  async issueInvoice(id: string, userId?: string, settleAsPaid?: boolean) {
    const inv = await this.prisma.invoice.findUnique({ where: { id } });
    if (!inv) throw new NotFoundException('Invoice not found');
    if (inv.status !== InvoiceStatus.DRAFT) throw new BadRequestException('Only drafts can be issued');
    const seller = await loadSellerProfile(this.prisma);
    if (inv.gstApplied && !seller.gstin?.trim()) {
      throw new BadRequestException('Configure seller GSTIN in Billing Settings before issuing GST invoices.');
    }
    return this.prisma.$transaction(async (tx) => {
      const invoiceNo = isLegacyDraftNo(inv.invoiceNo)
        ? await allocateInvoiceNo(tx, inv.invoiceDate, seller.invoicePrefix)
        : await allocateInvoiceNo(tx, inv.invoiceDate, seller.invoicePrefix, {
            preferred: inv.invoiceNo,
            excludeInvoiceId: id,
          });
      const issued = await tx.invoice.update({
        where: { id },
        data: {
          invoiceNo,
          status: InvoiceStatus.UNPAID,
          issuedAt: new Date(),
          events: { create: { action: 'ISSUED', userId, detail: `Issued as ${invoiceNo}` } },
        },
        include: { lines: true, customer: true, payments: true, events: true },
      });
      if (settleAsPaid && Number(issued.amountPaidInr) <= 0) {
        return this.settleInvoiceInFull(tx, issued.id, Number(issued.totalInr), userId);
      }
      return issued;
    });
  }

  /** Records one payment for the outstanding total. Status follows paymentStatus — never set PAID without this payment. */
  private async settleInvoiceInFull(
    tx: Prisma.TransactionClient,
    invoiceId: string,
    totalInr: number,
    userId?: string,
  ) {
    const current = await tx.invoice.findUniqueOrThrow({ where: { id: invoiceId } });
    if (current.status === InvoiceStatus.CANCELLED || current.status === InvoiceStatus.DRAFT) {
      throw new BadRequestException('Cannot settle a draft or cancelled invoice');
    }
    const already = Number(current.amountPaidInr);
    const due = Math.round((totalInr - already) * 100) / 100;
    if (due <= 0) return tx.invoice.findUniqueOrThrow({
      where: { id: invoiceId },
      include: { lines: true, customer: true, payments: true, events: true },
    });
    await tx.invoicePayment.create({
      data: {
        invoiceId,
        amountInr: due,
        method: 'Recorded with invoice',
        recordedById: userId,
      },
    });
    const paid = already + due;
    return tx.invoice.update({
      where: { id: invoiceId },
      data: {
        amountPaidInr: paid,
        status: paymentStatus(totalInr, paid) as InvoiceStatus,
        events: {
          create: { action: 'PAYMENT', detail: `₹${due} recorded with invoice`, userId },
        },
      },
      include: { lines: true, customer: true, payments: true, events: true },
    });
  }

  async cancelInvoice(id: string, reason: string, userId?: string) {
    if (!reason?.trim()) throw new BadRequestException('Cancel reason is required');
    const inv = await this.prisma.invoice.findUnique({ where: { id } });
    if (!inv) throw new NotFoundException('Invoice not found');
    if (inv.status === InvoiceStatus.CANCELLED) return inv;
    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelReason: reason.trim(),
        events: { create: { action: 'CANCELLED', detail: reason.trim(), userId } },
      },
      include: { lines: true, customer: true, payments: true, events: true },
    });
  }

  async recordPayment(
    id: string,
    input: { amountInr: number; method?: string; reference?: string; paidAt?: string; userId?: string },
  ) {
    const inv = await this.prisma.invoice.findUnique({ where: { id } });
    if (!inv) throw new NotFoundException('Invoice not found');
    if (inv.status === InvoiceStatus.CANCELLED || inv.status === InvoiceStatus.DRAFT) {
      throw new BadRequestException('Cannot record payment on draft or cancelled invoice');
    }
    const amount = Number(input.amountInr);
    if (!Number.isFinite(amount) || amount <= 0) throw new BadRequestException('Invalid payment amount');

    return this.prisma.$transaction(async (tx) => {
      await tx.invoicePayment.create({
        data: {
          invoiceId: id,
          amountInr: amount,
          method: input.method,
          reference: input.reference,
          paidAt: input.paidAt ? new Date(input.paidAt) : new Date(),
          recordedById: input.userId,
        },
      });
      const paid = Number(inv.amountPaidInr) + amount;
      const status = paymentStatus(Number(inv.totalInr), paid);
      return tx.invoice.update({
        where: { id },
        data: {
          amountPaidInr: paid,
          status: status as InvoiceStatus,
          events: {
            create: {
              action: 'PAYMENT',
              detail: `₹${amount} via ${input.method ?? '—'}`,
              userId: input.userId,
            },
          },
        },
        include: { lines: true, customer: true, payments: true, events: true },
      });
    });
  }

  async listInvoices(query: {
    search?: string;
    status?: InvoiceStatus;
    payment?: 'paid' | 'unpaid';
    customerId?: string;
    from?: string;
    to?: string;
    gstApplied?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(10, query.limit ?? 25));
    const where: Prisma.InvoiceWhereInput = {};
    if (query.payment === 'paid') where.status = InvoiceStatus.PAID;
    else if (query.payment === 'unpaid') {
      where.status = { in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.DRAFT] };
    } else if (query.status) where.status = query.status;
    if (query.customerId) where.customerId = query.customerId;
    if (query.gstApplied === true) where.gstApplied = true;
    if (query.gstApplied === false) where.gstApplied = false;
    if (query.from || query.to) {
      where.invoiceDate = {};
      if (query.from) where.invoiceDate.gte = new Date(query.from);
      if (query.to) where.invoiceDate.lte = new Date(query.to);
    }
    if (query.search?.trim()) {
      const q = query.search.trim();
      where.OR = [
        { invoiceNo: { contains: q, mode: 'insensitive' } },
        { customer: { name: { contains: q, mode: 'insensitive' } } },
        { customer: { phone: { contains: q, mode: 'insensitive' } } },
        { customer: { email: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: { customer: true },
        orderBy: { invoiceDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.invoice.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async summary() {
    const rows = await this.prisma.invoice.findMany({
      where: { status: { not: InvoiceStatus.CANCELLED } },
      select: { totalInr: true, amountPaidInr: true, status: true },
      orderBy: { invoiceDate: 'desc' },
    });
    let totalInvoiced = 0;
    let paymentsReceived = 0;
    for (const r of rows) {
      totalInvoiced += Number(r.totalInr);
      paymentsReceived += Number(r.amountPaidInr);
    }
    const recent = await this.prisma.invoice.findMany({
      where: { status: { not: InvoiceStatus.CANCELLED } },
      include: { customer: true },
      orderBy: { invoiceDate: 'desc' },
      take: 8,
    });

    return {
      invoiceCount: rows.length,
      totalInvoiced,
      paymentsReceived,
      outstanding: Math.max(0, totalInvoiced - paymentsReceived),
      recent,
    };
  }

  async gstReport(preset?: string, from?: string, to?: string) {
    const range = resolveReportRange(preset, from, to);
    return buildGstReport(this.prisma, range);
  }

  async gstReportCsv(preset?: string, from?: string, to?: string) {
    const report = await this.gstReport(preset, from, to);
    return gstReportToCsv(report);
  }

  async gstReportPdf(preset?: string, from?: string, to?: string) {
    const report = await this.gstReport(preset, from, to);
    return renderGstReportPdf(report);
  }

  async getInvoice(id: string) {
    const inv = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        lines: { orderBy: { sortOrder: 'asc' } },
        customer: true,
        payments: { orderBy: { paidAt: 'desc' } },
        events: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });
    if (!inv) throw new NotFoundException('Invoice not found');
    return inv;
  }

  async pdfBuffer(invoiceId: string): Promise<Buffer> {
    const inv = await this.getInvoice(invoiceId);
    if (inv.status === InvoiceStatus.DRAFT) {
      throw new ForbiddenException('Issue the invoice before generating PDF');
    }
    const seller = await loadSellerProfile(this.prisma);
    return renderInvoicePdf(inv, seller);
  }

  /** @deprecated use createInvoice */
  async createSaleInvoice(input: {
    customerId: string;
    lines: { description: string; qty: number; rateInr: number }[];
    notes?: string;
  }) {
    return this.createInvoice({ ...input, issue: true });
  }
}
