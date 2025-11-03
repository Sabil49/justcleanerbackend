// app/api/push/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {prisma} from '@/lib/db';
import { sendPushNotification } from '@/lib/expoPush';

export async function POST(request: NextRequest) {
  try {
    const { userId, title, body, data } = await request.json();

    if (!userId || !title || !body) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.settings) {
      return NextResponse.json(
        { error: 'User not found or no push token' },
        { status: 404 }
      );
    }

    const settings = user.settings as any;
    const pushToken = settings.pushToken;

    if (!pushToken) {
      return NextResponse.json(
        { error: 'User has no push token registered' },
        { status: 400 }
      );
    }

    const tickets = await sendPushNotification({
      to: pushToken,
      title,
      body,
      data: data || {},
    });

    return NextResponse.json({ 
      success: true, 
      tickets,
      message: 'Notification sent successfully' 
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
