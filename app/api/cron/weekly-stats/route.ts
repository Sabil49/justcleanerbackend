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
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get all non-premium users
    const users = await prisma.user.findMany({
      where: {
        isPremium: false,
      },
      select: {
        id: true,
        name: true,
        settings: true,
        cleanLogs: {
          where: {
            timestamp: {
              gte: oneWeekAgo,
            },
          },
        },
      },
    });

    const notifications = users
      .filter((user: any) => {
        const settings = user.settings as any;
        return (
          settings?.pushToken &&
          settings?.pushNotificationsEnabled &&
          user.cleanLogs.length > 0
        );
      })
      .map((user: any) => {
        const settings = user.settings as any;
        const totalSpaceFreed = user.cleanLogs.reduce(
          (sum: number, log: any) => sum + log.spaceFreed,
          0
        );
        const totalFiles = user.cleanLogs.reduce(
          (sum: number, log: any) => sum + log.filesRemoved,
          0
        );

        return {
          to: settings.pushToken,
          title: '📊 Your Weekly Cleaning Stats',
          body: `Great job! You freed ${totalSpaceFreed.toFixed(1)}MB and removed ${totalFiles} files this week. Go Premium for unlimited cleaning!`,
          data: { 
            screen: 'Reports', 
            type: 'weekly_stats',
            stats: {
              spaceFreed: totalSpaceFreed,
              filesRemoved: totalFiles,
            }
          },
        };
      });

    if (notifications.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users with activity to notify',
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
    console.error('Error in weekly stats cron:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
