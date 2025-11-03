// lib/rateLimit.ts
import { NextRequest } from 'next/server';

const rateLimitMap = new Map();

export function rateLimit(identifier: string, limit = 10, window = 60000) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(identifier) || [];
  
  // Filter recent requests
  const recentRequests = userRequests.filter(
    (timestamp: number) => now - timestamp < window
  );
  
  if (recentRequests.length >= limit) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(identifier, recentRequests);
  return true;
}