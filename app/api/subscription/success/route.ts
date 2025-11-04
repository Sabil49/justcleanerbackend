import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Logic to handle successful subscription
  
  return NextResponse.json({ message: 'Subscription successful' });
}