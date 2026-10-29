import { prisma } from '@platform/db';

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type?: 'SYSTEM' | 'SECURITY' | 'SYNC' | 'BILLING' | 'AI';
  sendEmail?: boolean;
}

export class NotificationService {
  /**
   * Dispatches notifications dynamically to multiple channels.
   */
  async send(payload: NotificationPayload): Promise<{ success: boolean; id?: string }> {
    const { userId, title, message, type = 'SYSTEM', sendEmail = false } = payload;

    try {
      // 1. Database Notification write
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
        },
      });

      // 2. Mock Email channel delivery
      if (sendEmail) {
        console.log(`[Notification Email Trigger]
To: User ID ${userId}
Subject: ${title}
Body: ${message}
--------------------------------------------------`);
      }

      return { success: true, id: notification.id };
    } catch (error) {
      console.error('Notification dispatch failed:', error);
      return { success: false };
    }
  }
}

export const notificationService = new NotificationService();
