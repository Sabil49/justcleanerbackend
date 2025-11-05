// app/api/device/report/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { storageUsed, storageFreed, deviceName, osVersion } = await request.json();

    if (storageUsed === undefined || storageFreed === undefined || !deviceName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const report = await prisma.report.create({
      data: {
        userId: user.userId,
        storageUsed,
        storageFreed,
        deviceName,
        osVersion,
      },
    });

    return NextResponse.json({
      report,
      message: 'Report saved successfully',
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Report error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const reports = await prisma.report.findMany({
      where: { userId: user.userId },
      orderBy: { timestamp: 'desc' },
      take: 20,
    });
    if (!reports || reports.length === 0) {
      return NextResponse.json({ error: 'No reports found', message: 'No reports found' }, { status: 404 });
    }
    const totalFreed = await prisma.report.aggregate({
      where: { userId: user.userId },
      _sum: { storageFreed: true },
    });

    const batterySaved = await prisma.cleanLog.aggregate({
      where: { userId: user.userId },
      _sum: {
        batteryBefore: true,
        batteryAfter: true,
      },
    });
    const appsOptimized = await prisma.cleanLog.count({
      where: { userId: user.userId, cleanType: 'battery' },
    });

    const junkRemoved = await prisma.cleanLog.aggregate({
      where: { userId: user.userId, cleanType: 'junk' },
      _sum: { filesRemoved: true },
    });

    const cleaningSessions = await prisma.cleanLog.count({
      where: { userId: user.userId },
    });
    if (!batterySaved) {
      return NextResponse.json({ error: 'No clean logs found', message: 'No clean logs found' }, { status: 404 });
    }
    if (!totalFreed) {
      return NextResponse.json({ error: 'No reports found', message: 'No reports found' }, { status: 404 });
    }
    if (appsOptimized === null || appsOptimized === undefined) {
      return NextResponse.json({ error: 'No clean logs found', message: 'No clean logs found' }, { status: 404 });
    }
    
    return NextResponse.json({
      reports,
      totalSpaceFreed: totalFreed._sum.storageFreed || 0,
      batterySaved: (batterySaved._sum.batteryBefore || 0) - (batterySaved._sum.batteryAfter || 0),
      appsOptimized,
      junkRemoved: junkRemoved._sum.filesRemoved || 0,
      cleaningSessions,
    });

  } catch (error: unknown) {
    console.error('Get reports error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}