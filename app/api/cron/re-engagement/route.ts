import { NextRequest, NextResponse } from 'next/server';
import {prisma} from '@/lib/db';
import { sendBulkPushNotifications } from '@/lib/expoPush';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Find users inactive for 3-7 days
    const dormantUsers = await prisma.user.findMany({
      where: {
        isPremium: false,
        updatedAt: {
          gte: sevenDaysAgo,
          lt: threeDaysAgo,
        },
      },
      select: {
        id: true,
        name: true,
        settings: true,
      },
    });

    const messages = [
      {
        title: '💎 Limited Time: 20% Off Premium!',
        body: 'We miss you! Get 20% off Premium subscription for the next 48 hours.',
      },
      {
        title: '🚀 New Features Unlocked for Premium',
        body: 'Advanced battery optimization and duplicate finder now available!',
      },
      {
        title: '🎁 Special Offer Just for You',
        body: 'Come back and get your first month of Premium at 50% off!',
      },
    ];

    const notifications = dormantUsers
      .filter((user: any) => {
        const settings = user.settings as any;
        return settings?.pushToken && settings?.pushNotificationsEnabled;
      })
      .map((user: any, index: number) => {
        const settings = user.settings as any;
        const message = messages[index % messages.length];

        return {
          to: settings.pushToken,
          title: message.title,
          body: message.body,
          data: { screen: 'Plans', type: 're_engagement', discount: true },
        };
      });

    if (notifications.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No dormant users to re-engage',
        count: 0,
      });
    }

    const tickets = await sendBulkPushNotifications(notifications);

    return NextResponse.json({
      success: true,
      notificationsSent: notifications.length,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Error in re-engagement cron:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}