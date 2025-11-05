// app/api/cron/daily-reminders/route.ts
// This can be called by Vercel Cron Jobs or external schedulers like Cron-job.org
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendBulkPushNotifications } from '@/lib/expoPush';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);


    // Find non-premium users who haven't been active recently
    const user = {
      settings: {
        pushToken: 'ExponentPushToken[Lr8GYZN8RV-BkHZrnG4eBW]',
        pushNotificationsEnabled: true,
      },
      cleanLogs: [
        { spaceFreed: 250 }
      ],

    }

    const notifications = [user]
      .filter((user: any) => {
        const settings = user.settings as any;
        return settings?.pushToken && settings?.pushNotificationsEnabled;
      })
      .map((user: any) => {
        const settings = user.settings as any;
        const lastClean = user.cleanLogs[0];
        
        let body = 'Your device needs cleaning! Free up space now.';
        if (lastClean) {
          body = `You freed ${lastClean.spaceFreed}MB last time. Clean your device again!`;
        }

        return {
          to: settings.pushToken,
          title: '🧹 Time to Clean Your Device',
          body,
          data: { screen: 'Cleaner', type: 'daily_reminder' },
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
      notificationsSent: notifications.length,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Error in daily reminders cron:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}