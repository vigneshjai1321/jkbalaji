import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../database/prisma.service.js';
import { commissionStatus } from './measure.js';

@Injectable()
export class CommissionPaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async sumValidPayments(commissionId: string): Promise<number> {
    const rows = await this.prisma.commissionPayment.findMany({
      where: { commissionId, reversedAt: null, reversalOfId: null },
      select: { amountInr: true },
    });
    return Math.round(rows.reduce((s, r) => s + Number(r.amountInr), 0) * 100) / 100;
  }

  async syncCommissionPaid(commissionId: string) {
    const commission = await this.prisma.commission.findUniqueOrThrow({ where: { id: commissionId } });
    if (commission.voided) {
      throw new BadRequestException('Commission is voided');
    }
    const paid = await this.sumValidPayments(commissionId);
    const expected = Number(commission.expectedInr);
    const lastPayment = await this.prisma.commissionPayment.findFirst({
      where: { commissionId, reversedAt: null, reversalOfId: null },
      orderBy: { paidAt: 'desc' },
    });
    return this.prisma.commission.update({
      where: { id: commissionId },
      data: {
        paidInr: paid,
        status: commissionStatus(expected, paid),
        paidOn: paid > 0 ? lastPayment?.paidAt ?? commission.paidOn : null,
      },
    });
  }

  async recordPayment(input: {
    commissionId: string;
    amountInr: number;
    paidAt: Date;
    method?: string;
    reference?: string;
    notes?: string;
    recordedById?: string;
  }) {
    const amount = Math.round(input.amountInr * 100) / 100;
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }
    return this.prisma.$transaction(async (tx) => {
      const commission = await tx.commission.findUnique({ where: { id: input.commissionId } });
      if (!commission) throw new NotFoundException('Commission not found');
      if (commission.voided) throw new BadRequestException('Cannot pay a voided commission');
      if (commission.needsReview) {
        throw new BadRequestException('Commission needs review before payment');
      }

      const currentPaid = await this.sumValidPaymentsInTx(tx, input.commissionId);
      const expected = Number(commission.expectedInr);
      if (currentPaid + amount > expected + 0.001) {
        throw new BadRequestException('Payment would exceed the commission amount');
      }

      const payment = await tx.commissionPayment.create({
        data: {
          commissionId: input.commissionId,
          amountInr: amount,
          paidAt: input.paidAt,
          method: input.method?.trim() || null,
          reference: input.reference?.trim() || null,
          notes: input.notes?.trim() || null,
          recordedById: input.recordedById ?? null,
        },
      });

      const newPaid = Math.round((currentPaid + amount) * 100) / 100;
      await tx.commission.update({
        where: { id: input.commissionId },
        data: {
          paidInr: newPaid,
          status: commissionStatus(expected, newPaid),
          paidOn: input.paidAt,
        },
      });

      return payment;
    });
  }

  async reversePayment(paymentId: string, recordedById?: string) {
    return this.prisma.$transaction(async (tx) => {
      const original = await tx.commissionPayment.findUnique({ where: { id: paymentId } });
      if (!original) throw new NotFoundException('Payment not found');
      if (original.reversedAt || original.reversalOfId) {
        throw new BadRequestException('Payment was already reversed');
      }

      await tx.commissionPayment.update({
        where: { id: paymentId },
        data: { reversedAt: new Date() },
      });

      const paid = await this.sumValidPaymentsInTx(tx, original.commissionId);
      const commission = await tx.commission.findUniqueOrThrow({ where: { id: original.commissionId } });
      const expected = Number(commission.expectedInr);
      await tx.commission.update({
        where: { id: original.commissionId },
        data: {
          paidInr: paid,
          status: commissionStatus(expected, paid),
          paidOn: paid > 0 ? original.paidAt : null,
        },
      });

      return { ok: true };
    });
  }

  private async sumValidPaymentsInTx(tx: Prisma.TransactionClient, commissionId: string): Promise<number> {
    const rows = await tx.commissionPayment.findMany({
      where: { commissionId, reversedAt: null, reversalOfId: null },
      select: { amountInr: true },
    });
    return Math.round(rows.reduce((s, r) => s + Number(r.amountInr), 0) * 100) / 100;
  }
}
