import { prisma } from '@/lib/db';
import { NotificationType, Prisma } from '@prisma/client';
import { enqueueJob, NOTIFICATIONS_HIGH_QUEUE } from '@/lib/queue';

export interface SendNotificationPayload {
  tenantId: string;
  recipientId: string;
  title: string;
  body: string;
  type?: NotificationType;
  actionUrl?: string | null;
  metadata?: Prisma.InputJsonValue | null;
}

export interface SendBulkNotificationPayload {
  tenantId: string;
  recipientIds: string[];
  title: string;
  body: string;
  type?: NotificationType;
  actionUrl?: string | null;
  metadata?: Prisma.InputJsonValue | null;
}

export interface AudienceBroadcastPayload {
  tenantId: string;
  audience: 'ALL' | 'TEACHERS' | 'PARENTS' | 'STUDENTS' | 'SPECIFIC_CLASS';
  sectionId?: string;
  classGradeId?: string;
  title: string;
  body: string;
  type?: NotificationType;
  actionUrl?: string | null;
}

export class NotificationService {
  /**
   * Sends an in-app notification to a single user in a tenant.
   */
  static async send(payload: SendNotificationPayload) {
    const {
      tenantId,
      recipientId,
      title,
      body,
      type = NotificationType.GENERAL,
      actionUrl = null,
      metadata = Prisma.JsonNull,
    } = payload;

    if (!tenantId || !recipientId) {
      throw new Error('Tenant ID and Recipient ID are required for notification delivery.');
    }

    // Verify recipient belongs to tenant
    const recipient = await prisma.user.findFirst({
      where: { id: recipientId, tenantId },
      select: { id: true },
    });

    if (!recipient) {
      throw new Error('Recipient does not exist in the specified tenant.');
    }

    const notification = await prisma.notification.create({
      data: {
        tenantId,
        recipientId,
        title,
        body,
        type,
        actionUrl: actionUrl || null,
        metadata: metadata ?? Prisma.JsonNull,
      },
    });

    // Optionally enqueue background push / whatsapp worker task
    await enqueueJob(
      NOTIFICATIONS_HIGH_QUEUE,
      'send-in-app',
      { notificationId: notification.id, tenantId, recipientId },
      async () => {
        // Direct execution fallback if Redis is unavailable
      }
    );

    return notification;
  }

  /**
   * Bulk delivers in-app notifications to multiple users in a tenant.
   */
  static async sendBulk(payload: SendBulkNotificationPayload) {
    const {
      tenantId,
      recipientIds,
      title,
      body,
      type = NotificationType.GENERAL,
      actionUrl = null,
      metadata = Prisma.JsonNull,
    } = payload;

    if (!tenantId || !recipientIds || recipientIds.length === 0) {
      return { count: 0 };
    }

    // Verify recipients belong to tenant to prevent cross-tenant leakage
    const validUsers = await prisma.user.findMany({
      where: {
        tenantId,
        id: { in: recipientIds },
        isActive: true,
      },
      select: { id: true },
    });

    if (validUsers.length === 0) {
      return { count: 0 };
    }

    const records = validUsers.map((u) => ({
      tenantId,
      recipientId: u.id,
      title,
      body,
      type,
      actionUrl: actionUrl || null,
      metadata: metadata ?? Prisma.JsonNull,
    }));

    const result = await prisma.notification.createMany({
      data: records,
    });

    return { count: result.count };
  }

  /**
   * Broadcasts notification to a targeted tenant segment (Entire School, All Teachers,
   * All Parents, All Students, or a specific Class/Section).
   */
  static async sendToAudience(payload: AudienceBroadcastPayload) {
    const {
      tenantId,
      audience,
      sectionId,
      classGradeId,
      title,
      body,
      type = NotificationType.GENERAL,
      actionUrl = null,
    } = payload;

    if (!tenantId) {
      throw new Error('Tenant ID required');
    }

    let targetUserIds: string[] = [];

    if (audience === 'ALL') {
      const users = await prisma.user.findMany({
        where: { tenantId, isActive: true },
        select: { id: true },
      });
      targetUserIds = users.map((u) => u.id);
    } else if (audience === 'TEACHERS') {
      const teachers = await prisma.user.findMany({
        where: { tenantId, role: 'TEACHER', isActive: true },
        select: { id: true },
      });
      targetUserIds = teachers.map((u) => u.id);
    } else if (audience === 'PARENTS') {
      const parents = await prisma.user.findMany({
        where: { tenantId, role: 'PARENT', isActive: true },
        select: { id: true },
      });
      targetUserIds = parents.map((u) => u.id);
    } else if (audience === 'STUDENTS') {
      const students = await prisma.user.findMany({
        where: { tenantId, role: 'STUDENT', isActive: true },
        select: { id: true },
      });
      targetUserIds = students.map((u) => u.id);
    } else if (audience === 'SPECIFIC_CLASS') {
      if (sectionId) {
        // Query students in this section
        const students = await prisma.studentProfile.findMany({
          where: { tenantId, sectionId },
          select: { userId: true },
        });
        targetUserIds = students.map((s) => s.userId);
      } else if (classGradeId) {
        // Query students in all sections of this class
        const sections = await prisma.section.findMany({
          where: { tenantId, classGradeId },
          select: { id: true },
        });
        const sectionIds = sections.map((s) => s.id);
        const students = await prisma.studentProfile.findMany({
          where: { tenantId, sectionId: { in: sectionIds } },
          select: { userId: true },
        });
        targetUserIds = students.map((s) => s.userId);
      }
    }

    // Deduplicate IDs
    const uniqueIds = Array.from(new Set(targetUserIds));

    return this.sendBulk({
      tenantId,
      recipientIds: uniqueIds,
      title,
      body,
      type,
      actionUrl,
    });
  }

  /**
   * Retrieves unread notification count for a user in a tenant.
   */
  static async getUnreadCount(tenantId: string, recipientId: string): Promise<number> {
    if (!tenantId || !recipientId) return 0;

    return prisma.notification.count({
      where: {
        tenantId,
        recipientId,
        isRead: false,
      },
    });
  }

  /**
   * Retrieves paginated notifications for a user in a tenant.
   */
  static async getUserNotifications(
    tenantId: string,
    recipientId: string,
    options?: {
      unreadOnly?: boolean;
      type?: NotificationType;
      page?: number;
      limit?: number;
    }
  ) {
    const page = Math.max(1, options?.page || 1);
    const limit = Math.min(50, Math.max(1, options?.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      tenantId,
      recipientId,
    };

    if (options?.unreadOnly) {
      where.isRead = false;
    }

    if (options?.type) {
      where.type = options.type;
    }

    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Marks a single notification as read, ensuring tenant isolation.
   */
  static async markAsRead(tenantId: string, notificationId: string, recipientId: string) {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        tenantId,
        recipientId,
      },
    });

    if (!notification) {
      throw new Error('Notification not found or access denied.');
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  /**
   * Marks all notifications as read for a given recipient in a tenant.
   */
  static async markAllAsRead(tenantId: string, recipientId: string) {
    return prisma.notification.updateMany({
      where: {
        tenantId,
        recipientId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }
}
