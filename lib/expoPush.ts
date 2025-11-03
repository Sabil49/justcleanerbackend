// lib/expoPush.ts
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

// Create a new Expo SDK client
const expo = new Expo();

export interface PushNotificationPayload {
  to: string | string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
  categoryId?: string;
  priority?: 'default' | 'normal' | 'high';
}

/**
 * Send push notifications to one or more devices
 */
export async function sendPushNotification(
  payload: PushNotificationPayload
): Promise<ExpoPushTicket[]> {
  try {
    // Format recipients as array
    const recipients = Array.isArray(payload.to) ? payload.to : [payload.to];

    // Filter out invalid tokens
    const validTokens = recipients.filter((token) =>
      Expo.isExpoPushToken(token)
    );

    if (validTokens.length === 0) {
      throw new Error('No valid push tokens provided');
    }

    // Create push messages
    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token,
      sound: payload.sound ?? 'default',
      title: payload.title,
      body: payload.body,
      data: payload.data,
      badge: payload.badge,
      channelId: payload.channelId,
      categoryId: payload.categoryId,
      priority: payload.priority ?? 'high',
    }));

    // Chunk messages for efficient sending
    const chunks = expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];

    // Send notifications in chunks
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push notification chunk:', error);
        throw error;
      }
    }

    return tickets;
  } catch (error) {
    console.error('Error in sendPushNotification:', error);
    throw error;
  }
}

/**
 * Send push notification to multiple users
 */
export async function sendBulkPushNotifications(
  notifications: PushNotificationPayload[]
): Promise<ExpoPushTicket[]> {
  try {
    const allMessages: ExpoPushMessage[] = [];

    for (const notification of notifications) {
      const recipients = Array.isArray(notification.to)
        ? notification.to
        : [notification.to];

      const validTokens = recipients.filter((token) =>
        Expo.isExpoPushToken(token)
      );

      const messages: ExpoPushMessage[] = validTokens.map((token) => ({
        to: token,
        sound: notification.sound ?? 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data,
        badge: notification.badge,
        channelId: notification.channelId,
        priority: notification.priority ?? 'high',
      }));

      allMessages.push(...messages);
    }

    if (allMessages.length === 0) {
      return [];
    }

    const chunks = expo.chunkPushNotifications(allMessages);
    const tickets: ExpoPushTicket[] = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending bulk push notifications:', error);
      }
    }

    return tickets;
  } catch (error) {
    console.error('Error in sendBulkPushNotifications:', error);
    throw error;
  }
}

/**
 * Validate if a token is a valid Expo push token
 */
export function isValidExpoPushToken(token: string): boolean {
  return Expo.isExpoPushToken(token);
}

/**
 * Check receipt status of sent notifications
 */
export async function checkNotificationReceipts(
  receiptIds: string[]
): Promise<any> {
  try {
    const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
    const receipts: any[] = [];

    for (const chunk of receiptIdChunks) {
      try {
        const receiptChunk = await expo.getPushNotificationReceiptsAsync(chunk);
        receipts.push(receiptChunk);
      } catch (error) {
        console.error('Error fetching receipts:', error);
      }
    }

    return receipts;
  } catch (error) {
    console.error('Error in checkNotificationReceipts:', error);
    throw error;
  }
}

export default expo;