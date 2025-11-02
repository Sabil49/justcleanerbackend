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
      return NextResponse.json({ error: 'No reports found' }, { status: 404 });
    }
    const totalFreed = await prisma.report.aggregate({
      where: { userId: user.userId },
      _sum: { storageFreed: true },
    });
    if (!totalFreed) {
      return NextResponse.json({ error: 'Failed to calculate total space freed' }, { status: 500 });
    }
    return NextResponse.json({
      reports,
      totalSpaceFreed: totalFreed._sum.storageFreed || 0,
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