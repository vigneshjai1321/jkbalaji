import { Injectable, Logger } from '@nestjs/common';
import { UserRole } from '../../generated/prisma/client.js';
import { PrismaService } from '../../database/prisma.service.js';
import {
  KJPL_FAILURE_TITLE,
  KJPL_NOTIF_SCOPE,
  KJPL_RECOVERY_TITLE,
  KJPL_STATUS_KEY,
  emptyKjplStatus,
  isJewelleryScopedNotification,
  type KjplFetchStatus,
} from './kjpl-status.js';

const JEWELLERY_ALERT_ROLES = new Set<string>([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.GOLD_MANAGER]);

@Injectable()
export class KjplAlertsService {
  private readonly log = new Logger(KjplAlertsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async readStatus(): Promise<KjplFetchStatus> {
    const row = await this.prisma.appSetting.findUnique({ where: { key: KJPL_STATUS_KEY } });
    if (!row?.value) return emptyKjplStatus();
    try {
      return { ...emptyKjplStatus(), ...(JSON.parse(row.value) as KjplFetchStatus) };
    } catch {
      return emptyKjplStatus();
    }
  }

  private async writeStatus(status: KjplFetchStatus) {
    await this.prisma.appSetting.upsert({
      where: { key: KJPL_STATUS_KEY },
      create: { key: KJPL_STATUS_KEY, value: JSON.stringify(status) },
      update: { value: JSON.stringify(status) },
    });
  }

  async setNextScheduledAt(iso: string | null) {
    const status = await this.readStatus();
    status.nextScheduledAt = iso;
    await this.writeStatus(status);
  }

  async recordAttempt() {
    const status = await this.readStatus();
    status.lastAttemptAt = new Date().toISOString();
    await this.writeStatus(status);
  }

  async recordSuccess() {
    const status = await this.readStatus();
    const now = new Date().toISOString();
    status.lastAttemptAt = now;
    status.lastSuccessAt = now;
    status.lastErrorCategory = null;
    status.lastErrorMessage = null;

    if (status.activeFailureNotificationId) {
      await this.prisma.notification.updateMany({
        where: { id: status.activeFailureNotificationId, readAt: null },
        data: { readAt: new Date() },
      });
      status.activeFailureNotificationId = null;
      await this.createRecoveryNotification(status.lastSuccessAt);
    }

    await this.writeStatus(status);
  }

  async recordFailure(category: string, message: string, lastSuccessAt: string | null) {
    const status = await this.readStatus();
    status.lastAttemptAt = new Date().toISOString();
    status.lastErrorCategory = category;
    status.lastErrorMessage = message;

    if (!status.activeFailureNotificationId) {
      const body = this.failureBody(message, lastSuccessAt, status.nextScheduledAt);
      const row = await this.prisma.notification.create({
        data: { title: KJPL_FAILURE_TITLE, body },
      });
      status.activeFailureNotificationId = row.id;
    } else {
      await this.prisma.notification.update({
        where: { id: status.activeFailureNotificationId },
        data: {
          body: this.failureBody(message, lastSuccessAt, status.nextScheduledAt),
        },
      });
    }

    await this.writeStatus(status);
  }

  private failureBody(message: string, lastSuccessAt: string | null, nextScheduledAt: string | null) {
    const lines = [
      KJPL_NOTIF_SCOPE,
      'KJPL rates could not be refreshed. The last valid rates are being retained.',
      `Reason: ${message}`,
      lastSuccessAt
        ? `Last successful update: ${new Date(lastSuccessAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`
        : 'Last successful update: none yet',
    ];
    if (nextScheduledAt) {
      lines.push(
        `Next scheduled retry: ${new Date(nextScheduledAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
      );
    }
    return lines.join('\n');
  }

  private async createRecoveryNotification(at: string) {
    await this.prisma.notification.create({
      data: {
        title: KJPL_RECOVERY_TITLE,
        body: [
          KJPL_NOTIF_SCOPE,
          'KJPL rates were refreshed successfully.',
          `Updated: ${new Date(at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
        ].join('\n'),
      },
    });
  }

  filterNotificationsForRole<T extends { body: string }>(role: string | undefined, rows: T[]): T[] {
    return rows.filter((n) => {
      if (!isJewelleryScopedNotification(n.body)) return true;
      return role != null && JEWELLERY_ALERT_ROLES.has(role);
    });
  }
}
