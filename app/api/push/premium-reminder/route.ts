// app/api/push/premium-reminder/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendBulkPushNotifications } from '@/lib/expoPush';

export async function POST(request: NextRequest) {
  try {
    // Optional: Add admin authentication here
    const { customMessage } = await request.json();

    const nonPremiumUsers = await prisma.user.findMany({
      where: {
        isPremium: false,
      },
      select: {
        id: true,
        name: true,
        settings: true,
      },
    });

    const notifications = nonPremiumUsers
      .filter((user: any) => {
        const settings = user.settings as any;
        return settings?.pushToken && settings?.pushNotificationsEnabled;
      })
      .map((user: any) => {
        const settings = user.settings as any;
        return {
          to: settings.pushToken,
          title: customMessage?.title || '🌟 Upgrade to Premium Today!',
          body:
            customMessage?.body ||
            'Get unlimited cleaning, advanced features, and ad-free experience!',
          data: { screen: 'Plans', userId: user.id },
        };
      });

    if (notifications.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users to notify',
        count: 0,
      });
    }

    const tickets = await sendBulkPushNotifications(notifications);

    return NextResponse.json({
      success: true,
      messagesSent: notifications.length,
      tickets,
    });
  } catch (error) {
    console.error('Error sending premium reminders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}