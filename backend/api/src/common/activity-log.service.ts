import { Injectable } from '@nestjs/common';
import type { ActivityAction } from '../generated/prisma/client.js';
import { PrismaService } from '../database/prisma.service.js';

@Injectable()
export class ActivityLogService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: {
    userId?: string;
    action: ActivityAction;
    entity: string;
    entityId?: string;
    summary: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
  }) {
    await this.prisma.activityLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        summary: input.summary,
        metadata: input.metadata as never,
        ipAddress: input.ipAddress,
      },
    });
  }
}
