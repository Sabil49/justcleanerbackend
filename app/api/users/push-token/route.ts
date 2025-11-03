// app/api/users/push-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {prisma} from '@/lib/db';
import { isValidExpoPushToken } from '@/lib/expoPush';

export async function POST(request: NextRequest) {
  try {
    const { userId, pushToken, platform } = await request.json();

    if (!userId || !pushToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate Expo push token
    if (!isValidExpoPushToken(pushToken)) {
      return NextResponse.json(
        { error: 'Invalid Expo push token' },
        { status: 400 }
      );
    }

    // Get existing settings or create new object
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { settings: true },
    });

    const existingSettings = (user?.settings as any) || {};

    // Update user settings with push token
    await prisma.user.update({
      where: { id: userId },
      data: {
        settings: {
          ...existingSettings,
          pushToken,
          platform,
          pushNotificationsEnabled: true,
          tokenUpdatedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Push token registered successfully',
    });
  } catch (error) {
    console.error('Error registering push token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete push token
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { settings: true },
    });

    const existingSettings = (user?.settings as any) || {};

    // Remove push token from settings
    await prisma.user.update({
      where: { id: userId },
      data: {
        settings: {
          ...existingSettings,
          pushToken: null,
          pushNotificationsEnabled: false,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Push token removed successfully',
    });
  } catch (error) {
    console.error('Error removing push token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
