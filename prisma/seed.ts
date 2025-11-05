// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Hash passwords
  const hashedPassword = await bcrypt.hash('password123', 10);
  const hashedPremiumPassword = await bcrypt.hash('premium123', 10);

  // Clear existing data
  await prisma.cleanLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create users
  const user1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      isPremium: false,
      settings: {
        pushToken: null,
        platform: 'ios',
        pushNotificationsEnabled: true,
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: hashedPremiumPassword,
      isPremium: true,
      premiumExpiry: new Date('2025-12-31'),
      settings: {
        pushToken: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
        platform: 'android',
        pushNotificationsEnabled: true,
      },
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Bob Johnson',
      email: 'bob@example.com',
      password: hashedPassword,
      isPremium: false,
      settings: {
        pushToken: null,
        platform: 'ios',
        pushNotificationsEnabled: false,
      },
    },
  });

  const user4 = await prisma.user.create({
    data: {
      name: 'Alice Williams',
      email: 'alice@example.com',
      password: hashedPremiumPassword,
      isPremium: true,
      premiumExpiry: new Date('2026-03-15'),
      settings: {
        pushToken: 'ExponentPushToken[yyyyyyyyyyyyyyyyyyyyyyyy]',
        platform: 'android',
        pushNotificationsEnabled: true,
      },
    },
  });

  console.log('✅ Created users:', { 
    user1: user1.email, 
    user2: user2.email, 
    user3: user3.email,
    user4: user4.email
  });

  // Create reports for user1
  const reports1 = await prisma.report.createMany({
    data: [
      {
        userId: user1.id,
        storageUsed: 45600,
        storageFreed: 2300,
        deviceName: 'iPhone 14 Pro',
        osVersion: 'iOS 17.2',
        timestamp: new Date('2025-10-15T10:30:00Z'),
      },
      {
        userId: user1.id,
        storageUsed: 43300,
        storageFreed: 1800,
        deviceName: 'iPhone 14 Pro',
        osVersion: 'iOS 17.2',
        timestamp: new Date('2025-11-01T14:20:00Z'),
      },
      {
        userId: user1.id,
        storageUsed: 41500,
        storageFreed: 2100,
        deviceName: 'iPhone 14 Pro',
        osVersion: 'iOS 17.3',
        timestamp: new Date('2025-11-04T09:45:00Z'),
      },
    ],
  });

  // Create reports for user2
  const reports2 = await prisma.report.createMany({
    data: [
      {
        userId: user2.id,
        storageUsed: 82400,
        storageFreed: 5600,
        deviceName: 'Samsung Galaxy S24',
        osVersion: 'Android 14',
        timestamp: new Date('2025-10-20T09:15:00Z'),
      },
      {
        userId: user2.id,
        storageUsed: 76800,
        storageFreed: 3200,
        deviceName: 'Samsung Galaxy S24',
        osVersion: 'Android 14',
        timestamp: new Date('2025-11-03T16:45:00Z'),
      },
      {
        userId: user2.id,
        storageUsed: 73600,
        storageFreed: 4100,
        deviceName: 'Samsung Galaxy S24',
        osVersion: 'Android 14',
        timestamp: new Date('2025-11-05T11:00:00Z'),
      },
    ],
  });

  // Create reports for user4
  const reports4 = await prisma.report.createMany({
    data: [
      {
        userId: user4.id,
        storageUsed: 67200,
        storageFreed: 4800,
        deviceName: 'Google Pixel 8 Pro',
        osVersion: 'Android 14',
        timestamp: new Date('2025-10-18T15:30:00Z'),
      },
      {
        userId: user4.id,
        storageUsed: 62400,
        storageFreed: 3900,
        deviceName: 'Google Pixel 8 Pro',
        osVersion: 'Android 14',
        timestamp: new Date('2025-11-02T10:15:00Z'),
      },
    ],
  });

  console.log('✅ Created reports:', reports1.count + reports2.count + reports4.count);

  // Create clean logs for user1
  const cleanLogs1 = await prisma.cleanLog.createMany({
    data: [
      {
        userId: user1.id,
        cleanType: 'junk',
        filesRemoved: 847,
        spaceFreed: 1250.5,
        batteryBefore: 78,
        batteryAfter: 76,
        timestamp: new Date('2025-10-15T10:35:00Z'),
      },
      {
        userId: user1.id,
        cleanType: 'cache',
        filesRemoved: 234,
        spaceFreed: 890.2,
        batteryBefore: 76,
        batteryAfter: 75,
        timestamp: new Date('2025-10-15T10:38:00Z'),
      },
      {
        userId: user1.id,
        cleanType: 'duplicate',
        filesRemoved: 45,
        spaceFreed: 159.3,
        batteryBefore: 75,
        batteryAfter: 74,
        timestamp: new Date('2025-10-15T10:40:00Z'),
      },
      {
        userId: user1.id,
        cleanType: 'junk',
        filesRemoved: 523,
        spaceFreed: 980.7,
        batteryBefore: 65,
        batteryAfter: 64,
        timestamp: new Date('2025-11-01T14:25:00Z'),
      },
      {
        userId: user1.id,
        cleanType: 'cache',
        filesRemoved: 312,
        spaceFreed: 819.3,
        batteryBefore: 64,
        batteryAfter: 63,
        timestamp: new Date('2025-11-01T14:28:00Z'),
      },
      {
        userId: user1.id,
        cleanType: 'junk',
        filesRemoved: 698,
        spaceFreed: 1180.5,
        batteryBefore: 52,
        batteryAfter: 50,
        timestamp: new Date('2025-11-04T09:50:00Z'),
      },
      {
        userId: user1.id,
        cleanType: 'cache',
        filesRemoved: 412,
        spaceFreed: 919.5,
        batteryBefore: 50,
        batteryAfter: 49,
        timestamp: new Date('2025-11-04T09:53:00Z'),
      },
    ],
  });

  // Create clean logs for user2
  const cleanLogs2 = await prisma.cleanLog.createMany({
    data: [
      {
        userId: user2.id,
        cleanType: 'junk',
        filesRemoved: 1523,
        spaceFreed: 3200.8,
        batteryBefore: 82,
        batteryAfter: 79,
        timestamp: new Date('2025-10-20T09:20:00Z'),
      },
      {
        userId: user2.id,
        cleanType: 'duplicate',
        filesRemoved: 187,
        spaceFreed: 1450.2,
        batteryBefore: 79,
        batteryAfter: 78,
        timestamp: new Date('2025-10-20T09:25:00Z'),
      },
      {
        userId: user2.id,
        cleanType: 'cache',
        filesRemoved: 445,
        spaceFreed: 949.0,
        batteryBefore: 78,
        batteryAfter: 77,
        timestamp: new Date('2025-10-20T09:28:00Z'),
      },
      {
        userId: user2.id,
        cleanType: 'junk',
        filesRemoved: 892,
        spaceFreed: 2100.5,
        batteryBefore: 45,
        batteryAfter: 43,
        timestamp: new Date('2025-11-03T16:50:00Z'),
      },
      {
        userId: user2.id,
        cleanType: 'cache',
        filesRemoved: 378,
        spaceFreed: 1099.5,
        batteryBefore: 43,
        batteryAfter: 42,
        timestamp: new Date('2025-11-03T16:53:00Z'),
      },
      {
        userId: user2.id,
        cleanType: 'junk',
        filesRemoved: 1245,
        spaceFreed: 2890.3,
        batteryBefore: 88,
        batteryAfter: 85,
        timestamp: new Date('2025-11-05T11:05:00Z'),
      },
      {
        userId: user2.id,
        cleanType: 'duplicate',
        filesRemoved: 156,
        spaceFreed: 1209.7,
        batteryBefore: 85,
        batteryAfter: 84,
        timestamp: new Date('2025-11-05T11:08:00Z'),
      },
    ],
  });

  // Create clean logs for user3
  const cleanLogs3 = await prisma.cleanLog.createMany({
    data: [
      {
        userId: user3.id,
        cleanType: 'cache',
        filesRemoved: 198,
        spaceFreed: 450.2,
        batteryBefore: 55,
        batteryAfter: 54,
        timestamp: new Date('2025-10-25T13:15:00Z'),
      },
      {
        userId: user3.id,
        cleanType: 'junk',
        filesRemoved: 634,
        spaceFreed: 1120.8,
        batteryBefore: 54,
        batteryAfter: 53,
        timestamp: new Date('2025-10-25T13:18:00Z'),
      },
    ],
  });

  // Create clean logs for user4
  const cleanLogs4 = await prisma.cleanLog.createMany({
    data: [
      {
        userId: user4.id,
        cleanType: 'junk',
        filesRemoved: 1823,
        spaceFreed: 2950.4,
        batteryBefore: 92,
        batteryAfter: 89,
        timestamp: new Date('2025-10-18T15:35:00Z'),
      },
      {
        userId: user4.id,
        cleanType: 'cache',
        filesRemoved: 567,
        spaceFreed: 1230.6,
        batteryBefore: 89,
        batteryAfter: 88,
        timestamp: new Date('2025-10-18T15:38:00Z'),
      },
      {
        userId: user4.id,
        cleanType: 'duplicate',
        filesRemoved: 234,
        spaceFreed: 619.0,
        batteryBefore: 88,
        batteryAfter: 87,
        timestamp: new Date('2025-10-18T15:42:00Z'),
      },
      {
        userId: user4.id,
        cleanType: 'junk',
        filesRemoved: 1456,
        spaceFreed: 2380.8,
        batteryBefore: 68,
        batteryAfter: 66,
        timestamp: new Date('2025-11-02T10:20:00Z'),
      },
      {
        userId: user4.id,
        cleanType: 'cache',
        filesRemoved: 489,
        spaceFreed: 1098.2,
        batteryBefore: 66,
        batteryAfter: 65,
        timestamp: new Date('2025-11-02T10:23:00Z'),
      },
      {
        userId: user4.id,
        cleanType: 'duplicate',
        filesRemoved: 178,
        spaceFreed: 421.0,
        batteryBefore: 65,
        batteryAfter: 64,
        timestamp: new Date('2025-11-02T10:26:00Z'),
      },
    ],
  });

  console.log('✅ Created clean logs:', 
    cleanLogs1.count + cleanLogs2.count + cleanLogs3.count + cleanLogs4.count
  );

  console.log('\n📊 Seed Summary:');
  console.log('----------------');
  console.log(`Users: 4 (2 free, 2 premium)`);
  console.log(`Reports: ${reports1.count + reports2.count + reports4.count}`);
  console.log(`Clean Logs: ${cleanLogs1.count + cleanLogs2.count + cleanLogs3.count + cleanLogs4.count}`);
  console.log('\n🔐 Login Credentials:');
  console.log('Free Users: password123');
  console.log('Premium Users: premium123');
  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });