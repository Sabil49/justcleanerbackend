// app/api/push/battery-alert/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {prisma} from '@/lib/db';
import { sendPushNotification } from '@/lib/expoPush';

export async function POST(request: NextRequest) {
  try {
    const { userId, batteryLevel } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.isPremium) {
      return NextResponse.json(
        { error: 'Not eligible for this notification' },
        { status: 400 }
      );
    }

    const settings = user.settings as any;
    const pushToken = settings?.pushToken;

    if (!pushToken || !settings?.pushNotificationsEnabled) {
      return NextResponse.json(
        { error: 'Push notifications not enabled' },
        { status: 400 }
      );
    }

    const tickets = await sendPushNotification({
      to: pushToken,
      title: '🔋 Battery Optimization Available',
      body: `Your battery is at ${batteryLevel}%. Premium users get advanced battery optimization!`,
      data: { screen: 'Plans', reason: 'battery_alert' },
    });

    return NextResponse.json({ 
      success: true, 
      tickets 
    });
  } catch (error) {
    console.error('Error sending battery alert:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}